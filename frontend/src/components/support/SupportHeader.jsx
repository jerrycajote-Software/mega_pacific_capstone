import React from 'react';
import { Box, Typography, IconButton, Tooltip, Chip } from '@mui/material';

const SupportHeader = ({
  isMaximized,
  onToggleMaximize,
  onClose,
  onRefresh,
  loading = false,
  inquiryId = null
}) => {
  return (
    <Box
      sx={{
        p: { xs: 1.5, sm: 2.5 },
        bgcolor: 'background.paper',
        borderBottom: '1px solid',
        borderColor: 'divider',
        display: 'flex',
        flexDirection: 'column',
        gap: { xs: 1, sm: 1.5 },
        flexShrink: 0,
        maxWidth: '100%',
        boxSizing: 'border-box',
        overflowX: 'hidden'
      }}
    >
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 1, maxWidth: '100%' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: { xs: 1, sm: 1.5 }, minWidth: 0, flex: 1 }}>
          <Box
            sx={{
              position: 'relative',
              width: { xs: 36, sm: 44 },
              height: { xs: 36, sm: 44 },
              borderRadius: 2,
              bgcolor: 'primary.main',
              color: '#ffffff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 4px 12px rgba(79, 119, 45, 0.25)',
              flexShrink: 0
            }}
          >
            <i className="fi fi-rr-comment-alt" style={{ fontSize: '18px' }}></i>
            <Box
              sx={{
                position: 'absolute',
                bottom: -2,
                right: -2,
                width: 10,
                height: 10,
                borderRadius: '50%',
                bgcolor: '#22c55e',
                border: '2px solid #ffffff'
              }}
            />
          </Box>

          <Box sx={{ minWidth: 0, flex: 1, overflow: 'hidden' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75, flexWrap: 'wrap' }}>
              <Typography variant="subtitle1" noWrap sx={{ fontWeight: 800, fontSize: { xs: '0.88rem', sm: '1.05rem' }, lineHeight: 1.2, color: 'text.primary' }}>
                Customer Support & Sales Desk
              </Typography>
              <Chip
                label="Online"
                size="small"
                sx={{
                  height: 18,
                  fontSize: '0.62rem',
                  fontWeight: 700,
                  bgcolor: '#dcfce7',
                  color: '#15803d',
                  borderRadius: 1
                }}
              />
            </Box>
            <Typography variant="caption" noWrap sx={{ color: 'text.secondary', display: 'block', mt: 0.25, fontSize: { xs: '0.68rem', sm: '0.75rem' } }}>
              Direct line to Mega Pacific consultants & orders team
            </Typography>
          </Box>
        </Box>

        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, flexShrink: 0 }}>
          <Tooltip title={loading ? 'Refreshing conversation...' : 'Refresh messages'}>
            <span>
              <IconButton
                size="small"
                onClick={onRefresh}
                disabled={loading}
                aria-label="Refresh conversation"
                sx={{
                  border: '1px solid',
                  borderColor: 'divider',
                  borderRadius: 2,
                  p: { xs: 0.5, sm: 0.75 },
                  color: 'text.secondary',
                  '&:hover': { color: 'primary.main', borderColor: 'primary.main' }
                }}
              >
                <i
                  className="fi fi-rr-refresh"
                  style={{
                    fontSize: '13px',
                    display: 'inline-block',
                    animation: loading ? 'spin 1s linear infinite' : 'none'
                  }}
                />
              </IconButton>
            </span>
          </Tooltip>

          <Tooltip title={isMaximized ? 'Restore standard width' : 'Expand to wide workspace'}>
            <IconButton
              size="small"
              onClick={onToggleMaximize}
              aria-label={isMaximized ? 'Restore standard width' : 'Expand to wide workspace'}
              sx={{
                display: { xs: 'none', sm: 'inline-flex' },
                border: '1px solid',
                borderColor: 'divider',
                borderRadius: 2,
                p: 0.75,
                color: 'text.secondary',
                '&:hover': { color: 'primary.main', borderColor: 'primary.main' }
              }}
            >
              <i className={isMaximized ? 'fi fi-rr-compress' : 'fi fi-rr-expand'} style={{ fontSize: '14px' }}></i>
            </IconButton>
          </Tooltip>

          <Tooltip title="Close Support Desk">
            <IconButton
              size="small"
              onClick={onClose}
              aria-label="Close Support Desk"
              sx={{
                border: '1px solid',
                borderColor: 'divider',
                borderRadius: 2,
                p: { xs: 0.5, sm: 0.75 },
                color: 'text.secondary',
                '&:hover': { bgcolor: 'error.light', color: 'error.main', borderColor: 'error.main' }
              }}
            >
              <i className="fi fi-rr-cross" style={{ fontSize: '13px' }}></i>
            </IconButton>
          </Tooltip>
        </Box>
      </Box>

      {inquiryId && (
        <Box
          sx={{
            display: 'flex',
            alignItems: { xs: 'flex-start', sm: 'center' },
            justifyContent: 'space-between',
            flexDirection: { xs: 'column', sm: 'row' },
            gap: { xs: 0.35, sm: 1 },
            px: 1.5,
            py: 0.75,
            borderRadius: 1.5,
            bgcolor: (theme) => theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.03)' : '#f8fafc',
            border: '1px solid',
            borderColor: 'divider',
            maxWidth: '100%',
            boxSizing: 'border-box'
          }}
        >
          <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 600, fontSize: '0.72rem' }}>
            Ticket ID: <span style={{ fontFamily: 'monospace', color: '#4f772d', fontWeight: 700 }}>#INQ-{inquiryId}</span>
          </Typography>
          <Typography variant="caption" sx={{ color: 'text.secondary', fontSize: '0.7rem' }}>
            ⚡ Response within 15 mins during business hours
          </Typography>
        </Box>
      )}
    </Box>
  );
};

export default SupportHeader;
