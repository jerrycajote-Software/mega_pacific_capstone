import { useState, useMemo, useCallback } from 'react';
import { ROOF_MATERIALS, INSTALL_ORDER, ROOF_COLORS } from '../data/roofPricingData';


const useRoofCalculator = () => {
  const [houseLoaded, setHouseLoaded] = useState(false);

  const [installedIds, setInstalledIds] = useState(new Set());

  
  const [quantities, setQuantities] = useState(() => {
    const map = {};
    ROOF_MATERIALS.forEach((m) => { map[m.id] = m.defaultQty; });
    return map;
  });

  
  const [tileColor, setTileColor] = useState(ROOF_COLORS[0].hex);

  
  const loadHouse = useCallback(() => {
    setHouseLoaded(true);
  }, []);

  
  const unloadHouse = useCallback(() => {
    setHouseLoaded(false);
    setInstalledIds(new Set());
  }, []);

  
  const canInstall = useCallback((id) => {
    if (!houseLoaded) return false;

    const idx = INSTALL_ORDER.indexOf(id);
    if (idx === -1) return false;

    
    for (let i = 0; i < idx; i++) {
      if (!installedIds.has(INSTALL_ORDER[i])) return false;
    }
    return true;
  }, [houseLoaded, installedIds]);

  
  const installPart = useCallback((id) => {
    if (!canInstall(id)) return;
    setInstalledIds((prev) => new Set([...prev, id]));
  }, [canInstall]);

 
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

  
  const setQty = useCallback((id, qty) => {
    const clamped = Math.max(1, Math.round(qty));
    setQuantities((prev) => ({ ...prev, [id]: clamped }));
  }, []);

  
  const addOnePc = useCallback((id) => {
    if (installedIds.has(id)) {
      
      setQuantities((prev) => ({ ...prev, [id]: (prev[id] || 1) + 1 }));
    } else {
      
      if (!canInstall(id)) return;
      setQuantities((prev) => ({ ...prev, [id]: 1 }));
      setInstalledIds((prev) => new Set([...prev, id]));
    }
  }, [installedIds, canInstall]);

  
  const removeOnePc = useCallback((id) => {
    const current = quantities[id] || 1;
    if (current <= 1) {
      removePart(id);
    } else {
      setQuantities((prev) => ({ ...prev, [id]: current - 1 }));
    }
  }, [quantities, removePart]);

  
  const resetAll = useCallback(() => {
    setHouseLoaded(false);
    setInstalledIds(new Set());
    setQuantities(() => {
      const map = {};
      ROOF_MATERIALS.forEach((m) => { map[m.id] = m.defaultQty; });
      return map;
    });
  }, []);

  
  const steps = useMemo(() => {
    return INSTALL_ORDER.map((id, idx) => {
      const material = ROOF_MATERIALS.find((m) => m.id === id);
      if (!material) return null;

      const isInstalled = installedIds.has(id);
      const qty = quantities[id] || material.defaultQty;

      let status; 
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

  
  const grandTotal = useMemo(() => {
    return steps.reduce((sum, s) => sum + s.subtotal, 0);
  }, [steps]);

  
  const installedCount = useMemo(() => {
    return steps.filter((s) => s.status === 'installed').length;
  }, [steps]);

  
  const nextStep = useMemo(() => {
    const next = steps.find((s) => s.status === 'available');
    return next ? next.step : null;
  }, [steps]);

  
  const isRoofReady = useMemo(() => {
    const tileIdx = INSTALL_ORDER.indexOf('hermosa_tile');
    return INSTALL_ORDER.slice(0, tileIdx).every((id) => installedIds.has(id));
  }, [installedIds]);

  
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
