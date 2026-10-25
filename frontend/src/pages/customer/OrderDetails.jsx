import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';
import { generateReceiptPDF } from '../../utils/documentGenerator';
import {
  Box,
  Typography,
  Button,
  Paper,
  CircularProgress,
  Avatar,
  Chip,
  Rating,
  TextField,
  IconButton,
  Modal,
  Stack,
  Divider,
  Alert,
  Tooltip,
  Snackbar
} from '@mui/material';
import CancelIcon from '@mui/icons-material/Cancel';
import StarIcon from '@mui/icons-material/Star';
import { io } from 'socket.io-client';

const deliveryStatusSteps = [
  { key: 'pending', label: 'Order Placed', subtitle: 'Received', iconClass: 'fi fi-rr-time-fast' },
  { key: 'processing', label: 'Fabricating / Packing', subtitle: 'Plant Production', iconClass: 'fi fi-rr-box' },
  { key: 'out_for_delivery', label: 'Out for Delivery', subtitle: 'Fleet Dispatch', iconClass: 'fi fi-rr-truck-side' },
  { key: 'delivered', label: 'Delivered', subtitle: 'Handed Over', iconClass: 'fi fi-sr-check-circle' }
];

const pickupStatusSteps = [
  { key: 'pending', label: 'Order Placed', subtitle: 'Received', iconClass: 'fi fi-rr-time-fast' },
  { key: 'processing', label: 'Fabricating / Staging', subtitle: 'Plant Production', iconClass: 'fi fi-rr-box' },
  { key: 'ready_for_pickup', label: 'Ready for Pick-up', subtitle: 'Staged at Dock 1', iconClass: 'fi fi-rr-shop' },
  { key: 'completed', label: 'Picked Up', subtitle: 'Retrieval Complete', iconClass: 'fi fi-sr-check-circle' }
];

const getOrderStatusMeta = (status, fulfillmentType) => {
  const s = (status || '').toLowerCase();
  const isPickup = (fulfillmentType || '').toLowerCase() === 'pickup';

  if (s === 'cancelled' || s === 'rejected') {
    return {
      statusKey: 'cancelled',
      label: s === 'rejected' ? 'Order Rejected' : 'Order Cancelled',
      shortLabel: s === 'rejected' ? 'Rejected' : 'Cancelled',
      description: s === 'rejected' ? 'This order was rejected by sales staff and forwarded to Finance.' : 'This order was cancelled and will not be fulfilled.',
      badgeColor: '#dc2626',
      badgeBg: 'rgba(220, 38, 38, 0.08)',
      badgeBorder: 'rgba(220, 38, 38, 0.25)',
      icon: 'fi fi-rr-cross-circle',
      stepIndex: -1,
      isTerminal: true
    };
  }

  if (s === 'completed' || (isPickup && s === 'delivered')) {
    return {
      statusKey: 'completed',
      label: isPickup ? 'Picked Up & Completed' : 'Delivered & Completed',
      shortLabel: isPickup ? 'Picked Up' : 'Completed',
      description: isPickup 
        ? 'All items have been verified, signed for, and picked up from Mega Pacific Plant'
        : 'Your order was successfully delivered and received.',
      badgeColor: '#16a34a',
      badgeBg: 'rgba(22, 163, 74, 0.08)',
      badgeBorder: 'rgba(22, 163, 74, 0.25)',
      icon: 'fi fi-sr-check-circle',
      stepIndex: 3,
      isTerminal: true
    };
  }

  if (s === 'delivered') {
    return {
      statusKey: 'delivered',
      label: 'Delivered Successfully',
      shortLabel: 'Delivered',
      description: 'Your roofing order has been delivered to your destination address.',
      badgeColor: '#16a34a',
      badgeBg: 'rgba(22, 163, 74, 0.08)',
      badgeBorder: 'rgba(22, 163, 74, 0.25)',
      icon: 'fi fi-sr-check-circle',
      stepIndex: 3,
      isTerminal: true
    };
  }

  if (isPickup && s === 'ready_for_pickup') {
    return {
      statusKey: 'ready_for_pickup',
      label: 'Ready for Pick-up at Plant',
      shortLabel: 'Ready for Pick-up',
      description: 'Your sheet order is banded, inspected, and staged at Plant Dock 1. Please present your pass upon arrival.',
      badgeColor: '#7c3aed',
      badgeBg: 'rgba(124, 58, 237, 0.08)',
      badgeBorder: 'rgba(124, 58, 237, 0.3)',
      icon: 'fi fi-rr-shop',
      stepIndex: 2,
      isTerminal: false
    };
  }

  if (!isPickup && (s === 'out_for_delivery' || s === 'shipped')) {
    return {
      statusKey: 'out_for_delivery',
      label: 'Out for Delivery',
      shortLabel: 'In Transit',
      description: 'Your materials are currently loaded and in transit with Mega Pacific Logistics.',
      badgeColor: '#2563eb',
      badgeBg: 'rgba(37, 99, 235, 0.08)',
      badgeBorder: 'rgba(37, 99, 235, 0.25)',
      icon: 'fi fi-rr-truck-side',
      stepIndex: 2,
      isTerminal: false
    };
  }

  if (s === 'processing' || s === 'finance_verified') {
    return {
      statusKey: 'processing',
      label: isPickup ? 'Fabrication & Staging in Progress' : 'Fabrication & Packing in Progress',
      shortLabel: 'Fabricating',
      description: isPickup
        ? 'Plant production crew is cutting, inspecting, and banding your sheets for dock staging.'
        : 'Plant crew is custom-cutting sheets and packaging for logistics transit.',
      badgeColor: '#d97706',
      badgeBg: 'rgba(217, 119, 6, 0.08)',
      badgeBorder: 'rgba(217, 119, 6, 0.25)',
      icon: 'fi fi-rr-box',
      stepIndex: 1,
      isTerminal: false
    };
  }

  return {
    statusKey: 'pending',
    label: 'Order Placed & Awaiting Confirmation',
    shortLabel: 'Order Placed',
    description: 'Your order details have been received and logged in the dispatch production queue.',
    badgeColor: '#0284c7',
    badgeBg: 'rgba(2, 132, 199, 0.08)',
    badgeBorder: 'rgba(2, 132, 199, 0.25)',
    icon: 'fi fi-rr-time-fast',
    stepIndex: 0,
    isTerminal: false
  };
};

const getColorHex = (colorName) => {
  if (!colorName) return null;
  const c = colorName.toLowerCase();
  if (c.includes('red') || c.includes('spanish') || c.includes('tile')) return '#b91c1c';
  if (c.includes('blue') || c.includes('ocean')) return '#1d4ed8';
  if (c.includes('green') || c.includes('baguio') || c.includes('forest')) return '#15803d';
  if (c.includes('gray') || c.includes('grey') || c.includes('marshall')) return '#475569';
  if (c.includes('brown') || c.includes('chocolate')) return '#78350f';
  if (c.includes('white') || c.includes('beige')) return '#e2e8f0';
  if (c.includes('black') || c.includes('charcoal')) return '#18181b';
  if (c.includes('orange') || c.includes('terracotta') || c.includes('copper')) return '#c2410c';
  return '#64748b';
};

const OrderDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { token } = useAuth();

  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [copyFeedback, setCopyFeedback] = useState(false);

  const [reviewModalOpen, setReviewModalOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [reviewForm, setReviewForm] = useState({ rating: 5, title: '', comment: '', images: [] });
  const [submittingReview, setSubmittingReview] = useState(false);
  const [reviewSuccess, setReviewSuccess] = useState('');
  const [reviewError, setReviewError] = useState('');

  const [viewReviewModalOpen, setViewReviewModalOpen] = useState(false);
  const [selectedReviewItem, setSelectedReviewItem] = useState(null);
  const [previewReviewPhoto, setPreviewReviewPhoto] = useState(null);

  const handleOpenViewReview = async (item) => {
    setSelectedProduct(item.product || { id: item.productId, name: item.product?.name });
    if (item.review) {
      setSelectedReviewItem(item);
      setViewReviewModalOpen(true);
    } else {
      try {
        const API_URL = import.meta.env.VITE_API_URL || '';
        const res = await axios.get(`${API_URL}/api/customer/reviews/product/${item.productId}`);
        if (res.data.success && res.data.data) {
          const myReview = res.data.data.find(r => r.orderId === order?.id);
          setSelectedReviewItem({ ...item, review: myReview || null });
        } else {
          setSelectedReviewItem(item);
        }
      } catch (err) {
        console.warn('Could not load specific review details:', err);
        setSelectedReviewItem(item);
      }
      setViewReviewModalOpen(true);
    }
  };

  const fetchOrder = useCallback(async () => {
    try {
      const API_URL = import.meta.env.VITE_API_URL || '';
      const res = await axios.get(`${API_URL}/api/customer/orders/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.data.success) {
        setOrder(res.data.data);
      }
    } catch (err) {
      console.error('Failed to fetch order', err);
      setError('Could not retrieve order details. Please try again.');
    } finally {
      setLoading(false);
    }
  }, [id, token]);

  useEffect(() => {
    fetchOrder();
  }, [fetchOrder]);

  useEffect(() => {
    if (!id) return;
    const API_URL = import.meta.env.VITE_API_URL || '';
    const socket = io(API_URL);

    const handleStatusSync = (data) => {
      if (!data || Number(data.orderId) === Number(id)) {
        fetchOrder();
      }
    };

    socket.on('order_status_updated', handleStatusSync);
    socket.on('order_ready_for_pickup', handleStatusSync);

    return () => socket.close();
  }, [id, fetchOrder]);

  if (loading) {
    return (
      <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', py: 15, gap: 2 }}>
        <CircularProgress sx={{ color: '#4f772d' }} />
        <Typography variant="body2" color="text.secondary">Loading order details...</Typography>
      </Box>
    );
  }

  if (error || !order) {
    return (
      <Box sx={{ py: 10, textAlign: 'center', maxWidth: 480, mx: 'auto', px: 2 }}>
        <Avatar sx={{ bgcolor: 'error.50', color: 'error.main', width: 64, height: 64, mx: 'auto', mb: 2 }}>
          <CancelIcon fontSize="large" />
        </Avatar>
        <Typography variant="h5" fontWeight="bold" gutterBottom>{error || 'Order not found'}</Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
          We could not locate this order in your customer records. Please verify the order reference or return to your orders list.
        </Typography>
        <Button 
          variant="contained" 
          onClick={() => navigate('/orders')}
          sx={{ borderRadius: 2.5, textTransform: 'none', fontWeight: 700, bgcolor: '#4f772d', '&:hover': { bgcolor: '#3d5c22' } }}
        >
          Return to Orders
        </Button>
      </Box>
    );
  }

  const isPickup = (order.fulfillmentType || '').toLowerCase() === 'pickup';
  const statusMeta = getOrderStatusMeta(order.status, order.fulfillmentType);
  const currentSteps = isPickup ? pickupStatusSteps : deliveryStatusSteps;
  const currentStatusIndex = statusMeta.stepIndex;
  const isReadyForPickup = isPickup && statusMeta.statusKey === 'ready_for_pickup';
  const isCompleted = statusMeta.statusKey === 'completed' || statusMeta.statusKey === 'delivered';
  const isCancelled = statusMeta.statusKey === 'cancelled';

  const formattedOrderId = `#ORD-${order.id.toString().padStart(4, '0')}`;
  const totalItemsCount = order.items?.reduce((sum, it) => sum + (it.quantity || 1), 0) || 0;

  const calculatedItemsSubtotal = (order.items || []).reduce((sum, item) => {
    const len = item.customLength ? parseFloat(item.customLength) : 1;
    const unitPrice = parseFloat(item.price || item.unitPrice || 0);
    return sum + (unitPrice * len * (item.quantity || 1));
  }, 0);
  const orderTotal = Number(order.total || 0);
  const calculatedShippingFee = isPickup ? 0 : Math.max(0, Math.round((orderTotal - calculatedItemsSubtotal) * 100) / 100);
  const isCOD50 = (order.paymentMode || '').includes('50%') || (order.paymentStatus || '').includes('50%');
  const downpaymentAmount = isCOD50 ? (orderTotal * 0.5) : orderTotal;
  const balanceAmount = isCOD50 ? (orderTotal * 0.5) : 0;

  const handleCopyOrderId = () => {
    navigator.clipboard.writeText(formattedOrderId);
    setCopyFeedback(true);
  };

  const handleImageUpload = (e) => {
    const files = Array.from(e.target.files);
    if (reviewForm.images.length + files.length > 3) {
      setReviewError('You can upload up to 3 images.');
      return;
    }
    setReviewError('');

    files.forEach(file => {
      const reader = new FileReader();
      reader.onloadend = () => {
        setReviewForm(prev => ({
          ...prev,
          images: [...prev.images, reader.result]
        }));
      };
      reader.readAsDataURL(file);
    });
  };

  const removeImage = (indexToRemove) => {
    setReviewForm(prev => ({
      ...prev,
      images: prev.images.filter((_, index) => index !== indexToRemove)
    }));
  };

  const submitReview = async (e) => {
    e.preventDefault();
    setSubmittingReview(true);
    setReviewError('');
    setReviewSuccess('');

    try {
      const API_URL = import.meta.env.VITE_API_URL || '';
      const res = await axios.post(`${API_URL}/api/customer/reviews`, {
        productId: selectedProduct.id,
        rating: reviewForm.rating,
        title: reviewForm.title,
        comment: reviewForm.comment,
        imageUrls: reviewForm.images,
        orderId: order.id
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (res.data.success) {
        setReviewSuccess('Thank you! Your verified review has been submitted.');
        fetchOrder();
        setTimeout(() => {
          setReviewModalOpen(false);
          setReviewSuccess('');
          setReviewForm({ rating: 5, title: '', comment: '', images: [] });
        }, 1800);
      }
    } catch (err) {
      console.error(err);
      setReviewError(err.response?.data?.message || 'Failed to submit review.');
    } finally {
      setSubmittingReview(false);
    }
  };

  return (
    <Box sx={{ animation: 'fadeIn 0.35s ease-in-out', pb: 8, maxWidth: 1200, mx: 'auto', px: { xs: 1.5, sm: 2.5, md: 0 } }}>
      
      <Box sx={{ mb: 2.5 }}>
        <Button 
          onClick={() => {
            if (window.history.state && window.history.state.idx > 0) {
              navigate(-1);
            } else {
              navigate('/orders');
            }
          }} 
          startIcon={<i className="fi fi-rr-arrow-left" style={{ fontSize: '13px' }} />}
          sx={{ 
            color: 'text.secondary', 
            textTransform: 'none', 
            fontWeight: 600, 
            fontSize: '0.85rem',
            px: 1.5,
            py: 0.6,
            borderRadius: 2,
            bgcolor: 'background.paper',
            border: '1px solid',
            borderColor: 'divider',
            '&:hover': { bgcolor: 'action.hover', color: 'text.primary' }
          }}
        >
          Back to Orders
        </Button>
      </Box>

      <Paper
        elevation={0}
        sx={{
          p: { xs: 2.5, sm: 3.5 },
          borderRadius: 3.5,
          border: '1px solid',
          borderColor: isReadyForPickup ? '#8b5cf6' : 'divider',
          bgcolor: 'background.paper',
          mb: 3.5,
          display: 'flex',
          flexDirection: { xs: 'column', md: 'row' },
          justifyContent: 'space-between',
          alignItems: { xs: 'flex-start', md: 'center' },
          gap: 2.5,
          boxShadow: '0 2px 10px rgba(0,0,0,0.03)'
        }}
      >
        <Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, flexWrap: 'wrap' }}>
            <Typography variant="h4" fontWeight={900} sx={{ letterSpacing: '-0.02em', fontSize: { xs: '1.5rem', sm: '2rem' } }}>
              Order <span style={{ color: '#64748b' }}>{formattedOrderId}</span>
            </Typography>

            <Tooltip title="Copy Order Reference" arrow>
              <IconButton 
                size="small" 
                onClick={handleCopyOrderId}
                sx={{ 
                  bgcolor: 'action.hover', 
                  borderRadius: 2, 
                  p: 0.75,
                  '&:hover': { bgcolor: 'action.selected' }
                }}
              >
                <i className="fi fi-rr-copy" style={{ fontSize: 13, color: '#64748b' }} />
              </IconButton>
            </Tooltip>

            <Chip
              label={isPickup ? 'Store Pick-up' : 'Fleet Delivery'}
              size="small"
              icon={<i className={isPickup ? 'fi fi-rr-shop' : 'fi fi-rr-truck-side'} style={{ fontSize: 13, marginLeft: 6 }} />}
              sx={{
                fontWeight: 700,
                fontSize: '0.75rem',
                bgcolor: isPickup ? 'rgba(124, 58, 237, 0.08)' : 'rgba(37, 99, 235, 0.08)',
                color: isPickup ? '#7c3aed' : '#2563eb',
                border: '1px solid',
                borderColor: isPickup ? 'rgba(124, 58, 237, 0.25)' : 'rgba(37, 99, 235, 0.25)'
              }}
            />

            <Chip
              label={order.paymentStatus === 'paid' ? 'Paid' : 'Payment Pending'}
              size="small"
              icon={<i className={order.paymentStatus === 'paid' ? 'fi fi-sr-check-circle' : 'fi fi-rr-time-fast'} style={{ fontSize: 12, marginLeft: 6 }} />}
              sx={{
                fontWeight: 700,
                fontSize: '0.75rem',
                bgcolor: order.paymentStatus === 'paid' ? 'rgba(22, 163, 74, 0.08)' : 'rgba(217, 119, 6, 0.08)',
                color: order.paymentStatus === 'paid' ? '#16a34a' : '#d97706',
                border: '1px solid',
                borderColor: order.paymentStatus === 'paid' ? 'rgba(22, 163, 74, 0.25)' : 'rgba(217, 119, 6, 0.25)'
              }}
            />
          </Box>

          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mt: 1, flexWrap: 'wrap' }}>
            <Typography variant="body2" color="text.secondary" sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
              <i className="fi fi-rr-calendar" style={{ fontSize: 13 }} />
              Placed on {new Date(order.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
            </Typography>

            {!isPickup && order.estimatedDeliveryDate && (
              <Typography variant="body2" color="text.secondary" sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
                <i className="fi fi-rr-truck-side" style={{ fontSize: 13, color: '#2563eb' }} />
                Target Delivery: <strong>{new Date(order.estimatedDeliveryDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</strong>
              </Typography>
            )}
          </Box>
        </Box>

        <Box 
          sx={{ 
            p: 2, 
            borderRadius: 2.5, 
            bgcolor: statusMeta.badgeBg, 
            border: '1px solid', 
            borderColor: statusMeta.badgeBorder,
            minWidth: { xs: '100%', sm: 260 },
            display: 'flex',
            alignItems: 'center',
            gap: 2
          }}
        >
          <Avatar 
            sx={{ 
              bgcolor: statusMeta.badgeColor, 
              color: '#ffffff', 
              width: 44, 
              height: 44, 
              boxShadow: `0 4px 14px ${statusMeta.badgeColor}33`,
              flexShrink: 0
            }}
          >
            <i className={statusMeta.icon} style={{ fontSize: 20 }} />
          </Avatar>
          <Box sx={{ minWidth: 0, flex: 1 }}>
            <Typography variant="caption" sx={{ textTransform: 'uppercase', fontWeight: 800, letterSpacing: 0.5, color: statusMeta.badgeColor, display: 'block' }}>
              Fulfillment Status
            </Typography>
            <Typography variant="subtitle2" fontWeight={800} sx={{ color: 'text.primary', lineHeight: 1.25 }}>
              {statusMeta.label}
            </Typography>
          </Box>
        </Box>
      </Paper>

      <Paper 
        elevation={0} 
        sx={{ 
          p: { xs: 2.5, sm: 3.5 }, 
          borderRadius: 3.5, 
          border: '1px solid', 
          borderColor: isReadyForPickup ? '#8b5cf6' : 'divider', 
          mb: 3.5, 
          bgcolor: 'background.paper',
          boxShadow: '0 2px 10px rgba(0,0,0,0.03)'
        }}
      >
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3, flexWrap: 'wrap', gap: 1 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <i className="fi fi-rr-route" style={{ fontSize: 18, color: '#4f772d' }} />
            <Typography variant="subtitle1" fontWeight={800} color="text.primary">
              Order Fulfillment Journey
            </Typography>
          </Box>

          <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 600 }}>
            {statusMeta.description}
          </Typography>
        </Box>

        {isCancelled ? (
          <Box sx={{ textAlign: 'center', py: 3, px: 2 }}>
            <Avatar 
              sx={{ 
                bgcolor: order.paymentStatus === 'refunded' ? 'rgba(16, 185, 129, 0.12)' : order.paymentStatus === 'refund_pending' ? 'rgba(245, 158, 11, 0.12)' : 'error.50', 
                color: order.paymentStatus === 'refunded' ? '#10b981' : order.paymentStatus === 'refund_pending' ? '#f59e0b' : 'error.main', 
                width: 58, 
                height: 58, 
                mx: 'auto', 
                mb: 1.5 
              }}
            >
              <i className={order.paymentStatus === 'refunded' ? "fi fi-sr-shield-check" : order.paymentStatus === 'refund_pending' ? "fi fi-rr-time-fast" : "fi fi-rr-cross-circle"} style={{ fontSize: 26 }} />
            </Avatar>
            <Typography variant="h6" fontWeight={800} color={order.paymentStatus === 'refunded' ? '#10b981' : order.paymentStatus === 'refund_pending' ? '#f59e0b' : 'error.main'}>
              {order.paymentStatus === 'refunded' 
                ? 'Payment Refund Completed' 
                : order.paymentStatus === 'refund_pending' 
                  ? 'Order Rejected · Refund in Progress' 
                  : (order.status === 'rejected' ? 'Order Rejected' : 'Order Cancelled')}
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ maxWidth: 520, mx: 'auto', mt: 0.5 }}>
              {order.paymentStatus === 'refunded' 
                ? 'Your payment refund has been processed by our Finance team and returned to your original payment method.' 
                : order.paymentStatus === 'refund_pending' 
                  ? 'This order was rejected by sales staff. Our Finance department is processing your refund via your original payment channel.' 
                  : 'This order is cancelled and will not proceed through dispatch.'}
            </Typography>
            {order.notes && (
              <Typography variant="caption" sx={{ display: 'block', mt: 1, color: 'text.secondary', fontStyle: 'italic' }}>
                Note: {order.notes}
              </Typography>
            )}
          </Box>
        ) : (
          <Box sx={{ position: 'relative', pt: 1, pb: 1 }}>
            <Box 
              sx={{ 
                position: 'absolute', 
                top: { xs: 24, sm: 28 }, 
                left: { xs: '6%', sm: '8%' }, 
                right: { xs: '6%', sm: '8%' }, 
                height: 5, 
                bgcolor: 'grey.100', 
                borderRadius: 3,
                zIndex: 0
              }}
            >
              <Box 
                sx={{ 
                  height: '100%', 
                  bgcolor: isReadyForPickup ? '#7c3aed' : '#16a34a', 
                  borderRadius: 3,
                  transition: 'width 0.8s cubic-bezier(0.4, 0, 0.2, 1)', 
                  width: `${(Math.max(currentStatusIndex, 0) / (currentSteps.length - 1)) * 100}%` 
                }} 
              />
            </Box>

            <Box sx={{ display: 'flex', justifyContent: 'space-between', position: 'relative', zIndex: 1 }}>
              {currentSteps.map((step, index) => {
                const isStepCompleted = index < currentStatusIndex || (isCompleted && index === currentStatusIndex);
                const isCurrentActive = index === currentStatusIndex && !isCompleted;

                let nodeBg = '#ffffff';
                let nodeColor = '#94a3b8';
                let nodeBorder = '2px solid #e2e8f0';

                if (isStepCompleted) {
                  nodeBg = '#16a34a';
                  nodeColor = '#ffffff';
                  nodeBorder = '3px solid #ffffff';
                } else if (isCurrentActive) {
                  nodeBg = isReadyForPickup ? '#7c3aed' : '#4f772d';
                  nodeColor = '#ffffff';
                  nodeBorder = '3px solid #ffffff';
                }

                return (
                  <Box key={step.key} sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: { xs: 72, sm: 110 } }}>
                    <Box
                      sx={{
                        width: { xs: 38, sm: 46 },
                        height: { xs: 38, sm: 46 },
                        borderRadius: '50%',
                        bgcolor: nodeBg,
                        color: nodeColor,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        border: nodeBorder,
                        boxShadow: (isStepCompleted || isCurrentActive) ? '0 4px 12px rgba(0,0,0,0.15)' : 'none',
                        transition: 'all 0.4s ease',
                        position: 'relative'
                      }}
                    >
                      {isCurrentActive && (
                        <Box
                          sx={{
                            position: 'absolute',
                            inset: -4,
                            borderRadius: '50%',
                            border: `2px solid ${isReadyForPickup ? '#7c3aed' : '#4f772d'}`,
                            opacity: 0.5,
                            animation: 'pulse 2s infinite'
                          }}
                        />
                      )}
                      <i 
                        className={isStepCompleted ? 'fi fi-sr-check' : step.iconClass} 
                        style={{ fontSize: isStepCompleted ? 16 : 18 }} 
                      />
                    </Box>

                    <Typography 
                      sx={{ 
                        mt: 1.5, 
                        fontSize: { xs: '0.68rem', sm: '0.82rem' }, 
                        fontWeight: isCurrentActive ? 800 : isStepCompleted ? 700 : 500, 
                        color: isCurrentActive ? (isReadyForPickup ? '#7c3aed' : 'text.primary') : isStepCompleted ? 'text.primary' : 'text.disabled', 
                        textAlign: 'center', 
                        lineHeight: 1.25 
                      }}
                    >
                      {step.label}
                    </Typography>

                    <Typography 
                      variant="caption" 
                      sx={{ 
                        display: { xs: 'none', sm: 'block' },
                        fontSize: '0.7rem', 
                        color: isCurrentActive ? (isReadyForPickup ? '#7c3aed' : '#4f772d') : 'text.secondary',
                        fontWeight: isCurrentActive ? 700 : 400,
                        mt: 0.25
                      }}
                    >
                      {isStepCompleted ? 'Completed' : isCurrentActive ? 'Active Stage' : step.subtitle}
                    </Typography>
                  </Box>
                );
              })}
            </Box>
          </Box>
        )}
      </Paper>

      {isReadyForPickup && (
        <Paper
          elevation={0}
          sx={{
            p: { xs: 2.5, sm: 3.5 },
            borderRadius: 3.5,
            border: '2px solid #8b5cf6',
            bgcolor: 'rgba(139, 92, 246, 0.04)',
            mb: 3.5,
            boxShadow: '0 8px 30px rgba(139, 92, 246, 0.12)',
            position: 'relative',
            overflow: 'hidden'
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 2, flexWrap: 'wrap' }}>
            <Chip
              icon={<i className="fi fi-rr-shop" style={{ fontSize: 13, marginLeft: 6 }} />}
              label="SIGNAL TRANSMITTED • READY FOR PICK-UP"
              sx={{
                bgcolor: '#7c3aed',
                color: '#ffffff',
                fontWeight: 800,
                fontSize: '0.72rem',
                letterSpacing: 0.5
              }}
            />
            <Typography variant="caption" color="text.secondary">
              Verified & Staged by Mega Pacific Logistics Dispatch
            </Typography>
          </Box>

          <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 280px' }, gap: 3, alignItems: 'center' }}>
            <Box>
              <Typography variant="h5" fontWeight={900} sx={{ color: 'text.primary', mb: 1, letterSpacing: '-0.02em' }}>
                Your Order is Ready to Pick-up
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2.5, lineHeight: 1.6 }}>
                Your custom-cut roofing sheets, flashings, and accessories have passed fabrication quality inspection and are bundled at our facility loading bay. You may now dispatch your vehicle for loading and retrieval.
              </Typography>

              <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: 2, mb: 2.5 }}>
                <Box sx={{ p: 2, bgcolor: 'background.paper', borderRadius: 2.5, border: '1px solid', borderColor: 'divider' }}>
                  <Typography variant="caption" fontWeight={700} color="text.secondary" sx={{ textTransform: 'uppercase', display: 'block', mb: 0.5 }}>
                    Plant Address & Loading Bay
                  </Typography>
                  <Typography variant="body2" fontWeight={800} color="text.primary">
                    Mega Pacific Plant — Loading Dock 1
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    Aguinaldo Highway, Imus / Cavite Main Branch
                  </Typography>
                </Box>

                <Box sx={{ p: 2, bgcolor: 'background.paper', borderRadius: 2.5, border: '1px solid', borderColor: 'divider' }}>
                  <Typography variant="caption" fontWeight={700} color="text.secondary" sx={{ textTransform: 'uppercase', display: 'block', mb: 0.5 }}>
                    Pick-up Operating Schedule
                  </Typography>
                  <Typography variant="body2" fontWeight={800} color="text.primary">
                    Monday – Saturday: 8:00 AM – 5:00 PM
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    Dispatch Hotline: (046) 471-2345 / 0917-123-4567
                  </Typography>
                </Box>
              </Box>

              <Box sx={{ p: 1.75, bgcolor: '#fefce8', borderRadius: 2, border: '1px solid #fef08a', display: 'flex', gap: 1.5, alignItems: 'flex-start' }}>
                <i className="fi fi-rr-info" style={{ fontSize: 18, color: '#ca8a04', marginTop: 2 }} />
                <Box>
                  <Typography variant="caption" fontWeight={800} color="#854d0e" display="block">
                    Requirements for Handover:
                  </Typography>
                  <Typography variant="caption" color="#713f12" sx={{ lineHeight: 1.4 }}>
                    1. Valid Government-Issued ID &nbsp;•&nbsp; 2. Digital Order Pass <strong>{formattedOrderId}</strong> &nbsp;•&nbsp; If sending a third-party hauler, provide an authorization letter.
                  </Typography>
                </Box>
              </Box>
            </Box>

            <Paper
              elevation={0}
              sx={{
                p: 3,
                borderRadius: 3.5,
                bgcolor: 'background.paper',
                border: '2px dashed',
                borderColor: 'divider',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                textAlign: 'center'
              }}
            >
              <Avatar sx={{ bgcolor: 'rgba(124, 58, 237, 0.12)', color: '#7c3aed', width: 56, height: 56, mb: 1.5 }}>
                <i className="fi fi-rr-qr" style={{ fontSize: 26 }} />
              </Avatar>
              <Typography variant="caption" color="text.secondary" fontWeight={700} textTransform="uppercase">
                Official Retrieval Pass
              </Typography>
              <Typography variant="h5" fontWeight={900} color="text.primary" sx={{ my: 0.5, letterSpacing: '0.04em' }}>
                {formattedOrderId}
              </Typography>
              <Typography variant="caption" color="text.secondary" sx={{ mb: 2 }}>
                Present this code at Plant Security Gate
              </Typography>
              <Button
                variant="outlined"
                size="small"
                onClick={() => generateReceiptPDF(order)}
                startIcon={<i className="fi fi-rr-receipt" style={{ fontSize: 13 }} />}
                sx={{ borderRadius: 2, textTransform: 'none', fontWeight: 700, width: '100%', borderColor: 'rgba(124, 58, 237, 0.4)', color: '#7c3aed' }}
              >
                Download Pick-up Pass (PDF)
              </Button>
            </Paper>
          </Box>
        </Paper>
      )}

      <Box 
        sx={{ 
          display: 'grid', 
          gridTemplateColumns: { xs: '1fr', lg: '1fr 380px' }, 
          gap: 3.5, 
          alignItems: 'start' 
        }}
      >
        
        <Stack spacing={3.5}>
          
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
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', pb: 2.5, mb: 3, borderBottom: '1px solid', borderColor: 'divider' }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                <i className="fi fi-rr-layers" style={{ fontSize: 18, color: '#4f772d' }} />
                <Typography variant="h6" fontWeight={800} color="text.primary">
                  Ordered Products
                </Typography>
              </Box>
              <Chip 
                label={`${totalItemsCount} ${totalItemsCount === 1 ? 'Item' : 'Items'}`} 
                size="small" 
                sx={{ fontWeight: 700, bgcolor: 'action.hover', color: 'text.secondary' }} 
              />
            </Box>

            {isCompleted && (
              <Box
                sx={{
                  mb: 3,
                  p: 2,
                  borderRadius: 2.5,
                  bgcolor: '#f0fdf4',
                  border: '1px solid #bbf7d0',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 2
                }}
              >
                <Avatar sx={{ bgcolor: '#16a34a', color: '#ffffff', width: 40, height: 40, flexShrink: 0 }}>
                  <i className="fi fi-sr-badge-check" style={{ fontSize: 20 }} />
                </Avatar>
                <Box sx={{ flex: 1, minWidth: 0 }}>
                  <Typography variant="subtitle2" fontWeight={800} sx={{ color: '#15803d', lineHeight: 1.3 }}>
                    {isPickup ? 'Order Received & Picked Up!' : 'Order Successfully Delivered!'}
                  </Typography>
                  <Typography variant="caption" sx={{ color: '#166534', display: 'block', mt: 0.25 }}>
                    Help fellow builders and contractors by sharing your verified product review below.
                  </Typography>
                </Box>
              </Box>
            )}

            <Stack spacing={2.5}>
              {order.items?.map((item) => {
                const colorHex = getColorHex(item.color);
                const itemImg = item.product?.imageUrls?.[0] || item.product?.imageUrl;

                return (
                  <Box 
                    key={item.id} 
                    sx={{ 
                      p: 2.5, 
                      bgcolor: 'background.default', 
                      borderRadius: 2.5, 
                      border: '1px solid', 
                      borderColor: 'divider',
                      display: 'flex',
                      flexDirection: { xs: 'column', sm: 'row' },
                      gap: 2.5,
                      alignItems: { xs: 'flex-start', sm: 'center' },
                      transition: 'border-color 0.2s',
                      '&:hover': { borderColor: 'grey.400' }
                    }}
                  >
                    <Box 
                      sx={{ 
                        width: { xs: '100%', sm: 84 }, 
                        height: 84, 
                        bgcolor: 'background.paper', 
                        borderRadius: 2, 
                        overflow: 'hidden', 
                        display: 'flex', 
                        alignItems: 'center', 
                        justifyContent: 'center', 
                        border: '1px solid', 
                        borderColor: 'divider', 
                        flexShrink: 0 
                      }}
                    >
                      {itemImg ? (
                        <Box 
                          component="img" 
                          src={itemImg} 
                          alt={item.product?.name || 'Roofing Item'} 
                          sx={{ width: '100%', height: '100%', objectFit: 'cover' }} 
                        />
                      ) : (
                        <i className="fi fi-rr-box" style={{ fontSize: 28, color: '#94a3b8' }} />
                      )}
                    </Box>

                    <Box sx={{ flex: 1, minWidth: 0, width: '100%' }}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 1 }}>
                        <Box>
                          <Typography variant="subtitle1" fontWeight={800} color="text.primary" sx={{ lineHeight: 1.25 }}>
                            {item.product?.name || 'Metal Roofing Profile'}
                          </Typography>
                          <Typography variant="caption" color="text.secondary" fontWeight={500}>
                            {item.product?.type || 'Pre-Engineered Steel'}
                          </Typography>
                        </Box>

                        {(() => {
                          const unitPrice = Number(item.price || item.unitPrice || 0);
                          const len = item.customLength ? Number(item.customLength) : 1;
                          const qty = Number(item.quantity) || 1;
                          const itemLineTotal = unitPrice * len * qty;

                          return (
                            <Box sx={{ textAlign: { xs: 'left', sm: 'right' } }}>
                              <Typography variant="h6" fontWeight={900} color="text.primary">
                                ₱{itemLineTotal.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                              </Typography>
                              <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>
                                {item.customLength 
                                  ? `${qty} ${qty === 1 ? 'sheet' : 'sheets'} × ${len}m (₱${unitPrice.toFixed(2)}/m)`
                                  : `Qty: ${qty} pcs (₱${unitPrice.toFixed(2)} each)`}
                              </Typography>
                            </Box>
                          );
                        })()}
                      </Box>

                      <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mt: 1.5 }}>
                        {item.customLength && (
                          <Chip 
                            size="small" 
                            icon={<i className="fi fi-rr-ruler" style={{ fontSize: 11, marginLeft: 6 }} />}
                            label={`${item.customLength}m Length`} 
                            sx={{ fontWeight: 700, fontSize: '0.72rem', height: 24, bgcolor: 'background.paper', border: '1px solid', borderColor: 'divider' }} 
                          />
                        )}

                        {(item.thickness || item.variantName || item.variant?.name) && (
                          <Chip 
                            size="small" 
                            label={item.thickness || item.variantName || item.variant?.name} 
                            sx={{ fontWeight: 600, fontSize: '0.72rem', height: 24, bgcolor: 'background.paper', border: '1px solid', borderColor: 'divider' }} 
                          />
                        )}

                        {item.color && (
                          <Chip 
                            size="small" 
                            avatar={colorHex ? <Box sx={{ width: 10, height: 10, borderRadius: '50%', bgcolor: colorHex, ml: 1 }} /> : null}
                            label={item.color} 
                            sx={{ fontWeight: 600, fontSize: '0.72rem', height: 24, bgcolor: 'background.paper', border: '1px solid', borderColor: 'divider' }} 
                          />
                        )}
                      </Box>

                      {isCompleted && (
                        <Box sx={{ mt: 2, pt: 1.5, borderTop: '1px dashed', borderColor: 'divider', display: 'flex', justifyContent: 'flex-end', alignItems: 'center', gap: 1 }}>
                          {item.isReviewed ? (
                            <Button 
                              variant="outlined" 
                              size="small" 
                              startIcon={<i className="fi fi-rr-eye" style={{ color: '#16a34a', fontSize: 13 }} />}
                              sx={{ 
                                borderRadius: 2, 
                                textTransform: 'none', 
                                py: 0.5, 
                                px: 2, 
                                fontWeight: 700, 
                                fontSize: '0.75rem',
                                borderColor: '#86efac',
                                color: '#15803d',
                                bgcolor: '#f0fdf4',
                                boxShadow: '0 1px 2px rgba(22, 163, 74, 0.08)',
                                '&:hover': { bgcolor: '#dcfce7', borderColor: '#4ade80' }
                              }}
                              onClick={() => handleOpenViewReview(item)}
                            >
                              View Review
                            </Button>
                          ) : (
                            <Button 
                              variant="outlined" 
                              size="small" 
                              startIcon={<i className="fi fi-sr-star" style={{ color: '#f59e0b', fontSize: 13 }} />}
                              sx={{ 
                                borderRadius: 2, 
                                textTransform: 'none', 
                                py: 0.5, 
                                px: 2, 
                                fontWeight: 700, 
                                fontSize: '0.75rem',
                                borderColor: '#e2e8f0',
                                color: 'text.primary',
                                bgcolor: 'background.paper',
                                '&:hover': { bgcolor: 'action.hover', borderColor: '#f59e0b' }
                              }}
                              onClick={() => {
                                setSelectedProduct(item.product || { id: item.productId, name: item.product?.name || item.productName || 'Roofing Profile', type: item.product?.type || 'Pre-Engineered Steel' });
                                setReviewModalOpen(true);
                                setReviewError('');
                                setReviewSuccess('');
                                setReviewForm({ rating: 5, title: '', comment: '', images: [] });
                              }}
                            >
                              Write Review
                            </Button>
                          )}
                        </Box>
                      )}
                    </Box>
                  </Box>
                );
              })}
            </Stack>

            <Box sx={{ mt: 3, pt: 2.5, borderTop: '1px solid', borderColor: 'divider', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Typography variant="body2" color="text.secondary">
                Total Products Subtotal
              </Typography>
              <Typography variant="h6" fontWeight={900} color="text.primary">
                ₱{Number(order.total).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </Typography>
            </Box>
          </Paper>

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
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, pb: 2, mb: 2.5, borderBottom: '1px solid', borderColor: 'divider' }}>
              <i className={isPickup ? 'fi fi-rr-shop' : 'fi fi-rr-marker'} style={{ fontSize: 18, color: '#4f772d' }} />
              <Typography variant="h6" fontWeight={800} color="text.primary">
                {isPickup ? 'Plant Handover & Retrieval Info' : 'Shipping & Jobsite Destination'}
              </Typography>
            </Box>

            {isPickup ? (
              <Stack spacing={2.5}>
                <Box sx={{ p: 2, bgcolor: 'background.default', borderRadius: 2.5, border: '1px solid', borderColor: 'divider' }}>
                  <Typography variant="caption" fontWeight={700} color="text.secondary" textTransform="uppercase">
                    Official Retrieval Location
                  </Typography>
                  <Typography variant="subtitle1" fontWeight={800} color="text.primary" sx={{ mt: 0.5 }}>
                    Mega Pacific Metal & Steel Corp.
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mt: 0.25 }}>
                    379 Aguinaldo Highway Anabu 1-C, Imus City, Cavite
                  </Typography>
                </Box>

                <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: 2 }}>
                  <Box sx={{ p: 2, bgcolor: 'background.default', borderRadius: 2, border: '1px solid', borderColor: 'divider' }}>
                    <Typography variant="caption" fontWeight={700} color="text.secondary" textTransform="uppercase">
                      Operating Schedule
                    </Typography>
                    <Typography variant="body2" fontWeight={700} color="text.primary" sx={{ mt: 0.5 }}>
                      Monday – Saturday
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      8:00 AM – 5:00 PM (Except Holidays)
                    </Typography>
                  </Box>

                  <Box sx={{ p: 2, bgcolor: 'background.default', borderRadius: 2, border: '1px solid', borderColor: 'divider' }}>
                    <Typography variant="caption" fontWeight={700} color="text.secondary" textTransform="uppercase">
                      Dispatch Desk Contact
                    </Typography>
                    <Typography variant="body2" fontWeight={700} color="text.primary" sx={{ mt: 0.5 }}>
                      Tel. NO.: (046) 416 9217
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      Tel. NO.: (046) 416 9217
                    </Typography>
                  </Box>
                </Box>

                {order.notes && (
                  <Box sx={{ p: 2, bgcolor: 'background.default', borderRadius: 2, border: '1px solid', borderColor: 'divider' }}>
                    <Typography variant="caption" fontWeight={700} color="text.secondary" textTransform="uppercase">
                      Customer Retrieval Notes
                    </Typography>
                    <Typography variant="body2" sx={{ mt: 0.5, fontStyle: 'italic' }}>
                      "{order.notes}"
                    </Typography>
                  </Box>
                )}
              </Stack>
            ) : (
              <Stack spacing={2.5}>
                <Box sx={{ p: 2, bgcolor: 'background.default', borderRadius: 2.5, border: '1px solid', borderColor: 'divider' }}>
                  <Typography variant="caption" fontWeight={700} color="text.secondary" textTransform="uppercase">
                    Recipient & Delivery Address
                  </Typography>
                  <Typography variant="subtitle1" fontWeight={800} color="text.primary" sx={{ mt: 0.5 }}>
                    {order.shippingName || order.customerName}
                  </Typography>
                  <Typography variant="body2" color="text.primary" sx={{ mt: 0.25 }}>
                    {order.shippingAddress || 'Address on file'}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {order.shippingCity || ''}{order.shippingCity && order.shippingProvince ? ', ' : ''}{order.shippingProvince || ''} {order.shippingZipCode || ''}
                  </Typography>
                  <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 0.5 }}>
                    Contact: {order.shippingContactNumber || 'N/A'}
                  </Typography>
                </Box>

                {order.notes && (
                  <Box sx={{ p: 2, bgcolor: 'background.default', borderRadius: 2, border: '1px solid', borderColor: 'divider' }}>
                    <Typography variant="caption" fontWeight={700} color="text.secondary" textTransform="uppercase">
                      Delivery & Jobsite Instructions
                    </Typography>
                    <Typography variant="body2" sx={{ mt: 0.5, fontStyle: 'italic' }}>
                      "{order.notes}"
                    </Typography>
                  </Box>
                )}
              </Stack>
            )}
          </Paper>
        </Stack>

        <Stack spacing={3.5}>
          
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
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, pb: 2, mb: 2.5, borderBottom: '1px solid', borderColor: 'divider' }}>
              <i className="fi fi-rr-receipt" style={{ fontSize: 18, color: '#4f772d' }} />
              <Typography variant="h6" fontWeight={800} color="text.primary">
                Payment Summary
              </Typography>
            </Box>

            <Stack spacing={1.5} sx={{ mb: 3 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                <Typography variant="body2" color="text.secondary">Items Subtotal</Typography>
                <Typography variant="body2" fontWeight={700}>₱{calculatedItemsSubtotal.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</Typography>
              </Box>

              <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                <Typography variant="body2" color="text.secondary">
                  {isPickup ? 'Plant Pick-up Handling' : 'Fleet Delivery Logistics'}
                </Typography>
                <Typography variant="body2" color={isPickup ? 'success.main' : 'text.primary'} fontWeight={700}>
                  {isPickup ? 'FREE (₱0.00)' : `₱${calculatedShippingFee.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
                </Typography>
              </Box>

              <Divider sx={{ my: 1 }} />

              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                <Typography variant="subtitle1" fontWeight={800}>Total Amount</Typography>
                <Typography variant="h5" fontWeight={900} sx={{ color: '#16a34a' }}>
                  ₱{orderTotal.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </Typography>
              </Box>

              {isCOD50 && (
                <>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', bgcolor: 'rgba(22, 163, 74, 0.08)', p: 1, borderRadius: 1.5, mt: 0.5 }}>
                    <Typography variant="caption" fontWeight={700} color="success.main">50% Downpayment Paid</Typography>
                    <Typography variant="caption" fontWeight={800} color="success.main">₱{downpaymentAmount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</Typography>
                  </Box>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', bgcolor: 'rgba(217, 119, 6, 0.08)', p: 1, borderRadius: 1.5 }}>
                    <Typography variant="caption" fontWeight={700} color="warning.main">50% Balance on Delivery</Typography>
                    <Typography variant="caption" fontWeight={800} color="warning.main">₱{balanceAmount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</Typography>
                  </Box>
                </>
              )}
            </Stack>

            <Box 
              sx={{ 
                p: 2, 
                bgcolor: 'background.default', 
                borderRadius: 2.5, 
                border: '1px solid', 
                borderColor: 'divider', 
                display: 'flex', 
                alignItems: 'center', 
                gap: 2,
                mb: 2.5
              }}
            >
              <Avatar 
                sx={{ 
                  bgcolor: order.paymentStatus === 'paid' ? 'rgba(22, 163, 74, 0.12)' : 'rgba(217, 119, 6, 0.12)', 
                  color: order.paymentStatus === 'paid' ? '#16a34a' : '#d97706',
                  width: 42,
                  height: 42
                }}
              >
                <i className={order.paymentMode?.toLowerCase().includes('gcash') ? 'fi fi-rr-mobile' : 'fi fi-rr-credit-card'} style={{ fontSize: 18 }} />
              </Avatar>

              <Box sx={{ flex: 1, minWidth: 0 }}>
                <Typography variant="caption" color="text.secondary" fontWeight={700} display="block">
                  Payment Method
                </Typography>
                <Typography variant="body2" fontWeight={800} color="text.primary">
                  {order.paymentMode || 'Standard Checkout'}
                </Typography>
              </Box>

              <Chip 
                label={order.paymentStatus === 'paid' ? 'PAID' : 'PENDING'} 
                size="small" 
                sx={{ 
                  fontWeight: 800, 
                  fontSize: '0.72rem',
                  bgcolor: order.paymentStatus === 'paid' ? 'rgba(22, 163, 74, 0.1)' : 'rgba(217, 119, 6, 0.1)',
                  color: order.paymentStatus === 'paid' ? '#16a34a' : '#d97706',
                  border: '1px solid',
                  borderColor: order.paymentStatus === 'paid' ? 'rgba(22, 163, 74, 0.3)' : 'rgba(217, 119, 6, 0.3)'
                }} 
              />
            </Box>

            <Button
              variant="contained"
              fullWidth
              startIcon={<i className="fi fi-rr-document-signed" style={{ fontSize: 15 }} />}
              onClick={() => generateReceiptPDF(order)}
              sx={{
                borderRadius: 2.5,
                textTransform: 'none',
                fontWeight: 700,
                py: 1.25,
                bgcolor: '#4f772d',
                color: '#ffffff',
                boxShadow: '0 4px 14px rgba(79, 119, 45, 0.25)',
                '&:hover': {
                  bgcolor: '#3d5c22',
                  boxShadow: '0 6px 18px rgba(79, 119, 45, 0.35)'
                }
              }}
            >
              Download Official Receipt (PDF)
            </Button>
          </Paper>

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
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, pb: 2, mb: 2, borderBottom: '1px solid', borderColor: 'divider' }}>
              <i className="fi fi-rr-user" style={{ fontSize: 18, color: '#4f772d' }} />
              <Typography variant="h6" fontWeight={800} color="text.primary">
                Customer Account
              </Typography>
            </Box>

            <Stack spacing={1.5}>
              <Box>
                <Typography variant="caption" color="text.secondary" fontWeight={700}>
                  Account Name
                </Typography>
                <Typography variant="body2" fontWeight={800} color="text.primary">
                  {order.customerName || order.shippingName || 'Registered Customer'}
                </Typography>
              </Box>

              <Box>
                <Typography variant="caption" color="text.secondary" fontWeight={700}>
                  Account Email
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {order.customerEmail || 'No email attached'}
                </Typography>
              </Box>

              {order.shippingContactNumber && (
                <Box>
                  <Typography variant="caption" color="text.secondary" fontWeight={700}>
                    Primary Contact
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {order.shippingContactNumber}
                  </Typography>
                </Box>
              )}
            </Stack>
          </Paper>

          <Paper 
            elevation={0} 
            sx={{ 
              p: 3, 
              borderRadius: 3.5, 
              border: '1px solid', 
              borderColor: 'divider', 
              bgcolor: 'background.default'
            }}
          >
            <Box sx={{ display: 'flex', gap: 1.5, alignItems: 'flex-start' }}>
              <Avatar sx={{ bgcolor: 'rgba(79, 119, 45, 0.1)', color: '#4f772d', width: 38, height: 38 }}>
                <i className="fi fi-rr-headset" style={{ fontSize: 18 }} />
              </Avatar>
              <Box>
                <Typography variant="subtitle2" fontWeight={800} color="text.primary">
                  Need Help with this Order?
                </Typography>
                <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 0.25, lineHeight: 1.4 }}>
                  Contact our plant logistics desk for loading bay access or schedule adjustments.
                </Typography>
                <Typography variant="body2" fontWeight={800} sx={{ color: '#4f772d', mt: 1 }}>
                  Tel. NO.: (046) 416 9217
                </Typography>
                <Typography variant="body2" fontWeight={800} sx={{ color: '#4f772d', mt: 1 }}>
                  Cel. No.: 0917 277 7727
                </Typography>
              </Box>
            </Box>
          </Paper>
        </Stack>
      </Box>

      <Modal 
        open={reviewModalOpen} 
        onClose={() => setReviewModalOpen(false)} 
        sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', p: 2 }}
      >
        <Paper 
          elevation={24} 
          sx={{ 
            width: '100%', 
            maxWidth: 720, 
            maxHeight: '90vh', 
            overflowY: 'auto', 
            p: { xs: 3, sm: 4.5 }, 
            borderRadius: 4, 
            position: 'relative' 
          }}
        >
          <IconButton 
            onClick={() => setReviewModalOpen(false)} 
            sx={{ position: 'absolute', top: 16, right: 16 }}
          >
            <i className="fi fi-rr-cross" style={{ fontSize: 14 }} />
          </IconButton>
          
          <Typography variant="h5" fontWeight={900} gutterBottom>
            Write a Product Review
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            Share your experience with this roofing profile to help other builders make informed choices.
          </Typography>
          <Divider sx={{ mb: 3 }} />

          {reviewSuccess ? (
            <Box sx={{ textAlign: 'center', py: 5 }}>
              <i className="fi fi-sr-check-circle" style={{ fontSize: 48, color: '#16a34a', marginBottom: 16, display: 'block' }} />
              <Typography variant="h6" fontWeight={800}>{reviewSuccess}</Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                Your feedback has been verified and added to the community product ratings.
              </Typography>
            </Box>
          ) : (
            <form onSubmit={submitReview}>
              {reviewError && (
                <Alert severity="error" sx={{ mb: 3, borderRadius: 2 }}>
                  {reviewError}
                </Alert>
              )}
              
              <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1.3fr' }, gap: 3.5 }}>
                <Box>
                  <Box sx={{ display: 'flex', gap: 2, alignItems: 'center', p: 2, bgcolor: 'background.default', borderRadius: 2.5, border: '1px solid', borderColor: 'divider', mb: 3 }}>
                    <Avatar 
                      variant="rounded" 
                      src={selectedProduct?.imageUrls?.[0] || selectedProduct?.imageUrl} 
                      sx={{ width: 56, height: 56, borderRadius: 2 }} 
                    />
                    <Box sx={{ minWidth: 0 }}>
                      <Typography variant="subtitle2" fontWeight={800} noWrap>{selectedProduct?.name}</Typography>
                      <Typography variant="caption" color="text.secondary">{selectedProduct?.type}</Typography>
                    </Box>
                  </Box>

                  <Typography variant="subtitle2" fontWeight={800} gutterBottom>
                    Overall Product Rating
                  </Typography>
                  <Rating 
                    value={reviewForm.rating} 
                    onChange={(_, newValue) => {
                      if (newValue) setReviewForm(prev => ({ ...prev, rating: newValue }));
                    }} 
                    size="large" 
                    sx={{ mb: 3 }}
                  />

                  <Typography variant="subtitle2" fontWeight={800} gutterBottom>
                    Upload Photos (Max 3)
                  </Typography>
                  <Stack direction="row" spacing={1.5} sx={{ mb: 3, flexWrap: 'wrap' }}>
                    {reviewForm.images.map((img, index) => (
                      <Box key={index} sx={{ position: 'relative', width: 72, height: 72, borderRadius: 2, overflow: 'hidden', border: '1px solid', borderColor: 'divider' }}>
                        <Box component="img" src={img} sx={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        <IconButton 
                          size="small" 
                          onClick={() => removeImage(index)} 
                          sx={{ position: 'absolute', top: 3, right: 3, bgcolor: 'rgba(0,0,0,0.6)', color: 'white', '&:hover': { bgcolor: 'rgba(0,0,0,0.85)' }, p: 0.4 }}
                        >
                          <i className="fi fi-rr-cross" style={{ fontSize: 10 }} />
                        </IconButton>
                      </Box>
                    ))}
                    {reviewForm.images.length < 3 && (
                      <Box 
                        component="label" 
                        sx={{ 
                          width: 72, 
                          height: 72, 
                          borderRadius: 2, 
                          border: '2px dashed', 
                          borderColor: 'divider', 
                          display: 'flex', 
                          flexDirection: 'column', 
                          alignItems: 'center', 
                          justifyContent: 'center', 
                          cursor: 'pointer', 
                          '&:hover': { borderColor: '#4f772d', color: '#4f772d' } 
                        }}
                      >
                        <i className="fi fi-rr-upload" style={{ fontSize: 16 }} />
                        <Typography variant="caption" sx={{ fontSize: '0.68rem', mt: 0.5 }}>Photo</Typography>
                        <input type="file" accept="image/*" multiple onChange={handleImageUpload} hidden />
                      </Box>
                    )}
                  </Stack>
                </Box>

                <Box>
                  <TextField 
                    fullWidth 
                    size="small"
                    label="Review Headline (Optional)" 
                    placeholder="ex. Excellent gauge quality and clean cuts"
                    value={reviewForm.title} 
                    onChange={(e) => setReviewForm(prev => ({ ...prev, title: e.target.value }))} 
                    sx={{ mb: 2.5 }}
                  />
                  <TextField 
                    fullWidth 
                    required 
                    multiline 
                    rows={5} 
                    label="Review Feedback" 
                    placeholder="Describe the sheet condition, paint quality, and installation experience..."
                    value={reviewForm.comment} 
                    onChange={(e) => setReviewForm(prev => ({ ...prev, comment: e.target.value }))} 
                    sx={{ mb: 2.5 }}
                  />
                  <Paper elevation={0} sx={{ p: 2, bgcolor: 'background.default', borderRadius: 2, border: '1px solid', borderColor: 'divider' }}>
                    <Typography variant="caption" fontWeight={800} sx={{ display: 'flex', alignItems: 'center', gap: 0.75, mb: 0.5 }}>
                      <StarIcon fontSize="small" sx={{ color: '#f59e0b', fontSize: 15 }} /> Review Policy
                    </Typography>
                    <Typography variant="caption" color="text.secondary" component="ul" sx={{ pl: 2, m: 0, fontSize: '0.72rem' }}>
                      <li>Focus on profile durability, paint finish, and cut specifications.</li>
                      <li>Photos of installed or staged materials are highly encouraged.</li>
                    </Typography>
                  </Paper>
                </Box>
              </Box>

              <Divider sx={{ my: 3 }} />
              <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
                <Button 
                  variant="outlined" 
                  color="inherit" 
                  onClick={() => setReviewModalOpen(false)}
                  sx={{ borderRadius: 2, textTransform: 'none', fontWeight: 600 }}
                >
                  Cancel
                </Button>
                <Button 
                  variant="contained" 
                  type="submit" 
                  disabled={submittingReview}
                  sx={{ 
                    borderRadius: 2, 
                    textTransform: 'none', 
                    fontWeight: 700, 
                    bgcolor: '#4f772d', 
                    '&:hover': { bgcolor: '#3d5c22' } 
                  }}
                >
                  {submittingReview ? <CircularProgress size={20} color="inherit" /> : 'Submit Verified Review'}
                </Button>
              </Box>
            </form>
          )}
        </Paper>
      </Modal>

      <Modal 
        open={viewReviewModalOpen} 
        onClose={() => setViewReviewModalOpen(false)} 
        sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', p: 2 }}
      >
        <Paper 
          elevation={24} 
          sx={{ 
            width: '100%', 
            maxWidth: 680, 
            maxHeight: '90vh', 
            overflowY: 'auto', 
            p: { xs: 3, sm: 4 }, 
            borderRadius: 4, 
            position: 'relative' 
          }}
        >
          <IconButton 
            onClick={() => setViewReviewModalOpen(false)} 
            sx={{ position: 'absolute', top: 16, right: 16 }}
          >
            <i className="fi fi-rr-cross" style={{ fontSize: 14 }} />
          </IconButton>

          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 1, pr: 5 }}>
            <Box 
              sx={{ 
                width: 38, 
                height: 38, 
                borderRadius: '50%', 
                bgcolor: '#f0fdf4', 
                border: '1px solid #bbf7d0', 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center', 
                flexShrink: 0
              }}
            >
              <i className="fi fi-sr-star" style={{ fontSize: 18, color: '#f59e0b' }} />
            </Box>
            <Box sx={{ minWidth: 0 }}>
              <Typography variant="h6" fontWeight={900}>
                Your Product Review
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Verified feedback submitted for this item
              </Typography>
            </Box>
            <Chip 
              icon={<i className="fi fi-sr-check-circle" style={{ fontSize: 12, color: '#16a34a', marginLeft: 6 }} />}
              label="Verified Review" 
              size="small"
              sx={{ 
                ml: 'auto', 
                bgcolor: '#f0fdf4', 
                color: '#15803d', 
                borderColor: '#86efac', 
                fontWeight: 700, 
                fontSize: '0.72rem',
                border: '1px solid',
                display: { xs: 'none', sm: 'inline-flex' }
              }}
            />
          </Box>

          <Divider sx={{ my: 2.5 }} />

          <Box sx={{ display: 'flex', gap: 2, alignItems: 'center', p: 2, bgcolor: 'background.default', borderRadius: 2.5, border: '1px solid', borderColor: 'divider', mb: 3 }}>
            <Avatar 
              variant="rounded" 
              src={selectedReviewItem?.product?.imageUrls?.[0] || selectedReviewItem?.product?.imageUrl} 
              sx={{ width: 56, height: 56, borderRadius: 2, border: '1px solid #e2e8f0' }} 
            />
            <Box sx={{ minWidth: 0 }}>
              <Typography variant="subtitle2" fontWeight={800} noWrap>
                {selectedReviewItem?.product?.name || selectedReviewItem?.name}
              </Typography>
              <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>
                {selectedReviewItem?.thickness || selectedReviewItem?.variantName} 
                {selectedReviewItem?.color ? ` • ${selectedReviewItem.color}` : ''}
                {selectedReviewItem?.customLength ? ` • ${selectedReviewItem.customLength}m` : ''}
              </Typography>
            </Box>
          </Box>

          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2, flexWrap: 'wrap', gap: 1 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
              <Rating value={selectedReviewItem?.review?.rating || 5} readOnly size="medium" />
              <Typography variant="subtitle2" fontWeight={800} sx={{ color: '#d97706' }}>
                {(selectedReviewItem?.review?.rating || 5).toFixed(1)} / 5.0
              </Typography>
            </Box>
            {selectedReviewItem?.review?.createdAt && (
              <Typography variant="caption" color="text.secondary">
                Submitted on {new Date(selectedReviewItem.review.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
              </Typography>
            )}
          </Box>

          {selectedReviewItem?.review?.title && (
            <Typography variant="subtitle1" fontWeight={800} sx={{ mb: 1.5, color: 'text.primary' }}>
              {selectedReviewItem.review.title}
            </Typography>
          )}

          <Paper 
            elevation={0} 
            sx={{ 
              p: 2.5, 
              bgcolor: 'background.default', 
              borderRadius: 2.5, 
              border: '1px solid', 
              borderColor: 'divider', 
              mb: 3 
            }}
          >
            <Typography variant="body2" sx={{ color: 'text.primary', lineHeight: 1.7, fontStyle: selectedReviewItem?.review?.comment ? 'normal' : 'italic' }}>
              {selectedReviewItem?.review?.comment || 'No written comment provided.'}
            </Typography>
          </Paper>

          {selectedReviewItem?.review?.imageUrls && selectedReviewItem.review.imageUrls.length > 0 && (
            <Box sx={{ mb: 3 }}>
              <Typography variant="caption" fontWeight={800} color="text.secondary" sx={{ textTransform: 'uppercase', letterSpacing: 0.5, display: 'block', mb: 1 }}>
                Attached Photos ({selectedReviewItem.review.imageUrls.length})
              </Typography>
              <Stack direction="row" spacing={1.5} sx={{ flexWrap: 'wrap', gap: 1.5 }}>
                {selectedReviewItem.review.imageUrls.map((imgUrl, idx) => (
                  <Box 
                    key={idx}
                    onClick={() => setPreviewReviewPhoto(imgUrl)}
                    sx={{ 
                      width: 80, 
                      height: 80, 
                      borderRadius: 2, 
                      overflow: 'hidden', 
                      border: '1px solid', 
                      borderColor: 'divider',
                      cursor: 'pointer',
                      transition: 'transform 0.18s ease',
                      '&:hover': { transform: 'scale(1.05)' }
                    }}
                  >
                    <Box component="img" src={imgUrl} alt={`Review photo ${idx + 1}`} sx={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  </Box>
                ))}
              </Stack>
            </Box>
          )}

          {selectedReviewItem?.review?.reply && (
            <Box sx={{ mt: 3, p: 2.5, bgcolor: '#f0fdf4', borderRadius: 2.5, border: '1px solid #bbf7d0', mb: 3 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 1 }}>
                <Avatar sx={{ width: 28, height: 28, bgcolor: '#4f772d', fontSize: '0.75rem', fontWeight: 800 }}>
                  MP
                </Avatar>
                <Typography variant="subtitle2" fontWeight={800} sx={{ color: '#166534' }}>
                  Response from {selectedReviewItem.review.reply.user?.name || 'Mega Pacific Team'}
                </Typography>
                <Chip 
                  label={selectedReviewItem.review.reply.user?.role || 'Staff'} 
                  size="small" 
                  sx={{ height: 20, fontSize: '0.65rem', fontWeight: 800, bgcolor: '#16a34a', color: '#fff', textTransform: 'uppercase' }} 
                />
                {selectedReviewItem.review.reply.createdAt && (
                  <Typography variant="caption" color="text.secondary" sx={{ ml: 'auto' }}>
                    {new Date(selectedReviewItem.review.reply.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
                  </Typography>
                )}
              </Box>
              <Typography variant="body2" sx={{ color: '#14532d', lineHeight: 1.6, pl: 0.5 }}>
                {selectedReviewItem.review.reply.comment}
              </Typography>
            </Box>
          )}

          <Box sx={{ display: 'flex', justifyContent: 'flex-end', pt: 2, borderTop: '1px solid', borderColor: 'divider' }}>
            <Button 
              variant="contained" 
              onClick={() => setViewReviewModalOpen(false)}
              sx={{ 
                borderRadius: 2, 
                textTransform: 'none', 
                fontWeight: 700, 
                bgcolor: '#4f772d', 
                '&:hover': { bgcolor: '#3d5c22' } 
              }}
            >
              Close
            </Button>
          </Box>
        </Paper>
      </Modal>

      <Modal 
        open={Boolean(previewReviewPhoto)} 
        onClose={() => setPreviewReviewPhoto(null)} 
        sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', p: 2 }}
      >
        <Box sx={{ position: 'relative', maxWidth: '90vw', maxHeight: '90vh', outline: 'none' }}>
          <IconButton 
            onClick={() => setPreviewReviewPhoto(null)} 
            sx={{ position: 'absolute', top: -16, right: -16, bgcolor: 'rgba(0,0,0,0.7)', color: 'white', '&:hover': { bgcolor: 'black' } }}
          >
            <i className="fi fi-rr-cross" style={{ fontSize: 14 }} />
          </IconButton>
          <Box component="img" src={previewReviewPhoto} sx={{ maxWidth: '100%', maxHeight: '85vh', borderRadius: 2, boxShadow: 24, objectFit: 'contain' }} />
        </Box>
      </Modal>

      <Snackbar
        open={copyFeedback}
        autoHideDuration={2500}
        onClose={() => setCopyFeedback(false)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert 
          onClose={() => setCopyFeedback(false)} 
          severity="success" 
          variant="filled" 
          sx={{ borderRadius: 2.5, fontWeight: 700 }}
        >
          Reference {formattedOrderId} copied to clipboard!
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default OrderDetails;
