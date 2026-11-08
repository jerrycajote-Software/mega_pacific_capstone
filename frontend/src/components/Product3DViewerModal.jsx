import React, { useState, useEffect, useMemo, useRef, Suspense } from 'react';
import {
  Dialog,
  DialogContent,
  Box,
  Typography,
  Button,
  IconButton,
  Chip,
  Tooltip,
  Paper,
  CircularProgress,
  Stack,
} from '@mui/material';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Environment, ContactShadows, Html } from '@react-three/drei';
import ConfigurableRoofModel from './ConfigurableRoofModel';
import {
  getCompatibleRoofModel,
  getSupportedLengthRangeText,
} from '../services/roofModelRegistry';
import { ROOFING_COLORS, getColorHex } from '../constants/roofingSpecs';
import { isCoilInStock, getFirstInStockColor } from '../utils/coilAvailability';
import useIsMobileBrowser from '../hooks/useDeviceDetect';

const CanvasLoader = () => (
  <Html center>
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: 1.5,
        p: 2.5,
        borderRadius: 3,
        bgcolor: 'rgba(15, 23, 42, 0.85)',
        color: '#ffffff',
        backdropFilter: 'blur(8px)',
        boxShadow: '0 10px 25px rgba(0,0,0,0.3)',
      }}
    >
      <CircularProgress size={32} sx={{ color: '#4ade80' }} />
      <Typography variant="caption" sx={{ fontWeight: 700, letterSpacing: '0.04em' }}>
        Loading Pico Rib 1220 Model…
      </Typography>
    </Box>
  </Html>
);

