import React, { useState, useMemo } from 'react';
import { useNavigate, Link as RouterLink } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useCart } from '../../context/CartContext';
import { getAvailableProvinces, getLocationsForProvince, getZipCodeForLocation } from '../../utils/locationService';
import {
  Box,
  Typography,
  TextField,
  Button,
  Alert,
  CircularProgress,
  Link,
  Grid,
  MenuItem,
  InputAdornment,
  IconButton,
  Dialog,
  DialogContent,
  DialogActions,
} from '@mui/material';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';


const BRAND_FEATURES = [
  'Premium quality roofing & steel materials',
  'Fast and reliable order processing',
  'Trusted by thousands of contractors',
  'Secure and seamless checkout',
];

// Password requirements checked in real-time
const getPasswordChecks = (password) => ({
  minLength:   password.length >= 8,
  hasUpper:    /[A-Z]/.test(password),
  hasLower:    /[a-z]/.test(password),
  hasNumber:   /[0-9]/.test(password),
  hasSpecial:  /[!@#$%^&*]/.test(password),
});

const PasswordCheckItem = ({ passed, label }) => (
  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
    {passed
      ? <CheckCircleIcon sx={{ fontSize: 14, color: 'success.main' }} />
      : <CancelIcon    sx={{ fontSize: 14, color: 'text.disabled' }} />}
    <Typography variant="caption" sx={{ color: passed ? 'success.main' : 'text.disabled' }}>
      {label}
    </Typography>
  </Box>
);

const RegisterPage = () => {
  const [firstName, setFirstName]             = useState('');
  const [lastName, setLastName]               = useState('');
  const [email, setEmail]                     = useState('');
  const [password, setPassword]               = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword]       = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [contactNumber, setContactNumber]     = useState('');
  const [address, setAddress]                 = useState('');
  const [province, setProvince]               = useState(getAvailableProvinces()[0] || 'Cavite');
  const [city, setCity]                       = useState('');
  const [zipCode, setZipCode]                 = useState('');

  // Per-field error state
  const [fieldErrors, setFieldErrors] = useState({});
  const [error, setError]             = useState('');
  const [loading, setLoading]         = useState(false);

  // Registration success dialog state
  const [successDialogOpen, setSuccessDialogOpen] = useState(false);
  const [restorationDialogOpen, setRestorationDialogOpen] = useState(false);
  const [restorationMessage, setRestorationMessage] = useState('');
  const [registeredEmail, setRegisteredEmail]     = useState('');

  // ─── Computed ─────────────────────────────────────────────────────────────
  const passwordChecks = useMemo(() => getPasswordChecks(password), [password]);
  const allPasswordChecksPassed = Object.values(passwordChecks).every(Boolean);

  // Form is valid when all required fields are filled and all password checks pass
  const isFormValid = useMemo(() => {
    return (
      firstName.trim() &&
      lastName.trim() &&
      email.trim() &&
      password &&
      confirmPassword &&
      contactNumber.trim() &&
      address.trim() &&
      city &&
      zipCode &&
      allPasswordChecksPassed &&
      password === confirmPassword
    );
  }, [firstName, lastName, email, password, confirmPassword, contactNumber, address, city, zipCode, allPasswordChecksPassed]);

  const handleCityChange = (e) => {
    const selectedCity = e.target.value;
    setCity(selectedCity);
    setZipCode(getZipCodeForLocation(province, selectedCity));
    setFieldErrors((prev) => ({ ...prev, city: '' }));
  };

  const { register } = useAuth();
  const { clearCart } = useCart();
  const navigate = useNavigate();

  const validateEmail = (email) =>
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

  // Validate all fields and highlight which ones are empty
  const validateForm = () => {
    const errors = {};
    if (!firstName.trim())       errors.firstName = 'First name is required.';
    if (!lastName.trim())        errors.lastName  = 'Last name is required.';
    if (!email.trim())           errors.email     = 'Email address is required.';
    else if (!validateEmail(email)) errors.email  = 'Please enter a valid email address.';
    if (!contactNumber.trim())   errors.contactNumber = 'Contact number is required.';
    if (!address.trim())         errors.address   = 'Address is required.';
    if (!city)                   errors.city      = 'Please select a city.';
    if (!password)               errors.password  = 'Password is required.';
    else if (!allPasswordChecksPassed) errors.password = 'Password does not meet all requirements.';
    if (!confirmPassword)        errors.confirmPassword = 'Please confirm your password.';
    else if (password !== confirmPassword) errors.confirmPassword = 'Passwords do not match.';
    return errors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    const errors = validateForm();
    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      setError('Please complete all required fields before creating your account.');
      return;
    }

    setFieldErrors({});
    setLoading(true);
    const fullName = `${firstName} ${lastName}`.trim();
    const result = await register(fullName, email, password, contactNumber, address, city, province, zipCode);

    if (result.success) {
      clearCart();
      setRegisteredEmail(result.email || email);
      if (result.isRestoration) {
        setRestorationMessage(result.message);
        setRestorationDialogOpen(true);
      } else {
        setSuccessDialogOpen(true); // Show success dialog before redirect
      }
    } else {
      setError(result.error);
    }
    setLoading(false);
  };

  const handleContinueToVerification = () => {
    setSuccessDialogOpen(false);
    setRestorationDialogOpen(false);
    navigate('/verify-email', { state: { email: registeredEmail } });
  };

  // Clear field error on change
  const clearFieldError = (field) =>
    setFieldErrors((prev) => ({ ...prev, [field]: '' }));

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
          Join the Mega<br />Pacific Community
        </Typography>
        <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.75)', mb: 5, lineHeight: 1.8, position: 'relative', zIndex: 1 }}>
          Create your account and start ordering premium construction materials today.
        </Typography>

        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5, position: 'relative', zIndex: 1 }}>
          {BRAND_FEATURES.map((feat, i) => (
            <Box key={i} sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
              <i className="fi fi-sr-check-circle" style={{ color: '#ecf39e', fontSize: '18px', flexShrink: 0 }}></i>
              <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.9)', fontWeight: 500, fontSize: '0.82rem' }}>
                {feat}
              </Typography>
            </Box>
          ))}
        </Box>
      </Box>

      {/* ─── Right: Registration Form ─────────────────────────── */}
      <Box
        sx={{
          flex: 1,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          px: { xs: 3, sm: 5, md: 6 },
          py: 5,
          overflowY: 'auto',
        }}
      >
        <Box sx={{ width: '100%', maxWidth: 560 }}>

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
            <i className="fi fi-rr-user-add" style={{ color: '#ffffff', fontSize: '24px' }}></i>
          </Box>

          <Typography variant="h4" component="h1" fontWeight={700} color="text.primary" gutterBottom>
            Create account
          </Typography>
          <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
            Fill in your details to get started.
          </Typography>

          {error && (
            <Alert severity="error" sx={{ mb: 3, borderRadius: 2 }}>
              {error}
            </Alert>
          )}

          <Box component="form" onSubmit={handleSubmit} noValidate>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="First Name"
                  required
                  size="small"
                  value={firstName}
                  onChange={(e) => { setFirstName(e.target.value); clearFieldError('firstName'); }}
                  error={!!fieldErrors.firstName}
                  helperText={fieldErrors.firstName}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Last Name"
                  required
                  size="small"
                  value={lastName}
                  onChange={(e) => { setLastName(e.target.value); clearFieldError('lastName'); }}
                  error={!!fieldErrors.lastName}
                  helperText={fieldErrors.lastName}
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Email Address"
                  type="email"
                  required
                  size="small"
                  value={email}
                  onChange={(e) => { setEmail(e.target.value); clearFieldError('email'); }}
                  error={!!fieldErrors.email}
                  helperText={fieldErrors.email}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Contact Number"
                  required
                  size="small"
                  value={contactNumber}
                  onChange={(e) => { 
                    const onlyNumbers = e.target.value.replace(/[^0-9]/g, '');
                    setContactNumber(onlyNumbers); 
                    clearFieldError('contactNumber'); 
                  }}
                  inputProps={{ maxLength: 11, pattern: '^09[0-9]{9}$', title: 'Must be an 11-digit number starting with 09' }}
                  helperText={fieldErrors.contactNumber || 'Format: 09123456789'}
                  error={!!fieldErrors.contactNumber}
                />
              </Grid>

              {/* Password field with real-time checklist */}
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Password"
                  type={showPassword ? 'text' : 'password'}
                  required
                  size="small"
                  value={password}
                  onChange={(e) => { setPassword(e.target.value); clearFieldError('password'); }}
                  error={!!fieldErrors.password}
                  helperText={fieldErrors.password}
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
                {/* Real-time password requirement checklist */}
                {password.length > 0 && (
                  <Box sx={{ mt: 1, pl: 0.5, display: 'flex', flexDirection: 'column', gap: 0.4 }}>
                    <PasswordCheckItem passed={passwordChecks.minLength}  label="At least 8 characters" />
                    <PasswordCheckItem passed={passwordChecks.hasUpper}   label="One uppercase letter (A–Z)" />
                    <PasswordCheckItem passed={passwordChecks.hasLower}   label="One lowercase letter (a–z)" />
                    <PasswordCheckItem passed={passwordChecks.hasNumber}  label="One number (0–9)" />
                    <PasswordCheckItem passed={passwordChecks.hasSpecial} label="One special character (!@#$%^&*)" />
                  </Box>
                )}
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Confirm Password"
                  type={showConfirmPassword ? 'text' : 'password'}
                  required
                  size="small"
                  value={confirmPassword}
                  onChange={(e) => { setConfirmPassword(e.target.value); clearFieldError('confirmPassword'); }}
                  error={!!fieldErrors.confirmPassword}
                  helperText={fieldErrors.confirmPassword}
                  InputProps={{
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton onClick={() => setShowConfirmPassword(!showConfirmPassword)} edge="end" size="small">
                          {showConfirmPassword ? <i className="fi fi-rr-eye-crossed" style={{ fontSize: '16px' }}></i> : <i className="fi fi-rr-eye" style={{ fontSize: '16px' }}></i>}
                        </IconButton>
                      </InputAdornment>
                    ),
                  }}
                />
              </Grid>

              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Complete Address"
                  required
                  size="small"
                  value={address}
                  onChange={(e) => { setAddress(e.target.value); clearFieldError('address'); }}
                  error={!!fieldErrors.address}
                  helperText={fieldErrors.address}
                />
              </Grid>

              <Grid item xs={12} sm={4}>
                <TextField
                  select
                  fullWidth
                  label="City / Municipality"
                  required
                  size="small"
                  value={city}
                  onChange={handleCityChange}
                  error={!!fieldErrors.city}
                  helperText={fieldErrors.city}
                >
                  <MenuItem value="" disabled>Select City</MenuItem>
                  {getLocationsForProvince(province).map(loc => (
                    <MenuItem key={loc.name} value={loc.name}>{loc.name}</MenuItem>
                  ))}
                </TextField>
              </Grid>
              <Grid item xs={12} sm={4}>
                <TextField
                  select
                  fullWidth
                  label="Province"
                  required
                  size="small"
                  value={province}
                  onChange={(e) => setProvince(e.target.value)}
                  disabled
                >
                  {getAvailableProvinces().map(prov => (
                    <MenuItem key={prov} value={prov}>{prov}</MenuItem>
                  ))}
                </TextField>
              </Grid>
              <Grid item xs={12} sm={4}>
                <TextField
                  fullWidth
                  label="Zip Code"
                  required
                  size="small"
                  value={zipCode}
                  InputProps={{ readOnly: true }}
                  sx={{ bgcolor: 'action.hover' }}
                />
              </Grid>
            </Grid>

            <Button
              type="submit"
              fullWidth
              variant="contained"
              color="primary"
              size="large"
              disabled={loading || !isFormValid}
              sx={{ mt: 3, mb: 2, py: 1.5, borderRadius: 2, fontWeight: 700 }}
            >
              {loading ? <CircularProgress size={24} color="inherit" /> : 'Create Account'}
            </Button>
          </Box>

          <Box textAlign="center">
            <Typography variant="body2" color="text.secondary">
              Already have an account?{' '}
              <Link component={RouterLink} to="/login" color="primary" fontWeight={700} underline="hover">
                Sign in
              </Link>
            </Typography>
          </Box>
        </Box>
      </Box>

      {/* ─── Registration Success Dialog ──────────────────────── */}
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
              background: 'linear-gradient(135deg, #4f772d 0%, #31572c 100%)',
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
            Registration Successful
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.7 }}>
            Your account has been created successfully. Please verify your email address to activate your account.
          </Typography>
        </DialogContent>
        <DialogActions sx={{ flexDirection: 'column', px: 3, pb: 3, gap: 1 }}>
          <Button
            fullWidth
            variant="contained"
            color="primary"
            size="large"
            onClick={handleContinueToVerification}
            sx={{ borderRadius: 2, fontWeight: 700, py: 1.3 }}
          >
            Continue to Verification
          </Button>
        </DialogActions>
      </Dialog>

      {/* ─── Account Restoration Dialog ──────────────────────── */}
      <Dialog
        open={restorationDialogOpen}
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
              background: 'linear-gradient(135deg, #f57c00 0%, #e65100 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              mx: 'auto',
              mb: 3,
              boxShadow: '0 8px 24px rgba(230,81,0,0.3)',
            }}
          >
            <i className="fi fi-rr-user-add" style={{ color: '#ffffff', fontSize: '36px' }}></i>
          </Box>
          <Typography variant="h5" fontWeight={700} gutterBottom>
            Account Restored
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.7 }}>
            {restorationMessage || 'An account associated with this email address already exists but was deactivated. We have sent a verification code to restore your account.'}
          </Typography>
        </DialogContent>
        <DialogActions sx={{ flexDirection: 'column', px: 3, pb: 3, gap: 1 }}>
          <Button
            fullWidth
            variant="contained"
            color="primary"
            size="large"
            onClick={handleContinueToVerification}
            sx={{ borderRadius: 2, fontWeight: 700, py: 1.3 }}
          >
            Continue to Verification
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default RegisterPage;
