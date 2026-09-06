import React, { useState, useEffect, useRef } from 'react';
import {
  Box,
  Paper,
  Typography,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Avatar,
  Divider,
  TextField,
  Button,
  Chip,
  IconButton
} from '@mui/material';
import SendIcon from '@mui/icons-material/Send';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';
import { io } from 'socket.io-client';

const CustomerService = () => {
  const { token, user } = useAuth();
  const [inquiries, setInquiries] = useState([]);
  const [selectedInquiry, setSelectedInquiry] = useState(null);
  const [newMessage, setNewMessage] = useState('');
  const [socket, setSocket] = useState(null);
  const messagesEndRef = useRef(null);

  const API_URL = import.meta.env.VITE_API_URL || '';

  useEffect(() => {
    fetchInquiries();

    const newSocket = io(API_URL);
    setSocket(newSocket);

    newSocket.on('new_inquiry', (inquiry) => {
      setInquiries(prev => [inquiry, ...prev]);
    });

    newSocket.on('inquiry_updated', ({ inquiryId, message }) => {
      setInquiries(prev => prev.map(inq => {
        if (inq.id === parseInt(inquiryId)) {
          return { ...inq, messages: [...inq.messages, message] };
        }
        return inq;
      }));
      
      setSelectedInquiry(prev => {
        if (prev && prev.id === parseInt(inquiryId)) {
          return { ...prev, messages: [...prev.messages, message] };
        }
        return prev;
      });
    });

    return () => newSocket.close();
  }, [API_URL, token]);

  useEffect(() => {
    if (selectedInquiry) {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [selectedInquiry?.messages]);

  const fetchInquiries = async () => {
    try {
      const res = await axios.get(`${API_URL}/api/inquiries`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setInquiries(res.data);
    } catch (error) {
      console.error("Error fetching inquiries", error);
    }
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !selectedInquiry) return;

    try {
      await axios.post(`${API_URL}/api/inquiries/${selectedInquiry.id}/messages`, {
        content: newMessage
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      setNewMessage('');
    } catch (error) {
      console.error("Error sending message", error);
    }
  };

  const handleStatusChange = async (status) => {
    if (!selectedInquiry) return;
    try {
      const res = await axios.put(`${API_URL}/api/inquiries/${selectedInquiry.id}/status`, {
        status
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      setInquiries(prev => prev.map(inq => inq.id === selectedInquiry.id ? { ...inq, status: res.data.status } : inq));
      setSelectedInquiry(prev => ({ ...prev, status: res.data.status }));
    } catch (error) {
      console.error("Error updating status", error);
    }
  };

  return (
    <Box sx={{ display: 'flex', height: 'calc(100vh - 120px)', gap: 3, p: 3 }}>
      {/* Sidebar - Inquiries List */}
      <Paper elevation={0} sx={{ width: 350, display: 'flex', flexDirection: 'column', border: '1px solid', borderColor: 'divider', borderRadius: 3, overflow: 'hidden' }}>
        <Box sx={{ p: 2, bgcolor: 'primary.main', color: 'white' }}>
          <Typography variant="h6" fontWeight="bold">Customer Inquiries</Typography>
        </Box>
        <List sx={{ flexGrow: 1, overflowY: 'auto', p: 0 }}>
          {inquiries.map((inquiry) => (
            <React.Fragment key={inquiry.id}>
              <ListItem 
                button 
                selected={selectedInquiry?.id === inquiry.id}
                onClick={() => setSelectedInquiry(inquiry)}
                sx={{ 
                  flexDirection: 'column', 
                  alignItems: 'flex-start',
                  '&.Mui-selected': { bgcolor: 'rgba(79,119,45,0.08)' } 
                }}
              >
                <Box sx={{ display: 'flex', justifyContent: 'space-between', width: '100%', mb: 1 }}>
                  <Typography variant="subtitle2" fontWeight="bold">
                    {inquiry.customer.name}
                  </Typography>
                  <Chip 
                    label={inquiry.status} 
                    size="small" 
                    color={inquiry.status === 'Open' ? 'error' : inquiry.status === 'In Progress' ? 'warning' : 'success'}
                  />
                </Box>
                <Typography variant="body2" color="text.secondary" noWrap sx={{ width: '100%' }}>
                  {inquiry.subject || 'No Subject'}
                </Typography>
                <Typography variant="caption" color="text.disabled">
                  {new Date(inquiry.updatedAt).toLocaleString()}
                </Typography>
              </ListItem>
              <Divider />
            </React.Fragment>
          ))}
        </List>
      </Paper>

      {/* Main Chat Area */}
      <Paper elevation={0} sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column', border: '1px solid', borderColor: 'divider', borderRadius: 3, overflow: 'hidden' }}>
        {selectedInquiry ? (
          <>
            <Box sx={{ p: 2, borderBottom: '1px solid', borderColor: 'divider', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Box>
                <Typography variant="h6" fontWeight="bold">{selectedInquiry.customer.name}</Typography>
                <Typography variant="body2" color="text.secondary">{selectedInquiry.customer.email}</Typography>
              </Box>
              <Box>
                <Button size="small" variant="outlined" color="success" onClick={() => handleStatusChange('Resolved')} sx={{ mr: 1 }}>
                  Mark Resolved
                </Button>
                <Button size="small" variant="outlined" color="warning" onClick={() => handleStatusChange('In Progress')}>
                  In Progress
                </Button>
              </Box>
            </Box>

            <Box sx={{ flexGrow: 1, overflowY: 'auto', p: 3, bgcolor: '#f9fafb', display: 'flex', flexDirection: 'column', gap: 2 }}>
              {selectedInquiry.messages.map((msg, index) => {
                const isEmployee = msg.sender.role === 'employee' || msg.sender.role === 'admin';
                return (
                  <Box key={index} sx={{ alignSelf: isEmployee ? 'flex-end' : 'flex-start', maxWidth: '70%' }}>
                    {!isEmployee && (
                      <Typography variant="caption" sx={{ ml: 1, color: 'text.secondary', fontWeight: 'bold' }}>
                        {msg.sender.name}
                      </Typography>
                    )}
                    <Box sx={{
                      bgcolor: isEmployee ? 'primary.main' : 'white',
                      color: isEmployee ? 'white' : 'text.primary',
                      p: 2,
                      borderRadius: 3,
                      boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
                      borderTopLeftRadius: !isEmployee ? 0 : undefined,
                      borderTopRightRadius: isEmployee ? 0 : undefined,
                    }}>
                      <Typography variant="body1">{msg.content}</Typography>
                    </Box>
                    <Typography variant="caption" sx={{ mt: 0.5, display: 'block', textAlign: isEmployee ? 'right' : 'left', color: 'text.disabled' }}>
                      {new Date(msg.createdAt).toLocaleTimeString()}
                    </Typography>
                  </Box>
                );
              })}
              <div ref={messagesEndRef} />
            </Box>

            <Box component="form" onSubmit={handleSendMessage} sx={{ p: 2, borderTop: '1px solid', borderColor: 'divider', bgcolor: 'white', display: 'flex', gap: 2 }}>
              <TextField
                fullWidth
                placeholder="Type your reply..."
                variant="outlined"
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                autoComplete="off"
              />
              <Button type="submit" variant="contained" color="primary" disabled={!newMessage.trim() || selectedInquiry.status === 'Resolved'} sx={{ px: 4 }}>
                <SendIcon />
              </Button>
            </Box>
          </>
        ) : (
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', color: 'text.secondary' }}>
            <Typography>Select an inquiry to view messages</Typography>
          </Box>
        )}
      </Paper>
    </Box>
  );
};

export default CustomerService;
