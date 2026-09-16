import React from 'react';
import {
  Box,
  Grid,
  Typography,
  TextField,
  Button,
  MenuItem,
  Divider,
  Avatar,
  Fade,
} from '@mui/material';

import {
  getAvailableProvinces,
  getLocationsForProvince,
} from '../utils/locationService';

const ShippingInfoWidget = ({
  formData,
  errors,
  hasProfile,
  isEditingAddress,
  onEdit,
  onCancelEdit,
  onInputChange,
  addresses = [],
  selectedAddressId,
  onSelectAddress
}) => {
  const showAddressForm = !hasProfile || isEditingAddress;

  return (
    <Box>
      {/* ── Header ── */}
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          mb: 2,
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <Avatar
            sx={{
              bgcolor: 'primary.main',
              width: 40,
              height: 40,
              boxShadow: '0 2px 8px rgba(79,119,45,0.25)',
            }}
          >
            <i className="fi fi-rr-truck-side" style={{ fontSize: '18px', color: '#ffffff' }}></i>
          </Avatar>
          <Typography variant="h6" fontWeight={700}>
            Shipping Information
          </Typography>
        </Box>


      </Box>

      <Divider sx={{ mb: 3 }} />

      {/* ── Content ── */}
      <Fade in timeout={300}>
        <Box>
          {showAddressForm ? (
            /* ── Editable Form ── */
            <Grid container spacing={2.5}>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Full Name"
                  name="customerName"
                  required
                  value={formData.customerName}
                  onChange={onInputChange}
                  error={!!errors.customerName}
                  helperText={errors.customerName}
                  InputProps={{
                    startAdornment: (
                      <i className="fi fi-rr-user" style={{ fontSize: '16px', color: '#64748b', marginRight: '8px' }}></i>
                    ),
                  }}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Email Address"
                  name="customerEmail"
                  type="email"
                  required
                  value={formData.customerEmail}
                  onChange={onInputChange}
                  error={!!errors.customerEmail}
                  helperText={errors.customerEmail}
                  InputProps={{
                    startAdornment: (
                      <i className="fi fi-rr-envelope" style={{ fontSize: '16px', color: '#64748b', marginRight: '8px' }}></i>
                    ),
                  }}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Contact Number"
                  name="contactNumber"
                  required
                  value={formData.contactNumber}
                  onChange={onInputChange}
                  error={!!errors.contactNumber}
                  helperText={errors.contactNumber}
                  InputProps={{
                    startAdornment: (
                      <i className="fi fi-rr-phone-call" style={{ fontSize: '16px', color: '#64748b', marginRight: '8px' }}></i>
                    ),
                  }}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Zip Code"
                  name="zipCode"
                  required
                  value={formData.zipCode}
                  InputProps={{
                    readOnly: true,
                    startAdornment: (
                      <i className="fi fi-rr-marker" style={{ fontSize: '16px', color: '#64748b', marginRight: '8px' }}></i>
                    ),
                  }}
                  sx={{ bgcolor: 'rgba(0,0,0,0.02)' }}
                  error={!!errors.zipCode}
                  helperText={errors.zipCode}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Complete Address"
                  name="address"
                  required
                  value={formData.address}
                  onChange={onInputChange}
                  error={!!errors.address}
                  helperText={errors.address}
                  InputProps={{
                    startAdornment: (
                      <i className="fi fi-rr-marker" style={{ fontSize: '16px', color: '#64748b', marginRight: '8px' }}></i>
                    ),
                  }}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  select
                  fullWidth
                  label="City / Municipality"
                  name="city"
                  required
                  value={formData.city}
                  onChange={onInputChange}
                  error={!!errors.city}
                  helperText={errors.city}
                >
                  <MenuItem value="" disabled>
                    Select City
                  </MenuItem>
                  {getLocationsForProvince(
                    formData.province || 'Cavite'
                  ).map((loc) => (
                    <MenuItem key={loc.name} value={loc.name}>
                      {loc.name}
                    </MenuItem>
                  ))}
                </TextField>
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  select
                  fullWidth
                  label="Province"
                  name="province"
                  required
                  value={formData.province}
                  disabled
                  error={!!errors.province}
                  helperText={errors.province}
                >
                  {getAvailableProvinces().map((prov) => (
                    <MenuItem key={prov} value={prov}>
                      {prov}
                    </MenuItem>
                  ))}
                </TextField>
              </Grid>
            </Grid>
          ) : (
            /* ── Read-Only Summary Card ── */
            <Box>
              {addresses.length > 1 && (
                <Box sx={{ mb: 3 }}>
                  <Typography variant="body2" fontWeight="bold" sx={{ mb: 1, color: 'text.secondary' }}>Select Shipping Address</Typography>
                  <TextField
                    select
                    fullWidth
                    value={selectedAddressId || ''}
                    onChange={(e) => onSelectAddress(e.target.value)}
                    size="small"
                  >
                    {addresses.map((addr) => (
                      <MenuItem key={addr.id} value={addr.id}>
                        {addr.address}, {addr.city} {addr.isDefault && "(Default)"}
                      </MenuItem>
                    ))}
                  </TextField>
                </Box>
              )}
              <Box
                sx={{
                  p: 3,
                  borderRadius: 3,
                  bgcolor: 'grey.50',
                  border: '1px solid',
                  borderColor: 'divider',
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    borderColor: 'primary.light',
                    boxShadow: '0 2px 12px rgba(79,119,45,0.08)',
                  },
                }}
              >
                <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 2 }}>
                  <Avatar
                    sx={{
                      bgcolor: 'primary.50',
                      color: 'primary.main',
                      width: 44,
                      height: 44,
                    }}
                  >
                    <i className="fi fi-rr-marker" style={{ fontSize: '20px', color: '#1e3a8a' }}></i>
                  </Avatar>
                  <Box sx={{ flex: 1 }}>
                    <Typography variant="subtitle1" fontWeight={700} gutterBottom>
                      {formData.customerName}
                    </Typography>
                    <Box
                      sx={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 0.5,
                        mb: 0.5,
                      }}
                    >
                      <i className="fi fi-rr-phone-call" style={{ fontSize: '13px', color: '#94a3b8' }}></i>
                      <Typography variant="body2" color="text.secondary">
                        {formData.contactNumber}
                      </Typography>
                    </Box>
                    <Typography variant="body1" sx={{ mb: 0.5 }}>
                      {formData.address}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {formData.city}, {formData.province} {formData.zipCode}
                    </Typography>
                    <Box
                      sx={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 0.5,
                        mt: 1,
                      }}
                    >
                      <i className="fi fi-rr-envelope" style={{ fontSize: '13px', color: '#94a3b8' }}></i>
                      <Typography variant="body2" color="text.secondary">
                        {formData.customerEmail}
                      </Typography>
                    </Box>
                  </Box>
                </Box>
              </Box>
            </Box>
          )}
        </Box>
      </Fade>
    </Box>
  );
};

export default ShippingInfoWidget;
