import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import {
  Dialog,
  DialogContent,
  Box,
  Typography,
  IconButton,
  CircularProgress,
  Chip,
  Stack,
  Alert
} from '@mui/material';
import { CustomCloseIcon } from './icons';

// Load the official PayPal JS SDK dynamically for the configured Client ID
const loadPaypalSdkScript = (clientId) => {
  return new Promise((resolve, reject) => {
    if (!clientId) {
      reject(new Error('PayPal Client ID is not configured on the server.'));
      return;
    }

    const existingScript = document.querySelector('script[data-paypal-sdk="true"]');
    if (existingScript) {
      if (existingScript.dataset.clientId === clientId && window.paypal) {
        resolve(window.paypal);
        return;
      }
      existingScript.remove();
      if (window.paypal) {
        delete window.paypal;
      }
    }

    const script = document.createElement('script');
    script.src = `https://www.paypal.com/sdk/js?client-id=${encodeURIComponent(clientId)}&currency=PHP&intent=capture`;
    script.async = true;
    script.dataset.paypalSdk = 'true';
    script.dataset.clientId = clientId;
    script.onload = () => {
      if (window.paypal) {
        resolve(window.paypal);
      } else {
        reject(new Error('PayPal SDK loaded without initializing checkout buttons.'));
      }
    };
    script.onerror = () => {
      reject(new Error('Unable to load PayPal Checkout right now. Please check your internet connection and try again.'));
    };
    document.body.appendChild(script);
  });
};

