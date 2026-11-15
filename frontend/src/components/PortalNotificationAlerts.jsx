import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Snackbar, Alert, Button } from '@mui/material';

/**
 * Shared in-app Snackbar alerts for staff portal notifications and browser permission feedback.
 */
const PortalNotificationAlerts = ({
  activeNotification,
  onCloseNotification,
  permissionFeedback,
  onClosePermissionFeedback
}) => {
  const navigate = useNavigate();

  const handleNavigateFromNotification = () => {
    const targetUrl = activeNotification?.url;
    onCloseNotification?.();
    if (targetUrl) {
      navigate(targetUrl);
    }
  };

  return (
    <>
      <Snackbar
        open={Boolean(activeNotification)}
        autoHideDuration={9000}
        onClose={onCloseNotification}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert
          onClose={onCloseNotification}
          severity={activeNotification?.severity || 'info'}
          variant="filled"
          sx={{ width: '100%', maxWidth: 560, borderRadius: 2.5, alignItems: 'center' }}
          action={
            activeNotification?.url ? (
              <Button
                color="inherit"
                size="small"
                onClick={handleNavigateFromNotification}
                sx={{
                  fontWeight: 700,
                  textTransform: 'none',
                  whiteSpace: 'nowrap',
                  bgcolor: 'rgba(255,255,255,0.18)',
                  '&:hover': { bgcolor: 'rgba(255,255,255,0.28)' }
                }}
              >
                {activeNotification.actionLabel || 'View'}
              </Button>
            ) : undefined
          }
        >
          <div>
            {activeNotification?.title && (
              <div style={{ fontWeight: 700, fontSize: '0.88rem' }}>{activeNotification.title}</div>
            )}
            {activeNotification?.body && (
              <div style={{ fontSize: '0.8rem', opacity: 0.95, marginTop: 2 }}>{activeNotification.body}</div>
            )}
          </div>
        </Alert>
      </Snackbar>

      <Snackbar
        open={Boolean(permissionFeedback)}
        autoHideDuration={5000}
        onClose={onClosePermissionFeedback}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert
          onClose={onClosePermissionFeedback}
          severity={permissionFeedback?.severity || 'info'}
          variant="filled"
          sx={{ borderRadius: 2.5, fontWeight: 600 }}
        >
          {permissionFeedback?.message}
        </Alert>
      </Snackbar>
    </>
  );
};

export default PortalNotificationAlerts;
