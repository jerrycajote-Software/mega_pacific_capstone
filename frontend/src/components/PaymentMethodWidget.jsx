import React from 'react';
import {
  Box,
  Typography,
  Paper,
  Stack,
  Collapse,
  Grid,
  Radio,
  Chip
} from '@mui/material';
import {
  CustomCreditCardIcon,
  CustomCashIcon,
  CustomInfoIcon,
  CustomLocalShippingIcon,
  CustomStorefrontIcon
} from './icons';

const PaypalBadgeLogo = () => (
  <Box
    sx={{
      width: 28,
      height: 28,
      borderRadius: '50%',
      bgcolor: '#003087',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      color: '#ffffff',
      fontWeight: 900,
      fontSize: '14px',
      boxShadow: '0 2px 6px rgba(0, 48, 135, 0.25)',
      flexShrink: 0
    }}
  >
    P
  </Box>
);

const PaymentMethodWidget = ({
  paymentPlan = 'COD_50',
  paypalMode = 'sandbox',
  paypalConfigured = false,
  subtotal = 0,
  shippingFee = 0,
  fulfillmentType = 'Delivery',
  onChange
}) => {
  const actualShippingFee = Math.max(0, Number(shippingFee) || 0);
  const isPickup = fulfillmentType === 'Pickup' || actualShippingFee === 0;
  const grandTotal = (Number(subtotal) || 0) + (isPickup ? 0 : actualShippingFee);
  const downpayment = grandTotal * 0.5;
  const remainingCod = grandTotal * 0.5;

  const selectPlan = (plan) => {
    if (onChange) {
      onChange({ target: { name: 'paymentPlan', value: plan } });
      onChange({ target: { name: 'paymentChannel', value: 'PayPal' } });
    }
  };

  const isCodPlan = paymentPlan === 'COD_50';
  const isFullPlan = paymentPlan === 'FULL_PAYMENT';
  const isLiveMode = String(paypalMode).toLowerCase() === 'live';

  const renderPaypalMethodBox = (amountToPayNow, labelPrefix) => (
    <Box sx={{ mt: 2.5, pt: 2.5, borderTop: '1px solid #e2e8f0' }} onClick={(e) => e.stopPropagation()}>
      <Box sx={{ mb: 2, display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 1 }}>
        <Typography variant="caption" fontWeight={700} color="#475569" sx={{ textTransform: 'uppercase', letterSpacing: '0.5px' }}>
          Payment Method for {labelPrefix} (₱{amountToPayNow.toLocaleString('en-PH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })})
        </Typography>
      </Box>

      <Paper
        elevation={0}
        sx={{
          p: 2,
          borderRadius: 3,
          border: '1.5px solid #003087',
          bgcolor: '#f0f6ff'
        }}
      >
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: 1,
            mb: 1.25
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.25, minWidth: 0 }}>
            <Radio
              checked
              readOnly
              value="PayPal"
              size="small"
              sx={{ p: 0, '&.Mui-checked': { color: '#003087' } }}
            />
            <PaypalBadgeLogo />
            <Typography variant="body2" fontWeight={800} color="#0f172a">
              PayPal (PayPal Wallet or Debit / Credit Card)
            </Typography>
          </Box>
          <Chip
            label={paypalConfigured ? (isLiveMode ? 'Live PayPal' : 'Sandbox PayPal') : 'PayPal Checkout'}
            size="small"
            sx={{
              bgcolor: '#dbeafe',
              color: '#1e3a8a',
              fontWeight: 700,
              fontSize: '10.5px',
              height: 22,
              flexShrink: 0
            }}
          />
        </Box>

        <Box
          sx={{
            p: 1.5,
            borderRadius: 2.5,
            bgcolor: '#ffffff',
            border: '1px solid #bfdbfe'
          }}
        >
          <Typography variant="caption" fontWeight={800} color="#1e3a8a" display="block">
            Secure Online Checkout via PayPal
          </Typography>
          <Typography variant="caption" color="#334155" sx={{ lineHeight: 1.45, display: 'block', mt: 0.25 }}>
            When you click Pay below, a secure PayPal checkout window will open so you can pay ₱{amountToPayNow.toLocaleString('en-PH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} using your PayPal account or Visa/Mastercard debit or credit card.
          </Typography>
        </Box>
      </Paper>
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
            <CustomInfoIcon size={16} color="#ffffff" />
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
                {isPickup ? 'Cash on Pick-up (50% Downpayment):' : 'Cash on Delivery (50% Downpayment):'}
              </Typography>
              <Typography variant="body2" color="#334155" sx={{ lineHeight: 1.45 }}>
                <strong>
                  {isPickup
                    ? '50% downpayment via PayPal and 50% upon Store Pick-up'
                    : '50% downpayment via PayPal and 50% Cash on Delivery'}
                </strong>
                . Pay the first 50% online via PayPal (PayPal Wallet or Debit/Credit Card). Your order will be marked as Pending 50% Payment until you settle the remaining 50% with Logistics upon {isPickup ? 'pick-up at our plant' : 'delivery'}.
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
                PayPal - Full Payment (100%):
              </Typography>
              <Typography variant="body2" color="#334155" sx={{ lineHeight: 1.45 }}>
                <strong>100% Full Payment online</strong> via PayPal (PayPal Wallet or Debit/Credit Card) with no remaining balance upon {isPickup ? 'pick-up' : 'delivery'}.
              </Typography>
            </Box>
          </Box>

          <Box sx={{ pt: 1, borderTop: '1px dashed #cbd5e1', display: 'flex', alignItems: 'center', gap: 1 }}>
            {isPickup ? (
              <CustomStorefrontIcon size={16} color="#16a34a" />
            ) : (
              <CustomLocalShippingIcon size={16} color="#16a34a" />
            )}
            <Typography variant="caption" fontWeight={700} color="#15803d">
              {isPickup
                ? 'Plant Pick-up selected: No delivery logistics fee applied (FREE).'
                : `Both payment options include the calculated delivery logistics fee of ₱${actualShippingFee.toLocaleString('en-PH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}.`}
            </Typography>
          </Box>
        </Stack>
      </Paper>

      <Typography variant="subtitle1" fontWeight={700} sx={{ mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
        <CustomCreditCardIcon size={18} color="#1e3a8a" />
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
          <Box
            sx={{
              display: 'flex',
              alignItems: 'flex-start',
              gap: { xs: 1.25, sm: 1.5 },
              width: '100%'
            }}
          >
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
            <Box sx={{ flex: 1, minWidth: 0 }}>
              <Box
                sx={{
                  display: 'flex',
                  flexDirection: { xs: 'column', sm: 'row' },
                  alignItems: { xs: 'flex-start', sm: 'center' },
                  justifyContent: 'space-between',
                  gap: { xs: 0.75, sm: 1 },
                  width: '100%'
                }}
              >
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, minWidth: 0 }}>
                  <CustomCashIcon size={18} color="#16a34a" />
                  <Typography
                    variant="body1"
                    fontWeight={800}
                    color="#0f172a"
                    sx={{ fontSize: { xs: '0.95rem', sm: '1rem' } }}
                  >
                    {isPickup ? 'Cash on Pick-up (50% Downpayment)' : 'Cash on Delivery (50% Downpayment)'}
                  </Typography>
                </Box>
                <Chip
                  label={isPickup ? '50% PayPal + 50% at Pick-up' : '50% PayPal + 50% COD'}
                  size="small"
                  sx={{
                    bgcolor: '#f0fdf4',
                    color: '#15803d',
                    fontSize: '11px',
                    fontWeight: 700,
                    height: 24,
                    alignSelf: { xs: 'flex-start', sm: 'center' }
                  }}
                />
              </Box>
              <Typography
                variant="body2"
                color="#475569"
                sx={{ mt: 0.5, fontWeight: 500, fontSize: { xs: '0.85rem', sm: '0.875rem' } }}
              >
                {isPickup
                  ? 'Pay 50% downpayment now via PayPal, then settle the remaining 50% at pick-up'
                  : 'Pay 50% downpayment now via PayPal, then settle the remaining 50% cash on delivery'}
              </Typography>
            </Box>
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
                <Typography variant="caption" color="#166534" display="block" fontWeight={600}>50% Pay Now (PayPal):</Typography>
                <Typography variant="body2" fontWeight={800} color="#16a34a">
                  ₱{downpayment.toLocaleString('en-PH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </Typography>
              </Grid>
              <Grid size={{ xs: 12, sm: 4 }}>
                <Typography variant="caption" color="#92400e" display="block" fontWeight={600}>50% {isPickup ? 'Upon Pick-up:' : 'Cash on Delivery:'}</Typography>
                <Typography variant="body2" fontWeight={800} color="#b45309">
                  ₱{remainingCod.toLocaleString('en-PH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </Typography>
              </Grid>
            </Grid>
          </Box>

          <Collapse in={isCodPlan} timeout={250}>
            {renderPaypalMethodBox(downpayment, '50% Downpayment')}
          </Collapse>
        </Paper>

        <Paper
          elevation={0}
          onClick={() => selectPlan('FULL_PAYMENT')}
          sx={{
            p: { xs: 2, sm: 2.5 },
            borderRadius: 3.5,
            border: '2px solid',
            borderColor: isFullPlan ? '#003087' : '#e2e8f0',
            bgcolor: '#ffffff',
            cursor: 'pointer',
            transition: 'all 0.2s ease',
            boxShadow: isFullPlan ? '0 6px 18px rgba(0, 48, 135, 0.1)' : 'none',
            '&:hover': {
              borderColor: isFullPlan ? '#003087' : '#cbd5e1'
            }
          }}
        >
          <Box
            sx={{
              display: 'flex',
              alignItems: 'flex-start',
              gap: { xs: 1.25, sm: 1.5 },
              width: '100%'
            }}
          >
            <Radio
              checked={isFullPlan}
              onChange={() => selectPlan('FULL_PAYMENT')}
              value="FULL_PAYMENT"
              name="paymentPlanRadio"
              size="small"
              sx={{
                p: 0,
                mt: 0.25,
                '&.Mui-checked': { color: '#003087' }
              }}
            />
            <Box sx={{ flex: 1, minWidth: 0 }}>
              <Box
                sx={{
                  display: 'flex',
                  flexDirection: { xs: 'column', sm: 'row' },
                  alignItems: { xs: 'flex-start', sm: 'center' },
                  justifyContent: 'space-between',
                  gap: { xs: 0.75, sm: 1 },
                  width: '100%'
                }}
              >
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, minWidth: 0 }}>
                  <PaypalBadgeLogo />
                  <Typography
                    variant="body1"
                    fontWeight={800}
                    color="#0f172a"
                    sx={{ fontSize: { xs: '0.95rem', sm: '1rem' } }}
                  >
                    PayPal - Full Payment
                  </Typography>
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
                    alignSelf: { xs: 'flex-start', sm: 'center' }
                  }}
                />
              </Box>
              <Typography
                variant="body2"
                color="#475569"
                sx={{ mt: 0.5, fontWeight: 500, fontSize: { xs: '0.85rem', sm: '0.875rem' } }}
              >
                Pay 100% full amount upfront via PayPal Wallet or Debit / Credit Card
              </Typography>
            </Box>
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
                <Typography variant="caption" color="#1e40af" display="block" fontWeight={600}>100% Pay Now (PayPal):</Typography>
                <Typography variant="body2" fontWeight={800} color="#003087">
                  ₱{grandTotal.toLocaleString('en-PH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </Typography>
              </Grid>
            </Grid>
          </Box>

          <Collapse in={isFullPlan} timeout={250}>
            {renderPaypalMethodBox(grandTotal, 'Full Payment')}
          </Collapse>
        </Paper>
      </Stack>
    </Box>
  );
};

export default PaymentMethodWidget;
