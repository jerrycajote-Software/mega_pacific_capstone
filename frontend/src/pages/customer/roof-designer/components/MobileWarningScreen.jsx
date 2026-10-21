import React from 'react';
import { Box, Typography, Button, Paper, Chip, Container, Stack } from '@mui/material';
import { useNavigate } from 'react-router-dom';

const MobileWarningScreen = () => {
  const navigate = useNavigate();

  return (
    <Box
      sx={{
        minHeight: '100vh',
        bgcolor: '#0f172a',
        color: '#f8fafc',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        px: 2.5,
        py: 4,
        position: 'relative',
        overflow: 'hidden',
        background: 'radial-gradient(circle at 50% 20%, rgba(79, 119, 45, 0.25) 0%, rgba(15, 23, 42, 1) 75%)',
      }}
    >
      <Container maxWidth="sm" sx={{ position: 'relative', zIndex: 1, textAlign: 'center' }}>
        <Paper
          elevation={0}
          sx={{
            p: { xs: 3.5, sm: 5 },
            borderRadius: 4,
            bgcolor: 'rgba(30, 41, 59, 0.75)',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            backdropFilter: 'blur(16px)',
            boxShadow: '0 20px 50px rgba(0, 0, 0, 0.5)',
            textAlign: 'center',
          }}
        >
          <Box
            sx={{
              width: 72,
              height: 72,
              borderRadius: 3,
              bgcolor: 'rgba(245, 158, 11, 0.12)',
              border: '1.5px solid rgba(245, 158, 11, 0.35)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              mx: 'auto',
              mb: 3,
              boxShadow: '0 0 30px rgba(245, 158, 11, 0.2)',
            }}
          >
            <i className="fi fi-rr-computer" style={{ fontSize: '34px', color: '#f59e0b' }}></i>
          </Box>

          <Chip
            label="NOT ALLOWED ON MOBILE BROWSER"
            size="small"
            sx={{
              mb: 2.5,
              fontWeight: 800,
              fontSize: '0.7rem',
              letterSpacing: '0.08em',
              bgcolor: 'rgba(239, 68, 68, 0.15)',
              color: '#f87171',
              border: '1px solid rgba(239, 68, 68, 0.3)',
              px: 1,
            }}
          />

          <Typography
            variant="h4"
            component="h1"
            fontWeight={900}
            sx={{
              color: '#ffffff',
              fontSize: { xs: '1.5rem', sm: '1.85rem' },
              lineHeight: 1.25,
              mb: 1.5,
              letterSpacing: '-0.02em',
            }}
          >
            Desktop Computer or High-Spec Device Required
          </Typography>

          <Typography
            variant="body2"
            sx={{
              color: '#cbd5e1',
              fontSize: '0.95rem',
              lineHeight: 1.6,
              mb: 2,
              maxWidth: 480,
              mx: 'auto',
            }}
          >
            You are not allowed to use a mobile browser to access the <strong>3D Roof Designer</strong>.
            Please use a desktop computer or high-spec workstation to make the 3D rendering components load efficiently and smoothly.
          </Typography>

          <Box
            sx={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 1.2,
              bgcolor: 'rgba(245, 158, 11, 0.08)',
              border: '1px solid rgba(245, 158, 11, 0.25)',
              borderRadius: 2,
              px: 2,
              py: 0.9,
              mb: 3,
              maxWidth: 480,
              mx: 'auto',
            }}
          >
            <i className="fi fi-rr-info" style={{ color: '#fbbf24', fontSize: '13px', flexShrink: 0 }}></i>
            <Typography variant="caption" sx={{ color: '#fde68a', fontSize: '0.78rem', lineHeight: 1.4, textAlign: 'left' }}>
              Enabling &quot;Desktop site&quot; on mobile phones is also restricted to safeguard device performance and prevent WebGL crashes.
            </Typography>
          </Box>

          <Box
            sx={{
              bgcolor: 'rgba(15, 23, 42, 0.65)',
              border: '1px solid rgba(255, 255, 255, 0.08)',
              borderRadius: 3,
              p: 2.5,
              mb: 3.5,
              textAlign: 'left',
            }}
          >
            <Typography
              variant="caption"
              sx={{
                color: '#94a3b8',
                fontWeight: 700,
                textTransform: 'uppercase',
                letterSpacing: '0.08em',
                display: 'block',
                mb: 1.5,
              }}
            >
              Recommended System Specifications
            </Typography>

            <Stack spacing={1.2}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                <i className="fi fi-rr-check" style={{ color: '#4ade80', fontSize: '14px' }}></i>
                <Typography variant="body2" sx={{ color: '#e2e8f0', fontSize: '0.825rem' }}>
                  <strong>Device:</strong> Desktop PC or Laptop (1024px+ screen width)
                </Typography>
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                <i className="fi fi-rr-check" style={{ color: '#4ade80', fontSize: '14px' }}></i>
                <Typography variant="body2" sx={{ color: '#e2e8f0', fontSize: '0.825rem' }}>
                  <strong>Graphics:</strong> Dedicated or Integrated WebGL 2.0 GPU
                </Typography>
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                <i className="fi fi-rr-check" style={{ color: '#4ade80', fontSize: '14px' }}></i>
                <Typography variant="body2" sx={{ color: '#e2e8f0', fontSize: '0.825rem' }}>
                  <strong>Browser:</strong> Chrome, Edge, Safari, or Firefox (Desktop version)
                </Typography>
              </Box>
            </Stack>
          </Box>

          <Stack spacing={1.5}>
            <Button
              variant="contained"
              fullWidth
              size="large"
              onClick={() => navigate('/dashboard')}
              sx={{
                bgcolor: '#4f772d',
                color: '#ffffff',
                fontWeight: 700,
                py: 1.4,
                borderRadius: 2.5,
                boxShadow: '0 8px 20px rgba(79, 119, 45, 0.4)',
                '&:hover': {
                  bgcolor: '#3d5c22',
                },
                display: 'flex',
                alignItems: 'center',
                gap: 1,
              }}
            >
              <i className="fi fi-rr-arrow-left" style={{ fontSize: '14px' }}></i>
              Return to Dashboard
            </Button>

            <Button
              variant="outlined"
              fullWidth
              size="large"
              onClick={() => navigate('/products')}
              sx={{
                borderColor: 'rgba(255, 255, 255, 0.2)',
                color: '#e2e8f0',
                fontWeight: 600,
                py: 1.2,
                borderRadius: 2.5,
                '&:hover': {
                  borderColor: 'rgba(255, 255, 255, 0.4)',
                  bgcolor: 'rgba(255, 255, 255, 0.05)',
                },
                display: 'flex',
                alignItems: 'center',
                gap: 1,
              }}
            >
              <i className="fi fi-rr-box-open" style={{ fontSize: '14px' }}></i>
              Browse Product Catalog
            </Button>
          </Stack>
        </Paper>
      </Container>
    </Box>
  );
};

export default MobileWarningScreen;
