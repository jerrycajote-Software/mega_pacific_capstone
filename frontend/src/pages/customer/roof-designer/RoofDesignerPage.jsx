import React from 'react';
import { Box, Typography, IconButton, Tooltip, Chip } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import SceneCanvas from './components/SceneCanvas';
import CostEstimatorPanel from './components/CostEstimatorPanel';
import HouseSelectionSidebar from './components/HouseSelectionSidebar';
import MaterialBottomBar from './components/MaterialBottomBar';
import useRoofCalculator from './hooks/useRoofCalculator';

/**
 * RoofDesignerPage — Full-screen 3D roof cost estimator.
 *
 * New 4-Section Layout:
 *   ┌─────────────┬───────────────────────────────┬────────────────┐
 *   │             │                               │                │
 *   │    House    │       3D Scene Canvas         │      Cost      │
 *   │   Model     │         (Center)              │   Estimation   │
 *   │  (Left)     │                               │    (Right)     │
 *   │             ├───────────────────────────────┤                │
 *   │             │   Material Bottom Bar         │                │
 *   └─────────────┴───────────────────────────────┴────────────────┘
 */
const RoofDesignerPage = () => {
  const navigate = useNavigate();
  const calculator = useRoofCalculator();

  return (
    <Box
      sx={{
        /* Fill the entire viewport — standalone page, no header/footer */
        height: '100vh',
        display: 'flex',
        flexDirection: 'column',
        bgcolor: '#f1f5f9',
        overflow: 'hidden',
      }}
    >
      {/*  Top Bar  */}
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          px: 2.5,
          py: 1.5,
          bgcolor: '#ffffff',
          borderBottom: '1px solid',
          borderColor: 'divider',
          flexShrink: 0,
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <Tooltip title="Back to Dashboard">
            <IconButton
              onClick={() => navigate('/dashboard')}
              size="small"
              sx={{
                border: '1px solid',
                borderColor: 'divider',
                borderRadius: 2,
                '&:hover': { bgcolor: 'action.hover' },
              }}
            >
              <i className="fi fi-rr-arrow-left" style={{ fontSize: '14px' }}></i>
            </IconButton>
          </Tooltip>

          <Box>
            <Typography
              variant="h6"
              fontWeight={800}
              sx={{
                display: 'flex',
                alignItems: 'center',
                gap: 1,
                fontSize: '1rem',
                color: '#1a2027',
              }}
            >
              <i className="fi fi-rr-home" style={{ fontSize: '18px', color: '#4f772d' }}></i>
              3D Roof Designer
              <Chip
                label="BETA"
                size="small"
                sx={{
                  height: 20,
                  fontSize: '0.6rem',
                  fontWeight: 800,
                  bgcolor: '#fef3c7',
                  color: '#92400e',
                  letterSpacing: '0.05em',
                }}
              />
            </Typography>
            <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.7rem' }}>
              Visualize your roof and estimate material costs in 3D
            </Typography>
          </Box>
        </Box>

        {/* Scene Controls */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Chip
            icon={<i className="fi fi-rr-cursor-finger" style={{ fontSize: '12px' }}></i>}
            label="Drag to rotate • Scroll to zoom"
            size="small"
            variant="outlined"
            sx={{
              display: { xs: 'none', md: 'flex' },
              fontWeight: 600,
              fontSize: '0.65rem',
              borderColor: '#e2e8f0',
              color: '#64748b',
              '& .MuiChip-icon': { color: '#94a3b8' },
            }}
          />
        </Box>
      </Box>

      {/*  Main Content: 4-Section Layout  */}
      <Box sx={{ flex: 1, display: 'flex', overflow: 'hidden' }}>
        
        {/* Left: House Selection Sidebar */}
        <HouseSelectionSidebar 
          houseLoaded={calculator.houseLoaded} 
          loadHouse={calculator.loadHouse} 
        />

        {/* Center: Scene + Bottom Bar */}
        <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
          
          {/* 3D Canvas */}
          <Box sx={{ flex: 1, position: 'relative', overflow: 'hidden' }}>
            <SceneCanvas houseLoaded={calculator.houseLoaded} visibleIds={calculator.visibleIds} />
          </Box>

          {/* Bottom Bar: Materials */}
          {calculator.houseLoaded && (
            <MaterialBottomBar 
              steps={calculator.steps} 
              installPart={calculator.installPart} 
            />
          )}
        </Box>

        {/* Right: Cost Estimator */}
        <CostEstimatorPanel 
          steps={calculator.steps}
          setQty={calculator.setQty}
          removePart={calculator.removePart}
          grandTotal={calculator.grandTotal}
          installedCount={calculator.installedCount}
          resetAll={calculator.resetAll}
        />

      </Box>
    </Box>
  );
};

export default RoofDesignerPage;