const PaypalCheckoutModal = ({
  open,
  onClose,
  token,
  paypalClientId = '',
  paypalMode = 'sandbox',
  amountPhp = 0,
  paymentPlan = 'COD_50',
  customerName = '',
  onOrderSessionCreated,
  onPaymentConfirmed
}) => {
  const [sdkReady, setSdkReady] = useState(false);
  const [loadingSdk, setLoadingSdk] = useState(false);
  const [capturing, setCapturing] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [isOffline, setIsOffline] = useState(
    typeof navigator !== 'undefined' ? navigator.onLine === false : false
  );

  const buttonContainerRef = useRef(null);
  const confirmedRef = useRef(false);
  const API_URL = import.meta.env.VITE_API_URL || '';
  const roundedAmountPhp = Math.round((Number(amountPhp) || 0) * 100) / 100;

  useEffect(() => {
    const handleBrowserOffline = () => setIsOffline(true);
    const handleBrowserOnline = () => setIsOffline(false);

    window.addEventListener('offline', handleBrowserOffline);
    window.addEventListener('online', handleBrowserOnline);
    return () => {
      window.removeEventListener('offline', handleBrowserOffline);
      window.removeEventListener('online', handleBrowserOnline);
    };
  }, []);

  useEffect(() => {
    if (!open) {
      setSdkReady(false);
      setErrorMessage('');
      setCapturing(false);
      confirmedRef.current = false;
      return;
    }

    if (!paypalClientId) {
      setErrorMessage('PayPal checkout is not configured yet. Please ask the administrator to add PAYPAL_CLIENT_ID and PAYPAL_CLIENT_SECRET in backend .env.');
      return;
    }

    let isCancelled = false;
    setLoadingSdk(true);
    setErrorMessage('');

    loadPaypalSdkScript(paypalClientId)
      .then((paypal) => {
        if (isCancelled || !buttonContainerRef.current) return;
        buttonContainerRef.current.innerHTML = '';

        const buttons = paypal.Buttons({
          style: {
            layout: 'vertical',
            color: 'gold',
            shape: 'rect',
            label: 'paypal'
          },
          createOrder: async () => {
            setErrorMessage('');
            const planLabel = paymentPlan === 'COD_50' ? '50% Downpayment' : '100% Full Payment';
            const res = await axios.post(
              `${API_URL}/api/payments/paypal/create-order`,
              {
                amountPhp: roundedAmountPhp,
                description: `Mega Pacific Roofing Order (${planLabel})`,
                customerName,
                paymentPlan
              },
              {
                headers: { Authorization: `Bearer ${token}` }
              }
            );

            const orderData = res.data?.data;
            if (!res.data?.success || !orderData?.paypalOrderId) {
              throw new Error(res.data?.message || 'Unable to create PayPal order.');
            }

            if (onOrderSessionCreated) {
              onOrderSessionCreated(orderData);
            }
            return orderData.paypalOrderId;
          },
          onApprove: async (data) => {
            if (confirmedRef.current) return;
            setCapturing(true);
            setErrorMessage('');
            try {
              const res = await axios.post(
                `${API_URL}/api/payments/paypal/capture-order`,
                { paypalOrderId: data.orderID },
                {
                  headers: { Authorization: `Bearer ${token}` }
                }
              );

              const captureData = res.data?.data;
              if (res.data?.success && captureData?.isPaid) {
                confirmedRef.current = true;
                if (onPaymentConfirmed) {
                  await onPaymentConfirmed({
                    paypalOrderId: captureData.paypalOrderId,
                    captureId: captureData.captureId,
                    payerEmail: captureData.payerEmail,
                    payerName: captureData.payerName
                  });
                }
              } else {
                setErrorMessage('PayPal payment did not complete. Please try again.');
              }
            } catch (captureErr) {
              const serverMsg = captureErr.response?.data?.message || captureErr.message;
              setErrorMessage(serverMsg || 'Failed to capture PayPal payment. Please try again.');
            } finally {
              setCapturing(false);
            }
          },
          onCancel: () => {
            setErrorMessage('PayPal checkout was closed before completing payment. Click a PayPal button below whenever you are ready.');
          },
          onError: (err) => {
            console.error('PayPal button error:', err);
            setErrorMessage('PayPal could not load or complete this payment right now. Please try again.');
          }
        });

        if (buttons.isEligible()) {
          return buttons.render(buttonContainerRef.current).then(() => {
            if (!isCancelled) setSdkReady(true);
          });
        }
        throw new Error('PayPal checkout is unavailable in this browser.');
      })
      .catch((err) => {
        if (!isCancelled) {
          setErrorMessage(err.response?.data?.message || err.message || 'Unable to load PayPal Checkout.');
        }
      })
      .finally(() => {
        if (!isCancelled) setLoadingSdk(false);
      });

    return () => {
      isCancelled = true;
    };
  }, [open, paypalClientId, roundedAmountPhp, paymentPlan, token]);

  const handleModalDialogClose = (event, reason) => {
    if (reason === 'backdropClick' || reason === 'escapeKeyDown' || capturing) {
      return;
    }
    if (onClose) onClose();
  };

  const formattedAmount = roundedAmountPhp.toLocaleString('en-PH', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  });
  const isLiveMode = String(paypalMode).toLowerCase() === 'live';

  return (
    <Dialog
      open={open}
      onClose={handleModalDialogClose}
      disableEscapeKeyDown
      maxWidth="xs"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 4,
          overflow: 'hidden',
          border: '1.5px solid #cbd5e1',
          boxShadow: '0 24px 48px rgba(15, 23, 42, 0.22)'
        }
      }}
    >
      <Box
        sx={{
          bgcolor: '#003087',
          color: '#ffffff',
          px: 2.5,
          py: 2,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between'
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.25 }}>
          <Box
            sx={{
              width: 32,
              height: 32,
              borderRadius: '50%',
              bgcolor: '#ffffff',
              color: '#003087',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontWeight: 900,
              fontSize: '15px',
              flexShrink: 0
            }}
          >
            P
          </Box>
          <Box>
            <Typography variant="subtitle1" fontWeight={800} sx={{ lineHeight: 1.2, color: '#ffffff' }}>
              PayPal Secure Checkout
            </Typography>
            <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.85)', display: 'block' }}>
              Pay with PayPal or Debit / Credit Card
            </Typography>
          </Box>
        </Box>

        <IconButton
          onClick={() => !capturing && onClose?.()}
          disabled={capturing}
          aria-label="Close PayPal payment window"
          size="small"
          sx={{
            color: '#ffffff',
            bgcolor: 'rgba(255,255,255,0.14)',
            '&:hover': { bgcolor: 'rgba(255,255,255,0.25)' }
          }}
        >
          <CustomCloseIcon size={18} color="#ffffff" />
        </IconButton>
      </Box>

      <DialogContent sx={{ p: 3, bgcolor: '#f8fafc' }}>
        <Stack spacing={2.25}>
          <Box
            sx={{
              width: '100%',
              p: 2,
              borderRadius: 3,
              bgcolor: '#ffffff',
              border: '1px solid #e2e8f0',
              textAlign: 'center'
            }}
          >
            <Box sx={{ display: 'flex', justifyContent: 'center', mb: 1 }}>
              <Chip
                label={isLiveMode ? 'LIVE GATEWAY' : 'TEST SANDBOX'}
                size="small"
                sx={{
                  bgcolor: isLiveMode ? '#dcfce7' : '#fef3c7',
                  color: isLiveMode ? '#15803d' : '#b45309',
                  fontWeight: 800,
                  fontSize: '10.5px'
                }}
              />
            </Box>
            <Typography variant="caption" fontWeight={700} color="#64748b" sx={{ textTransform: 'uppercase', letterSpacing: '0.5px' }}>
              {paymentPlan === 'COD_50' ? '50% Downpayment Due Now' : '100% Full Order Payment Due Now'}
            </Typography>
            <Typography variant="h4" fontWeight={900} color="#0f172a" sx={{ mt: 0.5, fontVariantNumeric: 'tabular-nums' }}>
              ₱{formattedAmount}
            </Typography>
            <Typography variant="caption" color="#475569" sx={{ display: 'block', mt: 0.5 }}>
              Merchant: <strong>Mega Pacific Metal and Steel Corp</strong>
            </Typography>
          </Box>

          {isOffline && (
            <Alert severity="warning" sx={{ width: '100%', borderRadius: 2.5, fontSize: '0.8rem' }}>
              <strong>Internet connection lost.</strong> Please reconnect before paying. If you already approved PayPal, keep this page open so your order can finish saving automatically.
            </Alert>
          )}

          {errorMessage && (
            <Alert severity="warning" sx={{ width: '100%', borderRadius: 2.5, fontSize: '0.8rem' }}>
              {errorMessage}
            </Alert>
          )}

          {capturing && (
            <Box sx={{ py: 2, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 1.5 }}>
              <CircularProgress size={36} sx={{ color: '#003087' }} />
              <Typography variant="body2" fontWeight={700} color="#0f172a">
                Confirming your PayPal payment and saving your order...
              </Typography>
            </Box>
          )}

          {loadingSdk && !capturing && (
            <Box sx={{ py: 3, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 1.5 }}>
              <CircularProgress size={36} sx={{ color: '#003087' }} />
              <Typography variant="body2" fontWeight={600} color="#475569">
                Loading PayPal payment options...
              </Typography>
            </Box>
          )}

          <Box
            ref={buttonContainerRef}
            sx={{
              width: '100%',
              minHeight: sdkReady ? 96 : 0,
              display: capturing ? 'none' : 'block'
            }}
          />
        </Stack>
      </DialogContent>
    </Dialog>
  );
};

export default PaypalCheckoutModal;
