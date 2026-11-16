import React from 'react';
import { Box, Typography, Button, IconButton, Tooltip, Stack } from '@mui/material';
import { getColorHex } from '../../constants/roofingSpecs';
import { isCoilInStock } from '../../utils/coilAvailability';

// Bottom customizer bar for thickness, sheet count, coil-validated colors, and View Product Page link
const StudioCustomizerFooter = ({
  availableThicknesses = [],
  currentThickness,
  onSelectRoofThickness,
  currentQty,
  onIncreaseSheets,
  onDecreaseSheets,
  colorList = [],
  currentColor,
  onSelectRoofColor,
  coilInventory = [],
  activeRoofProduct,
  onNavigateToSelectedRoofProduct,
}) => {
  return (
    <Box
      sx={{
        p: { xs: 1.75, md: 2.2 },
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
      {/* Controls: Thickness, Sheets & Coil-Validated Color Swatches */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2.5, flexWrap: 'wrap' }}>
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
                  onClick={() => onSelectRoofThickness(thick)}
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
              onClick={onDecreaseSheets}
              disabled={currentQty <= 1}
              aria-label="Decrease sheet quantity"
              sx={{ color: '#e2e8f0', p: 0.6 }}
            >
              <i className="fi fi-rr-minus" style={{ fontSize: '11px' }}></i>
            </IconButton>
            <Typography variant="body2" fontWeight={800} sx={{ color: '#ffffff', minWidth: 28, textAlign: 'center' }}>
              {currentQty}
            </Typography>
            <IconButton
              size="small"
              onClick={onIncreaseSheets}
              aria-label="Increase sheet quantity"
              sx={{ color: '#e2e8f0', p: 0.6 }}
            >
              <i className="fi fi-rr-plus" style={{ fontSize: '11px' }}></i>
            </IconButton>
          </Box>
        </Box>

        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.2, flexWrap: 'wrap' }}>
          <Typography variant="caption" sx={{ color: '#94a3b8', fontWeight: 700, textTransform: 'uppercase' }}>
            Color: <span style={{ color: '#ffffff', textTransform: 'none', fontWeight: 800 }}>{currentColor}</span>
          </Typography>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.8, flexWrap: 'wrap' }}>
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
                    onClick={() => inStock && onSelectRoofColor(colorName)}
                    sx={{
                      width: 28,
                      height: 28,
                      borderRadius: '50%',
                      bgcolor: hex,
                      border: isSelected ? '3px solid #2563eb' : '2px solid rgba(255, 255, 255, 0.25)',
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

      {/* Primary Action: Navigate directly to the currently selected roof's product page */}
      {activeRoofProduct?.id && (
        <Button
          variant="contained"
          color="primary"
          onClick={onNavigateToSelectedRoofProduct}
          sx={{
            fontWeight: 800,
            borderRadius: 2,
            px: 3,
            py: 1,
            textTransform: 'none',
            fontSize: '0.88rem',
            whiteSpace: 'nowrap',
            boxShadow: '0 4px 16px rgba(79, 119, 45, 0.4)',
          }}
        >
          View Product Page
        </Button>
      )}
    </Box>
  );
};

export default StudioCustomizerFooter;
