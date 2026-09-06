import React, { useState } from 'react';
import { useNavigate, Link as RouterLink } from 'react-router-dom';
import axios from 'axios';
import {
  Box,
  Typography,
  TextField,
  Button,
  Alert,
  CircularProgress,
  Link,
} from '@mui/material';


const BRAND_FEATURES = [
  'Premium quality roofing & steel materials',
  'Fast and reliable order processing',
  'Trusted by thousands of contractors',
  'Secure and seamless checkout',
];

const ForgotPasswordPage = () => {
  const [email, setEmail]       = useState('');
  const [loading, setLoading]   = useState(false);
  const [error, setError]       = useState('');
  const [submitted, setSubmitted] = useState(false);

  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!email.trim()) {
      setError('Please enter your registered email address.');
      return;
    }

    setLoading(true);
    try {
      const API_URL = import.meta.env.VITE_API_URL || '';
      await axios.post(`${API_URL}/api/auth/forgot-password`, { email });
      // Always navigate regardless — backend returns 200 even for unknown emails (security best practice)
      navigate('/reset-password', { state: { email } });
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.error || 'Failed to send reset code. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{ minHeight: '100vh', display: 'flex', bgcolor: 'background.default' }}>

      {/* ─── Left Decorative Panel (md+) ─────────────────────── */}
      <Box
        sx={{
          display: { xs: 'none', md: 'flex' },
          width: '45%',
          flexShrink: 0,
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'flex-start',
          px: 6,
          py: 8,
          position: 'relative',
          overflow: 'hidden',
          background: 'linear-gradient(145deg, #31572c 0%, #4f772d 40%, #6b9840 75%, #90a955 100%)',
        }}
      >
        {/* Decorative circles */}
        <Box sx={{ position: 'absolute', top: -80, right: -80, width: 280, height: 280, borderRadius: '50%', bgcolor: 'rgba(255,255,255,0.06)' }} />
        <Box sx={{ position: 'absolute', bottom: -60, left: -60, width: 220, height: 220, borderRadius: '50%', bgcolor: 'rgba(255,255,255,0.05)' }} />
        <Box sx={{ position: 'absolute', top: '40%', right: 40, width: 100, height: 100, borderRadius: '50%', bgcolor: 'rgba(255,255,255,0.08)' }} />

        {/* Logo */}
        <Box sx={{ mb: 4, position: 'relative', zIndex: 1 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', fontFamily: 'Arial, sans-serif', fontWeight: 900, fontSize: 36, letterSpacing: '0.05em', lineHeight: 1 }}>
            <Typography component="span" sx={{ color: '#ecf39e' }}>MEGA</Typography>
            <Typography component="span" sx={{ color: '#ffffff' }}>PACIFIC</Typography>
          </Box>
          <Typography sx={{ color: 'rgba(255,255,255,0.7)', fontSize: '10px', fontWeight: 800, letterSpacing: '0.25em', mt: 0.5, fontFamily: 'Arial, sans-serif' }}>
            METAL AND STEEL CORP
          </Typography>
        </Box>

        <Typography variant="h4" fontWeight={700} sx={{ color: '#ffffff', mb: 1.5, lineHeight: 1.3, position: 'relative', zIndex: 1 }}>
          Reset Your<br />Password Securely
        </Typography>
        <Typography variant="body1" sx={{ color: 'rgba(255,255,255,0.75)', mb: 5, maxWidth: 340, lineHeight: 1.8, position: 'relative', zIndex: 1 }}>
          Enter your registered email and we'll send you a one-time code to reset your password.
        </Typography>

        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5, position: 'relative', zIndex: 1 }}>
          {BRAND_FEATURES.map((feat, i) => (
            <Box key={i} sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
              <i className="fi fi-sr-check-circle" style={{ color: '#ecf39e', fontSize: '18px', flexShrink: 0 }}></i>
              <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.9)', fontWeight: 500 }}>
                {feat}
              </Typography>
            </Box>
          ))}
        </Box>
      </Box>

      {/* ─── Right: Forgot Password Form ──────────────────────── */}
      <Box
        sx={{
          flex: 1,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          px: { xs: 3, sm: 6, md: 8 },
          py: 6,
        }}
      >
        <Box sx={{ width: '100%', maxWidth: 420 }}>

          {/* Mobile logo */}
          <Box sx={{ textAlign: 'center', mb: 4, display: { xs: 'block', md: 'none' } }}>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'Arial, sans-serif', fontWeight: 900, fontSize: 28, letterSpacing: '0.05em', lineHeight: 1, mb: 0.5 }}>
              <Typography component="span" sx={{ color: 'primary.main' }}>MEGA</Typography>
              <Typography component="span" sx={{ color: 'secondary.main' }}>PACIFIC</Typography>
            </Box>
          </Box>

          {/* Icon */}
          <Box
            sx={{
              width: 52,
              height: 52,
              borderRadius: 3,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              mb: 3,
              background: 'linear-gradient(135deg, #4f772d 0%, #3d5c22 100%)',
              boxShadow: '0 6px 16px rgba(79,119,45,0.3)',
            }}
          >
            <i className="fi fi-rr-lock" style={{ color: '#ffffff', fontSize: '24px' }}></i>
          </Box>

          <Typography variant="h4" component="h1" fontWeight={700} color="text.primary" gutterBottom>
            Forgot password?
          </Typography>
          <Typography variant="body1" color="text.secondary" sx={{ mb: 4, lineHeight: 1.7 }}>
            No worries! Enter your registered email address and we'll send you a verification code to reset your password.
          </Typography>

          {error && (
            <Alert severity="error" sx={{ mb: 3, borderRadius: 2 }}>
              {error}
            </Alert>
          )}

          <Box component="form" onSubmit={handleSubmit} noValidate>
            <TextField
              fullWidth
              label="Email Address"
              type="email"
              variant="outlined"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              sx={{ mb: 3 }}
            />

            <Button
              type="submit"
              fullWidth
              variant="contained"
              color="primary"
              size="large"
              disabled={loading}
              sx={{ py: 1.6, borderRadius: 2, fontSize: '1rem', fontWeight: 700, mb: 2 }}
            >
              {loading ? <CircularProgress size={24} color="inherit" /> : 'Send Reset Code'}
            </Button>
          </Box>

          <Box textAlign="center">
            <Typography variant="body2" color="text.secondary">
              Remember your password?{' '}
              <Link component={RouterLink} to="/login" color="primary" fontWeight={700} underline="hover">
                Back to Sign In
              </Link>
            </Typography>
          </Box>
        </Box>
      </Box>
    </Box>
  );
};

export default ForgotPasswordPage;
