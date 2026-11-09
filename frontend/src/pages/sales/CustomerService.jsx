import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import axios from 'axios';
import { Avatar, CircularProgress, Dialog, IconButton } from '@mui/material';
import {
  CustomSearchIcon as SearchIcon,
  CustomSupportAgentIcon as SupportAgentIcon,
  CustomClearIcon as ClearIcon,
  CustomChatBubbleOutlinedIcon as ChatBubbleOutlinedIcon,
  CustomMailOutlinedIcon as MailOutlinedIcon,
  CustomPhoneInTalkOutlinedIcon as PhoneInTalkOutlinedIcon,
  CustomPlaceOutlinedIcon as PlaceOutlinedIcon,
  CustomAccessTimeIcon as AccessTimeIcon,
  CustomFiberManualRecordIcon as FiberManualRecordIcon,
  CustomImageOutlinedIcon as ImageOutlinedIcon,
  CustomCloseIcon as CloseIcon
} from '../../components/icons';
import { useAuth } from '../../context/AuthContext';
import { io } from 'socket.io-client';
import { isMobileBrowser } from '../../utils/deviceDetect';
import { parseMessageContent, formatMessagePreview, compressChatImage } from '../../utils/chatImageHelper';

const QUICK_MACROS = [
  { label: '👋 Greeting', text: 'Hello! Thank you for reaching out to Mega Pacific. How may I assist you with your roofing materials today?' },
  { label: '📦 Stock Check', text: 'We are currently reviewing our warehouse inventory for your requested specifications. Give us a moment to confirm availability.' },
  { label: '🚚 Logistics ETA', text: 'Your delivery is being processed with our dispatch team. We will update you with the estimated transport schedule shortly.' },
  { label: '✅ Resolution', text: 'We have updated your inquiry with the requested information. Please let us know if you need any additional assistance!' },
];

