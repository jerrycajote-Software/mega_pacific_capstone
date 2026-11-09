import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import {
  Dialog,
  DialogContent,
  Box,
  Typography,
  Button,
  IconButton,
  CircularProgress,
  Chip,
  Stack,
  Alert
} from '@mui/material';
import {
  CustomCloseIcon,
  CustomCheckCircleIcon,
  CustomInfoIcon
} from './icons';

const PaymongoQrModal = ({
  open,
  onClose,
  token,
  amountPhp = 0,
  paymentPlan = 'COD_50',
  customerName = '',
  customerEmail = '',
  contactNumber = '',
  onPaymentConfirmed
}) => {
  const [loadingQr, setLoadingQr] = useState(false);
  const [qrSession, setQrSession] = useState(null);
  const [errorMessage, setErrorMessage] = useState('');
  const [paymentStatus, setPaymentStatus] = useState('awaiting_next_action');
  const [checkingManual, setCheckingManual] = useState(false);
  const confirmedRef = useRef(false);

  const API_URL = import.meta.env.VITE_API_URL || '';

  const generateQrSession = async () => {
    setLoadingQr(true);
    setErrorMessage('');
    setQrSession(null);
    setPaymentStatus('awaiting_next_action');
    confirmedRef.current = false;

    try {
      const planLabel = paymentPlan === 'COD_50' ? '50% Downpayment' : '100% Full Payment';
      const res = await axios.post(
        `${API_URL}/api/payments/paymongo/create-qr`,
        {
          amountPhp,
          description: `Mega Pacific Roofing Order (${planLabel})`,
          customerName,
          customerEmail,
          contactNumber,
          paymentPlan,
          returnUrl: window.location.href
        },
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );

      if (res.data?.success && res.data?.data) {
        setQrSession(res.data.data);
        setPaymentStatus(res.data.data.status || 'awaiting_next_action');
      } else {
        setErrorMessage('Unable to generate a GCash QR code right now. Please try again.');
      }
    } catch (err) {
      const msg =
        err.response?.data?.message ||
        err.response?.data?.error ||
        'Unable to connect to PayMongo payment gateway. Please check your connection and try again.';
      setErrorMessage(msg);
    } finally {
      setLoadingQr(false);
    }
  };

  useEffect(() => {
    if (open && amountPhp > 0) {
      generateQrSession();
    } else if (!open) {
      setQrSession(null);
      setErrorMessage('');
      setPaymentStatus('awaiting_next_action');
      confirmedRef.current = false;
    }
  }, [open, amountPhp]);

  useEffect(() => {
    if (!open || !qrSession?.paymentIntentId || confirmedRef.current) return;

    const intervalId = setInterval(async () => {
      if (confirmedRef.current) return;
      try {
        const res = await axios.get(
          `${API_URL}/api/payments/paymongo/status/${qrSession.paymentIntentId}`,
          {
            headers: { Authorization: `Bearer ${token}` }
          }
        );
        const statusData = res.data?.data;
        if (statusData?.status) {
          setPaymentStatus(statusData.status);
        }
        if (statusData?.isPaid && !confirmedRef.current) {
          confirmedRef.current = true;
          clearInterval(intervalId);
          if (onPaymentConfirmed) {
            onPaymentConfirmed({
              paymentIntentId: statusData.paymentIntentId,
              paymentRecordId: statusData.paymentRecordId
            });
          }
        }
      } catch (err) {
        // Silent background poll
      }
    }, 3000);

    return () => clearInterval(intervalId);
  }, [open, qrSession, token]);

  const handleVerifyGcashQrPaymentNow = async () => {
    if (!qrSession?.paymentIntentId || checkingManual || confirmedRef.current) return;
    setCheckingManual(true);
    setErrorMessage('');

    try {
      const res = await axios.get(
        `${API_URL}/api/payments/paymongo/status/${qrSession.paymentIntentId}`,
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );
      const statusData = res.data?.data;
      if (statusData?.isPaid) {
        confirmedRef.current = true;
        setPaymentStatus('succeeded');
        if (onPaymentConfirmed) {
          onPaymentConfirmed({
            paymentIntentId: statusData.paymentIntentId,
            paymentRecordId: statusData.paymentRecordId
          });
        }
      } else {
        setErrorMessage(
          'Payment has not been completed yet. Please scan the QR code using your GCash app (or authorize the test payment page) and try again.'
        );
      }
    } catch (err) {
      setErrorMessage(
        err.response?.data?.message || 'Unable to verify payment status right now. Please try again in a few seconds.'
      );
    } finally {
      setCheckingManual(false);
    }
  };

  const handleOpenTestAuthorizeWindow = () => {
    if (qrSession?.testAuthorizeUrl) {
      window.open(qrSession.testAuthorizeUrl, '_blank', 'noopener,noreferrer');
    }
  };

  const handleRegenerateQrCode = () => {
    generateQrSession();
  };

  const handleModalDialogClose = (event, reason) => {
    if (reason === 'backdropClick' || reason === 'escapeKeyDown') {
      return;
    }
    if (onClose) onClose();
  };

  const formattedAmount = Number(amountPhp || 0).toLocaleString('en-PH', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  });

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
      {/* Top Header */}
      <Box
        sx={{
          bgcolor: '#005ce6',
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
              width: 30,
              height: 30,
              borderRadius: '50%',
              bgcolor: '#ffffff',
              color: '#005ce6',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontWeight: 900,
              fontSize: '15px',
              flexShrink: 0
            }}
          >
            G
          </Box>
          <Box>
            <Typography variant="subtitle1" fontWeight={800} sx={{ lineHeight: 1.2, color: '#ffffff' }}>
              GCash / QR Ph Scan to Pay
            </Typography>
            <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.85)', display: 'block' }}>
              Secured by PayMongo Payment Gateway
            </Typography>
          </Box>
        </Box>

        <IconButton
          onClick={onClose}
          aria-label="Close GCash QR payment window"
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
        <Stack spacing={2.25} alignItems="center">
          {/* Amount Summary Banner */}
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

          {errorMessage && (
            <Alert severity="warning" sx={{ width: '100%', borderRadius: 2.5, fontSize: '0.8rem' }}>
              {errorMessage}
            </Alert>
          )}

          {/* QR Code Display Area */}
          {loadingQr ? (
            <Box sx={{ py: 6, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
              <CircularProgress size={44} sx={{ color: '#005ce6' }} />
              <Typography variant="body2" fontWeight={600} color="#475569">
                Generating your dynamic PayMongo GCash QR code...
              </Typography>
            </Box>
          ) : qrSession?.qrImageBase64 ? (
            <Box
              sx={{
                p: 2,
                borderRadius: 3.5,
                bgcolor: '#ffffff',
                border: '2px solid #005ce6',
                boxShadow: '0 8px 24px rgba(0, 92, 230, 0.12)',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                width: '100%'
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%', mb: 1.5 }}>
                <Chip
                  label="QR Ph / GCash Official"
                  size="small"
                  sx={{ bgcolor: '#dbeafe', color: '#1d4ed8', fontWeight: 800, fontSize: '11px' }}
                />
                <Chip
                  label={qrSession.livemode ? 'LIVE GATEWAY' : 'TEST SANDBOX'}
                  size="small"
                  sx={{
                    bgcolor: qrSession.livemode ? '#dcfce7' : '#fef3c7',
                    color: qrSession.livemode ? '#15803d' : '#b45309',
                    fontWeight: 800,
                    fontSize: '10.5px'
                  }}
                />
              </Box>

              <Box
                component="img"
                src={qrSession.qrImageBase64}
                alt="PayMongo GCash QR Ph Code"
                sx={{
                  width: 230,
                  height: 230,
                  objectFit: 'contain',
                  borderRadius: 2,
                  border: '1px solid #f1f5f9'
                }}
              />

              <Typography variant="caption" color="#475569" sx={{ mt: 1.5, textAlign: 'center', lineHeight: 1.45 }}>
                Open your <strong>GCash App</strong>, tap <strong>QR</strong> at the bottom menu, and scan this code to pay.
              </Typography>
            </Box>
          ) : (
            <Box sx={{ py: 3, textAlign: 'center', width: '100%' }}>
              <Button
                variant="outlined"
                onClick={handleRegenerateQrCode}
                sx={{ borderRadius: 2.5, textTransform: 'none', fontWeight: 700 }}
              >
                Generate New GCash QR Code
              </Button>
            </Box>
          )}

          {/* Real-time Automatic Listener Indicator */}
          {qrSession && (
            <Box
              sx={{
                width: '100%',
                px: 2,
                py: 1.25,
                borderRadius: 2.5,
                bgcolor: paymentStatus === 'succeeded' ? '#dcfce7' : '#eff6ff',
                border: '1px solid',
                borderColor: paymentStatus === 'succeeded' ? '#86efac' : '#bfdbfe',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 1.25
              }}
            >
              {paymentStatus === 'succeeded' ? (
                <>
                  <CustomCheckCircleIcon size={18} color="#16a34a" />
                  <Typography variant="caption" fontWeight={800} color="#15803d">
                    GCash payment verified! Finalizing your roofing order...
                  </Typography>
                </>
              ) : (
                <>
                  <CircularProgress size={14} sx={{ color: '#005ce6' }} />
                  <Typography variant="caption" fontWeight={700} color="#1e40af">
                    Waiting for GCash scan confirmation (auto-updates every 3 seconds)...
                  </Typography>
                </>
              )}
            </Box>
          )}

          {/* Sandbox / Test Mode Helper */}
          {qrSession && !qrSession.livemode && qrSession.testAuthorizeUrl && (
            <Box
              sx={{
                width: '100%',
                p: 1.5,
                borderRadius: 2.5,
                bgcolor: '#fffbeb',
                border: '1px dashed #f59e0b'
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1, mb: 1 }}>
                <CustomInfoIcon size={16} color="#d97706" />
                <Typography variant="caption" color="#92400e" sx={{ lineHeight: 1.4 }}>
                  <strong>PayMongo Test Mode Active:</strong> Click below to open PayMongo&apos;s test payment page and click &quot;Authorize Test Payment&quot; to simulate a real mobile GCash scan.
                </Typography>
              </Box>
              <Button
                fullWidth
                size="small"
                variant="outlined"
                onClick={handleOpenTestAuthorizeWindow}
                sx={{
                  borderRadius: 2,
                  textTransform: 'none',
                  fontWeight: 700,
                  borderColor: '#d97706',
                  color: '#b45309',
                  '&:hover': { bgcolor: 'rgba(245, 158, 11, 0.08)', borderColor: '#b45309' }
                }}
              >
                Open PayMongo Test Payment Page
              </Button>
            </Box>
          )}

          {/* Primary Action Button */}
          {qrSession && (
            <Button
              fullWidth
              variant="contained"
              disabled={checkingManual || paymentStatus === 'succeeded'}
              onClick={handleVerifyGcashQrPaymentNow}
              sx={{
                py: 1.35,
                borderRadius: 2.5,
                bgcolor: '#005ce6',
                fontWeight: 800,
                textTransform: 'none',
                fontSize: '0.92rem',
                '&:hover': { bgcolor: '#0047b3' }
              }}
            >
              {checkingManual ? 'Verifying GCash Payment with PayMongo...' : 'I Have Scanned and Paid via GCash'}
            </Button>
          )}
        </Stack>
      </DialogContent>
    </Dialog>
  );
};

export default PaymongoQrModal;

