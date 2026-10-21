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
  Paper,
} from '@mui/material';

const ForgotPasswordPage = () => {
  const [email, setEmail]       = useState('');
  const [loading, setLoading]   = useState(false);
  const [error, setError]       = useState('');

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
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        bgcolor: 'background.default',
        px: { xs: 2.5, sm: 4 },
        py: { xs: 4, sm: 6 },
      }}
    >
      <Box sx={{ width: '100%', maxWidth: 440 }}>
        <Box sx={{ textAlign: 'center', mb: 3.5 }}>
          <Box
            sx={{
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontFamily: 'Arial, sans-serif',
              fontWeight: 900,
              fontSize: { xs: 28, sm: 32 },
              letterSpacing: '0.05em',
              lineHeight: 1,
              mb: 0.5,
            }}
          >
            <Typography component="span" sx={{ color: 'primary.main', fontSize: 'inherit', fontWeight: 'inherit' }}>MEGA</Typography>
            <Typography component="span" sx={{ color: 'secondary.main', fontSize: 'inherit', fontWeight: 'inherit' }}>PACIFIC</Typography>
          </Box>
          <Typography
            sx={{
              color: 'text.secondary',
              fontSize: '10px',
              fontWeight: 800,
              letterSpacing: '0.22em',
              fontFamily: 'Arial, sans-serif',
            }}
          >
            METAL AND STEEL CORP
          </Typography>
        </Box>

        <Paper
          elevation={0}
          sx={{
            p: { xs: 3, sm: 4.5 },
            borderRadius: 3,
            border: '1px solid',
            borderColor: 'divider',
            bgcolor: 'background.paper',
            boxShadow: (theme) =>
              theme.palette.mode === 'dark'
                ? '0 12px 36px rgba(0,0,0,0.45)'
                : '0 12px 36px rgba(15,23,42,0.06)',
          }}
        >
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

          <Typography variant="h5" component="h1" fontWeight={700} color="text.primary" gutterBottom>
            Forgot password?
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3.5, lineHeight: 1.7 }}>
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

          <Box textAlign="center" sx={{ mt: 1 }}>
            <Typography variant="body2" color="text.secondary">
              Remember your password?{' '}
              <Link component={RouterLink} to="/login" color="primary" fontWeight={700} underline="hover">
                Back to Sign In
              </Link>
            </Typography>
          </Box>
        </Paper>
      </Box>
    </Box>
  );
};

export default ForgotPasswordPage;
