import { useState, useEffect, useRef } from 'react';
import { io } from 'socket.io-client';
import { sendBrowserNotification } from '../utils/notificationManager';

/**
 * Shared real-time Socket.IO + Browser Notification Manager hook for staff portals
 * (Logistics, Finance, and Sales).
 */
export const usePortalNotificationManager = ({
  user,
  rooms = [],
  primaryEvent,
  extraEvents = {},
  reminderStorageKey,
  fetchPendingReminder
}) => {
  const [activeNotification, setActiveNotification] = useState(null);
  const [permissionFeedback, setPermissionFeedback] = useState(null);
  const extraEventsRef = useRef(extraEvents);
  const fetchPendingReminderRef = useRef(fetchPendingReminder);

  extraEventsRef.current = extraEvents;
  fetchPendingReminderRef.current = fetchPendingReminder;

  const triggerAlert = (payload) => {
    if (!payload) return;
    const normalized = typeof payload === 'string'
      ? { title: 'Notification', body: payload, severity: 'info' }
      : payload;

    setActiveNotification({
      title: normalized.title || 'Portal Notification',
      body: normalized.body || normalized.message || '',
      severity: normalized.severity || 'info',
      url: normalized.url || normalized.path || null,
      actionLabel: normalized.actionLabel || 'View',
      tag: normalized.tag || `portal-alert-${Date.now()}`
    });

    sendBrowserNotification({
      title: normalized.title || 'Mega Pacific Update',
      body: normalized.body || normalized.message || '',
      tag: normalized.tag || 'megapacific-staff-alert',
      url: normalized.url || normalized.path || undefined
    });
  };

  useEffect(() => {
    if (!user?.id) return undefined;

    const API_URL = import.meta.env.VITE_API_URL || '';
    const socket = io(API_URL, {
      auth: { user }
    });

    socket.emit('join_room', `user_${user.id}`);
    rooms.filter(Boolean).forEach((room) => {
      socket.emit('join_room', room);
    });

    socket.on('new_device_login', (data) => {
      triggerAlert({
        title: 'New Device Sign-in',
        body: data?.message || 'A new device signed in to your account.',
        severity: 'warning',
        tag: `new-device-${user.id}`
      });
    });

    if (primaryEvent) {
      socket.on(primaryEvent, (payload) => {
        triggerAlert(payload);
      });
    }

    const extraEntries = Object.entries(extraEventsRef.current || {});
    extraEntries.forEach(([eventName, mapper]) => {
      socket.on(eventName, (payload) => {
        const mapped = typeof mapper === 'function' ? mapper(payload) : payload;
        if (mapped) {
          triggerAlert(mapped);
        }
      });
    });

    return () => {
      socket.close();
    };
  }, [user?.id, primaryEvent, rooms.join('|')]);

  useEffect(() => {
    if (!user?.id || typeof fetchPendingReminderRef.current !== 'function') return undefined;

    let alreadyReminded = false;
    try {
      if (reminderStorageKey && sessionStorage.getItem(reminderStorageKey) === 'true') {
        alreadyReminded = true;
      }
    } catch {
      alreadyReminded = false;
    }

    if (alreadyReminded) return undefined;

    let cancelled = false;
    const runReminderCheck = async () => {
      try {
        const reminder = await fetchPendingReminderRef.current();
        if (cancelled || !reminder) return;
        try {
          if (reminderStorageKey) {
            sessionStorage.setItem(reminderStorageKey, 'true');
          }
        } catch {
          // Ignore sessionStorage errors
        }
        triggerAlert(reminder);
      } catch (err) {
        console.warn('Portal reminder check skipped:', err?.message || err);
      }
    };

    runReminderCheck();
    return () => {
      cancelled = true;
    };
  }, [user?.id, reminderStorageKey]);

  const handleCloseNotification = () => setActiveNotification(null);
  const handleClosePermissionFeedback = () => setPermissionFeedback(null);

  return {
    activeNotification,
    permissionFeedback,
    setPermissionFeedback,
    handleCloseNotification,
    handleClosePermissionFeedback
  };
};
