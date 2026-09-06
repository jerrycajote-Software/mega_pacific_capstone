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


const BRAND_FEATURES = [
  'Premium quality roofing & steel materials',
  'Fast and reliable order processing',
  'Trusted by thousands of contractors',
  'Secure and seamless checkout',
];

const CustomerLoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  const { login, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (location.state?.message) {
      setSuccessMessage(location.state.message);
      window.history.replaceState({}, document.title);
    }
  }, [location]);

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

    const result = await login(email, password);

    if (result.success) {
      if (result.user?.role !== 'customer') {
        logout();
        setError('Staff accounts cannot access the customer portal. Please use the staff login.');
        setLoading(false);
        return;
      }
      navigate('/dashboard');
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
        bgcolor: 'background.default',
      }}
    >
      {/*  Left Decorative Panel (md+) */}
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
          Build the Future<br />with Confidence
        </Typography>
        <Typography variant="body1" sx={{ color: 'rgba(255,255,255,0.75)', mb: 5, maxWidth: 340, lineHeight: 1.8, position: 'relative', zIndex: 1 }}>
          Your trusted partner for premium roofing systems, steel trusses, and durable construction materials.
        </Typography>

        {/* Feature list */}
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

      {/*  Right: Login Form  */}
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

          {/* Mobile logo (shown only on xs/sm) */}
          <Box sx={{ textAlign: 'center', mb: 4, display: { xs: 'block', md: 'none' } }}>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'Arial, sans-serif', fontWeight: 900, fontSize: 28, letterSpacing: '0.05em', lineHeight: 1, mb: 0.5 }}>
              <Typography component="span" sx={{ color: 'primary.main' }}>MEGA</Typography>
              <Typography component="span" sx={{ color: 'secondary.main' }}>PACIFIC</Typography>
            </Box>
            <Typography sx={{ color: 'text.secondary', fontSize: '9px', fontWeight: 800, letterSpacing: '0.2em', fontFamily: 'Arial, sans-serif' }}>
              METAL AND STEEL CORP
            </Typography>
          </Box>

          {/* Lock icon */}
          <Box
            sx={{
              width: 52,
              height: 52,
              borderRadius: 3,
              bgcolor: 'primary.main',
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
            Welcome back
          </Typography>
          <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
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

            {/* Forgot Password link */}
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

            <Button
              type="submit"
              fullWidth
              variant="contained"
              color="primary"
              size="large"
              disabled={loading}
              sx={{ mt: 3, mb: 2, py: 1.6, borderRadius: 2, fontSize: '1rem', fontWeight: 700 }}
            >
              {loading ? <CircularProgress size={24} color="inherit" /> : 'Sign In'}
            </Button>
          </Box>

          <Box textAlign="center">
            <Typography variant="body2" color="text.secondary">
              Don&apos;t have an account?{' '}
              <Link component={RouterLink} to="/register" color="primary" fontWeight={700} underline="hover">
                Create account
              </Link>
            </Typography>
          </Box>
        </Box>
      </Box>
    </Box>
  );
};

export default CustomerLoginPage;
