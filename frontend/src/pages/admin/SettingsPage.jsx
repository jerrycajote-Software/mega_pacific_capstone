import React, { useState, useEffect } from 'react';
import { Box, Typography, Paper, TextField, Button, CircularProgress, Alert } from '@mui/material';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';

const SettingsPage = () => {
  const [maxDevices, setMaxDevices] = useState('3');
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  const { token } = useAuth();
  
  const API_URL = import.meta.env.VITE_API_URL || '';

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${API_URL}/api/admin/settings`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const settings = res.data.data;
      const deviceSetting = settings.find(s => s.key === 'max_sales_devices');
      if (deviceSetting) {
        setMaxDevices(deviceSetting.value);
      }
    } catch (err) {
      setMessage({ type: 'error', text: 'Failed to load settings.' });
    }
    setLoading(false);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    setMessage({ type: '', text: '' });
    
    try {
      await axios.put(`${API_URL}/api/admin/settings/max_sales_devices`, {
        value: maxDevices.toString(),
        description: 'Maximum simultaneous devices an sales can log into'
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setMessage({ type: 'success', text: 'Settings updated successfully.' });
    } catch (err) {
      setMessage({ type: 'error', text: 'Failed to update settings.' });
    }
    setSaving(false);
  };

  return (
    <Box sx={{ p: 4 }}>
      <Typography variant="h4" sx={{ mb: 4, fontWeight: 700, color: 'var(--text-primary)' }}>
        System Settings
      </Typography>

      <Paper sx={{ p: 4, maxWidth: 600, bgcolor: 'var(--bg-surface)', borderRadius: 3, border: '1px solid var(--border-light)' }}>
        <Typography variant="h6" sx={{ mb: 3, fontWeight: 600, color: 'var(--text-primary)' }}>
          Security & Access
        </Typography>

        {message.text && (
          <Alert severity={message.type} sx={{ mb: 3 }}>{message.text}</Alert>
        )}

        {loading ? (
          <CircularProgress />
        ) : (
          <form onSubmit={handleSave}>
            <Box sx={{ mb: 3 }}>
              <TextField
                fullWidth
                label="Maximum Active Devices per Sales"
                type="number"
                value={maxDevices}
                onChange={(e) => setMaxDevices(e.target.value)}
                InputProps={{ inputProps: { min: 1, max: 20 } }}
                helperText="Limits how many devices an sales can log into simultaneously. Logging into a new device beyond this limit requires an OTP verification."
                required
              />
            </Box>

            <Button 
              type="submit" 
              variant="contained" 
              disabled={saving}
              sx={{ py: 1.5, px: 4, borderRadius: 2, fontWeight: 600 }}
            >
              {saving ? <CircularProgress size={24} color="inherit" /> : 'Save Changes'}
            </Button>
          </form>
        )}
      </Paper>
    </Box>
  );
};

export default SettingsPage;
