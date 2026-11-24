import React, { useState, useEffect, useMemo, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';
import { generateReceiptPDF, generateQuotationPDF } from '../../utils/documentGenerator';
import { getZipCodeForLocation } from '../../utils/locationService';
import ShippingInfoWidget from '../../components/ShippingInfoWidget';
import PaymentMethodWidget from '../../components/PaymentMethodWidget';
import AddProductToOrderModal from '../../components/AddProductToOrderModal';
import PaypalCheckoutModal from '../../components/PaypalCheckoutModal';
import {
  CustomOrderSuccessIcon,
  CustomShoppingCartIcon,
  CustomHomeIcon,
  CustomCreditCardIcon,
  CustomLocalShippingIcon,
  CustomCheckIcon,
  CustomStorefrontIcon,
  CustomLocationOnIcon,
  CustomDescriptionIcon,
  CustomInventory2Icon,
  CustomDeleteIcon,
  CustomRemoveIcon,
  CustomAddIcon,
  CustomWarningIcon
} from '../../components/icons';
import { isCustomLengthProfile } from './buildProductOptions';
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
import { validateRealisticEmail } from '../../utils/emailValidator';
import {
  generateCheckoutRequestId,
  savePendingPaymentRecovery,
  loadPendingPaymentRecovery,
  clearPendingPaymentRecovery,
  isNetworkDisconnectError
} from '../../utils/pendingPaymentRecovery';
import { useCheckoutLivePrices } from '../../hooks/useCheckoutLivePrices';
import { mergeOrderItemIntoList, mergeOrderItems } from '../../utils/orderItemMerger';


const Checkout = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, token } = useAuth();

  const state = location.state || {};
  let initialOrderItems = [];
  
  if (state.isBulk && state.items) {
    const normalizedBulkItems = state.items.map((item, idx) => ({
      ...item,
      orderItemId: item.orderItemId || item.id || `bulk-${item.product?.id || item.productId}-${item.variantId || 'base'}-${idx}-${Date.now()}`
    }));
    initialOrderItems = mergeOrderItems(normalizedBulkItems);
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

  
  const computeItemUnitPrice = (item) => {
    const isCustomEligible = isCustomLengthProfile(item.product?.type || item.type);
    const isPerMeter = isCustomEligible && (item.product?.unit === 'per meter' || item.product?.unit === 'meter' || item.product?.isPreOrder);
    const len = isPerMeter && item.customLength ? Number(item.customLength) : 1;
    const unitP = item.variant?.price ?? item.product?.price ?? (item.price || 0);
    return unitP * len;
  };

  const getItemDiscountPercent = (item) => {
    const rawPct = item.variant?.discountPercent ?? item.product?.discountPercent ?? item.discountPercent ?? 30;
    const numericPct = Number(rawPct);
    return Number.isNaN(numericPct) ? 0 : Math.max(0, Math.min(95, numericPct));
  };

  const computeItemOriginalPrice = (item) => {
    const isCustomEligible = isCustomLengthProfile(item.product?.type || item.type);
    const isPerMeter = isCustomEligible && (item.product?.unit === 'per meter' || item.product?.unit === 'meter' || item.product?.isPreOrder);
    const len = isPerMeter && item.customLength ? Number(item.customLength) : 1;
    const unitP = item.variant?.price ?? item.product?.price ?? (item.price || 0);
    const itemDiscountPct = getItemDiscountPercent(item);
    if (itemDiscountPct <= 0) {
      return unitP * len;
    }
    const origP =
      item.variant?.originalPrice ??
      item.product?.originalPrice ??
      item.originalPrice ??
      (unitP && itemDiscountPct < 100 ? Math.round((unitP / (1 - itemDiscountPct / 100)) * 100) / 100 : unitP);
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
    setOrderItems((prev) => mergeOrderItemIntoList(prev, newItem));
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
    paymentPlan: 'COD_50',
    paymentChannel: 'PayPal',
    fulfillmentType: 'Delivery'
  });

  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [paypalConfig, setPaypalConfig] = useState({
    enabled: false,
    settingEnabled: true,
    configured: false,
    mode: 'sandbox',
    clientId: ''
  });
  const [paypalModalOpen, setPaypalModalOpen] = useState(false);
  
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
  const grandTotal = Math.round(((orderTotal || 0) + shippingFee) * 100) / 100;
  const downpaymentAmount = Math.round(grandTotal * 0.5 * 100) / 100;
  const balanceUponDeliveryAmount = Math.round(Math.max(0, grandTotal - downpaymentAmount) * 100) / 100;
  const payableNowAmount = formData.paymentPlan === 'COD_50' ? downpaymentAmount : grandTotal;

  useEffect(() => {
    if (success) return;

    
    window.history.pushState({ isCheckoutLock: true }, '', window.location.href);

    const handlePopState = () => {
      if (isLeavingRef.current) return;
      
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
        const [res, gatewayRes] = await Promise.all([
          axios.get(`${API_URL}/api/auth/profile`, {
            headers: { Authorization: `Bearer ${token}` }
          }),
          axios.get(`${API_URL}/api/payments/config`).catch(() => null)
        ]);
        if (gatewayRes?.data?.data) {
          const cfg = gatewayRes.data.data;
          setPaypalConfig({
            enabled: Boolean(cfg.paypalEnabled),
            settingEnabled: cfg.paypalSettingEnabled !== false,
            configured: Boolean(cfg.paypalConfigured),
            mode: cfg.paypalMode || 'sandbox',
            clientId: cfg.paypalClientId || ''
          });
        }
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

    if (name === 'contactNumber') {
      let digits = value.replace(/[^0-9]/g, '');
      if (digits.startsWith('63')) digits = '0' + digits.slice(2);
      else if (digits.length > 0 && !digits.startsWith('0') && digits.startsWith('9')) digits = '0' + digits;
      if (digits.length > 0 && !digits.startsWith('0')) return;
      if (digits.length > 1 && !digits.startsWith('09')) return;
      setFormData(prev => ({ ...prev, contactNumber: digits.slice(0, 11) }));
      if (errors.contactNumber) setErrors(prev => ({ ...prev, contactNumber: '' }));
      return;
    }

    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: '' }));
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.customerName.trim()) newErrors.customerName = 'Full Name is required';
    if (!formData.customerEmail.trim()) {
      newErrors.customerEmail = 'Email is required';
    } else {
      const emailCheck = validateRealisticEmail(formData.customerEmail.trim());
      if (!emailCheck.isValid) {
        newErrors.customerEmail = emailCheck.error;
      }
    }

    if (formData.fulfillmentType === 'Delivery') {
      if (!formData.contactNumber?.trim()) {
        newErrors.contactNumber = 'Contact Number is required';
      } else if (!/^09[0-9]{9}$/.test(formData.contactNumber.trim())) {
        newErrors.contactNumber = 'Must be an 11-digit Philippine mobile number starting with 09 (ex. 09171234567)';
      }
      if (!formData.address?.trim()) newErrors.address = 'Complete Address is required';
      if (!formData.city?.trim()) newErrors.city = 'City is required';
      if (!formData.province?.trim()) newErrors.province = 'Province is required';
      if (!formData.zipCode?.trim()) newErrors.zipCode = 'Zip Code is required';
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

  const clientRequestIdRef = useRef(generateCheckoutRequestId());
  const pendingVerifiedPaymentRef = useRef(null);
  const paypalModalOpenRef = useRef(false);
  const [modalClosedDueToPriceChange, setModalClosedDueToPriceChange] = useState(false);
  const [isOffline, setIsOffline] = useState(
    typeof navigator !== 'undefined' ? navigator.onLine === false : false
  );
  const [recoveringPendingPayment, setRecoveringPendingPayment] = useState(false);

  useEffect(() => {
    paypalModalOpenRef.current = paypalModalOpen;
  }, [paypalModalOpen]);

  // Keep checkout item prices and discounts synchronized in real time when Sales updates the catalog
  const {
    priceUpdateNotice,
    isRefreshingPrices,
    refreshLivePrices,
    dismissPriceUpdateNotice
  } = useCheckoutLivePrices({
    orderItems,
    setOrderItems,
    token,
    disabled: Boolean(success),
    onPricesChanged: () => {
      // Close any open unpaid PayPal session so the customer gets the updated total
      if (paypalModalOpenRef.current && !pendingVerifiedPaymentRef.current) {
        setPaypalModalOpen(false);
        clearPendingPaymentRecovery();
        setModalClosedDueToPriceChange(true);
      } else {
        setModalClosedDueToPriceChange(false);
      }
      // Rotate client request ID so the refreshed price submission is treated as a fresh intent
      clientRequestIdRef.current = generateCheckoutRequestId();
    }
  });

  const buildOrderRequestConfig = ({ paypalOrderId = null, paypalCaptureId = null } = {}) => {
    const paymentModeDescription = formData.paymentPlan === 'COD_50'
      ? 'Cash on Delivery (50% Downpayment)'
      : 'PayPal - Full Payment';

    const paymentDetails = {
      paymentPlan: formData.paymentPlan,
      paymentChannel: 'PayPal',
      paymentMode: paymentModeDescription,
      shippingFee: shippingFee,
      expectedItemsTotal: Math.round((orderTotal || 0) * 100) / 100,
      paypalOrderId: paypalOrderId || undefined,
      paypalCaptureId: paypalCaptureId || undefined,
      clientRequestId: clientRequestIdRef.current
    };

    const isBulkRequest = Boolean(state.isBulk || orderItems.length > 1);
    if (isBulkRequest) {
      return {
        isBulk: true,
        payload: {
          userId: user?.id || user?.userId,
          fulfillmentType: formData.fulfillmentType,
          customerEmail: formData.customerEmail,
          shippingName: formData.customerName,
          shippingContactNumber: formData.contactNumber || '',
          shippingAddress: formData.address,
          shippingCity: formData.city,
          shippingProvince: formData.province,
          shippingZipCode: formData.zipCode,
          notes: formData.notes,
          ...paymentDetails,
          items: orderItems.map(item => ({
            productId: item?.product?.id || item?.productId || item?.id,
            variantId: item?.variant?.id || item?.variantId || null,
            quantity: item?.quantity || 1,
            customLength: item?.customLength ? Number(item.customLength) : null,
            thickness: item?.thickness || null,
            color: item?.color || null
          }))
        }
      };
    }

    const singleItem = orderItems[0];
    return {
      isBulk: false,
      payload: {
        userId: user?.id || user?.userId,
        productId: singleItem?.product?.id || singleItem?.productId || singleItem?.id,
        variantId: singleItem?.variant?.id || singleItem?.variantId || null,
        quantity: singleItem?.quantity || 1,
        customLength: singleItem?.customLength ? Number(singleItem.customLength) : null,
        thickness: singleItem?.thickness || null,
        color: singleItem?.color || null,
        fulfillmentType: formData.fulfillmentType,
        customerEmail: formData.customerEmail,
        shippingName: formData.customerName,
        shippingContactNumber: formData.contactNumber || '',
        shippingAddress: formData.address,
        shippingCity: formData.city,
        shippingProvince: formData.province,
        shippingZipCode: formData.zipCode,
        notes: formData.notes,
        ...paymentDetails
      }
    };
  };

  const executeOrderCreation = async ({ paypalOrderId = null, paypalCaptureId = null } = {}) => {
    if (submittingRef.current || isSubmitting) return;
    submittingRef.current = true;
    setIsSubmitting(true);

    if (formData.fulfillmentType === 'Delivery' && (isEditingAddress || !hasProfile)) {
      await saveProfileAddress();
    }

    try {
      const API_URL = import.meta.env.VITE_API_URL || '';
      const { isBulk, payload } = buildOrderRequestConfig({ paypalOrderId, paypalCaptureId });
      const endpoint = isBulk ? `${API_URL}/api/customer/orders/bulk` : `${API_URL}/api/customer/orders`;

      const res = await axios.post(endpoint, payload, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (res.data.success) {
        clearPendingPaymentRecovery();
        pendingVerifiedPaymentRef.current = null;
        isLeavingRef.current = true;
        setPaypalModalOpen(false);
        setSuccess(res.data.data.id);
        setCreatedOrder(res.data.data);
      }
    } catch (err) {
      console.error('Failed to submit order', err);
      setPaypalModalOpen(false);
      if (isNetworkDisconnectError(err)) {
        if (paypalCaptureId || paypalOrderId) {
          pendingVerifiedPaymentRef.current = {
            paypalOrderId,
            paypalCaptureId
          };
          setErrors({
            submit: `Your PayPal payment was verified (Ref: ${paypalCaptureId || paypalOrderId}), but your internet disconnected while saving your order. Keep this page open — your order will finish saving automatically once you reconnect, or click Pay again to retry safely without being charged twice.`
          });
        } else {
          setErrors({
            submit: 'Your internet connection dropped while sending your order. Once you reconnect, click Pay again — duplicate-order protection ensures you will not be ordered or charged twice.'
          });
        }
      } else if (
        err.response?.status === 409 &&
        (err.response?.data?.code === 'PRICE_CHANGED' || err.response?.data?.details?.type === 'PRICE_CHANGED')
      ) {
        await refreshLivePrices({ silentIfUnchanged: false });
        setErrors({
          submit: 'Product prices or discounts were just updated. Your order summary has been refreshed — please review the updated total and click Pay again to confirm.'
        });
      } else if (err.response?.status === 409 && err.response?.data?.details?.type === 'STOCK_ERROR') {
         const { itemName, available, requested, unit, message } = err.response.data.details;
         if (unit === 'meters') {
           setErrors({
             submit:
               message ||
               (available === 0
                 ? `The item "${itemName}" is currently out of coil stock. Please choose another color or thickness.`
                 : `Not enough coil length in stock for "${itemName}". Only ${Number(available).toFixed(2)}m remains, but your order needs ${Number(requested).toFixed(2)}m. Please lower your cut length or sheet quantity and try again.`)
           });
         } else if (available === 0) {
           setErrors({ submit: `The item "${itemName}" is Out of Stock, please find another item available.` });
         } else {
           setErrors({ submit: `The item "${itemName}" only has ${available} units left (you requested ${requested}). We've adjusted your quantity. Please review and try again.` });
           
           setOrderItems(orderItems.map(item => {
             const nameMatches = item.variant ? item.variant.name === itemName : item.product.name === itemName;
             return nameMatches ? { ...item, quantity: available } : item;
           }));
         }
      } else {
        const serverError = err.response?.data?.error || err.response?.data?.message || (typeof err.response?.data === 'string' ? err.response.data : null) || err.message;
        setErrors({ submit: serverError || 'Failed to place order. Please try again.' });
      }
      submittingRef.current = false;
      setIsSubmitting(false);
    }
  };

  // Monitor browser online/offline state and auto-recover any verified PayPal payment on reconnect
  useEffect(() => {
    const handleOfflineEvent = () => setIsOffline(true);

    const handleOnlineRecovery = async () => {
      setIsOffline(false);

      // Resume an already-captured PayPal payment that failed to reach the server while offline
      if (pendingVerifiedPaymentRef.current && !submittingRef.current) {
        setErrors({});
        await executeOrderCreation(pendingVerifiedPaymentRef.current);
        return;
      }

      // Check localStorage for a previously initiated PayPal session
      const saved = loadPendingPaymentRecovery(user?.id || user?.userId);
      if (!saved?.paypalOrderId || !saved?.orderPayload || !token || submittingRef.current) return;

      try {
        setRecoveringPendingPayment(true);
        const API_URL = import.meta.env.VITE_API_URL || '';
        const statusRes = await axios.get(
          `${API_URL}/api/payments/paypal/status/${saved.paypalOrderId}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        const statusData = statusRes.data?.data;
        if (statusData?.isPaid) {
          const endpoint = saved.isBulk
            ? `${API_URL}/api/customer/orders/bulk`
            : `${API_URL}/api/customer/orders`;
          const orderRes = await axios.post(
            endpoint,
            {
              ...saved.orderPayload,
              clientRequestId: saved.clientRequestId,
              paypalOrderId: statusData.paypalOrderId,
              paypalCaptureId: statusData.captureId
            },
            { headers: { Authorization: `Bearer ${token}` } }
          );
          if (orderRes.data?.success && orderRes.data?.data?.id) {
            clearPendingPaymentRecovery();
            isLeavingRef.current = true;
            setPaypalModalOpen(false);
            setSuccess(orderRes.data.data.id);
            setCreatedOrder(orderRes.data.data);
          }
        }
      } catch (recoveryErr) {
        console.warn('Checkout reconnect recovery check skipped:', recoveryErr?.message);
      } finally {
        setRecoveringPendingPayment(false);
      }
    };

    window.addEventListener('offline', handleOfflineEvent);
    window.addEventListener('online', handleOnlineRecovery);

    // Also run once on mount in case the user refreshed after completing PayPal payment
    if (typeof navigator === 'undefined' || navigator.onLine !== false) {
      handleOnlineRecovery();
    }

    return () => {
      window.removeEventListener('offline', handleOfflineEvent);
      window.removeEventListener('online', handleOnlineRecovery);
    };
  }, [token, user?.id, user?.userId]);

  const handleConfirmCheckoutOrder = async (e) => {
    e.preventDefault();
    if (submittingRef.current || isSubmitting) return;
    if (!validateForm()) return;

    if (pendingVerifiedPaymentRef.current) {
      await executeOrderCreation(pendingVerifiedPaymentRef.current);
      return;
    }

    if (!paypalConfig.settingEnabled) {
      setErrors({
        submit: 'PayPal checkout is currently paused by the system administrator. Please try again later.'
      });
      return;
    }

    // Check live prices before opening PayPal so the charged total always matches the latest discount
    const liveCheck = await refreshLivePrices({ silentIfUnchanged: true });
    if (liveCheck.changed) {
      setErrors({
        submit: 'Product prices or discounts were just updated. Your total has been refreshed — please review the new amount and click Pay again to open PayPal.'
      });
      return;
    }

    setModalClosedDueToPriceChange(false);
    setErrors({});
    setPaypalModalOpen(true);
  };

  const handlePaypalSessionCreated = (session) => {
    if (!session?.paypalOrderId) return;
    const { isBulk, payload } = buildOrderRequestConfig({ paypalOrderId: session.paypalOrderId });
    savePendingPaymentRecovery({
      userId: user?.id || user?.userId,
      clientRequestId: clientRequestIdRef.current,
      paypalOrderId: session.paypalOrderId,
      amountPhp: payableNowAmount,
      paymentPlan: formData.paymentPlan,
      isBulk,
      orderPayload: payload
    });
  };

  const handlePaypalPaymentConfirmed = async (paymentInfo) => {
    await executeOrderCreation({
      paypalOrderId: paymentInfo?.paypalOrderId || null,
      paypalCaptureId: paymentInfo?.captureId || null
    });
  };

  // Render access, completion, empty, and loading states only after all React hooks have run
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

  if (success) {
    return (
      <Box sx={{ py: 10, textAlign: 'center', animation: 'fadeIn 0.5s ease-in-out' }}>
        <Box sx={{ display: 'flex', justifyContent: 'center', mb: 3 }}>
          <CustomOrderSuccessIcon size={88} />
        </Box>
        <Typography variant="h3" fontWeight="bold" gutterBottom>Order Placed Successfully!</Typography>
        <Typography color="text.secondary" sx={{ mb: 4, maxWidth: 500, mx: 'auto' }}>
          Thank you for your purchase. We have received your order and will process it.
        </Typography>
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
            Browse Other Product
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
            
            sx={{ fontWeight: 700 }}
          >
            Download Official Receipt (PDF)
          </Button>
          <Button variant="contained" color="primary" onClick={() => navigate(`/order/${success}`)} sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            
            View Order
          </Button>
        </Box>
      </Box>
    );
  }

  if (orderItems.length === 0) {
    return (
      <Box sx={{ py: 10, px: 2, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <Paper elevation={0} sx={{ p: { xs: 3, sm: 5 }, textAlign: 'center', maxWidth: 480, width: '100%', borderRadius: 4, border: '1px solid', borderColor: 'divider', bgcolor: 'background.paper' }}>
          <Box sx={{ width: 64, height: 64, borderRadius: '50%', bgcolor: 'grey.100', display: 'flex', alignItems: 'center', justifyContent: 'center', mx: 'auto', mb: 2 }}>
            <CustomShoppingCartIcon size={28} color="#94a3b8" />
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

  return (
    <Box sx={{ pb: 10 }}>
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
          <CustomHomeIcon size={14} color="#64748b" />
          <span>Catalog</span>
        </Box>
        <span style={{ color: '#cbd5e1' }}>/</span>
        <Typography variant="body2" fontWeight={700} color="primary.main">
          Secure Checkout
        </Typography>
      </Box>

      <Box sx={{ mb: 3.5 }}>
        <Typography variant="h4" fontWeight={900} sx={{ letterSpacing: '-0.02em', color: 'text.primary', display: 'flex', alignItems: 'center', gap: 1.5, fontSize: { xs: '1.5rem', sm: '2rem', md: '2.25rem' } }}>
          <Avatar sx={{ bgcolor: 'rgba(30, 58, 138, 0.08)', color: '#1e3a8a', width: 44, height: 44, borderRadius: 2.5 }}>
            <CustomCreditCardIcon size={22} color="#1e3a8a" />
          </Avatar>
          Secure Checkout
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
          Review order items, choose delivery logistics, and select verified payment terms.
        </Typography>
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
          gridTemplateColumns: 'repeat(2, 1fr)',
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
              Delivery Method
            </Typography>
            <Typography variant="caption" color="text.secondary" sx={{ display: { xs: 'none', md: 'block' }, fontSize: '0.7rem' }}>
              {formData.fulfillmentType === 'Delivery' ? 'Truck Delivery' : 'Factory Pick-up'}
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
      </Paper>

      <Grid container spacing={{ xs: 2.5, md: 4 }} alignItems="flex-start">
        <Grid size={{ xs: 12, lg: 8 }}>
          <form id="checkout-form" onSubmit={handleConfirmCheckoutOrder}>
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
                        Delivery or Pick-up
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        Choose between truck delivery to your address or picking up your order at our factory
                      </Typography>
                    </Box>
                  </Box>
                  <Chip
                    label={formData.fulfillmentType === 'Delivery' ? 'Truck Delivery' : 'Factory Pick-up'}
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
                        <CustomLocalShippingIcon size={20} color={formData.fulfillmentType === 'Delivery' ? '#ffffff' : 'inherit'} />
                      </Avatar>
                      {formData.fulfillmentType === 'Delivery' && (
                        <Box sx={{ width: 22, height: 22, borderRadius: '50%', bgcolor: 'primary.main', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          <CustomCheckIcon size={12} color="#ffffff" />
                        </Box>
                      )}
                    </Box>
                    <Typography variant="subtitle2" fontWeight={800} sx={{ mt: 0.5 }}>
                      Delivery to Your Location
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      Direct delivery by truck to your home or construction site in CALABARZON.
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
                        <CustomStorefrontIcon size={20} color={formData.fulfillmentType === 'Pickup' ? '#ffffff' : 'inherit'} />
                      </Avatar>
                      <Chip label="FREE" size="small" sx={{ bgcolor: '#dcfce7', color: '#166534', fontWeight: 800, fontSize: '0.65rem', height: 20 }} />
                    </Box>
                    <Typography variant="subtitle2" fontWeight={800} sx={{ mt: 0.5 }}>
                      Pick-up at Factory (Imus)
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      Pick up your items directly at our factory in Imus, Cavite once your order is ready.
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
                      <CustomLocationOnIcon size={22} color="#16a34a" />
                    </Avatar>
                    <Box sx={{ flex: 1 }}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 1, mb: 0.5 }}>
                        <Typography variant="subtitle2" fontWeight={800} color="#166534">
                          Mega Pacific Factory Warehouse
                        </Typography>
                        <Chip label="Zero Delivery Fee" size="small" sx={{ bgcolor: '#bbf7d0', color: '#14532d', fontWeight: 700, fontSize: '0.65rem' }} />
                      </Box>
                      <Typography variant="body2" color="#166534" sx={{ mb: 1, fontSize: '0.85rem' }}>
                        Location: <strong>Imus, Cavite</strong> • Store Hours: Monday to Saturday, 8:00 AM – 5:00 PM
                      </Typography>
                      <Typography variant="caption" color="#15803d" sx={{ display: 'block', lineHeight: 1.5 }}>
                        We will email you as soon as your roofing materials are ready for pick-up.
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
                    <CustomDescriptionIcon size={14} color="#64748b" />
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
                <Box
                  sx={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: { xs: 'flex-start', sm: 'center' },
                    flexWrap: 'wrap',
                    gap: 1.5,
                    mb: 3
                  }}
                >
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, minWidth: 0 }}>
                    <Avatar sx={{ bgcolor: 'primary.main', color: '#fff', width: 34, height: 34, fontWeight: 800, fontSize: '0.9rem', flexShrink: 0 }}>
                      2
                    </Avatar>
                    <Box sx={{ minWidth: 0 }}>
                      <Typography variant="h6" fontWeight={800} sx={{ letterSpacing: '-0.01em', fontSize: { xs: '1.05rem', sm: '1.25rem' } }}>
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
                    sx={{ fontWeight: 700, fontSize: '0.7rem', alignSelf: { xs: 'flex-start', sm: 'center' } }}
                  />
                </Box>

                <PaymentMethodWidget
                  paymentPlan={formData.paymentPlan}
                  paypalMode={paypalConfig.mode}
                  paypalConfigured={paypalConfig.configured}
                  subtotal={orderTotal}
                  shippingFee={shippingFee}
                  fulfillmentType={formData.fulfillmentType}
                  onChange={handleInputChange}
                />
              </Paper>

              {errors.submit && (
                <Alert severity="error" sx={{ borderRadius: 2 }}>
                  {errors.submit}
                </Alert>
              )}
            </Stack>
          </form>
        </Grid>

        <Grid
          size={{ xs: 12, lg: 4 }}
          sx={{
            position: { xs: 'static', lg: 'sticky' },
            top: { xs: 'auto', lg: 88 },
            alignSelf: 'flex-start',
            zIndex: 10,
          }}
        >
          <Paper
            elevation={0}
            sx={{
              p: { xs: 2.5, sm: 3.5 },
              borderRadius: 4,
              border: '1px solid',
              borderColor: 'divider',
              bgcolor: 'background.paper',
              position: { xs: 'static', lg: 'sticky' },
              top: { xs: 'auto', lg: 88 },
              boxShadow: '0 6px 24px -10px rgba(0,0,0,0.06)',
              maxHeight: { xs: 'none', lg: 'calc(100vh - 105px)' },
              overflowY: { xs: 'visible', lg: 'auto' },
              scrollbarWidth: 'thin',
              '&::-webkit-scrollbar': { width: 6 },
              '&::-webkit-scrollbar-thumb': {
                bgcolor: 'rgba(100, 116, 139, 0.25)',
                borderRadius: 3,
              },
            }}
          >
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2.5 }}>
              <Typography variant="h6" fontWeight={800} sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <CustomShoppingCartIcon size={18} color="#64748b" />
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
                        <CustomInventory2Icon size={22} color="#94a3b8" />
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
                          <CustomDeleteIcon size={13} />
                        </IconButton>
                      </Box>

                      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, mt: 0.5 }}>
                        {item.customLength && isCustomLengthProfile(item.product?.type || item.type) && (
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
                            <CustomRemoveIcon size={9} color="#64748b" />
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
                            <CustomAddIcon size={9} color="#16a34a" />
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
                                label={`-${getItemDiscountPercent(item)}%`}
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
                          Add another cut/length of this profile
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
                  const orig = computeItemOriginalPrice(item);
                  return acc + (orig * item.quantity);
                }, 0);
                const totalOrderSavings = Math.max(0, originalOrderTotal - orderTotal);
                const uniqueActiveRates = Array.from(
                  new Set(orderItems.map((item) => getItemDiscountPercent(item)).filter((pct) => pct > 0))
                );
                const savingsLabel =
                  uniqueActiveRates.length === 1
                    ? `Less ${uniqueActiveRates[0]}% Savings`
                    : 'Product Discount Savings';

                if (totalOrderSavings > 0) {
                  return (
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <Typography variant="body2" sx={{ color: '#dc2626', fontWeight: 600 }}>{savingsLabel}</Typography>
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
                      <CustomLocalShippingIcon size={14} color="#64748b" />
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
                      ₱{downpaymentAmount.toLocaleString('en-PH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </Typography>
                  </Box>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Typography variant="caption" fontWeight={700} color="#9a3412">50% Balance (Upon Delivery):</Typography>
                    <Typography variant="caption" fontWeight={900} color="#9a3412" sx={{ fontVariantNumeric: 'tabular-nums' }}>
                      ₱{balanceUponDeliveryAmount.toLocaleString('en-PH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
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

            {priceUpdateNotice && (
              <Alert
                severity={priceUpdateNotice.direction === 'decreased' ? 'success' : 'info'}
                onClose={() => {
                  dismissPriceUpdateNotice();
                  setModalClosedDueToPriceChange(false);
                }}
                sx={{ mb: 2, borderRadius: 2 }}
              >
                {priceUpdateNotice.direction === 'decreased' ? (
                  <>
                    <strong>Discount updated — your price dropped!</strong> Your item subtotal updated from{' '}
                    <strong>₱{priceUpdateNotice.previousTotal.toLocaleString('en-PH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</strong> to{' '}
                    <strong>₱{priceUpdateNotice.updatedTotal.toLocaleString('en-PH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</strong>.
                  </>
                ) : (
                  <>
                    <strong>Prices or discounts were just updated.</strong> Your item subtotal changed from{' '}
                    <strong>₱{priceUpdateNotice.previousTotal.toLocaleString('en-PH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</strong> to{' '}
                    <strong>₱{priceUpdateNotice.updatedTotal.toLocaleString('en-PH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</strong>.
                  </>
                )}
                {modalClosedDueToPriceChange
                  ? ' Your previous PayPal window was closed so the next checkout uses the updated amount.'
                  : ' Please review the updated summary before paying.'}
              </Alert>
            )}

            {isOffline && (
              <Alert severity="warning" sx={{ mb: 2, borderRadius: 2 }}>
                <strong>No internet connection.</strong> Please reconnect before submitting payment. Any completed PayPal payment will be recovered automatically once you are back online.
              </Alert>
            )}

            {recoveringPendingPayment && (
              <Alert severity="info" sx={{ mb: 2, borderRadius: 2 }}>
                Checking your recent PayPal payment after reconnecting...
              </Alert>
            )}

            {errors.submit && (
              <Alert severity="error" sx={{ mb: 2, borderRadius: 2 }}>
                {errors.submit}
              </Alert>
            )}

            <Button
              type="submit"
              form="checkout-form"
              variant="contained"
              color="primary"
              fullWidth
              size="large"
              disabled={isSubmitting || isRefreshingPrices}
              startIcon={(isSubmitting || isRefreshingPrices) ? <CircularProgress size={18} color="inherit" /> : undefined}
              sx={{
                py: 1.5,
                borderRadius: 2.5,
                fontWeight: 800,
                fontSize: '0.95rem',
                textTransform: 'none',
                mb: 1.5,
                boxShadow: '0 6px 20px -4px rgba(30, 58, 138, 0.4)'
              }}
            >
              {isSubmitting ? 'Processing Order...' : formData.paymentPlan === 'COD_50' ? `Pay 50% (₱${downpaymentAmount.toLocaleString('en-PH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })})` : `Pay Full (₱${grandTotal.toLocaleString('en-PH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })})`}
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
                    ? 'Store / Plant Pick-up'
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

      <PaypalCheckoutModal
        open={paypalModalOpen}
        onClose={() => setPaypalModalOpen(false)}
        token={token}
        paypalClientId={paypalConfig.clientId}
        paypalMode={paypalConfig.mode}
        amountPhp={payableNowAmount}
        paymentPlan={formData.paymentPlan}
        customerName={formData.customerName}
        onOrderSessionCreated={handlePaypalSessionCreated}
        onPaymentConfirmed={handlePaypalPaymentConfirmed}
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
            <CustomWarningIcon size={28} color="#f59e0b" />
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
              boxShadow: '0 4px 12px rgba(30, 58, 138, 0.25)'
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
