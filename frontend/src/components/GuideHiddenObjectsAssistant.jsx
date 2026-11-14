import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  Button,
  Chip,
  Collapse,
} from '@mui/material';
import { getRoofStructuralLayers } from '../constants/roofStructureSpecs';

const GuideHiddenObjectsAssistant = ({
  layerVisibility = {},
  showSubstructure = true,
  onToggleLayer,
  onRestoreAllLayers,
  onToggleSubstructure,
  isInspectEdgeActive = false,
  inspectEdgeTrigger = 0,
  productName = '',
}) => {
  const [isExpanded, setIsExpanded] = useState(false);

  // Identify all layers currently toggled off
  const structuralLayers = getRoofStructuralLayers(productName);
  const hiddenLayers = structuralLayers.filter((layer) => {
    return layerVisibility[layer.id] === false;
  });

  const isTrimsFlashingHidden = layerVisibility.trims_flashing === false;
  const isTimberFramingHidden = !showSubstructure;
  const hasAnyHidden = hiddenLayers.length > 0 || isTimberFramingHidden;
  const needsTrimsHiddenForEdge = isInspectEdgeActive && !isTrimsFlashingHidden;

  // Auto-expand whenever a structural element is hidden
  useEffect(() => {
    if (hasAnyHidden) {
      setIsExpanded(true);
    }
  }, [hasAnyHidden]);

  // Auto-expand whenever Inspect Sheet Edge is triggered
  useEffect(() => {
    if (inspectEdgeTrigger > 0) {
      setIsExpanded(true);
    }
  }, [inspectEdgeTrigger]);

  const handleMakeLayerVisible = (layerId) => {
    if (onToggleLayer) {
      onToggleLayer(layerId);
    }
  };

  const handleRestoreAllHiddenLayers = () => {
    if (onRestoreAllLayers) {
      onRestoreAllLayers();
    }
    if (isTimberFramingHidden && onToggleSubstructure) {
      onToggleSubstructure();
    }
  };

  const handleToggleGuideExpand = () => {
    setIsExpanded((prev) => !prev);
  };

  return (
    <Box
      sx={{
        position: 'absolute',
        top: { xs: 62, sm: 64 },
        right: 16,
        zIndex: 25,
        width: { xs: 'calc(100% - 32px)', sm: 'auto' },
        maxWidth: { xs: 'calc(100% - 32px)', sm: 340, md: 360 },
        pointerEvents: 'auto',
        animation: 'fadeInRight 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
        '@keyframes fadeInRight': {
          from: { opacity: 0, transform: 'translateX(12px)' },
          to: { opacity: 1, transform: 'translateX(0)' },
        },
      }}
    >
      <Paper
        elevation={0}
        sx={{
          borderRadius: 3,
          p: 1.2,
          px: 1.5,
          bgcolor: (needsTrimsHiddenForEdge || hasAnyHidden)
            ? 'rgba(15, 23, 42, 0.95)'
            : 'rgba(15, 23, 42, 0.88)',
          border: '1.5px solid',
          borderColor: needsTrimsHiddenForEdge
            ? 'rgba(56, 189, 248, 0.65)'
            : hasAnyHidden
            ? 'rgba(251, 191, 36, 0.65)'
            : 'rgba(56, 189, 248, 0.25)',
          backdropFilter: 'blur(16px)',
          color: '#ffffff',
          boxShadow: needsTrimsHiddenForEdge
            ? '0 16px 36px rgba(0, 0, 0, 0.65), 0 0 20px rgba(56, 189, 248, 0.2)'
            : hasAnyHidden
            ? '0 16px 36px rgba(0, 0, 0, 0.65), 0 0 20px rgba(251, 191, 36, 0.2)'
            : '0 8px 24px rgba(0, 0, 0, 0.45)',
          transition: 'all 0.25s ease',
        }}
      >
        {/* Header Bar */}
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            gap: 1,
            cursor: 'pointer',
          }}
          onClick={handleToggleGuideExpand}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.8, flexWrap: 'wrap' }}>
            <Chip
              label={
                needsTrimsHiddenForEdge
                  ? '3D Guide: Recommendation'
                  : isInspectEdgeActive && isTrimsFlashingHidden
                  ? '3D Guide: Sheet Edge'
                  : hasAnyHidden
                  ? '3D Guide: Hidden Layer Alert'
                  : '3D Guide'
              }
              size="small"
              sx={{
                height: 20,
                fontSize: '0.65rem',
                fontWeight: 800,
                bgcolor: needsTrimsHiddenForEdge || (isInspectEdgeActive && isTrimsFlashingHidden)
                  ? 'rgba(56, 189, 248, 0.2)'
                  : hasAnyHidden
                  ? 'rgba(251, 191, 36, 0.2)'
                  : 'rgba(56, 189, 248, 0.18)',
                color: needsTrimsHiddenForEdge || (isInspectEdgeActive && isTrimsFlashingHidden)
                  ? '#38bdf8'
                  : hasAnyHidden
                  ? '#fde047'
                  : '#38bdf8',
                border: needsTrimsHiddenForEdge || (isInspectEdgeActive && isTrimsFlashingHidden)
                  ? '1px solid rgba(56, 189, 248, 0.4)'
                  : hasAnyHidden
                  ? '1px solid rgba(251, 191, 36, 0.4)'
                  : 'none',
                borderRadius: 1,
                '& .MuiChip-label': { px: 0.8 },
              }}
            />

            {needsTrimsHiddenForEdge ? (
              <Typography
                variant="caption"
                sx={{
                  color: '#38bdf8',
                  fontWeight: 800,
                  fontSize: '0.72rem',
                }}
              >
                Hide Flashings to Inspect Edge
              </Typography>
            ) : isInspectEdgeActive && isTrimsFlashingHidden ? (
              <Typography
                variant="caption"
                sx={{
                  color: '#4ade80',
                  fontWeight: 800,
                  fontSize: '0.72rem',
                }}
              >
                Sheet Edge Visible
              </Typography>
            ) : hasAnyHidden ? (
              <Typography
                variant="caption"
                sx={{
                  color: '#fde047',
                  fontWeight: 800,
                  fontSize: '0.72rem',
                }}
              >
                {hiddenLayers.length > 0
                  ? `${hiddenLayers.length} Layer${hiddenLayers.length > 1 ? 's' : ''} Hidden`
                  : 'Timber Framing Hidden'}
              </Typography>
            ) : (
              <Typography
                variant="caption"
                sx={{
                  color: '#94a3b8',
                  fontWeight: 700,
                  fontSize: '0.7rem',
                }}
              >
                All 7 Layers Visible
              </Typography>
            )}
          </Box>

          <Button
            size="small"
            sx={{
              minWidth: 0,
              p: 0.2,
              px: 0.8,
              fontSize: '0.68rem',
              fontWeight: 700,
              color: '#94a3b8',
              textTransform: 'none',
            }}
          >
            {isExpanded ? 'Collapse' : 'Expand'}
          </Button>
        </Box>

        {/* Expandable Guide Content */}
        <Collapse in={isExpanded}>
          <Box sx={{ mt: 1.2 }}>
            {/* Sheet Edge Specific Guidance */}
            {needsTrimsHiddenForEdge ? (
              <Box>
                <Typography
                  variant="subtitle2"
                  sx={{
                    fontWeight: 800,
                    fontSize: '0.85rem',
                    color: '#38bdf8',
                    mb: 0.4,
                  }}
                >
                  Hide Ridge Cap, Flashings & Gutters
                </Typography>
                <Typography
                  variant="caption"
                  sx={{
                    color: '#cbd5e1',
                    display: 'block',
                    lineHeight: 1.45,
                    fontSize: '0.74rem',
                    mb: 1.2,
                  }}
                >
                  To see the roofing sheet edge clearly, please hide the Ridge Cap, Flashings & Gutters first so they do not cover the edge.
                </Typography>

                <Button
                  variant="contained"
                  color="primary"
                  size="small"
                  fullWidth
                  onClick={() => handleMakeLayerVisible('trims_flashing')}
                  sx={{
                    py: 0.7,
                    fontWeight: 800,
                    fontSize: '0.78rem',
                    textTransform: 'none',
                    borderRadius: 1.8,
                    boxShadow: '0 4px 14px rgba(79, 119, 45, 0.4)',
                  }}
                >
                  Hide Ridge Cap, Flashings & Gutters
                </Button>
              </Box>
            ) : isInspectEdgeActive && isTrimsFlashingHidden ? (
              <Box sx={{ mb: hasAnyHidden && hiddenLayers.length > 1 ? 1.2 : 0 }}>
                <Typography
                  variant="subtitle2"
                  sx={{
                    fontWeight: 800,
                    fontSize: '0.85rem',
                    color: '#4ade80',
                    mb: 0.4,
                  }}
                >
                  Sheet Edge is Ready for Inspection
                </Typography>
                <Typography
                  variant="caption"
                  sx={{
                    color: '#cbd5e1',
                    display: 'block',
                    lineHeight: 1.45,
                    fontSize: '0.74rem',
                    mb: 1.0,
                  }}
                >
                  Ridge Cap, Flashings & Gutters are now hidden. You can now clearly inspect the cut edge, corrugation ribs, and thickness gauge.
                </Typography>

                <Button
                  variant="outlined"
                  size="small"
                  fullWidth
                  onClick={() => handleMakeLayerVisible('trims_flashing')}
                  sx={{
                    py: 0.6,
                    fontWeight: 700,
                    fontSize: '0.74rem',
                    textTransform: 'none',
                    borderRadius: 1.8,
                    color: '#38bdf8',
                    borderColor: 'rgba(56, 189, 248, 0.4)',
                    '&:hover': {
                      borderColor: '#38bdf8',
                      bgcolor: 'rgba(56, 189, 248, 0.1)',
                    },
                  }}
                >
                  Show Ridge Cap, Flashings & Gutters
                </Button>
              </Box>
            ) : null}

            {/* Standard Hidden Layers Alerts (Rendered if not in edge recommendation mode, or if additional layers hidden) */}
            {hasAnyHidden && !needsTrimsHiddenForEdge && !(isInspectEdgeActive && isTrimsFlashingHidden && hiddenLayers.length === 1 && !isTimberFramingHidden) ? (
              <Box sx={{ mt: (isInspectEdgeActive && isTrimsFlashingHidden) ? 1.2 : 0 }}>
                {/* Single Layer Hidden Alert */}
                {hiddenLayers.length === 1 && !isTimberFramingHidden && (
                  <Box>
                    <Typography
                      variant="subtitle2"
                      sx={{
                        fontWeight: 800,
                        fontSize: '0.85rem',
                        color: '#fef08a',
                        mb: 0.4,
                      }}
                    >
                      {hiddenLayers[0].label} is Hidden
                    </Typography>
                    <Typography
                      variant="caption"
                      sx={{
                        color: '#cbd5e1',
                        display: 'block',
                        lineHeight: 1.45,
                        fontSize: '0.74rem',
                        mb: 1.2,
                      }}
                    >
                      This structural element has been turned off. Click below to make it visible again to appear in the 3D scene.
                    </Typography>

                    <Button
                      variant="contained"
                      color="primary"
                      size="small"
                      fullWidth
                      onClick={() => handleMakeLayerVisible(hiddenLayers[0].id)}
                      sx={{
                        py: 0.7,
                        fontWeight: 800,
                        fontSize: '0.78rem',
                        textTransform: 'none',
                        borderRadius: 1.8,
                        boxShadow: '0 4px 14px rgba(79, 119, 45, 0.4)',
                      }}
                    >
                      Make Visible Again
                    </Button>
                  </Box>
                )}

                {/* Multiple Layers Hidden Alert */}
                {hiddenLayers.length > 1 && (
                  <Box>
                    <Typography
                      variant="subtitle2"
                      sx={{
                        fontWeight: 800,
                        fontSize: '0.85rem',
                        color: '#fef08a',
                        mb: 0.4,
                      }}
                    >
                      Multiple Structural Layers are Hidden
                    </Typography>
                    <Typography
                      variant="caption"
                      sx={{
                        color: '#cbd5e1',
                        display: 'block',
                        lineHeight: 1.4,
                        fontSize: '0.74rem',
                        mb: 0.8,
                      }}
                    >
                      Click a layer pill or use the button below to make them visible again:
                    </Typography>

                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.6, mb: 1.2 }}>
                      {hiddenLayers.map((layer) => (
                        <Chip
                          key={layer.id}
                          label={layer.shortLabel}
                          size="small"
                          onClick={() => handleMakeLayerVisible(layer.id)}
                          clickable
                          sx={{
                            height: 22,
                            fontSize: '0.68rem',
                            fontWeight: 700,
                            bgcolor: 'rgba(239, 68, 68, 0.18)',
                            color: '#fca5a5',
                            border: '1px solid rgba(239, 68, 68, 0.4)',
                            borderRadius: 1,
                            '&:hover': {
                              bgcolor: 'rgba(74, 222, 128, 0.2)',
                              color: '#86efac',
                            },
                          }}
                        />
                      ))}
                    </Box>

                    <Button
                      variant="contained"
                      color="primary"
                      size="small"
                      fullWidth
                      onClick={handleRestoreAllHiddenLayers}
                      sx={{
                        py: 0.7,
                        fontWeight: 800,
                        fontSize: '0.78rem',
                        textTransform: 'none',
                        borderRadius: 1.8,
                        boxShadow: '0 4px 14px rgba(79, 119, 45, 0.4)',
                      }}
                    >
                      Show All Layers
                    </Button>
                  </Box>
                )}

                {/* Timber Framing Hidden State */}
                {isTimberFramingHidden && hiddenLayers.length === 0 && (
                  <Box>
                    <Typography
                      variant="subtitle2"
                      sx={{
                        fontWeight: 800,
                        fontSize: '0.85rem',
                        color: '#fef08a',
                        mb: 0.4,
                      }}
                    >
                      Timber Framing is Hidden
                    </Typography>
                    <Typography
                      variant="caption"
                      sx={{
                        color: '#cbd5e1',
                        display: 'block',
                        lineHeight: 1.4,
                        fontSize: '0.74rem',
                        mb: 1.2,
                      }}
                    >
                      Trusses, purlins, and wall top plates are currently suppressed. Click below to show the timber framework again.
                    </Typography>

                    <Button
                      variant="contained"
                      color="primary"
                      size="small"
                      fullWidth
                      onClick={onToggleSubstructure}
                      sx={{
                        py: 0.7,
                        fontWeight: 800,
                        fontSize: '0.78rem',
                        textTransform: 'none',
                        borderRadius: 1.8,
                      }}
                    >
                      Show Timber Framing
                    </Button>
                  </Box>
                )}
              </Box>
            ) : !hasAnyHidden && !needsTrimsHiddenForEdge && !isInspectEdgeActive ? (
              /* All Layers Visible - Helpful Interactive Hints */
              <Box>
                <Typography
                  variant="caption"
                  sx={{
                    color: '#94a3b8',
                    display: 'block',
                    lineHeight: 1.45,
                    fontSize: '0.72rem',
                    mb: 0.5,
                  }}
                >
                  Click directly on any 3D truss rafter, tie beam, purlin, or roof sheet in the model to inspect its dimensions and materials.
                </Typography>
                <Typography
                  variant="caption"
                  sx={{
                    color: '#38bdf8',
                    display: 'block',
                    fontSize: '0.7rem',
                    fontWeight: 600,
                  }}
                >
                  Tip: On laptops, swipe 2 fingers on your touchpad to rotate the house, or pinch to zoom.
                </Typography>
              </Box>
            ) : null}
          </Box>
        </Collapse>
      </Paper>
    </Box>
  );
};

export default GuideHiddenObjectsAssistant;