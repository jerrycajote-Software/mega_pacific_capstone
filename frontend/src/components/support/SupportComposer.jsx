import React from 'react';
import { Box, TextField, Button, Typography, IconButton, Tooltip } from '@mui/material';

const SupportComposer = ({
  newMessage = '',
  onChangeMessage,
  onSendMessage,
  onClearMessage,
  sending = false
}) => {
  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      if (newMessage.trim() && !sending) {
        onSendMessage(e);
      }
    }
  };

  const isMessageEmpty = !newMessage.trim();

  return (
    <Box
      component="form"
      onSubmit={onSendMessage}
      sx={{
        p: { xs: 1.5, sm: 2 },
        borderTop: '1px solid',
        borderColor: 'divider',
        bgcolor: 'background.paper',
        display: 'flex',
        flexDirection: 'column',
        gap: 1.25,
        flexShrink: 0
      }}
    >
      <TextField
        fullWidth
        multiline
        minRows={2}
        maxRows={5}
        size="small"
        placeholder="Type your message or technical question here... (Press Enter to send, Shift+Enter for new line)"
        value={newMessage}
        onChange={(e) => onChangeMessage(e.target.value)}
        onKeyDown={handleKeyDown}
        autoComplete="off"
        disabled={sending}
        sx={{
          '& .MuiOutlinedInput-root': {
            borderRadius: 2.5,
            bgcolor: (theme) => theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.02)' : '#ffffff',
            fontSize: '0.88rem',
            lineHeight: 1.5,
            transition: 'border-color 0.2s',
            '&.Mui-focused fieldset': {
              borderColor: 'primary.main',
              borderWidth: '1.5px'
            }
          }
        }}
      />

      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 1, flexWrap: 'wrap' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Typography variant="caption" sx={{ color: 'text.secondary', fontSize: '0.73rem', display: { xs: 'none', sm: 'inline-block' } }}>
            Press <kbd style={{ padding: '2px 5px', borderRadius: 4, background: '#f1f5f9', border: '1px solid #cbd5e1', fontSize: '10px' }}>Enter ↵</kbd> to send • <kbd style={{ padding: '2px 5px', borderRadius: 4, background: '#f1f5f9', border: '1px solid #cbd5e1', fontSize: '10px' }}>Shift + Enter</kbd> for new line
          </Typography>
          {!isMessageEmpty && (
            <Tooltip title="Clear message draft">
              <IconButton
                size="small"
                onClick={onClearMessage}
                aria-label="Clear message draft"
                sx={{ p: 0.5, color: 'text.secondary', '&:hover': { color: 'error.main' } }}
              >
                <i className="fi fi-rr-trash" style={{ fontSize: '13px' }} />
              </IconButton>
            </Tooltip>
          )}
        </Box>

        <Button
          type="submit"
          variant="contained"
          color="primary"
          disabled={isMessageEmpty || sending}
          startIcon={<i className="fi fi-rr-paper-plane" style={{ fontSize: '14px' }} />}
          sx={{
            px: 2.5,
            py: 0.8,
            borderRadius: 2,
            fontWeight: 700,
            fontSize: '0.82rem',
            textTransform: 'none',
            boxShadow: 'none',
            '&:hover': {
              boxShadow: '0 4px 12px rgba(79, 119, 45, 0.25)'
            }
          }}
        >
          {sending ? 'Sending...' : 'Send Message'}
        </Button>
      </Box>
    </Box>
  );
};

export default SupportComposer;
