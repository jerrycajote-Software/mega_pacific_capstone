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
        display: { xs: 'none', sm: 'flex' },
        alignItems: 'center',
        gap: 1.25,
        position: 'fixed',
        bottom: 0,
        right: { sm: 32, md: 48 },
        zIndex: 1100,
        px: 2,
        py: 0.85,
        bgcolor: 'background.paper',
        color: 'text.primary',
        border: '1px solid',
        borderColor: 'divider',
        borderBottom: 'none',
        borderRadius: '10px 10px 0 0',
        cursor: 'pointer',
        boxShadow: '0 -4px 16px rgba(0, 0, 0, 0.08)',
        transition: 'transform 0.2s cubic-bezier(0.4, 0, 0.2, 1), box-shadow 0.2s ease, border-color 0.2s ease',
        userSelect: 'none',
        '&:hover': {
          transform: 'translateY(-2px)',
          boxShadow: '0 -6px 20px rgba(79, 119, 45, 0.15)',
          borderColor: 'primary.main',
        }
      }}
    >
      <Box
        sx={{
          width: 8,
          height: 8,
          borderRadius: '50%',
          bgcolor: '#22c55e',
          boxShadow: '0 0 0 2px rgba(34, 197, 94, 0.2)'
        }}
      />
      <i className="fi fi-rr-comment-alt" style={{ fontSize: '15px', color: '#4f772d' }} />
      <Typography variant="body2" sx={{ fontWeight: 700, fontSize: '0.82rem', letterSpacing: '0.01em' }}>
        Live Support Desk
      </Typography>
    </Box>
  );
};

export default SupportDockTab;
