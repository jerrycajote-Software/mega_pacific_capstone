import { useState, useMemo, useCallback } from 'react';
import { ROOF_MATERIALS, INSTALL_ORDER, ROOF_COLORS } from '../data/roofPricingData';

/**
 * Custom hook for the sequential Roof Builder.
 *
 * Key rules:
 *   1. Scene starts EMPTY — nothing is loaded
 *   2. The house model must be loaded FIRST (step 0)
 *   3. Materials can only be installed in construction order (step 1 → 9)
 *   4. A step is only available if ALL previous steps are installed
 *   5. The roof tile (step 8) is only available after steps 1–7 are ALL done
 *   6. Removing a part also removes every part installed AFTER it (cascade)
 *   7. Quantities are adjustable on installed parts
 *   8. Parts with installByPcs:true are installed one piece at a time via addOnePc()
 */
const useRoofCalculator = () => {
  const [houseLoaded, setHouseLoaded] = useState(false);

  const [installedIds, setInstalledIds] = useState(new Set());

  // Quantity overrides (id → qty); defaults come from ROOF_MATERIALS
  const [quantities, setQuantities] = useState(() => {
    const map = {};
    ROOF_MATERIALS.forEach((m) => { map[m.id] = m.defaultQty; });
    return map;
  });

  // Active roof tile color (hex string); defaults to first palette entry
  const [tileColor, setTileColor] = useState(ROOF_COLORS[0].hex);

  /** Load the house model (step 0) */
  const loadHouse = useCallback(() => {
    setHouseLoaded(true);
  }, []);

  /** Unload house + remove ALL installed parts */
  const unloadHouse = useCallback(() => {
    setHouseLoaded(false);
    setInstalledIds(new Set());
  }, []);

  /**
   * Can a given material be installed right now?
   * - House must be loaded
   * - All materials with a lower step number must be installed
   */
  const canInstall = useCallback((id) => {
    if (!houseLoaded) return false;

    const idx = INSTALL_ORDER.indexOf(id);
    if (idx === -1) return false;

    // All previous steps must be installed
    for (let i = 0; i < idx; i++) {
      if (!installedIds.has(INSTALL_ORDER[i])) return false;
    }
    return true;
  }, [houseLoaded, installedIds]);

  /** Install a material (mark as placed in the scene) */
  const installPart = useCallback((id) => {
    if (!canInstall(id)) return;
    setInstalledIds((prev) => new Set([...prev, id]));
  }, [canInstall]);

  /**
   * Remove a material AND cascade-remove everything installed after it.
   * E.g., removing step 3 also removes steps 4, 5, 6, 7, 8, 9.
   */
  const removePart = useCallback((id) => {
    const idx = INSTALL_ORDER.indexOf(id);
    if (idx === -1) return;

    setInstalledIds((prev) => {
      const next = new Set(prev);
      for (let i = idx; i < INSTALL_ORDER.length; i++) {
        next.delete(INSTALL_ORDER[i]);
      }
      return next;
    });
  }, []);

  /** Update quantity for a material */
  const setQty = useCallback((id, qty) => {
    const clamped = Math.max(1, Math.round(qty));
    setQuantities((prev) => ({ ...prev, [id]: clamped }));
  }, []);

  /**
   * Install one piece of an installByPcs material.
   * - First call: marks the material as installed with qty = 1.
   * - Subsequent calls: increments qty by 1 each time.
   * Prerequisites (canInstall) must be met before the first piece can be added.
   */
  const addOnePc = useCallback((id) => {
    if (installedIds.has(id)) {
      // Already installed — just increment qty
      setQuantities((prev) => ({ ...prev, [id]: (prev[id] || 1) + 1 }));
    } else {
      // First piece — install it and set qty to 1
      if (!canInstall(id)) return;
      setQuantities((prev) => ({ ...prev, [id]: 1 }));
      setInstalledIds((prev) => new Set([...prev, id]));
    }
  }, [installedIds, canInstall]);

  /**
   * Remove one piece from an installByPcs material.
   * If qty reaches 0, fully uninstalls it (with cascade).
   */
  const removeOnePc = useCallback((id) => {
    const current = quantities[id] || 1;
    if (current <= 1) {
      removePart(id);
    } else {
      setQuantities((prev) => ({ ...prev, [id]: current - 1 }));
    }
  }, [quantities, removePart]);

  /** Reset everything to initial empty state */
  const resetAll = useCallback(() => {
    setHouseLoaded(false);
    setInstalledIds(new Set());
    setQuantities(() => {
      const map = {};
      ROOF_MATERIALS.forEach((m) => { map[m.id] = m.defaultQty; });
      return map;
    });
  }, []);

  /** Build the ordered step list with computed status */
  const steps = useMemo(() => {
    return INSTALL_ORDER.map((id, idx) => {
      const material = ROOF_MATERIALS.find((m) => m.id === id);
      if (!material) return null;

      const isInstalled = installedIds.has(id);
      const qty = quantities[id] || material.defaultQty;

      let status; // 'locked' | 'available' | 'installed'
      if (isInstalled) {
        status = 'installed';
      } else if (!houseLoaded) {
        status = 'locked';
      } else {
        let allPreviousDone = true;
        for (let i = 0; i < idx; i++) {
          if (!installedIds.has(INSTALL_ORDER[i])) {
            allPreviousDone = false;
            break;
          }
        }
        status = allPreviousDone ? 'available' : 'locked';
      }

      return {
        ...material,
        qty,
        status,
        subtotal: isInstalled ? material.unitPrice * qty : 0,
      };
    }).filter(Boolean);
  }, [houseLoaded, installedIds, quantities]);

  /** Grand total of installed materials only */
  const grandTotal = useMemo(() => {
    return steps.reduce((sum, s) => sum + s.subtotal, 0);
  }, [steps]);

  /** Number of installed steps (out of 9) */
  const installedCount = useMemo(() => {
    return steps.filter((s) => s.status === 'installed').length;
  }, [steps]);

  /** The next available step number (for progress display) */
  const nextStep = useMemo(() => {
    const next = steps.find((s) => s.status === 'available');
    return next ? next.step : null;
  }, [steps]);

  /**
   * Are all pre-tile supporting layers installed? (steps 1–7, before Hermosa Roof Tile).
   * hermosa_tile is at index 7 in INSTALL_ORDER so we slice up to that index.
   */
  const isRoofReady = useMemo(() => {
    const tileIdx = INSTALL_ORDER.indexOf('hermosa_tile');
    return INSTALL_ORDER.slice(0, tileIdx).every((id) => installedIds.has(id));
  }, [installedIds]);

  /** Set of IDs currently visible in the 3D scene */
  const visibleIds = useMemo(() => installedIds, [installedIds]);

  return {
    houseLoaded,
    loadHouse,
    unloadHouse,
    steps,
    installPart,
    removePart,
    canInstall,
    addOnePc,
    removeOnePc,
    quantities,
    setQty,
    grandTotal,
    installedCount,
    nextStep,
    isRoofReady,
    visibleIds,
    tileColor,
    setTileColor,
    resetAll,
  };
};

export default useRoofCalculator;
