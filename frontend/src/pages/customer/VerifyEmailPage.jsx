import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import {
  Box,
  Typography,
  Button,
  Alert,
  CircularProgress,
  Paper,
  Stack,
} from '@mui/material';
import CheckCircleOutlinedIcon from '@mui/icons-material/CheckCircleOutlined';
import MarkEmailUnreadOutlinedIcon from '@mui/icons-material/MarkEmailUnreadOutlined';

const BRAND_FEATURES = [
  'Premium quality roofing & steel materials',
  'Fast and reliable order processing',
  'Trusted by thousands of contractors',
  'Secure and seamless checkout',
];

const VerifyEmailPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  
  // Retrieve email from state, default to empty string if not redirected properly
  const email = location.state?.email || '';

  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [cooldown, setCooldown] = useState(0);
  const [resending, setResending] = useState(false);
  
  const inputRefs = useRef([]);

  // If no email, redirect back to login
  useEffect(() => {
    if (!email) {
      navigate('/login');
    }
  }, [email, navigate]);

  // Countdown timer for resending OTP
  useEffect(() => {
    if (cooldown > 0) {
      const timer = setTimeout(() => setCooldown(cooldown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [cooldown]);

  const handleChange = (element, index) => {
    const val = element.value;
    if (isNaN(val)) return;

    const newOtp = [...otp];
    newOtp[index] = val.substring(val.length - 1);
    setOtp(newOtp);

    // Auto-focus next field
    if (val && index < 5) {
      inputRefs.current[index + 1].focus();
    }
  };

  const handleKeyDown = (e, index) => {
    if (e.key === 'Backspace') {
      const newOtp = [...otp];
      
      if (!otp[index] && index > 0) {
        // Focus previous field and clear it
        newOtp[index - 1] = '';
        setOtp(newOtp);
        inputRefs.current[index - 1].focus();
      } else {
        // Clear current field
        newOtp[index] = '';
        setOtp(newOtp);
      }
    }
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const pasteData = e.clipboardData.getData('text').trim();
    if (pasteData.length === 6 && /^\d+$/.test(pasteData)) {
      const newOtp = pasteData.split('');
      setOtp(newOtp);
      inputRefs.current[5].focus();
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    
    const otpCode = otp.join('');
    if (otpCode.length < 6) {
      setError('Please enter the full 6-digit verification code.');
      return;
    }

    setLoading(true);
    try {
      const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
      const res = await axios.post(`${API_URL}/api/auth/verify-otp`, {
        email,
        otp: otpCode
      });
      
      setSuccess(res.data.message || 'Verification successful!');
      setTimeout(() => {
        navigate('/login', { state: { message: 'Email verified successfully! You can now log in.' } });
      }, 2000);
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.error || 'Verification failed. Please check the code.');
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    setError('');
    setSuccess('');
    setResending(true);

    try {
      const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
      const res = await axios.post(`${API_URL}/api/auth/resend-otp`, { email });
      setSuccess(res.data.message || 'A new verification code has been sent.');
      setCooldown(60); // 60 seconds cooldown
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.error || 'Failed to resend verification code.');
      if (err.response?.data?.cooldownRemaining) {
        setCooldown(err.response.data.cooldownRemaining);
      }
    } finally {
      setResending(false);
    }
  };

  return (
    <Box sx={{ minHeight: '100vh', display: 'flex', bgcolor: 'background.default' }}>
      
      {/* ─── Left Decorative Panel (md+) ─────────────────────── */}
      <Box
        sx={{
          display: { xs: 'none', md: 'flex' },
          width: '38%',
          flexShrink: 0,
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'flex-start',
          px: 5,
          py: 8,
          position: 'relative',
          overflow: 'hidden',
          background: 'linear-gradient(145deg, #31572c 0%, #4f772d 40%, #6b9840 75%, #90a955 100%)',
        }}
      >
        {/* Decorative circles */}
        <Box sx={{ position: 'absolute', top: -80, right: -80, width: 280, height: 280, borderRadius: '50%', bgcolor: 'rgba(255,255,255,0.06)' }} />
        <Box sx={{ position: 'absolute', bottom: -60, left: -60, width: 220, height: 220, borderRadius: '50%', bgcolor: 'rgba(255,255,255,0.05)' }} />
        <Box sx={{ position: 'absolute', top: '60%', right: 30, width: 100, height: 100, borderRadius: '50%', bgcolor: 'rgba(255,255,255,0.07)' }} />

        {/* Logo */}
        <Box sx={{ mb: 4, position: 'relative', zIndex: 1 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', fontFamily: 'Arial, sans-serif', fontWeight: 900, fontSize: 32, letterSpacing: '0.05em', lineHeight: 1 }}>
            <Typography component="span" sx={{ color: '#ecf39e' }}>MEGA</Typography>
            <Typography component="span" sx={{ color: '#ffffff' }}>PACIFIC</Typography>
          </Box>
          <Typography sx={{ color: 'rgba(255,255,255,0.7)', fontSize: '9px', fontWeight: 800, letterSpacing: '0.25em', mt: 0.5, fontFamily: 'Arial, sans-serif' }}>
            METAL AND STEEL CORP
          </Typography>
        </Box>

        <Typography variant="h4" fontWeight={700} sx={{ color: '#ffffff', mb: 1.5, lineHeight: 1.3, position: 'relative', zIndex: 1 }}>
          Verify Your<br />Email Address
        </Typography>
        <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.75)', mb: 5, lineHeight: 1.8, position: 'relative', zIndex: 1 }}>
          Enter the security verification code sent to your email to activate your account.
        </Typography>

        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5, position: 'relative', zIndex: 1 }}>
          {BRAND_FEATURES.map((feat, i) => (
            <Box key={i} sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
              <CheckCircleOutlinedIcon sx={{ color: '#ecf39e', fontSize: 18, flexShrink: 0 }} />
              <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.9)', fontWeight: 500, fontSize: '0.82rem' }}>
                {feat}
              </Typography>
            </Box>
          ))}
        </Box>
      </Box>

      {/* ─── Right: Verification Form ─────────────────────────── */}
      <Box
        sx={{
          flex: 1,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          px: { xs: 3, sm: 5, md: 6 },
          py: 5,
        }}
      >
        <Box sx={{ width: '100%', maxWidth: 460 }}>

          {/* Mobile logo */}
          <Box sx={{ textAlign: 'center', mb: 4, display: { xs: 'block', md: 'none' } }}>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'Arial, sans-serif', fontWeight: 900, fontSize: 26, letterSpacing: '0.05em', lineHeight: 1, mb: 0.5 }}>
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
            <MarkEmailUnreadOutlinedIcon sx={{ color: '#ffffff', fontSize: 26 }} />
          </Box>

          <Typography variant="h4" component="h1" fontWeight={700} color="text.primary" gutterBottom>
            Verify email
          </Typography>
          <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
            We've sent a 6-digit code to <strong>{email}</strong>. Enter it below to verify your email.
          </Typography>

          {error && (
            <Alert severity="error" sx={{ mb: 3, borderRadius: 2 }}>
              {error}
            </Alert>
          )}

          {success && (
            <Alert severity="success" sx={{ mb: 3, borderRadius: 2 }}>
              {success}
            </Alert>
          )}

          <Box component="form" onSubmit={handleSubmit} noValidate>
            <Stack direction="row" spacing={1.5} justifyContent="space-between" sx={{ mb: 4 }} onPaste={handlePaste}>
              {otp.map((data, index) => (
                <Box
                  key={index}
                  component="input"
                  type="text"
                  maxLength="1"
                  ref={(el) => (inputRefs.current[index] = el)}
                  value={data}
                  onChange={(e) => handleChange(e.target, index)}
                  onKeyDown={(e) => handleKeyDown(e, index)}
                  sx={{
                    width: { xs: 42, sm: 54 },
                    height: { xs: 48, sm: 60 },
                    borderRadius: 2,
                    border: '1px solid',
                    borderColor: 'divider',
                    bgcolor: 'background.paper',
                    textAlign: 'center',
                    fontSize: '1.5rem',
                    fontWeight: 'bold',
                    color: 'text.primary',
                    outline: 'none',
                    transition: 'all 0.2s',
                    '&:focus': {
                      borderColor: 'primary.main',
                      boxShadow: '0 0 0 2px rgba(79,119,45,0.2)',
                    },
                  }}
                />
              ))}
            </Stack>

            <Button
              type="submit"
              fullWidth
              variant="contained"
              color="primary"
              size="large"
              disabled={loading}
              sx={{ mb: 3, py: 1.5, borderRadius: 2, fontWeight: 700 }}
            >
              {loading ? <CircularProgress size={24} color="inherit" /> : 'Verify Code'}
            </Button>
          </Box>

          <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 1 }}>
            <Typography variant="body2" color="text.secondary">
              Didn't receive the code?
            </Typography>
            <Button
              variant="text"
              color="primary"
              disabled={cooldown > 0 || resending}
              onClick={handleResend}
              sx={{ fontWeight: 700, textTransform: 'none' }}
            >
              {resending ? (
                <CircularProgress size={16} sx={{ mr: 1 }} />
              ) : cooldown > 0 ? (
                `Resend code in ${cooldown}s`
              ) : (
                'Resend Code'
              )}
            </Button>
          </Box>
        </Box>
      </Box>
    </Box>
  );
};

export default VerifyEmailPage;
