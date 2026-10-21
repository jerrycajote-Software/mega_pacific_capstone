import React, { useState, useMemo } from 'react';
import { useNavigate, Link as RouterLink } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { getAvailableProvinces, getLocationsForProvince, getZipCodeForLocation, getBarangaysForLocation } from '../../utils/locationService';
import { validateRealisticEmail } from '../../utils/emailValidator';
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
  FormControl,
  InputLabel,
  Select,
  FormHelperText,
  Paper,
} from '@mui/material';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';

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
  const [barangay, setBarangay]               = useState('');
  const [zipCode, setZipCode]                 = useState('');


  const [fieldErrors, setFieldErrors] = useState({});
  const [error, setError]             = useState('');
  const [loading, setLoading]         = useState(false);

  const [successDialogOpen, setSuccessDialogOpen] = useState(false);
  const [restorationDialogOpen, setRestorationDialogOpen] = useState(false);
  const [restorationMessage, setRestorationMessage] = useState('');
  const [registeredEmail, setRegisteredEmail]     = useState('');

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
      province &&
      city &&
      barangay &&
      zipCode &&
      allPasswordChecksPassed &&
      password === confirmPassword
    );
  }, [firstName, lastName, email, password, confirmPassword, contactNumber, address, province, city, barangay, zipCode, allPasswordChecksPassed]);

  const handleCityChange = (e) => {
    const selectedCity = e.target.value;
    setCity(selectedCity);
    setBarangay('');
    setZipCode(getZipCodeForLocation(province, selectedCity));
    setFieldErrors((prev) => ({ ...prev, city: '', barangay: '' }));
  };

  const { register } = useAuth();
  const navigate = useNavigate();

  // Validate all fields and highlight which ones are empty
  const validateForm = () => {
    const errors = {};
    if (!firstName.trim())       errors.firstName = 'First name is required.';
    if (!lastName.trim())        errors.lastName  = 'Last name is required.';
    if (!email.trim()) {
      errors.email = 'Email address is required.';
    } else {
      const emailCheck = validateRealisticEmail(email.trim());
      if (!emailCheck.isValid) {
        errors.email = emailCheck.error;
      }
    }
    if (!contactNumber.trim())   errors.contactNumber = 'Contact number is required.';
    else if (!/^09[0-9]{9}$/.test(contactNumber)) errors.contactNumber = 'Must be an 11-digit number starting with 09.';
    if (!address.trim())         errors.address   = 'Street / House address is required.';
    if (!province)               errors.province  = 'Please select a province.';
    if (!city)                   errors.city      = 'Please select a city.';
    if (!barangay)               errors.barangay  = 'Please select a barangay.';
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
    const fullAddress = barangay ? `${address.trim()}, Brgy. ${barangay}` : address.trim();
    const result = await register(fullName, email, password, contactNumber, fullAddress, city, province, zipCode);

    if (result.success) {
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

  const clearFieldError = (field) =>
    setFieldErrors((prev) => ({ ...prev, [field]: '' }));

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        bgcolor: 'background.default',
        px: { xs: 2, sm: 4 },
        py: { xs: 4, sm: 6 },
      }}
    >
      <Box sx={{ width: '100%', maxWidth: 640 }}>
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
            Create account
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
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
                    const onlyNumbers = e.target.value.replace(/[^0-9]/g, '').slice(0, 11);
                    setContactNumber(onlyNumbers); 
                    clearFieldError('contactNumber'); 
                  }}
                  inputProps={{ maxLength: 11, pattern: '^09[0-9]{9}$', title: 'Must be an 11-digit number starting with 09' }}
                  helperText={fieldErrors.contactNumber || 'Format: 09123456789'}
                  error={!!fieldErrors.contactNumber}
                />
              </Grid>

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
                  sx={{ '& input::-ms-reveal, & input::-ms-clear': { display: 'none' } }}
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
                  sx={{ '& input::-ms-reveal, & input::-ms-clear': { display: 'none' } }}
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
              </Grid>


              <Grid item xs={12} sm={6}>
                <FormControl fullWidth size="small" required error={!!fieldErrors.province}>
                  <InputLabel id="province-label">Province</InputLabel>
                  <Select
                    labelId="province-label"
                    value={province}
                    onChange={(e) => {
                      setProvince(e.target.value);
                      setCity('');
                      setBarangay('');
                      setZipCode('');
                      setFieldErrors((prev) => ({ ...prev, province: '', city: '', barangay: '' }));
                    }}
                    label="Province"
                    MenuProps={{ disableScrollLock: true }}
                  >
                    {getAvailableProvinces().map(prov => (
                      <MenuItem key={prov} value={prov}>{prov}</MenuItem>
                    ))}
                  </Select>
                  {fieldErrors.province && <FormHelperText>{fieldErrors.province}</FormHelperText>}
                </FormControl>
              </Grid>

              <Grid item xs={12} sm={6}>
                <FormControl fullWidth size="small" required error={!!fieldErrors.city} disabled={!province}>
                  <InputLabel id="city-label">City / Municipality</InputLabel>
                  <Select
                    labelId="city-label"
                    value={city}
                    onChange={handleCityChange}
                    label="City / Municipality"
                    MenuProps={{ disableScrollLock: true }}
                  >
                    <MenuItem value="" disabled>Select City / Municipality</MenuItem>
                    {getLocationsForProvince(province).map(loc => (
                      <MenuItem key={loc.name} value={loc.name}>{loc.name}</MenuItem>
                    ))}
                  </Select>
                  {fieldErrors.city && <FormHelperText>{fieldErrors.city}</FormHelperText>}
                </FormControl>
              </Grid>

              <Grid item xs={12} sm={6}>
                <FormControl fullWidth size="small" required error={!!fieldErrors.barangay} disabled={!city}>
                  <InputLabel id="barangay-label">Barangay</InputLabel>
                  <Select
                    labelId="barangay-label"
                    value={barangay}
                    onChange={(e) => {
                      setBarangay(e.target.value);
                      setFieldErrors((prev) => ({ ...prev, barangay: '' }));
                    }}
                    label="Barangay"
                    MenuProps={{ disableScrollLock: true }}
                  >
                    <MenuItem value="" disabled>Select Barangay</MenuItem>
                    {getBarangaysForLocation(province, city).map(brgy => (
                      <MenuItem key={brgy} value={brgy}>{brgy}</MenuItem>
                    ))}
                  </Select>
                  {fieldErrors.barangay && <FormHelperText>{fieldErrors.barangay}</FormHelperText>}
                </FormControl>
              </Grid>

              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Zip Code"
                  required
                  size="small"
                  value={zipCode}
                  slotProps={{
                    input: {
                      readOnly: true,
                    }
                  }}
                  sx={{ bgcolor: 'action.hover' }}
                  helperText={zipCode ? "Auto-filled based on City / Municipality" : "Auto-filled"}
                />
              </Grid>

              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Street Name, Building, House No."
                  placeholder="e.g. Unit 4B, 123 Emerald St., Phase 2"
                  variant="outlined"
                  size="small"
                  required
                  value={address}
                  onChange={(e) => { setAddress(e.target.value); clearFieldError('address'); }}
                  error={!!fieldErrors.address}
                  helperText={fieldErrors.address}
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

          <Box textAlign="center" sx={{ mt: 3 }}>
            <Typography variant="body2" color="text.secondary">
              Already have an account?{' '}
              <Link component={RouterLink} to="/login" color="primary" fontWeight={700} underline="hover">
                Sign in
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