const Product3DViewerModal = ({
  open,
  onClose,
  product,
  selectedOption = null,
  productOptions = [],
  coilInventory = [],
  availableColors = [],
  initialColor = 'Marshall Dark Gray',
  initialLength = 3.8,
  initialQuantity = 10,
  onApplyChanges,
}) => {
  const isMobile = useIsMobileBrowser();
  const [confirmedMobileProceed, setConfirmedMobileProceed] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [viewFullRoof, setViewFullRoof] = useState(false);

  const [currentColor, setCurrentColor] = useState(initialColor);
  const [currentQty, setCurrentQty] = useState(initialQuantity);
  const [currentLength, setCurrentLength] = useState(initialLength);
  const [showSubstructure, setShowSubstructure] = useState(true);

  const colorList = useMemo(() => {
    if (availableColors && availableColors.length > 0) {
      return availableColors;
    }
    if (product?.colors && product.colors.length > 0) {
      return product.colors;
    }
    return ROOFING_COLORS.map((c) => c.name);
  }, [availableColors, product]);

  const availableThicknesses = useMemo(() => {
    if (productOptions && productOptions.length > 0) {
      const list = [];
      productOptions.forEach((opt) => {
        const thick = opt.thickness || opt.name;
        if (thick && !list.includes(thick)) list.push(thick);
      });
      if (list.length > 0) return list;
    }
    return ['0.35mm', '0.40mm', '0.50mm', '0.60mm'];
  }, [productOptions]);

  const [currentThickness, setCurrentThickness] = useState(
    selectedOption?.thickness || selectedOption?.name || '0.35mm'
  );

  const orbitControlsRef = useRef(null);

  // Sync state when opening with fresh product props
  useEffect(() => {
    if (open) {
      const initialThick = selectedOption?.thickness || selectedOption?.name || '0.35mm';
      setCurrentThickness(initialThick);

      let targetColor = initialColor;
      if (coilInventory && coilInventory.length > 0) {
        if (!isCoilInStock(coilInventory, initialThick, initialColor)) {
          targetColor = getFirstInStockColor(
            coilInventory,
            initialThick,
            colorList,
            initialColor
          );
        }
      }
      setCurrentColor(targetColor);
      setCurrentQty(Math.max(1, parseInt(initialQuantity, 10) || 1));
      setCurrentLength(parseFloat(initialLength) || 3.8);
      setViewFullRoof(false);
      setConfirmedMobileProceed(false);
      setIsFullscreen(false);
    }
  }, [open, initialColor, initialQuantity, initialLength, selectedOption, coilInventory, colorList]);

  const compatibility = getCompatibleRoofModel(currentLength, product?.name);
  const isProductSupported = compatibility.isProfileSupported;
  const matchedModel = compatibility.model;
  const colorHex = getColorHex(currentColor);

  const effectiveSheetQty = viewFullRoof ? (matchedModel?.totalSheets || 16) : currentQty;

  const handleIncreaseSheets = () => {
    setCurrentQty((prev) => prev + 1);
  };

  const handleDecreaseSheets = () => {
    setCurrentQty((prev) => Math.max(1, prev - 1));
  };

  const handleSelectColor = (colorName) => {
    if (coilInventory && coilInventory.length > 0) {
      const inStock = isCoilInStock(coilInventory, currentThickness, colorName);
      if (!inStock) return;
    }
    setCurrentColor(colorName);
  };

  const handleSelectThickness = (thick) => {
    setCurrentThickness(thick);
    if (coilInventory && coilInventory.length > 0) {
      const inStock = isCoilInStock(coilInventory, thick, currentColor);
      if (!inStock) {
        const fallbackColor = getFirstInStockColor(
          coilInventory,
          thick,
          colorList,
          currentColor
        );
        if (fallbackColor) {
          setCurrentColor(fallbackColor);
        }
      }
    }
  };

  const handleToggleSubstructure = () => {
    setShowSubstructure((prev) => !prev);
  };

  const handleToggleFullscreen = () => {
    setIsFullscreen((prev) => !prev);
  };

  const handleZoomIn = () => {
    if (!orbitControlsRef.current) return;
    const controls = orbitControlsRef.current;
    const camera = controls.object;
    const target = controls.target;
    if (camera && target) {
      camera.position.lerp(target, 0.25);
      controls.update();
    }
  };

  const handleZoomOut = () => {
    if (!orbitControlsRef.current) return;
    const controls = orbitControlsRef.current;
    const camera = controls.object;
    const target = controls.target;
    if (camera && target) {
      camera.position.addScaledVector(camera.position.clone().sub(target), 0.25);
      controls.update();
    }
  };

  const handleSetCameraView = (viewType) => {
    if (!orbitControlsRef.current) return;
    const controls = orbitControlsRef.current;
    const camera = controls.object;
    if (!camera) return;

    if (viewType === 'default') {
      camera.position.set(5.6, 3.8, 5.6);
      controls.target.set(0, 2.3, 0);
    } else if (viewType === 'top') {
      camera.position.set(0, 8.5, 1.2);
      controls.target.set(0, 2.3, 0);
    } else if (viewType === 'front') {
      camera.position.set(0, 3.8, 7.2);
      controls.target.set(0, 2.3, 0);
    }
    controls.update();
  };

  const handleApplyChangesToOrder = () => {
    if (onApplyChanges) {
      onApplyChanges({
        quantity: currentQty,
        color: currentColor,
        length: currentLength,
        thickness: currentThickness,
      });
    }
    onClose();
  };

  const handleDiscardChanges = () => {
    onClose();
  };

  const handleAdoptRecommendedLength = (recLength) => {
    setCurrentLength(recLength);
  };

  // Mobile safety interception screen
  if (isMobile && !confirmedMobileProceed && open) {
    return (
      <Dialog
        open={open}
        onClose={onClose}
        maxWidth="xs"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: 3.5,
            p: 3,
            bgcolor: '#0f172a',
            color: '#f8fafc',
            textAlign: 'center',
          },
        }}
      >
        <Box
          sx={{
            width: 56,
            height: 56,
            borderRadius: 2.5,
            bgcolor: 'rgba(245, 158, 11, 0.15)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            mx: 'auto',
            mb: 2,
            color: '#fbbf24',
          }}
        >
          <i className="fi fi-rr-computer" style={{ fontSize: '26px' }}></i>
        </Box>
        <Typography variant="h6" fontWeight={800} gutterBottom>
          Desktop Device Recommended
        </Typography>
        <Typography variant="body2" sx={{ color: '#94a3b8', mb: 3, lineHeight: 1.55 }}>
          The interactive 3D WebGL renderer runs best on desktop computers or high-spec tablets. Mobile browsers may experience reduced frame rates or memory limits.
        </Typography>
        <Stack spacing={1.5}>
          <Button
            variant="contained"
            color="primary"
            fullWidth
            onClick={() => setConfirmedMobileProceed(true)}
            sx={{
              py: 1.25,
              fontWeight: 700,
              borderRadius: 2,
            }}
          >
            Continue to 3D Viewer
          </Button>
          <Button
            variant="outlined"
            fullWidth
            onClick={onClose}
            sx={{
              py: 1.25,
              fontWeight: 700,
              borderRadius: 2,
              borderColor: 'rgba(255, 255, 255, 0.2)',
              color: '#cbd5e1',
            }}
          >
            Return to Product Details
          </Button>
        </Stack>
      </Dialog>
    );
  }

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth={false}
      fullScreen={isFullscreen}
      sx={{
        '& .MuiDialog-paper': {
          width: isFullscreen ? '100vw' : { xs: '98vw', md: '94vw', lg: '92vw' },
          maxWidth: isFullscreen ? 'none' : '1550px',
          height: isFullscreen ? '100vh' : { xs: '96vh', md: '92vh' },
          maxHeight: isFullscreen ? '100vh' : '94vh',
          m: isFullscreen ? 0 : 'auto',
          borderRadius: isFullscreen ? 0 : 3.5,
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
          bgcolor: '#0b1120',
          boxShadow: '0 25px 60px rgba(0,0,0,0.6)',
          transition: 'all 0.2s ease-in-out',
        },
      }}
    >
      {/* Top Header Bar */}
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          px: { xs: 2, md: 3 },
          py: 1.5,
          borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
          bgcolor: 'rgba(15, 23, 42, 0.95)',
          zIndex: 10,
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, flexWrap: 'wrap' }}>
          <Typography variant="subtitle1" fontWeight={800} sx={{ color: '#f8fafc' }}>
            {product?.name || 'Roofing Sheet'} — 3D Visualizer
          </Typography>
          {isProductSupported && matchedModel && (
            <Chip
              label={`${matchedModel.name} • 28mm Rib Height • ${currentThickness}`}
              size="small"
              sx={{
                bgcolor: 'rgba(79, 119, 45, 0.25)',
                color: '#86efac',
                border: '1px solid rgba(74, 222, 128, 0.3)',
                fontWeight: 700,
                fontSize: '0.72rem',
              }}
            />
          )}
        </Box>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Tooltip title={isFullscreen ? 'Exit Fullscreen' : 'Expand to Fullscreen'} arrow>
            <IconButton
              onClick={handleToggleFullscreen}
              size="small"
              aria-label={isFullscreen ? 'Exit Fullscreen' : 'Expand to Fullscreen'}
              sx={{
                color: '#94a3b8',
                '&:hover': { color: '#ffffff', bgcolor: 'rgba(255, 255, 255, 0.1)' },
              }}
            >
              <i className={isFullscreen ? 'fi fi-rr-compress' : 'fi fi-rr-expand'} style={{ fontSize: '15px' }}></i>
            </IconButton>
          </Tooltip>
          <IconButton
            onClick={onClose}
            size="small"
            aria-label="Close 3D Visualizer"
            sx={{
              color: '#94a3b8',
              '&:hover': { color: '#ffffff', bgcolor: 'rgba(255, 255, 255, 0.1)' },
            }}
          >
            <i className="fi fi-rr-cross" style={{ fontSize: '14px' }}></i>
          </IconButton>
        </Box>
      </Box>

      {/* Main 3D Canvas or Model Fallback */}
      <DialogContent sx={{ p: 0, flex: 1, position: 'relative', overflow: 'hidden' }}>
        {!isProductSupported ? (
          /* Profile unsupported fallback: ex. Mega Twin Rib */
          <Box
            sx={{
              height: '100%',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              p: 4,
              textAlign: 'center',
              bgcolor: '#0f172a',
            }}
          >
            <Paper
              elevation={0}
              sx={{
                maxWidth: 540,
                p: 4.5,
                borderRadius: 3.5,
                bgcolor: 'rgba(30, 41, 59, 0.75)',
                border: '1px solid rgba(255, 255, 255, 0.12)',
                backdropFilter: 'blur(12px)',
                textAlign: 'center',
              }}
            >
              <Box
                sx={{
                  width: 64,
                  height: 64,
                  borderRadius: 3,
                  bgcolor: 'rgba(239, 68, 68, 0.15)',
                  color: '#f87171',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  mx: 'auto',
                  mb: 2.5,
                }}
              >
                <i className="fi fi-rr-box" style={{ fontSize: '30px' }}></i>
              </Box>
              <Typography variant="h6" fontWeight={800} sx={{ color: '#ffffff', mb: 1 }}>
                Nothing available model for this product
              </Typography>
              <Typography variant="body2" sx={{ color: '#94a3b8', mb: 3.5, lineHeight: 1.65 }}>
                Our interactive 3D model visualization is currently built and tailored specifically for{' '}
                <strong style={{ color: '#4ade80' }}>Pico Rib 1220</strong> roofing sheets.
                <br />
                A dedicated 3D profile model for <strong>{product?.name || 'this product'}</strong> is currently in development.
              </Typography>
              <Stack direction="row" spacing={1.5} justifyContent="center">
                <Button
                  variant="contained"
                  color="primary"
                  onClick={onClose}
                  sx={{ fontWeight: 800, borderRadius: 2, px: 3.5 }}
                >
                  Return to Product Details
                </Button>
              </Stack>
            </Paper>
          </Box>
        ) : !matchedModel ? (
          /* Length out-of-range fallback */
          <Box
            sx={{
              height: '100%',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              p: 4,
              textAlign: 'center',
              bgcolor: '#0f172a',
            }}
          >
            <Paper
              elevation={0}
              sx={{
                maxWidth: 520,
                p: 4,
                borderRadius: 3.5,
                bgcolor: 'rgba(30, 41, 59, 0.7)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                backdropFilter: 'blur(12px)',
                textAlign: 'center',
              }}
            >
              <Box
                sx={{
                  width: 60,
                  height: 60,
                  borderRadius: 3,
                  bgcolor: 'rgba(239, 68, 68, 0.12)',
                  color: '#f87171',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  mx: 'auto',
                  mb: 2.5,
                }}
              >
                <i className="fi fi-rr-box" style={{ fontSize: '28px' }}></i>
              </Box>
              <Typography variant="h6" fontWeight={800} sx={{ color: '#ffffff', mb: 1 }}>
                No 3D Model Available for {currentLength}m Length
              </Typography>
              <Typography variant="body2" sx={{ color: '#94a3b8', mb: 3, lineHeight: 1.6 }}>
                Currently, the Pico Rib 1220 house model supports rafter spans from 2.5m to 4.5m.
                <br />
                <strong>Supported length range:</strong>
                <br />
                {getSupportedLengthRangeText()}
              </Typography>
              <Stack direction="row" spacing={1.5} justifyContent="center">
                <Button
                  variant="contained"
                  color="primary"
                  onClick={() => handleAdoptRecommendedLength(3.8)}
                  sx={{ fontWeight: 700, borderRadius: 2 }}
                >
                  View Pico Rib 1220 House (3.8m)
                </Button>
                <Button
                  variant="outlined"
                  onClick={onClose}
                  sx={{
                    fontWeight: 700,
                    borderRadius: 2,
                    borderColor: 'rgba(255, 255, 255, 0.2)',
                    color: '#e2e8f0',
                  }}
                >
                  Close Visualizer
                </Button>
              </Stack>
            </Paper>
          </Box>
        ) : (
          <>
            {/* 3D Canvas */}
            <Canvas
              shadows
              camera={{ position: [5.6, 3.8, 5.6], fov: 35, near: 0.1, far: 100 }}
              style={{ width: '100%', height: '100%', background: 'linear-gradient(180deg, #1e293b 0%, #0f172a 100%)' }}
              gl={{ antialias: true, alpha: false }}
            >
              <ambientLight intensity={0.65} />
              <directionalLight
                position={[12, 18, 12]}
                intensity={1.4}
                castShadow
                shadow-mapSize-width={2048}
                shadow-mapSize-height={2048}
              />
              <directionalLight position={[-8, 10, -8]} intensity={0.5} />
              <Environment preset="city" />

              <ContactShadows
                position={[0, -0.01, 0]}
                opacity={0.55}
                scale={24}
                blur={2.2}
                far={10}
              />

              <Suspense fallback={<CanvasLoader />}>
                <ConfigurableRoofModel
                  modelPath={matchedModel.modelPath}
                  sheetQty={effectiveSheetQty}
                  roofColorHex={colorHex}
                  showSubstructure={showSubstructure}
                  showSheets={true}
                />
              </Suspense>

              <OrbitControls
                ref={orbitControlsRef}
                makeDefault
                enableDamping
                dampingFactor={0.06}
                target={[0, 2.3, 0]}
                maxPolarAngle={Math.PI / 2 - 0.05}
                minDistance={2.5}
                maxDistance={18}
              />
            </Canvas>

            {/* In-Canvas Floating Order Coverage HUD */}
            <Box
              sx={{
                position: 'absolute',
                top: 16,
                left: 16,
                zIndex: 5,
              }}
            >
              <Paper
                elevation={0}
                sx={{
                  p: 1.5,
                  px: 2,
                  borderRadius: 2.5,
                  bgcolor: 'rgba(15, 23, 42, 0.88)',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  backdropFilter: 'blur(8px)',
                  color: '#ffffff',
                }}
              >
                <Typography variant="caption" sx={{ color: '#94a3b8', display: 'block', fontWeight: 700 }}>
                  PICO RIB 1220 ORDER COVERAGE
                </Typography>
                <Typography variant="subtitle2" fontWeight={800} sx={{ color: '#4ade80' }}>
                  {effectiveSheetQty} of {matchedModel.totalSheets} sheets installed ({Math.min(100, Math.round((effectiveSheetQty / matchedModel.totalSheets) * 100))}%)
                </Typography>
                {effectiveSheetQty < matchedModel.totalSheets ? (
                  <Typography variant="caption" sx={{ color: '#fde047', display: 'block', mt: 0.25 }}>
                    {matchedModel.totalSheets - effectiveSheetQty} sheet slots exposed to purlins
                  </Typography>
                ) : (
                  <Typography variant="caption" sx={{ color: '#86efac', display: 'block', mt: 0.25 }}>
                    Complete roof slope coverage ({currentColor})
                  </Typography>
                )}
                <Box sx={{ mt: 1 }}>
                  <Button
                    size="small"
                    onClick={() => setViewFullRoof((prev) => !prev)}
                    sx={{
                      color: viewFullRoof ? '#4ade80' : '#e2e8f0',
                      bgcolor: viewFullRoof ? 'rgba(74, 222, 128, 0.15)' : 'rgba(255, 255, 255, 0.08)',
                      border: '1px solid',
                      borderColor: viewFullRoof ? 'rgba(74, 222, 128, 0.4)' : 'rgba(255, 255, 255, 0.15)',
                      fontSize: '0.72rem',
                      fontWeight: 700,
                      py: 0.3,
                      px: 1.2,
                      borderRadius: 1.5,
                      textTransform: 'none',
                      '&:hover': {
                        bgcolor: viewFullRoof ? 'rgba(74, 222, 128, 0.25)' : 'rgba(255, 255, 255, 0.15)',
                      },
                    }}
                  >
                    {viewFullRoof ? `Previewing Full Roof (16 Sheets)` : `Preview Full Roof (16 Sheets)`}
                  </Button>
                </Box>
                <Typography variant="caption" sx={{ color: '#64748b', display: 'block', mt: 0.6, fontSize: '0.68rem' }}>
                  Rotate: Left-click drag • Zoom: Scroll wheel
                </Typography>
              </Paper>
            </Box>

            {/* In-Canvas Controls Floating Toolbar */}
            <Box
              sx={{
                position: 'absolute',
                top: 16,
                right: 16,
                zIndex: 5,
                display: 'flex',
                alignItems: 'center',
                gap: 1,
                flexWrap: 'wrap',
                justifyContent: 'flex-end',
              }}
            >
              {/* Preset Camera Views */}
              <Box
                sx={{
                  display: { xs: 'none', sm: 'flex' },
                  alignItems: 'center',
                  bgcolor: 'rgba(15, 23, 42, 0.85)',
                  borderRadius: 2,
                  p: 0.4,
                  border: '1px solid rgba(255, 255, 255, 0.12)',
                  backdropFilter: 'blur(8px)',
                  gap: 0.4,
                }}
              >
                <Button
                  size="small"
                  onClick={() => handleSetCameraView('default')}
                  sx={{
                    color: '#e2e8f0',
                    fontSize: '0.72rem',
                    fontWeight: 700,
                    px: 1.2,
                    py: 0.4,
                    minWidth: 0,
                    borderRadius: 1.5,
                    textTransform: 'none',
                    '&:hover': { bgcolor: 'rgba(255, 255, 255, 0.1)' },
                  }}
                >
                  Default View
                </Button>
                <Button
                  size="small"
                  onClick={() => handleSetCameraView('front')}
                  sx={{
                    color: '#e2e8f0',
                    fontSize: '0.72rem',
                    fontWeight: 700,
                    px: 1.2,
                    py: 0.4,
                    minWidth: 0,
                    borderRadius: 1.5,
                    textTransform: 'none',
                    '&:hover': { bgcolor: 'rgba(255, 255, 255, 0.1)' },
                  }}
                >
                  Front Slope
                </Button>
                <Button
                  size="small"
                  onClick={() => handleSetCameraView('top')}
                  sx={{
                    color: '#e2e8f0',
                    fontSize: '0.72rem',
                    fontWeight: 700,
                    px: 1.2,
                    py: 0.4,
                    minWidth: 0,
                    borderRadius: 1.5,
                    textTransform: 'none',
                    '&:hover': { bgcolor: 'rgba(255, 255, 255, 0.1)' },
                  }}
                >
                  Roof Top
                </Button>
              </Box>

              {/* Zoom Buttons */}
              <Box
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  bgcolor: 'rgba(15, 23, 42, 0.85)',
                  borderRadius: 2,
                  border: '1px solid rgba(255, 255, 255, 0.12)',
                  backdropFilter: 'blur(8px)',
                }}
              >
                <Tooltip title="Zoom In" arrow>
                  <IconButton
                    size="small"
                    onClick={handleZoomIn}
                    aria-label="Zoom in closer to roof"
                    sx={{ color: '#e2e8f0', p: 0.6 }}
                  >
                    <i className="fi fi-rr-plus" style={{ fontSize: '12px' }}></i>
                  </IconButton>
                </Tooltip>
                <Tooltip title="Zoom Out" arrow>
                  <IconButton
                    size="small"
                    onClick={handleZoomOut}
                    aria-label="Zoom out from roof"
                    sx={{ color: '#e2e8f0', p: 0.6 }}
                  >
                    <i className="fi fi-rr-minus" style={{ fontSize: '12px' }}></i>
                  </IconButton>
                </Tooltip>
              </Box>

              {/* Framing Toggle */}
              <Button
                variant="outlined"
                size="small"
                onClick={handleToggleSubstructure}
                sx={{
                  bgcolor: 'rgba(15, 23, 42, 0.85)',
                  borderColor: 'rgba(255, 255, 255, 0.15)',
                  color: '#e2e8f0',
                  fontWeight: 700,
                  fontSize: '0.75rem',
                  borderRadius: 2,
                  px: 1.4,
                  py: 0.5,
                  textTransform: 'none',
                  backdropFilter: 'blur(8px)',
                  '&:hover': {
                    bgcolor: 'rgba(15, 23, 42, 0.98)',
                    borderColor: 'rgba(255, 255, 255, 0.3)',
                  },
                }}
              >
                {showSubstructure ? 'Hide Timber Framing' : 'Show Timber Framing'}
              </Button>
            </Box>
          </>
        )}
      </DialogContent>

      {/* Bottom Interactive Customizer Bar */}
      {isProductSupported && matchedModel && (
        <Box
          sx={{
            p: { xs: 2, md: 2.2 },
            bgcolor: 'rgba(15, 23, 42, 0.98)',
            borderTop: '1px solid rgba(255, 255, 255, 0.08)',
            display: 'flex',
            flexDirection: { xs: 'column', md: 'row' },
            alignItems: { xs: 'stretch', md: 'center' },
            justifyContent: 'space-between',
            gap: 2,
            zIndex: 10,
          }}
        >
          {/* Controls: Thickness, Sheets & Color Swatches */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2.5, flexWrap: 'wrap' }}>
            {/* Thickness Selector */}
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Typography variant="caption" sx={{ color: '#94a3b8', fontWeight: 700, textTransform: 'uppercase' }}>
                Thickness:
              </Typography>
              <Stack direction="row" spacing={0.6}>
                {availableThicknesses.map((thick) => {
                  const isThickSelected = currentThickness.toLowerCase().trim() === thick.toLowerCase().trim();
                  return (
                    <Button
                      key={thick}
                      size="small"
                      onClick={() => handleSelectThickness(thick)}
                      sx={{
                        py: 0.35,
                        px: 1,
                        fontSize: '0.75rem',
                        fontWeight: 800,
                        borderRadius: 1.5,
                        minWidth: 0,
                        textTransform: 'none',
                        color: isThickSelected ? '#ffffff' : '#94a3b8',
                        bgcolor: isThickSelected ? 'primary.main' : 'rgba(30, 41, 59, 0.8)',
                        border: '1px solid',
                        borderColor: isThickSelected ? 'primary.light' : 'rgba(255, 255, 255, 0.1)',
                        '&:hover': {
                          bgcolor: isThickSelected ? 'primary.dark' : 'rgba(51, 65, 85, 0.8)',
                        },
                      }}
                    >
                      {thick}
                    </Button>
                  );
                })}
              </Stack>
            </Box>

            {/* Sheet Quantity Adjuster */}
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.2 }}>
              <Typography variant="caption" sx={{ color: '#94a3b8', fontWeight: 700, textTransform: 'uppercase' }}>
                Sheets:
              </Typography>
              <Box
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  bgcolor: 'rgba(30, 41, 59, 0.8)',
                  borderRadius: 2,
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                }}
              >
                <IconButton
                  size="small"
                  onClick={handleDecreaseSheets}
                  disabled={currentQty <= 1}
                  aria-label="Decrease sheet quantity"
                  sx={{ color: '#e2e8f0', p: 0.6 }}
                >
                  <i className="fi fi-rr-minus" style={{ fontSize: '11px' }}></i>
                </IconButton>
                <Typography
                  variant="body2"
                  fontWeight={800}
                  sx={{ color: '#ffffff', minWidth: 28, textAlign: 'center' }}
                >
                  {currentQty}
                </Typography>
                <IconButton
                  size="small"
                  onClick={handleIncreaseSheets}
                  aria-label="Increase sheet quantity"
                  sx={{ color: '#e2e8f0', p: 0.6 }}
                >
                  <i className="fi fi-rr-plus" style={{ fontSize: '11px' }}></i>
                </IconButton>
              </Box>
            </Box>

            {/* Real-time Color Picker Swatches matching Product Page exactly */}
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.2, flexWrap: 'wrap' }}>
              <Typography variant="caption" sx={{ color: '#94a3b8', fontWeight: 700, textTransform: 'uppercase' }}>
                Color: <span style={{ color: '#ffffff', textTransform: 'none', fontWeight: 800 }}>{currentColor}</span>
              </Typography>
              <Box
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 0.8,
                  flexWrap: 'wrap',
                }}
              >
                {colorList.map((colorName) => {
                  const hex = getColorHex(colorName);
                  const isSelected = currentColor.toLowerCase().trim() === colorName.toLowerCase().trim();
                  const inStock =
                    !coilInventory ||
                    coilInventory.length === 0 ||
                    isCoilInStock(coilInventory, currentThickness, colorName);

                  return (
                    <Tooltip
                      key={colorName}
                      title={
                        inStock
                          ? `${colorName} (In stock for ${currentThickness})`
                          : `${colorName} (Out of stock in ${currentThickness} coil inventory)`
                      }
                      arrow
                      placement="top"
                    >
                      <Box
                        onClick={() => handleSelectColor(colorName)}
                        sx={{
                          width: 28,
                          height: 28,
                          borderRadius: '50%',
                          bgcolor: hex,
                          border: isSelected
                            ? '3px solid #2563eb'
                            : '2px solid rgba(255, 255, 255, 0.25)',
                          boxShadow: isSelected
                            ? '0 0 0 2px rgba(37,99,235,0.4), 0 2px 8px rgba(0,0,0,0.4)'
                            : 'none',
                          opacity: inStock ? 1 : 0.28,
                          cursor: inStock ? 'pointer' : 'not-allowed',
                          flexShrink: 0,
                          transform: isSelected ? 'scale(1.15)' : 'scale(1)',
                          transition: 'all 0.15s ease',
                          position: 'relative',
                          overflow: 'hidden',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          '&:hover': {
                            transform: inStock ? 'scale(1.15)' : 'none',
                          },
                        }}
                      >
                        {!inStock && (
                          <Box
                            sx={{
                              position: 'absolute',
                              width: '140%',
                              height: '2px',
                              bgcolor: '#ef4444',
                              transform: 'rotate(-45deg)',
                              boxShadow: '0 0 2px rgba(0,0,0,0.6)',
                            }}
                          />
                        )}
                        {isSelected && inStock && (
                          <Box
                            sx={{
                              width: 7,
                              height: 7,
                              borderRadius: '50%',
                              bgcolor: '#ffffff',
                              boxShadow: '0 1px 2px rgba(0,0,0,0.6)',
                            }}
                          />
                        )}
                      </Box>
                    </Tooltip>
                  );
                })}
              </Box>
            </Box>
          </Box>

          {/* Action Buttons */}
          <Stack direction="row" spacing={1.5} alignItems="center">
            <Button
              variant="outlined"
              onClick={handleDiscardChanges}
              sx={{
                color: '#cbd5e1',
                borderColor: 'rgba(255, 255, 255, 0.2)',
                fontWeight: 700,
                borderRadius: 2,
                px: 2.5,
                textTransform: 'none',
                '&:hover': {
                  borderColor: 'rgba(255, 255, 255, 0.4)',
                  bgcolor: 'rgba(255, 255, 255, 0.05)',
                },
              }}
            >
              Cancel
            </Button>
            <Button
              variant="contained"
              color="primary"
              onClick={handleApplyChangesToOrder}
              sx={{
                fontWeight: 800,
                borderRadius: 2,
                px: 3,
                textTransform: 'none',
                boxShadow: '0 4px 16px rgba(79, 119, 45, 0.4)',
              }}
            >
              Apply Changes to Order
            </Button>
          </Stack>
        </Box>
      )}
    </Dialog>
  );
};

export default Product3DViewerModal;
