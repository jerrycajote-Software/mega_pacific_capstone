import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';
import { generateReceiptPDF } from '../../utils/documentGenerator';
import {
  Box,
  Typography,
  TextField,
  Button,
  Paper,
  CircularProgress,
  Chip,
  InputAdornment,
  Avatar,
  Stack,
  Card,
  CardActionArea,
  Alert,
  IconButton,
} from '@mui/material';
import { io } from 'socket.io-client';
import {
  CustomCustomerTotalOrdersIcon,
  CustomCustomerInProgressIcon,
  CustomCustomerCompletedIcon,
  CustomCustomerTotalSpentIcon
} from '../../components/icons';

const getOrderStatusMeta = (status, fulfillmentType, paymentStatus) => {
  const s = (status || '').toLowerCase();
  const ps = (paymentStatus || '').toLowerCase();
  const isPickup = (fulfillmentType || '').toLowerCase() === 'pickup';

  if (s === 'cancelled' || s === 'rejected') {
    if (ps === 'refunded') {
      return {
        label: 'Rejected · Refunded',
        badgeColor: '#16a34a',
        badgeBg: 'rgba(22, 163, 74, 0.08)',
        badgeBorder: 'rgba(22, 163, 74, 0.25)',
        iconClass: 'fi fi-sr-shield-check',
        category: 'cancelled'
      };
    }
    if (ps === 'refund_pending') {
      return {
        label: 'Rejected · Refund Pending',
        badgeColor: '#ea580c',
        badgeBg: 'rgba(234, 88, 12, 0.08)',
        badgeBorder: 'rgba(234, 88, 12, 0.25)',
        iconClass: 'fi fi-rr-time-fast',
        category: 'cancelled'
      };
    }
    return {
      label: s === 'rejected' ? 'Order Rejected' : 'Cancelled',
      badgeColor: '#dc2626',
      badgeBg: 'rgba(220, 38, 38, 0.08)',
      badgeBorder: 'rgba(220, 38, 38, 0.25)',
      iconClass: 'fi fi-rr-cross-circle',
      category: 'cancelled'
    };
  }

  if (s === 'completed' || (isPickup && s === 'delivered')) {
    return {
      label: isPickup ? 'Picked Up' : 'Completed',
      badgeColor: '#16a34a',
      badgeBg: 'rgba(22, 163, 74, 0.08)',
      badgeBorder: 'rgba(22, 163, 74, 0.25)',
      iconClass: 'fi fi-sr-check-circle',
      category: 'completed'
    };
  }

  if (s === 'delivered') {
    return {
      label: 'Delivered',
      badgeColor: '#16a34a',
      badgeBg: 'rgba(22, 163, 74, 0.08)',
      badgeBorder: 'rgba(22, 163, 74, 0.25)',
      iconClass: 'fi fi-sr-check-circle',
      category: 'completed'
    };
  }

  if (isPickup && s === 'ready_for_pickup') {
    return {
      label: 'Ready for Pick-up',
      badgeColor: '#7c3aed',
      badgeBg: 'rgba(124, 58, 237, 0.08)',
      badgeBorder: 'rgba(124, 58, 237, 0.3)',
      iconClass: 'fi fi-rr-shop',
      category: 'in_progress'
    };
  }

  if (!isPickup && (s === 'out_for_delivery' || s === 'shipped')) {
    return {
      label: 'Out for Delivery',
      badgeColor: '#2563eb',
      badgeBg: 'rgba(37, 99, 235, 0.08)',
      badgeBorder: 'rgba(37, 99, 235, 0.25)',
      iconClass: 'fi fi-rr-truck-side',
      category: 'in_progress'
    };
  }

  if (s === 'processing' || s === 'finance_verified') {
    return {
      label: isPickup ? 'Fabricating / Staging' : 'Fabricating / Packing',
      badgeColor: '#d97706',
      badgeBg: 'rgba(217, 119, 6, 0.08)',
      badgeBorder: 'rgba(217, 119, 6, 0.25)',
      iconClass: 'fi fi-rr-box',
      category: 'in_progress'
    };
  }

  return {
    label: 'Order Placed',
    badgeColor: '#0284c7',
    badgeBg: 'rgba(2, 132, 199, 0.08)',
    badgeBorder: 'rgba(2, 132, 199, 0.25)',
    iconClass: 'fi fi-rr-time-fast',
    category: 'in_progress'
  };
};

