import React, { useEffect, useState, useMemo, Suspense } from 'react';
import { Box, Typography, Paper, Button, IconButton, Tooltip, CircularProgress } from '@mui/material';
import { Canvas, useThree } from '@react-three/fiber';
import { OrbitControls, Environment, ContactShadows } from '@react-three/drei';
import * as THREE from 'three';
import ConfigurableRoofModel from '../ConfigurableRoofModel';
import InternalStructureControlPanel from '../InternalStructureControlPanel';
import FloatingStructuralMemberInspector from '../FloatingStructuralMemberInspector';
import GuideHiddenObjectsAssistant from '../GuideHiddenObjectsAssistant';

// Local error boundary isolating WebGL or GLTF loading failures from crashing the entire app
class Studio3DErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch() {
    if (this.props.onError) {
      this.props.onError();
    }
  }

  componentDidUpdate(prevProps) {
    if (prevProps.resetKey !== this.props.resetKey && this.state.hasError) {
      this.setState({ hasError: false });
    }
  }

  render() {
    if (this.state.hasError) {
      return (
        <Box
          sx={{
            height: '100%',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            p: 4,
            bgcolor: '#0f172a',
            color: '#f8fafc',
            textAlign: 'center',
            gap: 2,
          }}
        >
          <Typography variant="h6" fontWeight={800}>
            Unable to Render 3D House Model
          </Typography>
          <Typography variant="body2" sx={{ color: '#94a3b8', maxWidth: 440 }}>
            The 3D graphics engine encountered a loading interruption. Retry loading the model or exit back to the store.
          </Typography>
          <Box sx={{ display: 'flex', gap: 1.5 }}>
            <Button
              variant="contained"
              color="primary"
              onClick={() => {
                this.setState({ hasError: false });
                if (this.props.onRetry) this.props.onRetry();
              }}
              sx={{ borderRadius: 2, fontWeight: 700, textTransform: 'none' }}
            >
              Retry 3D View
            </Button>
            {this.props.onExitStudio && (
              <Button
                variant="outlined"
                onClick={this.props.onExitStudio}
                sx={{ borderRadius: 2, fontWeight: 700, textTransform: 'none', color: '#cbd5e1', borderColor: 'rgba(255,255,255,0.25)' }}
              >
                Exit 3D Studio
              </Button>
            )}
          </Box>
        </Box>
      );
    }
    return this.props.children;
  }
}

// Silent boundary so remote HDRI CDN hiccups never block the 3D house from rendering
class EnvironmentFallbackBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { failed: false };
  }

  static getDerivedStateFromError() {
    return { failed: true };
  }

  render() {
    if (this.state.failed) return null;
    return this.props.children;
  }
}

// Fires after the GLB Suspense child mounts and renders onto the WebGL canvas
const ModelReadyNotifier = ({ modelPath, onReady }) => {
  useEffect(() => {
    if (!onReady || !modelPath) return;
    let raf1 = 0;
    let raf2 = 0;
    raf1 = requestAnimationFrame(() => {
      raf2 = requestAnimationFrame(() => {
        onReady(modelPath);
      });
    });
    return () => {
      cancelAnimationFrame(raf1);
      cancelAnimationFrame(raf2);
    };
  }, [modelPath, onReady]);

  return null;
};

const StudioTouchpadHandler = ({ orbitControlsRef, enabled = true }) => {
  const { gl, camera } = useThree();

  useEffect(() => {
    const domElement = gl?.domElement;
    if (!domElement || !enabled) return;

    const handleWheel = (e) => {
      const controls = orbitControlsRef?.current;
      if (!controls) return;

      e.preventDefault();
      e.stopPropagation();

      if (e.ctrlKey) {
        const zoomDelta = e.deltaY * 0.005;
        const factor = Math.max(0.85, Math.min(1.15, 1 + zoomDelta));
        const target = controls.target;
        const offset = camera.position.clone().sub(target);
        const newDist = offset.length() * factor;
        const minDist = controls.minDistance || 0.35;
        const maxDist = controls.maxDistance || 24;

        if (newDist >= minDist && newDist <= maxDist) {
          offset.multiplyScalar(factor);
          camera.position.copy(target).add(offset);
          controls.update();
        }
        return;
      }

      const currentAzimuth = controls.getAzimuthalAngle();
      const currentPolar = controls.getPolarAngle();
      const newAzimuth = currentAzimuth - e.deltaX * 0.0035;
      const maxPolar = controls.maxPolarAngle || Math.PI / 2 - 0.05;
      const minPolar = controls.minPolarAngle || 0.05;
      const newPolar = Math.max(minPolar, Math.min(maxPolar, currentPolar + e.deltaY * 0.0035));

      controls.setAzimuthalAngle(newAzimuth);
      controls.setPolarAngle(newPolar);
      controls.update();
    };

    domElement.addEventListener('wheel', handleWheel, { passive: false });
    return () => domElement.removeEventListener('wheel', handleWheel);
  }, [gl, camera, orbitControlsRef, enabled]);

  return null;
};

