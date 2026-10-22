import React, { useState, useMemo } from 'react';
import { useNavigate, Link as RouterLink } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  getAvailableProvinces,
  getLocationsForProvince,
  getZipCodeForLocation,
  getBarangaysForLocation,
} from '../../utils/locationService';

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
import PersonOutlinedIcon from '@mui/icons-material/PersonOutlined';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import LocationOnOutlinedIcon from '@mui/icons-material/LocationOnOutlined';

const getPasswordChecks = (password) => ({
  minLength: password.length >= 8,
  hasUpper: /[A-Z]/.test(password),
  hasLower: /[a-z]/.test(password),
  hasNumber: /[0-9]/.test(password),
  hasSpecial: /[!@#$%^&*~]/.test(password),
});

const PasswordCheckItem = ({ passed, label }) => (
  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
    {passed ? (
      <CheckCircleIcon sx={{ fontSize: 14, color: 'success.main', flexShrink: 0 }} />
    ) : (
      <CancelIcon sx={{ fontSize: 14, color: 'text.disabled', flexShrink: 0 }} />
    )}
    <Typography
      variant="caption"
      sx={{
        color: passed ? 'text.primary' : 'text.disabled',
        fontWeight: passed ? 500 : 400,
        fontSize: { xs: '0.75rem', sm: '0.75rem' },
      }}
    >
      {label}
    </Typography>
  </Box>
);

const FormSectionHeader = ({ icon, title, subtitle }) => (
  <Box sx={{ pt: 1, pb: 0.5, display: 'flex', alignItems: 'center', gap: 1 }}>
    <Box
      sx={{
        width: 26,
        height: 26,
        borderRadius: 1,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        bgcolor: (theme) =>
          theme.palette.mode === 'dark' ? 'rgba(79, 119, 45, 0.25)' : 'rgba(79, 119, 45, 0.1)',
        color: 'primary.main',
        flexShrink: 0,
      }}
    >
      {icon}
    </Box>
    <Box sx={{ flexGrow: 1, minWidth: 0 }}>
      <Typography
        variant="caption"
        sx={{
          fontWeight: 700,
          textTransform: 'uppercase',
          letterSpacing: '0.08em',
          color: 'text.secondary',
          display: 'block',
          lineHeight: 1.2,
        }}
      >
        {title}
      </Typography>
      {subtitle && (
        <Typography variant="caption" sx={{ color: 'text.disabled', fontSize: '0.7rem' }}>
          {subtitle}
        </Typography>
      )}
    </Box>
  </Box>
);

const fieldSx = {
  '& .MuiInputBase-input': {
    fontSize: { xs: '16px', sm: '0.875rem' },
  },
  '& .MuiInputLabel-root': {
    fontSize: { xs: '14px', sm: '0.875rem' },
  },
};

const RegisterPage = () => {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [contactNumber, setContactNumber] = useState('');
  const [address, setAddress] = useState('');
  const [province, setProvince] = useState(getAvailableProvinces()[0] || 'Batangas');
  const [city, setCity] = useState('');
  const [barangay, setBarangay] = useState('');
  const [zipCode, setZipCode] = useState('');

  const [fieldErrors, setFieldErrors] = useState({});
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const [successDialogOpen, setSuccessDialogOpen] = useState(false);
  const [restorationDialogOpen, setRestorationDialogOpen] = useState(false);
  const [restorationMessage, setRestorationMessage] = useState('');
  const [registeredEmail, setRegisteredEmail] = useState('');
  const [emailDeliveryStatus, setEmailDeliveryStatus] = useState({ sent: true, warning: '' });

  const passwordChecks = useMemo(() => getPasswordChecks(password), [password]);
  const allPasswordChecksPassed = Object.values(passwordChecks).every(Boolean);

  const passwordScore = useMemo(() => {
    return Object.values(passwordChecks).filter(Boolean).length;
  }, [passwordChecks]);

  const strengthDetails = useMemo(() => {
    if (passwordScore <= 1) return { tier: 1, label: 'Weak', color: '#ef4444' };
    if (passwordScore <= 3) return { tier: 2, label: 'Fair', color: '#f59e0b' };
    if (passwordScore === 4) return { tier: 3, label: 'Good', color: '#84cc16' };
    return { tier: 4, label: 'Strong', color: '#16a34a' };
  }, [passwordScore]);

  const isFormValid = useMemo(() => {
    return (
      Boolean(firstName.trim()) &&
      Boolean(lastName.trim()) &&
      Boolean(email.trim()) &&
      Boolean(password) &&
      Boolean(confirmPassword) &&
      Boolean(contactNumber.trim()) &&
      Boolean(address.trim()) &&
      Boolean(province) &&
      Boolean(city) &&
      Boolean(barangay) &&
      Boolean(zipCode) &&
      allPasswordChecksPassed &&
      password === confirmPassword
    );
  }, [
    firstName,
    lastName,
    email,
    password,
    confirmPassword,
    contactNumber,
    address,
    province,
    city,
    barangay,
    zipCode,
    allPasswordChecksPassed,
  ]);

  const handleProvinceChange = (e) => {
    const selectedProvince = e.target.value;
    setProvince(selectedProvince);
    setCity('');
    setBarangay('');
    setZipCode('');
    setFieldErrors((prev) => ({ ...prev, province: '', city: '', barangay: '' }));
  };

  const handleCityChange = (e) => {
    const selectedCity = e.target.value;
    setCity(selectedCity);
    setBarangay('');
    setZipCode(getZipCodeForLocation(province, selectedCity));
    setFieldErrors((prev) => ({ ...prev, city: '', barangay: '' }));
  };

  const handleBarangayChange = (e) => {
    setBarangay(e.target.value);
    setFieldErrors((prev) => ({ ...prev, barangay: '' }));
  };

  const { register } = useAuth();
  const navigate = useNavigate();

  const validateForm = () => {
    const errors = {};
    if (!firstName.trim()) errors.firstName = 'First name is required.';
    if (!lastName.trim()) errors.lastName = 'Last name is required.';
    if (!email.trim()) {
      errors.email = 'Email address is required.';
    } else {
      const emailCheck = validateRealisticEmail(email.trim());
      if (!emailCheck.isValid) {
        errors.email = emailCheck.error;
      }
    }
    if (!contactNumber.trim()) {
      errors.contactNumber = 'Contact number is required.';
    } else if (!/^09[0-9]{9}$/.test(contactNumber)) {
      errors.contactNumber = 'Must be an 11-digit number starting with 09.';
    }
    if (!password) {
      errors.password = 'Password is required.';
    } else if (!allPasswordChecksPassed) {
      errors.password = 'Password does not meet all requirements.';
    }
    if (!confirmPassword) {
      errors.confirmPassword = 'Please confirm your password.';
    } else if (password !== confirmPassword) {
      errors.confirmPassword = 'Passwords do not match.';
    }
    if (!province) errors.province = 'Please select a province.';
    if (!city) errors.city = 'Please select a city or municipality.';
    if (!barangay) errors.barangay = 'Please select a barangay.';
    if (!address.trim()) errors.address = 'Street / House address is required.';
    return errors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    const errors = validateForm();
    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      setError('Please complete all required fields correctly before creating your account.');
      return;
    }

    setFieldErrors({});
    setLoading(true);
    const fullName = `${firstName} ${lastName}`.trim();
    const fullAddress = barangay ? `${address.trim()}, Brgy. ${barangay}` : address.trim();
    const result = await register(
      fullName,
      email,
      password,
      contactNumber,
      fullAddress,
      city,
      province,
      zipCode
    );

    if (result.success) {
      setRegisteredEmail(result.email || email);
      setEmailDeliveryStatus({ sent: result.emailSent !== false, warning: result.emailWarning || '' });
      if (result.isRestoration) {
        setRestorationMessage(result.message);
        setRestorationDialogOpen(true);
      } else {
        setSuccessDialogOpen(true);
      }
    } else {
      setError(result.error);
    }
    setLoading(false);
  };

  const handleContinueToVerification = () => {
    setSuccessDialogOpen(false);
    setRestorationDialogOpen(false);
    navigate('/verify-email', {
      state: {
        email: registeredEmail,
        emailSent: emailDeliveryStatus.sent,
        emailWarning: emailDeliveryStatus.warning
      }
    });
  };

  const clearFieldError = (field) => setFieldErrors((prev) => ({ ...prev, [field]: '' }));

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        bgcolor: 'background.default',
        px: { xs: 2, sm: 3, md: 4 },
        py: { xs: 3, sm: 5, md: 6 },
      }}
    >
      <Box sx={{ width: '100%', maxWidth: 640 }}>
        <Box sx={{ textAlign: 'center', mb: { xs: 2.5, sm: 3.5 } }}>
          <Box
            sx={{
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontFamily: 'Arial, sans-serif',
              fontWeight: 900,
              fontSize: { xs: 26, sm: 32 },
              letterSpacing: '0.05em',
              lineHeight: 1,
              mb: 0.5,
            }}
          >
            <Typography component="span" sx={{ color: '#1e3a8a', fontSize: 'inherit', fontWeight: 'inherit' }}>
              MEGA
            </Typography>
            <Typography
              component="span"
              sx={{
                color: (theme) => (theme.palette.mode === 'dark' ? '#f8fafc' : '#0f172a'),
                fontSize: 'inherit',
                fontWeight: 'inherit',
              }}
            >
              PACIFIC
            </Typography>
          </Box>
          <Typography
            sx={{
              color: '#64748b',
              fontSize: { xs: '9px', sm: '10px' },
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
            p: { xs: 2.5, sm: 4, md: 4.5 },
            borderRadius: { xs: 3, sm: 4 },
            border: '1px solid',
            borderColor: 'divider',
            bgcolor: 'background.paper',
            boxShadow: (theme) =>
              theme.palette.mode === 'dark'
                ? '0 16px 40px rgba(0,0,0,0.5)'
                : '0 16px 40px rgba(15,23,42,0.06)',
          }}
        >
          <Typography
            variant="h5"
            component="h1"
            fontWeight={800}
            color="text.primary"
            sx={{ fontSize: { xs: '1.35rem', sm: '1.6rem' } }}
          >
            Create account
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5, mb: 3 }}>
            Fill in your details to get started with your orders.
          </Typography>

          {error && (
            <Alert severity="error" sx={{ mb: 3, borderRadius: 2 }}>
              {error}
            </Alert>
          )}

          <Box component="form" onSubmit={handleSubmit} noValidate>
            <Grid container spacing={{ xs: 2, sm: 2.5 }}>
              <Grid size={{ xs: 12 }}>
                <FormSectionHeader
                  icon={<PersonOutlinedIcon sx={{ fontSize: 16 }} />}
                  title="Personal Information"
                />
              </Grid>

              <Grid size={{ xs: 12, sm: 6 }}>
                <TextField
                  fullWidth
                  label="First Name"
                  required
                  size="small"
                  value={firstName}
                  onChange={(e) => {
                    setFirstName(e.target.value);
                    clearFieldError('firstName');
                  }}
                  error={!!fieldErrors.firstName}
                  helperText={fieldErrors.firstName}
                  slotProps={{
                    htmlInput: {
                      autoComplete: 'given-name',
                      autoCapitalize: 'words',
                    },
                  }}
                  sx={fieldSx}
                />
              </Grid>

              <Grid size={{ xs: 12, sm: 6 }}>
                <TextField
                  fullWidth
                  label="Last Name"
                  required
                  size="small"
                  value={lastName}
                  onChange={(e) => {
                    setLastName(e.target.value);
                    clearFieldError('lastName');
                  }}
                  error={!!fieldErrors.lastName}
                  helperText={fieldErrors.lastName}
                  slotProps={{
                    htmlInput: {
                      autoComplete: 'family-name',
                      autoCapitalize: 'words',
                    },
                  }}
                  sx={fieldSx}
                />
              </Grid>

              <Grid size={{ xs: 12, sm: 6 }}>
                <TextField
                  fullWidth
                  label="Email Address"
                  type="email"
                  required
                  size="small"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    clearFieldError('email');
                  }}
                  error={!!fieldErrors.email}
                  helperText={fieldErrors.email}
                  placeholder="name@example.com"
                  slotProps={{
                    htmlInput: {
                      inputMode: 'email',
                      autoComplete: 'email',
                      autoCapitalize: 'none',
                      spellCheck: false,
                    },
                  }}
                  sx={fieldSx}
                />
              </Grid>

              <Grid size={{ xs: 12, sm: 6 }}>
                <TextField
                  fullWidth
                  label="Contact Number"
                  required
                  size="small"
                  type="tel"
                  value={contactNumber}
                  onChange={(e) => {
                    let digits = e.target.value.replace(/[^0-9]/g, '');
                    if (digits.startsWith('63')) digits = '0' + digits.slice(2);
                    else if (digits.length > 0 && !digits.startsWith('0') && digits.startsWith('9')) digits = '0' + digits;
                    if (digits.length > 0 && !digits.startsWith('0')) return;
                    if (digits.length > 1 && !digits.startsWith('09')) return;
                    setContactNumber(digits.slice(0, 11));
                    clearFieldError('contactNumber');
                  }}
                  placeholder="09123456789"
                  helperText={fieldErrors.contactNumber || 'Format: 09123456789 (11 digits)'}
                  error={!!fieldErrors.contactNumber}
                  slotProps={{
                    htmlInput: {
                      maxLength: 11,
                      inputMode: 'tel',
                      autoComplete: 'tel',
                    },
                  }}
                  sx={fieldSx}
                />
              </Grid>

              <Grid size={{ xs: 12 }}>
                <FormSectionHeader
                  icon={<LockOutlinedIcon sx={{ fontSize: 16 }} />}
                  title="Account Security"
                />
              </Grid>

              <Grid size={{ xs: 12, sm: 6 }}>
                <TextField
                  fullWidth
                  label="Password"
                  type={showPassword ? 'text' : 'password'}
                  required
                  size="small"
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    clearFieldError('password');
                  }}
                  error={!!fieldErrors.password}
                  helperText={fieldErrors.password}
                  slotProps={{
                    htmlInput: {
                      autoComplete: 'new-password',
                    },
                    input: {
                      endAdornment: (
                        <InputAdornment position="end">
                          <IconButton
                            onClick={() => setShowPassword(!showPassword)}
                            onMouseDown={(e) => e.preventDefault()}
                            edge="end"
                            size="small"
                            aria-label={showPassword ? 'Hide password' : 'Show password'}
                            sx={{ color: 'text.secondary' }}
                          >
                            {showPassword ? <Visibility fontSize="small" /> : <VisibilityOff fontSize="small" />}
                          </IconButton>
                        </InputAdornment>
                      ),
                    },
                  }}
                  sx={{
                    ...fieldSx,
                    '& input::-ms-reveal, & input::-ms-clear': { display: 'none' },
                  }}
                />
              </Grid>

              <Grid size={{ xs: 12, sm: 6 }}>
                <TextField
                  fullWidth
                  label="Confirm Password"
                  type={showConfirmPassword ? 'text' : 'password'}
                  required
                  size="small"
                  value={confirmPassword}
                  onChange={(e) => {
                    setConfirmPassword(e.target.value);
                    clearFieldError('confirmPassword');
                  }}
                  error={!!fieldErrors.confirmPassword}
                  helperText={fieldErrors.confirmPassword}
                  slotProps={{
                    htmlInput: {
                      autoComplete: 'new-password',
                    },
                    input: {
                      endAdornment: (
                        <InputAdornment position="end">
                          <IconButton
                            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                            onMouseDown={(e) => e.preventDefault()}
                            edge="end"
                            size="small"
                            aria-label={showConfirmPassword ? 'Hide confirmed password' : 'Show confirmed password'}
                            sx={{ color: 'text.secondary' }}
                          >
                            {showConfirmPassword ? <Visibility fontSize="small" /> : <VisibilityOff fontSize="small" />}
                          </IconButton>
                        </InputAdornment>
                      ),
                    },
                  }}
                  sx={{
                    ...fieldSx,
                    '& input::-ms-reveal, & input::-ms-clear': { display: 'none' },
                  }}
                />
              </Grid>

              {password.length > 0 && (
                <Grid size={{ xs: 12 }}>
                  <Box
                    sx={{
                      p: 2,
                      borderRadius: 2,
                      bgcolor: (theme) =>
                        theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.03)' : '#f8fafc',
                      border: '1px solid',
                      borderColor: 'divider',
                    }}
                  >
                    <Box
                      sx={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        flexWrap: 'wrap',
                        gap: 1,
                        mb: 1.25,
                      }}
                    >
                      <Typography variant="caption" sx={{ fontWeight: 700, color: 'text.secondary' }}>
                        Password Strength:{' '}
                        <Typography
                          component="span"
                          variant="caption"
                          sx={{ fontWeight: 800, color: strengthDetails.color }}
                        >
                          {strengthDetails.label}
                        </Typography>
                      </Typography>

                      {confirmPassword && (
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                          {password === confirmPassword ? (
                            <Typography
                              variant="caption"
                              sx={{
                                color: 'success.main',
                                fontWeight: 700,
                                display: 'flex',
                                alignItems: 'center',
                                gap: 0.5,
                              }}
                            >
                              <CheckCircleIcon sx={{ fontSize: 14 }} /> Passwords match
                            </Typography>
                          ) : (
                            <Typography
                              variant="caption"
                              sx={{
                                color: 'error.main',
                                fontWeight: 600,
                                display: 'flex',
                                alignItems: 'center',
                                gap: 0.5,
                              }}
                            >
                              <CancelIcon sx={{ fontSize: 14 }} /> Passwords do not match
                            </Typography>
                          )}
                        </Box>
                      )}
                    </Box>

                    <Box sx={{ display: 'flex', gap: 0.75, mb: 1.5 }}>
                      {[1, 2, 3, 4].map((step) => (
                        <Box
                          key={step}
                          sx={{
                            height: 5,
                            flex: 1,
                            borderRadius: 1,
                            bgcolor:
                              step <= strengthDetails.tier
                                ? strengthDetails.color
                                : (theme) =>
                                    theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.1)' : '#e2e8f0',
                            transition: 'background-color 0.25s ease',
                          }}
                        />
                      ))}
                    </Box>

                    <Grid container spacing={1}>
                      <Grid size={{ xs: 12, sm: 6 }}>
                        <PasswordCheckItem passed={passwordChecks.minLength} label="At least 8 characters" />
                      </Grid>
                      <Grid size={{ xs: 12, sm: 6 }}>
                        <PasswordCheckItem passed={passwordChecks.hasUpper} label="One uppercase letter (A–Z)" />
                      </Grid>
                      <Grid size={{ xs: 12, sm: 6 }}>
                        <PasswordCheckItem passed={passwordChecks.hasLower} label="One lowercase letter (a–z)" />
                      </Grid>
                      <Grid size={{ xs: 12, sm: 6 }}>
                        <PasswordCheckItem passed={passwordChecks.hasNumber} label="One number (0–9)" />
                      </Grid>
                      <Grid size={{ xs: 12, sm: 6 }}>
                        <PasswordCheckItem passed={passwordChecks.hasSpecial} label="One special character (!@#$%^&*~)" />
                      </Grid>
                    </Grid>
                  </Box>
                </Grid>
              )}

              <Grid size={{ xs: 12 }}>
                <FormSectionHeader
                  icon={<LocationOnOutlinedIcon sx={{ fontSize: 16 }} />}
                  title="Delivery Address"
                  subtitle="CALABARZON Coverage"
                />
              </Grid>

              <Grid size={{ xs: 12, sm: 6 }}>
                <FormControl fullWidth size="small" required error={!!fieldErrors.province} sx={fieldSx}>
                  <InputLabel id="province-select-label">Province</InputLabel>
                  <Select
                    labelId="province-select-label"
                    id="province-select"
                    value={province}
                    onChange={handleProvinceChange}
                    label="Province"
                    MenuProps={{
                      disableScrollLock: true,
                      PaperProps: {
                        sx: {
                          maxHeight: { xs: 260, sm: 320 },
                          borderRadius: 2,
                          boxShadow: (theme) =>
                            theme.palette.mode === 'dark'
                              ? '0 10px 30px rgba(0,0,0,0.6)'
                              : '0 10px 30px rgba(15,23,42,0.12)',
                        },
                      },
                    }}
                    sx={{
                      '& .MuiSelect-select': { fontSize: { xs: '16px', sm: '0.875rem' } },
                    }}
                  >
                    {getAvailableProvinces().map((prov) => (
                      <MenuItem key={prov} value={prov} sx={{ fontSize: { xs: '15px', sm: '0.875rem' }, py: 1 }}>
                        {prov}
                      </MenuItem>
                    ))}
                  </Select>
                  {fieldErrors.province && <FormHelperText>{fieldErrors.province}</FormHelperText>}
                </FormControl>
              </Grid>

              <Grid size={{ xs: 12, sm: 6 }}>
                <FormControl
                  fullWidth
                  size="small"
                  required
                  error={!!fieldErrors.city}
                  disabled={!province}
                  sx={fieldSx}
                >
                  <InputLabel id="city-select-label">City / Municipality</InputLabel>
                  <Select
                    labelId="city-select-label"
                    id="city-select"
                    value={city}
                    onChange={handleCityChange}
                    label="City / Municipality"
                    MenuProps={{
                      disableScrollLock: true,
                      PaperProps: {
                        sx: {
                          maxHeight: { xs: 260, sm: 320 },
                          borderRadius: 2,
                          boxShadow: (theme) =>
                            theme.palette.mode === 'dark'
                              ? '0 10px 30px rgba(0,0,0,0.6)'
                              : '0 10px 30px rgba(15,23,42,0.12)',
                        },
                      },
                    }}
                    sx={{
                      '& .MuiSelect-select': { fontSize: { xs: '16px', sm: '0.875rem' } },
                    }}
                  >
                    {getLocationsForProvince(province).map((loc) => (
                      <MenuItem key={loc.name} value={loc.name} sx={{ fontSize: { xs: '15px', sm: '0.875rem' }, py: 1 }}>
                        {loc.name}
                      </MenuItem>
                    ))}
                  </Select>
                  {fieldErrors.city ? (
                    <FormHelperText>{fieldErrors.city}</FormHelperText>
                  ) : !province ? (
                    <FormHelperText>Select a province first</FormHelperText>
                  ) : null}
                </FormControl>
              </Grid>

              <Grid size={{ xs: 12, sm: 6 }}>
                <FormControl
                  fullWidth
                  size="small"
                  required
                  error={!!fieldErrors.barangay}
                  disabled={!city}
                  sx={fieldSx}
                >
                  <InputLabel id="barangay-select-label">Barangay</InputLabel>
                  <Select
                    labelId="barangay-select-label"
                    id="barangay-select"
                    value={barangay}
                    onChange={handleBarangayChange}
                    label="Barangay"
                    MenuProps={{
                      disableScrollLock: true,
                      PaperProps: {
                        sx: {
                          maxHeight: { xs: 260, sm: 320 },
                          borderRadius: 2,
                          boxShadow: (theme) =>
                            theme.palette.mode === 'dark'
                              ? '0 10px 30px rgba(0,0,0,0.6)'
                              : '0 10px 30px rgba(15,23,42,0.12)',
                        },
                      },
                    }}
                    sx={{
                      '& .MuiSelect-select': { fontSize: { xs: '16px', sm: '0.875rem' } },
                    }}
                  >
                    {getBarangaysForLocation(province, city).map((brgy) => (
                      <MenuItem key={brgy} value={brgy} sx={{ fontSize: { xs: '15px', sm: '0.875rem' }, py: 1 }}>
                        {brgy}
                      </MenuItem>
                    ))}
                  </Select>
                  {fieldErrors.barangay ? (
                    <FormHelperText>{fieldErrors.barangay}</FormHelperText>
                  ) : !city ? (
                    <FormHelperText>Select a city / municipality first</FormHelperText>
                  ) : null}
                </FormControl>
              </Grid>

              <Grid size={{ xs: 12, sm: 6 }}>
                <TextField
                  fullWidth
                  label="Zip Code"
                  required
                  size="small"
                  value={zipCode}
                  slotProps={{
                    input: {
                      readOnly: true,
                    },
                    htmlInput: {
                      inputMode: 'numeric',
                      style: { fontWeight: 600 },
                    },
                  }}
                  sx={{
                    ...fieldSx,
                    bgcolor: (theme) =>
                      theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.03)' : '#f8fafc',
                  }}
                  helperText={zipCode ? 'Auto-filled based on City / Municipality' : 'Auto-fills when City is selected'}
                />
              </Grid>

              <Grid size={{ xs: 12 }}>
                <TextField
                  fullWidth
                  label="Street Name, Building, House No."
                  placeholder="e.g. Unit 4B, 123 Emerald St., Phase 2"
                  variant="outlined"
                  size="small"
                  required
                  value={address}
                  onChange={(e) => {
                    setAddress(e.target.value);
                    clearFieldError('address');
                  }}
                  error={!!fieldErrors.address}
                  helperText={fieldErrors.address}
                  slotProps={{
                    htmlInput: {
                      autoComplete: 'street-address',
                    },
                  }}
                  sx={fieldSx}
                />
              </Grid>
            </Grid>

            <Button
              type="submit"
              fullWidth
              variant="contained"
              color="primary"
              size="large"
              disabled={loading}
              sx={{
                mt: 3.5,
                mb: 2,
                py: { xs: 1.5, sm: 1.6 },
                borderRadius: 2.5,
                fontWeight: 700,
                fontSize: { xs: '0.95rem', sm: '1rem' },
                letterSpacing: '0.02em',
                textTransform: 'none',
                boxShadow: '0 4px 14px rgba(79, 119, 45, 0.35)',
                '&:hover': {
                  boxShadow: '0 6px 20px rgba(79, 119, 45, 0.45)',
                },
              }}
            >
              {loading ? <CircularProgress size={24} color="inherit" /> : 'Create Account'}
            </Button>
          </Box>

          <Box textAlign="center" sx={{ mt: 2 }}>
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
        PaperProps={{ sx: { borderRadius: 3, p: { xs: 1, sm: 1.5 }, mx: 2 } }}
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
            {emailDeliveryStatus.sent
              ? 'Your account has been created successfully. We sent a 6-digit verification code to your email.'
              : `Your account has been created successfully. However, our email service could not deliver the OTP automatically (${emailDeliveryStatus.warning || 'service offline'}). You can request a new code on the next screen.`}
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
        PaperProps={{ sx: { borderRadius: 3, p: { xs: 1, sm: 1.5 }, mx: 2 } }}
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
            {restorationMessage ||
              'An account associated with this email address already exists but was deactivated. We have sent a verification code to restore your account.'}
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
