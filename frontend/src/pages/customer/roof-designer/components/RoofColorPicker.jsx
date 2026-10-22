import React from 'react';
import { Box, Typography, Tooltip } from '@mui/material';
import { ROOF_COLORS } from '../data/roofPricingData';


const RoofColorPicker = ({ tileColor, setTileColor }) => {
  return (
    <Box
      sx={{
        px: 2,
        py: 1,
        bgcolor: '#ffffff',
        borderTop: '1px solid',
        borderColor: 'divider',
        display: 'flex',
        alignItems: 'center',
        gap: 1.5,
        flexShrink: 0,
      }}
    >
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mr: 0.5 }}>
        <i className="fi fi-rr-palette" style={{ fontSize: '13px', color: '#64748b' }} />
        <Typography
          variant="caption"
          fontWeight={700}
          sx={{ color: '#475569', whiteSpace: 'nowrap', fontSize: '0.7rem' }}
        >
          Roof Color
        </Typography>
      </Box>

      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75, flexWrap: 'wrap' }}>
        {ROOF_COLORS.map((color) => {
          const isActive = tileColor === color.hex;
          return (
            <Tooltip key={color.id} title={color.name} placement="top" arrow>
              <Box
                onClick={() => setTileColor(color.hex)}
                sx={{
                  width: 26,
                  height: 26,
                  borderRadius: '50%',
                  bgcolor: color.hex,
                  cursor: 'pointer',
                  border: isActive ? '3px solid #4f772d' : '2px solid transparent',
                  outline: isActive ? '2px solid #ffffff' : '2px solid transparent',
                  outlineOffset: isActive ? '-4px' : 0,
                  boxShadow: isActive
                    ? '0 0 0 2px #4f772d, 0 2px 6px rgba(0,0,0,0.25)'
                    : '0 1px 3px rgba(0,0,0,0.2)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  transition: 'all 0.15s ease',
                  '&:hover': {
                    transform: 'scale(1.2)',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.3)',
                  },
                }}
              >
                {isActive && (
                  <i
                    className="fi fi-rr-check"
                    style={{
                      fontSize: '9px',
                      color: '#ffffff',
                      filter: 'drop-shadow(0 1px 1px rgba(0,0,0,0.5))',
                    }}
                  />
                )}
              </Box>
            </Tooltip>
          );
        })}
      </Box>

      <Box sx={{ ml: 'auto', display: 'flex', alignItems: 'center', gap: 1 }}>
        <Box
          sx={{
            width: 18,
            height: 18,
            borderRadius: 1,
            bgcolor: tileColor,
            border: '1px solid rgba(0,0,0,0.15)',
            flexShrink: 0,
          }}
        />
        <Typography variant="caption" sx={{ color: '#64748b', fontWeight: 600, fontSize: '0.65rem' }}>
          {ROOF_COLORS.find((c) => c.hex === tileColor)?.name ?? 'Custom'}
        </Typography>
      </Box>
    </Box>
  );
};

export default RoofColorPicker;
