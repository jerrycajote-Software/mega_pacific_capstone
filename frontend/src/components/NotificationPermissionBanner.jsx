import React, { useState, useEffect } from 'react';
import { Box, Typography, Button, IconButton } from '@mui/material';
import NotificationsActiveIcon from '@mui/icons-material/NotificationsActive';
import CloseIcon from '@mui/icons-material/Close';
import {
  isBrowserNotificationSupported,
  getBrowserNotificationPermission,
  isNotificationBannerDismissed,
  dismissNotificationBanner,
  requestBrowserNotificationPermission,
  sendSampleBrowserNotification
} from '../utils/notificationManager';

// Prompt customers or staff to allow live browser notifications in Chrome, Edge, or Safari
const NotificationPermissionBanner = ({
  onStatusFeedback,
  title = 'Turn On Live Order Notifications',
  description = 'Allow notifications in Chrome, Edge, or Safari to get instant alerts when your order is placed, out for delivery, delivered, rejected, or refunded.',
  deniedTitle = 'Browser Alerts Are Blocked in Your Settings',
  deniedDescription = 'To see live delivery pop-ups in Chrome, Edge, or Safari, allow notifications for this website in your browser address bar settings.',
  sampleNotification,
  bannerKey,
  sx
}) => {
  const [permission, setPermission] = useState(() => getBrowserNotificationPermission());
  const [dismissed, setDismissed] = useState(() => isNotificationBannerDismissed(bannerKey));
  const [requesting, setRequesting] = useState(false);
  const supported = isBrowserNotificationSupported();

  useEffect(() => {
    setPermission(getBrowserNotificationPermission());
  }, []);

  if (dismissed || permission === 'granted') {
    return null;
  }

  const handleEnableBrowserAlerts = async () => {
    setRequesting(true);
    const result = await requestBrowserNotificationPermission();
    setPermission(result.permission);
    setRequesting(false);

    if (result.permission === 'granted') {
      sendSampleBrowserNotification(sampleNotification);
    }
    if (onStatusFeedback) {
      onStatusFeedback(result.message, result.permission === 'granted' ? 'success' : 'warning');
    }
  };

  const handleDismissNotificationPrompt = () => {
    dismissNotificationBanner(bannerKey);
    setDismissed(true);
  };

  return (
    <Box
      sx={{
        mb: 2.5,
        px: { xs: 2, sm: 2.5 },
        py: 1.5,
        borderRadius: '14px',
        bgcolor: permission === 'denied' ? '#FFFBEB' : '#EFF6FF',
        border: permission === 'denied' ? '1px solid #FDE68A' : '1px solid #BFDBFE',
        display: 'flex',
        flexDirection: { xs: 'column', sm: 'row' },
        alignItems: { xs: 'flex-start', sm: 'center' },
        justifyContent: 'space-between',
        gap: 1.5,
        ...sx
      }}
    >
      <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1.5, flex: 1 }}>
        <NotificationsActiveIcon
          sx={{
            color: permission === 'denied' ? '#D97706' : '#0B3574',
            fontSize: 22,
            mt: 0.25,
            flexShrink: 0
          }}
        />
        <Box>
          <Typography sx={{ fontWeight: 700, fontSize: '0.88rem', color: '#0F172A' }}>
            {!supported
              ? 'Email Order Alerts Are Active'
              : permission === 'denied'
                ? deniedTitle
                : title}
          </Typography>
          <Typography sx={{ fontSize: '0.8rem', color: '#475569', mt: 0.25, lineHeight: 1.45 }}>
            {!supported
              ? 'Live browser pop-ups are unavailable in this browser. Check your dashboard regularly for updates.'
              : permission === 'denied'
                ? deniedDescription
                : description}
          </Typography>
        </Box>
      </Box>

      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, alignSelf: { xs: 'flex-end', sm: 'center' } }}>
        {supported && permission !== 'denied' && (
          <Button
            variant="contained"
            size="small"
            disabled={requesting}
            onClick={handleEnableBrowserAlerts}
            sx={{
              bgcolor: '#0B3574',
              color: '#FFFFFF',
              textTransform: 'none',
              fontWeight: 700,
              fontSize: '0.78rem',
              borderRadius: '10px',
              px: 2,
              py: 0.75,
              boxShadow: 'none',
              '&:hover': { bgcolor: '#08285A', boxShadow: 'none' }
            }}
          >
            {requesting ? 'Waiting for Permission...' : 'Allow Browser Alerts'}
          </Button>
        )}
        <IconButton
          size="small"
          aria-label="Dismiss notification prompt"
          onClick={handleDismissNotificationPrompt}
          sx={{ color: '#64748B' }}
        >
          <CloseIcon fontSize="small" />
        </IconButton>
      </Box>
    </Box>
  );
};

export default NotificationPermissionBanner;
