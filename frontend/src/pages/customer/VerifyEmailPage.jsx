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

const VerifyEmailPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  
  
  const email = location.state?.email || '';
  const initialEmailSent = location.state?.emailSent;
  const initialWarning = location.state?.emailWarning;

  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [cooldown, setCooldown] = useState(0);
  const [resending, setResending] = useState(false);
  
  const inputRefs = useRef([]);

  useEffect(() => {
    if (!email) {
      navigate('/login');
      return;
    }
    if (initialEmailSent === false) {
      setError(
        initialWarning
          ? `Notice: Initial verification email could not be sent (${initialWarning}). Click 'Resend Code' below once your email configuration is ready.`
          : "Notice: We could not deliver the verification email automatically. Click 'Resend Code' below to try again."
      );
    }
  }, [email, initialEmailSent, initialWarning, navigate]);

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

    if (val && index < 5) {
      inputRefs.current[index + 1].focus();
    }
  };

  const handleKeyDown = (e, index) => {
    if (e.key === 'Backspace') {
      const newOtp = [...otp];
      
      if (!otp[index] && index > 0) {
        newOtp[index - 1] = '';
        setOtp(newOtp);
        inputRefs.current[index - 1].focus();
      } else {
        newOtp[index] = '';
        setOtp(newOtp);
      }
    }
  };

  const handlePaste = (e) => {
    e.preventDefault();
    let pasteData = e.clipboardData.getData('text').trim().toUpperCase();
    if (pasteData.startsWith('REG-')) pasteData = pasteData.slice(4);
    else if (pasteData.startsWith('REG')) pasteData = pasteData.slice(3);
    pasteData = pasteData.replace(/\D/g, '');
    if (pasteData.length >= 6) {
      const newOtp = pasteData.slice(0, 6).split('');
      setOtp(newOtp);
      inputRefs.current[5]?.focus();
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    
    const otpDigits = otp.join('');
    if (otpDigits.length < 6) {
      setError('Please enter the full 6-digit registration code (REG-######).');
      return;
    }

    setLoading(true);
    try {
      const API_URL = import.meta.env.VITE_API_URL || '';
      const res = await axios.post(`${API_URL}/api/auth/verify-otp`, {
        email,
        otp: `REG-${otpDigits}`
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
      const API_URL = import.meta.env.VITE_API_URL || '';
      const res = await axios.post(`${API_URL}/api/auth/resend-otp`, { email });
      setSuccess(res.data.message || 'A new verification code has been sent.');
      setCooldown(res.data.cooldownRemaining || 60); 
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.error || 'Failed to resend verification code. Please check your internet connection.');
      if (err.response?.data?.cooldownRemaining) {
        setCooldown(err.response.data.cooldownRemaining);
      }
    } finally {
      setResending(false);
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
      <Box sx={{ width: '100%', maxWidth: 460 }}>
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
            <Typography component="span" sx={{ color: '#1e3a8a', fontSize: 'inherit', fontWeight: 'inherit' }}>MEGA</Typography>
            <Typography component="span" sx={{ color: (theme) => theme.palette.mode === 'dark' ? '#f8fafc' : '#0f172a', fontSize: 'inherit', fontWeight: 'inherit' }}>PACIFIC</Typography>
          </Box>
          <Typography
            sx={{
              color: '#64748b',
              fontSize: '10px',
              fontWeight: 800,
              letterSpacing: '0.2em',
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
            <i className="fi fi-rr-envelope" style={{ color: '#ffffff', fontSize: '24px' }}></i>
          </Box>

          <Typography variant="h5" component="h1" fontWeight={700} color="text.primary" gutterBottom>
            Verify email
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3.5, lineHeight: 1.7 }}>
            We've sent a registration code to <strong>{email}</strong>. Enter the 6 digits below (format: <strong>REG-######</strong>).
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
            <Stack direction="row" spacing={{ xs: 0.75, sm: 1.25 }} alignItems="center" justifyContent="center" sx={{ mb: 4 }} onPaste={handlePaste}>
              <Box
                sx={{
                  px: { xs: 1.2, sm: 1.8 },
                  height: { xs: 46, sm: 60 },
                  borderRadius: 2,
                  bgcolor: (theme) => theme.palette.mode === 'dark' ? 'rgba(79,119,45,0.25)' : 'rgba(79,119,45,0.12)',
                  border: '1px solid',
                  borderColor: 'primary.main',
                  color: 'primary.main',
                  fontWeight: 800,
                  fontSize: { xs: '0.85rem', sm: '1.05rem' },
                  letterSpacing: '0.05em',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  userSelect: 'none',
                }}
              >
                REG-
              </Box>
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
                    width: { xs: 38, sm: 54 },
                    height: { xs: 46, sm: 60 },
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
        </Paper>
      </Box>
    </Box>
  );
};

export default VerifyEmailPage;
