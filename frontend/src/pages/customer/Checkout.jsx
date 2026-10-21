import React, { useState, useEffect, useMemo, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';
import { generateReceiptPDF, generateQuotationPDF } from '../../utils/documentGenerator';
import { getZipCodeForLocation } from '../../utils/locationService';
import ShippingInfoWidget from '../../components/ShippingInfoWidget';
import PaymentMethodWidget from '../../components/PaymentMethodWidget';
import AddProductToOrderModal from '../../components/AddProductToOrderModal';
import { getColorHex } from '../../constants/roofingSpecs';
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
  Collapse,
  IconButton,
  Dialog,
  DialogContent,
  DialogActions,
} from '@mui/material';
import { fetchDeliveryFee, computeClientDeliveryFee } from '../../utils/deliveryFeeCalculator';


const Checkout = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, token } = useAuth();

  const state = location.state || {};
  let initialOrderItems = [];
  
  if (state.isBulk && state.items) {
    initialOrderItems = state.items.map((item, idx) => ({
      ...item,
      orderItemId: item.orderItemId || item.id || `bulk-${item.product?.id || item.productId}-${item.variantId || 'base'}-${idx}-${Date.now()}`
    }));
  } else if (state.isSingle && state.item) {
    const singleItm = {
      ...state.item,
      orderItemId: state.item.orderItemId || state.item.id || `single-${state.item.product?.id || state.item.productId}-${Date.now()}`
    };
    initialOrderItems = [singleItm];
  } else if (state.product) {
    initialOrderItems = [{
      orderItemId: `product-${state.product.id}-${state.variant?.id || 'base'}-${state.customLength || '1'}-${state.color || 'def'}-${Date.now()}`,
      product: state.product,
      variant: state.variant,
      variantId: state.variant?.id || null,
      quantity: state.quantity || 1,
      price: state.price || (state.variant?.price ?? state.product.price),
      originalPrice: state.originalPrice,
      color: state.color || null,
      customLength: state.customLength ? Number(state.customLength) : null,
      thickness: state.thickness || null
    }];
  }

  const [orderItems, setOrderItems] = useState(initialOrderItems);
  const [addProductModalOpen, setAddProductModalOpen] = useState(false);
  const [modalInitialProductId, setModalInitialProductId] = useState(null);
  const [createdOrder, setCreatedOrder] = useState(null);
  const submittingRef = useRef(false);
  const [showExitConfirm, setShowExitConfirm] = useState(false);
  const isLeavingRef = useRef(false);

  // Compute item unit price (taking into account per-meter length multiplier)
  const computeItemUnitPrice = (item) => {
    const isPerMeter = item.product?.unit === 'per meter' || item.product?.unit === 'meter' || item.product?.isPreOrder;
    const len = isPerMeter && item.customLength ? Number(item.customLength) : 1;
    const unitP = item.variant?.price ?? item.product?.price ?? (item.price || 0);
    return unitP * len;
  };

  const computeItemOriginalPrice = (item) => {
    const isPerMeter = item.product?.unit === 'per meter' || item.product?.unit === 'meter' || item.product?.isPreOrder;
    const len = isPerMeter && item.customLength ? Number(item.customLength) : 1;
    const unitP = item.variant?.price ?? item.product?.price ?? (item.price || 0);
    const origP = item.variant?.originalPrice ?? item.product?.originalPrice ?? item.originalPrice ?? (unitP ? Math.round((unitP / 0.70) * 100) / 100 : 0);
    return origP * len;
  };

  const orderTotal = useMemo(() => {
    return orderItems.reduce((sum, item) => sum + (computeItemUnitPrice(item) * (parseInt(item.quantity, 10) || 1)), 0);
  }, [orderItems]);



  const handleUpdateItemQuantity = (orderItemId, newQty) => {
    if (newQty <= 0) {
      handleRemoveItem(orderItemId);
      return;
    }
    setOrderItems(prev => prev.map(item => {
      if (item.orderItemId === orderItemId) {
        return { ...item, quantity: newQty };
      }
      return item;
    }));
  };

  const handleRemoveItem = (orderItemId) => {
    const itemToRemove = orderItems.find(i => i.orderItemId === orderItemId);
    const itemName = itemToRemove?.product?.name || 'this item';
    if (orderItems.length === 1) {
      if (!window.confirm(`Are you sure you want to remove ${itemName}? This will empty your checkout order.`)) {
        return;
      }
    }
    setOrderItems(prev => prev.filter(i => i.orderItemId !== orderItemId));
  };

  const handleAddProductToOrder = (newItem) => {
    setOrderItems(prev => {
      const existingIdx = prev.findIndex(item =>
        item.product?.id === newItem.product?.id &&
        (item.variant?.id || item.variantId || null) === (newItem.variant?.id || newItem.variantId || null) &&
        Number(item.customLength || 0) === Number(newItem.customLength || 0) &&
        (item.color || '') === (newItem.color || '') &&
        (item.thickness || '') === (newItem.thickness || '')
      );

      if (existingIdx > -1) {
        const updated = [...prev];
        updated[existingIdx] = {
          ...updated[existingIdx],
          quantity: updated[existingIdx].quantity + newItem.quantity
        };
        return updated;
      }
      return [...prev, newItem];
    });
  };

  const handleOpenAddModal = (productId = null) => {
    setModalInitialProductId(productId);
    setAddProductModalOpen(true);
  };

  const [shippingCalculation, setShippingCalculation] = useState(null);
  const [isCalculatingShipping, setIsCalculatingShipping] = useState(false);
  const [showShippingBreakdown, setShowShippingBreakdown] = useState(false);

  const [formData, setFormData] = useState({
    customerName: user?.name || '',
    customerEmail: user?.email || '',
    contactNumber: '',
    address: '',
    city: '',
    province: 'Cavite',
    zipCode: '',
    notes: '',
    paymentPlan: 'COD_50', // 'COD_50' | 'FULL_PAYMENT'
    paymentChannel: 'Card', // 'Card' | 'GCash'
    fulfillmentType: 'Delivery',
    cardNumber: '',
    cardExpiry: '',
    cardCvv: '',
    gcashNumber: '',
  });

  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  
  const [isLoadingProfile, setIsLoadingProfile] = useState(true);
  const [hasProfile, setHasProfile] = useState(false);
  const [isEditingAddress, setIsEditingAddress] = useState(false);
  const [addresses, setAddresses] = useState([]);
  const [selectedAddressId, setSelectedAddressId] = useState(null);

  useEffect(() => {
    if (formData.fulfillmentType === 'Pickup') {
      setShippingCalculation(null);
      return;
    }

    const province = formData.province || 'Cavite';
    const city = formData.city || 'Imus';

    const clientEstimate = computeClientDeliveryFee({
      province,
      city,
      items: orderItems
    });
    setShippingCalculation(clientEstimate);

    let isMounted = true;
    setIsCalculatingShipping(true);
    fetchDeliveryFee({ province, city, items: orderItems })
      .then((result) => {
        if (isMounted && result) {
          setShippingCalculation(result);
        }
      })
      .catch((err) => {
        console.warn('Shipping fee fetch failed:', err);
      })
      .finally(() => {
        if (isMounted) setIsCalculatingShipping(false);
      });

    return () => {
      isMounted = false;
    };
  }, [formData.province, formData.city, formData.fulfillmentType, orderItems]);

  const shippingFee = formData.fulfillmentType === 'Pickup' ? 0 : (shippingCalculation?.totalDeliveryCharge || 0);
  const grandTotal = (orderTotal || 0) + shippingFee;

  useEffect(() => {
    if (success) return;

    // Push state trap so back button does not leave checkout and forward history is cleared
    window.history.pushState({ isCheckoutLock: true }, '', window.location.href);

    const handlePopState = () => {
      if (isLeavingRef.current) return;
      // Re-push state to trap and retain the user on /checkout
      window.history.pushState({ isCheckoutLock: true }, '', window.location.href);
      setShowExitConfirm(true);
    };

    const handleBeforeUnload = (e) => {
      if (isLeavingRef.current) return;
      e.preventDefault();
      e.returnValue = '';
      return '';
    };

    window.addEventListener('popstate', handlePopState);
    window.addEventListener('beforeunload', handleBeforeUnload);

    return () => {
      window.removeEventListener('popstate', handlePopState);
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [success]);

  const handleConfirmExit = () => {
    isLeavingRef.current = true;
    setShowExitConfirm(false);
    navigate('/dashboard');
  };

  useEffect(() => {
    if (!token) {
      setIsLoadingProfile(false);
      return;
    }

    const fetchProfile = async () => {
      try {
        const API_URL = import.meta.env.VITE_API_URL || '';
        const res = await axios.get(`${API_URL}/api/auth/profile`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (res.data.data) {
          const profile = res.data.data;
          const userAddresses = profile.addresses || [];
          setAddresses(userAddresses);

          const defaultAddr = userAddresses.find(a => a.isDefault) || userAddresses[0];

          if (defaultAddr) {
            setSelectedAddressId(defaultAddr.id);
            setFormData(prev => ({
              ...prev,
              customerName: profile.name || prev.customerName,
              customerEmail: profile.email || prev.customerEmail,
              contactNumber: defaultAddr.contactNumber || '',
              address: defaultAddr.address || '',
              city: defaultAddr.city || '',
              province: defaultAddr.province || 'Cavite',
              zipCode: defaultAddr.zipCode || ''
            }));
            setHasProfile(true);
          } else {
            setFormData(prev => ({
              ...prev,
              customerName: profile.name || prev.customerName,
              customerEmail: profile.email || prev.customerEmail
            }));
            setHasProfile(false);
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
      <Box sx={{ py: 10, px: 2, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <Paper elevation={0} sx={{ p: { xs: 3, sm: 5 }, textAlign: 'center', maxWidth: 480, width: '100%', borderRadius: 4, border: '1px solid', borderColor: 'divider', bgcolor: 'background.paper' }}>
          <Box sx={{ width: 64, height: 64, borderRadius: '50%', bgcolor: 'grey.100', display: 'flex', alignItems: 'center', justifyContent: 'center', mx: 'auto', mb: 2 }}>
            <i className="fi fi-rr-shopping-bag" style={{ fontSize: 28, color: '#94a3b8' }} />
          </Box>
          <Typography variant="h5" fontWeight={900} gutterBottom>Your Order is Empty</Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3.5 }}>
            You currently have no products selected for this order. Please return to the product catalog to select a product and start an order.
          </Typography>
          <Box sx={{ display: 'flex', justifyContent: 'center' }}>
            <Button
              variant="contained"
              color="primary"
              onClick={() => navigate('/dashboard')}
              startIcon={<i className="fi fi-rr-arrow-left" style={{ fontSize: 13 }} />}
              sx={{ borderRadius: 2.5, textTransform: 'none', fontWeight: 700, px: 3.5, py: 1.1 }}
            >
              Return to Catalog
            </Button>
          </Box>
        </Paper>
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
    
    if (name === 'province') {
      setFormData(prev => ({ ...prev, province: value, city: '', zipCode: '' }));
      if (errors.province) setErrors(prev => ({ ...prev, province: '' }));
      if (errors.city) setErrors(prev => ({ ...prev, city: '' }));
      if (errors.zipCode) setErrors(prev => ({ ...prev, zipCode: '' }));
      return;
    }

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

    if (formData.fulfillmentType === 'Delivery') {
      if (!formData.contactNumber?.trim()) newErrors.contactNumber = 'Contact Number is required';
      if (!formData.address?.trim()) newErrors.address = 'Complete Address is required';
      if (!formData.city?.trim()) newErrors.city = 'City is required';
      if (!formData.province?.trim()) newErrors.province = 'Province is required';
      if (!formData.zipCode?.trim()) newErrors.zipCode = 'Zip Code is required';
    }

    if (formData.paymentChannel === 'Card') {
      const cleanCard = (formData.cardNumber || '').replace(/\s+/g, '');
      if (!cleanCard) {
        newErrors.cardNumber = 'Card number is required';
      } else if (cleanCard.length < 15) {
        newErrors.cardNumber = 'Card number must be 15 or 16 digits';
      }

      const expiry = (formData.cardExpiry || '').trim();
      if (!expiry) {
        newErrors.cardExpiry = 'Expiration date is required';
      } else if (!/^(0[1-9]|1[0-2])\/?([0-9]{2})$/.test(expiry)) {
        newErrors.cardExpiry = 'Enter valid MM/YY';
      }

      const cvv = (formData.cardCvv || '').trim();
      if (!cvv) {
        newErrors.cardCvv = 'Security code is required';
      } else if (cvv.length < 3) {
        newErrors.cardCvv = 'Security code must be 3 or 4 digits';
      }
    } else if (formData.paymentChannel === 'GCash') {
      const cleanGcash = (formData.gcashNumber || '').replace(/\s+/g, '');
      if (!cleanGcash) {
        newErrors.gcashNumber = 'GCash mobile number is required';
      } else if (!/^09\d{9}$/.test(cleanGcash)) {
        newErrors.gcashNumber = 'Must be an 11-digit mobile number starting with 09';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const saveProfileAddress = async () => {
    try {
      const API_URL = import.meta.env.VITE_API_URL || '';
      let res;
      if (selectedAddressId && hasProfile) {
        res = await axios.put(`${API_URL}/api/auth/addresses/${selectedAddressId}`, {
          contactNumber: formData.contactNumber,
          address: formData.address,
          city: formData.city,
          province: formData.province,
          zipCode: formData.zipCode
        }, {
          headers: { Authorization: `Bearer ${token}` }
        });
      } else {
        res = await axios.post(`${API_URL}/api/auth/addresses`, {
          contactNumber: formData.contactNumber,
          address: formData.address,
          city: formData.city,
          province: formData.province,
          zipCode: formData.zipCode,
          isDefault: true
        }, {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (res.data.data) {
          setSelectedAddressId(res.data.data.id);
        }
      }
      setHasProfile(true);
      setIsEditingAddress(false);
    } catch (err) {
      console.error("Failed to save profile address", err);
    }
  };

  const handleSelectAddress = (id) => {
    setSelectedAddressId(id);
    const addr = addresses.find(a => a.id === id);
    if (addr) {
      setFormData(prev => ({
        ...prev,
        contactNumber: addr.contactNumber || '',
        address: addr.address || '',
        city: addr.city || '',
        province: addr.province || 'Cavite',
        zipCode: addr.zipCode || ''
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (submittingRef.current || isSubmitting) return;
    if (!validateForm()) return;

    submittingRef.current = true;
    setIsSubmitting(true);

    if (isEditingAddress || !hasProfile) {
      await saveProfileAddress();
    }

    try {
      const API_URL = import.meta.env.VITE_API_URL || '';
      
      const paymentModeDescription = formData.paymentPlan === 'COD_50'
        ? 'Cash on Delivery (50% Downpayment)'
        : 'Bank Transfer - Full Payment';

      const paymentDetails = {
        paymentPlan: formData.paymentPlan,
        paymentChannel: formData.paymentChannel,
        paymentMode: paymentModeDescription,
        shippingFee: shippingFee,
        cardDetails: formData.paymentChannel === 'Card' ? {
          cardNumber: formData.cardNumber,
          cardExpiry: formData.cardExpiry,
          cardCvv: formData.cardCvv,
        } : undefined,
        gcashNumber: formData.paymentChannel === 'GCash' ? formData.gcashNumber : undefined,
      };

      let res;
      if (state.isBulk || orderItems.length > 1) {
        const bulkPayload = {
          userId: user?.id,
          fulfillmentType: formData.fulfillmentType,
          customerEmail: formData.customerEmail,
          shippingName: formData.customerName,
          shippingContactNumber: formData.contactNumber,
          shippingAddress: formData.address,
          shippingCity: formData.city,
          shippingProvince: formData.province,
          shippingZipCode: formData.zipCode,
          notes: formData.notes,
          ...paymentDetails,
          items: orderItems.map(item => ({
            productId: item.product.id,
            variantId: item.variant?.id || item.variantId || null,
            quantity: item.quantity,
            customLength: item.customLength ? Number(item.customLength) : null,
            thickness: item.thickness || null,
            color: item.color || null
          }))
        };
        res = await axios.post(`${API_URL}/api/customer/orders/bulk`, bulkPayload, {
          headers: { Authorization: `Bearer ${token}` }
        });
      } else {
        const singleItem = orderItems[0];
        const singlePayload = {
          userId: user?.id,
          productId: singleItem.product.id,
          variantId: singleItem.variant?.id || singleItem.variantId || null,
          quantity: singleItem.quantity,
          customLength: singleItem.customLength ? Number(singleItem.customLength) : null,
          thickness: singleItem.thickness || null,
          color: singleItem.color || null,
          fulfillmentType: formData.fulfillmentType,
          customerEmail: formData.customerEmail,
          shippingName: formData.customerName,
          shippingContactNumber: formData.contactNumber,
          shippingAddress: formData.address,
          shippingCity: formData.city,
          shippingProvince: formData.province,
          shippingZipCode: formData.zipCode,
          notes: formData.notes,
          ...paymentDetails
        };
        res = await axios.post(`${API_URL}/api/customer/orders`, singlePayload, {
          headers: { Authorization: `Bearer ${token}` }
        });
      }

      if (res.data.success) {
        isLeavingRef.current = true;
        setSuccess(res.data.data.id);
        setCreatedOrder(res.data.data);
      }
    } catch (err) {
      console.error('Failed to submit order', err);
      if (err.response?.status === 409 && err.response?.data?.details?.type === 'STOCK_ERROR') {
         const { itemName, available, requested } = err.response.data.details;
         if (available === 0) {
           setErrors({ submit: `The item "${itemName}" is Out of Stock, please find another item available.` });
         } else {
           setErrors({ submit: `The item "${itemName}" only has ${available} units left (you requested ${requested}). We've adjusted your quantity. Please review and try again.` });
           
           setOrderItems(orderItems.map(item => {
             const nameMatches = item.variant ? item.variant.name === itemName : item.product.name === itemName;
             return nameMatches ? { ...item, quantity: available } : item;
           }));
         }
      } else {
        setErrors({ submit: err.response?.data?.error || 'Failed to place order. Please try again.' });
      }
      submittingRef.current = false;
      setIsSubmitting(false);
    }
  };

  if (success) {
    return (
      <Box sx={{ py: 10, textAlign: 'center', animation: 'fadeIn 0.5s ease-in-out' }}>
        <Avatar sx={{ bgcolor: 'success.light', color: 'success.dark', width: 80, height: 80, mx: 'auto', mb: 3 }}>
          <i className="fi fi-sr-check-circle" style={{ fontSize: '40px' }}></i>
        </Avatar>
        <Typography variant="h3" fontWeight="bold" gutterBottom>Order Placed Successfully!</Typography>
        <Typography color="text.secondary" sx={{ mb: 2.5, maxWidth: 500, mx: 'auto' }}>
          Thank you for your purchase. We have received your order and will process it shortly.
        </Typography>
        {formData.customerEmail && (
          <Paper
            elevation={0}
            sx={{
              p: 2,
              mb: 4,
              maxWidth: 500,
              mx: 'auto',
              bgcolor: '#f0fdf4',
              border: '1.5px solid #86efac',
              borderRadius: 3,
              display: 'flex',
              alignItems: 'center',
              gap: 1.5,
              textAlign: 'left'
            }}
          >
            <Avatar sx={{ bgcolor: '#dcfce7', color: '#16a34a', width: 38, height: 38, flexShrink: 0 }}>
              <i className="fi fi-rr-envelope-check" style={{ fontSize: '18px' }}></i>
            </Avatar>
            <Box>
              <Typography variant="body2" fontWeight={700} color="#166534">
                Receipt Sent to Your Email
              </Typography>
              <Typography variant="caption" color="#15803d">
                An official order receipt has been sent to <strong>{formData.customerEmail}</strong>.
              </Typography>
            </Box>
          </Paper>
        )}
        <Box 
          sx={{ 
            display: 'flex', 
            flexDirection: 'row', 
            justifyContent: 'center', 
            alignItems: 'center', 
            gap: 2, 
            flexWrap: 'wrap', 
            width: '100%', 
            mx: 'auto' 
          }}
        >
          <Button variant="outlined" color="inherit" onClick={() => navigate('/dashboard')}>
            Return to Dashboard
          </Button>
          <Button 
            variant="outlined" 
            color="primary" 
            onClick={() => {
              if (createdOrder) {
                generateReceiptPDF(createdOrder);
              } else {
                navigate(`/order/${success}`);
              }
            }} 
            startIcon={<i className="fi fi-rr-receipt" style={{ fontSize: '14px' }}></i>}
            sx={{ fontWeight: 700 }}
          >
            Download Official Receipt (PDF)
          </Button>
          <Button variant="contained" color="primary" onClick={() => navigate(`/order/${success}`)} sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <i className="fi fi-rr-box" style={{ fontSize: '14px' }}></i>
            View Order
          </Button>
        </Box>
      </Box>
    );
  }

  return (
    <Box sx={{ animation: 'fadeIn 0.5s ease-in-out', pb: 10 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2, flexWrap: 'wrap', fontSize: '0.85rem' }}>
        <Box
          component="button"
          type="button"
          onClick={() => setShowExitConfirm(true)}
          sx={{
            background: 'none',
            border: 'none',
            p: 0,
            cursor: 'pointer',
            color: '#64748b',
            display: 'flex',
            alignItems: 'center',
            gap: '4px',
            fontFamily: 'inherit',
            fontSize: '0.85rem',
            '&:hover': { color: 'primary.main' }
          }}
        >
          <i className="fi fi-rr-home" style={{ fontSize: 13 }} />
          <span>Catalog</span>
        </Box>
        <span style={{ color: '#cbd5e1' }}>/</span>
        <Button
          onClick={() => setShowExitConfirm(true)}
          sx={{ p: 0, minWidth: 'auto', textTransform: 'none', color: '#64748b', fontWeight: 500, fontSize: '0.85rem', '&:hover': { color: 'primary.main', bgcolor: 'transparent' } }}
        >
          Product Customization
        </Button>
        <span style={{ color: '#cbd5e1' }}>/</span>
        <Typography variant="body2" fontWeight={700} color="primary.main">
          Secure Checkout
        </Typography>
      </Box>

      {/* Page Title & Security Badge */}
      <Box sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, justifyContent: 'space-between', alignItems: { xs: 'flex-start', sm: 'center' }, gap: 2, mb: 3.5 }}>
        <Box>
          <Typography variant="h4" fontWeight={900} sx={{ letterSpacing: '-0.02em', color: 'text.primary', display: 'flex', alignItems: 'center', gap: 1.5, fontSize: { xs: '1.5rem', sm: '2rem', md: '2.25rem' } }}>
            <Avatar sx={{ bgcolor: 'rgba(30, 58, 138, 0.08)', color: '#1e3a8a', width: 44, height: 44, borderRadius: 2.5 }}>
              <i className="fi fi-rr-credit-card" style={{ fontSize: 22 }} />
            </Avatar>
            Secure Checkout
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
            Review order items, choose delivery logistics, and select verified payment terms.
          </Typography>
        </Box>

        <Stack direction="row" spacing={1.5} alignItems="center">
          <Chip
            icon={<i className="fi fi-rr-shield-check" style={{ fontSize: 14, color: '#16a34a' }} />}
            label="256-Bit SSL Encrypted"
            size="small"
            sx={{
              bgcolor: 'rgba(22, 163, 74, 0.08)',
              color: '#15803d',
              fontWeight: 700,
              fontSize: '0.72rem',
              border: '1px solid rgba(22, 163, 74, 0.2)',
              px: 0.5,
              py: 1.75
            }}
          />
        </Stack>
      </Box>

      <Paper
        elevation={0}
        sx={{
          p: { xs: 1.5, sm: 2 },
          mb: 4,
          borderRadius: 3.5,
          border: '1px solid',
          borderColor: 'divider',
          bgcolor: 'background.paper',
          display: 'grid',
          gridTemplateColumns: 'repeat(3, 1fr)',
          gap: { xs: 1, sm: 2 }
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: { xs: 1, sm: 1.5 } }}>
          <Box
            sx={{
              width: 32,
              height: 32,
              borderRadius: '50%',
              bgcolor: 'primary.main',
              color: '#fff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '0.85rem',
              fontWeight: 800,
              flexShrink: 0,
              boxShadow: '0 2px 8px rgba(79, 119, 45, 0.3)'
            }}
          >
            1
          </Box>
          <Box sx={{ minWidth: 0 }}>
            <Typography variant="caption" fontWeight={800} sx={{ color: 'text.primary', display: 'block', fontSize: { xs: '0.75rem', sm: '0.85rem' }, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
              Fulfillment
            </Typography>
            <Typography variant="caption" color="text.secondary" sx={{ display: { xs: 'none', md: 'block' }, fontSize: '0.7rem' }}>
              {formData.fulfillmentType === 'Delivery' ? 'Fleet Transport' : 'Plant Pick-up'}
            </Typography>
          </Box>
        </Box>

        <Box sx={{ display: 'flex', alignItems: 'center', gap: { xs: 1, sm: 1.5 } }}>
          <Box
            sx={{
              width: 32,
              height: 32,
              borderRadius: '50%',
              bgcolor: 'primary.main',
              color: '#fff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '0.85rem',
              fontWeight: 800,
              flexShrink: 0,
              boxShadow: '0 2px 8px rgba(79, 119, 45, 0.3)'
            }}
          >
            2
          </Box>
          <Box sx={{ minWidth: 0 }}>
            <Typography variant="caption" fontWeight={800} sx={{ color: 'text.primary', display: 'block', fontSize: { xs: '0.75rem', sm: '0.85rem' }, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
              Payment Terms
            </Typography>
            <Typography variant="caption" color="text.secondary" sx={{ display: { xs: 'none', md: 'block' }, fontSize: '0.7rem' }}>
              {formData.paymentPlan === 'COD_50' ? '50% Downpayment' : 'Full Payment'}
            </Typography>
          </Box>
        </Box>

        <Box sx={{ display: 'flex', alignItems: 'center', gap: { xs: 1, sm: 1.5 } }}>
          <Box
            sx={{
              width: 32,
              height: 32,
              borderRadius: '50%',
              bgcolor: 'grey.200',
              color: 'text.secondary',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '0.85rem',
              fontWeight: 800,
              flexShrink: 0
            }}
          >
            3
          </Box>
          <Box sx={{ minWidth: 0 }}>
            <Typography variant="caption" fontWeight={800} sx={{ color: 'text.secondary', display: 'block', fontSize: { xs: '0.75rem', sm: '0.85rem' }, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
              Confirmation
            </Typography>
            <Typography variant="caption" color="text.secondary" sx={{ display: { xs: 'none', md: 'block' }, fontSize: '0.7rem' }}>
              Order & Tracking
            </Typography>
          </Box>
        </Box>
      </Paper>

      <Grid container spacing={{ xs: 2.5, md: 4 }}>
        <Grid size={{ xs: 12, lg: 8 }}>
          <form id="checkout-form" onSubmit={handleSubmit}>
            <Stack spacing={3.5}>
              <Paper
                elevation={0}
                sx={{
                  p: { xs: 2.5, sm: 3.5 },
                  borderRadius: 3.5,
                  border: '1px solid',
                  borderColor: 'divider',
                  bgcolor: 'background.paper',
                  boxShadow: '0 4px 20px -8px rgba(0,0,0,0.04)'
                }}
              >
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 3 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                    <Avatar sx={{ bgcolor: 'primary.main', color: '#fff', width: 34, height: 34, fontWeight: 800, fontSize: '0.9rem' }}>
                      1
                    </Avatar>
                    <Box>
                      <Typography variant="h6" fontWeight={800} sx={{ letterSpacing: '-0.01em' }}>
                        Fulfillment & Delivery Destination
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        Choose jobsite fleet delivery or factory direct pick-up
                      </Typography>
                    </Box>
                  </Box>
                  <Chip
                    label={formData.fulfillmentType === 'Delivery' ? 'Jobsite Fleet' : 'Self Pick-up'}
                    size="small"
                    color={formData.fulfillmentType === 'Delivery' ? 'primary' : 'success'}
                    sx={{ fontWeight: 700, fontSize: '0.7rem' }}
                  />
                </Box>

                <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: 2, mb: 3.5 }}>
                  <Paper
                    elevation={0}
                    onClick={() => setFormData(prev => ({ ...prev, fulfillmentType: 'Delivery' }))}
                    sx={{
                      p: 2.5,
                      borderRadius: 3,
                      border: '2px solid',
                      borderColor: formData.fulfillmentType === 'Delivery' ? 'primary.main' : 'divider',
                      bgcolor: formData.fulfillmentType === 'Delivery' ? 'primary.50' : 'background.paper',
                      cursor: 'pointer',
                      transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                      position: 'relative',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: 1,
                      '&:hover': {
                        borderColor: formData.fulfillmentType === 'Delivery' ? 'primary.main' : 'grey.400',
                        transform: 'translateY(-2px)',
                        boxShadow: '0 6px 16px -6px rgba(0,0,0,0.08)'
                      }
                    }}
                  >
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <Avatar sx={{ bgcolor: formData.fulfillmentType === 'Delivery' ? 'primary.main' : 'grey.100', color: formData.fulfillmentType === 'Delivery' ? '#fff' : 'text.secondary', width: 40, height: 40 }}>
                        <i className="fi fi-rr-truck-side" style={{ fontSize: 18 }} />
                      </Avatar>
                      {formData.fulfillmentType === 'Delivery' && (
                        <Box sx={{ width: 22, height: 22, borderRadius: '50%', bgcolor: 'primary.main', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          <i className="fi fi-rr-check" style={{ fontSize: 11 }} />
                        </Box>
                      )}
                    </Box>
                    <Typography variant="subtitle2" fontWeight={800} sx={{ mt: 0.5 }}>
                      Jobsite Fleet Delivery
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      Dedicated boom truck or flatbed dispatch directly to your project location in CALABARZON.
                    </Typography>
                  </Paper>

                  <Paper
                    elevation={0}
                    onClick={() => setFormData(prev => ({ ...prev, fulfillmentType: 'Pickup' }))}
                    sx={{
                      p: 2.5,
                      borderRadius: 3,
                      border: '2px solid',
                      borderColor: formData.fulfillmentType === 'Pickup' ? 'primary.main' : 'divider',
                      bgcolor: formData.fulfillmentType === 'Pickup' ? 'primary.50' : 'background.paper',
                      cursor: 'pointer',
                      transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                      position: 'relative',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: 1,
                      '&:hover': {
                        borderColor: formData.fulfillmentType === 'Pickup' ? 'primary.main' : 'grey.400',
                        transform: 'translateY(-2px)',
                        boxShadow: '0 6px 16px -6px rgba(0,0,0,0.08)'
                      }
                    }}
                  >
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <Avatar sx={{ bgcolor: formData.fulfillmentType === 'Pickup' ? 'primary.main' : 'grey.100', color: formData.fulfillmentType === 'Pickup' ? '#fff' : 'text.secondary', width: 40, height: 40 }}>
                        <i className="fi fi-rr-shop" style={{ fontSize: 18 }} />
                      </Avatar>
                      <Chip label="FREE" size="small" sx={{ bgcolor: '#dcfce7', color: '#166534', fontWeight: 800, fontSize: '0.65rem', height: 20 }} />
                    </Box>
                    <Typography variant="subtitle2" fontWeight={800} sx={{ mt: 0.5 }}>
                      Imus Plant Pick-up
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      Collect directly at Mega Pacific Imus Manufacturing Plant once fabrication is completed.
                    </Typography>
                  </Paper>
                </Box>

                {formData.fulfillmentType === 'Pickup' && (
                  <Box
                    sx={{
                      mb: 3.5,
                      p: 2.5,
                      borderRadius: 3,
                      bgcolor: '#f0fdf4',
                      border: '1.5px solid #86efac',
                      display: 'flex',
                      gap: 2,
                      alignItems: 'flex-start'
                    }}
                  >
                    <Avatar sx={{ bgcolor: '#dcfce7', color: '#16a34a', width: 44, height: 44, flexShrink: 0 }}>
                      <i className="fi fi-rr-marker" style={{ fontSize: 20 }} />
                    </Avatar>
                    <Box sx={{ flex: 1 }}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 0.5 }}>
                        <Typography variant="subtitle2" fontWeight={800} color="#166534">
                          Mega Pacific Imus Plant Warehouse
                        </Typography>
                        <Chip label="Zero Delivery Fee" size="small" sx={{ bgcolor: '#bbf7d0', color: '#14532d', fontWeight: 700, fontSize: '0.65rem' }} />
                      </Box>
                      <Typography variant="body2" color="#166534" sx={{ mb: 1, fontSize: '0.85rem' }}>
                        Origin: <strong>Imus, Cavite, Region IV-A</strong> • Operational Hours: Mon–Sat, 8:00 AM – 5:00 PM
                      </Typography>
                      <Typography variant="caption" color="#15803d" sx={{ display: 'block', lineHeight: 1.5 }}>
                        Our logistics coordinator will send SMS notifications when roll-forming is done and your materials are loaded on the pick-up bay.
                      </Typography>
                    </Box>
                  </Box>
                )}

                {formData.fulfillmentType === 'Delivery' && (
                  <Box sx={{ mb: 3.5 }}>
                    <ShippingInfoWidget
                      formData={formData}
                      errors={errors}
                      hasProfile={hasProfile}
                      isEditingAddress={isEditingAddress}
                      onEdit={() => setIsEditingAddress(true)}
                      onCancelEdit={() => { setIsEditingAddress(false); setErrors({}); }}
                      onInputChange={handleInputChange}
                      addresses={addresses}
                      selectedAddressId={selectedAddressId}
                      onSelectAddress={handleSelectAddress}
                    />
                  </Box>
                )}

                <Box>
                  <Typography variant="subtitle2" fontWeight={700} sx={{ mb: 1, display: 'flex', alignItems: 'center', gap: 1 }}>
                    <i className="fi fi-rr-document" style={{ fontSize: 14, color: '#64748b' }} />
                    Special Instructions or Delivery Notes
                  </Typography>
                  <TextField
                    fullWidth
                    name="notes"
                    multiline
                    rows={2.5}
                    value={formData.notes}
                    onChange={handleInputChange}
                    placeholder={
                      formData.fulfillmentType === 'Pickup'
                        ? 'Provide driver details, plate number, or expected pickup schedule...'
                        : 'Provide specific landmarks, gate access instructions, or unloading coordinator contact...'
                    }
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        borderRadius: 2.5,
                        bgcolor: 'background.paper'
                      }
                    }}
                  />
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
                  boxShadow: '0 4px 20px -8px rgba(0,0,0,0.04)'
                }}
              >
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 3 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                    <Avatar sx={{ bgcolor: 'primary.main', color: '#fff', width: 34, height: 34, fontWeight: 800, fontSize: '0.9rem' }}>
                      2
                    </Avatar>
                    <Box>
                      <Typography variant="h6" fontWeight={800} sx={{ letterSpacing: '-0.01em' }}>
                        Payment Terms & Billing
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        Choose flexible 50% downpayment or full upfront payment
                      </Typography>
                    </Box>
                  </Box>
                  <Chip
                    label={formData.paymentPlan === 'COD_50' ? '50/50 Payment' : '100% Upfront'}
                    size="small"
                    variant="outlined"
                    sx={{ fontWeight: 700, fontSize: '0.7rem' }}
                  />
                </Box>

                <PaymentMethodWidget
                  paymentPlan={formData.paymentPlan}
                  paymentChannel={formData.paymentChannel}
                  subtotal={orderTotal}
                  shippingFee={shippingFee}
                  fulfillmentType={formData.fulfillmentType}
                  cardNumber={formData.cardNumber}
                  cardExpiry={formData.cardExpiry}
                  cardCvv={formData.cardCvv}
                  gcashNumber={formData.gcashNumber}
                  errors={errors}
                  onChange={handleInputChange}
                />
              </Paper>

              <Paper
                elevation={0}
                sx={{
                  p: { xs: 2.5, sm: 3.5 },
                  borderRadius: 3.5,
                  border: '1px solid',
                  borderColor: 'divider',
                  bgcolor: 'background.paper',
                  boxShadow: '0 4px 20px -8px rgba(0,0,0,0.04)'
                }}
              >
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 3 }}>
                  <Avatar sx={{ bgcolor: 'primary.main', color: '#fff', width: 34, height: 34, fontWeight: 800, fontSize: '0.9rem' }}>
                    3
                  </Avatar>
                  <Box>
                    <Typography variant="h6" fontWeight={800} sx={{ letterSpacing: '-0.01em' }}>
                      Order Confirmation & Guarantees
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      Verify order specifics before dispatch authorization
                    </Typography>
                  </Box>
                </Box>

                <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: 'repeat(3, 1fr)' }, gap: 1.5, mb: 3 }}>
                  <Box sx={{ p: 1.75, borderRadius: 2.5, bgcolor: 'grey.50', border: '1px solid', borderColor: 'divider', display: 'flex', alignItems: 'center', gap: 1.5 }}>
                    <i className="fi fi-rr-badge-check" style={{ fontSize: 20, color: '#16a34a' }} />
                    <Box>
                      <Typography variant="caption" fontWeight={700} display="block">Direct Manufacturer</Typography>
                      <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.65rem' }}>Genuine prime coil specs</Typography>
                    </Box>
                  </Box>
                  <Box sx={{ p: 1.75, borderRadius: 2.5, bgcolor: 'grey.50', border: '1px solid', borderColor: 'divider', display: 'flex', alignItems: 'center', gap: 1.5 }}>
                    <i className="fi fi-rr-truck-loading" style={{ fontSize: 20, color: '#2563eb' }} />
                    <Box>
                      <Typography variant="caption" fontWeight={700} display="block">Strapped Fleet Transit</Typography>
                      <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.65rem' }}>Damage-free jobsite arrival</Typography>
                    </Box>
                  </Box>
                  <Box sx={{ p: 1.75, borderRadius: 2.5, bgcolor: 'grey.50', border: '1px solid', borderColor: 'divider', display: 'flex', alignItems: 'center', gap: 1.5 }}>
                    <i className="fi fi-rr-receipt" style={{ fontSize: 20, color: '#9333ea' }} />
                    <Box>
                      <Typography variant="caption" fontWeight={700} display="block">BIR-Compliant Invoice</Typography>
                      <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.65rem' }}>Official receipt on delivery</Typography>
                    </Box>
                  </Box>
                </Box>

                {errors.submit && (
                  <Alert severity="error" sx={{ mb: 3, borderRadius: 2 }}>
                    {errors.submit}
                  </Alert>
                )}

                <Box sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, justifyContent: 'space-between', alignItems: { xs: 'stretch', sm: 'center' }, gap: 2, pt: 2, borderTop: '1px solid', borderColor: 'divider' }}>
                  <Box>
                    <Typography variant="caption" color="text.secondary" display="block">
                      {formData.paymentPlan === 'COD_50' ? 'Amount Due Right Now (50% Downpayment):' : 'Full Order Amount Due Now:'}
                    </Typography>
                    <Typography variant="h5" fontWeight={900} color="primary.main">
                      ₱{(formData.paymentPlan === 'COD_50' ? grandTotal * 0.5 : grandTotal).toLocaleString('en-PH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </Typography>
                  </Box>

                  <Button
                    type="submit"
                    variant="contained"
                    color="primary"
                    size="large"
                    disabled={isSubmitting}
                    startIcon={isSubmitting ? <CircularProgress size={20} color="inherit" /> : <i className="fi fi-rr-lock" style={{ fontSize: 16 }} />}
                    sx={{
                      py: 1.6,
                      px: 4,
                      borderRadius: 3,
                      fontWeight: 800,
                      fontSize: '1rem',
                      textTransform: 'none',
                      boxShadow: '0 8px 24px -6px rgba(79, 119, 45, 0.4)',
                      '&:hover': {
                        transform: 'translateY(-1px)',
                        boxShadow: '0 12px 28px -6px rgba(79, 119, 45, 0.5)'
                      }
                    }}
                  >
                    {isSubmitting ? 'Processing Order...' : formData.paymentPlan === 'COD_50' ? 'Confirm & Place Order (50%)' : 'Confirm & Place Order (Full)'}
                  </Button>
                </Box>
              </Paper>
            </Stack>
          </form>
        </Grid>

        <Grid size={{ xs: 12, lg: 4 }}>
          <Paper
            elevation={0}
            sx={{
              p: { xs: 2.5, sm: 3.5 },
              borderRadius: 4,
              border: '1px solid',
              borderColor: 'divider',
              bgcolor: 'background.paper',
              position: { xs: 'static', lg: 'sticky' },
              top: 96,
              boxShadow: '0 6px 24px -10px rgba(0,0,0,0.06)'
            }}
          >
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2.5 }}>
              <Typography variant="h6" fontWeight={800} sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <i className="fi fi-rr-shopping-bag" style={{ fontSize: 18, color: '#64748b' }} />
                Order Summary
              </Typography>
              <Chip
                label={`${orderItems.length} ${orderItems.length === 1 ? 'item' : 'items'}`}
                size="small"
                sx={{ fontWeight: 700, fontSize: '0.72rem', bgcolor: 'grey.100' }}
              />
            </Box>

            <Box sx={{ maxHeight: 380, overflowY: 'auto', pr: 0.5, mb: 2 }}>
              {orderItems.map((item, idx) => {
                const sheetUnitPrice = computeItemUnitPrice(item);
                const sheetOrigPrice = computeItemOriginalPrice(item);
                const hasItemDiscount = sheetOrigPrice > sheetUnitPrice;
                const itemKey = item.orderItemId || idx;

                return (
                  <Box key={itemKey} sx={{ display: 'flex', gap: 1.75, mb: 2.25, pb: 2, borderBottom: idx < orderItems.length - 1 ? '1px dashed #e2e8f0' : 'none' }}>
                    <Box
                      sx={{
                        width: 58,
                        height: 58,
                        bgcolor: 'grey.100',
                        borderRadius: 2.5,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        overflow: 'hidden',
                        flexShrink: 0,
                        border: '1px solid #e2e8f0'
                      }}
                    >
                      {(item.product.imageUrls?.[0] || item.product.imageUrl) ? (
                        <Box component="img" src={item.product.imageUrls?.[0] || item.product.imageUrl} alt={item.product.name} sx={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      ) : (
                        <i className="fi fi-rr-box" style={{ fontSize: 22, color: '#94a3b8' }} />
                      )}
                    </Box>
                    <Box sx={{ flex: 1, minWidth: 0 }}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                        <Typography variant="body2" fontWeight={800} sx={{ display: '-webkit-box', WebkitLineClamp: 1, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                          {item.product.name}
                        </Typography>
                        <IconButton
                          size="small"
                          onClick={() => handleRemoveItem(item.orderItemId)}
                          sx={{ p: 0.25, color: '#94a3b8', '&:hover': { color: '#ef4444' } }}
                          title="Remove from order"
                        >
                          <i className="fi fi-rr-trash" style={{ fontSize: 13 }} />
                        </IconButton>
                      </Box>

                      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, mt: 0.5 }}>
                        {item.customLength && (
                          <Chip label={`${item.customLength}m Cut`} size="small" variant="outlined" sx={{ height: 18, fontSize: '0.62rem', fontWeight: 700, color: 'primary.main', borderColor: 'primary.main' }} />
                        )}
                        {(item.thickness || (item.variant && !item.variant.isBaseProduct)) && (
                          <Chip label={item.thickness || item.variant?.name} size="small" variant="outlined" sx={{ height: 18, fontSize: '0.62rem' }} />
                        )}
                        {item.color && (
                          <Chip
                            icon={
                              <Box
                                sx={{
                                  width: 8,
                                  height: 8,
                                  borderRadius: '50%',
                                  bgcolor: getColorHex(item.color),
                                  ml: 0.5
                                }}
                              />
                            }
                            label={item.color}
                            size="small"
                            variant="outlined"
                            sx={{ height: 18, fontSize: '0.62rem' }}
                          />
                        )}
                      </Box>

                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 1 }}>
                        <Stack direction="row" spacing={0.5} alignItems="center" sx={{ bgcolor: 'grey.50', borderRadius: 2, p: 0.2, border: '1px solid #e2e8f0' }}>
                          <IconButton
                            size="small"
                            onClick={() => handleUpdateItemQuantity(item.orderItemId, (item.quantity || 1) - 1)}
                            sx={{ width: 22, height: 22, p: 0 }}
                            title="Decrease quantity"
                          >
                            <i className="fi fi-rr-minus" style={{ fontSize: 9, color: '#64748b' }} />
                          </IconButton>
                          <Typography variant="caption" fontWeight={800} sx={{ minWidth: 20, textAlign: 'center', fontSize: '0.75rem' }}>
                            {item.quantity}
                          </Typography>
                          <IconButton
                            size="small"
                            onClick={() => handleUpdateItemQuantity(item.orderItemId, (item.quantity || 1) + 1)}
                            sx={{ width: 22, height: 22, p: 0 }}
                            title="Increase quantity"
                          >
                            <i className="fi fi-rr-plus" style={{ fontSize: 9, color: '#16a34a' }} />
                          </IconButton>
                        </Stack>

                        <Box sx={{ textAlign: 'right' }}>
                          <Typography variant="body2" fontWeight={800} sx={{ color: '#16a34a', fontVariantNumeric: 'tabular-nums' }}>
                            ₱{(sheetUnitPrice * item.quantity).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                          </Typography>
                          {hasItemDiscount && (
                            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 0.5 }}>
                              <Typography variant="caption" sx={{ textDecoration: 'line-through', color: 'text.secondary', fontSize: '0.65rem' }}>
                                ₱{(sheetOrigPrice * item.quantity).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                              </Typography>
                              <Chip
                                label="-30%"
                                size="small"
                                sx={{
                                  height: 14,
                                  fontSize: '0.55rem',
                                  fontWeight: 900,
                                  bgcolor: 'rgba(239,68,68,0.1)',
                                  color: '#dc2626',
                                  borderRadius: '3px',
                                  px: 0.2
                                }}
                              />
                            </Box>
                          )}
                        </Box>
                      </Box>

                      <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 0.5 }}>
                        <Button
                          size="small"
                          variant="text"
                          onClick={() => handleOpenAddModal(item.product?.id)}
                          sx={{
                            fontSize: '0.66rem',
                            fontWeight: 700,
                            textTransform: 'none',
                            p: 0,
                            minWidth: 'auto',
                            color: 'primary.main',
                            '&:hover': { bgcolor: 'transparent', textDecoration: 'underline' }
                          }}
                        >
                          + Add another cut/length of this profile
                        </Button>
                      </Box>
                    </Box>
                  </Box>
                );
              })}
            </Box>

            <Button
              variant="outlined"
              color="primary"
              fullWidth
              onClick={() => handleOpenAddModal(null)}
              startIcon={<i className="fi fi-rr-plus" style={{ fontSize: 13 }} />}
              sx={{
                py: 1,
                mb: 2.25,
                borderRadius: 2.5,
                fontWeight: 800,
                fontSize: '0.82rem',
                textTransform: 'none',
                borderStyle: 'dashed',
                borderWidth: '1.5px',
                bgcolor: 'rgba(79, 119, 45, 0.03)',
                '&:hover': {
                  borderStyle: 'solid',
                  bgcolor: 'rgba(79, 119, 45, 0.08)'
                }
              }}
            >
              Add Other Products to Order
            </Button>

            <Divider sx={{ mb: 2 }} />

            <Stack spacing={1.25} sx={{ mb: 2.5 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                <Typography variant="body2" color="text.secondary">Materials Subtotal</Typography>
                <Typography variant="body2" fontWeight={700} sx={{ fontVariantNumeric: 'tabular-nums' }}>
                  ₱{orderTotal.toLocaleString('en-PH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </Typography>
              </Box>

              {(() => {
                const originalOrderTotal = orderItems.reduce((acc, item) => {
                  const p = (item.variant?.price ?? item.product?.price ?? (item.price || 0)) * (item.customLength ? Number(item.customLength) : 1);
                  const orig = (item.variant?.originalPrice ?? item.product?.originalPrice ?? item.originalPrice ?? (p ? Math.round((p / 0.70) * 100) / 100 : 0)) * (item.customLength ? Number(item.customLength) : 1);
                  return acc + (orig * item.quantity);
                }, 0);
                const totalOrderSavings = Math.max(0, originalOrderTotal - orderTotal);
                if (totalOrderSavings > 0) {
                  return (
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <Typography variant="body2" sx={{ color: '#dc2626', fontWeight: 600 }}>Less 30% Savings</Typography>
                      <Typography variant="body2" sx={{ color: '#dc2626', fontWeight: 800, fontVariantNumeric: 'tabular-nums' }}>
                        -₱{totalOrderSavings.toLocaleString('en-PH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </Typography>
                    </Box>
                  );
                }
                return null;
              })()}

              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                  <Typography variant="body2" color="text.secondary">Delivery Logistics Fee</Typography>
                  {isCalculatingShipping && <CircularProgress size={12} />}
                </Box>
                {formData.fulfillmentType === 'Pickup' ? (
                  <Chip label="FREE Pick-up" size="small" color="success" sx={{ height: 20, fontWeight: 800, fontSize: '0.65rem' }} />
                ) : (
                  <Typography variant="body2" fontWeight={800} color="text.primary" sx={{ fontVariantNumeric: 'tabular-nums' }}>
                    ₱{shippingFee.toLocaleString('en-PH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </Typography>
                )}
              </Box>

              {formData.fulfillmentType === 'Delivery' && shippingCalculation && (
                <Box sx={{ bgcolor: '#f8fafc', border: '1px solid #e2e8f0', p: 1.5, borderRadius: 2 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 0.5 }}>
                    <Typography variant="caption" color="text.secondary" sx={{ display: 'flex', alignItems: 'center', gap: 0.5, fontWeight: 600 }}>
                      <i className="fi fi-rr-truck-side" style={{ fontSize: 12 }} />
                      {shippingCalculation.vehicleType}
                    </Typography>
                    <Chip 
                      label={shippingCalculation.loadType} 
                      size="small" 
                      color={shippingCalculation.isBedLoad ? 'default' : 'warning'} 
                      sx={{ height: 18, fontSize: '0.6rem', fontWeight: 700 }} 
                    />
                  </Box>

                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Typography variant="caption" color="text.secondary">
                      Origin: Imus Plant ({shippingCalculation.destination?.distanceKm || 0} km)
                    </Typography>
                    <Button 
                      size="small" 
                      onClick={() => setShowShippingBreakdown(!showShippingBreakdown)}
                      sx={{ p: 0, minWidth: 'auto', fontSize: '0.65rem', textTransform: 'none', fontWeight: 700 }}
                    >
                      {showShippingBreakdown ? 'Hide details' : 'View breakdown'}
                    </Button>
                  </Box>

                  <Collapse in={showShippingBreakdown} timeout="auto" unmountOnExit>
                    <Divider sx={{ my: 1 }} />
                    <Stack spacing={0.5} sx={{ fontSize: '0.7rem', color: '#475569' }}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                        <span>Round-Trip Distance (KT):</span>
                        <strong>{shippingCalculation.breakdown?.kilometersTravelled} km</strong>
                      </Box>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                        <span>Fuel Load & Consumption:</span>
                        <span>₱{shippingCalculation.breakdown?.fuelCost?.toLocaleString('en-PH', { minimumFractionDigits: 2 })}</span>
                      </Box>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                        <span>Truck Manpower (TM):</span>
                        <span>₱{shippingCalculation.breakdown?.manpower?.toLocaleString('en-PH', { minimumFractionDigits: 2 })}</span>
                      </Box>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                        <span>Top-Load Additional (TLA):</span>
                        <span>₱{shippingCalculation.breakdown?.topLoadAdditional?.toLocaleString('en-PH', { minimumFractionDigits: 2 })}</span>
                      </Box>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                        <span>Vehicle Depreciation (VD):</span>
                        <span>₱{shippingCalculation.breakdown?.vehicleDepreciation?.toLocaleString('en-PH', { minimumFractionDigits: 2 })}</span>
                      </Box>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                        <span>20% Admin Cost (PMS):</span>
                        <span>₱{shippingCalculation.breakdown?.adminCost?.toLocaleString('en-PH', { minimumFractionDigits: 2 })}</span>
                      </Box>
                      {shippingCalculation.breakdown?.tollFee > 0 && (
                        <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                          <span>Expressway Toll Fee:</span>
                          <span>₱{shippingCalculation.breakdown?.tollFee?.toLocaleString('en-PH', { minimumFractionDigits: 2 })}</span>
                        </Box>
                      )}
                    </Stack>
                  </Collapse>
                </Box>
              )}

              {formData.paymentPlan === 'COD_50' && (
                <Box sx={{ bgcolor: '#f0fdf4', border: '1px solid #bbf7d0', p: 1.5, borderRadius: 2 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.75 }}>
                    <Typography variant="caption" fontWeight={700} color="#166534">50% Downpayment (Pay Now):</Typography>
                    <Typography variant="caption" fontWeight={900} color="#166534" sx={{ fontVariantNumeric: 'tabular-nums' }}>
                      ₱{(grandTotal * 0.5).toLocaleString('en-PH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </Typography>
                  </Box>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Typography variant="caption" fontWeight={700} color="#9a3412">50% Balance (Upon Delivery):</Typography>
                    <Typography variant="caption" fontWeight={900} color="#9a3412" sx={{ fontVariantNumeric: 'tabular-nums' }}>
                      ₱{(grandTotal * 0.5).toLocaleString('en-PH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </Typography>
                  </Box>
                </Box>
              )}
            </Stack>

            <Divider sx={{ mb: 2 }} />

            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', mb: 2.5 }}>
              <Box>
                <Typography variant="subtitle2" fontWeight={800} color="text.primary">Total Order Value</Typography>
                <Typography variant="caption" color="text.secondary">
                  {formData.fulfillmentType === 'Pickup' ? 'Free Plant Pickup' : `Delivering to ${formData.city || 'CALABARZON'}`}
                </Typography>
              </Box>
              <Typography variant="h5" fontWeight={900} color="primary.main" sx={{ fontVariantNumeric: 'tabular-nums', letterSpacing: '-0.02em' }}>
                ₱{grandTotal.toLocaleString('en-PH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </Typography>
            </Box>

            <Button
              type="submit"
              form="checkout-form"
              variant="contained"
              color="primary"
              fullWidth
              size="large"
              disabled={isSubmitting}
              startIcon={isSubmitting ? <CircularProgress size={18} color="inherit" /> : <i className="fi fi-rr-lock" style={{ fontSize: 14 }} />}
              sx={{
                py: 1.5,
                borderRadius: 2.5,
                fontWeight: 800,
                fontSize: '0.95rem',
                textTransform: 'none',
                mb: 1.5,
                boxShadow: '0 6px 20px -4px rgba(79, 119, 45, 0.4)'
              }}
            >
              {isSubmitting ? 'Processing Order...' : formData.paymentPlan === 'COD_50' ? `Pay 50% (₱${(grandTotal * 0.5).toLocaleString('en-PH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })})` : `Pay Full (₱${grandTotal.toLocaleString('en-PH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })})`}
            </Button>

            <Button
              type="button"
              variant="outlined"
              color="inherit"
              fullWidth
              size="medium"
              onClick={() => {
                generateQuotationPDF({
                  customerName: formData.customerName || user?.customerProfile?.name || user?.name || 'Valued Client',
                  customerEmail: formData.customerEmail || user?.email || '',
                  customerPhone: formData.contactNumber || '',
                  deliveryLocation: formData.fulfillmentType === 'Pickup'
                    ? 'Store / Plant Pick-up (Plant Loading Dock 1)'
                    : `${formData.address || ''}, ${formData.city || ''}, ${formData.province || ''}`.replace(/^, |, $/g, '').trim() || 'CALABARZON / Metro Manila Area',
                  items: orderItems.map(itm => ({
                    name: itm.product?.name || itm.name || 'Roofing Item',
                    thickness: itm.thickness || itm.variant?.thickness || '0.35mm',
                    color: itm.color || 'Standard',
                    customLength: itm.customLength || null,
                    quantity: itm.quantity || 1,
                    unitPrice: computeItemUnitPrice(itm),
                    total: computeItemUnitPrice(itm) * (itm.quantity || 1)
                  })),
                  total: grandTotal
                });
              }}
              startIcon={<i className="fi fi-rr-document" style={{ fontSize: 14, color: '#1e3a8a' }} />}
              sx={{
                py: 1.2,
                borderRadius: 2.5,
                fontWeight: 700,
                fontSize: '0.85rem',
                textTransform: 'none',
                mb: 2,
                borderColor: 'divider',
                color: 'text.primary',
                '&:hover': {
                  borderColor: '#1e3a8a',
                  color: '#1e3a8a',
                  bgcolor: 'rgba(30, 58, 138, 0.04)'
                }
              }}
            >
              Export Project Quotation (PDF)
            </Button>

            <Typography variant="caption" color="text.secondary" sx={{ display: 'block', textAlign: 'center', fontSize: '0.7rem' }}>
              🔒 Guaranteed safe checkout powered by Mega Pacific Secure Gateway
            </Typography>
          </Paper>
        </Grid>
      </Grid>

      <AddProductToOrderModal
        open={addProductModalOpen}
        onClose={() => setAddProductModalOpen(false)}
        onAddProduct={handleAddProductToOrder}
        currentItems={orderItems}
        initialProductId={modalInitialProductId}
      />

      <Dialog
        open={showExitConfirm}
        onClose={() => setShowExitConfirm(false)}
        maxWidth="xs"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: 3.5,
            p: 1,
            textAlign: 'center'
          }
        }}
      >
        <DialogContent sx={{ pt: 3.5, pb: 2 }}>
          <Box
            sx={{
              width: 56,
              height: 56,
              borderRadius: '50%',
              bgcolor: 'warning.light',
              color: 'warning.dark',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              mx: 'auto',
              mb: 2.5
            }}
          >
            <i className="fi fi-rr-exclamation" style={{ fontSize: 26 }} />
          </Box>
          <Typography variant="h6" fontWeight={900} gutterBottom sx={{ letterSpacing: '-0.01em' }}>
            Leave Checkout?
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ px: 1, lineHeight: 1.6 }}>
            You have an active roofing pre-order in progress. If you leave now, your item specifications and pricing calculations will not be saved.
          </Typography>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2.5, flexDirection: { xs: 'column-reverse', sm: 'row' }, gap: 1 }}>
          <Button
            fullWidth
            variant="outlined"
            onClick={handleConfirmExit}
            sx={{
              borderRadius: 2,
              color: 'text.secondary',
              borderColor: 'divider',
              textTransform: 'none',
              fontWeight: 600,
              py: 1,
              '&:hover': { borderColor: 'error.main', color: 'error.main', bgcolor: 'error.light' }
            }}
          >
            Discard & Leave
          </Button>
          <Button
            fullWidth
            variant="contained"
            color="primary"
            onClick={() => setShowExitConfirm(false)}
            sx={{
              borderRadius: 2,
              textTransform: 'none',
              fontWeight: 700,
              py: 1,
              boxShadow: '0 4px 12px rgba(79, 119, 45, 0.25)'
            }}
          >
            Stay on Checkout
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Checkout;
