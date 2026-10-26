import React from 'react';
import { Box, Typography } from '@mui/material';

const SupportDockTab = ({ onOpenSupport, isOpen = false }) => {
  if (isOpen) return null;

  return (
    <Box
      component="button"
      onClick={onOpenSupport}
      aria-label="Open Customer Support Workspace"
      sx={{
        display: 'flex',
        alignItems: 'center',
        gap: { xs: 1, sm: 1.25 },
        position: 'fixed',
        bottom: { xs: 'calc(56px + max(10px, env(safe-area-inset-bottom)) + 10px)', sm: 0 },
        right: { xs: 16, sm: 32, md: 48 },
        zIndex: 1200,
        px: { xs: 1.75, sm: 2 },
        py: { xs: 0.8, sm: 0.85 },
        bgcolor: 'background.paper',
        color: 'text.primary',
        border: '1px solid',
        borderColor: { xs: 'rgba(79, 119, 45, 0.35)', sm: 'divider' },
        borderBottom: { xs: '1px solid', sm: 'none' },
        borderRadius: { xs: '999px', sm: '10px 10px 0 0' },
        cursor: 'pointer',
        boxShadow: { xs: '0 6px 20px rgba(0, 0, 0, 0.16)', sm: '0 -4px 16px rgba(0, 0, 0, 0.08)' },
        backdropFilter: 'blur(10px)',
        transition: 'transform 0.2s cubic-bezier(0.4, 0, 0.2, 1), box-shadow 0.2s ease, border-color 0.2s ease',
        userSelect: 'none',
        '&:hover': {
          transform: 'translateY(-2px)',
          boxShadow: '0 -6px 20px rgba(79, 119, 45, 0.2)',
          borderColor: 'primary.main',
        },
        '&:active': {
          transform: 'scale(0.96)',
        }
      }}
    >
      <Box
        sx={{
          width: 8,
          height: 8,
          borderRadius: '50%',
          bgcolor: '#22c55e',
          boxShadow: '0 0 0 2px rgba(34, 197, 94, 0.25)',
          flexShrink: 0
        }}
      />
      <i className="fi fi-rr-comment-alt" style={{ fontSize: '15px', color: '#4f772d', flexShrink: 0 }} />
      <Typography variant="body2" sx={{ fontWeight: 700, fontSize: { xs: '0.78rem', sm: '0.82rem' }, letterSpacing: '0.01em', whiteSpace: 'nowrap' }}>
        Live Support Desk
      </Typography>
    </Box>
  );
};

export default SupportDockTab;
