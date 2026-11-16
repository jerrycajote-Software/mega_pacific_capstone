import React, { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { io } from 'socket.io-client';
import { useGLTF } from '@react-three/drei';
import { Box, Typography, Button, Paper, CircularProgress, Alert, Stack } from '@mui/material';
import * as THREE from 'three';
import StudioHouseRoofSelectorBar from '../../components/studio/StudioHouseRoofSelectorBar';
import StudioViewportCanvas from '../../components/studio/StudioViewportCanvas';
import StudioCustomizerFooter from '../../components/studio/StudioCustomizerFooter';
import {
  STUDIO_HOUSE_ARCHITECTURES,
  getAvailableStudioRoofs,
  resolveStudioHouseRoofModel,
} from '../../services/roofModelRegistry';
import { ROOFING_COLORS, getColorHex } from '../../constants/roofingSpecs';
import { DEFAULT_LAYER_VISIBILITY } from '../../constants/roofStructureSpecs';
import { isCoilInStock, getFirstInStockColor } from '../../utils/coilAvailability';
import { buildProductOptions } from './buildProductOptions';
import useIsMobileBrowser from '../../hooks/useDeviceDetect';

const DEFAULT_THICKNESSES = ['0.35mm', '0.40mm', '0.50mm', '0.60mm'];

const checkWebGLSupport = () => {
  try {
    const testCanvas = document.createElement('canvas');
    return Boolean(testCanvas.getContext('webgl2') || testCanvas.getContext('webgl'));
  } catch {
    return false;
  }
};

const FULLSCREEN_SHELL_SX = {
  position: 'fixed',
  inset: 0,
  zIndex: 1300,
  display: 'flex',
  flexDirection: 'column',
  overflow: 'hidden',
  bgcolor: '#0b1120',
};

const RoofStudio3DPage = () => {
  const navigate = useNavigate();
  const isMobile = useIsMobileBrowser();
  const orbitControlsRef = useRef(null);
  const allowNavigationRef = useRef(false);
  const lastFramedHouseRef = useRef('');

  const [products, setProducts] = useState([]);
  const [coilInventory, setCoilInventory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [preloadReady, setPreloadReady] = useState(false);
  const [loadedModelPath, setLoadedModelPath] = useState('');
  const [preloadStatus, setPreloadStatus] = useState('Loading product catalog...');
  const [webglSupported] = useState(() => checkWebGLSupport());
  const [error, setError] = useState('');

  const [confirmedMobileProceed, setConfirmedMobileProceed] = useState(false);
  const [selectedHouseId, setSelectedHouseId] = useState(STUDIO_HOUSE_ARCHITECTURES[0].id);
  const [selectedRoofId, setSelectedRoofId] = useState(null);
  const [currentThickness, setCurrentThickness] = useState('0.35mm');
  const [currentColor, setCurrentColor] = useState('Marshall Dark Gray');
  const [currentQty, setCurrentQty] = useState(STUDIO_HOUSE_ARCHITECTURES[0].totalSheets);
  const [viewFullRoof, setViewFullRoof] = useState(true);

  const [showSubstructure, setShowSubstructure] = useState(true);
  const [structurePanelOpen, setStructurePanelOpen] = useState(false);
  const [layerVisibility, setLayerVisibility] = useState(DEFAULT_LAYER_VISIBILITY);
  const [explodeFactor, setExplodeFactor] = useState(0);
  const [xraySheets, setXraySheets] = useState(false);
  const [selectedMeshName, setSelectedMeshName] = useState(null);
  const [touchpadControlsEnabled, setTouchpadControlsEnabled] = useState(true);
  const [isInspectEdgeActive, setIsInspectEdgeActive] = useState(false);
  const [inspectEdgeTrigger, setInspectEdgeTrigger] = useState(0);

  // Prevent browser refresh, keyboard reload (F5 / Ctrl+R), and accidental Back navigation inside 3D Studio
  useEffect(() => {
    window.history.pushState({ studioLock: true }, '', window.location.href);

    const handleBeforeUnload = (e) => {
      if (allowNavigationRef.current) return;
      e.preventDefault();
      e.returnValue = '';
    };

    const handleReloadShortcutBlock = (e) => {
      const key = e.key?.toLowerCase();
      if (e.key === 'F5' || ((e.ctrlKey || e.metaKey) && key === 'r')) {
        e.preventDefault();
        e.stopPropagation();
      }
    };

    const handlePopStateGuard = () => {
      if (!allowNavigationRef.current) {
        window.history.pushState({ studioLock: true }, '', window.location.href);
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    window.addEventListener('keydown', handleReloadShortcutBlock, true);
    window.addEventListener('popstate', handlePopStateGuard);

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
      window.removeEventListener('keydown', handleReloadShortcutBlock, true);
      window.removeEventListener('popstate', handlePopStateGuard);
    };
  }, []);

  const fetchStudioCatalog = useCallback(async () => {
    try {
      setPreloadStatus('Loading available roofing products...');
      const API_URL = import.meta.env.VITE_API_URL || '';
      const [prodRes, coilRes] = await Promise.all([
        axios.get(`${API_URL}/api/customer/products`),
        axios.get(`${API_URL}/api/customer/products/coil-availability`).catch(() => ({ data: { data: [] } })),
      ]);
      const prodData = Array.isArray(prodRes.data) ? prodRes.data : prodRes.data?.products || prodRes.data?.data || [];
      const coilData = Array.isArray(coilRes.data) ? coilRes.data : coilRes.data?.coils || coilRes.data?.data || [];
      setProducts(prodData);
      setCoilInventory(coilData);
      setError('');
    } catch {
      setError('Failed to load roofing products for the 3D Studio. Please try again.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchStudioCatalog();
    const API_URL = import.meta.env.VITE_API_URL || '';
    const socket = io(API_URL);
    socket.on('product_catalog_updated', fetchStudioCatalog);
    return () => socket.close();
  }, [fetchStudioCatalog]);

  // Filter strictly to active Pre-Order products matching Pico Rib 1220, Hermosa Tile, or Agua Corr 1220
  const availableRoofs = useMemo(() => getAvailableStudioRoofs(products), [products]);

  const activeRoofEntry = useMemo(() => {
    if (availableRoofs.length === 0) return null;
    if (selectedRoofId) {
      const matched = availableRoofs.find((r) => r.id === selectedRoofId);
      if (matched) return matched;
    }
    return availableRoofs[0];
  }, [availableRoofs, selectedRoofId]);

  const activeRoofProduct = activeRoofEntry?.product || null;

  const activeModel = useMemo(() => {
    if (!activeRoofEntry) return null;
    return resolveStudioHouseRoofModel(selectedHouseId, activeRoofEntry.id);
  }, [selectedHouseId, activeRoofEntry]);

  // Preload initial 3D model GLB asset cleanly before mounting the Three.js Canvas
  useEffect(() => {
    if (loading || !activeModel?.modelPath || preloadReady) return;
    let cancelled = false;

    const preloadInitialModelAsset = async () => {
      try {
        setPreloadStatus(`Loading 3D ${activeModel.shortLabel} (${activeModel.profileName})...`);
        const response = await fetch(activeModel.modelPath);
        if (!response.ok) {
          throw new Error('Could not download initial 3D house model.');
        }
        await response.arrayBuffer();
        useGLTF.preload(activeModel.modelPath);
        if (!cancelled) {
          setPreloadReady(true);
        }
      } catch {
        if (!cancelled) {
          setError('Unable to load the initial 3D house asset. Please check your connection and try again.');
        }
      }
    };

    preloadInitialModelAsset();
    return () => {
      cancelled = true;
    };
  }, [loading, activeModel?.modelPath, activeModel?.shortLabel, activeModel?.profileName, preloadReady]);

  const availableThicknesses = useMemo(() => {
    const opts = activeRoofProduct ? buildProductOptions(activeRoofProduct) : [];
    const list = [];
    opts.forEach((opt) => {
      const thick = opt.thickness || opt.name;
      if (thick && !list.includes(thick)) list.push(thick);
    });
    return list.length > 0 ? list : DEFAULT_THICKNESSES;
  }, [activeRoofProduct]);

  const colorList = useMemo(() => {
    if (activeRoofProduct?.colors?.length > 0) return activeRoofProduct.colors;
    return ROOFING_COLORS.map((c) => c.name);
  }, [activeRoofProduct]);

  // Keep thickness and color synchronized with active roof product and coil stock
  useEffect(() => {
    if (!activeRoofProduct) return;
    const validThick = availableThicknesses.some((t) => t.toLowerCase().trim() === currentThickness.toLowerCase().trim())
      ? currentThickness
      : availableThicknesses[0];
    if (validThick !== currentThickness) {
      setCurrentThickness(validThick);
    }

    const colorAllowed = colorList.some((c) => c.toLowerCase().trim() === currentColor.toLowerCase().trim());
    const inStock = !coilInventory?.length || isCoilInStock(coilInventory, validThick, currentColor);
    if (!colorAllowed || !inStock) {
      const fallback = getFirstInStockColor(coilInventory, validThick, colorList, colorList[0]);
      if (fallback) setCurrentColor(fallback);
    }
  }, [activeRoofProduct, availableThicknesses, colorList, coilInventory, currentThickness, currentColor]);

  // Re-frame camera cleanly when entering the studio or switching to a different house model
  useEffect(() => {
    if (!preloadReady || !activeModel || loadedModelPath !== activeModel.modelPath) return;
    if (lastFramedHouseRef.current === activeModel.houseId) return;
    lastFramedHouseRef.current = activeModel.houseId;
    const timer = setTimeout(() => {
      const controls = orbitControlsRef.current;
      if (!controls?.object) return;
      const [dx, dy, dz] = activeModel.cameraDefaultPos || [5.6, 3.8, 5.6];
      controls.object.position.set(dx, dy, dz);
      controls.target.set(0, activeModel.cameraTargetY ?? 2.3, 0);
      controls.update();
    }, 80);
    return () => clearTimeout(timer);
  }, [preloadReady, loadedModelPath, activeModel]);

  const handleModelLoaded = useCallback((modelPath) => {
    setLoadedModelPath(modelPath);
  }, []);

  const isModelLoading = Boolean(activeModel?.modelPath && loadedModelPath !== activeModel.modelPath);

  const effectiveSheetQty = activeModel
    ? viewFullRoof
      ? activeModel.totalSheets
      : Math.min(currentQty, activeModel.totalSheets)
    : 1;
  const colorHex = getColorHex(currentColor);

  const handleExitStudio = () => {
    allowNavigationRef.current = true;
    navigate('/dashboard', { replace: true });
  };

  const handleSelectHouseModel = (houseId) => {
    const nextModel = resolveStudioHouseRoofModel(houseId, activeRoofEntry?.id || 'pico_rib_1220');
    useGLTF.preload(nextModel.modelPath);
    setSelectedHouseId(houseId);
    setIsInspectEdgeActive(false);
    setSelectedMeshName(null);
    setViewFullRoof(true);
    setCurrentQty(nextModel.totalSheets);
  };

  const handleSelectRoofType = (roofId) => {
    const nextModel = resolveStudioHouseRoofModel(selectedHouseId, roofId);
    useGLTF.preload(nextModel.modelPath);
    setSelectedRoofId(roofId);
    setSelectedMeshName(null);
    setIsInspectEdgeActive(false);
    if (viewFullRoof) {
      setCurrentQty(nextModel.totalSheets);
    }
  };

  const handleSelectRoofThickness = (thick) => {
    setCurrentThickness(thick);
    if (coilInventory?.length > 0 && !isCoilInStock(coilInventory, thick, currentColor)) {
      const fallback = getFirstInStockColor(coilInventory, thick, colorList, currentColor);
      if (fallback) setCurrentColor(fallback);
    }
  };

  const handleSelectRoofColor = (colorName) => {
    if (coilInventory?.length > 0 && !isCoilInStock(coilInventory, currentThickness, colorName)) return;
    setCurrentColor(colorName);
  };

  const handleIncreaseSheets = () => {
    if (!activeModel) return;
    setViewFullRoof(false);
    setCurrentQty((prev) => Math.min(activeModel.totalSheets, prev + 1));
  };

  const handleDecreaseSheets = () => {
    setViewFullRoof(false);
    setCurrentQty((prev) => Math.max(1, prev - 1));
  };

  const handleToggleFullRoofPreview = () => {
    if (!activeModel) return;
    setViewFullRoof((prev) => {
      const next = !prev;
      if (next) setCurrentQty(activeModel.totalSheets);
      return next;
    });
  };

  const handleToggleLayerVisibility = (layerId) => {
    setLayerVisibility((prev) => ({ ...prev, [layerId]: prev?.[layerId] === false }));
  };

  const handleIsolateInternalStructure = () => {
    setShowSubstructure(true);
    setXraySheets(false);
    setLayerVisibility({
      trims_flashing: false,
      roof_sheets: false,
      underlayment: false,
      purlins: true,
      trusses: true,
      top_plate: true,
      base_house: false,
    });
  };

  const handleRestoreAllLayers = () => {
    setShowSubstructure(true);
    setXraySheets(false);
    setExplodeFactor(0);
    setSelectedMeshName(null);
    setLayerVisibility(DEFAULT_LAYER_VISIBILITY);
  };

  const handleZoomIn = () => {
    const controls = orbitControlsRef.current;
    if (!controls?.object || !controls?.target) return;
    controls.object.position.lerp(controls.target, 0.25);
    controls.update();
  };

  const handleZoomOut = () => {
    const controls = orbitControlsRef.current;
    if (!controls?.object || !controls?.target) return;
    controls.object.position.addScaledVector(controls.object.position.clone().sub(controls.target), 0.25);
    controls.update();
  };

  const handleRotateCameraStep = (deltaDegrees) => {
    const controls = orbitControlsRef.current;
    if (!controls) return;
    controls.setAzimuthalAngle(controls.getAzimuthalAngle() + (deltaDegrees * Math.PI) / 180);
    controls.update();
  };

  const handleSetCameraView = (viewType) => {
    const controls = orbitControlsRef.current;
    const camera = controls?.object;
    if (!camera || !controls || !activeModel) return;

    const targetY = activeModel.cameraTargetY ?? 2.3;
    const [defX, defY, defZ] = activeModel.cameraDefaultPos ?? [5.6, 3.8, 5.6];

    if (viewType === 'default') {
      setIsInspectEdgeActive(false);
      camera.position.set(defX, defY, defZ);
      controls.target.set(0, targetY, 0);
    } else if (viewType === 'front') {
      setIsInspectEdgeActive(false);
      camera.position.set(0, defY, defZ + 2.2);
      controls.target.set(0, targetY, 0);
    } else if (viewType === 'top') {
      setIsInspectEdgeActive(false);
      camera.position.set(...(activeModel.roofTopCameraPos || [0, defY + 5.2, 1.4]));
      controls.target.set(...(activeModel.roofTopTarget || [0, targetY, 0]));
    } else if (viewType === 'edge') {
      setIsInspectEdgeActive(true);
      setInspectEdgeTrigger((prev) => prev + 1);
      let targetPos = activeModel.sheetEdgeTarget;
      let cameraPos = activeModel.sheetEdgeCameraPos;
      if (!targetPos && camera.parent) {
        let root = camera.parent;
        while (root.parent) root = root.parent;
        const sheetMesh = root.getObjectByName('RoofSheet_01');
        if (sheetMesh) {
          const box = new THREE.Box3().setFromObject(sheetMesh);
          const midX = (box.min.x + box.max.x) / 2;
          targetPos = [midX, box.min.y + 0.01, box.max.z];
          cameraPos = [midX, box.min.y - 0.02, box.max.z + 0.72];
        }
      }
      if (targetPos && cameraPos) {
        camera.position.set(...cameraPos);
        controls.target.set(...targetPos);
      }
    } else if (viewType === 'internal') {
      setIsInspectEdgeActive(false);
      setShowSubstructure(true);
      setLayerVisibility((prev) => ({ ...prev, purlins: true, trusses: true, top_plate: true, base_house: false }));
      camera.position.set(...(activeModel.internalTrussCameraPos || [3.2, targetY + 0.25, 2.8]));
      controls.target.set(...(activeModel.internalTrussTarget || [0, targetY + 1.35, 0]));
    }
    controls.update();
  };

  // Navigate straight to the selected roof product page (ex. Hermosa Tile) with current selections
  const handleNavigateToSelectedRoofProduct = () => {
    if (!activeRoofProduct?.id || !activeModel) return;
    allowNavigationRef.current = true;
    navigate(`/product/${activeRoofProduct.id}`, {
      state: {
        selectedColor: currentColor,
        selectedThickness: currentThickness,
        selectedLength: activeModel.recommendedLength,
        selectedQuantity: effectiveSheetQty,
        color: currentColor,
        thickness: currentThickness,
        length: activeModel.recommendedLength,
        quantity: effectiveSheetQty,
      },
    });
  };

  if (!webglSupported) {
    return (
      <Box sx={{ ...FULLSCREEN_SHELL_SX, alignItems: 'center', justifyContent: 'center', p: 3 }}>
        <Paper elevation={0} sx={{ maxWidth: 480, p: 4, textAlign: 'center', borderRadius: 3.5, bgcolor: '#1e293b', color: '#f8fafc' }}>
          <Typography variant="h6" fontWeight={800} gutterBottom>3D Graphics Not Supported</Typography>
          <Typography variant="body2" sx={{ color: '#94a3b8', mb: 3 }}>
            Your browser or device does not have 3D WebGL acceleration enabled. Please enable hardware acceleration or use a modern desktop browser.
          </Typography>
          <Button variant="contained" color="primary" onClick={handleExitStudio} sx={{ borderRadius: 2, fontWeight: 700, textTransform: 'none' }}>
            Exit 3D Studio
          </Button>
        </Paper>
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ ...FULLSCREEN_SHELL_SX, alignItems: 'center', justifyContent: 'center', p: 3 }}>
        <Paper elevation={0} sx={{ maxWidth: 520, p: 4, borderRadius: 3.5, bgcolor: '#1e293b', color: '#f8fafc', textAlign: 'center' }}>
          <Alert severity="error" sx={{ borderRadius: 2.5, mb: 2.5, textAlign: 'left' }}>{error}</Alert>
          <Stack direction="row" spacing={1.5} justifyContent="center">
            <Button variant="contained" onClick={() => { setError(''); setLoading(true); fetchStudioCatalog(); }} sx={{ borderRadius: 2, fontWeight: 700, textTransform: 'none' }}>
              Retry Loading Studio
            </Button>
            <Button variant="outlined" onClick={handleExitStudio} sx={{ borderRadius: 2, fontWeight: 700, textTransform: 'none', color: '#cbd5e1', borderColor: 'rgba(255,255,255,0.25)' }}>
              Exit 3D Studio
            </Button>
          </Stack>
        </Paper>
      </Box>
    );
  }

  if (!loading && availableRoofs.length === 0) {
    return (
      <Box sx={{ ...FULLSCREEN_SHELL_SX, alignItems: 'center', justifyContent: 'center', p: 3 }}>
        <Paper elevation={0} sx={{ maxWidth: 560, p: 5, textAlign: 'center', borderRadius: 4, bgcolor: '#1e293b', color: '#f8fafc', border: '1px solid rgba(255,255,255,0.1)' }}>
          <Typography variant="h5" fontWeight={800} gutterBottom>
            No Supported 3D Roof Products Available
          </Typography>
          <Typography variant="body2" sx={{ color: '#94a3b8', mb: 3 }}>
            The 3D House &amp; Roof Studio displays Pico Rib 1220, Hermosa Tile, Agua Corr 1220, Mega Hi-Rib, Mega Twin Rib, Mega Six Ribs, and Mega S-Rib once those products are created and active in the catalog.
          </Typography>
          <Button variant="contained" color="primary" onClick={handleExitStudio} sx={{ borderRadius: 2.5, fontWeight: 700, textTransform: 'none' }}>
            Exit 3D Studio
          </Button>
        </Paper>
      </Box>
    );
  }

  if (loading || !preloadReady || !activeModel) {
    return (
      <Box sx={{ ...FULLSCREEN_SHELL_SX, alignItems: 'center', justifyContent: 'center', gap: 2, p: 3 }}>
        <CircularProgress size={48} sx={{ color: '#4ade80' }} />
        <Typography variant="subtitle1" fontWeight={800} sx={{ color: '#f8fafc' }}>
          Preparing 3D House &amp; Roof Studio
        </Typography>
        <Typography variant="body2" sx={{ color: '#94a3b8' }}>
          {preloadStatus}
        </Typography>
        <Button
          size="small"
          variant="outlined"
          onClick={handleExitStudio}
          sx={{ mt: 1, borderRadius: 2, color: '#cbd5e1', borderColor: 'rgba(255,255,255,0.2)', textTransform: 'none', fontWeight: 700 }}
        >
          Exit 3D Studio
        </Button>
      </Box>
    );
  }

  if (isMobile && !confirmedMobileProceed) {
    return (
      <Box sx={{ ...FULLSCREEN_SHELL_SX, alignItems: 'center', justifyContent: 'center', p: 3 }}>
        <Paper elevation={0} sx={{ maxWidth: 420, p: 4, borderRadius: 3.5, bgcolor: '#1e293b', color: '#f8fafc', textAlign: 'center' }}>
          <Typography variant="h6" fontWeight={800} gutterBottom>Desktop Device Recommended</Typography>
          <Typography variant="body2" sx={{ color: '#94a3b8', mb: 3 }}>
            The interactive 3D Studio runs best on desktop computers or high-spec tablets. Mobile browsers may experience slower frame rates.
          </Typography>
          <Stack spacing={1.5}>
            <Button variant="contained" color="primary" fullWidth onClick={() => setConfirmedMobileProceed(true)} sx={{ fontWeight: 700, borderRadius: 2, textTransform: 'none' }}>
              Continue to 3D Studio
            </Button>
            <Button variant="outlined" fullWidth onClick={handleExitStudio} sx={{ fontWeight: 700, borderRadius: 2, color: '#cbd5e1', borderColor: 'rgba(255,255,255,0.2)', textTransform: 'none' }}>
              Exit 3D Studio
            </Button>
          </Stack>
        </Paper>
      </Box>
    );
  }

  return (
    <Box sx={FULLSCREEN_SHELL_SX}>
      <StudioHouseRoofSelectorBar
        houseArchitectures={STUDIO_HOUSE_ARCHITECTURES}
        selectedHouseId={selectedHouseId}
        onSelectHouseModel={handleSelectHouseModel}
        availableRoofs={availableRoofs}
        selectedRoofId={activeRoofEntry?.id}
        onSelectRoofType={handleSelectRoofType}
        activeModel={activeModel}
        currentThickness={currentThickness}
        onExitStudio={handleExitStudio}
      />

      <StudioViewportCanvas
        activeModel={activeModel}
        isModelLoading={isModelLoading}
        onModelLoaded={handleModelLoaded}
        orbitControlsRef={orbitControlsRef}
        effectiveSheetQty={effectiveSheetQty}
        colorHex={colorHex}
        currentColor={currentColor}
        currentThickness={currentThickness}
        showSubstructure={showSubstructure}
        onToggleSubstructure={() => setShowSubstructure((prev) => !prev)}
        layerVisibility={layerVisibility}
        onToggleLayerVisibility={handleToggleLayerVisibility}
        onIsolateInternalStructure={handleIsolateInternalStructure}
        onRestoreAllLayers={handleRestoreAllLayers}
        structurePanelOpen={structurePanelOpen}
        onToggleStructurePanel={() => setStructurePanelOpen((prev) => !prev)}
        explodeFactor={explodeFactor}
        onChangeExplodeFactor={setExplodeFactor}
        xraySheets={xraySheets}
        onToggleXraySheets={() => setXraySheets((prev) => !prev)}
        selectedMeshName={selectedMeshName}
        onSelectMeshPart={setSelectedMeshName}
        onClearSelectedMesh={() => setSelectedMeshName(null)}
        viewFullRoof={viewFullRoof}
        onToggleFullRoofPreview={handleToggleFullRoofPreview}
        touchpadControlsEnabled={touchpadControlsEnabled}
        onToggleTouchpadControls={() => setTouchpadControlsEnabled((prev) => !prev)}
        isInspectEdgeActive={isInspectEdgeActive}
        inspectEdgeTrigger={inspectEdgeTrigger}
        onSetCameraView={handleSetCameraView}
        onRotateCameraStep={handleRotateCameraStep}
        onZoomIn={handleZoomIn}
        onZoomOut={handleZoomOut}
        onExitStudio={handleExitStudio}
      />

      <StudioCustomizerFooter
        availableThicknesses={availableThicknesses}
        currentThickness={currentThickness}
        onSelectRoofThickness={handleSelectRoofThickness}
        currentQty={effectiveSheetQty}
        onIncreaseSheets={handleIncreaseSheets}
        onDecreaseSheets={handleDecreaseSheets}
        colorList={colorList}
        currentColor={currentColor}
        onSelectRoofColor={handleSelectRoofColor}
        coilInventory={coilInventory}
        activeRoofProduct={activeRoofProduct}
        onNavigateToSelectedRoofProduct={handleNavigateToSelectedRoofProduct}
      />
    </Box>
  );
};

export default RoofStudio3DPage;
