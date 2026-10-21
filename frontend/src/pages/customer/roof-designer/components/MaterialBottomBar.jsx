import React from 'react';
import { Box, Typography, Button, IconButton } from '@mui/material';

const MaterialBottomBar = ({ steps, installPart, addOnePc, removeOnePc }) => {
  return (
    <Box
      sx={{
        height: 120,
        flexShrink: 0,
        bgcolor: '#ffffff',
        borderTop: '1px solid',
        borderColor: 'divider',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      <Box sx={{ px: 2, py: 1, borderBottom: '1px solid', borderColor: 'divider', bgcolor: '#f8fafc' }}>
        <Typography variant="caption" fontWeight={800} color="text.secondary" sx={{ textTransform: 'uppercase', letterSpacing: '0.05em' }}>
          Materials to Install
        </Typography>
      </Box>
      
      <Box 
        sx={{ 
          flex: 1, 
          display: 'flex', 
          alignItems: 'center', 
          gap: 2, 
          px: 2, 
          overflowX: 'auto',
          '&::-webkit-scrollbar': { height: 6 },
          '&::-webkit-scrollbar-thumb': { bgcolor: '#cbd5e1', borderRadius: 3 }
        }}
      >
        {steps.map((step) => {
          const isLocked = step.status === 'locked';
          const isInstalled = step.status === 'installed';
          const isAvailable = step.status === 'available';

          if (step.installByPcs) {
            const canAdd = isAvailable || isInstalled;
            return (
              <Box
                key={step.id}
                sx={{
                  width: 180,
                  minWidth: 180,
                  p: 1.5,
                  borderRadius: 2,
                  border: '1px solid',
                  borderColor: isInstalled ? '#86efac' : isAvailable ? '#cbd5e1' : '#f1f5f9',
                  bgcolor: isInstalled ? '#f0fdf4' : isAvailable ? '#ffffff' : '#f8fafc',
                  opacity: isLocked ? 0.5 : 1,
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 0.75,
                }}
              >
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
                    <i className={`fi ${step.icon}`} style={{ color: isInstalled ? '#22c55e' : '#64748b' }} />
                    <Typography variant="caption" fontWeight={700} noWrap sx={{ color: isLocked ? '#94a3b8' : '#1e293b' }}>
                      {step.name}
                    </Typography>
                  </Box>
                  {isInstalled && (
                    <Box sx={{ bgcolor: '#dcfce7', color: '#166534', borderRadius: 1, px: 0.75, py: 0.25 }}>
                      <Typography variant="caption" fontWeight={800} sx={{ fontSize: '0.6rem' }}>
                        {step.qty} pcs
                      </Typography>
                    </Box>
                  )}
                </Box>

                <Box sx={{ display: 'flex', gap: 0.5 }}>
                  <Button
                    size="small"
                    variant={canAdd ? 'contained' : 'outlined'}
                    disabled={isLocked}
                    onClick={() => addOnePc(step.id)}
                    sx={{
                      flex: 1,
                      height: 24,
                      fontSize: '0.6rem',
                      textTransform: 'none',
                      bgcolor: canAdd ? '#4f772d' : 'transparent',
                      color: canAdd ? '#fff' : 'inherit',
                      '&:hover': { bgcolor: canAdd ? '#3d5c22' : 'transparent' },
                    }}
                  >
                    {isLocked ? 'Locked' : '+ Add 1 pc'}
                  </Button>
                  {isInstalled && (
                    <IconButton
                      size="small"
                      onClick={() => removeOnePc(step.id)}
                      sx={{ border: '1px solid #fca5a5', borderRadius: 1, p: 0.5, color: '#ef4444' }}
                    >
                      <i className="fi fi-rr-minus" style={{ fontSize: '8px' }} />
                    </IconButton>
                  )}
                </Box>
              </Box>
            );
          }

          return (
            <Box 
              key={step.id}
              sx={{
                width: 160,
                minWidth: 160,
                p: 1.5,
                borderRadius: 2,
                border: '1px solid',
                borderColor: isInstalled ? '#86efac' : isAvailable ? '#cbd5e1' : '#f1f5f9',
                bgcolor: isInstalled ? '#f0fdf4' : isAvailable ? '#ffffff' : '#f8fafc',
                opacity: isLocked ? 0.5 : 1,
                display: 'flex',
                flexDirection: 'column',
                gap: 1
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <i className={`fi ${step.icon}`} style={{ color: isInstalled ? '#22c55e' : '#64748b' }} />
                <Typography variant="caption" fontWeight={700} noWrap sx={{ color: isLocked ? '#94a3b8' : '#1e293b' }}>
                  {step.name}
                </Typography>
              </Box>
              
              {isInstalled ? (
                <Typography variant="caption" sx={{ color: '#16a34a', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 0.5 }}>
                  <i className="fi fi-rr-check" style={{ fontSize: '10px' }} /> Installed
                </Typography>
              ) : (
                <Button
                  size="small"
                  variant={isAvailable ? 'contained' : 'outlined'}
                  disabled={isLocked}
                  onClick={() => installPart(step.id)}
                  sx={{
                    height: 24,
                    fontSize: '0.65rem',
                    textTransform: 'none',
                    bgcolor: isAvailable ? '#4f772d' : 'transparent',
                    color: isAvailable ? '#fff' : 'inherit',
                    '&:hover': { bgcolor: isAvailable ? '#3d5c22' : 'transparent' }
                  }}
                >
                  {isLocked ? 'Locked' : 'Install'}
                </Button>
              )}
            </Box>
          );
        })}
      </Box>
    </Box>
  );
};

export default MaterialBottomBar;

