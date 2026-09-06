import React from 'react';
import {
  Box,
  Typography,
  Paper,
  Radio,
  RadioGroup,
  FormControlLabel,
  Fade,
  Avatar,
  Stack,
} from '@mui/material';

const PAYMENT_OPTIONS = [
  {
    value: 'Cash on Delivery with 50% Bank tranfer',
    label: 'Cash on Delivery',
    description: 'Pay 50% upfront via bank transfer, remainder on delivery',
    iconClass: 'fi fi-rr-money-bill-wave',
  },
  {
    value: 'Bank Transfer Fully Paid',
    label: 'Bank Transfer',
    description: 'Pay the full amount via bank transfer before delivery',
    iconClass: 'fi fi-rr-bank',
  },
];

const PaymentMethodWidget = ({ paymentMode, onChange }) => {
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
                    bgcolor: isSelected ? 'primary.50' : 'background.paper',
                    transition: 'all 0.25s cubic-bezier(0.4,0,0.2,1)',
                    '&:hover': {
                      borderColor: isSelected ? 'primary.main' : 'primary.light',
                      boxShadow: isSelected
                        ? '0 4px 16px rgba(79,119,45,0.15)'
                        : '0 2px 8px rgba(0,0,0,0.06)',
                      transform: 'translateY(-1px)',
                    },
                  }}
                >
                  {/* Selected indicator bar */}
                  <Box
                    sx={{
                      position: 'absolute',
                      top: 0,
                      left: 0,
                      right: 0,
                      height: 3,
                      bgcolor: isSelected ? 'primary.main' : 'transparent',
                      transition: 'background-color 0.3s ease',
                    }}
                  />

                  <Box sx={{ display: 'flex', alignItems: 'flex-start', p: 2.5, gap: 1.5 }}>
                    <FormControlLabel
                      value={option.value}
                      control={<Radio color="primary" />}
                      label=""
                      sx={{ m: 0, mt: -0.5 }}
                    />
                    <Box sx={{ flex: 1 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                        <i className={option.iconClass} style={{ fontSize: '18px', color: isSelected ? '#1e3a8a' : '#94a3b8' }}></i>
                        <Typography fontWeight={700} variant="body2">
                          {option.label}
                        </Typography>
                        {isSelected && (
                          <i className="fi fi-sr-check-circle" style={{ fontSize: '16px', color: '#1e3a8a', marginLeft: 'auto' }}></i>
                        )}
                      </Box>
                      <Typography variant="caption" color="text.secondary" sx={{ lineHeight: 1.4 }}>
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
    </Box>
  );
};

export default PaymentMethodWidget;
