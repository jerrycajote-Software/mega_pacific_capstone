import React, { useState } from 'react';
import {
  Box,
  Typography,
  Paper,
  Radio,
  RadioGroup,
  Fade,
  Avatar,
  Stack,
  Collapse,
  TextField,
  InputAdornment,
  Checkbox,
  FormControlLabel,
} from '@mui/material';

const PAYMENT_OPTIONS = [
  {
    value: 'Cash on Delivery',
    label: 'Cash on Delivery',
    description: 'Pay 50% upfront via bank transfer, remainder on delivery',
    iconClass: 'fi fi-rr-money-bill-wave',
  },
  {
    value: 'Bank Transfer',
    label: 'Bank Transfer',
    description: 'Pay the full amount via bank transfer before delivery',
    iconClass: 'fi fi-rr-bank',
  },
];

const PaymentMethodWidget = ({ paymentMode, onChange }) => {
  const [innerMethod, setInnerMethod] = useState('card');

  return (
    <Box>
      {/* ── Header ── */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 2 }}>
        <Avatar
          sx={{
            bgcolor: 'primary.main',
            width: 40,
            height: 40,
            boxShadow: '0 2px 8px rgba(79,119,45,0.25)',
          }}
        >
          <i className="fi fi-rr-credit-card" style={{ fontSize: '18px', color: '#ffffff' }}></i>
        </Avatar>
        <Typography variant="h6" fontWeight={700}>
          Payment Method
        </Typography>
      </Box>

      <Box sx={{ borderBottom: '1px solid', borderColor: 'divider', mb: 3 }} />

      {/* ── Options ── */}
      <RadioGroup
        name="paymentMode"
        value={paymentMode}
        onChange={onChange}
        sx={{ gap: 2 }}
      >
        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
          {PAYMENT_OPTIONS.map((option) => {
            const isSelected = paymentMode === option.value;

            return (
              <Fade in key={option.value} timeout={200}>
                <Paper
                  variant="outlined"
                  onClick={() =>
                    onChange({ target: { name: 'paymentMode', value: option.value } })
                  }
                  sx={{
                    flex: 1,
                    p: 0,
                    cursor: 'pointer',
                    position: 'relative',
                    overflow: 'hidden',
                    borderColor: isSelected ? 'primary.main' : 'divider',
                    bgcolor: '#ffffff',
                    borderWidth: isSelected ? 2 : 1,
                    transition: 'all 0.2s ease',
                    '&:hover': {
                      borderColor: isSelected ? 'primary.main' : 'primary.light',
                      boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
                    },
                  }}
                >
                  <Box sx={{ display: 'flex', alignItems: 'flex-start', p: 2, gap: 1 }}>
                    <Radio
                      checked={isSelected}
                      color="primary"
                      sx={{ p: 0.5, mt: -0.25 }}
                    />
                    <Box sx={{ flex: 1, ml: 0.5 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                        <i className={option.iconClass} style={{ fontSize: '18px', color: '#1e3a8a' }}></i>
                        <Typography fontWeight={500} variant="body1" color="text.primary">
                          {option.label}
                        </Typography>
                        {isSelected && (
                          <i className="fi fi-sr-check-circle" style={{ fontSize: '18px', color: '#1e3a8a', marginLeft: 'auto' }}></i>
                        )}
                      </Box>
                      <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.5 }}>
                        {option.description}
                      </Typography>
                    </Box>
                  </Box>
                </Paper>
              </Fade>
            );
          })}
        </Stack>
      </RadioGroup>

      {/* ── Payment Details Form (Inner Accordion) ── */}
      <Collapse in={!!paymentMode}>
        <Box sx={{ mt: 3 }}>
          <Stack spacing={2} sx={{ maxWidth: '100%' }}>
            {/* ── Card Option ── */}
            <Paper
              elevation={0}
              sx={{
                border: '1px solid',
                borderColor: innerMethod === 'card' ? 'primary.main' : 'divider',
                borderRadius: 3,
                overflow: 'hidden',
                transition: 'all 0.2s ease',
                bgcolor: innerMethod === 'card' ? '#ffffff' : '#fafafa',
              }}
            >
              <Box 
                sx={{ p: 2.5, display: 'flex', alignItems: 'center', gap: 2, cursor: 'pointer' }}
                onClick={() => setInnerMethod('card')}
              >
                <i className="fi fi-rr-credit-card" style={{ fontSize: '20px', color: '#1a1a1a', display: 'flex' }}></i>
                <Typography variant="body1" fontWeight={600} color="text.primary">
                  Card
                </Typography>
              </Box>

              <Collapse in={innerMethod === 'card'}>
                <Box sx={{ p: 2.5, pt: 0 }}>
                  <Stack spacing={2.5}>
                    {/* Card Number */}
                    <TextField
                      fullWidth
                      placeholder="Card number"
                      variant="outlined"
                      InputProps={{
                        endAdornment: (
                          <InputAdornment position="end">
                            <Stack direction="row" spacing={0.5} sx={{ opacity: 0.8 }}>
                              {/* Mocking the card logos with tiny colored boxes for the UI effect */}
                              <Box sx={{ width: 28, height: 18, bgcolor: '#ff5f00', borderRadius: 0.5, display: 'flex', alignItems: 'center', justifyContent: 'center' }} />
                              <Box sx={{ width: 28, height: 18, bgcolor: '#1a1f71', borderRadius: 0.5, display: 'flex', alignItems: 'center', justifyContent: 'center' }} />
                              <Box sx={{ width: 28, height: 18, bgcolor: '#007bc1', borderRadius: 0.5, display: 'flex', alignItems: 'center', justifyContent: 'center' }} />
                              <Box sx={{ width: 28, height: 18, bgcolor: '#ff6600', borderRadius: 0.5, display: 'flex', alignItems: 'center', justifyContent: 'center' }} />
                            </Stack>
                          </InputAdornment>
                        ),
                        sx: { 
                          borderRadius: 2.5, 
                          bgcolor: '#ffffff',
                          '& fieldset': { borderColor: 'divider' },
                        }
                      }}
                    />

                    {/* Expiry and CVC */}
                    <Stack direction="row" spacing={2}>
                      <TextField
                        fullWidth
                        placeholder="Expiration date"
                        variant="outlined"
                        InputProps={{ 
                          sx: { 
                            borderRadius: 2.5, 
                            bgcolor: '#ffffff',
                            '& fieldset': { borderColor: 'divider' }
                          } 
                        }}
                      />
                      <TextField
                        fullWidth
                        placeholder="Security code"
                        variant="outlined"
                        InputProps={{
                          endAdornment: (
                            <InputAdornment position="end">
                              <i className="fi fi-rr-credit-card" style={{ fontSize: '20px', color: '#9e9e9e', display: 'flex' }}></i>
                            </InputAdornment>
                          ),
                          sx: { 
                            borderRadius: 2.5, 
                            bgcolor: '#ffffff',
                            '& fieldset': { borderColor: 'divider' }
                          }
                        }}
                      />
                    </Stack>

                    {/* Checkbox */}
                    <FormControlLabel
                      control={
                        <Checkbox 
                          size="small" 
                          sx={{ color: 'divider', '&.Mui-checked': { color: 'primary.main' } }} 
                        />
                      }
                      label={
                        <Typography variant="body2" color="text.secondary">
                          Save payment details to Mega Pacific Inc. for future purchases
                        </Typography>
                      }
                      sx={{ ml: -0.5 }}
                    />
                  </Stack>
                </Box>
              </Collapse>
            </Paper>

            {/* ── GCash Option ── */}
            <Paper
              elevation={0}
              sx={{
                border: '1px solid',
                borderColor: innerMethod === 'gcash' ? 'primary.main' : 'divider',
                borderRadius: 3,
                overflow: 'hidden',
                transition: 'all 0.2s ease',
                bgcolor: innerMethod === 'gcash' ? '#ffffff' : '#fafafa',
              }}
            >
              <Box 
                sx={{ p: 2.5, display: 'flex', alignItems: 'center', gap: 2, cursor: 'pointer' }}
                onClick={() => setInnerMethod('gcash')}
              >
                {/* GCash Icon */}
                <Box
                  sx={{
                    width: 24,
                    height: 24,
                    borderRadius: '50%',
                    bgcolor: '#0052e0',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#fff',
                    fontSize: '12px',
                    fontWeight: 'bold',
                  }}
                >
                  G
                </Box>
                <Typography variant="body1" fontWeight={600} color="text.primary">
                  GCash
                </Typography>
              </Box>
              <Collapse in={innerMethod === 'gcash'}>
                <Box sx={{ p: 2.5, pt: 0 }}>
                  <Typography variant="body2" color="text.secondary">
                    You will be redirected to GCash to complete this purchase securely.
                  </Typography>
                </Box>
              </Collapse>
            </Paper>
          </Stack>
        </Box>
      </Collapse>
    </Box>
  );
};

export default PaymentMethodWidget;
