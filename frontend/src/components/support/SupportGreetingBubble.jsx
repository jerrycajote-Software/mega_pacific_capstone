import React, { useState, useEffect, useRef } from 'react';
import { Box, Typography } from '@mui/material';

const INITIAL_SHOW_DELAY_MS = 1500;
const VISIBLE_DURATION_MS = 3200;
const REPEAT_INTERVAL_MS = 5000;

// Floating speech bubble that pops up above the Live Support Desk every 5 seconds
const SupportGreetingBubble = ({ isOpen = false, onOpenSupport }) => {
  const [isVisible, setIsVisible] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const showTimerRef = useRef(null);
  const hideTimerRef = useRef(null);

  useEffect(() => {
    const clearTimers = () => {
      if (showTimerRef.current) {
        clearTimeout(showTimerRef.current);
        showTimerRef.current = null;
      }
      if (hideTimerRef.current) {
        clearTimeout(hideTimerRef.current);
        hideTimerRef.current = null;
      }
    };

    if (isOpen) {
      clearTimers();
      setIsVisible(false);
      return clearTimers;
    }

    const scheduleShow = (delayMs) => {
      clearTimers();
      showTimerRef.current = setTimeout(() => {
        setIsVisible(true);
      }, delayMs);
    };

    // Show shortly after load, then reappear every 5 seconds after hiding
    scheduleShow(INITIAL_SHOW_DELAY_MS);

    return clearTimers;
  }, [isOpen]);

  useEffect(() => {
    if (isOpen || !isVisible || isHovered) return undefined;

    hideTimerRef.current = setTimeout(() => {
      setIsVisible(false);
      showTimerRef.current = setTimeout(() => {
        setIsVisible(true);
      }, REPEAT_INTERVAL_MS);
    }, VISIBLE_DURATION_MS);

    return () => {
      if (hideTimerRef.current) {
        clearTimeout(hideTimerRef.current);
        hideTimerRef.current = null;
      }
    };
  }, [isOpen, isVisible, isHovered]);

  const handleOpenSupportFromGreeting = () => {
    setIsVisible(false);
    if (onOpenSupport) {
      onOpenSupport();
    }
  };

  const handleGreetingMouseEnter = () => {
    setIsHovered(true);
  };

  const handleGreetingMouseLeave = () => {
    setIsHovered(false);
  };

  if (isOpen) return null;

  return (
    <Box
      component="button"
      type="button"
      onClick={handleOpenSupportFromGreeting}
      onMouseEnter={handleGreetingMouseEnter}
      onMouseLeave={handleGreetingMouseLeave}
      aria-label="Open Live Support Desk: How can I help you today?"
      aria-hidden={!isVisible}
      tabIndex={isVisible ? 0 : -1}
      sx={{
        position: 'relative',
        display: 'flex',
        alignItems: 'center',
        gap: 1,
        px: 1.75,
        py: 1,
        mb: 0.5,
        bgcolor: 'background.paper',
        color: 'text.primary',
        border: '1px solid rgba(30, 58, 138, 0.28)',
        borderRadius: '14px',
        boxShadow: '0 10px 28px rgba(15, 23, 42, 0.14), 0 2px 6px rgba(30, 58, 138, 0.14)',
        cursor: isVisible ? 'pointer' : 'default',
        pointerEvents: isVisible ? 'auto' : 'none',
        userSelect: 'none',
        opacity: isVisible ? 1 : 0,
        transform: isVisible ? 'translateY(0) scale(1)' : 'translateY(10px) scale(0.94)',
        transition:
          'opacity 0.28s cubic-bezier(0.16, 1, 0.3, 1), transform 0.32s cubic-bezier(0.16, 1, 0.3, 1), border-color 0.2s ease, box-shadow 0.2s ease',
        animation: isVisible ? 'supportBubbleFloat 2.4s ease-in-out infinite' : 'none',
        '@keyframes supportBubbleFloat': {
          '0%, 100%': { transform: 'translateY(0) scale(1)' },
          '50%': { transform: 'translateY(-4px) scale(1)' },
        },
        '@media (prefers-reduced-motion: reduce)': {
          animation: 'none',
        },
        '&:hover': {
          borderColor: 'primary.main',
          boxShadow: '0 14px 32px rgba(30, 58, 138, 0.24)',
        },
        // Speech bubble pointer aligned above the Live Support Desk tab
        '&::after': {
          content: '""',
          position: 'absolute',
          bottom: -6,
          right: 26,
          width: 11,
          height: 11,
          bgcolor: 'background.paper',
          borderRight: '1px solid rgba(30, 58, 138, 0.28)',
          borderBottom: '1px solid rgba(30, 58, 138, 0.28)',
          transform: 'rotate(45deg)',
        },
      }}
    >
      <Box
        sx={{
          width: 8,
          height: 8,
          borderRadius: '50%',
          bgcolor: '#22c55e',
          boxShadow: '0 0 0 3px rgba(34, 197, 94, 0.2)',
          flexShrink: 0,
        }}
      />
      <Typography
        variant="body2"
        sx={{
          fontWeight: 700,
          fontSize: { xs: '0.78rem', sm: '0.82rem' },
          color: 'text.primary',
          whiteSpace: 'nowrap',
          lineHeight: 1.25,
        }}
      >
        How can I help you today?
      </Typography>
    </Box>
  );
};

export default SupportGreetingBubble;