const formatPaymentMode = (rawMode) => {
  if (!rawMode) return { primary: 'Standard Checkout', secondary: null };
  const mode = String(rawMode);
  const lower = mode.toLowerCase();

  if (lower.includes('50% downpayment')) {
    let depositChannel = 'GCash';
    if (lower.includes('card')) depositChannel = 'Card';
    if (lower.includes('bank')) depositChannel = 'Bank Transfer';

    return {
      primary: '50/50 Downpayment',
      secondary: lower.includes('cash on delivery')
        ? `Deposit via ${depositChannel} • Balance on Delivery`
        : `Downpayment via ${depositChannel}`
    };
  }

  if (lower.includes('gcash')) {
    return { primary: 'GCash', secondary: 'Digital Wallet Transfer' };
  }
  if (lower.includes('card') || lower.includes('credit')) {
    return { primary: 'Credit / Debit Card', secondary: 'Online Payment' };
  }
  if (lower.includes('cash on delivery') || lower.includes('cod')) {
    return { primary: 'Cash on Delivery', secondary: 'Pay on Handover' };
  }

  return { 
    primary: mode.length > 25 ? mode.slice(0, 22) + '…' : mode, 
    secondary: null 
  };
};

const formatDate = (dateStr) =>
  new Date(dateStr).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });

