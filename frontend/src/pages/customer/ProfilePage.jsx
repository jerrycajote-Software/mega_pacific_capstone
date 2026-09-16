import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';
import {
  Box,
  Container,
  Grid,
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
  MenuItem,
  Divider,
  FormControl,
  InputLabel,
  Select
} from '@mui/material';
import {
  getAvailableProvinces,
  getLocationsForProvince,
  getZipCodeForLocation
} from '../../utils/locationService';

const ProfilePage = () => {
  const { user, token } = useAuth();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [editingAddressId, setEditingAddressId] = useState(null);
  const [addresses, setAddresses] = useState([]);
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const [formData, setFormData] = useState({
    contactNumber: '',
    address: '',
    city: '',
    province: 'Cavite',
    zipCode: '',
    isDefault: false
  });

  const fetchProfile = async () => {
    try {
      const API_URL = import.meta.env.VITE_API_URL || '';
      const res = await axios.get(`${API_URL}/api/auth/profile`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.data.data) {
        setAddresses(res.data.data.addresses || []);
      }
    } catch (err) {
      console.error("Failed to fetch profile", err);
      setErrorMsg("Failed to load your profile data.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token) fetchProfile();
  }, [token]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    
    if (name === 'city') {
      const zipCode = getZipCodeForLocation(formData.province || 'Cavite', value);
      setFormData(prev => ({ ...prev, city: value, zipCode }));
      setErrorMsg('');
      setSuccessMsg('');
      return;
    }
    
    setFormData(prev => ({ ...prev, [name]: value }));
    setErrorMsg('');
    setSuccessMsg('');
  };

  const validateForm = () => {
    if (!formData.contactNumber || !formData.address || !formData.city || !formData.province || !formData.zipCode) {
      setErrorMsg("All fields are required.");
      return false;
    }
    const phoneRegex = /^09[0-9]{9}$/;
    if (!phoneRegex.test(formData.contactNumber)) {
      setErrorMsg("Contact number must be an 11-digit number starting with 09.");
      return false;
    }
    const zipRegex = /^[0-9]{4}$/;
    if (!zipRegex.test(formData.zipCode)) {
      setErrorMsg("Zip Code must be a 4-digit number.");
      return false;
    }
    return true;
  };

  const handleAddNew = () => {
    setIsEditMode(true);
    setEditingAddressId(null);
    setFormData({
      contactNumber: '',
      address: '',
      city: '',
      province: 'Cavite',
      zipCode: '',
      isDefault: addresses.length === 0
    });
    setErrorMsg('');
    setSuccessMsg('');
  };

  const handleEdit = (addr) => {
    setIsEditMode(true);
    setEditingAddressId(addr.id);
    setFormData({
      contactNumber: addr.contactNumber || '',
      address: addr.address || '',
      city: addr.city || '',
      province: addr.province || '',
      zipCode: addr.zipCode || '',
      isDefault: addr.isDefault
    });
    setErrorMsg('');
    setSuccessMsg('');
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this address?')) return;
    try {
      const API_URL = import.meta.env.VITE_API_URL || '';
      await axios.delete(`${API_URL}/api/auth/addresses/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchProfile();
      setSuccessMsg("Address deleted successfully");
    } catch (err) {
      setErrorMsg("Failed to delete address");
    }
  };

  const handleSetDefault = async (id) => {
    try {
      const API_URL = import.meta.env.VITE_API_URL || '';
      await axios.put(`${API_URL}/api/auth/addresses/${id}/default`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchProfile();
      setSuccessMsg("Default address updated");
    } catch (err) {
      setErrorMsg("Failed to set default address");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;
    setSaving(true);
    setSuccessMsg('');
    try {
      const API_URL = import.meta.env.VITE_API_URL || '';
      if (editingAddressId) {
        await axios.put(`${API_URL}/api/auth/addresses/${editingAddressId}`, formData, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setSuccessMsg("Address updated successfully!");
      } else {
        await axios.post(`${API_URL}/api/auth/addresses`, formData, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setSuccessMsg("Address added successfully!");
      }
      setIsEditMode(false);
      fetchProfile();
    } catch (err) {
      console.error("Failed to update profile", err);
      setErrorMsg(err.response?.data?.error || "Failed to save address.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', py: 15 }}>
        <CircularProgress />
        <Typography color="text.secondary" sx={{ mt: 2 }}>Loading profile...</Typography>
      </Box>
    );
  }

  const defaultAddress = addresses.find(a => a.isDefault) || addresses[0];
  const otherAddresses = addresses.filter(a => a.id !== defaultAddress?.id);

  return (
    <Box sx={{ animation: 'fadeIn 0.5s ease-in-out', pb: 10, maxWidth: 1000, mx: 'auto' }}>
      <Typography variant="h3" fontWeight="bold" sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 4, color: 'text.primary' }}>
        <i className="fi fi-rr-user" style={{ fontSize: '28px', color: '#1e3a8a' }}></i> My Profile
      </Typography>

      <Grid container spacing={4}>
        <Grid item xs={12} md={4}>
          <Paper elevation={0} sx={{ p: 4, borderRadius: 4, border: '1px solid', borderColor: 'divider', bgcolor: 'background.paper', textAlign: 'center', position: 'sticky', top: 90 }}>
            <Avatar sx={{ width: 96, height: 96, mx: 'auto', mb: 2, bgcolor: 'primary.light', color: 'primary.dark', fontSize: '2.5rem', fontWeight: 'bold' }}>
              {user?.name?.charAt(0)}
            </Avatar>
            <Typography variant="h5" fontWeight="bold" gutterBottom>{user?.name}</Typography>
            <Typography color="text.secondary" gutterBottom>{user?.email}</Typography>
            <Chip 
              icon={<i className="fi fi-sr-check-circle" style={{ fontSize: '13px', marginLeft: '6px' }}></i>} 
              label="Active Customer" 
              color="success" 
              variant="outlined" 
              size="small" 
              sx={{ mt: 2, fontWeight: 'bold' }} 
            />
          </Paper>
        </Grid>=

        <Grid item xs={12} md={8}>
          <Paper elevation={0} sx={{ p: 4, borderRadius: 4, border: '1px solid', borderColor: 'divider', bgcolor: 'background.paper' }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3, pb: 2, borderBottom: '1px solid', borderColor: 'divider' }}>
              <Typography variant="h6" fontWeight="bold" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <i className="fi fi-rr-marker" style={{ fontSize: '18px', color: '#1e3a8a' }}></i> 
                {isEditMode ? (editingAddressId ? 'Edit Address' : 'Add New Address') : 'Your Address'}
              </Typography>
              {!isEditMode && (
                <Button
                  onClick={handleAddNew}
                  sx={{ borderRadius: 20, textTransform: 'none', fontWeight: 'bold' }}
                  variant="contained"
                  color="primary"
                >
                  + Add New Address
                </Button>
              )}
            </Box>

            {errorMsg && <Alert severity="error" sx={{ mb: 3 }}>{errorMsg}</Alert>}
            {successMsg && <Alert severity="success" sx={{ mb: 3 }}>{successMsg}</Alert>}

            {isEditMode ? (
              <Box>
                <form onSubmit={handleSubmit} autoComplete="off">
                  <Grid container spacing={3}>
                    <Grid item xs={12}>
                      <TextField 
                        fullWidth 
                        label="Contact Number" 
                        name="contactNumber" 
                        autoComplete="off" 
                        value={formData.contactNumber} 
                        onChange={(e) => {
                          const onlyNumbers = e.target.value.replace(/[^0-9]/g, '').slice(0, 11);
                          setFormData(prev => ({ ...prev, contactNumber: onlyNumbers }));
                          setErrorMsg('');
                          setSuccessMsg('');
                        }}
                        placeholder="09123456789" 
                        required 
                        inputProps={{ maxLength: 11, pattern: '^09[0-9]{9}$', title: 'Must be an 11-digit number starting with 09' }}
                      />
                    </Grid>
                    <Grid item xs={12}>
                      <TextField 
                        fullWidth 
                        label="Complete Address" 
                        name="address" 
                        value={formData.address} 
                        onChange={handleInputChange} 
                        placeholder="Street Name, Building, House No." 
                        required 
                        autoComplete="off"
                      />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <FormControl fullWidth required>
                        <InputLabel>City / Municipality</InputLabel>
                        <Select
                          native
                          label="City / Municipality"
                          name="city"
                          value={formData.city}
                          onChange={handleInputChange}
                        >
                          <option value="" disabled>Select City</option>
                          {getLocationsForProvince(formData.province || 'Cavite').map((loc) => (
                            <option key={loc.name} value={loc.name}>{loc.name}</option>
                          ))}
                        </Select>
                      </FormControl>
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <FormControl fullWidth required disabled={!!editingAddressId}>
                        <InputLabel>Province</InputLabel>
                        <Select
                          native
                          label="Province"
                          name="province"
                          value={formData.province || 'Cavite'}
                          onChange={handleInputChange}
                        >
                          {getAvailableProvinces().map((prov) => (
                            <option key={prov} value={prov}>{prov}</option>
                          ))}
                        </Select>
                      </FormControl>
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <TextField 
                        fullWidth 
                        label="Zip Code" 
                        name="zipCode" 
                        value={formData.zipCode} 
                        InputProps={{
                          readOnly: true,
                        }}
                        sx={{ bgcolor: 'rgba(0,0,0,0.02)' }}
                        required 
                      />
                    </Grid>
                  </Grid>

                  <Box sx={{ mt: 4, pt: 3, borderTop: '1px solid', borderColor: 'divider', display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
                    <Button 
                      onClick={() => setIsEditMode(false)}
                      variant="text" 
                      color="inherit" 
                      sx={{ borderRadius: 2, px: 4, py: 1.5, fontWeight: 'bold' }}
                    >
                      Cancel
                    </Button>
                    <Button 
                      type="submit" 
                      variant="contained" 
                      color="primary" 
                      disabled={saving} 
                      sx={{ borderRadius: 2, px: 4, py: 1.5, fontWeight: 'bold' }}
                    >
                      {saving ? <CircularProgress size={24} color="inherit" /> : 'Save Profile Changes'}
                    </Button>
                  </Box>
                </form>
              </Box>
            ) : (
              <Box>
                {addresses.length === 0 ? (
                  <Box sx={{ textAlign: 'center', py: 5 }}>
                    <i className="fi fi-rr-marker" style={{ fontSize: '48px', color: '#cbd5e1' }}></i>
                    <Typography color="text.secondary" sx={{ mt: 2 }}>No saved addresses yet.</Typography>
                  </Box>
                ) : (
                  <Grid container spacing={3}>
                    {defaultAddress && (
                      <Grid item xs={12} sm={6}>
                        <Card variant="outlined" sx={{ 
                          borderColor: 'primary.main', 
                          height: '100%', 
                          display: 'flex', 
                          flexDirection: 'column',
                          boxShadow: '0 4px 12px rgba(79,119,45,0.08)'
                        }}>
                          <Box sx={{ px: 2, pt: 2, pb: 0 }}>
                            <Chip 
                              icon={<i className="fi fi-sr-star" style={{ fontSize: '12px', marginLeft: '4px' }}></i>}
                              label="Current Address" 
                              color="primary" 
                              size="small" 
                              sx={{ fontWeight: 'bold' }} 
                            />
                          </Box>
                          <CardContent sx={{ flexGrow: 1 }}>
                            <Typography variant="subtitle1" fontWeight="bold" gutterBottom>{defaultAddress.contactNumber}</Typography>
                            <Typography variant="body2" color="text.secondary">{defaultAddress.address}</Typography>
                            <Typography variant="body2" color="text.secondary">{defaultAddress.city}, {defaultAddress.province} {defaultAddress.zipCode}</Typography>
                          </CardContent>
                          <Divider />
                          <CardActions sx={{ px: 2, py: 1.5, bgcolor: 'rgba(0,0,0,0.02)' }}>
                            <Button size="small" variant="outlined" onClick={() => handleEdit(defaultAddress)} sx={{ borderRadius: 2, fontWeight: 'bold' }}>Edit</Button>
                          </CardActions>
                        </Card>
                      </Grid>
                    )}
                    {otherAddresses.map((addr) => (
                      <Grid item xs={12} sm={6} key={addr.id}>
                        <Card variant="outlined" sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                          <CardContent sx={{ flexGrow: 1, pt: 3 }}>
                            <Typography variant="subtitle1" fontWeight="bold" gutterBottom>{addr.contactNumber}</Typography>
                            <Typography variant="body2" color="text.secondary">{addr.address}</Typography>
                            <Typography variant="body2" color="text.secondary">{addr.city}, {addr.province} {addr.zipCode}</Typography>
                          </CardContent>
                          <Divider />
                          <CardActions sx={{ px: 2, py: 1.5, bgcolor: 'rgba(0,0,0,0.02)', flexWrap: 'wrap', gap: 1 }}>
                            <Button size="small" variant="outlined" onClick={() => handleEdit(addr)} sx={{ borderRadius: 2, fontWeight: 'bold' }}>Edit</Button>
                            <Button size="small" variant="text" color="error" onClick={() => handleDelete(addr.id)} sx={{ fontWeight: 'bold' }}>Delete</Button>
                            <Box sx={{ flexGrow: 1 }} />
                            <Button size="small" variant="text" onClick={() => handleSetDefault(addr.id)} sx={{ fontWeight: 'bold' }}>Set Default</Button>
                          </CardActions>
                        </Card>
                      </Grid>
                    ))}
                  </Grid>
                )}
              </Box>
            )}
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default ProfilePage;
