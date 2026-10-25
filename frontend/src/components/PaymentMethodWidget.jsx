import React from 'react';
import {
  Box,
  Typography,
  Paper,
  Stack,
  TextField,
  Collapse,
  Grid,
  Radio,
  Chip
} from '@mui/material';

const MastercardLogo = ({ active = true }) => (
  <Box
    sx={{
      display: 'inline-flex',
      alignItems: 'center',
      justifyContent: 'center',
      width: 32,
      height: 20,
      borderRadius: '4px',
      bgcolor: '#ffffff',
      border: '1px solid #e2e8f0',
      opacity: active ? 1 : 0.45,
      transition: 'opacity 0.2s',
      flexShrink: 0
    }}
  >
    <svg width="24" height="15" viewBox="0 0 28 18" fill="none">
      <circle cx="10" cy="9" r="7" fill="#EB001B" />
      <circle cx="18" cy="9" r="7" fill="#F79E1B" fillOpacity="0.88" />
    </svg>
  </Box>
);

const VisaLogo = ({ active = true }) => (
  <Box
    sx={{
      display: 'inline-flex',
      alignItems: 'center',
      justifyContent: 'center',
      width: 34,
      height: 20,
      borderRadius: '4px',
      bgcolor: '#1434CB',
      opacity: active ? 1 : 0.45,
      transition: 'opacity 0.2s',
      flexShrink: 0
    }}
  >
    <Typography
      sx={{
        color: '#ffffff',
        fontFamily: 'system-ui, -apple-system, sans-serif',
        fontWeight: 900,
        fontStyle: 'italic',
        fontSize: '10px',
        letterSpacing: '0.8px',
        lineHeight: 1
      }}
    >
      VISA
    </Typography>
  </Box>
);


// Card security code icon with 123
const CvvSecurityIcon = () => (
  <Box sx={{ display: 'inline-flex', alignItems: 'center', gap: 0.5, color: '#94a3b8' }}>
    <svg width="22" height="16" viewBox="0 0 24 17" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="1.5" width="20" height="14" rx="2.5" />
      <line x1="2" y1="5.5" x2="22" y2="5.5" />
      <line x1="5" y1="11" x2="10" y2="11" />
    </svg>
    <Typography sx={{ fontSize: '10.5px', fontWeight: 800, color: '#64748b', letterSpacing: '-0.3px', lineHeight: 1 }}>
      123
    </Typography>
  </Box>
);

const GCashLogo = () => (
  <Box
    sx={{
      width: 26,
      height: 26,
      borderRadius: '50%',
      bgcolor: '#005ce6',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      color: '#ffffff',
      fontWeight: 800,
      fontSize: '14px',
      boxShadow: '0 2px 6px rgba(0, 92, 230, 0.25)',
      flexShrink: 0
    }}
  >
    <span style={{ transform: 'translateY(-0.5px)' }}>G</span>
  </Box>
);

