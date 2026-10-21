import React, { useState, useEffect } from 'react';
import { useNavigate, Link as RouterLink, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  Box,
  Typography,
  TextField,
  Button,
  Alert,
  InputAdornment,
  IconButton,
  CircularProgress,
  Paper,
  Link,
  FormControl,
  InputLabel,
  OutlinedInput,
} from '@mui/material';
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';


const CustomerLoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  const [requiresOtp, setRequiresOtp] = useState(false);
  const [otp, setOtp] = useState('');

  const { login, logout, token, user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (token) {
      if (user?.role === 'customer') {
        navigate('/dashboard', { replace: true });
      }
    }
  }, [token, user, navigate]);

  useEffect(() => {
    if (location.state?.message) {
      setSuccessMessage(location.state.message);
      window.history.replaceState({}, document.title);
    }
  }, [location]);

  if (token && user?.role === 'customer') {
    return null;
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccessMessage('');

    if (!email && !password) {
      setError('please type your valid credentials');
      return;
    }
    if (email && !password) {
      setError('Please type your correct password');
      return;
    }
    if (!email && password) {
      setError('Please type your email address');
      return;
    }

    setLoading(true);

    const result = await login(email, password, requiresOtp ? otp : null, ['customer']);

    if (result.requiresOtp) {
      setRequiresOtp(true);
      setSuccessMessage(result.message || 'OTP sent to your email.');
    } else if (result.success) {
      if (result.user?.role !== 'customer') {
        logout();
        setError('Staff accounts cannot access the customer portal. Please use the staff login.');
        setLoading(false);
        return;
      }
      navigate('/dashboard', { replace: true });
    } else {
      if (result.error === 'Email not verified' && result.email) {
        navigate('/verify-email', { state: { email: result.email } });
      } else {
        setError(result.error);
      }
    }
    setLoading(false);
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
          <Typography variant="h5" component="h1" fontWeight={700} color="text.primary" gutterBottom>
            Welcome back
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3.5 }}>
            Sign in to your account to continue shopping.
          </Typography>

          {successMessage && (
            <Alert severity="success" sx={{ mb: 3, borderRadius: 2 }}>
              {successMessage}
            </Alert>
          )}

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
              margin="normal"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              sx={{ mb: 0 }}
            />

            <FormControl fullWidth variant="outlined" margin="normal" required>
              <InputLabel htmlFor="password">Password</InputLabel>
              <OutlinedInput
                id="password"
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                sx={{
                  '& input::-ms-reveal, & input::-ms-clear': {
                    display: 'none',
                  },
                }}
                endAdornment={
                  <InputAdornment position="end">
                    <IconButton
                      aria-label="toggle password visibility"
                      onClick={() => setShowPassword(!showPassword)}
                      onMouseDown={(e) => e.preventDefault()}
                      edge="end"
                      size="small"
                      sx={{ color: 'text.primary', bgcolor: 'rgba(255,255,255,0.1)' }}
                    >
                      {showPassword ? <Visibility fontSize="small" /> : <VisibilityOff fontSize="small" />}
                    </IconButton>
                  </InputAdornment>
                }
                label="Password"
              />
            </FormControl>

            <Box sx={{ textAlign: 'right', mt: 0.5, mb: 1 }}>
              <Link
                component={RouterLink}
                to="/forgot-password"
                color="primary"
                fontWeight={600}
                underline="hover"
                variant="body2"
              >
                Forgot Password?
              </Link>
            </Box>

            {requiresOtp && (
              <TextField
                fullWidth
                label="OTP Code"
                type="text"
                variant="outlined"
                margin="normal"
                required
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                placeholder="Enter 6-digit OTP"
                sx={{ mb: 1 }}
                inputProps={{
                  style: { letterSpacing: '0.2em', textAlign: 'center' },
                }}
              />
            )}

            <Button
              type="submit"
              fullWidth
              variant="contained"
              color="primary"
              size="large"
              disabled={loading}
              sx={{ mt: 3, mb: 2, py: 1.6, borderRadius: 2, fontSize: '1rem', fontWeight: 700 }}
            >
              {loading ? (
                <CircularProgress size={24} color="inherit" />
              ) : requiresOtp ? (
                'Verify OTP & Sign In'
              ) : (
                'Sign In'
              )}
            </Button>
          </Box>

          <Box textAlign="center" sx={{ mt: 1 }}>
            <Typography variant="body2" color="text.secondary">
              Don&apos;t have an account?{' '}
              <Link component={RouterLink} to="/register" color="primary" fontWeight={700} underline="hover">
                Create account
              </Link>
            </Typography>
          </Box>
        </Paper>
      </Box>
    </Box>
  );
};

export default CustomerLoginPage;
