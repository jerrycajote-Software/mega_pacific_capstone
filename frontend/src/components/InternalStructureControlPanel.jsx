import React from 'react';
import {
  Box,
  Typography,
  Paper,
  Button,
  Slider,
  Switch,
  Stack,
  Chip,
  Divider,
} from '@mui/material';
import {
  ROOF_STRUCTURAL_LAYERS,
  getStructuralMeshMetadata,
} from '../constants/roofStructureSpecs';

/**
 * Interactive 3D Internal Roof Structure Control Panel & Part Inspector HUD
 * Allows users to:
 * 1. Switch between Standard Roof View, X-Ray Translucent Mode, and Exploded 3D Assembly
 * 2. Smoothly slide the 3D Explode Assembly factor from 0% to 100%
 * 3. Toggle or isolate any of the 7 structural roof layers in real time
 * 4. Inspect dimensions, materials, and structural roles of any clicked 3D member
 */
const InternalStructureControlPanel = ({
  open,
  onToggleOpen,
  layerVisibility,
  onToggleLayer,
  onIsolateInternalStructure,
  onRestoreAllLayers,
  explodeFactor,
  onChangeExplodeFactor,
  xraySheets,
  onToggleXraySheets,
  selectedMeshName,
  onClearSelectedMesh,
  currentThickness,
  currentColor,
  sheetsPerSlope = 8,
  currentLength = 3.8,
  onFocusInternalCamera,
}) => {
  const inspectedPart = getStructuralMeshMetadata(selectedMeshName, {
    thickness: currentThickness,
    color: currentColor,
    sheetsPerSlope,
    length: currentLength,
  });

  const explodePercent = Math.round((Number(explodeFactor) || 0) * 100);

  const handleSliderChange = (_, newVal) => {
    const val = Array.isArray(newVal) ? newVal[0] : newVal;
    onChangeExplodeFactor(val / 100);
  };

  if (!open) {
    return (
      <Box
        sx={{
          position: 'absolute',
          bottom: 16,
          left: 16,
          zIndex: 6,
          display: 'flex',
          flexDirection: 'column',
          gap: 1,
          maxWidth: 340,
        }}
      >
        <Button
          variant="contained"
          onClick={onToggleOpen}
          sx={{
            bgcolor: 'rgba(15, 23, 42, 0.92)',
            color: '#38bdf8',
            border: '1px solid rgba(56, 189, 248, 0.4)',
            fontWeight: 800,
            fontSize: '0.78rem',
            borderRadius: 2.5,
            px: 2,
            py: 1,
            textTransform: 'none',
            backdropFilter: 'blur(8px)',
            boxShadow: '0 8px 20px rgba(0,0,0,0.4)',
            '&:hover': {
              bgcolor: 'rgba(30, 41, 59, 0.98)',
              borderColor: 'rgba(56, 189, 248, 0.7)',
            },
          }}
        >
          Explore Internal Roof Structure
        </Button>
      </Box>
    );
  }

  return (
    <Paper
      elevation={0}
      sx={{
        position: 'absolute',
        bottom: 16,
        left: 16,
        zIndex: 6,
        width: { xs: 'calc(100% - 32px)', sm: 360 },
        maxHeight: 'calc(100% - 175px)',
        overflowY: 'auto',
        p: 2,
        borderRadius: 3,
        bgcolor: 'rgba(15, 23, 42, 0.94)',
        border: '1px solid rgba(56, 189, 248, 0.35)',
        backdropFilter: 'blur(12px)',
        color: '#f8fafc',
        boxShadow: '0 16px 40px rgba(0,0,0,0.55)',
      }}
    >
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
        <Box>
          <Typography variant="caption" sx={{ color: '#38bdf8', fontWeight: 800, letterSpacing: '0.05em' }}>
            3D STRUCTURAL ENGINEERING
          </Typography>
          <Typography variant="subtitle2" fontWeight={800} sx={{ color: '#ffffff' }}>
            Internal Roof Structure Explorer
          </Typography>
        </Box>
        <Button
          size="small"
          onClick={onToggleOpen}
          sx={{
            color: '#94a3b8',
            fontSize: '0.72rem',
            fontWeight: 700,
            minWidth: 0,
            px: 1,
            py: 0.3,
            textTransform: 'none',
            '&:hover': { color: '#ffffff', bgcolor: 'rgba(255,255,255,0.08)' },
          }}
        >
          Minimize Panel
        </Button>
      </Box>

      {/* Quick Structural Presets */}
      <Stack direction="row" spacing={0.8} sx={{ mb: 1.5, flexWrap: 'wrap', gap: 0.6 }}>
        <Button
          size="small"
          onClick={onIsolateInternalStructure}
          sx={{
            flex: 1,
            py: 0.45,
            px: 1,
            fontSize: '0.7rem',
            fontWeight: 700,
            borderRadius: 1.5,
            textTransform: 'none',
            color: '#fbbf24',
            bgcolor: 'rgba(251, 191, 36, 0.12)',
            border: '1px solid rgba(251, 191, 36, 0.35)',
            '&:hover': { bgcolor: 'rgba(251, 191, 36, 0.22)' },
          }}
        >
          Isolate Internal Framing
        </Button>
        <Button
          size="small"
          onClick={onFocusInternalCamera}
          sx={{
            flex: 1,
            py: 0.45,
            px: 1,
            fontSize: '0.7rem',
            fontWeight: 700,
            borderRadius: 1.5,
            textTransform: 'none',
            color: '#38bdf8',
            bgcolor: 'rgba(56, 189, 248, 0.12)',
            border: '1px solid rgba(56, 189, 248, 0.35)',
            '&:hover': { bgcolor: 'rgba(56, 189, 248, 0.22)' },
          }}
        >
          View Inside Attic Trusses
        </Button>
        <Button
          size="small"
          onClick={onRestoreAllLayers}
          sx={{
            py: 0.45,
            px: 1,
            fontSize: '0.7rem',
            fontWeight: 700,
            borderRadius: 1.5,
            textTransform: 'none',
            color: '#cbd5e1',
            bgcolor: 'rgba(255, 255, 255, 0.06)',
            border: '1px solid rgba(255, 255, 255, 0.15)',
            '&:hover': { bgcolor: 'rgba(255, 255, 255, 0.14)' },
          }}
        >
          Reset All
        </Button>
      </Stack>

      {/* X-Ray & Exploded View Controls */}
      <Box
        sx={{
          p: 1.25,
          borderRadius: 2,
          bgcolor: 'rgba(30, 41, 59, 0.7)',
          border: '1px solid rgba(255, 255, 255, 0.08)',
          mb: 1.5,
        }}
      >
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 0.75 }}>
          <Box>
            <Typography variant="caption" fontWeight={800} sx={{ color: '#e2e8f0', display: 'block' }}>
              X-Ray Translucent Roof Mode
            </Typography>
            <Typography variant="caption" sx={{ color: '#94a3b8', fontSize: '0.67rem' }}>
              See purlins & trusses through installed sheets
            </Typography>
          </Box>
          <Switch
            size="small"
            checked={Boolean(xraySheets)}
            onChange={onToggleXraySheets}
            inputProps={{ 'aria-label': 'Toggle X-Ray Translucent Roof Mode' }}
          />
        </Box>

        <Divider sx={{ borderColor: 'rgba(255,255,255,0.08)', my: 0.8 }} />

        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="caption" fontWeight={800} sx={{ color: '#e2e8f0' }}>
            Explode 3D Roof Assembly
          </Typography>
          <Typography variant="caption" fontWeight={800} sx={{ color: '#38bdf8' }}>
            {explodePercent}%
          </Typography>
        </Box>
        <Slider
          size="small"
          value={explodePercent}
          min={0}
          max={100}
          step={1}
          onChange={handleSliderChange}
          aria-label="Explode 3D Roof Assembly Slider"
          sx={{
            color: '#38bdf8',
            py: 0.8,
            '& .MuiSlider-thumb': { width: 14, height: 14 },
          }}
        />
        <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
          <Typography variant="caption" sx={{ color: '#64748b', fontSize: '0.65rem' }}>
            Assembled (0%)
          </Typography>
          <Typography variant="caption" sx={{ color: '#64748b', fontSize: '0.65rem' }}>
            Separated Layers (100%)
          </Typography>
        </Box>
      </Box>

      {/* 7 Structural Layers Toggle List */}
      <Typography variant="caption" sx={{ color: '#94a3b8', fontWeight: 800, display: 'block', mb: 0.75 }}>
        ROOF ASSEMBLY LAYERS (TOP TO BOTTOM)
      </Typography>
      <Stack spacing={0.5} sx={{ mb: 1.5 }}>
        {ROOF_STRUCTURAL_LAYERS.map((layer) => {
          const isVisible = layerVisibility?.[layer.id] !== false;
          return (
            <Box
              key={layer.id}
              onClick={() => onToggleLayer(layer.id)}
              sx={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                px: 1.1,
                py: 0.55,
                borderRadius: 1.5,
                cursor: 'pointer',
                bgcolor: isVisible ? 'rgba(30, 41, 59, 0.85)' : 'rgba(15, 23, 42, 0.5)',
                border: '1px solid',
                borderColor: isVisible ? 'rgba(255, 255, 255, 0.12)' : 'rgba(255, 255, 255, 0.04)',
                opacity: isVisible ? 1 : 0.55,
                transition: 'all 0.15s ease',
                '&:hover': {
                  borderColor: 'rgba(56, 189, 248, 0.45)',
                },
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Box
                  sx={{
                    width: 9,
                    height: 9,
                    borderRadius: '50%',
                    bgcolor: layer.badgeColor,
                    boxShadow: isVisible ? `0 0 6px ${layer.badgeColor}` : 'none',
                  }}
                />
                <Typography variant="caption" fontWeight={700} sx={{ color: '#f1f5f9', fontSize: '0.73rem' }}>
                  {layer.label}
                </Typography>
              </Box>
              <Chip
                label={isVisible ? 'Visible' : 'Hidden'}
                size="small"
                sx={{
                  height: 18,
                  fontSize: '0.64rem',
                  fontWeight: 800,
                  bgcolor: isVisible ? 'rgba(74, 222, 128, 0.16)' : 'rgba(148, 163, 184, 0.15)',
                  color: isVisible ? '#4ade80' : '#94a3b8',
                }}
              />
            </Box>
          );
        })}
      </Stack>

      {/* 3D Part Inspector Hint */}
      <Box
        sx={{
          p: 1.25,
          borderRadius: 2,
          bgcolor: 'rgba(30, 41, 59, 0.55)',
          border: '1px solid rgba(255, 255, 255, 0.08)',
        }}
      >
        <Typography variant="caption" sx={{ color: '#94a3b8', display: 'block', lineHeight: 1.45 }}>
          Tip: Click directly on any 3D truss rafter, king post, purlin, underlayment, or roof sheet in the 3D viewport to inspect its floating specifications.
        </Typography>
      </Box>
    </Paper>
  );
};

export default InternalStructureControlPanel;

