import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
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
  CircularProgress,
  Chip,
  MenuItem,
  InputAdornment,
  Avatar,
  Stack,
  Card,
  CardContent,
  CardActionArea,
  Divider,
  Alert
} from '@mui/material';


const STATUS_CONFIG = {
  pending: {
    label: 'Pending',
    iconClass: 'fi fi-rr-time-fast',
    color: 'warning'
  },
  processing: {
    label: 'Processing',
    iconClass: 'fi fi-rr-box',
    color: 'info'
  },
  out_for_delivery: {
    label: 'Out for Delivery',
    iconClass: 'fi fi-rr-truck-side',
    color: 'primary'
  },
  delivered: {
    label: 'Delivered',
    iconClass: 'fi fi-sr-check-circle',
    color: 'success'
  },
  cancelled: {
    label: 'Cancelled',
    iconClass: 'fi fi-rr-cross-circle',
    color: 'error'
  },
};

const FILTER_OPTIONS = [
  { value: 'all', label: 'All Orders' },
  { value: 'pending', label: 'Pending' },
  { value: 'processing', label: 'Processing' },
  { value: 'out_for_delivery', label: 'Out for Delivery' },
  { value: 'delivered', label: 'Delivered' },
  { value: 'cancelled', label: 'Cancelled' },
];

const formatDate = (dateStr) =>
  new Date(dateStr).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });

const formatCurrency = (amount) =>
  `₱${Number(amount).toLocaleString('en-PH', { minimumFractionDigits: 2 })}`;

const StatusBadge = ({ status }) => {
  const key = status?.toLowerCase() || 'pending';
  const cfg = STATUS_CONFIG[key] || STATUS_CONFIG.pending;
  const { iconClass, label, color } = cfg;
  return (
    <Chip 
      icon={<i className={iconClass} style={{ fontSize: '13px', marginLeft: '6px' }}></i>} 
      label={label} 
      color={color} 
      variant="outlined" 
      size="small" 
      sx={{ fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: 0.5 }} 
    />
  );
};