const formatCurrency = (amount) =>
  `₱${Number(amount || 0).toLocaleString('en-PH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

const FILTER_TABS = [
  { id: 'all', label: 'All Orders' },
  { id: 'in_progress', label: 'In Progress' },
  { id: 'ready_for_pickup', label: 'Ready for Pick-up' },
  { id: 'completed', label: 'Completed' },
  { id: 'cancelled', label: 'Cancelled' },
];

const OrderCard = ({ order, onClick, onReviewClick }) => {
  const isPickup = (order.fulfillmentType || '').toLowerCase() === 'pickup';
  const statusMeta = getOrderStatusMeta(order.status, order.fulfillmentType, order.paymentStatus);
  const isReadyForPickup = isPickup && order.status?.toLowerCase() === 'ready_for_pickup';
  const isCompleted = ['delivered', 'completed'].includes(order.status?.toLowerCase());
  const paymentInfo = formatPaymentMode(order.paymentMode);

  const previewImages = (order.items || [])
    .slice(0, 3)
    .map((item) => item.product?.imageUrls?.[0] || item.product?.imageUrl)
    .filter(Boolean);

  const totalQty = (order.items || []).reduce((acc, i) => acc + (i.quantity || 1), 0);
  const formattedId = `#ORD-${String(order.id).padStart(4, '0')}`;

  return (
    <Card 
      elevation={0} 
      sx={{ 
        border: '1px solid', 
        borderColor: isReadyForPickup ? '#8b5cf6' : 'divider', 
        borderRadius: 3.5, 
        bgcolor: 'background.paper',
        transition: 'all 0.25s ease',
        boxShadow: isReadyForPickup ? '0 8px 24px rgba(139, 92, 246, 0.12)' : '0 2px 8px rgba(0,0,0,0.03)',
        overflow: 'hidden',
        '&:hover': {
          borderColor: isReadyForPickup ? '#7c3aed' : '#4f772d',
          boxShadow: '0 8px 24px rgba(0,0,0,0.07)',
          transform: 'translateY(-2px)'
        }
      }}
    >
      <CardActionArea onClick={onClick} sx={{ p: { xs: 2.25, sm: 3 } }}>
        
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: { xs: 'flex-start', sm: 'center' }, flexWrap: 'wrap', gap: 1.5, mb: 2.5 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.25, flexWrap: 'wrap' }}>
            <Typography variant="h6" fontWeight={900} color="text.primary" sx={{ letterSpacing: '-0.01em', fontSize: { xs: '1.1rem', sm: '1.25rem' } }}>
              {formattedId}
            </Typography>

            <Chip
              label={isPickup ? 'Store Pick-up' : 'Fleet Delivery'}
              size="small"
              icon={<i className={isPickup ? 'fi fi-rr-shop' : 'fi fi-rr-truck-side'} style={{ fontSize: 11, marginLeft: 6 }} />}
              sx={{
                fontSize: '0.72rem',
                fontWeight: 700,
                height: 24,
                bgcolor: isPickup ? 'rgba(124, 58, 237, 0.08)' : 'rgba(37, 99, 235, 0.08)',
                color: isPickup ? '#7c3aed' : '#2563eb',
                border: '1px solid',
                borderColor: isPickup ? 'rgba(124, 58, 237, 0.2)' : 'rgba(37, 99, 235, 0.2)'
              }}
            />

            <Typography variant="caption" color="text.secondary" sx={{ display: 'flex', alignItems: 'center', gap: 0.5, fontWeight: 500, ml: 0.5 }}>
              <i className="fi fi-rr-calendar" style={{ fontSize: 12 }} />
              {formatDate(order.createdAt)}
            </Typography>
          </Box>

          <Chip 
            icon={<i className={statusMeta.iconClass} style={{ fontSize: 12, marginLeft: 6, color: statusMeta.badgeColor }} />} 
            label={statusMeta.label} 
            size="small" 
            sx={{ 
              fontWeight: 800, 
              fontSize: '0.73rem',
              height: 26,
              bgcolor: statusMeta.badgeBg,
              color: statusMeta.badgeColor,
              border: '1px solid',
              borderColor: statusMeta.badgeBorder
            }} 
          />
        </Box>

        <Box 
          sx={{ 
            p: 2, 
            bgcolor: 'background.default', 
            borderRadius: 2.5, 
            border: '1px solid', 
            borderColor: 'divider',
            display: 'flex',
            flexDirection: { xs: 'column', md: 'row' },
            justifyContent: 'space-between',
            alignItems: { xs: 'flex-start', md: 'center' },
            gap: 2.5,
            mb: 2
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, minWidth: 0, flex: 1 }}>
            <Stack direction="row" sx={{ ml: 0.5, flexShrink: 0 }}>
              {previewImages.length > 0 ? (
                previewImages.map((url, i) => (
                  <Avatar 
                    key={i} 
                    src={url} 
                    variant="rounded" 
                    sx={{ 
                      width: 52, 
                      height: 52, 
                      borderRadius: 2, 
                      border: '2px solid white', 
                      ml: i === 0 ? 0 : -1.5, 
                      bgcolor: 'background.paper',
                      boxShadow: '0 2px 6px rgba(0,0,0,0.06)'
                    }} 
                  />
                ))
              ) : (
                <Avatar 
                  variant="rounded" 
                  sx={{ width: 52, height: 52, borderRadius: 2, bgcolor: 'background.paper', border: '1px solid', borderColor: 'divider', color: '#94a3b8' }}
                >
                  <i className="fi fi-rr-box" style={{ fontSize: 24 }} />
                </Avatar>
              )}
              {order.items?.length > 3 && (
                <Avatar 
                  variant="rounded" 
                  sx={{ 
                    width: 52, 
                    height: 52, 
                    borderRadius: 2, 
                    border: '2px solid white', 
                    ml: -1.5, 
                    bgcolor: 'grey.200', 
                    color: 'text.secondary', 
                    fontSize: '0.8rem', 
                    fontWeight: 800 
                  }}
                >
                  +{order.items.length - 3}
                </Avatar>
              )}
            </Stack>

            <Box sx={{ minWidth: 0, flex: 1 }}>
              <Typography variant="body1" fontWeight={800} color="text.primary" noWrap sx={{ lineHeight: 1.3 }}>
                {order.items?.map((i) => i.product?.name ? `${i.product.name}${i.customLength ? ` (${i.customLength}m)` : ''}` : '').filter(Boolean).join(', ') || 'Custom Roofing Order'}
              </Typography>
              <Typography variant="caption" color="text.secondary" sx={{ mt: 0.25, display: 'block' }}>
                {order.items?.length || 0} {order.items?.length === 1 ? 'profile cut' : 'profile cuts'} · Total {totalQty} {totalQty === 1 ? 'sheet / unit' : 'sheets / units'}
              </Typography>
            </Box>
          </Box>

          <Box sx={{ display: 'flex', gap: { xs: 3, sm: 4 }, alignItems: 'center', width: { xs: '100%', md: 'auto' }, justifyContent: { xs: 'space-between', md: 'flex-end' }, pt: { xs: 1.5, md: 0 }, borderTop: { xs: '1px dashed #e2e8f0', md: 'none' } }}>
            <Box>
              <Typography variant="caption" color="text.secondary" fontWeight={700} sx={{ display: 'block', textTransform: 'uppercase', fontSize: '0.68rem' }}>
                Payment Method
              </Typography>
              <Typography variant="body2" fontWeight={800} color="text.primary">
                {paymentInfo.primary}
              </Typography>
              {paymentInfo.secondary && (
                <Typography variant="caption" color="text.secondary" sx={{ display: 'block', fontSize: '0.68rem', lineHeight: 1.2 }}>
                  {paymentInfo.secondary}
                </Typography>
              )}
            </Box>

            <Box sx={{ textAlign: 'right' }}>
              <Typography variant="caption" color="text.secondary" fontWeight={700} sx={{ display: 'block', textTransform: 'uppercase', fontSize: '0.68rem' }}>
                Order Total
              </Typography>
              <Typography variant="h6" fontWeight={900} sx={{ color: '#16a34a', letterSpacing: '-0.01em' }}>
                {formatCurrency(order.total)}
              </Typography>
            </Box>
          </Box>
        </Box>

        {isReadyForPickup && (
          <Box 
            sx={{ 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'space-between',
              mt: 1.5, 
              bgcolor: 'rgba(139, 92, 246, 0.08)', 
              p: 1.5, 
              borderRadius: 2.5, 
              border: '1px solid rgba(139, 92, 246, 0.3)' 
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.25 }}>
              <i className="fi fi-rr-shop" style={{ fontSize: 16, color: '#7c3aed' }} />
              <Typography variant="caption" sx={{ color: '#6d28d9', fontWeight: 800 }}>
                READY FOR PICK-UP
              </Typography>
            </Box>
            <Typography variant="caption" sx={{ color: '#7c3aed', fontWeight: 700, display: { xs: 'none', sm: 'block' } }}>
              View Pass →
            </Typography>
          </Box>
        )}

        {isCompleted && (() => {
          const allItemsReviewed = Boolean(order.items && order.items.length > 0 && order.items.every(i => i.isReviewed));

          return (
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                mt: 1.5,
                p: 1.5,
                borderRadius: 2.5,
                bgcolor: '#f0fdf4',
                border: '1px solid #bbf7d0'
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.25 }}>
                {allItemsReviewed ? (
                  <i className="fi fi-sr-check-circle" style={{ fontSize: 15, color: '#16a34a' }} />
                ) : (
                  <i className="fi fi-sr-star" style={{ fontSize: 15, color: '#f59e0b' }} />
                )}
                <Typography variant="caption" sx={{ color: '#166534', fontWeight: 700 }}>
                  {allItemsReviewed
                    ? 'Reviews submitted! Thank you for rating your materials.'
                    : (isPickup ? 'Order retrieved & fulfilled. How were your materials?' : 'Order delivered! Help other builders with your feedback.')}
                </Typography>
              </Box>

              <Chip
                size="small"
                label={allItemsReviewed ? 'View Reviews' : 'Review Items'}
                sx={{
                  bgcolor: allItemsReviewed ? '#16a34a' : '#f59e0b',
                  color: '#ffffff',
                  fontWeight: 800,
                  fontSize: '0.7rem',
                  height: 24,
                  cursor: 'pointer',
                  '&:hover': { bgcolor: allItemsReviewed ? '#15803d' : '#d97706' }
                }}
                onClick={(e) => {
                  e.stopPropagation();
                  if (onReviewClick) onReviewClick();
                  else onClick();
                }}
              />
            </Box>
          );
        })()}
        
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mt: 2, pt: 1.5, borderTop: '1px solid', borderColor: 'divider', flexWrap: 'wrap', gap: 1 }}>
          <Button
            size="small"
            variant="text"
            onClick={(e) => {
              e.stopPropagation();
              generateReceiptPDF(order);
            }}
            startIcon={<i className="fi fi-rr-receipt" style={{ fontSize: 13, color: '#4f772d' }} />}
            sx={{ 
              fontWeight: 700, 
              textTransform: 'none', 
              color: '#4f772d', 
              fontSize: '0.78rem', 
              px: 1, 
              py: 0.5, 
              borderRadius: 2,
              '&:hover': { bgcolor: 'rgba(79, 119, 45, 0.08)' } 
            }}
          >
            Download Receipt (PDF)
          </Button>

          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75, color: 'text.secondary', fontSize: '0.8rem', fontWeight: 700 }}>
            <span>View Full Details</span>
            <i className="fi fi-rr-arrow-right" style={{ fontSize: 12, marginTop: 1 }} />
          </Box>
        </Box>
      </CardActionArea>
    </Card>
  );
};