const PaymentMethodWidget = ({
  paymentPlan = 'COD_50', 
  paymentChannel = 'Card', 
  cardNumber = '',
  cardExpiry = '',
  cardCvv = '',
  gcashNumber = '',
  subtotal = 0,
  shippingFee = 0,
  fulfillmentType = 'Delivery',
  onChange,
  errors = {}
}) => {
  const actualShippingFee = Math.max(0, Number(shippingFee) || 0);
  const isPickup = fulfillmentType === 'Pickup' || actualShippingFee === 0;
  const grandTotal = (Number(subtotal) || 0) + (isPickup ? 0 : actualShippingFee);
  const downpayment = grandTotal * 0.5;
  const remainingCod = grandTotal * 0.5;

  const cleanNumber = (cardNumber || '').replace(/\D/g, '');
  const isVisa = /^4/.test(cleanNumber);
  const isMastercard = /^(5[1-5]|2[2-7])/.test(cleanNumber);
  const hasBrandMatch = isVisa || isMastercard;

  const handleCardNumberInput = (e) => {
    const raw = e.target.value.replace(/\D/g, '').slice(0, 16);
    const formatted = raw.replace(/(\d{4})(?=\d)/g, '$1 ');
    if (onChange) {
      onChange({ target: { name: 'cardNumber', value: formatted } });
    }
  };

  const handleExpiryInput = (e) => {
    let raw = e.target.value.replace(/\D/g, '').slice(0, 4);
    let formatted = raw;
    if (raw.length >= 2) {
      formatted = `${raw.slice(0, 2)}/${raw.slice(2)}`;
    }
    if (onChange) {
      onChange({ target: { name: 'cardExpiry', value: formatted } });
    }
  };

  const handleCvvInput = (e) => {
    const formatted = e.target.value.replace(/\D/g, '').slice(0, 4);
    if (onChange) {
      onChange({ target: { name: 'cardCvv', value: formatted } });
    }
  };

  const handleGcashInput = (e) => {
    const formatted = e.target.value.replace(/\D/g, '').slice(0, 11);
    if (onChange) {
      onChange({ target: { name: 'gcashNumber', value: formatted } });
    }
  };

  const selectPlan = (plan) => {
    if (onChange) {
      onChange({ target: { name: 'paymentPlan', value: plan } });
    }
  };

  const selectChannel = (channel) => {
    if (onChange) {
      onChange({ target: { name: 'paymentChannel', value: channel } });
    }
  };

  const isCodPlan = paymentPlan === 'COD_50';
  const isFullPlan = paymentPlan === 'FULL_PAYMENT';
  const isCardChannel = paymentChannel === 'Card';
  const isGcashChannel = paymentChannel === 'GCash';

  const renderPaymentDetails = (amountToPayNow, labelPrefix) => (
    <Box sx={{ mt: 2.5, pt: 2.5, borderTop: '1px solid #e2e8f0' }} onClick={(e) => e.stopPropagation()}>
      <Box sx={{ mb: 2, display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 1 }}>
        <Typography variant="caption" fontWeight={700} color="#475569" sx={{ textTransform: 'uppercase', letterSpacing: '0.5px' }}>
          Select Payment Method for {labelPrefix} (₱{amountToPayNow.toLocaleString('en-PH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })})
        </Typography>
      </Box>

      <Stack spacing={2}>
        <Paper
          elevation={0}
          onClick={() => selectChannel('Card')}
          sx={{
            p: 2,
            borderRadius: 3,
            border: '1.5px solid',
            borderColor: isCardChannel ? '#1e3a8a' : '#e2e8f0',
            bgcolor: isCardChannel ? '#f8fafc' : '#ffffff',
            cursor: 'pointer',
            transition: 'all 0.2s ease',
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: isCardChannel ? 2 : 0 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.25 }}>
              <Radio
                checked={isCardChannel}
                onChange={() => selectChannel('Card')}
                value="Card"
                size="small"
                sx={{ p: 0, '&.Mui-checked': { color: '#1e3a8a' } }}
              />
              <i className="fi fi-rr-credit-card" style={{ fontSize: '18px', color: '#1e3a8a' }}></i>
              <Typography variant="body2" fontWeight={700} color="#0f172a">
                Bank Card (Debit / Credit)
              </Typography>
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
              <MastercardLogo active={!hasBrandMatch || isMastercard} />
              <VisaLogo active={!hasBrandMatch || isVisa} />
            </Box>
          </Box>

          <Collapse in={isCardChannel} timeout={200}>
            <Box sx={{ pt: 1 }} onClick={(e) => e.stopPropagation()}>
              <Stack spacing={2}>
                <TextField
                  fullWidth
                  name="cardNumber"
                  value={cardNumber}
                  onChange={handleCardNumberInput}
                  placeholder="Card number"
                  error={Boolean(errors.cardNumber)}
                  helperText={errors.cardNumber}
                  inputProps={{ maxLength: 19 }}
                  InputProps={{
                    endAdornment: (
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75, pl: 1 }}>
                        <MastercardLogo active={!hasBrandMatch || isMastercard} />
                        <VisaLogo active={!hasBrandMatch || isVisa} />
                      </Box>
                    ),
                    sx: {
                      bgcolor: '#ffffff',
                      borderRadius: 2.5,
                      fontSize: '14.5px',
                      '& fieldset': {
                        borderColor: errors.cardNumber ? '#ef4444' : '#e2e8f0',
                        borderWidth: '1.5px'
                      },
                      '&:hover fieldset': {
                        borderColor: errors.cardNumber ? '#ef4444' : '#94a3b8'
                      },
                      '&.Mui-focused fieldset': {
                        borderColor: '#1e3a8a',
                        borderWidth: '1.5px'
                      }
                    }
                  }}
                />

                <Grid container spacing={2}>
                  <Grid size={{ xs: 6 }}>
                    <TextField
                      fullWidth
                      name="cardExpiry"
                      value={cardExpiry}
                      onChange={handleExpiryInput}
                      placeholder="Expiration date"
                      error={Boolean(errors.cardExpiry)}
                      helperText={errors.cardExpiry}
                      inputProps={{ maxLength: 5 }}
                      InputProps={{
                        sx: {
                          bgcolor: '#ffffff',
                          borderRadius: 2.5,
                          fontSize: '14.5px',
                          '& fieldset': {
                            borderColor: errors.cardExpiry ? '#ef4444' : '#e2e8f0',
                            borderWidth: '1.5px'
                          },
                          '&:hover fieldset': {
                            borderColor: errors.cardExpiry ? '#ef4444' : '#94a3b8'
                          },
                          '&.Mui-focused fieldset': {
                            borderColor: '#1e3a8a',
                            borderWidth: '1.5px'
                          }
                        }
                      }}
                    />
                  </Grid>

                  <Grid size={{ xs: 6 }}>
                    <TextField
                      fullWidth
                      name="cardCvv"
                      type="password"
                      value={cardCvv}
                      onChange={handleCvvInput}
                      placeholder="Security code"
                      error={Boolean(errors.cardCvv)}
                      helperText={errors.cardCvv}
                      inputProps={{ maxLength: 4 }}
                      InputProps={{
                        endAdornment: <CvvSecurityIcon />,
                        sx: {
                          bgcolor: '#ffffff',
                          borderRadius: 2.5,
                          fontSize: '14.5px',
                          '& fieldset': {
                            borderColor: errors.cardCvv ? '#ef4444' : '#e2e8f0',
                            borderWidth: '1.5px'
                          },
                          '&:hover fieldset': {
                            borderColor: errors.cardCvv ? '#ef4444' : '#94a3b8'
                          },
                          '&.Mui-focused fieldset': {
                            borderColor: '#1e3a8a',
                            borderWidth: '1.5px'
                          }
                        }
                      }}
                    />
                  </Grid>
                </Grid>
              </Stack>
            </Box>
          </Collapse>
        </Paper>

        <Paper
          elevation={0}
          onClick={() => selectChannel('GCash')}
          sx={{
            p: 2,
            borderRadius: 3,
            border: '1.5px solid',
            borderColor: isGcashChannel ? '#005ce6' : '#e2e8f0',
            bgcolor: isGcashChannel ? '#f0f7ff' : '#ffffff',
            cursor: 'pointer',
            transition: 'all 0.2s ease',
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: isGcashChannel ? 2 : 0 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.25 }}>
              <Radio
                checked={isGcashChannel}
                onChange={() => selectChannel('GCash')}
                value="GCash"
                size="small"
                sx={{ p: 0, '&.Mui-checked': { color: '#005ce6' } }}
              />
              <GCashLogo />
              <Typography variant="body2" fontWeight={700} color="#0f172a">
                GCash E-Wallet
              </Typography>
            </Box>
            <Chip
              label="Instant Link"
              size="small"
              sx={{ bgcolor: '#dbeafe', color: '#1d4ed8', fontWeight: 700, fontSize: '10.5px', height: 20 }}
            />
          </Box>

          <Collapse in={isGcashChannel} timeout={200}>
            <Box sx={{ pt: 1 }} onClick={(e) => e.stopPropagation()}>
              <TextField
                fullWidth
                name="gcashNumber"
                value={gcashNumber}
                onChange={handleGcashInput}
                placeholder="GCash Registered Mobile Number (ex. 09171234567)"
                error={Boolean(errors.gcashNumber)}
                helperText={errors.gcashNumber || 'We will link your GCash payment to your official order receipt'}
                inputProps={{ maxLength: 11 }}
                InputProps={{
                  sx: {
                    bgcolor: '#ffffff',
                    borderRadius: 2.5,
                    fontSize: '14.5px',
                    '& fieldset': {
                      borderColor: errors.gcashNumber ? '#ef4444' : '#e2e8f0',
                      borderWidth: '1.5px'
                    },
                    '&.Mui-focused fieldset': {
                      borderColor: '#005ce6',
                      borderWidth: '1.5px'
                    }
                  }
                }}
              />
            </Box>
          </Collapse>
        </Paper>
      </Stack>
    </Box>
  );

  return (
    <Box sx={{ mb: 4 }}>
      <Paper
        elevation={0}
        sx={{
          mb: 3,
          p: 2.5,
          borderRadius: 3.5,
          bgcolor: '#f8fafc',
          border: '1.5px solid #cbd5e1',
          position: 'relative',
          overflow: 'hidden'
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1.5, mb: 1.5 }}>
          <Box
            sx={{
              width: 32,
              height: 32,
              borderRadius: '8px',
              bgcolor: '#1e3a8a',
              color: '#ffffff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0
            }}
          >
            <i className="fi fi-rr-info" style={{ fontSize: '16px' }}></i>
          </Box>
          <Box>
            <Typography variant="subtitle2" fontWeight={800} color="#0f172a" sx={{ fontSize: '15px' }}>
              Payment Terms & Instructions
            </Typography>
            <Typography variant="caption" color="#64748b">
              Please review the payment conditions below before completing your checkout.
            </Typography>
          </Box>
        </Box>

        <Stack spacing={1.5} sx={{ pl: { xs: 0, sm: 5.5 } }}>
          <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1 }}>
            <Box
              sx={{
                width: 20,
                height: 20,
                borderRadius: '50%',
                bgcolor: '#e2e8f0',
                color: '#1e293b',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '11px',
                fontWeight: 700,
                flexShrink: 0,
                mt: 0.25
              }}
            >
              1
            </Box>
            <Box>
              <Typography variant="body2" fontWeight={700} color="#0f172a">
                Cash on Delivery (50% Downpayment):
              </Typography>
              <Typography variant="body2" color="#334155" sx={{ lineHeight: 1.45 }}>
                <strong>50% bank transfer and 50% Cash on the Item Delivered</strong>. You can pay the 50% downpayment via Bank Transfer or GCash. The remaining 50% balance will be paid in cash upon delivery.
              </Typography>
            </Box>
          </Box>

          <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1 }}>
            <Box
              sx={{
                width: 20,
                height: 20,
                borderRadius: '50%',
                bgcolor: '#e2e8f0',
                color: '#1e293b',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '11px',
                fontWeight: 700,
                flexShrink: 0,
                mt: 0.25
              }}
            >
              2
            </Box>
            <Box>
              <Typography variant="body2" fontWeight={700} color="#0f172a">
                Bank Transfer - Full Payment:
              </Typography>
              <Typography variant="body2" color="#334155" sx={{ lineHeight: 1.45 }}>
                <strong>Bank transfer - Full Payment</strong>. Pay the full 100% upfront via Bank Transfer or GCash.
              </Typography>
            </Box>
          </Box>

          <Box sx={{ pt: 1, borderTop: '1px dashed #cbd5e1', display: 'flex', alignItems: 'center', gap: 1 }}>
            <i className={isPickup ? 'fi fi-rr-box-alt' : 'fi fi-rr-truck-side'} style={{ fontSize: '15px', color: '#16a34a' }}></i>
            <Typography variant="caption" fontWeight={700} color="#15803d">
              {isPickup
                ? 'Plant Pick-up selected: No delivery logistics fee applied (FREE).'
                : `Both payment options include the calculated delivery logistics fee of ₱${actualShippingFee.toLocaleString('en-PH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}.`}
            </Typography>
          </Box>
        </Stack>
      </Paper>

      <Typography variant="subtitle1" fontWeight={700} sx={{ mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
        <i className="fi fi-rr-credit-card" style={{ fontSize: '18px', color: '#1e3a8a' }}></i>
        Select Payment Plan
      </Typography>

      <Stack spacing={2.5}>
        <Paper
          elevation={0}
          onClick={() => selectPlan('COD_50')}
          sx={{
            p: { xs: 2, sm: 2.5 },
            borderRadius: 3.5,
            border: '2px solid',
            borderColor: isCodPlan ? '#16a34a' : '#e2e8f0',
            bgcolor: '#ffffff',
            cursor: 'pointer',
            transition: 'all 0.2s ease',
            boxShadow: isCodPlan ? '0 6px 18px rgba(22, 163, 74, 0.1)' : 'none',
            '&:hover': {
              borderColor: isCodPlan ? '#16a34a' : '#cbd5e1'
            }
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 1 }}>
            <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1.5 }}>
              <Radio
                checked={isCodPlan}
                onChange={() => selectPlan('COD_50')}
                value="COD_50"
                name="paymentPlanRadio"
                size="small"
                sx={{
                  p: 0,
                  mt: 0.25,
                  '&.Mui-checked': { color: '#16a34a' }
                }}
              />
              <Box>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <i className="fi fi-rr-money-bill-wave" style={{ fontSize: '18px', color: '#16a34a' }}></i>
                  <Typography variant="body1" fontWeight={800} color="#0f172a">
                    Cash on Delivery (50% Downpayment)
                  </Typography>
                </Box>
                <Typography variant="body2" color="#475569" sx={{ mt: 0.5, fontWeight: 500 }}>
                  50% bank transfer and 50% Cash on the Item Delivered
                </Typography>
              </Box>
            </Box>
            <Chip
              label="50% Upfront + 50% COD"
              size="small"
              sx={{
                bgcolor: '#f0fdf4',
                color: '#15803d',
                fontSize: '11px',
                fontWeight: 700,
                height: 24,
                flexShrink: 0
              }}
            />
          </Box>

          <Box sx={{ mt: 2, p: 1.5, borderRadius: 2.5, bgcolor: '#f8fafc', border: '1px solid #e2e8f0' }}>
            <Grid container spacing={1}>
              <Grid size={{ xs: 12, sm: 4 }}>
                <Typography variant="caption" color="#64748b" display="block">
                  Order Total {isPickup ? '(Free Pick-up):' : `(incl. ₱${actualShippingFee.toLocaleString('en-PH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} shipping):`}
                </Typography>
                <Typography variant="body2" fontWeight={700} color="#0f172a" sx={{ fontVariantNumeric: 'tabular-nums' }}>
                  ₱{grandTotal.toLocaleString('en-PH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </Typography>
              </Grid>
              <Grid size={{ xs: 12, sm: 4 }}>
                <Typography variant="caption" color="#166534" display="block" fontWeight={600}>50% Pay Now (Card/GCash):</Typography>
                <Typography variant="body2" fontWeight={800} color="#16a34a">
                  ₱{downpayment.toLocaleString('en-PH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </Typography>
              </Grid>
              <Grid size={{ xs: 12, sm: 4 }}>
                <Typography variant="caption" color="#92400e" display="block" fontWeight={600}>50% Cash on Delivery:</Typography>
                <Typography variant="body2" fontWeight={800} color="#b45309">
                  ₱{remainingCod.toLocaleString('en-PH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </Typography>
              </Grid>
            </Grid>
          </Box>

          <Collapse in={isCodPlan} timeout={250}>
            {renderPaymentDetails(downpayment, '50% Downpayment')}
          </Collapse>
        </Paper>

        <Paper
          elevation={0}
          onClick={() => selectPlan('FULL_PAYMENT')}
          sx={{
            p: { xs: 2, sm: 2.5 },
            borderRadius: 3.5,
            border: '2px solid',
            borderColor: isFullPlan ? '#1e3a8a' : '#e2e8f0',
            bgcolor: '#ffffff',
            cursor: 'pointer',
            transition: 'all 0.2s ease',
            boxShadow: isFullPlan ? '0 6px 18px rgba(30, 58, 138, 0.1)' : 'none',
            '&:hover': {
              borderColor: isFullPlan ? '#1e3a8a' : '#cbd5e1'
            }
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 1 }}>
            <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1.5 }}>
              <Radio
                checked={isFullPlan}
                onChange={() => selectPlan('FULL_PAYMENT')}
                value="FULL_PAYMENT"
                name="paymentPlanRadio"
                size="small"
                sx={{
                  p: 0,
                  mt: 0.25,
                  '&.Mui-checked': { color: '#1e3a8a' }
                }}
              />
              <Box>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <i className="fi fi-rr-bank" style={{ fontSize: '18px', color: '#1e3a8a' }}></i>
                  <Typography variant="body1" fontWeight={800} color="#0f172a">
                    Bank transfer - Full Payment
                  </Typography>
                </Box>
                <Typography variant="body2" color="#475569" sx={{ mt: 0.5, fontWeight: 500 }}>
                  Pay 100% full amount upfront via Bank Card or GCash
                </Typography>
              </Box>
            </Box>
            <Chip
              label="100% Full Payment"
              size="small"
              sx={{
                bgcolor: '#eff6ff',
                color: '#1d4ed8',
                fontSize: '11px',
                fontWeight: 700,
                height: 24,
                flexShrink: 0
              }}
            />
          </Box>

          <Box sx={{ mt: 2, p: 1.5, borderRadius: 2.5, bgcolor: '#f8fafc', border: '1px solid #e2e8f0' }}>
            <Grid container spacing={1}>
              <Grid size={{ xs: 12, sm: 6 }}>
                <Typography variant="caption" color="#64748b" display="block">
                  Order Total {isPickup ? '(Free Pick-up):' : `(incl. ₱${actualShippingFee.toLocaleString('en-PH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} shipping):`}
                </Typography>
                <Typography variant="body2" fontWeight={700} color="#0f172a" sx={{ fontVariantNumeric: 'tabular-nums' }}>
                  ₱{grandTotal.toLocaleString('en-PH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </Typography>
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <Typography variant="caption" color="#1e40af" display="block" fontWeight={600}>100% Pay Now (Card/GCash):</Typography>
                <Typography variant="body2" fontWeight={800} color="#1e3a8a">
                  ₱{grandTotal.toLocaleString('en-PH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </Typography>
              </Grid>
            </Grid>
          </Box>

          <Collapse in={isFullPlan} timeout={250}>
            {renderPaymentDetails(grandTotal, 'Full Payment')}
          </Collapse>
        </Paper>
      </Stack>
    </Box>
  );
};

export default PaymentMethodWidget;