const OrderCard = ({ order, onClick }) => {
  const previewImages = order.items
    .slice(0, 3)
    .map((item) => item.product?.imageUrls?.[0] || item.product?.imageUrl)
    .filter(Boolean);

  const totalQty = order.items.reduce((acc, i) => acc + i.quantity, 0);

  return (
    <Card 
      elevation={0} 
      onClick={onClick}
      sx={{ 
        border: '1px solid', 
        borderColor: 'divider', 
        borderRadius: 4, 
        transition: 'all 0.3s',
        '&:hover': {
          borderColor: 'primary.main',
          boxShadow: '0 8px 24px rgba(0,0,0,0.05)',
          transform: 'translateY(-2px)'
        }
      }}
    >
      <CardActionArea sx={{ p: 3 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 3 }}>
          <Box>
            <Typography variant="caption" color="text.secondary" fontWeight="bold" sx={{ textTransform: 'uppercase', letterSpacing: 1 }}>
              Order ID
            </Typography>
            <Typography variant="h6" fontWeight="900" color="text.primary">
              #{String(order.id).padStart(4, '0')}
            </Typography>
          </Box>
          <StatusBadge status={order.status} />
        </Box>

        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
          <Stack direction="row" sx={{ ml: 1 }}>
            {previewImages.length > 0 ? (
              previewImages.map((url, i) => (
                <Avatar 
                  key={i} 
                  src={url} 
                  variant="rounded" 
                  sx={{ width: 48, height: 48, border: '2px solid white', ml: -1, bgcolor: 'background.default' }} 
                />
              ))
            ) : (
              <Avatar variant="rounded" sx={{ width: 48, height: 48, border: '2px solid white', ml: -1, bgcolor: 'background.default', color: 'text.disabled' }}>
                <i className="fi fi-rr-box" style={{ fontSize: '20px' }}></i>
              </Avatar>
            )}
            {order.items.length > 3 && (
              <Avatar variant="rounded" sx={{ width: 48, height: 48, border: '2px solid white', ml: -1, bgcolor: 'grey.200', color: 'text.secondary', fontSize: '0.875rem', fontWeight: 'bold' }}>
                +{order.items.length - 3}
              </Avatar>
            )}
          </Stack>
          <Box sx={{ flexGrow: 1, minWidth: 0 }}>
            <Typography variant="body2" fontWeight="bold" noWrap>
              {order.items.map((i) => i.product?.name).filter(Boolean).join(', ')}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              {order.items.length} product{order.items.length !== 1 ? 's' : ''} · {totalQty} unit{totalQty !== 1 ? 's' : ''}
            </Typography>
          </Box>
        </Box>

        <Divider sx={{ mb: 2 }} />

        <Grid container spacing={2}>
          <Grid item xs={4}>
            <Typography variant="caption" color="text.secondary" fontWeight="bold" sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mb: 0.5 }}>
              <i className="fi fi-rr-calendar" style={{ fontSize: '12px' }}></i> Date
            </Typography>
            <Typography variant="body2" fontWeight="bold">{formatDate(order.createdAt)}</Typography>
          </Grid>
          <Grid item xs={4}>
            <Typography variant="caption" color="text.secondary" fontWeight="bold" sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mb: 0.5 }}>
              <i className="fi fi-rr-credit-card" style={{ fontSize: '12px' }}></i> Payment
            </Typography>
            <Typography variant="body2" fontWeight="bold" sx={{ textTransform: 'capitalize' }}>
              {order.paymentMode || '—'}
            </Typography>
          </Grid>
          <Grid item xs={4} sx={{ textAlign: 'right' }}>
            <Typography variant="caption" color="text.secondary" fontWeight="bold" sx={{ mb: 0.5, display: 'block' }}>
              Total
            </Typography>
            <Typography variant="body1" fontWeight="900" color="primary">
              {formatCurrency(order.total)}
            </Typography>
          </Grid>
        </Grid>

        {order.estimatedDeliveryDate && !['delivered', 'cancelled', 'completed'].includes(order.status?.toLowerCase()) && (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 2, bgcolor: 'primary.50', p: 1, borderRadius: 2, border: '1px solid', borderColor: 'primary.100' }}>
            <i className="fi fi-rr-truck-side" style={{ fontSize: '16px', color: '#1e3a8a' }}></i>
            <Typography variant="caption" color="primary.dark" fontWeight="bold">
              Estimated Delivery: {new Date(order.estimatedDeliveryDate).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' })}
            </Typography>
          </Box>
        )}
        
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, color: 'text.secondary', mt: 2, fontSize: '0.75rem', fontWeight: 'bold', justifyContent: 'flex-end' }}>
          View full details <i className="fi fi-rr-angle-right" style={{ fontSize: '12px' }}></i>
        </Box>
      </CardActionArea>
    </Card>
  );
};

