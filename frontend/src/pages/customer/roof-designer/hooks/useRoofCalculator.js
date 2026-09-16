import { useState, useMemo, useCallback } from 'react';
import { ROOF_MATERIALS, INSTALL_ORDER } from '../data/roofPricingData';

/**
 * Custom hook for the sequential Roof Builder.
 *
 * Key rules:
 *   1. Scene starts EMPTY — nothing is loaded
 *   2. The house model must be loaded FIRST (step 0)
 *   3. Materials can only be installed in construction order (step 1 → 9)
 *   4. A step is only available if ALL previous steps are installed
 *   5. The roof tile (step 9) is only available after steps 1–8 are ALL done
 *   6. Removing a part also removes every part installed AFTER it (cascade)
 *   7. Quantities are adjustable on installed parts
 */
const useRoofCalculator = () => {
  // Whether the house base model is loaded
  const [houseLoaded, setHouseLoaded] = useState(false);

  // Set of installed material IDs
  const [installedIds, setInstalledIds] = useState(new Set());

  // Quantity overrides (id → qty); defaults come from ROOF_MATERIALS
  const [quantities, setQuantities] = useState(() => {
    const map = {};
    ROOF_MATERIALS.forEach((m) => { map[m.id] = m.defaultQty; });
    return map;
  });

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
      // Remove this part and everything after it
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

      // Determine availability status
      let status; // 'locked' | 'available' | 'installed'
      if (isInstalled) {
        status = 'installed';
      } else if (!houseLoaded) {
        status = 'locked';
      } else {
        // Check if all previous steps are installed
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

  /** Are all pre-roof parts installed? (steps 1-8) */
  const isRoofReady = useMemo(() => {
    return INSTALL_ORDER.slice(0, 8).every((id) => installedIds.has(id));
  }, [installedIds]);

  /** Set of IDs currently visible in the 3D scene */
  const visibleIds = useMemo(() => installedIds, [installedIds]);

  return {
    // House
    houseLoaded,
    loadHouse,
    unloadHouse,
    // Steps
    steps,
    installPart,
    removePart,
    canInstall,
    // Quantities
    setQty,
    // Totals
    grandTotal,
    installedCount,
    nextStep,
    isRoofReady,
    // Scene
    visibleIds,
    // Actions
    resetAll,
  };
};

export default useRoofCalculator;