// Interactive 3D Canvas Viewport with loading banner overlay, camera presets, structure explorer, and part inspector
const StudioViewportCanvas = ({
  activeModel,
  isModelLoading = false,
  onModelLoaded,
  orbitControlsRef,
  effectiveSheetQty,
  colorHex,
  currentColor,
  currentThickness,
  showSubstructure,
  onToggleSubstructure,
  layerVisibility,
  onToggleLayerVisibility,
  onIsolateInternalStructure,
  onRestoreAllLayers,
  structurePanelOpen,
  onToggleStructurePanel,
  explodeFactor,
  onChangeExplodeFactor,
  xraySheets,
  onToggleXraySheets,
  selectedMeshName,
  onSelectMeshPart,
  onClearSelectedMesh,
  viewFullRoof,
  onToggleFullRoofPreview,
  touchpadControlsEnabled,
  onToggleTouchpadControls,
  isInspectEdgeActive,
  inspectEdgeTrigger,
  onSetCameraView,
  onRotateCameraStep,
  onZoomIn,
  onZoomOut,
  onExitStudio,
}) => {
  const [contextLost, setContextLost] = useState(false);
  const [hasRenderError, setHasRenderError] = useState(false);

  const orbitTarget = useMemo(
    () => [0, activeModel.cameraTargetY ?? 2.3, 0],
    [activeModel.cameraTargetY]
  );

  useEffect(() => {
    setHasRenderError(false);
  }, [activeModel.modelPath]);

  return (
    <Box
      sx={{
        flex: 1,
        position: 'relative',
        overflow: 'hidden',
        minHeight: 0,
        background: 'linear-gradient(180deg, #1e293b 0%, #0f172a 100%)',
      }}
    >
      {contextLost ? (
        <Box
          sx={{
            height: '100%',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            p: 4,
            bgcolor: '#0f172a',
            color: '#f8fafc',
            textAlign: 'center',
            gap: 2,
          }}
        >
          <Typography variant="h6" fontWeight={800}>
            3D Graphics Context Paused
          </Typography>
          <Typography variant="body2" sx={{ color: '#94a3b8', maxWidth: 420 }}>
            Your browser paused the 3D graphics view to free memory. Restore the 3D view to continue customizing.
          </Typography>
          <Button
            variant="contained"
            color="primary"
            onClick={() => setContextLost(false)}
            sx={{ borderRadius: 2, fontWeight: 700, textTransform: 'none' }}
          >
            Restore 3D View
          </Button>
        </Box>
      ) : (
        <Studio3DErrorBoundary
          resetKey={activeModel.modelPath}
          onExitStudio={onExitStudio}
          onError={() => setHasRenderError(true)}
          onRetry={() => setHasRenderError(false)}
        >
          <Canvas
            shadows
            camera={{ position: activeModel.cameraDefaultPos || [5.6, 3.8, 5.6], fov: 35, near: 0.1, far: 100 }}
            style={{ width: '100%', height: '100%', background: 'linear-gradient(180deg, #1e293b 0%, #0f172a 100%)' }}
            gl={{ antialias: true, alpha: true, powerPreference: 'high-performance' }}
            onCreated={({ gl }) => {
              gl.domElement.addEventListener('webglcontextlost', (e) => {
                e.preventDefault();
                setContextLost(true);
              });
            }}
          >
            <color attach="background" args={['#131d31']} />
            <ambientLight intensity={0.75} />
            <hemisphereLight args={['#e2e8f0', '#334155', 0.8]} />
            <directionalLight
              position={[12, 18, 12]}
              intensity={1.45}
              castShadow
              shadow-mapSize-width={2048}
              shadow-mapSize-height={2048}
            />
            <directionalLight position={[-8, 10, -8]} intensity={0.6} />

            {/* Keep Environment inside its own Suspense + error boundary so HDRI loading never blocks the house */}
            <EnvironmentFallbackBoundary>
              <Suspense fallback={null}>
                <Environment preset="city" />
              </Suspense>
            </EnvironmentFallbackBoundary>

            <ContactShadows position={[0, -0.01, 0]} opacity={0.5} scale={24} blur={2.2} far={10} />

            <Suspense fallback={null}>
              <ConfigurableRoofModel
                key={activeModel.modelPath}
                modelPath={activeModel.modelPath}
                sheetQty={effectiveSheetQty}
                roofColorHex={colorHex}
                thickness={currentThickness}
                showSubstructure={showSubstructure}
                showSheets={true}
                layerVisibility={layerVisibility}
                explodeFactor={explodeFactor}
                xraySheets={xraySheets}
                selectedMeshName={selectedMeshName}
                onSelectMesh={onSelectMeshPart}
              />
              <ModelReadyNotifier modelPath={activeModel.modelPath} onReady={onModelLoaded} />
            </Suspense>

            <OrbitControls
              ref={orbitControlsRef}
              makeDefault
              enableDamping
              dampingFactor={0.06}
              target={orbitTarget}
              maxPolarAngle={Math.PI / 2 - 0.05}
              minDistance={0.35}
              maxDistance={activeModel.maxCameraDistance || 24}
            />

            <StudioTouchpadHandler orbitControlsRef={orbitControlsRef} enabled={touchpadControlsEnabled} />
          </Canvas>
        </Studio3DErrorBoundary>
      )}

      {/* Prominent HTML Loading Banner whenever a house or roof 3D asset is still downloading/mounting */}
      {isModelLoading && !contextLost && !hasRenderError && (
        <Box
          sx={{
            position: 'absolute',
            inset: 0,
            zIndex: 30,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            bgcolor: 'rgba(11, 17, 32, 0.82)',
            backdropFilter: 'blur(8px)',
            p: 3,
          }}
        >
          <Paper
            elevation={0}
            sx={{
              px: 4,
              py: 3,
              borderRadius: 3.5,
              bgcolor: 'rgba(15, 23, 42, 0.96)',
              border: '1px solid rgba(74, 222, 128, 0.35)',
              boxShadow: '0 20px 50px rgba(0, 0, 0, 0.55)',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              textAlign: 'center',
              gap: 1.5,
              maxWidth: 420,
            }}
          >
            <CircularProgress size={42} sx={{ color: '#4ade80' }} />
            <Typography variant="subtitle1" fontWeight={800} sx={{ color: '#f8fafc' }}>
              Loading 3D Model: {activeModel.shortLabel}
            </Typography>
            <Typography variant="body2" sx={{ color: '#94a3b8', lineHeight: 1.5 }}>
              Preparing <strong style={{ color: '#86efac' }}>{activeModel.profileName}</strong> roof panels, trusses, and framing layers. Please wait...
            </Typography>
          </Paper>
        </Box>
      )}

      {/* Top-Left Coverage HUD */}
      <Box sx={{ position: 'absolute', top: 16, left: 16, zIndex: 5 }}>
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
            {activeModel.name.toUpperCase()} • {activeModel.profileName.toUpperCase()}
          </Typography>
          <Typography variant="subtitle2" fontWeight={800} sx={{ color: '#4ade80' }}>
            {effectiveSheetQty} of {activeModel.totalSheets} sheets installed (
            {Math.min(100, Math.round((effectiveSheetQty / activeModel.totalSheets) * 100))}%)
          </Typography>
          {effectiveSheetQty < activeModel.totalSheets ? (
            <Typography variant="caption" sx={{ color: '#fde047', display: 'block', mt: 0.25 }}>
              {activeModel.totalSheets - effectiveSheetQty} sheet slots exposed to purlins
            </Typography>
          ) : (
            <Typography variant="caption" sx={{ color: '#86efac', display: 'block', mt: 0.25 }}>
              Complete roof coverage ({currentColor})
            </Typography>
          )}
          <Box sx={{ mt: 1 }}>
            <Button
              size="small"
              onClick={onToggleFullRoofPreview}
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
              {viewFullRoof
                ? `Previewing Full Roof (${activeModel.totalSheets} Sheets)`
                : `Preview Full Roof (${activeModel.totalSheets} Sheets)`}
            </Button>
          </Box>
          <Typography variant="caption" sx={{ color: '#64748b', display: 'block', mt: 0.6, fontSize: '0.68rem' }}>
            Rotate: Drag or 2-finger touchpad swipe • Zoom: Scroll wheel or pinch
          </Typography>
        </Paper>
      </Box>

      {/* Top-Right Camera Presets & Framing Toolbar */}
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
          {[
            { id: 'default', label: 'Default View', color: '#e2e8f0' },
            { id: 'front', label: 'Front Slope', color: '#e2e8f0' },
            { id: 'top', label: 'Roof Top', color: '#e2e8f0' },
            { id: 'edge', label: 'Inspect Sheet Edge', color: '#86efac' },
            { id: 'internal', label: 'Internal Truss View', color: '#38bdf8' },
          ].map((preset) => (
            <Button
              key={preset.id}
              size="small"
              onClick={() => onSetCameraView(preset.id)}
              sx={{
                color: preset.color,
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
              {preset.label}
            </Button>
          ))}
        </Box>

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
          <Tooltip title="Rotate Left 30°" arrow>
            <IconButton size="small" onClick={() => onRotateCameraStep(-30)} aria-label="Rotate camera left" sx={{ color: '#e2e8f0', p: 0.6 }}>
              <i className="fi fi-rr-undo" style={{ fontSize: '12px' }}></i>
            </IconButton>
          </Tooltip>
          <Tooltip title="Rotate Right 30°" arrow>
            <IconButton size="small" onClick={() => onRotateCameraStep(30)} aria-label="Rotate camera right" sx={{ color: '#e2e8f0', p: 0.6 }}>
              <i className="fi fi-rr-redo" style={{ fontSize: '12px' }}></i>
            </IconButton>
          </Tooltip>
          <Tooltip title="Zoom In" arrow>
            <IconButton size="small" onClick={onZoomIn} aria-label="Zoom in closer" sx={{ color: '#e2e8f0', p: 0.6 }}>
              <i className="fi fi-rr-plus" style={{ fontSize: '12px' }}></i>
            </IconButton>
          </Tooltip>
          <Tooltip title="Zoom Out" arrow>
            <IconButton size="small" onClick={onZoomOut} aria-label="Zoom out" sx={{ color: '#e2e8f0', p: 0.6 }}>
              <i className="fi fi-rr-minus" style={{ fontSize: '12px' }}></i>
            </IconButton>
          </Tooltip>
        </Box>

        <Button
          variant="outlined"
          size="small"
          onClick={onToggleTouchpadControls}
          sx={{
            bgcolor: touchpadControlsEnabled ? 'rgba(56, 189, 248, 0.2)' : 'rgba(15, 23, 42, 0.85)',
            borderColor: touchpadControlsEnabled ? '#38bdf8' : 'rgba(255, 255, 255, 0.15)',
            color: touchpadControlsEnabled ? '#38bdf8' : '#e2e8f0',
            fontWeight: 700,
            fontSize: '0.75rem',
            borderRadius: 2,
            px: 1.2,
            py: 0.5,
            textTransform: 'none',
            backdropFilter: 'blur(8px)',
          }}
        >
          {touchpadControlsEnabled ? 'Touchpad: On' : 'Touchpad: Off'}
        </Button>

        <Button
          variant="outlined"
          size="small"
          onClick={onToggleSubstructure}
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
          }}
        >
          {showSubstructure ? 'Hide Timber Framing' : 'Show Timber Framing'}
        </Button>
      </Box>

      {/* Internal 7-Layer Structure Explorer */}
      <InternalStructureControlPanel
        open={structurePanelOpen}
        onToggleOpen={onToggleStructurePanel}
        layerVisibility={layerVisibility}
        onToggleLayer={onToggleLayerVisibility}
        onIsolateInternalStructure={onIsolateInternalStructure}
        onRestoreAllLayers={onRestoreAllLayers}
        explodeFactor={explodeFactor}
        onChangeExplodeFactor={onChangeExplodeFactor}
        xraySheets={xraySheets}
        onToggleXraySheets={onToggleXraySheets}
        selectedMeshName={selectedMeshName}
        onClearSelectedMesh={onClearSelectedMesh}
        currentThickness={currentThickness}
        currentColor={currentColor}
        sheetsPerSlope={activeModel.sheetsPerSlope || 8}
        currentLength={activeModel.recommendedLength}
        productName={activeModel.profileName}
        onFocusInternalCamera={() => onSetCameraView('internal')}
      />

      {/* Guide for Hidden Structural Layers */}
      <GuideHiddenObjectsAssistant
        layerVisibility={layerVisibility}
        showSubstructure={showSubstructure}
        onToggleLayer={onToggleLayerVisibility}
        onRestoreAllLayers={onRestoreAllLayers}
        onToggleSubstructure={onToggleSubstructure}
        isInspectEdgeActive={isInspectEdgeActive}
        inspectEdgeTrigger={inspectEdgeTrigger}
        productName={activeModel.profileName}
      />

      {/* Floating Part Inspector HUD */}
      <FloatingStructuralMemberInspector
        selectedMeshName={selectedMeshName}
        onClear={onClearSelectedMesh}
        currentThickness={currentThickness}
        currentColor={currentColor}
        sheetsPerSlope={activeModel.sheetsPerSlope || 8}
        currentLength={activeModel.recommendedLength}
        productName={activeModel.profileName}
      />
    </Box>
  );
};

export default StudioViewportCanvas;
