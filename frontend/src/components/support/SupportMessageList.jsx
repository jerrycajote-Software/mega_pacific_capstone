import React from 'react';
import { Box, Typography, Chip, CircularProgress, Paper, Avatar } from '@mui/material';

const QUICK_PROMPTS = [
  '📐 I would like to request a quotation for custom-cut roofing sheets.',
  '🎨 Are all pre-painted coil colors and gauges currently in stock?',
  '🚚 How does delivery scheduling and site drop-off work?',
  '📋 I need assistance with my order checkout and payment options.'
];

const formatMessageTime = (dateString) => {
  if (!dateString) return '';
  try {
    const d = new Date(dateString);
    if (isNaN(d.getTime())) return '';
    return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  } catch {
    return '';
  }
};

const SupportMessageList = ({
  messages = [],
  loading = false,
  currentUser = null,
  onSelectPrompt,
  messagesEndRef
}) => {
  if (loading) {
    return (
      <Box sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', p: 4, gap: 1.5 }}>
        <CircularProgress size={32} sx={{ color: 'primary.main' }} />
        <Typography variant="body2" color="text.secondary">
          Loading conversation history...
        </Typography>
      </Box>
    );
  }

  return (
    <Box
      sx={{
        flexGrow: 1,
        p: { xs: 1.5, sm: 3 },
        overflowY: 'auto',
        overflowX: 'hidden',
        maxWidth: '100%',
        boxSizing: 'border-box',
        bgcolor: (theme) => theme.palette.mode === 'dark' ? '#0b1120' : '#f8fafc',
        display: 'flex',
        flexDirection: 'column',
        gap: 2
      }}
    >
      <Paper
        elevation={0}
        sx={{
          p: 2,
          borderRadius: 2.5,
          bgcolor: (theme) => theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.03)' : '#ffffff',
          border: '1px solid',
          borderColor: 'divider',
          display: 'flex',
          flexDirection: 'column',
          gap: 1.5
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <Box
            sx={{
              width: 36,
              height: 36,
              borderRadius: '50%',
              bgcolor: 'rgba(79, 119, 45, 0.12)',
              color: 'primary.main',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0
            }}
          >
            <i className="fi fi-rr-shield-check" style={{ fontSize: '18px' }}></i>
          </Box>
          <Box>
            <Typography variant="subtitle2" sx={{ fontWeight: 800 }}>
              Welcome to Mega Pacific Support Desk
            </Typography>
            <Typography variant="caption" sx={{ color: 'text.secondary' }}>
              Direct messaging with verified sales and technical specialists.
            </Typography>
          </Box>
        </Box>

        <Typography variant="body2" sx={{ color: 'text.secondary', fontSize: '0.82rem', lineHeight: 1.5 }}>
          Need assistance with custom roof corrugation, bended trims, coil gauge choices, or delivery tracking? Send us a message below or select a quick inquiry topic:
        </Typography>

        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, pt: 0.5 }}>
          {QUICK_PROMPTS.map((prompt, idx) => (
            <Chip
              key={idx}
              label={prompt}
              onClick={() => onSelectPrompt && onSelectPrompt(prompt)}
              clickable
              size="small"
              sx={{
                bgcolor: (theme) => theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.06)' : '#f1f5f9',
                border: '1px solid',
                borderColor: 'divider',
                fontSize: '0.74rem',
                fontWeight: 600,
                borderRadius: 2,
                py: 1.5,
                height: 'auto',
                whiteSpace: 'normal',
                textAlign: 'left',
                '& .MuiChip-label': { px: 1.25, py: 0.5 },
                '&:hover': {
                  bgcolor: 'rgba(79, 119, 45, 0.1)',
                  borderColor: 'primary.main',
                  color: 'primary.main'
                }
              }}
            />
          ))}
        </Box>
      </Paper>

      {messages.length > 0 && (
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', my: 1 }}>
          <Typography
            variant="caption"
            sx={{
              px: 1.5,
              py: 0.25,
              borderRadius: 3,
              bgcolor: (theme) => theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.05)' : '#e2e8f0',
              color: 'text.secondary',
              fontSize: '0.7rem',
              fontWeight: 700
            }}
          >
            Conversation Thread
          </Typography>
        </Box>
      )}

      {messages.map((msg, index) => {
        const isCustomer = msg?.senderId === currentUser?.id || msg?.sender?.role === 'customer';
        const senderName = msg?.sender?.name || (isCustomer ? 'You' : 'Sales Specialist');
        const timeFormatted = formatMessageTime(msg?.createdAt);

        return (
          <Box
            key={index}
            sx={{
              alignSelf: isCustomer ? 'flex-end' : 'flex-start',
              maxWidth: { xs: '88%', sm: '80%' },
              display: 'flex',
              flexDirection: 'column',
              alignItems: isCustomer ? 'flex-end' : 'flex-start',
              gap: 0.5
            }}
          >
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                gap: 0.75,
                px: 0.5
              }}
            >
              {!isCustomer && (
                <Avatar
                  sx={{
                    width: 20,
                    height: 20,
                    fontSize: '10px',
                    fontWeight: 800,
                    bgcolor: '#16a34a',
                    color: '#ffffff'
                  }}
                >
                  S
                </Avatar>
              )}
              <Typography variant="caption" sx={{ fontWeight: 700, color: isCustomer ? 'primary.main' : 'text.secondary', fontSize: '0.72rem' }}>
                {senderName}
              </Typography>
              {timeFormatted && (
                <Typography variant="caption" sx={{ color: 'text.secondary', fontSize: '0.68rem' }}>
                  • {timeFormatted}
                </Typography>
              )}
            </Box>

            <Paper
              elevation={0}
              sx={{
                p: { xs: 1.5, sm: 2 },
                borderRadius: 2.5,
                bgcolor: isCustomer ? 'primary.main' : (theme) => theme.palette.mode === 'dark' ? '#1e293b' : '#ffffff',
                color: isCustomer ? '#ffffff' : 'text.primary',
                border: '1px solid',
                borderColor: isCustomer ? 'primary.dark' : 'divider',
                boxShadow: isCustomer ? '0 2px 8px rgba(79, 119, 45, 0.2)' : '0 2px 6px rgba(0, 0, 0, 0.04)',
                wordBreak: 'break-word',
                lineHeight: 1.6,
                fontSize: '0.88rem'
              }}
            >
              <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap', fontSize: 'inherit', color: 'inherit' }}>
                {msg?.content}
              </Typography>
            </Paper>
          </Box>
        );
      })}

      <div ref={messagesEndRef} />
    </Box>
  );
};

export default SupportMessageList;
