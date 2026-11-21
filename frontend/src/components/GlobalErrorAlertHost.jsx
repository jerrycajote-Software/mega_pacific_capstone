import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { Paper, Box, Typography, Button, IconButton, Fade } from '@mui/material';
import { CustomCloseIcon, CustomWarningIcon } from './icons';
import { ERROR_CAPTURED_EVENT } from '../utils/errorMonitor';
import ReportErrorModal from './ReportErrorModal';

// Display a non-blocking alert with a Report Error to Admin button whenever an unexpected runtime or server error occurs
const GlobalErrorAlertHost = () => {
  const location = useLocation();
  const [activeError, setActiveError] = useState(null);
  const [reportModalOpen, setReportModalOpen] = useState(false);

  const isAdminRoute =
    location.pathname.startsWith('/admin') || location.pathname.startsWith('/superadmin');

  useEffect(() => {
    const handleCapturedErrorEvent = (event) => {
      if (isAdminRoute) return;
      if (event?.detail) {
        setActiveError(event.detail);
      }
    };

    window.addEventListener(ERROR_CAPTURED_EVENT, handleCapturedErrorEvent);
    return () => {
      window.removeEventListener(ERROR_CAPTURED_EVENT, handleCapturedErrorEvent);
    };
  }, [isAdminRoute]);

  const handleDismissErrorBanner = () => {
    setActiveError(null);
  };

  const handleOpenReportErrorModal = () => {
    setReportModalOpen(true);
  };

  const handleCloseReportErrorModal = () => {
    setReportModalOpen(false);
  };

  const handleErrorReportSubmitted = () => {
    setActiveError(null);
  };

  if (isAdminRoute) return null;

  return (
    <>
      <Fade in={Boolean(activeError) && !reportModalOpen} unmountOnExit>
        <Paper
          elevation={8}
          sx={{
            position: 'fixed',
            bottom: { xs: 84, sm: 24 },
            right: { xs: 16, sm: 24 },
            left: { xs: 16, sm: 'auto' },
            maxWidth: 420,
            zIndex: 1550,
            p: 2,
            borderRadius: 3,
            bgcolor: '#ffffff',
            border: '1.5px solid #fecaca',
            boxShadow: '0 18px 40px rgba(15, 23, 42, 0.18)'
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1.5 }}>
            <Box
              sx={{
                width: 36,
                height: 36,
                borderRadius: '50%',
                bgcolor: '#fef2f2',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
                mt: 0.25
              }}
            >
              <CustomWarningIcon size={18} color="#dc2626" />
            </Box>

            <Box sx={{ flex: 1, minWidth: 0 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 1 }}>
                <Typography variant="subtitle2" fontWeight={800} color="#0f172a">
                  Something went wrong
                </Typography>
                <IconButton
                  size="small"
                  onClick={handleDismissErrorBanner}
                  aria-label="Dismiss error alert"
                  sx={{ p: 0.35, color: '#64748b' }}
                >
                  <CustomCloseIcon size={14} color="#64748b" />
                </IconButton>
              </Box>

              <Typography variant="caption" color="#475569" sx={{ display: 'block', mt: 0.35, lineHeight: 1.45 }}>
                We ran into an unexpected problem while completing your action. You can send this error directly to Admin so we can fix it.
              </Typography>

              {activeError?.traceId && (
                <Typography
                  variant="caption"
                  sx={{
                    display: 'inline-block',
                    mt: 0.75,
                    px: 1,
                    py: 0.25,
                    borderRadius: 1.25,
                    bgcolor: '#fef2f2',
                    color: '#b91c1c',
                    fontFamily: 'monospace',
                    fontWeight: 700,
                    fontSize: '0.7rem'
                  }}
                >
                  Reference: {activeError.traceId}
                </Typography>
              )}

              <Box sx={{ mt: 1.5 }}>
                <Button
                  variant="contained"
                  color="error"
                  size="small"
                  fullWidth
                  onClick={handleOpenReportErrorModal}
                  sx={{
                    borderRadius: 2,
                    textTransform: 'none',
                    fontWeight: 700,
                    py: 0.8
                  }}
                >
                  Report Error to Admin
                </Button>
              </Box>
            </Box>
          </Box>
        </Paper>
      </Fade>

      <ReportErrorModal
        open={reportModalOpen}
        onClose={handleCloseReportErrorModal}
        errorRecord={activeError}
        onSubmitted={handleErrorReportSubmitted}
      />
    </>
  );
};

export default GlobalErrorAlertHost;
