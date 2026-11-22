import { useState, useEffect, useCallback } from 'react';
import { io } from 'socket.io-client';
import { fetchStaffSupportUnreadSummary } from '../services/staffSupportApi';

// Tracks unread Admin reply count in real time for Logistics, Finance, Sales, and Owner sidebars
export const useStaffSupportUnreadBadge = (user, { onIncomingReply } = {}) => {
  const [unreadCount, setUnreadCount] = useState(0);

  const refreshUnreadCount = useCallback(async () => {
    try {
      const token = localStorage.getItem('appToken');
      if (!token) return;
      const res = await fetchStaffSupportUnreadSummary(token);
      if (res?.success && res.data) {
        setUnreadCount(res.data.unreadMessages || 0);
      }
    } catch {
      // Ignore silent badge refresh failures
    }
  }, []);

  useEffect(() => {
    if (!user?.id) return undefined;
    refreshUnreadCount();

    const API_URL = import.meta.env.VITE_API_URL || '';
    const socket = io(API_URL, { auth: { user } });

    socket.emit('join_room', `user_${user.id}`);

    socket.on('staff_support_reply', (payload) => {
      refreshUnreadCount();
      if (typeof onIncomingReply === 'function') {
        onIncomingReply(payload);
      }
    });

    socket.on('staff_support_status_updated', (payload) => {
      refreshUnreadCount();
      if (typeof onIncomingReply === 'function') {
        onIncomingReply(payload);
      }
    });

    socket.on('staff_support_badge_updated', () => {
      refreshUnreadCount();
    });

    return () => {
      socket.disconnect();
    };
  }, [user, refreshUnreadCount, onIncomingReply]);

  return { unreadCount, refreshUnreadCount };
};
