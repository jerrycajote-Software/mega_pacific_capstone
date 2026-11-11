import React, { useState, useEffect, useRef } from 'react';
import {
  Box,
  Typography,
  Paper,
  Button,
  Chip,
  LinearProgress,
} from '@mui/material';
import { getStructuralMeshMetadata } from '../constants/roofStructureSpecs';

const TOTAL_DURATION_MS = 10000;
const TICK_INTERVAL_MS = 100;

const FloatingStructuralMemberInspector = ({
  selectedMeshName,
  onClear,
  currentThickness = '0.35mm',
  currentColor = 'Marshall Dark Gray',
  sheetsPerSlope = 8,
  currentLength = 3.8,
}) => {
  const [remainingMs, setRemainingMs] = useState(TOTAL_DURATION_MS);
  const [isHovered, setIsHovered] = useState(false);
  const prevMeshNameRef = useRef(selectedMeshName);
  const onClearRef = useRef(onClear);

  useEffect(() => {
    onClearRef.current = onClear;
  }, [onClear]);

  const inspectedPart = selectedMeshName
    ? getStructuralMeshMetadata(selectedMeshName, {
        thickness: currentThickness,
        color: currentColor,
        sheetsPerSlope,
        length: currentLength,
      })
    : null;

  // Reset timer whenever a new 3D mesh is clicked
  useEffect(() => {
    if (selectedMeshName) {
      setRemainingMs(TOTAL_DURATION_MS);
      setIsHovered(false);
      prevMeshNameRef.current = selectedMeshName;
    }
  }, [selectedMeshName]);

  // Countdown timer with hover-to-hold pause
  useEffect(() => {
    if (!selectedMeshName) return;

    if (isHovered) return;

    const timer = setInterval(() => {
      setRemainingMs((prev) => {
        const next = prev - TICK_INTERVAL_MS;
        if (next <= 0) {
          clearInterval(timer);
          if (onClearRef.current) {
            onClearRef.current();
          }
          return 0;
        }
        return next;
      });
    }, TICK_INTERVAL_MS);

    return () => clearInterval(timer);
  }, [selectedMeshName, isHovered]);

  if (!selectedMeshName || !inspectedPart) {
    return null;
  }

  const handleMouseEnterHolder = () => {
    setIsHovered(true);
  };

  const handleMouseLeaveResumer = () => {
    setIsHovered(false);
  };

  const handleDismissCard = () => {
    if (onClearRef.current) {
      onClearRef.current();
    }
  };

  const progressPercent = Math.max(0, Math.min(100, (remainingMs / TOTAL_DURATION_MS) * 100));
  const remainingSeconds = Math.max(1, Math.ceil(remainingMs / 1000));

  return (
    <Box
      onMouseEnter={handleMouseEnterHolder}
      onMouseLeave={handleMouseLeaveResumer}
      sx={{
        position: 'absolute',
        bottom: { xs: 80, sm: 28 },
        right: { xs: 16, sm: 28 },
        zIndex: 40,
        pointerEvents: 'auto',
        width: { xs: 'calc(100% - 32px)', sm: 380 },
        maxWidth: 420,
        animation: 'fadeInUp 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
        '@keyframes fadeInUp': {
          from: { opacity: 0, transform: 'translateY(12px) scale(0.97)' },
          to: { opacity: 1, transform: 'translateY(0) scale(1)' },
        },
      }}
    >
      <Paper
        elevation={0}
        sx={{
          position: 'relative',
          overflow: 'hidden',
          borderRadius: 3,
          p: 2,
          bgcolor: 'rgba(15, 23, 42, 0.94)',
          border: '1.5px solid',
          borderColor: isHovered ? 'rgba(74, 222, 128, 0.7)' : 'rgba(74, 222, 128, 0.4)',
          backdropFilter: 'blur(16px)',
          boxShadow: isHovered
            ? '0 24px 48px rgba(0, 0, 0, 0.65), 0 0 20px rgba(74, 222, 128, 0.2)'
            : '0 20px 40px rgba(0, 0, 0, 0.55)',
          color: '#f8fafc',
          transition: 'border-color 0.2s ease, box-shadow 0.2s ease',
        }}
      >
        {/* Header Bar */}
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            gap: 1,
            mb: 1,
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.8, flexWrap: 'wrap' }}>
            <Typography
              variant="caption"
              sx={{
                color: '#4ade80',
                fontWeight: 900,
                fontSize: '0.68rem',
                letterSpacing: '0.04em',
                textTransform: 'uppercase',
              }}
            >
              SELECTED 3D STRUCTURAL MEMBER
            </Typography>

            <Chip
              label={inspectedPart.layerLabel || 'Structure'}
              size="small"
              sx={{
                height: 20,
                fontSize: '0.65rem',
                fontWeight: 700,
                bgcolor: 'rgba(56, 189, 248, 0.16)',
                color: inspectedPart.badgeColor || '#38bdf8',
                borderRadius: 1,
                '& .MuiChip-label': { px: 0.8 },
              }}
            />
          </Box>

          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Chip
              label={isHovered ? 'Timer Paused' : `Auto-closes in ${remainingSeconds}s`}
              size="small"
              sx={{
                height: 20,
                fontSize: '0.65rem',
                fontWeight: 800,
                bgcolor: isHovered ? 'rgba(250, 204, 21, 0.2)' : 'rgba(255, 255, 255, 0.1)',
                color: isHovered ? '#fde047' : '#cbd5e1',
                border: isHovered ? '1px solid rgba(250, 204, 21, 0.4)' : 'none',
                borderRadius: 1,
                '& .MuiChip-label': { px: 0.8 },
              }}
            />

            <Button
              size="small"
              onClick={handleDismissCard}
              sx={{
                minWidth: 0,
                px: 1,
                py: 0.2,
                fontSize: '0.7rem',
                fontWeight: 700,
                color: '#94a3b8',
                textTransform: 'none',
                bgcolor: 'rgba(255, 255, 255, 0.06)',
                borderRadius: 1,
                '&:hover': {
                  bgcolor: 'rgba(239, 68, 68, 0.2)',
                  color: '#f87171',
                },
              }}
            >
              Clear
            </Button>
          </Box>
        </Box>

        {/* Member Title */}
        <Typography
          variant="subtitle1"
          component="h4"
          sx={{
            fontWeight: 800,
            fontSize: '1rem',
            lineHeight: 1.3,
            color: '#ffffff',
            mb: 0.8,
          }}
        >
          {inspectedPart.title}
        </Typography>

        {/* Member Specifications */}
        <Box
          sx={{
            p: 1.25,
            mb: 1.2,
            borderRadius: 2,
            bgcolor: 'rgba(30, 41, 59, 0.65)',
            border: '1px solid rgba(255, 255, 255, 0.06)',
            display: 'flex',
            flexDirection: 'column',
            gap: 0.5,
          }}
        >
          <Box sx={{ display: 'flex', gap: 0.8, alignItems: 'flex-start' }}>
            <Typography
              variant="caption"
              sx={{
                color: '#94a3b8',
                fontWeight: 700,
                fontSize: '0.72rem',
                minWidth: 64,
              }}
            >
              Specs:
            </Typography>
            <Typography
              variant="caption"
              sx={{
                color: '#86efac',
                fontWeight: 700,
                fontSize: '0.72rem',
              }}
            >
              {inspectedPart.dimensions}
            </Typography>
          </Box>

          <Box sx={{ display: 'flex', gap: 0.8, alignItems: 'flex-start' }}>
            <Typography
              variant="caption"
              sx={{
                color: '#94a3b8',
                fontWeight: 700,
                fontSize: '0.72rem',
                minWidth: 64,
              }}
            >
              Material:
            </Typography>
            <Typography
              variant="caption"
              sx={{
                color: '#38bdf8',
                fontWeight: 600,
                fontSize: '0.72rem',
              }}
            >
              {inspectedPart.material}
            </Typography>
          </Box>
        </Box>

        {/* Engineering Role / Description */}
        <Typography
          variant="body2"
          sx={{
            color: '#cbd5e1',
            fontSize: '0.78rem',
            lineHeight: 1.45,
            mb: 1.5,
          }}
        >
          {inspectedPart.role}
        </Typography>

        {/* Micro-copy Helper */}
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            mb: 0.8,
          }}
        >
          <Typography
            variant="caption"
            sx={{
              color: isHovered ? '#86efac' : '#64748b',
              fontSize: '0.66rem',
              fontWeight: 600,
            }}
          >
            {isHovered
              ? 'Cursor hovering: timer paused'
              : 'Hover cursor over this card to hold timer'}
          </Typography>

          <Typography
            variant="caption"
            sx={{
              color: '#64748b',
              fontSize: '0.66rem',
              fontWeight: 600,
            }}
          >
            {remainingSeconds}s remaining
          </Typography>
        </Box>

        {/* Animated Depletion Progress Bar */}
        <LinearProgress
          variant="determinate"
          value={progressPercent}
          sx={{
            height: 3,
            borderRadius: 1.5,
            bgcolor: 'rgba(255, 255, 255, 0.1)',
            '& .MuiLinearProgress-bar': {
              bgcolor: isHovered ? '#facc15' : '#4ade80',
              transition: isHovered ? 'none' : 'transform 0.1s linear',
            },
          }}
        />
      </Paper>
    </Box>
  );
};

export default FloatingStructuralMemberInspector;
