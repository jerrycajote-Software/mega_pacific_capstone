import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  IconButton,
  TextField,
  InputAdornment,
  Stack,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  MenuItem
} from '@mui/material';
import axios from 'axios';
import { toast } from 'react-hot-toast';

const Page = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [openAddModal, setOpenAddModal] = useState(false);

  const [formData, setFormData] = useState({
    category: 'Logistics',
    description: '',
    amount: ''
  });

  const API_URL = import.meta.env.VITE_API_URL || '';

  const fetchExpenses = async () => {
    try {
      const token = localStorage.getItem('appToken');
      const res = await axios.get(`${API_URL}/api/finance/expenses`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.data.success) {
        setExpenses(res.data.data);
      }
    } catch (error) {
      console.error('Failed to fetch expenses', error);
      toast.error('Failed to fetch expenses');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchExpenses();
    const interval = setInterval(fetchExpenses, 10000);
    const handleFocus = () => fetchExpenses();
    window.addEventListener('focus', handleFocus);
    return () => {
      clearInterval(interval);
      window.removeEventListener('focus', handleFocus);
    };
  }, []);

  const handleAddExpense = async () => {
    if (!formData.description || !formData.amount) {
      toast.error('Please fill in all required fields');
      return;
    }
    try {
      const token = localStorage.getItem('appToken');
      const res = await axios.post(`${API_URL}/api/finance/expenses`, formData, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.data.success) {
        toast.success('Expense added successfully');
        setOpenAddModal(false);
        setFormData({ category: 'Logistics', description: '', amount: '' });
        fetchExpenses();
      }
    } catch (error) {
      console.error('Failed to add expense', error);
      toast.error('Failed to add expense');
    }
  };

  const totalExpenses = expenses.reduce((sum, item) => sum + item.amount, 0);

  const filteredExpenses = expenses.filter(exp => 
    exp.description.toLowerCase().includes(searchTerm.toLowerCase()) || 
    exp.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
    exp.reference.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ p: { xs: 3, md: 5 }, animation: 'fadeIn 0.5s ease-in-out' }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 4 }}>
        <Box>
          <Typography variant="h4" fontWeight="bold" sx={{ mb: 1, color: 'text.primary' }}>
            Company Expenses
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Track and manage operational costs.
          </Typography>
        </Box>
        <Button 
          variant="contained" 
          color="primary" 
          sx={{ display: 'flex', gap: 1, borderRadius: 2, px: 3, py: 1.5 }}
          onClick={() => setOpenAddModal(true)}
        >
          <i className="fi fi-rr-plus"></i> Add Expense
        </Button>
      </Box>

      <Paper elevation={0} sx={{ p: 3, borderRadius: 3, border: '1px solid', borderColor: 'primary.light', bgcolor: 'primary.50', mb: 4, display: 'flex', alignItems: 'center', gap: 3 }}>
        <Box sx={{ width: 48, height: 48, borderRadius: 2, bgcolor: 'primary.main', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <i className="fi fi-rr-receipt" style={{ fontSize: '24px' }}></i>
        </Box>
        <Box>
          <Typography variant="body2" color="primary.main" fontWeight={700}>Total Expenses</Typography>
          <Typography variant="h4" fontWeight="900" color="primary.dark">₱{totalExpenses.toLocaleString()}</Typography>
        </Box>
      </Paper>

      <Paper elevation={0} sx={{ borderRadius: 4, border: '1px solid', borderColor: 'divider', overflow: 'hidden' }}>
        <Box sx={{ p: 2.5, borderBottom: '1px solid', borderColor: 'divider', display: 'flex', gap: 2, alignItems: 'center' }}>
          <TextField
            size="small"
            placeholder="Search expenses..."
            variant="outlined"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <i className="fi fi-rr-search" style={{ color: '#94a3b8' }}></i>
                </InputAdornment>
              ),
              sx: { borderRadius: 2, minWidth: 300, bgcolor: 'grey.50' }
            }}
          />
        </Box>

        <TableContainer>
          <Table>
            <TableHead sx={{ bgcolor: 'grey.50' }}>
              <TableRow>
                <TableCell sx={{ fontWeight: 600 }}>ID</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Date</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Category</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Description</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Amount</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Status</TableCell>
                <TableCell sx={{ fontWeight: 600 }} align="right">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredExpenses.map((row, i) => (
                <TableRow key={row.id} hover>
                  <TableCell sx={{ fontWeight: 500, color: 'text.secondary' }}>{row.reference}</TableCell>
                  <TableCell>{row.date.split('T')[0]}</TableCell>
                  <TableCell>
                    <Chip label={row.category} size="small" variant="outlined" />
                  </TableCell>
                  <TableCell>{row.description}</TableCell>
                  <TableCell sx={{ fontWeight: 'bold' }}>₱{row.amount.toLocaleString()}</TableCell>
                  <TableCell>
                    <Chip 
                      label={row.status} 
                      size="small"
                      sx={{ 
                        fontWeight: 'bold', fontSize: '0.7rem',
                        bgcolor: row.status === 'Approved' ? 'success.50' : 'warning.50',
                        color: row.status === 'Approved' ? 'success.dark' : 'warning.dark',
                      }} 
                    />
                  </TableCell>
                  <TableCell align="right">
                    <Stack direction="row" spacing={1} justifyContent="flex-end">
                      <IconButton size="small" title="View Receipt">
                        <i className="fi fi-rr-document" style={{ fontSize: '16px' }}></i>
                      </IconButton>
                    </Stack>
                  </TableCell>
                </TableRow>
              ))}
              {filteredExpenses.length === 0 && (
                <TableRow>
                  <TableCell colSpan={7} align="center" sx={{ py: 3, color: 'text.secondary' }}>No expenses found.</TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>

      <Dialog open={openAddModal} onClose={() => setOpenAddModal(false)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ fontWeight: 'bold' }}>Log New Expense</DialogTitle>
        <DialogContent dividers>
          <Stack spacing={3}>
            <TextField 
              select 
              label="Category" 
              fullWidth 
              value={formData.category}
              onChange={(e) => setFormData({...formData, category: e.target.value})}
            >
              <MenuItem value="Logistics">Logistics (Fuel, Tolls, etc.)</MenuItem>
              <MenuItem value="Office">Office Supplies</MenuItem>
              <MenuItem value="Maintenance">Maintenance & Repairs</MenuItem>
              <MenuItem value="Payroll">Payroll</MenuItem>
              <MenuItem value="Other">Other</MenuItem>
            </TextField>
            <TextField 
              label="Description" 
              fullWidth 
              value={formData.description}
              onChange={(e) => setFormData({...formData, description: e.target.value})}
              placeholder="ex. Fuel for delivery truck 1"
            />
            <TextField 
              label="Amount (₱)" 
              type="number" 
              fullWidth 
              value={formData.amount}
              onChange={(e) => setFormData({...formData, amount: e.target.value})}
              placeholder="0.00"
            />
          </Stack>
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={() => setOpenAddModal(false)} color="inherit">Cancel</Button>
          <Button onClick={handleAddExpense} variant="contained" color="primary">Save Expense</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Page;
