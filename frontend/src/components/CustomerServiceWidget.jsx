import React, { useState, useEffect, useRef } from 'react';
import {
  Fab,
  Tooltip,
  Badge,
  Paper,
  Box,
  Typography,
  IconButton,
  TextField,
  Button,
  CircularProgress
} from '@mui/material';
import ChatBubbleIcon from '@mui/icons-material/ChatBubble';
import CloseIcon from '@mui/icons-material/Close';
import SendIcon from '@mui/icons-material/Send';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import { io } from 'socket.io-client';

const CustomerServiceWidget = () => {
  const { user, token } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [inquiryId, setInquiryId] = useState(null);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [socket, setSocket] = useState(null);
  const messagesEndRef = useRef(null);

  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

  useEffect(() => {
    if (!user || user.role !== 'customer') return;

    // Connect to Socket.io
    const newSocket = io(API_URL);
    setSocket(newSocket);

    return () => newSocket.close();
  }, [user, API_URL]);

  useEffect(() => {
    if (isOpen && !inquiryId && token) {
      fetchInquiries();
    }
  }, [isOpen]);

  useEffect(() => {
    if (socket && inquiryId) {
      socket.emit('join_room', `inquiry_${inquiryId}`);
      
      const messageHandler = (msg) => {
        setMessages(prev => [...prev, msg]);
      };
      
      socket.on('new_message', messageHandler);

      return () => {
        socket.off('new_message', messageHandler);
      };
    }
  }, [socket, inquiryId]);

  useEffect(() => {
    // Scroll to bottom when messages change
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const fetchInquiries = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${API_URL}/api/inquiries/customer`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.data.length > 0) {
        // Use the most recent inquiry
        const recentInquiry = res.data[0];
        setInquiryId(recentInquiry.id);
        setMessages(recentInquiry.messages || []);
      }
    } catch (error) {
      console.error("Error fetching inquiries", error);
    }
    setLoading(false);
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim()) return;

    try {
      if (!inquiryId) {
        // Create new inquiry
        const res = await axios.post(`${API_URL}/api/inquiries`, {
          subject: "Customer Inquiry",
          initialMessage: newMessage
        }, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setInquiryId(res.data.id);
        setMessages(res.data.messages);
      } else {
        // Add message to existing inquiry
        await axios.post(`${API_URL}/api/inquiries/${inquiryId}/messages`, {
          content: newMessage
        }, {
          headers: { Authorization: `Bearer ${token}` }
        });
        // Message will be added via socket.io
      }
      setNewMessage('');
    } catch (error) {
      console.error("Error sending message", error);
    }
  };

  if (!user || user.role !== 'customer') return null;

  return (
    <>
      <Tooltip title="Customer Support" placement="left" arrow>
        <Fab
          color="secondary"
          aria-label="Customer Support"
          onClick={() => setIsOpen(true)}
          sx={{
            position: 'fixed',
            bottom: 28,
            right: 28,
            zIndex: 1200,
            width: 60,
            height: 60,
            boxShadow: '0 8px 24px rgba(0,0,0,0.2)',
            transition: 'transform 0.2s ease, box-shadow 0.2s ease',
            '&:hover': {
              transform: 'scale(1.1)',
              boxShadow: '0 12px 32px rgba(0,0,0,0.3)',
            },
          }}
        >
          <Badge color="error" variant="dot" invisible={isOpen}>
            <ChatBubbleIcon sx={{ fontSize: 26, color: '#ffffff' }} />
          </Badge>
        </Fab>
      </Tooltip>

      {isOpen && (
        <Paper
          elevation={6}
          sx={{
            position: 'fixed',
            bottom: 100,
            right: 28,
            width: { xs: 300, sm: 350 },
            height: 450,
            zIndex: 1300,
            display: 'flex',
            flexDirection: 'column',
            borderRadius: 3,
            overflow: 'hidden'
          }}
        >
          {/* Header */}
          <Box sx={{
            bgcolor: 'secondary.main',
            color: 'white',
            p: 2,
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center'
          }}>
            <Typography variant="subtitle1" fontWeight="bold">Customer Support</Typography>
            <IconButton size="small" onClick={() => setIsOpen(false)} sx={{ color: 'white' }}>
              <CloseIcon />
            </IconButton>
          </Box>

          {/* Chat Messages */}
          <Box sx={{ flexGrow: 1, p: 2, overflowY: 'auto', bgcolor: '#f5f5f5', display: 'flex', flexDirection: 'column', gap: 1 }}>
            {loading ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', mt: 5 }}>
                <CircularProgress size={24} />
              </Box>
            ) : messages.length === 0 ? (
              <Typography variant="body2" color="text.secondary" textAlign="center" sx={{ mt: 2 }}>
                Hi there! How can we help you today?
              </Typography>
            ) : (
              messages.map((msg, index) => {
                const isCustomer = msg.senderId === user.id;
                return (
                  <Box key={index} sx={{
                    alignSelf: isCustomer ? 'flex-end' : 'flex-start',
                    maxWidth: '80%',
                    bgcolor: isCustomer ? 'primary.main' : 'white',
                    color: isCustomer ? 'white' : 'text.primary',
                    p: 1.5,
                    borderRadius: 2,
                    boxShadow: 1
                  }}>
                    {!isCustomer && (
                      <Typography variant="caption" sx={{ display: 'block', mb: 0.5, fontWeight: 'bold', color: 'secondary.main' }}>
                        {msg.sender?.name || 'Employee'}
                      </Typography>
                    )}
                    <Typography variant="body2">{msg.content}</Typography>
                  </Box>
                )
              })
            )}
            <div ref={messagesEndRef} />
          </Box>

          {/* Input Area */}
          <Box component="form" onSubmit={handleSendMessage} sx={{ p: 1.5, borderTop: '1px solid', borderColor: 'divider', bgcolor: 'white', display: 'flex', gap: 1 }}>
            <TextField
              fullWidth
              size="small"
              placeholder="Type your message..."
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              autoComplete="off"
            />
            <Button type="submit" variant="contained" color="secondary" sx={{ minWidth: 'auto', px: 2 }} disabled={!newMessage.trim()}>
              <SendIcon fontSize="small" />
            </Button>
          </Box>
        </Paper>
      )}
    </>
  );
};

export default CustomerServiceWidget;