const OrdersPage = () => {
  const navigate = useNavigate();
  const { token } = useAuth();

  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [activeFilter, setActiveFilter] = useState('all');

  const fetchMyOrders = async () => {
    setLoading(true);
    setError('');
    try {
      const API_URL = import.meta.env.VITE_API_URL || '';
      const res = await axios.get(`${API_URL}/api/customer/orders/my`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.data.success) {
        const mappedOrders = res.data.data.map(o => ({
          ...o,
          status: o.status.toLowerCase() === 'shipped' ? 'processing' : o.status
        }));
        setOrders(mappedOrders);
      } else {
        setError(res.data.error || 'Failed to load orders.');
      }
    } catch (err) {
      console.error('Failed to fetch orders:', err);
      const status = err.response?.status;
      const serverMsg = err.response?.data?.error;
      if (status === 401) {
        setError('Your session has expired. Please log out and log back in.');
      } else if (status === 403) {
        setError('Access denied. Please contact support.');
      } else if (serverMsg) {
        setError(serverMsg);
      } else {
        setError('Could not connect to the server. Check your connection and try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token) {
      fetchMyOrders();
    } else {
      setLoading(false);
      setError('You are not logged in. Please log in to view your orders.');
    }
  }, [token]);

  const filteredOrders = useMemo(() => {
    return orders.filter((o) => {
      const matchesFilter =
        activeFilter === 'all' || o.status?.toLowerCase() === activeFilter;

      const searchLower = searchTerm.toLowerCase();
      const matchesSearch =
        !searchTerm ||
        String(o.id).includes(searchLower) ||
        o.items.some((item) => item.product?.name?.toLowerCase().includes(searchLower)) ||
        o.paymentMode?.toLowerCase().includes(searchLower) ||
        o.status?.toLowerCase().includes(searchLower);

      return matchesFilter && matchesSearch;
    });
  }, [orders, searchTerm, activeFilter]);

  const stats = useMemo(() => {
    const total = orders.length;
    const delivered = orders.filter((o) => o.status?.toLowerCase() === 'delivered').length;
    const pending = orders.filter((o) =>
      ['pending', 'processing', 'out_for_delivery'].includes(o.status?.toLowerCase())
    ).length;
    const totalSpent = orders.reduce((acc, o) => acc + Number(o.total), 0);
    return { total, delivered, pending, totalSpent };
  }, [orders]);

  return (
    <Box sx={{ animation: 'fadeIn 0.5s ease-in-out', pb: 10, maxWidth: 1200, mx: 'auto' }}>
      <Button onClick={() => navigate('/dashboard')} sx={{ mb: 4, color: 'text.secondary', display: 'flex', alignItems: 'center', gap: 1 }}>
        <i className="fi fi-rr-arrow-left" style={{ fontSize: '14px' }}></i>
        Back to Dashboard
      </Button>

      <Box sx={{ mb: 6 }}>
        <Typography variant="h3" fontWeight="bold" sx={{ display: 'flex', alignItems: 'center', gap: 2, color: 'text.primary' }}>
          <i className="fi fi-rr-shopping-bag" style={{ fontSize: '32px', color: '#1e3a8a' }}></i> My Orders
        </Typography>
        <Typography color="text.secondary" sx={{ mt: 1 }}>
          Track and manage all your previous and current purchases.
        </Typography>
      </Box>

      {!loading && !error && (
        <Grid container spacing={3} sx={{ mb: 6 }}>
          <Grid item xs={6} md={3}>
            <Paper elevation={0} sx={{ p: 3, borderRadius: 3, border: '1px solid', borderColor: 'divider', bgcolor: 'background.paper' }}>
              <Typography variant="overline" color="text.secondary" fontWeight="bold">Total Orders</Typography>
              <Typography variant="h4" fontWeight="bold" color="text.primary">{stats.total}</Typography>
            </Paper>
          </Grid>
          <Grid item xs={6} md={3}>
            <Paper elevation={0} sx={{ p: 3, borderRadius: 3, border: '1px solid', borderColor: 'divider', bgcolor: 'background.paper' }}>
              <Typography variant="overline" color="text.secondary" fontWeight="bold">Delivered</Typography>
              <Typography variant="h4" fontWeight="bold" color="success.main">{stats.delivered}</Typography>
            </Paper>
          </Grid>
          <Grid item xs={6} md={3}>
            <Paper elevation={0} sx={{ p: 3, borderRadius: 3, border: '1px solid', borderColor: 'divider', bgcolor: 'background.paper' }}>
              <Typography variant="overline" color="text.secondary" fontWeight="bold">In Progress</Typography>
              <Typography variant="h4" fontWeight="bold" color="warning.main">{stats.pending}</Typography>
            </Paper>
          </Grid>
          <Grid item xs={6} md={3}>
            <Paper elevation={0} sx={{ p: 3, borderRadius: 3, border: '1px solid', borderColor: 'divider', bgcolor: 'background.paper' }}>
              <Typography variant="overline" color="text.secondary" fontWeight="bold">Total Spent</Typography>
              <Typography variant="h5" fontWeight="bold" color="text.primary" sx={{ mt: 1 }}>{formatCurrency(stats.totalSpent)}</Typography>
            </Paper>
          </Grid>
        </Grid>
      )}

      <Box sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, gap: 2, mb: 4 }}>
        <TextField
          fullWidth
          placeholder="Search by order ID, product name, payment method…"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <i className="fi fi-rr-search" style={{ fontSize: '16px', color: '#64748b' }}></i>
              </InputAdornment>
            ),
          }}
          sx={{ flexGrow: 1, bgcolor: 'background.paper', borderRadius: 2 }}
        />
        <TextField
          select
          value={activeFilter}
          onChange={(e) => setActiveFilter(e.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <i className="fi fi-rr-filter" style={{ fontSize: '16px', color: '#64748b' }}></i>
              </InputAdornment>
            ),
          }}
          sx={{ minWidth: 200, bgcolor: 'background.paper', borderRadius: 2 }}
        >
          {FILTER_OPTIONS.map((opt) => (
            <MenuItem key={opt.value} value={opt.value}>
              {opt.label}
            </MenuItem>
          ))}
        </TextField>
      </Box>

      <Stack direction="row" spacing={1} sx={{ mb: 6, flexWrap: 'wrap', gap: 1 }}>
        {FILTER_OPTIONS.map((opt) => (
          <Chip
            key={opt.value}
            label={`${opt.label} ${opt.value !== 'all' ? `(${orders.filter((o) => o.status?.toLowerCase() === opt.value).length})` : ''}`}
            onClick={() => setActiveFilter(opt.value)}
            color={activeFilter === opt.value ? 'primary' : 'default'}
            variant={activeFilter === opt.value ? 'filled' : 'outlined'}
            sx={{ fontWeight: 'bold' }}
          />
        ))}
      </Stack>

      {loading ? (
        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', py: 15 }}>
          <CircularProgress />
          <Typography color="text.secondary" sx={{ mt: 2 }}>Loading your orders…</Typography>
        </Box>
      ) : error ? (
        <Alert severity="error" action={<Button color="inherit" size="small" onClick={fetchMyOrders}>Try Again</Button>}>
          {error}
        </Alert>
      ) : filteredOrders.length === 0 ? (
        <Paper elevation={0} sx={{ p: 8, textAlign: 'center', borderRadius: 4, border: '1px solid', borderColor: 'divider', bgcolor: 'background.paper' }}>
          
          <Typography variant="h5" fontWeight="bold" gutterBottom>
            {orders.length === 0 ? "You haven't placed any orders yet" : 'No orders match your search'}
          </Typography>
          <Typography color="text.secondary" sx={{ mb: 4 }}>
            {orders.length === 0
              ? 'Browse our catalog and start shopping!'
              : 'Try adjusting your filters or search terms.'}
          </Typography>
          {orders.length === 0 && (
            <Button variant="contained" color="primary" onClick={() => navigate('/dashboard')}>
              Browse Products
            </Button>
          )}
        </Paper>
      ) : (
        <Box>
          <Typography variant="body2" color="text.secondary" fontWeight="bold" sx={{ mb: 2 }}>
            Showing <Typography component="span" fontWeight="900" color="text.primary">{filteredOrders.length}</Typography> order{filteredOrders.length !== 1 ? 's' : ''}
          </Typography>
          <Grid container spacing={3}>
            {filteredOrders.map((order) => (
              <Grid item xs={12} md={6} key={order.id}>
                <OrderCard
                  order={order}
                  onClick={() => navigate(`/order/${order.id}`)}
                />
              </Grid>
            ))}
          </Grid>
        </Box>
      )}
    </Box>
  );
};

export default OrdersPage;
