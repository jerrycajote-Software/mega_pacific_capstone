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
  Chip
} from '@mui/material';


const ProfilePage = () => {
  const { user, token } = useAuth();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const [formData, setFormData] = useState({
    contactNumber: '',
    address: '',
    city: '',
    province: '',
    zipCode: ''
  });

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const API_URL = import.meta.env.VITE_API_URL || '';
        const res = await axios.get(`${API_URL}/api/auth/profile`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (res.data.data) {
          const profile = res.data.data;
          setFormData({
            contactNumber: profile.contactNumber || '',
            address: profile.address || '',
            city: profile.city || '',
            province: profile.province || '',
            zipCode: profile.zipCode || ''
          });
        }
      } catch (err) {
        console.error("Failed to fetch profile", err);
        setErrorMsg("Failed to load your profile data.");
      } finally {
        setLoading(false);
      }
    };

    if (token) fetchProfile();
  }, [token]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;
    setSaving(true);
    setSuccessMsg('');
    try {
      const API_URL = import.meta.env.VITE_API_URL || '';
      await axios.put(`${API_URL}/api/auth/profile`, formData, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setSuccessMsg("Profile updated successfully!");
    } catch (err) {
      console.error("Failed to update profile", err);
      setErrorMsg(err.response?.data?.error || "Failed to update profile.");
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
        </Grid>

        <Grid item xs={12} md={8}>
          <Paper elevation={0} sx={{ p: 4, borderRadius: 4, border: '1px solid', borderColor: 'divider', bgcolor: 'background.paper' }}>
            <Typography variant="h6" fontWeight="bold" sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 3, pb: 2, borderBottom: '1px solid', borderColor: 'divider' }}>
              <i className="fi fi-rr-marker" style={{ fontSize: '18px', color: '#1e3a8a' }}></i> Default Shipping Address
            </Typography>

            {errorMsg && <Alert severity="error" sx={{ mb: 3 }}>{errorMsg}</Alert>}
            {successMsg && <Alert severity="success" sx={{ mb: 3 }}>{successMsg}</Alert>}

            <form onSubmit={handleSubmit}>
              <Grid container spacing={3}>
                <Grid item xs={12}>
                  <TextField 
                    fullWidth 
                    label="Contact Number" 
                    name="contactNumber" 
                    value={formData.contactNumber} 
                    onChange={handleInputChange} 
                    placeholder="09123456789" 
                    required 
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
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField 
                    fullWidth 
                    label="City / Municipality" 
                    name="city" 
                    value={formData.city} 
                    onChange={handleInputChange} 
                    placeholder="e.g. Quezon City" 
                    required 
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField 
                    fullWidth 
                    label="Province" 
                    name="province" 
                    value={formData.province} 
                    onChange={handleInputChange} 
                    placeholder="e.g. Metro Manila" 
                    required 
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField 
                    fullWidth 
                    label="Zip Code" 
                    name="zipCode" 
                    value={formData.zipCode} 
                    onChange={handleInputChange} 
                    placeholder="e.g. 1000" 
                    required 
                  />
                </Grid>
              </Grid>

              <Box sx={{ mt: 4, pt: 3, borderTop: '1px solid', borderColor: 'divider', display: 'flex', justifyContent: 'flex-end' }}>
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
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default ProfilePage;
