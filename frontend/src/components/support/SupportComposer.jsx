import React, { useRef, useState } from 'react';
import {
  Box,
  TextField,
  Button,
  Typography,
  IconButton,
  Tooltip,
  Alert,
  CircularProgress
} from '@mui/material';
import {
  CustomImageOutlinedIcon as ImageOutlinedIcon,
  CustomCloseIcon as CloseIcon
} from '../icons';

import { isMobileBrowser } from '../../utils/deviceDetect';
import { compressChatImage } from '../../utils/chatImageHelper';

const SupportComposer = ({
  newMessage = '',
  onChangeMessage,
  onSendMessage,
  onClearMessage,
  sending = false,
  attachedImage = null,
  onAttachImage,
  onRemoveAttachedImage
}) => {
  const fileInputRef = useRef(null);
  const [compressing, setCompressing] = useState(false);
  const [uploadError, setUploadError] = useState('');

  const handleComposerKeyDown = (e) => {
    const isMobile = isMobileBrowser() || (typeof window !== 'undefined' && window.innerWidth < 768);
    if (isMobile) {
      // On mobile virtual keyboards, allow Enter to insert a new line naturally.
      // Messages on mobile can only be submitted by tapping the Send Message button.
      return;
    }

    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      const hasContent = Boolean(newMessage.trim()) || Boolean(attachedImage);
      if (hasContent && !sending && !compressing) {
        onSendMessage(e);
      }
    }
  };

  const handleTriggerFileInput = () => {
    setUploadError('');
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handleSelectImageFile = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadError('');
    setCompressing(true);

    try {
      const compressedDataUrl = await compressChatImage(file, 1280, 0.82);
      if (onAttachImage) {
        onAttachImage(compressedDataUrl);
      }
    } catch (err) {
      console.error('Image compression failed:', err);
      setUploadError(err.message || 'Failed to process the selected image. Please try again.');
    } finally {
      setCompressing(false);
      if (e.target) {
        e.target.value = '';
      }
    }
  };

  const handleRemoveImageAttachment = () => {
    setUploadError('');
    if (onRemoveAttachedImage) {
      onRemoveAttachedImage();
    }
  };

  const hasDraft = Boolean(newMessage.trim()) || Boolean(attachedImage);

  return (
    <Box
      component="form"
      onSubmit={onSendMessage}
      sx={{
        p: { xs: 1.25, sm: 2 },
        borderTop: '1px solid',
        borderColor: 'divider',
        bgcolor: 'background.paper',
        display: 'flex',
        flexDirection: 'column',
        gap: 1.25,
        flexShrink: 0,
        maxWidth: '100%',
        boxSizing: 'border-box',
        overflowX: 'hidden'
      }}
    >
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleSelectImageFile}
        accept="image/png,image/jpeg,image/webp,image/jpg"
        style={{ display: 'none' }}
      />

      {uploadError && (
        <Alert
          severity="error"
          onClose={() => setUploadError('')}
          sx={{ py: 0.5, px: 1.5, fontSize: '0.78rem', borderRadius: 2 }}
        >
          {uploadError}
        </Alert>
      )}

      {attachedImage && (
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            gap: 1.5,
            p: 1,
            borderRadius: 2,
            border: '1px solid',
            borderColor: 'divider',
            bgcolor: (theme) => theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.04)' : '#f8fafc',
            maxWidth: '100%',
            overflow: 'hidden'
          }}
        >
          <Box
            component="img"
            src={attachedImage}
            alt="Attached preview"
            sx={{
              width: 54,
              height: 54,
              borderRadius: 1.5,
              objectFit: 'cover',
              border: '1px solid',
              borderColor: 'divider',
              flexShrink: 0
            }}
          />
          <Box sx={{ flexGrow: 1, minWidth: 0 }}>
            <Typography variant="caption" sx={{ fontWeight: 700, display: 'block', color: 'text.primary' }}>
              Image Attached
            </Typography>
            <Typography variant="caption" sx={{ color: 'text.secondary', fontSize: '0.72rem' }}>
              Ready to send with your message
            </Typography>
          </Box>
          <Tooltip title="Remove image attachment">
            <IconButton
              size="small"
              onClick={handleRemoveImageAttachment}
              disabled={sending}
              aria-label="Remove image attachment"
              sx={{ color: 'text.secondary', '&:hover': { color: 'error.main' } }}
            >
              <CloseIcon sx={{ fontSize: 16 }} />
            </IconButton>
          </Tooltip>
        </Box>
      )}

      <TextField
        fullWidth
        multiline
        minRows={2}
        maxRows={5}
        size="small"
        placeholder="Type your message or technical question here..."
        value={newMessage}
        onChange={(e) => onChangeMessage(e.target.value)}
        onKeyDown={handleComposerKeyDown}
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

          <Tooltip title="Attach photo or roofing plan">
            <span>
              <IconButton
                size="small"
                onClick={handleTriggerFileInput}
                disabled={sending || compressing}
                aria-label="Attach photo or roofing plan"
                sx={{
                  p: 0.75,
                  borderRadius: 2,
                  color: attachedImage ? 'primary.main' : 'text.secondary',
                  bgcolor: attachedImage
                    ? (theme) => theme.palette.mode === 'dark' ? 'rgba(79,119,45,0.25)' : 'rgba(79,119,45,0.1)'
                    : 'transparent',
                  '&:hover': {
                    color: 'primary.main',
                    bgcolor: (theme) => theme.palette.mode === 'dark' ? 'rgba(79,119,45,0.2)' : 'rgba(79,119,45,0.08)'
                  }
                }}
              >
                {compressing ? (
                  <CircularProgress size={16} sx={{ color: 'primary.main' }} />
                ) : (
                  <ImageOutlinedIcon sx={{ fontSize: 19 }} />
                )}
              </IconButton>
            </span>
          </Tooltip>

          {hasDraft && (
            <Tooltip title="Clear message draft">
              <IconButton
                size="small"
                onClick={() => {
                  handleRemoveImageAttachment();
                  onClearMessage();
                }}
                disabled={sending}
                aria-label="Clear message draft"
                sx={{ p: 0.75, color: 'text.secondary', '&:hover': { color: 'error.main' } }}
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
          disabled={!hasDraft || sending || compressing}
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
          {sending ? 'Sending...' : compressing ? 'Optimizing...' : 'Send Message'}
        </Button>
      </Box>
    </Box>
  );
};

export default SupportComposer;