const OrdersPage = () => {
  const navigate = useNavigate();
  const { token, user } = useAuth();

  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState('all');

  const fetchMyOrders = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const API_URL = import.meta.env.VITE_API_URL || '';
      const res = await axios.get(`${API_URL}/api/customer/orders/my`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.data.success) {
        setOrders(res.data.data || []);
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
  }, [token]);

  useEffect(() => {
    if (token) {
      fetchMyOrders();
    } else {
      setLoading(false);
      setError('You are not logged in. Please log in to view your orders.');
    }
  }, [token, fetchMyOrders]);

  useEffect(() => {
    if (!token) return;
    const API_URL = import.meta.env.VITE_API_URL || '';
    const socket = io(API_URL, {
      auth: { user }
    });

    if (user?.id) {
      socket.emit('join_room', `user_${user.id}`);
    }

    socket.on('order_status_updated', () => {
      fetchMyOrders();
    });

    socket.on('order_ready_for_pickup', () => {
      fetchMyOrders();
    });

    return () => socket.close();
  }, [user, token, fetchMyOrders]);

  const stats = useMemo(() => {
    const total = orders.length;
    const completed = orders.filter((o) => {
      const s = (o.status || '').toLowerCase();
      return s === 'delivered' || s === 'completed';
    }).length;
    const inProgress = orders.filter((o) => {
      const s = (o.status || '').toLowerCase();
      return ['pending', 'processing', 'finance_verified', 'ready_for_pickup', 'out_for_delivery', 'shipped'].includes(s);
    }).length;
    const totalSpent = orders
      .filter((o) => (o.status || '').toLowerCase() !== 'cancelled')
      .reduce((acc, o) => acc + Number(o.total || 0), 0);

    return { total, completed, inProgress, totalSpent };
  }, [orders]);

  const tabCounts = useMemo(() => {
    return {
      all: orders.length,
      in_progress: orders.filter((o) => {
        const s = (o.status || '').toLowerCase();
        return ['pending', 'processing', 'finance_verified', 'ready_for_pickup', 'out_for_delivery', 'shipped'].includes(s);
      }).length,
      ready_for_pickup: orders.filter((o) => {
        const isPickup = (o.fulfillmentType || '').toLowerCase() === 'pickup';
        return isPickup && (o.status || '').toLowerCase() === 'ready_for_pickup';
      }).length,
      completed: orders.filter((o) => {
        const s = (o.status || '').toLowerCase();
        return s === 'delivered' || s === 'completed';
      }).length,
      cancelled: orders.filter((o) => ['cancelled', 'rejected'].includes((o.status || '').toLowerCase())).length,
    };
  }, [orders]);

  const filteredOrders = useMemo(() => {
    return orders.filter((o) => {
      const s = (o.status || '').toLowerCase();
      const isPickup = (o.fulfillmentType || '').toLowerCase() === 'pickup';

      let matchesTab = true;
      if (activeTab === 'in_progress') {
        matchesTab = ['pending', 'processing', 'finance_verified', 'ready_for_pickup', 'out_for_delivery', 'shipped'].includes(s);
      } else if (activeTab === 'ready_for_pickup') {
        matchesTab = isPickup && s === 'ready_for_pickup';
      } else if (activeTab === 'completed') {
        matchesTab = s === 'delivered' || s === 'completed';
      } else if (activeTab === 'cancelled') {
        matchesTab = s === 'cancelled' || s === 'rejected';
      }

      const searchLower = searchTerm.trim().toLowerCase();
      const matchesSearch =
        !searchLower ||
        String(o.id).includes(searchLower) ||
        `#ord-${String(o.id).padStart(4, '0')}`.toLowerCase().includes(searchLower) ||
        (o.items || []).some((item) => item.product?.name?.toLowerCase().includes(searchLower)) ||
        (o.paymentMode || '').toLowerCase().includes(searchLower) ||
        (o.status || '').toLowerCase().includes(searchLower) ||
        (o.fulfillmentType || '').toLowerCase().includes(searchLower);

      return matchesTab && matchesSearch;
    });
  }, [orders, searchTerm, activeTab]);

  return (
    <Box sx={{ animation: 'fadeIn 0.35s ease-in-out', pb: 10, maxWidth: 1200, mx: 'auto', px: { xs: 1.5, sm: 2.5, md: 0 } }}>
      

      <Box sx={{ mb: 3.5 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          
          <Box>
            <Typography variant="h4" fontWeight={900} color="text.primary" sx={{ letterSpacing: '-0.02em', fontSize: { xs: '1.5rem', sm: '2rem' } }}>
              My Orders
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Track real-time fabrication, and dispatch progress for your roofing materials.
            </Typography>
          </Box>
        </Box>
      </Box>

      {orders.some((o) => (o.fulfillmentType || '').toLowerCase() === 'pickup' && o.status?.toLowerCase() === 'ready_for_pickup') && (
        <Paper
          elevation={0}
          sx={{
            mb: 3.5,
            p: 2.5,
            borderRadius: 3.5,
            bgcolor: 'rgba(124, 58, 237, 0.05)',
            border: '2px solid #8b5cf6',
            boxShadow: '0 8px 24px rgba(139, 92, 246, 0.12)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: 2
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Avatar sx={{ bgcolor: '#7c3aed', color: '#ffffff', width: 44, height: 44 }}>
              <i className="fi fi-rr-shop" style={{ fontSize: 20 }} />
            </Avatar>
            <Box>
              <Typography variant="subtitle2" fontWeight={800} color="#6d28d9">
                Signal Transmitted: Your Order is Ready for Pick-up!
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mt: 0.25 }}>
                Pick-UP Your Order in our plant <strong>379 Aguinaldo Highway Anabu 1-C, Imus City, Cavite</strong>. Click below to view your digital handover pass.
              </Typography>
            </Box>
          </Box>
          <Button
            variant="contained"
            size="small"
            onClick={() => setActiveTab('ready_for_pickup')}
            sx={{
              bgcolor: '#7c3aed',
              textTransform: 'none',
              fontWeight: 700,
              borderRadius: 2,
              px: 2,
              '&:hover': { bgcolor: '#6d28d9' }
            }}
          >
            Filter Ready Orders
          </Button>
        </Paper>
      )}

      {!loading && !error && (
        <Box 
          sx={{ 
            display: 'grid', 
            gridTemplateColumns: { xs: '1fr 1fr', md: 'repeat(4, 1fr)' }, 
            gap: 2, 
            mb: 3.5 
          }}
        >
          {/* Total Orders */}
          <Paper 
            elevation={0} 
            className="mpi-cust-kpi-card"
            onClick={() => setActiveTab('all')}
            sx={{ 
              p: { xs: 2, sm: 2.25 }, 
              borderRadius: 3.5, 
              border: '1px solid', 
              borderColor: activeTab === 'all' ? 'rgba(59, 130, 246, 0.4)' : 'divider', 
              borderTop: '3px solid #3b82f6',
              bgcolor: 'background.paper',
              boxShadow: '0 4px 18px -6px rgba(0,0,0,0.06)',
              cursor: 'pointer',
              display: 'flex',
              flexDirection: 'column',
              gap: 1.5,
            }}
          >
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <Box
                className="mpi-cust-badge"
                sx={{
                  width: 48,
                  height: 48,
                  borderRadius: 3,
                  bgcolor: 'rgba(59, 130, 246, 0.08)',
                  border: '1px solid rgba(59, 130, 246, 0.22)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                  boxShadow: '0 2px 8px rgba(59, 130, 246, 0.12)'
                }}
              >
                <CustomCustomerTotalOrdersIcon size={28} />
              </Box>
              <Chip
                label="All-Time"
                size="small"
                sx={{
                  fontSize: '0.68rem',
                  fontWeight: 700,
                  height: 22,
                  bgcolor: 'rgba(59, 130, 246, 0.08)',
                  color: '#2563eb',
                  border: '1px solid rgba(59, 130, 246, 0.18)',
                  letterSpacing: '0.02em',
                  textTransform: 'uppercase'
                }}
              />
            </Box>
            <Box>
              <Typography 
                variant="h5" 
                fontWeight={900} 
                color="text.primary"
                sx={{ fontSize: { xs: '1.45rem', sm: '1.75rem' }, lineHeight: 1.15 }}
              >
                {stats.total}
              </Typography>
              <Typography 
                variant="caption" 
                color="text.secondary" 
                fontWeight={700} 
                sx={{ textTransform: 'uppercase', fontSize: '0.7rem', letterSpacing: 0.6, mt: 0.5, display: 'block' }}
              >
                Total Orders
              </Typography>
            </Box>
          </Paper>

          {/* In Progress */}
          <Paper 
            elevation={0} 
            className="mpi-cust-kpi-card"
            onClick={() => setActiveTab('in_progress')}
            sx={{ 
              p: { xs: 2, sm: 2.25 }, 
              borderRadius: 3.5, 
              border: '1px solid', 
              borderColor: activeTab === 'in_progress' ? 'rgba(245, 158, 11, 0.4)' : 'divider', 
              borderTop: '3px solid #f59e0b',
              bgcolor: 'background.paper',
              boxShadow: '0 4px 18px -6px rgba(0,0,0,0.06)',
              cursor: 'pointer',
              display: 'flex',
              flexDirection: 'column',
              gap: 1.5,
            }}
          >
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <Box
                className="mpi-cust-badge"
                sx={{
                  width: 48,
                  height: 48,
                  borderRadius: 3,
                  bgcolor: 'rgba(245, 158, 11, 0.08)',
                  border: '1px solid rgba(245, 158, 11, 0.22)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                  boxShadow: '0 2px 8px rgba(245, 158, 11, 0.12)'
                }}
              >
                <CustomCustomerInProgressIcon size={28} />
              </Box>
              <Chip
                label="Active Queue"
                size="small"
                sx={{
                  fontSize: '0.68rem',
                  fontWeight: 700,
                  height: 22,
                  bgcolor: 'rgba(245, 158, 11, 0.08)',
                  color: '#d97706',
                  border: '1px solid rgba(245, 158, 11, 0.18)',
                  letterSpacing: '0.02em',
                  textTransform: 'uppercase'
                }}
              />
            </Box>
            <Box>
              <Typography 
                variant="h5" 
                fontWeight={900} 
                sx={{ color: '#d97706', fontSize: { xs: '1.45rem', sm: '1.75rem' }, lineHeight: 1.15 }}
              >
                {stats.inProgress}
              </Typography>
              <Typography 
                variant="caption" 
                color="text.secondary" 
                fontWeight={700} 
                sx={{ textTransform: 'uppercase', fontSize: '0.7rem', letterSpacing: 0.6, mt: 0.5, display: 'block' }}
              >
                In Progress
              </Typography>
            </Box>
          </Paper>

          {/* Completed */}
          <Paper 
            elevation={0} 
            className="mpi-cust-kpi-card"
            onClick={() => setActiveTab('completed')}
            sx={{ 
              p: { xs: 2, sm: 2.25 }, 
              borderRadius: 3.5, 
              border: '1px solid', 
              borderColor: activeTab === 'completed' ? 'rgba(16, 185, 129, 0.4)' : 'divider', 
              borderTop: '3px solid #10b981',
              bgcolor: 'background.paper',
              boxShadow: '0 4px 18px -6px rgba(0,0,0,0.06)',
              cursor: 'pointer',
              display: 'flex',
              flexDirection: 'column',
              gap: 1.5,
            }}
          >
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <Box
                className="mpi-cust-badge"
                sx={{
                  width: 48,
                  height: 48,
                  borderRadius: 3,
                  bgcolor: 'rgba(16, 185, 129, 0.08)',
                  border: '1px solid rgba(16, 185, 129, 0.22)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                  boxShadow: '0 2px 8px rgba(16, 185, 129, 0.12)'
                }}
              >
                <CustomCustomerCompletedIcon size={28} />
              </Box>
              <Chip
                label="Fulfilled"
                size="small"
                sx={{
                  fontSize: '0.68rem',
                  fontWeight: 700,
                  height: 22,
                  bgcolor: 'rgba(16, 185, 129, 0.08)',
                  color: '#059669',
                  border: '1px solid rgba(16, 185, 129, 0.18)',
                  letterSpacing: '0.02em',
                  textTransform: 'uppercase'
                }}
              />
            </Box>
            <Box>
              <Typography 
                variant="h5" 
                fontWeight={900} 
                sx={{ color: '#16a34a', fontSize: { xs: '1.45rem', sm: '1.75rem' }, lineHeight: 1.15 }}
              >
                {stats.completed}
              </Typography>
              <Typography 
                variant="caption" 
                color="text.secondary" 
                fontWeight={700} 
                sx={{ textTransform: 'uppercase', fontSize: '0.7rem', letterSpacing: 0.6, mt: 0.5, display: 'block' }}
              >
                Completed
              </Typography>
            </Box>
          </Paper>

          {/* Total Spent */}
          <Paper 
            elevation={0} 
            className="mpi-cust-kpi-card"
            sx={{ 
              p: { xs: 2, sm: 2.25 }, 
              borderRadius: 3.5, 
              border: '1px solid', 
              borderColor: 'divider', 
              borderTop: '3px solid #4f772d',
              bgcolor: 'background.paper',
              boxShadow: '0 4px 18px -6px rgba(0,0,0,0.06)',
              display: 'flex',
              flexDirection: 'column',
              gap: 1.5,
            }}
          >
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <Box
                className="mpi-cust-badge"
                sx={{
                  width: 48,
                  height: 48,
                  borderRadius: 3,
                  bgcolor: 'rgba(79, 119, 45, 0.08)',
                  border: '1px solid rgba(79, 119, 45, 0.22)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                  boxShadow: '0 2px 8px rgba(79, 119, 45, 0.12)'
                }}
              >
                <CustomCustomerTotalSpentIcon size={28} />
              </Box>
              <Chip
                label="Investment"
                size="small"
                sx={{
                  fontSize: '0.68rem',
                  fontWeight: 700,
                  height: 22,
                  bgcolor: 'rgba(79, 119, 45, 0.08)',
                  color: '#4f772d',
                  border: '1px solid rgba(79, 119, 45, 0.18)',
                  letterSpacing: '0.02em',
                  textTransform: 'uppercase'
                }}
              />
            </Box>
            <Box sx={{ minWidth: 0 }}>
              <Typography 
                variant="h5" 
                fontWeight={900} 
                color="text.primary"
                noWrap
                sx={{ fontSize: { xs: '1.2rem', sm: '1.4rem', md: '1.6rem' }, lineHeight: 1.15 }}
                title={formatCurrency(stats.totalSpent)}
              >
                {formatCurrency(stats.totalSpent)}
              </Typography>
              <Typography 
                variant="caption" 
                color="text.secondary" 
                fontWeight={700} 
                sx={{ textTransform: 'uppercase', fontSize: '0.7rem', letterSpacing: 0.6, mt: 0.5, display: 'block' }}
              >
                Total Spent
              </Typography>
            </Box>
          </Paper>
        </Box>
      )}

      <Box sx={{ mb: 2.5 }}>
        <TextField
          fullWidth
          placeholder="Search by Order ID (#0022), roofing profile name, or payment method…"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <i className="fi fi-rr-search" style={{ fontSize: 16, color: '#64748b' }} />
              </InputAdornment>
            ),
            endAdornment: searchTerm ? (
              <InputAdornment position="end">
                <IconButton size="small" onClick={() => setSearchTerm('')}>
                  <i className="fi fi-rr-cross-small" style={{ fontSize: 16 }} />
                </IconButton>
              </InputAdornment>
            ) : null,
          }}
          sx={{ 
            bgcolor: 'background.paper', 
            borderRadius: 2.5,
            '& .MuiOutlinedInput-root': {
              borderRadius: 2.5,
              borderColor: 'divider'
            }
          }}
        />
      </Box>

      <Box
        sx={{
          mb: 3.5,
          display: 'flex',
          overflowX: 'auto',
          pb: 0.5,
          gap: 1.25,
          WebkitOverflowScrolling: 'touch',
          '&::-webkit-scrollbar': { display: 'none' },
          msOverflowStyle: 'none',
          scrollbarWidth: 'none',
        }}
      >
        {FILTER_TABS.map((tab) => {
          const count = tabCounts[tab.id] || 0;
          const isActive = activeTab === tab.id;

          return (
            <Chip
              key={tab.id}
              label={`${tab.label} (${count})`}
              onClick={() => setActiveTab(tab.id)}
              sx={{
                fontWeight: 700,
                fontSize: '0.8rem',
                py: 2,
                px: 1,
                borderRadius: 2.5,
                flexShrink: 0,
                cursor: 'pointer',
                bgcolor: isActive ? '#4f772d' : 'background.paper',
                color: isActive ? '#ffffff' : 'text.primary',
                border: '1px solid',
                borderColor: isActive ? '#4f772d' : 'divider',
                boxShadow: isActive ? '0 4px 12px rgba(79, 119, 45, 0.25)' : 'none',
                transition: 'all 0.2s',
                '&:hover': {
                  bgcolor: isActive ? '#3d5c22' : 'action.hover'
                }
              }}
            />
          );
        })}
      </Box>

      {loading ? (
        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', py: 15, gap: 2 }}>
          <CircularProgress sx={{ color: '#4f772d' }} />
          <Typography variant="body2" color="text.secondary">Loading your orders…</Typography>
        </Box>
      ) : error ? (
        <Alert 
          severity="error" 
          sx={{ borderRadius: 3 }}
          action={<Button color="inherit" size="small" onClick={fetchMyOrders}>Try Again</Button>}
        >
          {error}
        </Alert>
      ) : filteredOrders.length === 0 ? (
        <Paper 
          elevation={0} 
          sx={{ 
            p: 8, 
            textAlign: 'center', 
            borderRadius: 4, 
            border: '1px solid', 
            borderColor: 'divider', 
            bgcolor: 'background.paper' 
          }}
        >
          <Box sx={{ width: 64, height: 64, borderRadius: '50%', bgcolor: 'grey.100', display: 'flex', alignItems: 'center', justifyContent: 'center', mx: 'auto', mb: 2 }}>
            <i className="fi fi-rr-search-alt" style={{ fontSize: 26, color: '#94a3b8' }} />
          </Box>
          <Typography variant="h5" fontWeight={900} gutterBottom>
            {orders.length === 0 ? "You haven't placed any orders yet" : 'No orders found'}
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3.5, maxWidth: 420, mx: 'auto' }}>
            {orders.length === 0
              ? 'Customize your first roofing profile or browse our catalog to get started.'
              : 'No orders matched your active filter or search keywords. Try selecting another tab or clearing search.'}
          </Typography>
          {orders.length === 0 ? (
            <Button 
              variant="contained" 
              onClick={() => navigate('/dashboard')}
              sx={{ borderRadius: 2.5, textTransform: 'none', fontWeight: 700, bgcolor: '#4f772d', '&:hover': { bgcolor: '#3d5c22' }, px: 3, py: 1 }}
            >
              Browse Roofing Catalog
            </Button>
          ) : (
            <Button 
              variant="outlined" 
              onClick={() => {
                setActiveTab('all');
                setSearchTerm('');
              }}
              sx={{ borderRadius: 2.5, textTransform: 'none', fontWeight: 700 }}
            >
              Reset Filters
            </Button>
          )}
        </Paper>
      ) : (
        <Box>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Typography variant="body2" color="text.secondary" fontWeight={600}>
              Showing <strong>{filteredOrders.length}</strong> of <strong>{orders.length}</strong> {orders.length === 1 ? 'order' : 'orders'}
            </Typography>
          </Box>

          <Stack spacing={2.5}>
            {filteredOrders.map((order) => (
              <OrderCard
                key={order.id}
                order={order}
                onClick={() => navigate(`/order/${order.id}`)}
                onReviewClick={() => navigate(`/order/${order.id}`)}
              />
            ))}
          </Stack>
        </Box>
      )}
    </Box>
  );
};

export default OrdersPage;
