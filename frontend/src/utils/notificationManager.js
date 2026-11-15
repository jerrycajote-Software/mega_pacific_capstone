// Browser Notification Manager for Chrome, Edge, and Safari

const PREF_STORAGE_KEY = 'megapacific_browser_notifications_enabled';
const BANNER_DISMISSED_KEY = 'megapacific_notification_banner_dismissed';

export const isBrowserNotificationSupported = () => {
  return typeof window !== 'undefined' && 'Notification' in window;
};

export const getBrowserNotificationPermission = () => {
  if (!isBrowserNotificationSupported()) {
    return 'unsupported';
  }
  return window.Notification.permission || 'default';
};

export const isNotificationsEnabledByUser = () => {
  try {
    const saved = localStorage.getItem(PREF_STORAGE_KEY);
    if (saved === 'false') return false;
    return getBrowserNotificationPermission() === 'granted';
  } catch {
    return getBrowserNotificationPermission() === 'granted';
  }
};

export const setNotificationsEnabledByUser = (enabled) => {
  try {
    localStorage.setItem(PREF_STORAGE_KEY, enabled ? 'true' : 'false');
  } catch {
    // Ignore storage errors in restricted browser modes
  }
};

export const isNotificationBannerDismissed = (storageKey = BANNER_DISMISSED_KEY) => {
  try {
    return sessionStorage.getItem(storageKey) === 'true';
  } catch {
    return false;
  }
};

export const dismissNotificationBanner = (storageKey = BANNER_DISMISSED_KEY) => {
  try {
    sessionStorage.setItem(storageKey, 'true');
  } catch {
    // Ignore storage errors
  }
};

// Safely request browser notification permission across Chrome, Edge, and Safari
export const requestBrowserNotificationPermission = async () => {
  if (!isBrowserNotificationSupported()) {
    return {
      supported: false,
      permission: 'unsupported',
      message: 'This browser does not support pop-up notifications. On iPhone Safari, add this site to your Home Screen first, and check your Gmail for updates.'
    };
  }

  try {
    let permission = window.Notification.permission;

    if (permission === 'default') {
      // Safari may pass permission via callback while Chrome/Edge return a Promise
      const result = await new Promise((resolve) => {
        try {
          const maybePromise = window.Notification.requestPermission((cbResult) => {
            resolve(cbResult);
          });
          if (maybePromise && typeof maybePromise.then === 'function') {
            maybePromise.then(resolve).catch(() => resolve(window.Notification.permission));
          }
        } catch {
          resolve(window.Notification.permission);
        }
      });
      permission = result || window.Notification.permission;
    }

    if (permission === 'granted') {
      setNotificationsEnabledByUser(true);
      return {
        supported: true,
        permission: 'granted',
        message: 'Order alerts are now active on this browser.'
      };
    }

    if (permission === 'denied') {
      setNotificationsEnabledByUser(false);
      return {
        supported: true,
        permission: 'denied',
        message: 'Notifications are currently blocked in your browser settings. Please allow notifications for this site to receive live order alerts.'
      };
    }

    return {
      supported: true,
      permission: 'default',
      message: 'Please allow notifications when your browser asks so you receive live delivery and order updates.'
    };
  } catch (err) {
    console.warn('Failed to request browser notification permission:', err);
    return {
      supported: true,
      permission: getBrowserNotificationPermission(),
      message: 'Could not enable browser alerts right now. Please try again or check your browser settings.'
    };
  }
};

// Display a system notification in Chrome, Edge, or Safari when permission is granted
export const sendBrowserNotification = ({
  title,
  body,
  tag = 'megapacific-order-update',
  url = '/customer/orders',
  requireInteraction = false
}) => {
  if (!isBrowserNotificationSupported()) return false;
  if (getBrowserNotificationPermission() !== 'granted') return false;
  if (!isNotificationsEnabledByUser()) return false;

  try {
    const notification = new window.Notification(title || 'Mega Pacific Roofing Update', {
      body: body || '',
      tag,
      icon: '/logo.png',
      badge: '/logo.png',
      requireInteraction
    });

    notification.onclick = () => {
      try {
        window.focus();
        if (url) {
          window.location.href = url;
        }
        notification.close();
      } catch {
        // Ignore navigation errors
      }
    };

    return true;
  } catch (err) {
    console.warn('Browser notification blocked or unavailable in this context:', err);
    return false;
  }
};

export const sendSampleBrowserNotification = (options = {}) => {
  return sendBrowserNotification({
    title: options.title || 'Mega Pacific Live Order Alerts Active',
    body: options.body || 'You will now receive instant alerts here when your order is placed, out for delivery, ready for pick-up, delivered, rejected, or refunded.',
    tag: options.tag || 'megapacific-test-alert',
    url: options.url || '/customer/orders'
  });
};
