import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';
import {
  Box,
  Container,
  Grid,
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
  Divider
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import Inventory2Icon from '@mui/icons-material/Inventory2';
import LocalShippingIcon from '@mui/icons-material/LocalShipping';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';
import EventIcon from '@mui/icons-material/Event';
import CreditCardIcon from '@mui/icons-material/CreditCard';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import CategoryIcon from '@mui/icons-material/Category';
import StarIcon from '@mui/icons-material/Star';
import CloseIcon from '@mui/icons-material/Close';
import UploadFileIcon from '@mui/icons-material/UploadFile';

const statusSteps = [
  { key: 'pending', label: 'Order Placed', Icon: AccessTimeIcon },
  { key: 'processing', label: 'Processing', Icon: Inventory2Icon },
  { key: 'out_for_delivery', label: 'Out for Delivery', Icon: LocalShippingIcon },
  { key: 'delivered', label: 'Delivered', Icon: CheckCircleIcon }
];

const OrderDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { token } = useAuth();

  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [reviewModalOpen, setReviewModalOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [reviewForm, setReviewForm] = useState({ rating: 5, title: '', comment: '', images: [] });
  const [submittingReview, setSubmittingReview] = useState(false);
  const [reviewSuccess, setReviewSuccess] = useState('');
  const [reviewError, setReviewError] = useState('');

  const fetchOrder = async () => {
    try {
      const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
      const res = await axios.get(`${API_URL}/api/customer/orders/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.data.success) {
        const fetchedOrder = res.data.data;
        if (fetchedOrder.status.toLowerCase() === 'shipped') {
          fetchedOrder.status = 'processing';
        }
        setOrder(fetchedOrder);
      }
    } catch (err) {
      console.error('Failed to fetch order', err);
      setError('Could not retrieve order details. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrder();
  }, [id, token]);

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', py: 15 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error || !order) {
    return (
      <Box sx={{ py: 10, textAlign: 'center', animation: 'fadeIn 0.5s' }}>
        <Avatar sx={{ bgcolor: 'error.light', color: 'error.dark', width: 64, height: 64, mx: 'auto', mb: 3 }}>
          <CancelIcon fontSize="large" />
        </Avatar>
        <Typography variant="h5" fontWeight="bold" gutterBottom>{error || 'Order not found'}</Typography>
        <Button variant="outlined" sx={{ mt: 2 }} onClick={() => navigate('/orders')}>Return to Orders</Button>
      </Box>
    );
  }

  const handleImageUpload = (e) => {
    const files = Array.from(e.target.files);
    if (reviewForm.images.length + files.length > 3) {
      setReviewError('You can only upload up to 3 images.');
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
      const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
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
        setReviewSuccess('Review submitted successfully!');
        fetchOrder();
        setTimeout(() => {
          setReviewModalOpen(false);
          setReviewSuccess('');
          setReviewForm({ rating: 5, title: '', comment: '', images: [] });
        }, 2000);
      }
    } catch (err) {
      console.error(err);
      setReviewError(err.response?.data?.message || 'Failed to submit review.');
    } finally {
      setSubmittingReview(false);
    }
  };

  const currentStatusIndex = statusSteps.findIndex(s => s.key === order.status.toLowerCase());
  const isCancelled = order.status.toLowerCase() === 'cancelled';

  return (
    <Box sx={{ animation: 'fadeIn 0.5s ease-in-out', pb: 10, maxWidth: 1000, mx: 'auto' }}>
      <Button startIcon={<ArrowBackIcon />} onClick={() => navigate(-1)} sx={{ mb: 4, color: 'text.secondary' }}>
        Back to Orders
      </Button>

      <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, justifyContent: 'space-between', alignItems: { xs: 'flex-start', md: 'flex-end' }, gap: 2, mb: 4 }}>
        <Box>
          <Typography variant="h4" fontWeight="bold" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            Order <Typography component="span" variant="h4" color="text.secondary">#{order.id.toString().padStart(4, '0')}</Typography>
          </Typography>
          <Typography color="text.secondary" sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 1, fontWeight: 'medium' }}>
            <EventIcon fontSize="small" />
            Placed on {new Date(order.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
          </Typography>
        </Box>
        {order.estimatedDeliveryDate && (
          <Paper elevation={0} sx={{ p: 2, borderRadius: 2, border: '1px solid', borderColor: 'divider', bgcolor: 'background.paper' }}>
            <Typography variant="overline" color="text.secondary" fontWeight="bold">Estimated Delivery</Typography>
            <Typography variant="body1" fontWeight="bold" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <LocalShippingIcon color="action" />
              {new Date(order.estimatedDeliveryDate).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
            </Typography>
          </Paper>
        )}
      </Box>

      {/* Progress Tracker */}
      <Paper elevation={0} sx={{ p: 4, borderRadius: 4, border: '1px solid', borderColor: 'divider', mb: 4, bgcolor: 'background.paper', overflow: 'hidden' }}>
        {isCancelled ? (
          <Box sx={{ textAlign: 'center', py: 3 }}>
            <Avatar sx={{ bgcolor: 'error.50', color: 'error.main', width: 64, height: 64, mx: 'auto', mb: 2 }}>
              <CancelIcon fontSize="large" />
            </Avatar>
            <Typography variant="h5" fontWeight="bold" color="error.main">Order Cancelled</Typography>
            <Typography color="text.secondary" sx={{ mt: 1 }}>This order has been cancelled and will not be delivered.</Typography>
          </Box>
        ) : (
          <Box sx={{ position: 'relative', mt: 2 }}>
            <Box sx={{ position: 'absolute', top: 24, left: 0, width: '100%', height: 4, bgcolor: 'grey.200', borderRadius: 2 }}>
              <Box sx={{ height: '100%', bgcolor: 'primary.main', transition: 'width 1s ease', width: `${(Math.max(currentStatusIndex, 0) / (statusSteps.length - 1)) * 100}%` }} />
            </Box>

            <Box sx={{ display: 'flex', justifyContent: 'space-between', position: 'relative' }}>
              {statusSteps.map((step, index) => {
                const isCompleted = index <= currentStatusIndex;
                const isCurrent = index === currentStatusIndex;
                return (
                  <Box key={step.key} sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                    <Avatar sx={{ 
                      width: 48, 
                      height: 48, 
                      bgcolor: isCompleted ? 'primary.main' : 'grey.100', 
                      color: isCompleted ? 'white' : 'grey.400',
                      border: '4px solid',
                      borderColor: 'background.paper',
                      zIndex: 1,
                      transition: 'background-color 0.5s'
                    }}>
                      <step.Icon />
                    </Avatar>
                    <Typography sx={{ mt: 1, fontSize: '0.875rem', fontWeight: isCurrent ? 'bold' : isCompleted ? 'medium' : 'normal', color: isCurrent ? 'text.primary' : isCompleted ? 'text.secondary' : 'text.disabled' }}>
                      {step.label}
                    </Typography>
                  </Box>
                );
              })}
            </Box>
          </Box>
        )}
      </Paper>

      <Grid container spacing={4}>
        <Grid item xs={12} lg={8}>
          <Paper elevation={0} sx={{ p: 4, borderRadius: 4, border: '1px solid', borderColor: 'divider', bgcolor: 'background.paper' }}>
            <Typography variant="h6" fontWeight="bold" gutterBottom sx={{ borderBottom: '1px solid', borderColor: 'divider', pb: 2, mb: 3 }}>
              Ordered Products
            </Typography>
            <Stack spacing={3}>
              {order.items.map((item) => (
                <Box key={item.id} sx={{ display: 'flex', gap: 3, p: 2, bgcolor: 'background.default', borderRadius: 2, border: '1px solid', borderColor: 'divider' }}>
                  <Box sx={{ width: 80, height: 80, bgcolor: 'background.paper', borderRadius: 2, overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid', borderColor: 'divider', flexShrink: 0 }}>
                    {(item.product.imageUrls?.[0] || item.product.imageUrl) ? (
                      <Box component="img" src={item.product.imageUrls?.[0] || item.product.imageUrl} alt={item.product.name} sx={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    ) : (
                      <Inventory2Icon color="disabled" />
                    )}
                  </Box>
                  <Box sx={{ flex: 1 }}>
                    <Typography variant="subtitle1" fontWeight="bold">{item.product.name}</Typography>
                    <Typography variant="body2" color="text.secondary">{item.product.type}</Typography>
                    {(item.variantName || item.variant?.name) && (
                      <Chip icon={<CategoryIcon fontSize="small" />} label={item.variantName || item.variant?.name} size="small" variant="outlined" sx={{ mt: 1, height: 24 }} />
                    )}
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', mt: 2 }}>
                      <Typography variant="body2" color="text.secondary">Qty: <Typography component="span" fontWeight="bold" color="text.primary">{item.quantity}</Typography></Typography>
                      <Box sx={{ textAlign: 'right' }}>
                        <Typography variant="h6" fontWeight="bold">₱{item.price.toLocaleString()}</Typography>
                        {order.status.toLowerCase() === 'delivered' && !item.isReviewed && (
                          <Button 
                            variant="outlined" 
                            size="small" 
                            startIcon={<StarIcon sx={{ color: 'warning.main' }} />}
                            sx={{ mt: 1, borderRadius: 4, textTransform: 'none', py: 0.5 }}
                            onClick={() => {
                              setSelectedProduct(item.product);
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
                    </Box>
                  </Box>
                </Box>
              ))}
            </Stack>
          </Paper>
        </Grid>

        <Grid item xs={12} lg={4}>
          <Stack spacing={4}>
            {/* Payment Summary */}
            <Paper elevation={0} sx={{ p: 4, borderRadius: 4, border: '1px solid', borderColor: 'divider', bgcolor: 'background.paper' }}>
              <Typography variant="h6" fontWeight="bold" gutterBottom>Payment Summary</Typography>
              <Stack spacing={1.5} sx={{ my: 3 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Typography variant="body2" color="text.secondary">Subtotal</Typography>
                  <Typography variant="body2" fontWeight="bold">₱{order.total.toLocaleString()}</Typography>
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Typography variant="body2" color="text.secondary">Shipping</Typography>
                  <Typography variant="body2" color="success.main" fontWeight="bold">Calculated</Typography>
                </Box>
              </Stack>
              <Box sx={{ borderTop: '1px solid', borderColor: 'divider', pt: 2, mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
                <Typography variant="subtitle2" fontWeight="bold">Total Amount</Typography>
                <Typography variant="h5" fontWeight="900">₱{order.total.toLocaleString()}</Typography>
              </Box>
              <Box sx={{ p: 2, bgcolor: 'background.default', borderRadius: 2, border: '1px solid', borderColor: 'divider', display: 'flex', alignItems: 'center', gap: 2 }}>
                <CreditCardIcon color={order.paymentStatus === 'paid' ? 'success' : 'action'} />
                <Box sx={{ flex: 1 }}>
                  <Typography variant="caption" color="text.secondary" fontWeight="bold" display="block">Payment Method</Typography>
                  <Typography variant="body2" fontWeight="bold">{order.paymentMode}</Typography>
                </Box>
                <Chip label={order.paymentStatus} color={order.paymentStatus === 'paid' ? 'success' : 'warning'} size="small" sx={{ textTransform: 'uppercase', fontWeight: 'bold' }} />
              </Box>
            </Paper>

            {/* Delivery Info */}
            <Paper elevation={0} sx={{ p: 4, borderRadius: 4, border: '1px solid', borderColor: 'divider', bgcolor: 'background.paper' }}>
              <Typography variant="h6" fontWeight="bold" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <LocationOnIcon color="action" /> Delivery Info
              </Typography>
              <Stack spacing={2} sx={{ mt: 3 }}>
                <Box>
                  <Typography variant="caption" color="text.secondary" fontWeight="bold">Customer Name</Typography>
                  <Typography variant="body2" fontWeight="bold">{order.customerName}</Typography>
                </Box>
                <Box>
                  <Typography variant="caption" color="text.secondary" fontWeight="bold">Contact</Typography>
                  <Typography variant="body2">{order.contactNumber}</Typography>
                  <Typography variant="body2" color="text.secondary">{order.customerEmail}</Typography>
                </Box>
                <Box>
                  <Typography variant="caption" color="text.secondary" fontWeight="bold">Shipping Address</Typography>
                  <Typography variant="body2">{order.address}</Typography>
                  <Typography variant="body2" color="text.secondary">{order.cityProvince}, {order.zipCode}</Typography>
                </Box>
                {order.notes && (
                  <Box sx={{ pt: 2, borderTop: '1px solid', borderColor: 'divider' }}>
                    <Typography variant="caption" color="text.secondary" fontWeight="bold">Notes</Typography>
                    <Typography variant="body2" fontStyle="italic">"{order.notes}"</Typography>
                  </Box>
                )}
              </Stack>
            </Paper>
          </Stack>
        </Grid>
      </Grid>

      {/* Review Modal */}
      <Modal open={reviewModalOpen} onClose={() => setReviewModalOpen(false)} sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Paper elevation={24} sx={{ width: '90%', maxWidth: 800, maxHeight: '90vh', overflowY: 'auto', p: { xs: 3, md: 5 }, borderRadius: 4, position: 'relative' }}>
          <IconButton onClick={() => setReviewModalOpen(false)} sx={{ position: 'absolute', top: 16, right: 16 }}>
            <CloseIcon />
          </IconButton>
          
          <Typography variant="h5" fontWeight="bold" gutterBottom>Write a Review</Typography>
          <Divider sx={{ mb: 4 }} />

          {reviewSuccess ? (
            <Box sx={{ textAlign: 'center', py: 6 }}>
              <CheckCircleIcon color="success" sx={{ fontSize: 64, mb: 2 }} />
              <Typography variant="h6" fontWeight="bold">{reviewSuccess}</Typography>
              <Typography color="text.secondary">Thank you for sharing your experience!</Typography>
            </Box>
          ) : (
            <form onSubmit={submitReview}>
              {reviewError && <Alert severity="error" sx={{ mb: 3 }}>{reviewError}</Alert>}
              
              <Grid container spacing={4}>
                <Grid item xs={12} md={5}>
                  <Box sx={{ display: 'flex', gap: 2, alignItems: 'center', p: 2, bgcolor: 'background.default', borderRadius: 2, border: '1px solid', borderColor: 'divider', mb: 4 }}>
                    <Avatar variant="rounded" src={selectedProduct?.imageUrls?.[0] || selectedProduct?.imageUrl} sx={{ width: 64, height: 64 }} />
                    <Box>
                      <Typography variant="subtitle2" fontWeight="bold">{selectedProduct?.name}</Typography>
                      <Typography variant="caption" color="text.secondary">{selectedProduct?.type}</Typography>
                    </Box>
                  </Box>

                  <Typography variant="subtitle2" fontWeight="bold" gutterBottom>Overall Rating</Typography>
                  <Rating 
                    value={reviewForm.rating} 
                    onChange={(event, newValue) => {
                      if (newValue) setReviewForm(prev => ({ ...prev, rating: newValue }));
                    }} 
                    size="large" 
                    sx={{ mb: 4 }}
                  />

                  <Typography variant="subtitle2" fontWeight="bold" gutterBottom>Add Photos (Max 3)</Typography>
                  <Stack direction="row" spacing={2} sx={{ mb: 4, flexWrap: 'wrap' }}>
                    {reviewForm.images.map((img, index) => (
                      <Box key={index} sx={{ position: 'relative', width: 80, height: 80, borderRadius: 2, overflow: 'hidden', border: '1px solid', borderColor: 'divider' }}>
                        <Box component="img" src={img} sx={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        <IconButton size="small" onClick={() => removeImage(index)} sx={{ position: 'absolute', top: 4, right: 4, bgcolor: 'rgba(0,0,0,0.5)', color: 'white', '&:hover': { bgcolor: 'rgba(0,0,0,0.8)' }, p: 0.5 }}>
                          <CloseIcon fontSize="small" />
                        </IconButton>
                      </Box>
                    ))}
                    {reviewForm.images.length < 3 && (
                      <Box component="label" sx={{ width: 80, height: 80, borderRadius: 2, border: '2px dashed', borderColor: 'divider', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', '&:hover': { borderColor: 'primary.main', color: 'primary.main' } }}>
                        <UploadFileIcon fontSize="small" />
                        <Typography variant="caption">Upload</Typography>
                        <input type="file" accept="image/*" multiple onChange={handleImageUpload} hidden />
                      </Box>
                    )}
                  </Stack>
                </Grid>

                <Grid item xs={12} md={7}>
                  <TextField 
                    fullWidth 
                    label="Review Title (Optional)" 
                    value={reviewForm.title} 
                    onChange={(e) => setReviewForm(prev => ({ ...prev, title: e.target.value }))} 
                    sx={{ mb: 3 }}
                  />
                  <TextField 
                    fullWidth 
                    required 
                    multiline 
                    rows={6} 
                    label="Review Comment" 
                    value={reviewForm.comment} 
                    onChange={(e) => setReviewForm(prev => ({ ...prev, comment: e.target.value }))} 
                    sx={{ mb: 3 }}
                  />
                  <Paper elevation={0} sx={{ p: 2, bgcolor: 'background.default', borderRadius: 2 }}>
                    <Typography variant="caption" fontWeight="bold" sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                      <StarIcon fontSize="small" color="action" /> Review Guidelines
                    </Typography>
                    <Typography variant="caption" color="text.secondary" component="ul" sx={{ pl: 2, m: 0 }}>
                      <li>Focus on the product quality and usage.</li>
                      <li>Avoid revealing personal information.</li>
                      <li>Images should be clear and well-lit.</li>
                    </Typography>
                  </Paper>
                </Grid>
              </Grid>

              <Divider sx={{ my: 4 }} />
              <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
                <Button variant="outlined" color="inherit" onClick={() => setReviewModalOpen(false)}>Cancel</Button>
                <Button variant="contained" color="primary" type="submit" disabled={submittingReview}>
                  {submittingReview ? <CircularProgress size={24} color="inherit" /> : 'Submit Review'}
                </Button>
              </Box>
            </form>
          )}
        </Paper>
      </Modal>
    </Box>
  );
};

export default OrderDetails;
