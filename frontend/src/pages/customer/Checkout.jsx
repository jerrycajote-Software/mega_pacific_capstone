import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';
import { useCart } from '../../context/CartContext';
import { getZipCodeForLocation } from '../../utils/locationService';
import ShippingInfoWidget from '../../components/ShippingInfoWidget';
import PaymentMethodWidget from '../../components/PaymentMethodWidget';
import {
  Box,
  Grid,
  Typography,
  TextField,
  Button,
  Paper,
  CircularProgress,
  Alert,
  Chip,
  Divider,
  Stack,
  Avatar,
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ShoppingBagIcon from '@mui/icons-material/ShoppingBag';
import CreditCardIcon from '@mui/icons-material/CreditCard';
import Inventory2Icon from '@mui/icons-material/Inventory2';
import CategoryIcon from '@mui/icons-material/Category';

const Checkout = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, token } = useAuth();
  const { clearCart, removeFromCart, updateQuantity } = useCart();

  const state = location.state || {};
  let initialOrderItems = [];
  let initialOrderTotal = 0;
  
  if (state.isBulk && state.items) {
    initialOrderItems = state.items;
    initialOrderTotal = state.total;
  } else if (state.isSingle && state.item) {
    initialOrderItems = [state.item];
    initialOrderTotal = state.item.price * state.item.quantity;
  } else if (state.product) {
    initialOrderItems = [{
      product: state.product,
      variant: state.variant,
      variantId: state.variant?.id || null,
      quantity: state.quantity,
      price: state.total / state.quantity
    }];
    initialOrderTotal = state.total;
  }

  const [orderItems, setOrderItems] = useState(initialOrderItems);
  const [orderTotal, setOrderTotal] = useState(initialOrderTotal);

  const [formData, setFormData] = useState({
    customerName: user?.name || '',
    customerEmail: user?.email || '',
    contactNumber: '',
    address: '',
    city: '',
    province: 'Cavite',
    zipCode: '',
    notes: '',
    paymentMode: 'Cash on Delivery'
  });

  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  
  const [isLoadingProfile, setIsLoadingProfile] = useState(true);
  const [hasProfile, setHasProfile] = useState(false);
  const [isEditingAddress, setIsEditingAddress] = useState(false);

  useEffect(() => {
    if (!token) {
      setIsLoadingProfile(false);
      return;
    }

    const fetchProfile = async () => {
      try {
        const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
        const res = await axios.get(`${API_URL}/api/auth/profile`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (res.data.data) {
          const profile = res.data.data;
          setFormData(prev => ({
            ...prev,
            customerName: profile.name || prev.customerName,
            customerEmail: profile.email || prev.customerEmail,
            contactNumber: profile.contactNumber || '',
            address: profile.address || '',
            city: profile.city || '',
            province: profile.province || 'Cavite',
            zipCode: profile.zipCode || ''
          }));
          
          if (profile.address && profile.contactNumber && profile.city && profile.province && profile.zipCode) {
            setHasProfile(true);
          }
        }
      } catch (err) {
        console.error("Failed to load profile", err);
      } finally {
        setIsLoadingProfile(false);
      }
    };

    fetchProfile();
  }, [token]);

  if (!user) {
    return (
      <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', py: 10, textAlign: 'center' }}>
        <Avatar sx={{ bgcolor: 'warning.light', width: 64, height: 64, mb: 3 }}>
          <Alert color="warning" icon={false} sx={{ bgcolor: 'transparent' }} />
        </Avatar>
        <Typography variant="h4" fontWeight="bold" gutterBottom>Authentication Required</Typography>
        <Typography color="text.secondary" sx={{ mb: 4, maxWidth: 400 }}>
          You must be logged in to your account to proceed with the checkout and place an order.
        </Typography>
        <Button variant="contained" color="primary" onClick={() => navigate('/login')}>
          Login to Proceed
        </Button>
      </Box>
    );
  }

  if (orderItems.length === 0) {
    return (
      <Box sx={{ py: 10, textAlign: 'center' }}>
        <Typography variant="h5" fontWeight="bold" gutterBottom>No Items in Checkout</Typography>
        <Button variant="text" onClick={() => navigate('/dashboard')}>Return to Catalog</Button>
      </Box>
    );
  }

  if (isLoadingProfile) {
    return (
      <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', py: 15 }}>
        <CircularProgress size={60} sx={{ mb: 3 }} />
        <Typography color="text.secondary">Loading your secure checkout...</Typography>
      </Box>
    );
  }

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    
    if (name === 'city') {
      const zipCode = getZipCodeForLocation(formData.province || 'Cavite', value);
      setFormData(prev => ({ ...prev, city: value, zipCode }));
      if (errors.city) setErrors(prev => ({ ...prev, city: '' }));
      if (errors.zipCode) setErrors(prev => ({ ...prev, zipCode: '' }));
      return;
    }

    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: '' }));
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.customerName.trim()) newErrors.customerName = 'Full Name is required';
    if (!formData.customerEmail.trim()) newErrors.customerEmail = 'Email is required';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.customerEmail)) newErrors.customerEmail = 'Invalid email format';
    if (!formData.contactNumber?.trim()) newErrors.contactNumber = 'Contact Number is required';
    if (!formData.address?.trim()) newErrors.address = 'Complete Address is required';
    if (!formData.city?.trim()) newErrors.city = 'City is required';
    if (!formData.province?.trim()) newErrors.province = 'Province is required';
    if (!formData.zipCode?.trim()) newErrors.zipCode = 'Zip Code is required';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const saveProfileAddress = async () => {
    try {
      const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
      await axios.put(`${API_URL}/api/auth/profile`, {
        contactNumber: formData.contactNumber,
        address: formData.address,
        city: formData.city,
        province: formData.province,
        zipCode: formData.zipCode
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setHasProfile(true);
      setIsEditingAddress(false);
    } catch (err) {
      console.error("Failed to save profile address", err);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsSubmitting(true);

    if (isEditingAddress || !hasProfile) {
      await saveProfileAddress();
    }

    try {
      const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
      
      let res;
      if (state.isBulk || orderItems.length > 1) {
        const bulkPayload = {
          userId: user?.id,
          paymentMode: formData.paymentMode,
          customerEmail: formData.customerEmail,
          shippingName: formData.customerName,
          shippingContactNumber: formData.contactNumber,
          shippingAddress: formData.address,
          shippingCity: formData.city,
          shippingProvince: formData.province,
          shippingZipCode: formData.zipCode,
          notes: formData.notes,
          items: orderItems.map(item => ({
            productId: item.product.id,
            variantId: item.variant?.id || item.variantId || null,
            quantity: item.quantity
          }))
        };
        res = await axios.post(`${API_URL}/api/customer/orders/bulk`, bulkPayload, {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (res.data.success && state.isBulk) {
          clearCart(); 
        }
      } else {
        const singleItem = orderItems[0];
        const singlePayload = {
          userId: user?.id,
          productId: singleItem.product.id,
          variantId: singleItem.variant?.id || singleItem.variantId || null,
          quantity: singleItem.quantity,
          paymentMode: formData.paymentMode,
          customerEmail: formData.customerEmail,
          shippingName: formData.customerName,
          shippingContactNumber: formData.contactNumber,
          shippingAddress: formData.address,
          shippingCity: formData.city,
          shippingProvince: formData.province,
          shippingZipCode: formData.zipCode,
          notes: formData.notes
        };
        res = await axios.post(`${API_URL}/api/customer/orders`, singlePayload, {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (res.data.success && state.isSingle) {
          removeFromCart(state.item.id); 
        }
      }

      if (res.data.success) {
        setSuccess(res.data.data.id);
      }
    } catch (err) {
      console.error('Failed to submit order', err);
      if (err.response?.status === 409 && err.response?.data?.details?.type === 'STOCK_ERROR') {
         const { itemName, available, requested } = err.response.data.details;
         if (available === 0) {
           setErrors({ submit: `The item "${itemName}" is Out of Stock, please find another item available.` });
         } else {
           setErrors({ submit: `The item "${itemName}" only has ${available} units left (you requested ${requested}). We've adjusted your quantity. Please review and try again.` });
           
           const updatedItems = orderItems.map(item => {
             const nameMatches = item.variant ? item.variant.name === itemName : item.product.name === itemName;
             if (nameMatches) {
               if (updateQuantity && item.id) updateQuantity(item.id, available);
               return { ...item, quantity: available };
             }
             return item;
           });
           setOrderItems(updatedItems);
           const newTotal = updatedItems.reduce((acc, item) => acc + ((item.variant?.price ?? item.product.price) * item.quantity), 0);
           setOrderTotal(newTotal);
         }
      } else {
        setErrors({ submit: err.response?.data?.error || 'Failed to place order. Please try again.' });
      }
      setIsSubmitting(false);
    }
  };

  if (success) {
    return (
      <Box sx={{ py: 10, textAlign: 'center', animation: 'fadeIn 0.5s ease-in-out' }}>
        <Avatar sx={{ bgcolor: 'success.light', color: 'success.dark', width: 80, height: 80, mx: 'auto', mb: 3 }}>
          <CheckCircleIcon fontSize="large" />
        </Avatar>
        <Typography variant="h3" fontWeight="bold" gutterBottom>Order Placed Successfully!</Typography>
        <Typography color="text.secondary" sx={{ mb: 4, maxWidth: 500, mx: 'auto' }}>
          Thank you for your purchase. We have received your order and will process it shortly.
        </Typography>
        <Stack direction="row" spacing={2} justifyContent="center">
          <Button variant="outlined" color="inherit" onClick={() => navigate('/dashboard')}>
            Return to Dashboard
          </Button>
          <Button variant="contained" color="primary" startIcon={<Inventory2Icon />} onClick={() => navigate(`/order/${success}`)}>
            View Order
          </Button>
        </Stack>
      </Box>
    );
  }

  return (
    <Box sx={{ animation: 'fadeIn 0.5s ease-in-out', pb: 10 }}>
      <Button startIcon={<ArrowBackIcon />} onClick={() => navigate(-1)} sx={{ mb: 4, color: 'text.secondary' }}>
        Back to Previous
      </Button>

      <Typography variant="h3" fontWeight="bold" sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 4, color: 'text.primary' }}>
        <CreditCardIcon fontSize="large" color="primary" /> Secure Checkout
      </Typography>

      <Grid container spacing={4}>
        <Grid item xs={12} lg={8}>
          <Paper elevation={0} sx={{ p: 4, borderRadius: 4, border: '1px solid', borderColor: 'divider', bgcolor: 'background.paper' }}>
            <ShippingInfoWidget
              formData={formData}
              errors={errors}
              hasProfile={hasProfile}
              isEditingAddress={isEditingAddress}
              onEdit={() => setIsEditingAddress(true)}
              onCancelEdit={() => { setIsEditingAddress(false); setErrors({}); }}
              onInputChange={handleInputChange}
            />

            <form onSubmit={handleSubmit}>
              <Box sx={{ mt: 4, mb: 6 }}>
                <TextField fullWidth label="Additional Notes (Optional)" name="notes" multiline rows={3} value={formData.notes} onChange={handleInputChange} placeholder="Any special instructions for delivery?" />
              </Box>

              <PaymentMethodWidget
                paymentMode={formData.paymentMode}
                onChange={handleInputChange}
              />

              {errors.submit && <Alert severity="error" sx={{ mb: 4 }}>{errors.submit}</Alert>}

              <Box sx={{ display: 'flex', justifyContent: 'flex-end', pt: 2, borderTop: '1px solid', borderColor: 'divider' }}>
                <Button type="submit" variant="contained" color="primary" size="large" disabled={isSubmitting} sx={{ px: 6, py: 1.5, borderRadius: 2, fontWeight: 'bold' }}>
                  {isSubmitting ? <CircularProgress size={24} color="inherit" /> : 'Complete Order'}
                </Button>
              </Box>
            </form>
          </Paper>
        </Grid>

        <Grid item xs={12} lg={4}>
          <Paper elevation={0} sx={{ p: 4, borderRadius: 4, border: '1px solid', borderColor: 'divider', bgcolor: 'background.paper', position: 'sticky', top: 90 }}>
            <Typography variant="h6" fontWeight="bold" sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 3 }}>
              <ShoppingBagIcon color="action" /> Order Summary
            </Typography>

            <Box sx={{ maxHeight: 400, overflowY: 'auto', pr: 1, mb: 3 }}>
              {orderItems.map((item, idx) => (
                <Box key={idx} sx={{ display: 'flex', gap: 2, mb: 3 }}>
                  <Box sx={{ width: 64, height: 64, bgcolor: 'grey.100', borderRadius: 2, display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
                    {(item.product.imageUrls?.[0] || item.product.imageUrl) ? (
                      <Box component="img" src={item.product.imageUrls?.[0] || item.product.imageUrl} alt={item.product.name} sx={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    ) : (
                      <Inventory2Icon sx={{ color: 'text.disabled' }} />
                    )}
                  </Box>
                  <Box sx={{ flex: 1 }}>
                    <Typography variant="body2" fontWeight="bold" sx={{ display: '-webkit-box', WebkitLineClamp: 1, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                      {item.product.name}
                    </Typography>
                    {item.variant && (
                      <Chip icon={<CategoryIcon fontSize="small" />} label={item.variant.name} size="small" variant="outlined" sx={{ height: 20, mt: 0.5, fontSize: '0.65rem' }} />
                    )}
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 1 }}>
                      <Typography variant="caption" color="text.secondary">Qty: {item.quantity}</Typography>
                      <Typography variant="caption" fontWeight="bold">₱{((item.variant?.price ?? item.product.price) * item.quantity).toLocaleString()}</Typography>
                    </Box>
                  </Box>
                </Box>
              ))}
            </Box>

            <Divider sx={{ mb: 2 }} />

            <Stack spacing={1.5} sx={{ mb: 3 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                <Typography variant="body2" color="text.secondary">Subtotal</Typography>
                <Typography variant="body2" fontWeight="bold">₱{orderTotal.toLocaleString()}</Typography>
              </Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                <Typography variant="body2" color="text.secondary">Shipping</Typography>
                <Typography variant="body2" color="success.main" fontWeight="bold">Calculated later</Typography>
              </Box>
            </Stack>

            <Divider sx={{ mb: 2 }} />

            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
              <Typography variant="subtitle1" fontWeight="bold">Total Amount</Typography>
              <Typography variant="h5" fontWeight="900" color="primary">₱{orderTotal.toLocaleString()}</Typography>
            </Box>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default Checkout;
