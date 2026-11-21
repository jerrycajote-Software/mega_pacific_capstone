import React, { useState, useEffect, useCallback, useRef } from 'react';
import axios from 'axios';
import { useNavigate, useLocation } from 'react-router-dom';
import { Alert, Box, Button, CircularProgress, Typography } from '@mui/material';
import { useAuth } from '../context/AuthContext';
import {
  loadPendingPaymentRecovery,
  clearPendingPaymentRecovery,
  isNetworkDisconnectError
} from '../utils/pendingPaymentRecovery';

// Automatically detects and recovers a paid PayMongo session if internet dropped or the tab was closed
const PendingPaymentRecoveryBanner = () => {
  const { user, token } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const API_URL = import.meta.env.VITE_API_URL || '';

  const [pendingSession, setPendingSession] = useState(null);
  const [status, setStatus] = useState('idle'); // 'idle' | 'checking' | 'recovered' | 'needs_retry' | 'unpaid'
  const [recoveredOrderId, setRecoveredOrderId] = useState(null);
  const [errorMessage, setErrorMessage] = useState('');
  const verifyingRef = useRef(false);

  const userId = user?.id || user?.userId;
  const isOnCheckoutPage = location.pathname === '/checkout';

  const attemptPaymentRecovery = useCallback(async () => {
    if (!userId || !token || verifyingRef.current) return;

    const saved = loadPendingPaymentRecovery(userId);
    if (!saved || !saved.paymentIntentId || !saved.orderPayload) {
      setPendingSession(null);
      return;
    }

    setPendingSession(saved);
    if (typeof navigator !== 'undefined' && navigator.onLine === false) {
      setStatus('needs_retry');
      setErrorMessage('You appear to be offline. Once your internet reconnects, we will finish saving your paid order automatically.');
      return;
    }

    verifyingRef.current = true;
    setStatus('checking');
    setErrorMessage('');

    try {
      const statusRes = await axios.get(
        `${API_URL}/api/payments/paymongo/status/${saved.paymentIntentId}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      const statusData = statusRes.data?.data;

      if (!statusData?.isPaid) {
        // Payment was not completed yet; clear expired QR sessions or keep quiet on non-checkout pages
        if (statusData?.status === 'expired' || statusData?.status === 'cancelled') {
          clearPendingPaymentRecovery();
          setPendingSession(null);
          setStatus('idle');
        } else {
          setStatus('unpaid');
        }
        return;
      }

      // Payment succeeded on PayMongo: finalize or retrieve the idempotent order on the server
      const endpoint = saved.isBulk
        ? `${API_URL}/api/customer/orders/bulk`
        : `${API_URL}/api/customer/orders`;

      const finalizePayload = {
        ...saved.orderPayload,
        clientRequestId: saved.clientRequestId,
        paymentIntentId: statusData.paymentIntentId,
        paymongoReference: statusData.paymentRecordId || statusData.paymentIntentId
      };

      const orderRes = await axios.post(endpoint, finalizePayload, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (orderRes.data?.success && orderRes.data?.data?.id) {
        clearPendingPaymentRecovery();
        setRecoveredOrderId(orderRes.data.data.id);
        setStatus('recovered');
      } else {
        setStatus('needs_retry');
        setErrorMessage('Your payment was confirmed, but we could not finish saving your order yet. Click Retry Recovery below.');
      }
    } catch (err) {
      console.error('Pending payment recovery error:', err);
      setStatus('needs_retry');
      if (isNetworkDisconnectError(err)) {
        setErrorMessage('Still reconnecting to the server. Your payment is safe — click Retry Recovery once your connection is stable.');
      } else {
        setErrorMessage(
          err.response?.data?.error ||
            err.response?.data?.message ||
            'Could not finish saving your paid order automatically. Please click Retry Recovery or contact Live Support with your reference ID.'
        );
      }
    } finally {
      verifyingRef.current = false;
    }
  }, [API_URL, token, userId]);

  useEffect(() => {
    if (isOnCheckoutPage) return;
    attemptPaymentRecovery();

    const handleOnlineReconnect = () => {
      attemptPaymentRecovery();
    };
    window.addEventListener('online', handleOnlineReconnect);
    return () => window.removeEventListener('online', handleOnlineReconnect);
  }, [isOnCheckoutPage, attemptPaymentRecovery]);

  if (isOnCheckoutPage) return null;
  if (!pendingSession && status !== 'recovered') return null;
  if (status === 'idle' || status === 'unpaid') return null;

  const handleViewRecoveredOrder = () => {
    const targetId = recoveredOrderId;
    setRecoveredOrderId(null);
    setPendingSession(null);
    setStatus('idle');
    navigate(targetId ? `/order/${targetId}` : '/orders');
  };

  const handleDismissRecoveryBanner = () => {
    setRecoveredOrderId(null);
    setPendingSession(null);
    setStatus('idle');
  };

  if (status === 'checking') {
    return (
      <Alert
        severity="info"
        sx={{ mb: 2.5, borderRadius: 3, alignItems: 'center' }}
        icon={<CircularProgress size={18} color="inherit" />}
      >
        <Typography variant="body2" fontWeight={700}>
          Checking your recent GCash payment after reconnection...
        </Typography>
      </Alert>
    );
  }

  if (status === 'recovered' && recoveredOrderId) {
    return (
      <Alert
        severity="success"
        onClose={handleDismissRecoveryBanner}
        sx={{ mb: 2.5, borderRadius: 3, alignItems: 'center' }}
        action={
          <Button
            variant="contained"
            color="primary"
            size="small"
            onClick={handleViewRecoveredOrder}
            sx={{ fontWeight: 700, textTransform: 'none', whiteSpace: 'nowrap' }}
          >
            View Saved Order
          </Button>
        }
      >
        <Typography variant="body2" fontWeight={700}>
          Payment recovered! Your GCash payment was verified and Order #ORD-{String(recoveredOrderId).padStart(3, '0')} has been saved.
        </Typography>
      </Alert>
    );
  }

  return (
    <Alert
      severity="warning"
      sx={{ mb: 2.5, borderRadius: 3, alignItems: 'center' }}
      action={
        <Button
          variant="contained"
          color="primary"
          size="small"
          onClick={attemptPaymentRecovery}
          sx={{ fontWeight: 700, textTransform: 'none', whiteSpace: 'nowrap' }}
        >
          Retry Recovery
        </Button>
      }
    >
      <Box>
        <Typography variant="body2" fontWeight={700}>
          Pending GCash Payment Recovery Needed
        </Typography>
        <Typography variant="caption" sx={{ display: 'block', mt: 0.25 }}>
          {errorMessage}
        </Typography>
        {pendingSession?.paymentIntentId && (
          <Typography variant="caption" sx={{ display: 'block', mt: 0.35, fontWeight: 700 }}>
            Payment Reference: {pendingSession.paymentIntentId}
          </Typography>
        )}
      </Box>
    </Alert>
  );
};

export default PendingPaymentRecoveryBanner;
