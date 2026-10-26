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
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import CloseIcon from '@mui/icons-material/Close';
import DownloadIcon from '@mui/icons-material/Download';
import { generateExpenseVoucherPDF } from '../../utils/documentGenerator';

const Page = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [openAddModal, setOpenAddModal] = useState(false);
  const [selectedExpense, setSelectedExpense] = useState(null);

  const handleViewExpenseVoucher = (expense) => {
    setSelectedExpense(expense);
  };

  const handleDownloadVoucherPdf = (expense) => {
    generateExpenseVoucherPDF(expense);
  };

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
         Add Expense
        </Button>
      </Box>

      <Paper elevation={0} sx={{ p: 3, borderRadius: 3, border: '1px solid', borderColor: 'primary.light', bgcolor: 'primary.50', mb: 4, display: 'flex', alignItems: 'center', gap: 3 }}>
        
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
                  <TableCell align="right" sx={{ whiteSpace: 'nowrap' }}>
                    <Button
                      size="small"
                      onClick={() => handleViewExpenseVoucher(row)}
                      endIcon={<ChevronRightIcon sx={{ fontSize: 15 }} />}
                      sx={{
                        textTransform: 'none',
                        fontWeight: 600,
                        fontSize: '0.78rem',
                        color: 'primary.main',
                        bgcolor: 'rgba(34, 197, 94, 0.08)',
                        border: '1px solid rgba(34, 197, 94, 0.25)',
                        borderRadius: 2,
                        px: 1.5,
                        py: 0.6,
                        transition: 'all 0.18s ease',
                        '&:hover': {
                          bgcolor: 'rgba(34, 197, 94, 0.16)',
                          borderColor: 'primary.main',
                          transform: 'translateX(2px)'
                        }
                      }}
                    >
                      View Voucher
                    </Button>
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

      {/* View Expense Voucher Modal */}
      <Dialog 
        open={Boolean(selectedExpense)} 
        onClose={() => setSelectedExpense(null)} 
        maxWidth="sm" 
        fullWidth
        PaperProps={{
          sx: { borderRadius: 3.5, overflow: 'hidden' }
        }}
      >
        {selectedExpense && (
          <>
            <DialogTitle sx={{ 
              fontWeight: 800, 
              display: 'flex', 
              justifyContent: 'space-between', 
              alignItems: 'center',
              borderBottom: '1px solid',
              borderColor: 'divider',
              pb: 2
            }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                <Typography variant="h6" fontWeight={800} color="text.primary">
                  Expense Voucher {selectedExpense.reference}
                </Typography>
                <Chip 
                  label={selectedExpense.status || 'Approved'} 
                  size="small" 
                  sx={{ 
                    bgcolor: 'success.50', 
                    color: 'success.dark', 
                    fontWeight: 700, 
                    fontSize: '0.7rem' 
                  }} 
                />
              </Box>
              <IconButton size="small" onClick={() => setSelectedExpense(null)} sx={{ color: 'text.secondary' }}>
                <CloseIcon sx={{ fontSize: 20 }} />
              </IconButton>
            </DialogTitle>

            <DialogContent dividers sx={{ p: 3 }}>
              <Stack spacing={2.5}>
                {/* 2x2 Metadata Grid */}
                <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 1.5 }}>
                  <Paper elevation={0} sx={{ p: 1.5, borderRadius: 2, bgcolor: 'grey.50', border: '1px solid', borderColor: 'divider' }}>
                    <Typography variant="caption" color="text.secondary" fontWeight={700} sx={{ textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                      Category
                    </Typography>
                    <Typography variant="body2" fontWeight={700} color="text.primary" sx={{ mt: 0.5 }}>
                      {selectedExpense.category}
                    </Typography>
                  </Paper>

                  <Paper elevation={0} sx={{ p: 1.5, borderRadius: 2, bgcolor: 'grey.50', border: '1px solid', borderColor: 'divider' }}>
                    <Typography variant="caption" color="text.secondary" fontWeight={700} sx={{ textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                      Date Logged
                    </Typography>
                    <Typography variant="body2" fontWeight={700} color="text.primary" sx={{ mt: 0.5 }}>
                      {new Date(selectedExpense.date).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
                    </Typography>
                  </Paper>

                  <Paper elevation={0} sx={{ p: 1.5, borderRadius: 2, bgcolor: 'grey.50', border: '1px solid', borderColor: 'divider' }}>
                    <Typography variant="caption" color="text.secondary" fontWeight={700} sx={{ textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                      Amount Disbursed
                    </Typography>
                    <Typography variant="h6" fontWeight={800} color="success.main" sx={{ mt: 0.25 }}>
                      ₱{Number(selectedExpense.amount).toLocaleString('en-PH', { minimumFractionDigits: 2 })}
                    </Typography>
                  </Paper>

                  <Paper elevation={0} sx={{ p: 1.5, borderRadius: 2, bgcolor: 'grey.50', border: '1px solid', borderColor: 'divider' }}>
                    <Typography variant="caption" color="text.secondary" fontWeight={700} sx={{ textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                      Fiscal Clearance
                    </Typography>
                    <Typography variant="body2" fontWeight={700} color="text.primary" sx={{ mt: 0.5 }}>
                      Certified & Audited
                    </Typography>
                  </Paper>
                </Box>

                {/* Particulars / Description */}
                <Box>
                  <Typography variant="caption" color="text.secondary" fontWeight={700} sx={{ textTransform: 'uppercase', letterSpacing: '0.04em', display: 'block', mb: 1 }}>
                    Description & Particulars
                  </Typography>
                  <Paper elevation={0} sx={{ p: 2, borderRadius: 2, bgcolor: 'grey.50', border: '1px solid', borderColor: 'divider' }}>
                    <Typography variant="body2" color="text.primary" sx={{ lineHeight: 1.6 }}>
                      {selectedExpense.description}
                    </Typography>
                  </Paper>
                </Box>

                {/* Issuer Authority Note */}
                <Typography variant="caption" color="text.secondary" sx={{ display: 'block', fontStyle: 'italic' }}>
                  Issuer: Mega Pacific Metal And Steel Roofing System • Finance & Treasury Division, Imus Plant
                </Typography>
              </Stack>
            </DialogContent>

            <DialogActions sx={{ p: 2.5, gap: 1.5 }}>
              <Button onClick={() => setSelectedExpense(null)} color="inherit" sx={{ fontWeight: 600 }}>
                Close
              </Button>
              <Button
                variant="contained"
                color="primary"
                startIcon={<DownloadIcon sx={{ fontSize: 18 }} />}
                onClick={() => handleDownloadVoucherPdf(selectedExpense)}
                sx={{
                  fontWeight: 700,
                  borderRadius: 2,
                  px: 2.5,
                  textTransform: 'none'
                }}
              >
                Download Official Voucher (PDF)
              </Button>
            </DialogActions>
          </>
        )}
      </Dialog>
    </Box>
  );
};

export default Page;