const CustomerService = () => {
  const { token, user } = useAuth();
  const [inquiries, setInquiries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedInquiryId, setSelectedInquiryId] = useState(null);
  const [newMessage, setNewMessage] = useState('');
  const [attachedImage, setAttachedImage] = useState(null);
  const [compressing, setCompressing] = useState(false);
  const [previewImage, setPreviewImage] = useState(null);
  const [sending, setSending] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [socket, setSocket] = useState(null);
  const [isLiveConnected, setIsLiveConnected] = useState(false);

  const messagesEndRef = useRef(null);
  const textareaRef = useRef(null);
  const fileInputRef = useRef(null);

  const API_URL = import.meta.env.VITE_API_URL || '';

  const fetchInquiries = useCallback(async () => {
    try {
      const res = await axios.get(`${API_URL}/api/inquiries`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = Array.isArray(res.data) ? res.data : [];
      setInquiries(data);
      setSelectedInquiryId((prevSelectedId) => {
        if (prevSelectedId) {
          const stillExists = data.some((inq) => inq.id === prevSelectedId);
          return stillExists ? prevSelectedId : (data[0]?.id || null);
        }
        return data.length > 0 ? data[0].id : null;
      });
    } catch (error) {
      console.error("Error fetching inquiries", error);
    } finally {
      setLoading(false);
    }
  }, [API_URL, token]);

  const handleSelectInquiry = (inquiryId) => {
    setSelectedInquiryId(inquiryId);
  };

  useEffect(() => {
    fetchInquiries();

    const newSocket = io(API_URL, {
      auth: { user }
    });
    setSocket(newSocket);

    newSocket.on('connect', () => {
      setIsLiveConnected(true);
      newSocket.emit('join_room', 'sales');
      if (user?.id) {
        newSocket.emit('join_room', `user_${user.id}`);
      }
    });

    newSocket.on('disconnect', () => {
      setIsLiveConnected(false);
    });

    newSocket.on('new_inquiry', (inquiry) => {
      setInquiries(prev => {
        if (prev.some(i => i.id === inquiry.id)) return prev;
        return [inquiry, ...prev];
      });
    });

    newSocket.on('inquiry_updated', ({ inquiryId, message }) => {
      const targetId = parseInt(inquiryId);
      setInquiries(prev => prev.map(inq => {
        if (inq.id === targetId) {
          const exists = inq.messages?.some(m => m.id === message.id);
          const updatedMessages = exists ? inq.messages : [...(inq.messages || []), message];
          return { ...inq, messages: updatedMessages, updatedAt: new Date().toISOString() };
        }
        return inq;
      }));
    });

    newSocket.on('inquiry_status_updated', (updated) => {
      setInquiries(prev => prev.map(inq => inq.id === updated.id ? { ...inq, status: updated.status } : inq));
    });

    const handleFocus = () => {
      fetchInquiries();
    };
    window.addEventListener('focus', handleFocus);

    return () => {
      window.removeEventListener('focus', handleFocus);
      newSocket.close();
    };
  }, [fetchInquiries, API_URL, token, user]);

  const selectedInquiry = useMemo(() => {
    return inquiries.find(i => i.id === selectedInquiryId) || null;
  }, [inquiries, selectedInquiryId]);

  useEffect(() => {
    if (socket && selectedInquiryId) {
      socket.emit('join_room', `inquiry_${selectedInquiryId}`);
      
      const handleRoomMessage = (msg) => {
        setInquiries(prev => prev.map(inq => {
          if (inq.id === selectedInquiryId) {
            const exists = inq.messages?.some(m => m.id === msg.id);
            if (exists) return inq;
            return { ...inq, messages: [...(inq.messages || []), msg], updatedAt: new Date().toISOString() };
          }
          return inq;
        }));
      };

      const handleRoomStatus = (updated) => {
        setInquiries(prev => prev.map(inq => inq.id === updated.id ? { ...inq, status: updated.status } : inq));
      };

      socket.on('new_message', handleRoomMessage);
      socket.on('status_updated', handleRoomStatus);

      return () => {
        socket.off('new_message', handleRoomMessage);
        socket.off('status_updated', handleRoomStatus);
      };
    }
  }, [socket, selectedInquiryId]);

  useEffect(() => {
    if (selectedInquiry) {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [selectedInquiry?.messages?.length, selectedInquiryId]);



  const handleSendInquiryMessage = async (e) => {
    if (e) e.preventDefault();
    const trimmed = newMessage.trim();
    if ((!trimmed && !attachedImage) || !selectedInquiry || sending || compressing) return;

    setSending(true);
    try {
      const res = await axios.post(`${API_URL}/api/inquiries/${selectedInquiry.id}/messages`, {
        content: trimmed,
        image: attachedImage || null
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });

      const createdMessage = res.data;
      if (createdMessage && createdMessage.id) {
        setInquiries(prev => prev.map(inq => {
          if (inq.id === selectedInquiry.id) {
            const exists = inq.messages?.some(m => m.id === createdMessage.id);
            if (exists) return inq;
            return {
              ...inq,
              messages: [...(inq.messages || []), createdMessage],
              updatedAt: new Date().toISOString()
            };
          }
          return inq;
        }));
      }
      
      setNewMessage('');
      setAttachedImage(null);
      if (textareaRef.current) {
        textareaRef.current.focus();
      }
    } catch (error) {
      console.error("Error sending message", error);
    } finally {
      setSending(false);
    }
  };

  const handleComposerKeyDown = (e) => {
    const isMobile = isMobileBrowser() || (typeof window !== 'undefined' && window.innerWidth < 768);
    if (isMobile) {
      // On mobile virtual keyboards, allow Enter to insert a new line naturally.
      // Messages on mobile can only be submitted by tapping the Send button.
      return;
    }

    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      const hasContent = Boolean(newMessage.trim()) || Boolean(attachedImage);
      if (hasContent && !sending && !compressing) {
        handleSendInquiryMessage();
      }
    }
  };

  const handleTriggerImageFileInput = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handleSelectImageAttachment = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setCompressing(true);
    try {
      const compressedDataUrl = await compressChatImage(file, 1280, 0.82);
      setAttachedImage(compressedDataUrl);
    } catch (err) {
      console.error('Image compression failed:', err);
      alert(err.message || 'Failed to process the selected image.');
    } finally {
      setCompressing(false);
      if (e.target) {
        e.target.value = '';
      }
    }
  };

  const handleRemoveImageAttachment = () => {
    setAttachedImage(null);
  };

  const handleOpenImagePreviewModal = (imageUrl) => {
    setPreviewImage(imageUrl);
  };

  const handleCloseImagePreviewModal = () => {
    setPreviewImage(null);
  };

  const getCustomerName = (inquiry) => {
    return inquiry?.customer?.customerProfile?.name || inquiry?.customer?.name || inquiry?.customer?.email?.split('@')[0] || 'Customer';
  };

  const formatRelativeTime = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now - date;
    const diffSec = Math.floor(diffMs / 1000);
    const diffMin = Math.floor(diffSec / 60);
    const diffHour = Math.floor(diffMin / 60);
    const diffDay = Math.floor(diffHour / 24);

    if (diffDay > 30) {
      return date.toLocaleDateString('en-PH', { month: 'short', day: 'numeric' });
    }
    if (diffDay > 0) return `${diffDay}d ago`;
    if (diffHour > 0) return `${diffHour}h ago`;
    if (diffMin > 0) return `${diffMin}m ago`;
    return 'Just now';
  };

  const filteredInquiries = useMemo(() => {
    return inquiries.filter(inquiry => {
      const customerName = getCustomerName(inquiry).toLowerCase();
      const email = (inquiry.customer?.email || '').toLowerCase();
      const subject = (inquiry.subject || '').toLowerCase();
      const lastMsgRaw = inquiry.messages && inquiry.messages.length > 0
        ? inquiry.messages[inquiry.messages.length - 1]?.content
        : '';
      const lastMsgParsed = parseMessageContent(lastMsgRaw);
      const lastMsgPreview = (lastMsgParsed.text || (lastMsgParsed.image ? 'photo attachment' : '')).toLowerCase();
      
      const q = searchTerm.toLowerCase();
      return customerName.includes(q) || email.includes(q) || subject.includes(q) || lastMsgPreview.includes(q);
    });
  }, [inquiries, searchTerm]);

  if (loading) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', height: '60vh', gap: 16, color: 'var(--text-muted)' }}>
        <CircularProgress size={32} sx={{ color: 'var(--green)' }} />
        <span style={{ fontSize: '0.9rem', fontWeight: 500 }}>Connecting to Customer Support Gateway...</span>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', height: 'calc(100vh - 110px)', animation: 'fadeIn 0.3s ease', maxWidth: 1600, margin: '0 auto', width: '100%' }}>
      
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem', flexShrink: 0 }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <h2 style={{ margin: 0, fontSize: '1.65rem', fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '-0.02em' }}>
              Customer Support Desk
            </h2>
            <div style={{
              display: 'inline-flex', alignItems: 'center', gap: 6, padding: '3px 10px', borderRadius: 20,
              background: isLiveConnected ? 'rgba(34,197,94,0.12)' : 'rgba(239,68,68,0.12)',
              color: isLiveConnected ? 'var(--green)' : '#ef4444',
              border: `1px solid ${isLiveConnected ? 'rgba(34,197,94,0.3)' : 'rgba(239,68,68,0.3)'}`,
              fontSize: '0.74rem', fontWeight: 700
            }}>
              <FiberManualRecordIcon sx={{ fontSize: 9, animation: isLiveConnected ? 'pulse 2s infinite' : 'none' }} />
              {isLiveConnected ? 'Live Socket Stream Active' : 'Connecting Stream...'}
            </div>
          </div>
          <p style={{ margin: '4px 0 0', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
            Real-time direct messaging desk for resolving buyer inquiries and technical specifications.
          </p>
        </div>
      </div>

      <div style={{
        display: 'grid', gridTemplateColumns: '380px 1fr', gap: '1.25rem',
        flexGrow: 1, minHeight: 0, overflow: 'hidden'
      }}>
        
        <div style={{
          background: 'var(--bg-secondary)', borderRadius: 18, border: '1px solid var(--border)',
          display: 'flex', flexDirection: 'column', overflow: 'hidden', boxShadow: '0 4px 16px rgba(0,0,0,0.03)'
        }}>
          
          <div style={{ padding: '1.1rem', borderBottom: '1px solid var(--border)', display: 'flex', flexDirection: 'column', gap: 10 }}>
            
            <div style={{ position: 'relative', width: '100%' }}>
              <SearchIcon sx={{ fontSize: 17, color: 'var(--text-muted)', position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)' }} />
              <input
                type="text"
                placeholder="Search customer, or message..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                style={{
                  width: '100%', background: 'var(--bg-primary)', border: '1px solid var(--border-light)',
                  padding: '9px 32px 9px 36px', borderRadius: 10, color: 'var(--text-primary)', fontSize: '0.84rem',
                  outline: 'none', transition: 'border-color 0.2s', boxSizing: 'border-box'
                }}
                onFocus={e => e.target.style.borderColor = 'var(--green)'}
                onBlur={e => e.target.style.borderColor = 'var(--border-light)'}
              />
              {searchTerm && (
                <button
                  onClick={() => setSearchTerm('')}
                  style={{ position: 'absolute', right: 8, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', display: 'flex' }}
                >
                  <ClearIcon sx={{ fontSize: 14 }} />
                </button>
              )}
            </div>

          </div>

          <div style={{ flexGrow: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column' }}>
            {filteredInquiries.length === 0 ? (
              <div style={{ padding: '3rem 1.5rem', textAlign: 'center', color: 'var(--text-muted)', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
                <ChatBubbleOutlinedIcon sx={{ fontSize: 36, opacity: 0.3 }} />
                <span style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--text-primary)' }}>No inquiries found</span>
                <span style={{ fontSize: '0.78rem' }}>Try clearing the search filter.</span>
              </div>
            ) : (
              filteredInquiries.map((inquiry) => {
                const isSelected = selectedInquiryId === inquiry.id;
                const customerName = getCustomerName(inquiry);
                const lastMsg = inquiry.messages && inquiry.messages.length > 0
                  ? inquiry.messages[inquiry.messages.length - 1]
                  : null;
                const isLastMsgFromStaff = lastMsg?.sender?.role === 'sales' || lastMsg?.sender?.role === 'admin';

                return (
                  <div
                    key={inquiry.id}
                    onClick={() => handleSelectInquiry(inquiry.id)}
                    style={{
                      padding: '1rem 1.15rem',
                      borderBottom: '1px solid var(--border-light)',
                      borderLeft: isSelected ? '4px solid var(--green)' : '4px solid transparent',
                      background: isSelected ? 'rgba(34,197,94,0.06)' : 'transparent',
                      cursor: 'pointer', transition: 'all 0.15s cubic-bezier(0.4,0,0.2,1)',
                      display: 'flex', flexDirection: 'column', gap: 6
                    }}
                    onMouseEnter={e => { if (!isSelected) e.currentTarget.style.background = 'var(--bg-tertiary)'; }}
                    onMouseLeave={e => { if (!isSelected) e.currentTarget.style.background = 'transparent'; }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, minWidth: 0 }}>
                      <Avatar 
                        src={inquiry.user?.customerProfile?.avatarUrl || '/default-profile.png'}
                        alt={customerName}
                        sx={{
                          width: 28, height: 28, fontSize: '0.75rem', fontWeight: 700,
                          bgcolor: isSelected ? 'var(--green)' : '#4f772d',
                          color: isSelected ? '#000000' : '#ffffff'
                        }}
                      />
                      <span style={{ fontSize: '0.88rem', fontWeight: 700, color: 'var(--text-primary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {customerName}
                      </span>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                      <span style={{ fontSize: '0.68rem', fontWeight: 700, color: 'var(--text-muted)', fontFamily: 'monospace' }}>
                        #INQ-{inquiry.id.toString().padStart(4, '0')}
                      </span>
                      <span style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-primary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {inquiry.subject || 'Customer Inquiry'}
                      </span>
                    </div>

                    <div style={{ fontSize: '0.76rem', color: 'var(--text-muted)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', lineHeight: 1.4 }}>
                      {lastMsg ? (
                        <>
                          <span style={{ fontWeight: 600, color: isLastMsgFromStaff ? 'var(--green)' : 'var(--text-primary)' }}>
                            {isLastMsgFromStaff ? 'You: ' : `${customerName.split(' ')[0]}: `}
                          </span>
                          <span>{formatMessagePreview(lastMsg.content)}</span>
                        </>
                      ) : (
                        'No messages yet.'
                      )}
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'flex-end', fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: 2 }}>
                      <span style={{ display: 'inline-flex', alignItems: 'center', gap: 3 }}>
                        <AccessTimeIcon sx={{ fontSize: 11 }} />
                        {formatRelativeTime(inquiry.updatedAt || inquiry.createdAt)}
                      </span>
                    </div>

                  </div>
                );
              })
            )}
          </div>

        </div>

        <div style={{
          background: 'var(--bg-secondary)', borderRadius: 18, border: '1px solid var(--border)',
          display: 'flex', flexDirection: 'column', overflow: 'hidden', boxShadow: '0 4px 16px rgba(0,0,0,0.03)'
        }}>
          {selectedInquiry ? (
            <>
              <div style={{
                padding: '1rem 1.5rem', borderBottom: '1px solid var(--border)',
                background: 'var(--bg-secondary)', display: 'flex', justifyContent: 'space-between',
                alignItems: 'center', flexWrap: 'wrap', gap: '1rem', flexShrink: 0
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <Avatar 
                    src={selectedInquiry.user?.customerProfile?.avatarUrl || '/default-profile.png'}
                    alt={getCustomerName(selectedInquiry)}
                    sx={{
                      width: 44, height: 44, bgcolor: '#4f772d', color: '#ffffff',
                      fontWeight: 800, fontSize: '1.1rem', boxShadow: '0 2px 8px rgba(79,119,45,0.3)'
                    }}
                  />
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <span style={{ fontSize: '1.05rem', fontWeight: 800, color: 'var(--text-primary)' }}>
                        {getCustomerName(selectedInquiry)}
                      </span>
                      <span style={{
                        fontSize: '0.7rem', fontWeight: 700, padding: '2px 8px', borderRadius: 6,
                        background: 'var(--bg-tertiary)', color: 'var(--text-muted)', border: '1px solid var(--border-light)', fontFamily: 'monospace'
                      }}>
                        #INQ-{selectedInquiry.id.toString().padStart(4, '0')}
                      </span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginTop: 4, flexWrap: 'wrap' }}>
                      <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                        <MailOutlinedIcon sx={{ fontSize: 14 }} />
                        {selectedInquiry.customer?.email}
                      </span>
                      {selectedInquiry.customer?.customerProfile?.contactNumber && (
                        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                          <PhoneInTalkOutlinedIcon sx={{ fontSize: 14 }} />
                          {selectedInquiry.customer.customerProfile.contactNumber}
                        </span>
                      )}
                      {selectedInquiry.customer?.customerProfile?.city && (
                        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                          <PlaceOutlinedIcon sx={{ fontSize: 14 }} />
                          {selectedInquiry.customer.customerProfile.city}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

              </div>

              <div style={{
                flexGrow: 1, overflowY: 'auto', padding: '1.5rem',
                background: 'var(--bg-primary)', display: 'flex', flexDirection: 'column', gap: 14
              }}>
                
                <div style={{
                  padding: '10px 14px', borderRadius: 12, background: 'var(--bg-secondary)',
                  border: '1px solid var(--border-light)', display: 'flex', justifyContent: 'space-between', alignItems: 'center'
                }}>
                  <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
                    Inquiry Topic: <span style={{ fontWeight: 700, color: 'var(--text-primary)' }}>{selectedInquiry.subject || 'General Inquiry'}</span>
                  </div>
                  <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                    Created on {new Date(selectedInquiry.createdAt).toLocaleDateString('en-PH', { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                  </div>
                </div>

                {(!selectedInquiry.messages || selectedInquiry.messages.length === 0) ? (
                  <div style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '2rem', fontSize: '0.85rem' }}>
                    No messages recorded yet. Start the conversation below.
                  </div>
                ) : (
                  selectedInquiry.messages.map((msg, index) => {
                    const isStaff = msg.sender?.role === 'sales' || msg.sender?.role === 'admin';
                    const staffName = msg.sender?.salesProfile?.name || msg.sender?.adminProfile?.name || 'Sales Rep';
                    const customerSenderName = getCustomerName(selectedInquiry);
                    const { text, image } = parseMessageContent(msg.content);

                    return (
                      <div
                        key={msg.id || index}
                        style={{
                          alignSelf: isStaff ? 'flex-end' : 'flex-start',
                          maxWidth: '75%',
                          display: 'flex',
                          flexDirection: 'column',
                          alignItems: isStaff ? 'flex-end' : 'flex-start',
                          gap: 4
                        }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.72rem', color: 'var(--text-muted)', fontWeight: 600 }}>
                          <span>{isStaff ? `You (${staffName})` : customerSenderName}</span>
                          <span>•</span>
                          <span>{new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                        </div>

                        <div
                          style={{
                            padding: text ? '12px 16px' : '8px 8px',
                            borderRadius: 16,
                            borderTopLeftRadius: !isStaff ? 4 : 16,
                            borderTopRightRadius: isStaff ? 4 : 16,
                            background: isStaff
                              ? 'linear-gradient(135deg, #16a34a 0%, #22c55e 100%)'
                              : 'var(--bg-secondary)',
                            color: isStaff ? '#ffffff' : 'var(--text-primary)',
                            border: isStaff ? 'none' : '1px solid var(--border-light)',
                            fontSize: '0.88rem',
                            lineHeight: 1.55,
                            boxShadow: isStaff ? '0 4px 14px rgba(34,197,94,0.25)' : '0 2px 8px rgba(0,0,0,0.04)',
                            wordBreak: 'break-word',
                            whiteSpace: 'pre-wrap'
                          }}
                        >
                          {text && <div>{text}</div>}

                          {image && (
                            <div
                              style={{
                                marginTop: text ? 8 : 0,
                                cursor: 'pointer',
                                borderRadius: 10,
                                overflow: 'hidden',
                                border: '1px solid rgba(255,255,255,0.2)',
                                maxWidth: 320,
                                position: 'relative',
                                transition: 'transform 0.15s ease, opacity 0.15s ease'
                              }}
                              onClick={() => handleOpenImagePreviewModal(image)}
                            >
                              <img
                                src={image}
                                alt="Attachment"
                                style={{
                                  display: 'block',
                                  width: '100%',
                                  maxHeight: 240,
                                  objectFit: 'cover'
                                }}
                                loading="lazy"
                              />
                              <div
                                style={{
                                  position: 'absolute',
                                  bottom: 6,
                                  right: 6,
                                  background: 'rgba(0,0,0,0.7)',
                                  color: '#ffffff',
                                  borderRadius: 4,
                                  padding: '2px 8px',
                                  fontSize: '0.68rem',
                                  fontWeight: 700
                                }}
                              >
                                View Full Image
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })
                )}
                <div ref={messagesEndRef} />
              </div>

              <div style={{
                padding: '1rem 1.5rem', borderTop: '1px solid var(--border)',
                background: 'var(--bg-secondary)', display: 'flex', flexDirection: 'column', gap: 8, flexShrink: 0
              }}>
                
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, overflowX: 'auto', paddingBottom: 2 }}>
                  <span style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.04em', flexShrink: 0 }}>
                    Quick Macros:
                  </span>
                  {QUICK_MACROS.map((m, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => setNewMessage(m.text)}
                      style={{
                        padding: '4px 10px', borderRadius: 8, background: 'var(--bg-tertiary)',
                        border: '1px solid var(--border-light)', color: 'var(--text-primary)',
                        fontSize: '0.74rem', fontWeight: 600, cursor: 'pointer', whiteSpace: 'nowrap',
                        transition: 'all 0.15s ease', flexShrink: 0
                      }}
                      onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--green)'; }}
                      onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border-light)'; }}
                    >
                      {m.label}
                    </button>
                  ))}
                </div>

                {attachedImage && (
                  <div style={{
                    display: 'flex', alignItems: 'center', gap: 10, padding: '8px 12px',
                    borderRadius: 10, background: 'var(--bg-primary)', border: '1px solid var(--border-light)',
                    maxWidth: 320
                  }}>
                    <img
                      src={attachedImage}
                      alt="Attachment preview"
                      style={{ width: 44, height: 44, borderRadius: 6, objectFit: 'cover', border: '1px solid var(--border-light)' }}
                    />
                    <div style={{ flexGrow: 1, minWidth: 0, fontSize: '0.78rem' }}>
                      <div style={{ fontWeight: 700, color: 'var(--text-primary)' }}>Image attached</div>
                      <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Ready to send</div>
                    </div>
                    <button
                      type="button"
                      onClick={handleRemoveImageAttachment}
                      style={{
                        background: 'transparent', border: 'none', cursor: 'pointer',
                        color: 'var(--text-muted)', padding: 4, display: 'flex', alignItems: 'center'
                      }}
                      title="Remove attached image"
                    >
                      <CloseIcon sx={{ fontSize: 16 }} />
                    </button>
                  </div>
                )}

                <form onSubmit={handleSendInquiryMessage} style={{ display: 'flex', gap: 10, alignItems: 'flex-end' }}>
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleSelectImageAttachment}
                    accept="image/png,image/jpeg,image/webp,image/jpg"
                    style={{ display: 'none' }}
                  />

                  <button
                    type="button"
                    onClick={handleTriggerImageFileInput}
                    disabled={sending || compressing}
                    style={{
                      height: 52, width: 48, borderRadius: 12, border: '1px solid var(--border-light)',
                      background: attachedImage ? 'rgba(34,197,94,0.15)' : 'var(--bg-primary)',
                      color: attachedImage ? 'var(--green)' : 'var(--text-muted)',
                      cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
                      flexShrink: 0, transition: 'all 0.15s ease'
                    }}
                    title="Attach image or diagram"
                  >
                    {compressing ? <CircularProgress size={18} color="inherit" /> : <ImageOutlinedIcon sx={{ fontSize: 20 }} />}
                  </button>

                  <div style={{ position: 'relative', flexGrow: 1 }}>
                    <textarea
                      ref={textareaRef}
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      onKeyDown={handleComposerKeyDown}
                      placeholder="Type your response... (Press Enter to send, Shift+Enter for new line)"
                      rows={2}
                      style={{
                        width: '100%', background: 'var(--bg-primary)', border: '1px solid var(--border-light)',
                        padding: '10px 14px', borderRadius: 12, color: 'var(--text-primary)', fontSize: '0.88rem',
                        outline: 'none', resize: 'none', lineHeight: 1.5, boxSizing: 'border-box',
                        fontFamily: 'inherit', transition: 'border-color 0.2s'
                      }}
                      onFocus={e => e.target.style.borderColor = 'var(--green)'}
                      onBlur={e => e.target.style.borderColor = 'var(--border-light)'}
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={(!newMessage.trim() && !attachedImage) || sending || compressing}
                    style={{
                      height: 52, padding: '0 24px', borderRadius: 12, border: 'none',
                      background: 'var(--green)', color: '#000000', fontSize: '0.85rem', fontWeight: 700,
                      cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
                      opacity: ((!newMessage.trim() && !attachedImage) || sending || compressing) ? 0.5 : 1,
                      boxShadow: '0 4px 14px rgba(34,197,94,0.3)', transition: 'all 0.2s cubic-bezier(0.4,0,0.2,1)',
                      flexShrink: 0
                    }}
                  >
                    {sending ? (
                      <CircularProgress size={18} color="inherit" />
                    ) : (
                      <span>Send Message</span>
                    )}
                  </button>
                </form>

              </div>
            </>
          ) : (
            
            <div style={{
              display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
              height: '100%', padding: '3rem', color: 'var(--text-muted)', textAlign: 'center', gap: 16
            }}>
              <div style={{
                width: 80, height: 80, borderRadius: 24, background: 'rgba(34,197,94,0.1)',
                border: '1px solid rgba(34,197,94,0.25)', display: 'flex', alignItems: 'center', justifyContent: 'center'
              }}>
                <SupportAgentIcon sx={{ fontSize: 44, color: 'var(--green)' }} />
              </div>
              <div>
                <h3 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-primary)' }}>
                  Select an Inquiry to Start Assisting
                </h3>
                <p style={{ margin: '8px 0 0', fontSize: '0.85rem', maxWidth: 420, lineHeight: 1.6 }}>
                  Choose an active customer ticket from the left panel to review previous messages, send real-time replies, and track resolution status.
                </p>
              </div>

              <div style={{
                display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 12,
                marginTop: 12, width: '100%', maxWidth: 540
              }}>
                <div style={{ background: 'var(--bg-primary)', padding: '12px', borderRadius: 12, border: '1px solid var(--border-light)', textAlign: 'left' }}>
                  <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--green)', marginBottom: 2 }}>⚡ Target SLA</div>
                  <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Respond to new inquiries within 15 minutes for peak buyer satisfaction.</div>
                </div>
                <div style={{ background: 'var(--bg-primary)', padding: '12px', borderRadius: 12, border: '1px solid var(--border-light)', textAlign: 'left' }}>
                  <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--green)', marginBottom: 2 }}>💬 Quick Macros</div>
                  <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Use 1-click canned responses to confirm stock and logistics updates swiftly.</div>
                </div>
              </div>
            </div>
          )}
        </div>

      </div>

      <Dialog
        open={Boolean(previewImage)}
        onClose={handleCloseImagePreviewModal}
        maxWidth="md"
        fullWidth
        PaperProps={{
          style: {
            borderRadius: 16,
            background: 'var(--bg-primary)',
            color: 'var(--text-primary)',
            overflow: 'hidden'
          }
        }}
      >
        <div style={{ padding: '12px 16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid var(--border-light)' }}>
          <div style={{ fontWeight: 700, fontSize: '0.9rem' }}>Image Attachment Preview</div>
          <button
            type="button"
            onClick={handleCloseImagePreviewModal}
            style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', display: 'flex' }}
            aria-label="Close image preview"
          >
            <CloseIcon sx={{ fontSize: 18 }} />
          </button>
        </div>
        <div style={{ padding: 16, display: 'flex', justifyContent: 'center', alignItems: 'center', background: '#000000', maxHeight: '75vh', overflow: 'auto' }}>
          <img
            src={previewImage}
            alt="Enlarged attachment"
            style={{ maxWidth: '100%', maxHeight: '70vh', objectFit: 'contain' }}
          />
        </div>
      </Dialog>

      <style>{`
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        @keyframes fadeIn { from { opacity: 0; transform: translateY(6px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes pulse { 0% { opacity: 1; } 50% { opacity: 0.4; } 100% { opacity: 1; } }
      `}</style>
    </div>
  );
};

export default CustomerService;
