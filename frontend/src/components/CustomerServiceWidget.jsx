import React, { useState, useEffect, useRef } from 'react';
import { Drawer } from '@mui/material';
import axios from 'axios';
import { io } from 'socket.io-client';

import { useAuth } from '../context/AuthContext';
import SupportHeader from './support/SupportHeader';
import SupportMessageList from './support/SupportMessageList';
import SupportComposer from './support/SupportComposer';
import SupportDockTab from './support/SupportDockTab';

export { openCustomerSupport } from '../utils/supportEvents';

const CustomerServiceWidget = () => {
  const { user, token } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [isMaximized, setIsMaximized] = useState(false);
  const [messages, setMessages] = useState([]);
  const [inquiryId, setInquiryId] = useState(null);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const [socket, setSocket] = useState(null);
  const messagesEndRef = useRef(null);

  const API_URL = import.meta.env.VITE_API_URL || '';

  // Listen for custom trigger events from Header, Footer, or navigation actions
  useEffect(() => {
    const handleOpenFromEvent = (e) => {
      setIsOpen(true);
      if (e?.detail?.initialPrompt) {
        setNewMessage(e.detail.initialPrompt);
      }
    };

    window.addEventListener('mega_open_support', handleOpenFromEvent);
    return () => window.removeEventListener('mega_open_support', handleOpenFromEvent);
  }, []);

  // Initialize Socket.io connection for customer
  useEffect(() => {
    if (!user || user.role !== 'customer') return;

    const newSocket = io(API_URL, {
      auth: { user }
    });
    setSocket(newSocket);

    return () => newSocket.close();
  }, [user, API_URL]);

  // Fetch recent inquiry when drawer is opened
  useEffect(() => {
    if (isOpen && token) {
      fetchCustomerInquiries();
    }
  }, [isOpen, token]);

  // Subscribe to real-time messages in the active inquiry room
  useEffect(() => {
    if (socket && inquiryId) {
      socket.emit('join_room', `inquiry_${inquiryId}`);

      const handleIncomingMessage = (incomingMsg) => {
        setMessages((prev) => {
          if (incomingMsg?.id && prev.some((m) => m.id === incomingMsg.id)) {
            return prev;
          }
          return [...prev, incomingMsg];
        });
      };

      socket.on('new_message', handleIncomingMessage);

      return () => {
        socket.off('new_message', handleIncomingMessage);
      };
    }
  }, [socket, inquiryId]);

  // Smooth auto-scroll to the latest message
  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isOpen]);

  const fetchCustomerInquiries = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${API_URL}/api/inquiries/customer`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (Array.isArray(res.data) && res.data.length > 0) {
        const recentInquiry = res.data[0];
        setInquiryId(recentInquiry.id);
        setMessages(recentInquiry.messages || []);
      }
    } catch (error) {
      console.error('Error fetching customer inquiries:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSendMessage = async (e) => {
    if (e) e.preventDefault();
    const trimmed = newMessage.trim();
    if (!trimmed || sending) return;

    setSending(true);
    try {
      if (!inquiryId) {
        const res = await axios.post(
          `${API_URL}/api/inquiries`,
          {
            subject: 'Customer Roofing Inquiry',
            initialMessage: trimmed
          },
          {
            headers: { Authorization: `Bearer ${token}` }
          }
        );
        setInquiryId(res.data.id);
        setMessages(res.data.messages || []);
      } else {
        await axios.post(
          `${API_URL}/api/inquiries/${inquiryId}/messages`,
          {
            content: trimmed
          },
          {
            headers: { Authorization: `Bearer ${token}` }
          }
        );
      }
      setNewMessage('');
    } catch (error) {
      console.error('Error sending message:', error);
    } finally {
      setSending(false);
    }
  };

  const handleSelectQuickPrompt = (promptText) => {
    setNewMessage(promptText);
  };

  const handleClearDraft = () => {
    setNewMessage('');
  };

  const handleToggleMaximize = () => {
    setIsMaximized((prev) => !prev);
  };

  const handleCloseSupportWorkspace = () => {
    setIsOpen(false);
  };

  const handleOpenSupportWorkspace = () => {
    setIsOpen(true);
  };

  if (!user || user.role !== 'customer') return null;

  return (
    <>
      <SupportDockTab
        isOpen={isOpen}
        onOpenSupport={handleOpenSupportWorkspace}
      />

      <Drawer
        anchor="right"
        open={isOpen}
        onClose={handleCloseSupportWorkspace}
        PaperProps={{
          sx: {
            width: isMaximized
              ? { xs: '100%', sm: '92vw', md: 880, lg: 1040 }
              : { xs: '100%', sm: 540, md: 620 },
            maxWidth: { xs: '100%', sm: '100vw' },
            height: '100%',
            maxHeight: '100vh',
            bgcolor: 'background.paper',
            boxShadow: '-8px 0 32px rgba(0, 0, 0, 0.18)',
            transition: 'width 0.25s cubic-bezier(0.4, 0, 0.2, 1)',
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden',
            boxSizing: 'border-box'
          }
        }}
        sx={{
          '& .MuiDrawer-paper': {
            boxSizing: 'border-box',
            width: isMaximized
              ? { xs: '100%', sm: '92vw', md: 880, lg: 1040 }
              : { xs: '100%', sm: 540, md: 620 },
            maxWidth: { xs: '100%', sm: '100vw' }
          }
        }}
      >
        <SupportHeader
          isMaximized={isMaximized}
          onToggleMaximize={handleToggleMaximize}
          onClose={handleCloseSupportWorkspace}
          onRefresh={fetchCustomerInquiries}
          loading={loading}
          inquiryId={inquiryId}
        />

        <SupportMessageList
          messages={messages}
          loading={loading}
          currentUser={user}
          onSelectPrompt={handleSelectQuickPrompt}
          messagesEndRef={messagesEndRef}
        />

        <SupportComposer
          newMessage={newMessage}
          onChangeMessage={setNewMessage}
          onSendMessage={handleSendMessage}
          onClearMessage={handleClearDraft}
          sending={sending}
        />
      </Drawer>
    </>
  );
};

export default CustomerServiceWidget;
