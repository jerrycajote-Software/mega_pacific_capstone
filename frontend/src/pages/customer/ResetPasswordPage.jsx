import React, { useState, useRef, useMemo, useEffect } from 'react';
import { useNavigate, useLocation, Link as RouterLink } from 'react-router-dom';
import axios from 'axios';
import {
  Box,
  Typography,
  TextField,
  Button,
  Alert,
  CircularProgress,
  Link,
  Stack,
  InputAdornment,
  IconButton,
  Dialog,
  DialogContent,
  DialogActions,
} from '@mui/material';
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';
import LockResetOutlinedIcon from '@mui/icons-material/LockResetOutlined';
import CheckCircleOutlinedIcon from '@mui/icons-material/CheckCircleOutlined';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';
import TaskAltIcon from '@mui/icons-material/TaskAlt';

const BRAND_FEATURES = [
  'Premium quality roofing & steel materials',
  'Fast and reliable order processing',
  'Trusted by thousands of contractors',
  'Secure and seamless checkout',
];

const getPasswordChecks = (password) => ({
  minLength:  password.length >= 8,
  hasUpper:   /[A-Z]/.test(password),
  hasLower:   /[a-z]/.test(password),
  hasNumber:  /[0-9]/.test(password),
  hasSpecial: /[!@#$%^&*]/.test(password),
});

const PasswordCheckItem = ({ passed, label }) => (
  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
    {passed
      ? <CheckCircleIcon sx={{ fontSize: 14, color: 'success.main' }} />
      : <CancelIcon     sx={{ fontSize: 14, color: 'text.disabled' }} />}
    <Typography variant="caption" sx={{ color: passed ? 'success.main' : 'text.disabled' }}>
      {label}
    </Typography>
  </Box>
);

const ResetPasswordPage = () => {
  const navigate  = useNavigate();
  const location  = useLocation();
  const email     = location.state?.email || '';

  // Redirect if no email in state
  useEffect(() => {
    if (!email) navigate('/forgot-password');
  }, [email, navigate]);

  const [otp, setOtp]                               = useState(['', '', '', '', '', '']);
  const [newPassword, setNewPassword]               = useState('');
  const [confirmPassword, setConfirmPassword]       = useState('');
  const [showPassword, setShowPassword]             = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading]                       = useState(false);
  const [error, setError]                           = useState('');
  const [successDialogOpen, setSuccessDialogOpen]   = useState(false);

  const inputRefs = useRef([]);

  const passwordChecks        = useMemo(() => getPasswordChecks(newPassword), [newPassword]);
  const allPasswordChecksPassed = Object.values(passwordChecks).every(Boolean);
  const otpComplete             = otp.every((d) => d !== '');
  const canSubmit               = otpComplete && allPasswordChecksPassed && newPassword === confirmPassword;

  // ─── OTP input handlers ───────────────────────────────────────────────────
  const handleOtpChange = (element, index) => {
    const val = element.value;
    if (isNaN(val)) return;
    const newOtp = [...otp];
    newOtp[index] = val.substring(val.length - 1);
    setOtp(newOtp);
    if (val && index < 5) inputRefs.current[index + 1].focus();
  };

  const handleOtpKeyDown = (e, index) => {
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

  const handleOtpPaste = (e) => {
    e.preventDefault();
    const pasteData = e.clipboardData.getData('text').trim();
    if (pasteData.length === 6 && /^\d+$/.test(pasteData)) {
      setOtp(pasteData.split(''));
      inputRefs.current[5].focus();
    }
  };

  // ─── Submit ───────────────────────────────────────────────────────────────
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    const otpCode = otp.join('');
    if (otpCode.length < 6) {
      setError('Please enter the full 6-digit reset code.');
      return;
    }
    if (!allPasswordChecksPassed) {
      setError('Password does not meet all security requirements.');
      return;
    }
    if (newPassword !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    setLoading(true);
    try {
      const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
      await axios.post(`${API_URL}/api/auth/reset-password`, { email, otp: otpCode, newPassword });
      setSuccessDialogOpen(true);
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.error || 'Failed to reset password. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleGoToLogin = () => {
    setSuccessDialogOpen(false);
    navigate('/login', { state: { message: 'Password updated successfully! You can now sign in with your new password.' } });
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
        <Box sx={{ position: 'absolute', top: -80, right: -80, width: 280, height: 280, borderRadius: '50%', bgcolor: 'rgba(255,255,255,0.06)' }} />
        <Box sx={{ position: 'absolute', bottom: -60, left: -60, width: 220, height: 220, borderRadius: '50%', bgcolor: 'rgba(255,255,255,0.05)' }} />
        <Box sx={{ position: 'absolute', top: '40%', right: 40, width: 100, height: 100, borderRadius: '50%', bgcolor: 'rgba(255,255,255,0.08)' }} />

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
          Create Your<br />New Password
        </Typography>
        <Typography variant="body1" sx={{ color: 'rgba(255,255,255,0.75)', mb: 5, maxWidth: 340, lineHeight: 1.8, position: 'relative', zIndex: 1 }}>
          Enter the code sent to your email and choose a strong new password for your account.
        </Typography>

        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5, position: 'relative', zIndex: 1 }}>
          {BRAND_FEATURES.map((feat, i) => (
            <Box key={i} sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
              <CheckCircleOutlinedIcon sx={{ color: '#ecf39e', fontSize: 20, flexShrink: 0 }} />
              <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.9)', fontWeight: 500 }}>
                {feat}
              </Typography>
            </Box>
          ))}
        </Box>
      </Box>

      {/* ─── Right: Reset Form ────────────────────────────────── */}
      <Box
        sx={{
          flex: 1,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          px: { xs: 3, sm: 6, md: 8 },
          py: 6,
          overflowY: 'auto',
        }}
      >
        <Box sx={{ width: '100%', maxWidth: 440 }}>

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
            <LockResetOutlinedIcon sx={{ color: '#ffffff', fontSize: 26 }} />
          </Box>

          <Typography variant="h4" component="h1" fontWeight={700} color="text.primary" gutterBottom>
            Reset password
          </Typography>
          <Typography variant="body1" color="text.secondary" sx={{ mb: 4, lineHeight: 1.7 }}>
            Enter the 6-digit code sent to <strong>{email}</strong>, then set your new password.
          </Typography>

          {error && (
            <Alert severity="error" sx={{ mb: 3, borderRadius: 2 }}>
              {error}
            </Alert>
          )}

          <Box component="form" onSubmit={handleSubmit} noValidate>
            {/* OTP boxes */}
            <Typography variant="body2" fontWeight={600} color="text.secondary" sx={{ mb: 1.5 }}>
              Verification Code
            </Typography>
            <Stack direction="row" spacing={1.5} justifyContent="space-between" sx={{ mb: 3 }} onPaste={handleOtpPaste}>
              {otp.map((data, index) => (
                <Box
                  key={index}
                  component="input"
                  type="text"
                  maxLength="1"
                  ref={(el) => (inputRefs.current[index] = el)}
                  value={data}
                  onChange={(e) => handleOtpChange(e.target, index)}
                  onKeyDown={(e) => handleOtpKeyDown(e, index)}
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

            {/* New password */}
            <TextField
              fullWidth
              label="New Password"
              type={showPassword ? 'text' : 'password'}
              required
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              sx={{ mb: newPassword.length > 0 ? 1 : 2 }}
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton onClick={() => setShowPassword(!showPassword)} edge="end" size="small">
                      {showPassword ? <VisibilityOff fontSize="small" /> : <Visibility fontSize="small" />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />
            {/* Real-time password checklist */}
            {newPassword.length > 0 && (
              <Box sx={{ mb: 2, pl: 0.5, display: 'flex', flexDirection: 'column', gap: 0.4 }}>
                <PasswordCheckItem passed={passwordChecks.minLength}  label="At least 8 characters" />
                <PasswordCheckItem passed={passwordChecks.hasUpper}   label="One uppercase letter (A–Z)" />
                <PasswordCheckItem passed={passwordChecks.hasLower}   label="One lowercase letter (a–z)" />
                <PasswordCheckItem passed={passwordChecks.hasNumber}  label="One number (0–9)" />
                <PasswordCheckItem passed={passwordChecks.hasSpecial} label="One special character (!@#$%^&*)" />
              </Box>
            )}

            <TextField
              fullWidth
              label="Confirm New Password"
              type={showConfirmPassword ? 'text' : 'password'}
              required
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              sx={{ mb: 3 }}
              error={!!confirmPassword && newPassword !== confirmPassword}
              helperText={confirmPassword && newPassword !== confirmPassword ? 'Passwords do not match.' : ''}
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton onClick={() => setShowConfirmPassword(!showConfirmPassword)} edge="end" size="small">
                      {showConfirmPassword ? <VisibilityOff fontSize="small" /> : <Visibility fontSize="small" />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />

            <Button
              type="submit"
              fullWidth
              variant="contained"
              color="primary"
              size="large"
              disabled={loading || !canSubmit}
              sx={{ py: 1.6, borderRadius: 2, fontSize: '1rem', fontWeight: 700, mb: 2 }}
            >
              {loading ? <CircularProgress size={24} color="inherit" /> : 'Reset Password'}
            </Button>
          </Box>

          <Box textAlign="center">
            <Typography variant="body2" color="text.secondary">
              Remembered your password?{' '}
              <Link component={RouterLink} to="/login" color="primary" fontWeight={700} underline="hover">
                Back to Sign In
              </Link>
            </Typography>
          </Box>
        </Box>
      </Box>

      {/* ─── Password Updated Successfully Dialog ─────────────── */}
      <Dialog
        open={successDialogOpen}
        maxWidth="xs"
        fullWidth
        PaperProps={{ sx: { borderRadius: 3, p: 1 } }}
      >
        <DialogContent sx={{ textAlign: 'center', pt: 4, pb: 2 }}>
          <Box
            sx={{
              width: 72,
              height: 72,
              borderRadius: '50%',
              background: 'linear-gradient(135deg, #4f772d 0%, #3d5c22 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              mx: 'auto',
              mb: 3,
              boxShadow: '0 8px 24px rgba(79,119,45,0.3)',
            }}
          >
            <TaskAltIcon sx={{ color: '#fff', fontSize: 40 }} />
          </Box>
          <Typography variant="h5" fontWeight={700} gutterBottom>
            Password Updated Successfully
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.7 }}>
            Your password has been changed successfully. You can now log in using your new password.
          </Typography>
        </DialogContent>
        <DialogActions sx={{ flexDirection: 'column', px: 3, pb: 3, gap: 1 }}>
          <Button
            fullWidth
            variant="contained"
            color="primary"
            size="large"
            onClick={handleGoToLogin}
            sx={{ borderRadius: 2, fontWeight: 700, py: 1.3 }}
          >
            Go to Login
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default ResetPasswordPage;
