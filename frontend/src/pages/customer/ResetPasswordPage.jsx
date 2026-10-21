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
  Paper,
} from '@mui/material';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';

import { validateRealisticEmail } from '../../utils/emailValidator';

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
  const email     = (location.state?.email || '').trim();

  useEffect(() => {
    if (!email || !validateRealisticEmail(email).isValid) {
      navigate('/forgot-password', { replace: true });
    }
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
      const API_URL = import.meta.env.VITE_API_URL || '';
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
            Reset password
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3.5, lineHeight: 1.7 }}>
            Enter the 6-digit code sent to <strong>{email}</strong>, then set your new password. Your new password must be different from your previous password.
          </Typography>

          {error && (
            <Alert severity="error" sx={{ mb: 3, borderRadius: 2 }}>
              {error}
            </Alert>
          )}

          <Box component="form" onSubmit={handleSubmit} noValidate>
            <Typography variant="body2" fontWeight={600} color="text.secondary" sx={{ mb: 1.5 }}>
              Verification Code
            </Typography>
            <Stack direction="row" spacing={{ xs: 0.75, sm: 1.5 }} justifyContent="space-between" sx={{ mb: 3 }} onPaste={handleOtpPaste}>
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

            <TextField
              fullWidth
              label="New Password"
              type={showPassword ? 'text' : 'password'}
              required
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              sx={{ 
                mb: newPassword.length > 0 ? 1 : 2,
                '& input::-ms-reveal, & input::-ms-clear': { display: 'none' } 
              }}
              slotProps={{
                input: {
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton onClick={() => setShowPassword(!showPassword)} onMouseDown={(e) => e.preventDefault()} edge="end" size="small">
                        {showPassword ? <Visibility fontSize="small" /> : <VisibilityOff fontSize="small" />}
                      </IconButton>
                    </InputAdornment>
                  ),
                }
              }}
            />
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
              sx={{ 
                mb: 3,
                '& input::-ms-reveal, & input::-ms-clear': { display: 'none' } 
              }}
              error={!!confirmPassword && newPassword !== confirmPassword}
              helperText={confirmPassword && newPassword !== confirmPassword ? 'Passwords do not match.' : ''}
              slotProps={{
                input: {
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton onClick={() => setShowConfirmPassword(!showConfirmPassword)} onMouseDown={(e) => e.preventDefault()} edge="end" size="small">
                        {showConfirmPassword ? <Visibility fontSize="small" /> : <VisibilityOff fontSize="small" />}
                      </IconButton>
                    </InputAdornment>
                  ),
                }
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

          <Box textAlign="center" sx={{ mt: 1 }}>
            <Typography variant="body2" color="text.secondary">
              Remembered your password?{' '}
              <Link component={RouterLink} to="/login" color="primary" fontWeight={700} underline="hover">
                Back to Sign In
              </Link>
            </Typography>
          </Box>
        </Paper>
      </Box>

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
            <i className="fi fi-sr-check-circle" style={{ color: '#ffffff', fontSize: '36px' }}></i>
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
