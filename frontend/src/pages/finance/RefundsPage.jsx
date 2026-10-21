import React, { useState, useEffect } from 'react';
import axios from 'axios';
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
  Alert,
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import RefreshIcon from '@mui/icons-material/Refresh';
import CurrencyExchangeIcon from '@mui/icons-material/CurrencyExchange';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import HourglassEmptyIcon from '@mui/icons-material/HourglassEmpty';
import VisibilityIcon from '@mui/icons-material/Visibility';
import CloseIcon from '@mui/icons-material/Close';
import AutoFixHighIcon from '@mui/icons-material/AutoFixHigh';
import ReceiptLongIcon from '@mui/icons-material/ReceiptLong';
import AccountBalanceWalletIcon from '@mui/icons-material/AccountBalanceWallet';
import CreditCardIcon from '@mui/icons-material/CreditCard';
import PhoneAndroidIcon from '@mui/icons-material/PhoneAndroid';
import AccountBalanceIcon from '@mui/icons-material/AccountBalance';
import { toast } from 'react-hot-toast';

const formatCurrency = (amt) =>
  `₱${Number(amt || 0).toLocaleString('en-PH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

const getPaymentChannelIcon = (method) => {
  const m = (method || '').toLowerCase();
  if (m.includes('gcash')) return <PhoneAndroidIcon sx={{ fontSize: 16, color: '#007dfa' }} />;
  if (m.includes('card') || m.includes('visa') || m.includes('mastercard'))
    return <CreditCardIcon sx={{ fontSize: 16, color: '#8b5cf6' }} />;
  return <AccountBalanceIcon sx={{ fontSize: 16, color: '#10b981' }} />;
};

const RefundsPage = () => {
  const [refunds, setRefunds] = useState([]);
  const [stats, setStats] = useState({
    pendingCount: 0,
    pendingAmount: 0,
    completedCount: 0,
    completedAmount: 0,
    todayCount: 0,
    todayAmount: 0,
    totalCount: 0
  });
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');

  const [selectedRefund, setSelectedRefund] = useState(null);
  const [processModalOpen, setProcessModalOpen] = useState(false);
  const [receiptModalOpen, setReceiptModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const [processForm, setProcessForm] = useState({
    amount: '',
    returnMethod: '',
    transactionReference: '',
    notes: ''
  });

  const API_URL = import.meta.env.VITE_API_URL || '';

  const fetchData = async () => {
    try {
      const token = localStorage.getItem('appToken');
      const headers = { Authorization: `Bearer ${token}` };

      const [refundsRes, statsRes] = await Promise.all([
        axios.get(`${API_URL}/api/finance/refunds`, { headers }),
        axios.get(`${API_URL}/api/finance/refunds/stats`, { headers })
      ]);

      if (refundsRes.data.success) {
        setRefunds(refundsRes.data.data);
      }
      if (statsRes.data.success) {
        setStats(statsRes.data.data);
      }
    } catch (err) {
      console.error('Failed to fetch refunds data', err);
      toast.error('Failed to load refund records');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 25000);
    return () => clearInterval(interval);
  }, []);

  const handleOpenProcessModal = (refund) => {
    setSelectedRefund(refund);
    setProcessForm({
      amount: refund.amount,
      returnMethod: refund.paymentMethod,
      transactionReference: `REF-${Date.now().toString(36).toUpperCase()}`,
      notes: `Returned via ${refund.paymentMethod} by Finance team`
    });
    setProcessModalOpen(true);
  };

  const handleOpenReceiptModal = (refund) => {
    setSelectedRefund(refund);
    setReceiptModalOpen(true);
  };

  const handleGenerateRef = () => {
    const isGCash = (processForm.returnMethod || '').toLowerCase().includes('gcash');
    const prefix = isGCash ? 'GCASH-TXN' : 'BANK-REF';
    const rand = Math.floor(10000000 + Math.random() * 90000000);
    setProcessForm(prev => ({
      ...prev,
      transactionReference: `${prefix}-${rand}`
    }));
  };

  const handleProcessRefund = async (e) => {
    e.preventDefault();
    if (!selectedRefund) return;

    if (!processForm.transactionReference.trim()) {
      toast.error('Please enter or generate a Transaction Reference Number');
      return;
    }

    setSubmitting(true);
    try {
      const token = localStorage.getItem('appToken');
      const res = await axios.patch(
        `${API_URL}/api/finance/refunds/${selectedRefund.rawId}/process`,
        {
          transactionReference: processForm.transactionReference.trim(),
          returnMethod: processForm.returnMethod,
          amount: parseFloat(processForm.amount),
          notes: processForm.notes
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (res.data.success) {
        toast.success(`Refund of ${formatCurrency(processForm.amount)} processed! Customer has been notified.`);
        setProcessModalOpen(false);
        fetchData();
      }
    } catch (err) {
      console.error('Failed to process refund', err);
      toast.error(err.response?.data?.error || 'Failed to process refund');
    } finally {
      setSubmitting(false);
    }
  };

  const filteredRefunds = refunds.filter(r => {
    const matchesStatus =
      statusFilter === 'all' ||
      (statusFilter === 'pending' && r.status === 'pending') ||
      (statusFilter === 'completed' && r.status === 'completed');

    if (!matchesStatus) return false;

    if (!searchTerm.trim()) return true;
    const q = searchTerm.toLowerCase();
    return (
      r.id.toLowerCase().includes(q) ||
      r.orderId.toLowerCase().includes(q) ||
      r.customerName.toLowerCase().includes(q) ||
      r.customerEmail.toLowerCase().includes(q) ||
      r.paymentMethod.toLowerCase().includes(q) ||
      (r.transactionReference && r.transactionReference.toLowerCase().includes(q))
    );
  });

  return (
    <Box sx={{ p: { xs: 2, md: 4 }, color: 'var(--text-primary)' }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3.5, flexWrap: 'wrap', gap: 2 }}>
        <div>
          <Typography variant="h4" sx={{ fontWeight: 900, letterSpacing: '-0.02em', color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: 1.5 }}>
            <CurrencyExchangeIcon sx={{ fontSize: 32, color: '#f59e0b' }} />
            Refund Management
          </Typography>
          <Typography variant="body2" sx={{ color: 'var(--text-muted)', mt: 0.5 }}>
            Manage customer refunds for sales-rejected orders, reverse payments via original channels, and send automated notifications.
          </Typography>
        </div>

        <Button
          onClick={fetchData}
          variant="outlined"
          startIcon={<RefreshIcon />}
          sx={{
            borderRadius: 2.5,
            borderColor: 'var(--border)',
            color: 'var(--text-primary)',
            textTransform: 'none',
            fontWeight: 700,
            bgcolor: 'var(--bg-secondary)',
            '&:hover': { bgcolor: 'var(--bg-tertiary)', borderColor: 'var(--border-light)' }
          }}
        >
          Refresh
        </Button>
      </Box>

      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: 'repeat(3, 1fr)' }, gap: 2.5, mb: 4 }}>
        <Paper
          elevation={0}
          sx={{
            p: 3,
            borderRadius: 3.5,
            bgcolor: 'var(--bg-secondary)',
            border: '1px solid rgba(245, 158, 11, 0.25)',
            boxShadow: '0 4px 20px -2px rgba(245, 158, 11, 0.08)',
            position: 'relative',
            overflow: 'hidden'
          }}
        >
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
            <Typography variant="caption" sx={{ fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.08em', color: '#f59e0b' }}>
              Pending Action
            </Typography>
            <HourglassEmptyIcon sx={{ color: '#f59e0b', fontSize: 20 }} />
          </Box>
          <Typography variant="h4" sx={{ fontWeight: 900, color: '#f59e0b' }}>
            {stats.pendingCount}
          </Typography>
          <Typography variant="body2" sx={{ color: 'var(--text-muted)', mt: 0.5, fontWeight: 600 }}>
            {formatCurrency(stats.pendingAmount)} awaiting return
          </Typography>
        </Paper>

        <Paper
          elevation={0}
          sx={{
            p: 3,
            borderRadius: 3.5,
            bgcolor: 'var(--bg-secondary)',
            border: '1px solid rgba(16, 185, 129, 0.25)',
            boxShadow: '0 4px 20px -2px rgba(16, 185, 129, 0.08)'
          }}
        >
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
            <Typography variant="caption" sx={{ fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.08em', color: '#10b981' }}>
              Total Refunded
            </Typography>
            <CheckCircleIcon sx={{ color: '#10b981', fontSize: 20 }} />
          </Box>
          <Typography variant="h4" sx={{ fontWeight: 900, color: '#10b981' }}>
            {stats.completedCount}
          </Typography>
          <Typography variant="body2" sx={{ color: 'var(--text-muted)', mt: 0.5, fontWeight: 600 }}>
            {formatCurrency(stats.completedAmount)} total returned
          </Typography>
        </Paper>

        <Paper
          elevation={0}
          sx={{
            p: 3,
            borderRadius: 3.5,
            bgcolor: 'var(--bg-secondary)',
            border: '1px solid rgba(59, 130, 246, 0.25)',
            boxShadow: '0 4px 20px -2px rgba(59, 130, 246, 0.08)'
          }}
        >
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
            <Typography variant="caption" sx={{ fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.08em', color: '#3b82f6' }}>
              Disbursed Today
            </Typography>
            <AccountBalanceWalletIcon sx={{ color: '#3b82f6', fontSize: 20 }} />
          </Box>
          <Typography variant="h4" sx={{ fontWeight: 900, color: '#3b82f6' }}>
            {stats.todayCount}
          </Typography>
          <Typography variant="body2" sx={{ color: 'var(--text-muted)', mt: 0.5, fontWeight: 600 }}>
            {formatCurrency(stats.todayAmount)} processed today
          </Typography>
        </Paper>
      </Box>

      <Paper
        elevation={0}
        sx={{
          borderRadius: 3.5,
          bgcolor: 'var(--bg-secondary)',
          border: '1px solid var(--border)',
          overflow: 'hidden'
        }}
      >
        <Box sx={{ p: 2.5, borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 2 }}>
          <Stack direction="row" spacing={1}>
            {[
              { id: 'all', label: 'All Refunds', count: refunds.length },
              { id: 'pending', label: 'Pending Action', count: stats.pendingCount },
              { id: 'completed', label: 'Completed', count: stats.completedCount }
            ].map(tab => (
              <Button
                key={tab.id}
                onClick={() => setStatusFilter(tab.id)}
                size="small"
                variant={statusFilter === tab.id ? 'contained' : 'outlined'}
                sx={{
                  borderRadius: 2,
                  textTransform: 'none',
                  fontWeight: 700,
                  fontSize: '0.85rem',
                  px: 2,
                  bgcolor: statusFilter === tab.id ? 'primary.main' : 'transparent',
                  borderColor: statusFilter === tab.id ? 'primary.main' : 'var(--border)',
                  color: statusFilter === tab.id ? '#ffffff' : 'var(--text-muted)'
                }}
              >
                {tab.label}
                <Chip
                  label={tab.count}
                  size="small"
                  sx={{
                    ml: 1,
                    height: 18,
                    fontSize: '0.7rem',
                    fontWeight: 800,
                    bgcolor: statusFilter === tab.id ? 'rgba(255,255,255,0.25)' : 'var(--bg-tertiary)',
                    color: 'inherit'
                  }}
                />
              </Button>
            ))}
          </Stack>

          <TextField
            size="small"
            placeholder="Search order, customer, ref..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon sx={{ color: 'var(--text-muted)', fontSize: 18 }} />
                </InputAdornment>
              )
            }}
            sx={{
              width: { xs: '100%', sm: 300 },
              '& .MuiOutlinedInput-root': {
                borderRadius: 2.5,
                bgcolor: 'var(--bg-primary)',
                '& fieldset': { borderColor: 'var(--border)' }
              }
            }}
          />
        </Box>

        <TableContainer>
          <Table sx={{ minWidth: 800 }}>
            <TableHead>
              <TableRow sx={{ '& th': { color: 'var(--text-muted)', fontWeight: 700, fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em', borderBottom: '1px solid var(--border)', py: 1.75 } }}>
                <TableCell>Refund ID</TableCell>
                <TableCell>Order Ref</TableCell>
                <TableCell>Customer</TableCell>
                <TableCell>Payment Channel</TableCell>
                <TableCell align="right">Refund Amount</TableCell>
                <TableCell>Rejection Reason</TableCell>
                <TableCell>Status</TableCell>
                <TableCell align="right">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={8} align="center" sx={{ py: 6 }}>
                    <CircularProgress size={32} />
                  </TableCell>
                </TableRow>
              ) : filteredRefunds.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} align="center" sx={{ py: 6, color: 'var(--text-muted)' }}>
                    No refund records matching your criteria.
                  </TableCell>
                </TableRow>
              ) : (
                filteredRefunds.map(r => {
                  const isPending = r.status === 'pending';
                  return (
                    <TableRow
                      key={r.id}
                      hover
                      sx={{
                        '& td': { borderBottom: '1px solid var(--border)', py: 1.75 },
                        '&:hover': { bgcolor: 'rgba(255,255,255,0.02)' }
                      }}
                    >
                      <TableCell sx={{ fontWeight: 800, color: isPending ? '#f59e0b' : '#10b981' }}>
                        {r.id}
                      </TableCell>
                      <TableCell sx={{ fontWeight: 700, color: 'var(--text-primary)' }}>
                        {r.orderId}
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2" sx={{ fontWeight: 700, color: 'var(--text-primary)' }}>
                          {r.customerName}
                        </Typography>
                        <Typography variant="caption" sx={{ color: 'var(--text-muted)', display: 'block' }}>
                          {r.customerEmail} • {r.contactNumber}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Box sx={{ display: 'inline-flex', alignItems: 'center', gap: 1, bgcolor: 'var(--bg-tertiary)', px: 1.5, py: 0.5, borderRadius: 2, border: '1px solid var(--border)' }}>
                          {getPaymentChannelIcon(r.paymentMethod)}
                          <Typography variant="caption" sx={{ fontWeight: 600, color: 'var(--text-primary)', maxWidth: 220, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                            {r.paymentMethod}
                          </Typography>
                        </Box>
                      </TableCell>
                      <TableCell align="right" sx={{ fontWeight: 900, color: isPending ? '#f59e0b' : '#10b981', fontSize: '0.95rem' }}>
                        {formatCurrency(r.amount)}
                      </TableCell>
                      <TableCell sx={{ maxWidth: 200 }}>
                        <Typography variant="caption" sx={{ color: 'var(--text-muted)', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                          {r.reason}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        {isPending ? (
                          <Chip
                            icon={<HourglassEmptyIcon sx={{ fontSize: '14px !important', color: '#f59e0b !important' }} />}
                            label="Pending Return"
                            size="small"
                            sx={{
                              bgcolor: 'rgba(245, 158, 11, 0.12)',
                              color: '#f59e0b',
                              border: '1px solid rgba(245, 158, 11, 0.3)',
                              fontWeight: 700,
                              fontSize: '0.72rem'
                            }}
                          />
                        ) : (
                          <Chip
                            icon={<CheckCircleIcon sx={{ fontSize: '14px !important', color: '#10b981 !important' }} />}
                            label="Refunded"
                            size="small"
                            sx={{
                              bgcolor: 'rgba(16, 185, 129, 0.12)',
                              color: '#10b981',
                              border: '1px solid rgba(16, 185, 129, 0.3)',
                              fontWeight: 700,
                              fontSize: '0.72rem'
                            }}
                          />
                        )}
                      </TableCell>
                      <TableCell align="right">
                        {isPending ? (
                          <Button
                            size="small"
                            variant="contained"
                            onClick={() => handleOpenProcessModal(r)}
                            startIcon={<CurrencyExchangeIcon sx={{ fontSize: 16 }} />}
                            sx={{
                              bgcolor: '#f59e0b',
                              color: '#ffffff',
                              fontWeight: 700,
                              textTransform: 'none',
                              borderRadius: 2,
                              fontSize: '0.8rem',
                              '&:hover': { bgcolor: '#d97706' }
                            }}
                          >
                            Return Money
                          </Button>
                        ) : (
                          <IconButton
                            size="small"
                            onClick={() => handleOpenReceiptModal(r)}
                            sx={{ color: '#60a5fa', bgcolor: 'rgba(59, 130, 246, 0.1)', '&:hover': { bgcolor: 'rgba(59, 130, 246, 0.2)' } }}
                            title="View Refund Receipt"
                          >
                            <VisibilityIcon sx={{ fontSize: 18 }} />
                          </IconButton>
                        )}
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>

      <Dialog
        open={processModalOpen}
        onClose={() => !submitting && setProcessModalOpen(false)}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: 3.5,
            bgcolor: 'var(--bg-secondary)',
            border: '1px solid var(--border)',
            color: 'var(--text-primary)'
          }
        }}
      >
        <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', pb: 1, borderBottom: '1px solid var(--border)' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <CurrencyExchangeIcon sx={{ color: '#f59e0b' }} />
            <Typography variant="h6" sx={{ fontWeight: 800 }}>
              Process Customer Refund
            </Typography>
          </Box>
          <IconButton size="small" onClick={() => !submitting && setProcessModalOpen(false)} disabled={submitting}>
            <CloseIcon sx={{ color: 'var(--text-muted)' }} />
          </IconButton>
        </DialogTitle>

        <DialogContent sx={{ pt: 3 }}>
          {selectedRefund && (
            <Stack spacing={2.5}>
              <Box sx={{ p: 2, borderRadius: 2.5, bgcolor: 'var(--bg-primary)', border: '1px solid var(--border)' }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                  <Typography variant="caption" sx={{ color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase' }}>
                    Order Reference
                  </Typography>
                  <Typography variant="body2" sx={{ fontWeight: 800, color: '#f59e0b' }}>
                    {selectedRefund.orderId} ({selectedRefund.id})
                  </Typography>
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                  <Typography variant="caption" sx={{ color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase' }}>
                    Customer
                  </Typography>
                  <Typography variant="body2" sx={{ fontWeight: 700 }}>
                    {selectedRefund.customerName} ({selectedRefund.customerEmail})
                  </Typography>
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                  <Typography variant="caption" sx={{ color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase' }}>
                    Original Order Total
                  </Typography>
                  <Typography variant="body2" sx={{ fontWeight: 700 }}>
                    {formatCurrency(selectedRefund.orderTotal)}
                  </Typography>
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 1, pt: 1, borderTop: '1px dashed var(--border)' }}>
                  <Typography variant="caption" sx={{ color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase' }}>
                    Original Payment Channel
                  </Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
                    {getPaymentChannelIcon(selectedRefund.paymentMethod)}
                    <Typography variant="caption" sx={{ fontWeight: 800, color: 'var(--text-primary)' }}>
                      {selectedRefund.paymentMethod}
                    </Typography>
                  </Box>
                </Box>
              </Box>

              <TextField
                label="Refund Amount (₱)"
                type="number"
                value={processForm.amount}
                onChange={(e) => setProcessForm({ ...processForm, amount: e.target.value })}
                fullWidth
                helperText="Pre-calculated from order payment status (e.g. 50% downpayment or full paid total)"
                InputProps={{
                  startAdornment: <InputAdornment position="start">₱</InputAdornment>
                }}
              />

              <TextField
                label="Return Channel / Destination"
                value={processForm.returnMethod}
                onChange={(e) => setProcessForm({ ...processForm, returnMethod: e.target.value })}
                fullWidth
                helperText="The payment channel where funds will be returned to the buyer"
              />

              <Box>
                <TextField
                  label="Transaction Reference / Reversal ID"
                  value={processForm.transactionReference}
                  onChange={(e) => setProcessForm({ ...processForm, transactionReference: e.target.value })}
                  fullWidth
                  placeholder="e.g. GCASH-REF-19283748 or BANK-TRX-9821"
                  helperText="Required audit identifier shown to customer and on company records"
                  InputProps={{
                    endAdornment: (
                      <InputAdornment position="end">
                        <Button
                          size="small"
                          onClick={handleGenerateRef}
                          startIcon={<AutoFixHighIcon sx={{ fontSize: 14 }} />}
                          sx={{ textTransform: 'none', fontWeight: 700, fontSize: '0.75rem' }}
                        >
                          Auto Generate
                        </Button>
                      </InputAdornment>
                    )
                  }}
                />
              </Box>

              <TextField
                label="Finance Processing Notes"
                multiline
                rows={2}
                value={processForm.notes}
                onChange={(e) => setProcessForm({ ...processForm, notes: e.target.value })}
                fullWidth
                placeholder="e.g. Refund sent via GCash Merchant portal ref #..."
              />

              <Alert severity="info" sx={{ borderRadius: 2.5, fontSize: '0.82rem', '& .MuiAlert-icon': { color: '#0284c7' } }}>
                <strong>Automated Customer Notification:</strong> Submitting will immediately send an official Mega Pacific HTML email receipt and a real-time push alert to the customer's browser.
              </Alert>
            </Stack>
          )}
        </DialogContent>

        <DialogActions sx={{ p: 2.5, borderTop: '1px solid var(--border)' }}>
          <Button
            onClick={() => setProcessModalOpen(false)}
            disabled={submitting}
            sx={{ textTransform: 'none', color: 'var(--text-muted)', fontWeight: 600 }}
          >
            Cancel
          </Button>
          <Button
            onClick={handleProcessRefund}
            variant="contained"
            disabled={submitting}
            startIcon={submitting ? <CircularProgress size={16} color="inherit" /> : <CurrencyExchangeIcon />}
            sx={{
              bgcolor: '#10b981',
              color: '#ffffff',
              fontWeight: 800,
              textTransform: 'none',
              px: 3,
              borderRadius: 2,
              '&:hover': { bgcolor: '#059669' }
            }}
          >
            {submitting ? 'Processing & Notifying...' : 'Confirm & Return Money'}
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog
        open={receiptModalOpen}
        onClose={() => setReceiptModalOpen(false)}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: 3.5,
            bgcolor: 'var(--bg-secondary)',
            border: '1px solid var(--border)',
            color: 'var(--text-primary)'
          }
        }}
      >
        <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', pb: 1, borderBottom: '1px solid var(--border)' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <ReceiptLongIcon sx={{ color: '#10b981' }} />
            <Typography variant="h6" sx={{ fontWeight: 800 }}>
              Refund Audit Voucher
            </Typography>
          </Box>
          <IconButton size="small" onClick={() => setReceiptModalOpen(false)}>
            <CloseIcon sx={{ color: 'var(--text-muted)' }} />
          </IconButton>
        </DialogTitle>

        <DialogContent sx={{ pt: 3 }}>
          {selectedRefund && (
            <Box>
              <Box sx={{ textAlign: 'center', py: 2.5, bgcolor: 'rgba(16, 185, 129, 0.08)', borderRadius: 3, border: '1px solid rgba(16, 185, 129, 0.25)', mb: 3 }}>
                <CheckCircleIcon sx={{ color: '#10b981', fontSize: 36, mb: 0.5 }} />
                <Typography variant="caption" sx={{ fontWeight: 800, color: '#10b981', textTransform: 'uppercase', display: 'block', letterSpacing: '0.1em' }}>
                  Refund Completed
                </Typography>
                <Typography variant="h4" sx={{ fontWeight: 900, color: '#10b981', my: 0.5 }}>
                  {formatCurrency(selectedRefund.amount)}
                </Typography>
                <Typography variant="caption" sx={{ color: 'var(--text-muted)' }}>
                  Disbursed on {new Date(selectedRefund.refundedAt || selectedRefund.createdAt).toLocaleString()}
                </Typography>
              </Box>

              <Stack spacing={1.5} sx={{ bgcolor: 'var(--bg-primary)', p: 2.5, borderRadius: 2.5, border: '1px solid var(--border)', mb: 2 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Typography variant="caption" sx={{ color: 'var(--text-muted)', fontWeight: 700 }}>REFUND VOUCHER</Typography>
                  <Typography variant="body2" sx={{ fontWeight: 800, color: '#10b981' }}>{selectedRefund.id}</Typography>
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Typography variant="caption" sx={{ color: 'var(--text-muted)', fontWeight: 700 }}>ORDER REFERENCE</Typography>
                  <Typography variant="body2" sx={{ fontWeight: 700 }}>{selectedRefund.orderId}</Typography>
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Typography variant="caption" sx={{ color: 'var(--text-muted)', fontWeight: 700 }}>CUSTOMER NAME</Typography>
                  <Typography variant="body2" sx={{ fontWeight: 700 }}>{selectedRefund.customerName}</Typography>
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Typography variant="caption" sx={{ color: 'var(--text-muted)', fontWeight: 700 }}>CUSTOMER EMAIL</Typography>
                  <Typography variant="body2">{selectedRefund.customerEmail}</Typography>
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Typography variant="caption" sx={{ color: 'var(--text-muted)', fontWeight: 700 }}>RETURN CHANNEL</Typography>
                  <Typography variant="body2" sx={{ fontWeight: 700 }}>{selectedRefund.paymentMethod}</Typography>
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Typography variant="caption" sx={{ color: 'var(--text-muted)', fontWeight: 700 }}>TRANSACTION REFERENCE</Typography>
                  <Typography variant="body2" sx={{ fontWeight: 800, fontFamily: 'monospace' }}>{selectedRefund.transactionReference || 'N/A'}</Typography>
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Typography variant="caption" sx={{ color: 'var(--text-muted)', fontWeight: 700 }}>PROCESSED BY</Typography>
                  <Typography variant="body2" sx={{ fontWeight: 600 }}>{selectedRefund.processedBy || 'Finance Department'}</Typography>
                </Box>
                {selectedRefund.notes && (
                  <Box sx={{ pt: 1, borderTop: '1px dashed var(--border)' }}>
                    <Typography variant="caption" sx={{ color: 'var(--text-muted)', fontWeight: 700, display: 'block', mb: 0.5 }}>FINANCE NOTES</Typography>
                    <Typography variant="body2" sx={{ color: 'var(--text-secondary)' }}>{selectedRefund.notes}</Typography>
                  </Box>
                )}
              </Stack>
            </Box>
          )}
        </DialogContent>

        <DialogActions sx={{ p: 2.5, borderTop: '1px solid var(--border)' }}>
          <Button
            onClick={() => setReceiptModalOpen(false)}
            variant="contained"
            sx={{ textTransform: 'none', fontWeight: 700, borderRadius: 2 }}
          >
            Close
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default RefundsPage;
