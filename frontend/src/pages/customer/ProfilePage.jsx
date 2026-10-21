import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';
import {
  Box,
  Typography,
  TextField,
  Button,
  Paper,
  Avatar,
  CircularProgress,
  Alert,
  Chip,
  Card,
  CardContent,
  CardActions,
  Divider,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Modal,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Snackbar,
  Stack,
  IconButton
} from '@mui/material';
import {
  getAvailableProvinces,
  getLocationsForProvince,
  getZipCodeForLocation
} from '../../utils/locationService';

const ProfilePage = () => {
  const { user, token } = useAuth();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [addresses, setAddresses] = useState([]);
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingAddressId, setEditingAddressId] = useState(null);
  
  const [deleteConfirmId, setDeleteConfirmId] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const [toast, setToast] = useState({ open: false, message: '', severity: 'success' });
  const [formError, setFormError] = useState('');

  const [formData, setFormData] = useState({
    contactNumber: '',
    address: '',
    city: '',
    province: 'Cavite',
    zipCode: '',
    isDefault: false
  });

  const fetchProfile = useCallback(async () => {
    try {
      const API_URL = import.meta.env.VITE_API_URL || '';
      const res = await axios.get(`${API_URL}/api/auth/profile`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.data.data) {
        setAddresses(res.data.data.addresses || []);
      }
    } catch (err) {
      console.error('Failed to fetch profile', err);
      setToast({ open: true, message: 'Failed to load your profile addresses.', severity: 'error' });
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    if (token) fetchProfile();
  }, [token, fetchProfile]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    
    if (name === 'province') {
      setFormData(prev => ({
        ...prev,
        province: value,
        city: '',
        zipCode: ''
      }));
      setFormError('');
      return;
    }

    if (name === 'city') {
      const zipCode = getZipCodeForLocation(formData.province || 'Cavite', value);
      setFormData(prev => ({ ...prev, city: value, zipCode }));
      setFormError('');
      return;
    }
    
    setFormData(prev => ({ ...prev, [name]: value }));
    setFormError('');
  };

  const validateForm = () => {
    if (!formData.contactNumber || !formData.address || !formData.city || !formData.province || !formData.zipCode) {
      setFormError('All address fields are required.');
      return false;
    }
    const phoneRegex = /^09[0-9]{9}$/;
    if (!phoneRegex.test(formData.contactNumber)) {
      setFormError('Contact number must be an 11-digit mobile number starting with 09.');
      return false;
    }
    const zipRegex = /^[0-9]{4}$/;
    if (!zipRegex.test(formData.zipCode)) {
      setFormError('Zip Code must be a 4-digit number.');
      return false;
    }
    return true;
  };

  const handleOpenAddModal = () => {
    setEditingAddressId(null);
    setFormData({
      contactNumber: user?.contactNumber || '',
      address: '',
      city: '',
      province: 'Cavite',
      zipCode: '',
      isDefault: addresses.length === 0
    });
    setFormError('');
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (addr) => {
    setEditingAddressId(addr.id);
    setFormData({
      contactNumber: addr.contactNumber || '',
      address: addr.address || '',
      city: addr.city || '',
      province: addr.province || 'Cavite',
      zipCode: addr.zipCode || '',
      isDefault: addr.isDefault || false
    });
    setFormError('');
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setFormError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;
    setSaving(true);
    setFormError('');

    try {
      const API_URL = import.meta.env.VITE_API_URL || '';
      if (editingAddressId) {
        await axios.put(`${API_URL}/api/auth/addresses/${editingAddressId}`, formData, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setToast({ open: true, message: 'Address updated successfully!', severity: 'success' });
      } else {
        await axios.post(`${API_URL}/api/auth/addresses`, formData, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setToast({ open: true, message: 'New delivery address added successfully!', severity: 'success' });
      }
      setIsModalOpen(false);
      fetchProfile();
    } catch (err) {
      console.error('Failed to save address', err);
      setFormError(err.response?.data?.error || 'Failed to save address. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const handleSetDefault = async (id) => {
    try {
      const API_URL = import.meta.env.VITE_API_URL || '';
      await axios.put(`${API_URL}/api/auth/addresses/${id}/default`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchProfile();
      setToast({ open: true, message: 'Default delivery address updated.', severity: 'success' });
    } catch (err) {
      console.error('Failed to set default address', err);
      setToast({ open: true, message: 'Failed to update default address.', severity: 'error' });
    }
  };

  const handleDeleteAddress = async () => {
    if (!deleteConfirmId) return;
    setIsDeleting(true);
    try {
      const API_URL = import.meta.env.VITE_API_URL || '';
      await axios.delete(`${API_URL}/api/auth/addresses/${deleteConfirmId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchProfile();
      setToast({ open: true, message: 'Address removed successfully.', severity: 'success' });
    } catch (err) {
      console.error('Failed to delete address', err);
      setToast({ open: true, message: 'Failed to delete address.', severity: 'error' });
    } finally {
      setIsDeleting(false);
      setDeleteConfirmId(null);
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', py: 15, gap: 2 }}>
        <CircularProgress sx={{ color: '#4f772d' }} />
        <Typography variant="body2" color="text.secondary">Loading profile...</Typography>
      </Box>
    );
  }

  const defaultAddress = addresses.find(a => a.isDefault) || addresses[0];
  const userInitial = (user?.name || user?.email || 'C').charAt(0).toUpperCase();

  return (
    <Box sx={{ animation: 'fadeIn 0.35s ease-in-out', pb: 10, maxWidth: 1200, mx: 'auto', px: { xs: 1.5, sm: 2.5, md: 0 } }}>
      
      <Box sx={{ mb: 3.5 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <Box 
            sx={{ 
              width: 44, 
              height: 44, 
              borderRadius: 2.5, 
              bgcolor: 'rgba(79, 119, 45, 0.1)', 
              color: '#4f772d', 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center' 
            }}
          >
            <i className="fi fi-rr-user" style={{ fontSize: 22 }} />
          </Box>
          <Box>
            <Typography variant="h4" fontWeight={900} color="text.primary" sx={{ letterSpacing: '-0.02em', fontSize: { xs: '1.5rem', sm: '2rem' } }}>
              My Profile
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Manage your customer account information and jobsite delivery addresses.
            </Typography>
          </Box>
        </Box>
      </Box>

      <Box 
        sx={{ 
          display: 'grid', 
          gridTemplateColumns: { xs: '1fr', lg: '340px 1fr' }, 
          gap: 3.5, 
          alignItems: 'start' 
        }}
      >
        
        <Stack spacing={3}>
          <Paper 
            elevation={0} 
            sx={{ 
              p: { xs: 3, sm: 3.5 }, 
              borderRadius: 3.5, 
              border: '1px solid', 
              borderColor: 'divider', 
              bgcolor: 'background.paper',
              textAlign: 'center',
              boxShadow: '0 2px 10px rgba(0,0,0,0.03)'
            }}
          >
            <Box sx={{ position: 'relative', width: 92, height: 92, mx: 'auto', mb: 2 }}>
              <Avatar 
                sx={{ 
                  width: 92, 
                  height: 92, 
                  bgcolor: '#4f772d', 
                  color: '#ffffff', 
                  fontSize: '2.5rem', 
                  fontWeight: 900,
                  boxShadow: '0 6px 20px rgba(79, 119, 45, 0.25)',
                  border: '3px solid #ffffff'
                }}
              >
                {userInitial}
              </Avatar>
            </Box>

            <Typography variant="h5" fontWeight={900} color="text.primary" sx={{ letterSpacing: '-0.01em', mb: 0.5 }}>
              {user?.name || 'Valued Customer'}
            </Typography>
            
            <Typography variant="body2" color="text.secondary" sx={{ mb: 1.5, wordBreak: 'break-all' }}>
              {user?.email}
            </Typography>

            <Box sx={{ display: 'flex', justifyContent: 'center', gap: 1, flexWrap: 'wrap', mb: 3 }}>
              <Chip 
                icon={<i className="fi fi-sr-check-circle" style={{ fontSize: 12, marginLeft: 6, color: '#16a34a' }} />} 
                label="Active Customer" 
                size="small" 
                sx={{ 
                  fontWeight: 700, 
                  fontSize: '0.72rem',
                  bgcolor: 'rgba(22, 163, 74, 0.08)',
                  color: '#16a34a',
                  border: '1px solid rgba(22, 163, 74, 0.25)'
                }} 
              />
              <Chip 
                label="CALABARZON Hub" 
                size="small" 
                sx={{ 
                  fontWeight: 600, 
                  fontSize: '0.72rem',
                  bgcolor: 'action.hover',
                  color: 'text.secondary'
                }} 
              />
            </Box>

            <Divider sx={{ mb: 2.5 }} />

            <Stack spacing={1.5} sx={{ textAlign: 'left', mb: 3 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Typography variant="caption" color="text.secondary" fontWeight={600}>
                  Account Type
                </Typography>
                <Typography variant="body2" fontWeight={800} color="text.primary">
                  Pre-Order Direct Buyer
                </Typography>
              </Box>

              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Typography variant="caption" color="text.secondary" fontWeight={600}>
                  Saved Addresses
                </Typography>
                <Typography variant="body2" fontWeight={800} color="text.primary">
                  {addresses.length} {addresses.length === 1 ? 'Location' : 'Locations'}
                </Typography>
              </Box>

              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Typography variant="caption" color="text.secondary" fontWeight={600}>
                  Default Location
                </Typography>
                <Typography variant="body2" fontWeight={800} color="text.primary" noWrap sx={{ maxWidth: 160 }}>
                  {defaultAddress ? `${defaultAddress.city}, ${defaultAddress.province}` : 'Not configured'}
                </Typography>
              </Box>
            </Stack>

            <Divider sx={{ mb: 2.5 }} />

            <Button
              variant="contained"
              fullWidth
              startIcon={<i className="fi fi-rr-shopping-bag" style={{ fontSize: 14 }} />}
              onClick={() => navigate('/orders')}
              sx={{
                borderRadius: 2.5,
                textTransform: 'none',
                fontWeight: 700,
                py: 1.15,
                bgcolor: '#4f772d',
                boxShadow: '0 4px 12px rgba(79, 119, 45, 0.25)',
                '&:hover': { 
                  bgcolor: '#3d5c22',
                  boxShadow: '0 6px 16px rgba(79, 119, 45, 0.35)'
                }
              }}
            >
              Track My Orders
            </Button>
          </Paper>

          <Paper 
            elevation={0} 
            sx={{ 
              p: 2.5, 
              borderRadius: 3, 
              border: '1px solid', 
              borderColor: 'divider', 
              bgcolor: 'background.default'
            }}
          >
            <Box sx={{ display: 'flex', gap: 1.5, alignItems: 'flex-start' }}>
              <Avatar sx={{ bgcolor: 'rgba(79, 119, 45, 0.1)', color: '#4f772d', width: 36, height: 36 }}>
                <i className="fi fi-rr-headset" style={{ fontSize: 16 }} />
              </Avatar>
              <Box>
                <Typography variant="subtitle2" fontWeight={800} color="text.primary">
                  Need Help with Delivery?
                </Typography>
                <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 0.25, lineHeight: 1.4 }}>
                  Our dispatch logistics team can assist with access clearances for narrow roads and boom-truck unloading.
                </Typography>
                <Typography variant="body2" fontWeight={800} sx={{ color: '#4f772d', mt: 1 }}>
                  Hotline: (046) 471-2345
                </Typography>
              </Box>
            </Box>
          </Paper>
        </Stack>

        <Paper 
          elevation={0} 
          sx={{ 
            p: { xs: 2.5, sm: 3.5 }, 
            borderRadius: 3.5, 
            border: '1px solid', 
            borderColor: 'divider', 
            bgcolor: 'background.paper',
            boxShadow: '0 2px 10px rgba(0,0,0,0.03)'
          }}
        >
          <Box sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, justifyContent: 'space-between', alignItems: { xs: 'flex-start', sm: 'center' }, gap: 2, mb: 3, pb: 2.5, borderBottom: '1px solid', borderColor: 'divider' }}>
            <Box>
              <Typography variant="h6" fontWeight={900} color="text.primary" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <i className="fi fi-rr-marker" style={{ fontSize: 18, color: '#4f772d' }} />
                Saved Delivery Addresses
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mt: 0.25 }}>
                Manage destination jobsites and default delivery locations for your roofing pre-orders.
              </Typography>
            </Box>

            <Button
              onClick={handleOpenAddModal}
              startIcon={<i className="fi fi-rr-plus" style={{ fontSize: 12 }} />}
              variant="contained"
              sx={{
                borderRadius: 2.5,
                textTransform: 'none',
                fontWeight: 700,
                px: 2.5,
                py: 0.9,
                bgcolor: '#4f772d',
                color: '#ffffff',
                boxShadow: '0 4px 12px rgba(79, 119, 45, 0.25)',
                '&:hover': {
                  bgcolor: '#3d5c22',
                  boxShadow: '0 6px 16px rgba(79, 119, 45, 0.35)'
                }
              }}
            >
              Add New Address
            </Button>
          </Box>

          {addresses.length === 0 ? (
            <Box sx={{ textAlign: 'center', py: 8 }}>
              <Box sx={{ width: 64, height: 64, borderRadius: '50%', bgcolor: 'grey.100', display: 'flex', alignItems: 'center', justifyContent: 'center', mx: 'auto', mb: 2 }}>
                <i className="fi fi-rr-marker" style={{ fontSize: 26, color: '#94a3b8' }} />
              </Box>
              <Typography variant="h6" fontWeight={800} gutterBottom>
                No saved addresses yet
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 3, maxWidth: 360, mx: 'auto' }}>
                Add your primary construction jobsite or residence to speed up checkout calculations and distance freight estimates.
              </Typography>
              <Button
                variant="contained"
                onClick={handleOpenAddModal}
                startIcon={<i className="fi fi-rr-plus" style={{ fontSize: 12 }} />}
                sx={{ borderRadius: 2.5, textTransform: 'none', fontWeight: 700, bgcolor: '#4f772d', '&:hover': { bgcolor: '#3d5c22' } }}
              >
                Add Your First Address
              </Button>
            </Box>
          ) : (
            <Box 
              sx={{ 
                display: 'grid', 
                gridTemplateColumns: { xs: '1fr', md: 'repeat(auto-fill, minmax(290px, 1fr))' }, 
                gap: 2.5 
              }}
            >
              {addresses.map((addr) => {
                const isDefault = addr.isDefault;

                return (
                  <Card 
                    key={addr.id}
                    elevation={0}
                    sx={{ 
                      borderRadius: 3,
                      border: '1px solid',
                      borderColor: isDefault ? '#4f772d' : 'divider',
                      bgcolor: isDefault ? 'rgba(79, 119, 45, 0.03)' : 'background.paper',
                      display: 'flex',
                      flexDirection: 'column',
                      transition: 'all 0.25s ease',
                      boxShadow: isDefault ? '0 4px 16px rgba(79, 119, 45, 0.1)' : '0 2px 6px rgba(0,0,0,0.02)',
                      '&:hover': {
                        borderColor: isDefault ? '#3d5c22' : 'grey.400',
                        boxShadow: '0 6px 20px rgba(0,0,0,0.06)',
                        transform: 'translateY(-2px)'
                      }
                    }}
                  >
                    <CardContent sx={{ p: 2.5, flexGrow: 1 }}>
                      
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                        {isDefault ? (
                          <Chip 
                            icon={<i className="fi fi-sr-star" style={{ fontSize: 11, marginLeft: 4, color: '#4f772d' }} />}
                            label="Default Delivery Point" 
                            size="small"
                            sx={{ 
                              fontWeight: 800, 
                              fontSize: '0.68rem',
                              bgcolor: 'rgba(79, 119, 45, 0.1)',
                              color: '#4f772d',
                              border: '1px solid rgba(79, 119, 45, 0.25)'
                            }} 
                          />
                        ) : (
                          <Chip 
                            label="Alternative Site" 
                            size="small"
                            sx={{ 
                              fontWeight: 600, 
                              fontSize: '0.68rem',
                              bgcolor: 'action.hover',
                              color: 'text.secondary'
                            }} 
                          />
                        )}

                        <IconButton 
                          size="small" 
                          onClick={() => handleOpenEditModal(addr)}
                          sx={{ color: 'text.secondary', '&:hover': { color: '#4f772d', bgcolor: 'action.hover' } }}
                        >
                          <i className="fi fi-rr-edit" style={{ fontSize: 13 }} />
                        </IconButton>
                      </Box>

                      <Typography variant="body2" fontWeight={800} color="text.primary" sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1.5 }}>
                        <i className="fi fi-rr-phone-call" style={{ fontSize: 13, color: '#4f772d' }} />
                        {addr.contactNumber}
                      </Typography>

                      <Typography variant="body2" color="text.primary" sx={{ fontWeight: 600, lineHeight: 1.4, mb: 0.5 }}>
                        {addr.address}
                      </Typography>

                      <Typography variant="caption" color="text.secondary" sx={{ display: 'block', fontSize: '0.78rem' }}>
                        {addr.city}, {addr.province} {addr.zipCode}
                      </Typography>
                    </CardContent>

                    <Divider />

                    <CardActions sx={{ px: 2, py: 1.25, bgcolor: isDefault ? 'rgba(79, 119, 45, 0.05)' : 'background.default', justifyContent: 'space-between' }}>
                      <Button 
                        size="small" 
                        variant="text" 
                        onClick={() => handleOpenEditModal(addr)} 
                        startIcon={<i className="fi fi-rr-edit" style={{ fontSize: 12 }} />}
                        sx={{ fontWeight: 700, textTransform: 'none', color: 'text.primary', fontSize: '0.75rem' }}
                      >
                        Edit
                      </Button>

                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                        {!isDefault && (
                          <>
                            <Button 
                              size="small" 
                              variant="text" 
                              onClick={() => handleSetDefault(addr.id)} 
                              startIcon={<i className="fi fi-rr-star" style={{ fontSize: 11 }} />}
                              sx={{ fontWeight: 700, textTransform: 'none', color: '#4f772d', fontSize: '0.75rem' }}
                            >
                              Set Default
                            </Button>

                            <IconButton 
                              size="small" 
                              onClick={() => setDeleteConfirmId(addr.id)}
                              sx={{ color: 'error.main', p: 0.75, '&:hover': { bgcolor: 'error.50' } }}
                            >
                              <i className="fi fi-rr-trash" style={{ fontSize: 13 }} />
                            </IconButton>
                          </>
                        )}
                        {isDefault && (
                          <Typography variant="caption" sx={{ color: '#4f772d', fontWeight: 800, fontSize: '0.72rem', px: 1 }}>
                            Active Default
                          </Typography>
                        )}
                      </Box>
                    </CardActions>
                  </Card>
                );
              })}
            </Box>
          )}
        </Paper>
      </Box>

      <Modal
        open={isModalOpen}
        onClose={handleCloseModal}
        sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', p: 2 }}
      >
        <Paper
          elevation={24}
          sx={{
            width: '100%',
            maxWidth: 580,
            maxHeight: '92vh',
            overflowY: 'auto',
            p: { xs: 3, sm: 4 },
            borderRadius: 3.5,
            position: 'relative'
          }}
        >
          <IconButton 
            onClick={handleCloseModal} 
            sx={{ position: 'absolute', top: 16, right: 16 }}
          >
            <i className="fi fi-rr-cross" style={{ fontSize: 14 }} />
          </IconButton>

          <Typography variant="h5" fontWeight={900} gutterBottom>
            {editingAddressId ? 'Edit Delivery Address' : 'Add New Delivery Address'}
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            Save an accurate jobsite or delivery destination for calculated freight and material drop-off.
          </Typography>
          <Divider sx={{ mb: 3 }} />

          {formError && (
            <Alert severity="error" sx={{ mb: 2.5, borderRadius: 2 }}>
              {formError}
            </Alert>
          )}

          <form onSubmit={handleSubmit} autoComplete="off">
            <Stack spacing={2.5}>
              <TextField 
                fullWidth 
                label="Contact Number" 
                name="contactNumber" 
                value={formData.contactNumber} 
                onChange={(e) => {
                  const onlyNumbers = e.target.value.replace(/[^0-9]/g, '').slice(0, 11);
                  setFormData(prev => ({ ...prev, contactNumber: onlyNumbers }));
                  setFormError('');
                }}
                placeholder="09123456789" 
                required 
                helperText="11-digit Philippine mobile number starting with 09"
                InputProps={{
                  startAdornment: (
                    <Box component="span" sx={{ color: 'text.secondary', mr: 1, fontSize: '0.85rem', fontWeight: 600 }}>
                      +63
                    </Box>
                  )
                }}
              />

              <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: 2 }}>
                <FormControl fullWidth required>
                  <InputLabel id="province-select-label">Province</InputLabel>
                  <Select
                    labelId="province-select-label"
                    label="Province"
                    name="province"
                    value={formData.province || 'Cavite'}
                    onChange={handleInputChange}
                  >
                    {getAvailableProvinces().map((prov) => (
                      <MenuItem key={prov} value={prov}>{prov}</MenuItem>
                    ))}
                  </Select>
                </FormControl>

                <FormControl fullWidth required disabled={!formData.province}>
                  <InputLabel id="city-select-label">City / Municipality</InputLabel>
                  <Select
                    labelId="city-select-label"
                    label="City / Municipality"
                    name="city"
                    value={formData.city}
                    onChange={handleInputChange}
                  >
                    <MenuItem value="" disabled>Select City / Municipality</MenuItem>
                    {getLocationsForProvince(formData.province || 'Cavite').map((loc) => (
                      <MenuItem key={loc.name} value={loc.name}>{loc.name}</MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Box>

              <TextField 
                fullWidth 
                label="Postal / Zip Code" 
                name="zipCode" 
                value={formData.zipCode} 
                InputProps={{ readOnly: true }}
                sx={{ bgcolor: 'action.hover', borderRadius: 1 }}
                helperText={formData.zipCode ? "Auto-computed based on selected City / Municipality" : "Select City above to auto-fill"}
                required 
              />

              <TextField 
                fullWidth 
                multiline
                rows={3}
                label="Complete Street Address & Landmarks" 
                name="address" 
                value={formData.address} 
                onChange={handleInputChange} 
                placeholder="e.g. Lot 12 Blk 4 Emerald Hills Subd., Brgy. San Agustin (Near Water Tower)" 
                required 
              />
            </Stack>

            <Box sx={{ mt: 3.5, pt: 2.5, borderTop: '1px solid', borderColor: 'divider', display: 'flex', justifyContent: 'flex-end', gap: 1.5 }}>
              <Button 
                onClick={handleCloseModal}
                variant="outlined" 
                color="inherit" 
                sx={{ borderRadius: 2.5, textTransform: 'none', fontWeight: 600, px: 2.5 }}
              >
                Cancel
              </Button>
              <Button 
                type="submit" 
                variant="contained" 
                disabled={saving} 
                sx={{ 
                  borderRadius: 2.5, 
                  textTransform: 'none', 
                  fontWeight: 700, 
                  px: 3, 
                  bgcolor: '#4f772d', 
                  '&:hover': { bgcolor: '#3d5c22' } 
                }}
              >
                {saving ? <CircularProgress size={20} color="inherit" /> : (editingAddressId ? 'Save Changes' : 'Add Address')}
              </Button>
            </Box>
          </form>
        </Paper>
      </Modal>

      <Dialog
        open={Boolean(deleteConfirmId)}
        onClose={() => !isDeleting && setDeleteConfirmId(null)}
        PaperProps={{ sx: { borderRadius: 3.5, p: 1 } }}
      >
        <DialogTitle sx={{ fontWeight: 800 }}>
          Delete Saved Address?
        </DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to remove this delivery location? This action cannot be undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions sx={{ p: 2, pt: 0 }}>
          <Button 
            onClick={() => setDeleteConfirmId(null)} 
            disabled={isDeleting}
            sx={{ textTransform: 'none', fontWeight: 600 }}
          >
            Cancel
          </Button>
          <Button 
            onClick={handleDeleteAddress} 
            color="error" 
            variant="contained"
            disabled={isDeleting}
            sx={{ borderRadius: 2, textTransform: 'none', fontWeight: 700 }}
          >
            {isDeleting ? <CircularProgress size={18} color="inherit" /> : 'Delete Address'}
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar
        open={toast.open}
        autoHideDuration={3500}
        onClose={() => setToast(prev => ({ ...prev, open: false }))}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert 
          onClose={() => setToast(prev => ({ ...prev, open: false }))} 
          severity={toast.severity} 
          variant="filled" 
          sx={{ borderRadius: 2.5, fontWeight: 700 }}
        >
          {toast.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default ProfilePage;
