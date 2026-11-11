import React, { useRef, useState } from 'react';
import {
  Box,
  TextField,
  Button,
  Typography,
  IconButton,
  Tooltip,
  Alert,
  CircularProgress,
  Popover
} from '@mui/material';
import {
  CustomImageOutlinedIcon as ImageOutlinedIcon,
  CustomCloseIcon as CloseIcon,
  CustomChevronRightIcon as ChevronRightIcon
} from '../icons';

import { isMobileBrowser } from '../../utils/deviceDetect';
import { compressChatImage } from '../../utils/chatImageHelper';
import { FAQ_QUESTIONS } from '../../utils/supportFaqData';

const HamburgerPill = ({ active = false }) => (
  <Box
    sx={{
      display: 'inline-flex',
      alignItems: 'center',
      justifyContent: 'center',
      width: 48,
      height: 26,
      borderRadius: '9999px',
      bgcolor: (theme) =>
        theme.palette.mode === 'dark'
          ? active ? 'rgba(0, 102, 255, 0.25)' : '#22252a'
          : active ? 'rgba(0, 102, 255, 0.15)' : '#e2e8f0',
      border: '1.5px solid',
      borderColor: active
        ? '#0066ff'
        : (theme) => theme.palette.mode === 'dark' ? '#33373e' : '#cbd5e1',
      transition: 'all 0.15s ease',
      cursor: 'pointer',
      p: 0,
      flexShrink: 0,
      boxShadow: active ? '0 0 0 2px rgba(0, 102, 255, 0.25)' : 'none',
      '&:hover': {
        borderColor: '#0066ff',
        bgcolor: (theme) =>
          theme.palette.mode === 'dark' ? '#2e3238' : '#dbeafe'
      }
    }}
  >
    <svg width="20" height="14" viewBox="0 0 20 14" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M2.5 2.5H17.5" stroke="#0066ff" strokeWidth="2.5" strokeLinecap="round" />
      <path d="M2.5 7H17.5" stroke="#0066ff" strokeWidth="2.5" strokeLinecap="round" />
      <path d="M2.5 11.5H17.5" stroke="#0066ff" strokeWidth="2.5" strokeLinecap="round" />
    </svg>
  </Box>
);

const SupportComposer = ({
  newMessage = '',
  onChangeMessage,
  onSendMessage,
  onClearMessage,
  onSendFaq,
  sending = false,
  attachedImage = null,
  onAttachImage,
  onRemoveAttachedImage
}) => {
  const fileInputRef = useRef(null);
  const [compressing, setCompressing] = useState(false);
  const [uploadError, setUploadError] = useState('');
  const [faqAnchorEl, setFaqAnchorEl] = useState(null);

  const isFaqOpen = Boolean(faqAnchorEl);

  const handleToggleFaqMenu = (e) => {
    setFaqAnchorEl((prev) => (prev ? null : e.currentTarget));
  };

  const handleCloseFaqMenu = () => {
    setFaqAnchorEl(null);
  };

  const handleSelectFaqQuestion = (faq) => {
    handleCloseFaqMenu();
    if (onSendFaq && !sending) {
      onSendFaq({
        question: faq.question,
        answer: faq.answer
      });
    }
  };

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

      {/* Quick Questions hamburger button function before the message bar */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.25, mb: 0.25 }}>
        <Tooltip title="Quick Questions (FAQs)">
          <Box
            component="button"
            type="button"
            onClick={handleToggleFaqMenu}
            aria-label="Open quick roofing questions menu"
            aria-expanded={isFaqOpen}
            disabled={sending}
            sx={{
              border: 'none',
              bgcolor: 'transparent',
              p: 0,
              cursor: 'pointer',
              display: 'inline-flex',
              outline: 'none'
            }}
          >
            <HamburgerPill active={isFaqOpen} />
          </Box>
        </Tooltip>

        <Typography
          variant="caption"
          onClick={handleToggleFaqMenu}
          sx={{
            color: isFaqOpen ? '#0066ff' : 'text.secondary',
            fontSize: '0.74rem',
            fontWeight: 700,
            cursor: 'pointer',
            userSelect: 'none',
            transition: 'color 0.15s ease',
            '&:hover': { color: '#0066ff' }
          }}
        >
          Quick Questions
        </Typography>
      </Box>

      <Popover
        open={isFaqOpen}
        anchorEl={faqAnchorEl}
        onClose={handleCloseFaqMenu}
        anchorOrigin={{
          vertical: 'top',
          horizontal: 'left'
        }}
        transformOrigin={{
          vertical: 'bottom',
          horizontal: 'left'
        }}
        PaperProps={{
          sx: {
            p: 1.75,
            mb: 1,
            borderRadius: 3,
            width: { xs: '92vw', sm: 460 },
            maxWidth: '100%',
            maxHeight: 340,
            overflowY: 'auto',
            border: '1px solid',
            borderColor: 'divider',
            bgcolor: 'background.paper',
            boxShadow: '0 8px 30px rgba(0, 0, 0, 0.16)'
          }
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1.25 }}>
          <Box>
            <Typography variant="subtitle2" sx={{ fontWeight: 800, fontSize: '0.85rem' }}>
              Frequently Asked Questions
            </Typography>
            <Typography variant="caption" sx={{ color: 'text.secondary', fontSize: '0.72rem' }}>
              Click any question to ask and receive an instant automatic answer:
            </Typography>
          </Box>
          <IconButton size="small" onClick={handleCloseFaqMenu} aria-label="Close questions menu">
            <CloseIcon sx={{ fontSize: 16 }} />
          </IconButton>
        </Box>

        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.75 }}>
          {FAQ_QUESTIONS.map((faq) => (
            <Box
              key={faq.id}
              component="button"
              type="button"
              onClick={() => handleSelectFaqQuestion(faq)}
              disabled={sending}
              sx={{
                width: '100%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                p: 1.25,
                px: 1.5,
                borderRadius: 2,
                border: '1px solid',
                borderColor: 'divider',
                bgcolor: (theme) => theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.03)' : '#f8fafc',
                cursor: 'pointer',
                textAlign: 'left',
                gap: 1.5,
                transition: 'all 0.15s ease',
                '&:hover': {
                  borderColor: '#0066ff',
                  bgcolor: (theme) => theme.palette.mode === 'dark' ? 'rgba(0, 102, 255, 0.15)' : '#eff6ff',
                  color: '#0066ff'
                }
              }}
            >
              <Typography variant="body2" sx={{ fontWeight: 600, fontSize: '0.8rem', color: 'inherit' }}>
                {faq.question}
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', flexShrink: 0, color: 'inherit' }}>
                <ChevronRightIcon sx={{ fontSize: 15 }} />
              </Box>
            </Box>
          ))}
        </Box>
      </Popover>

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
