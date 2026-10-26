import React from 'react';
import { Box, Container, Grid, Typography, Link, IconButton, Divider } from '@mui/material';
import { openCustomerSupport } from '../utils/supportEvents';

const MastercardBadge = () => (
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
      flexShrink: 0
    }}
  >
    <svg width="22" height="14" viewBox="0 0 28 18" fill="none">
      <circle cx="10" cy="9" r="7" fill="#EB001B" />
      <circle cx="18" cy="9" r="7" fill="#F79E1B" fillOpacity="0.88" />
    </svg>
  </Box>
);

const VisaBadge = () => (
  <Box
    sx={{
      display: 'inline-flex',
      alignItems: 'center',
      justifyContent: 'center',
      width: 34,
      height: 20,
      borderRadius: '4px',
      bgcolor: '#1434CB',
      flexShrink: 0
    }}
  >
    <Typography
      sx={{
        color: '#ffffff',
        fontFamily: 'system-ui, -apple-system, sans-serif',
        fontWeight: 900,
        fontStyle: 'italic',
        fontSize: '9.5px',
        letterSpacing: '0.8px',
        lineHeight: 1
      }}
    >
      VISA
    </Typography>
  </Box>
);

const GCashBadge = () => (
  <Box
    sx={{
      width: 20,
      height: 20,
      borderRadius: '50%',
      bgcolor: '#005ce6',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      color: '#ffffff',
      fontWeight: 800,
      fontSize: '11px',
      boxShadow: '0 2px 5px rgba(0, 92, 230, 0.25)',
      flexShrink: 0
    }}
  >
    <span style={{ transform: 'translateY(-0.5px)' }}>G</span>
  </Box>
);

const Footer = () => {
  return (
    <Box component="footer" sx={{ bgcolor: 'background.paper', pt: 6, pb: 3, borderTop: '1px solid', borderColor: 'divider', mt: 'auto' }}>
      <Container maxWidth="lg">
        <Grid container spacing={4}>
          <Grid item xs={12} md={4}>
            <Box sx={{ mb: 2 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', fontFamily: 'Arial, sans-serif', fontWeight: 900, fontSize: 24, letterSpacing: '0.05em', lineHeight: 1 }}>
                <Typography component="span" sx={{ color: '#1e3a8a', fontSize: 'inherit', fontWeight: 'inherit' }}>MEGA</Typography>
                <Typography component="span" sx={{ color: (theme) => theme.palette.mode === 'dark' ? '#f8fafc' : '#0f172a', fontSize: 'inherit', fontWeight: 'inherit' }}>PACIFIC</Typography>
              </Box>
              <Typography sx={{ color: '#64748b', fontSize: '10px', fontWeight: 800, letterSpacing: '0.2em', lineHeight: 1, mt: '-2px', fontFamily: 'Arial, sans-serif' }}>
                METAL AND STEEL CORP
              </Typography>
            </Box>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2, maxWidth: 300 }}>
              Providing top-quality roofing systems, construction materials, and durable steel solutions since 1998. Your trusted partner in building the future.
            </Typography>
            <Box sx={{ display: 'flex', gap: 1 }}>
              <IconButton size="small" color="primary"><i className="fi fi-brands-facebook" style={{ fontSize: '16px' }}></i></IconButton>
            </Box>
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <Typography variant="h6" color="text.primary" gutterBottom>
              Contact Us
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'flex-start', mb: 1, gap: 1 }}>
              <i className="fi fi-rr-marker" style={{ fontSize: '14px', color: '#64748b', marginTop: '4px' }}></i>
              <Typography variant="body2" color="text.secondary">
                #379 Aguinaldo Highway, Anabu 1-C,<br /> Imus City, Cavite
              </Typography>
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 1, gap: 1 }}>
              <i className="fi fi-rr-phone-call" style={{ fontSize: '14px', color: '#64748b' }}></i>
              <Typography variant="body2" color="text.secondary">
                Tel. NO.: (046) 416 9217
              </Typography>
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 1, gap: 1 }}>
              <i className="fi fi-rr-phone-call" style={{ fontSize: '14px', color: '#64748b' }}></i>
              <Typography variant="body2" color="text.secondary">
                Cel. No.: 0917 277 7727
              </Typography>
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <i className="fi fi-rr-envelope" style={{ fontSize: '14px', color: '#64748b' }}></i>
              <Typography variant="body2" color="text.secondary">
                megapacificmetal@gmail.com
              </Typography>
            </Box>
          </Grid>

          <Grid item xs={6} sm={6} md={2}>
            <Typography variant="h6" color="text.primary" gutterBottom>
              Quick Links
            </Typography>
            <Link href="/dashboard" color="text.secondary" display="block" variant="body2" sx={{ mb: 1, textDecoration: 'none', '&:hover': { color: 'primary.main' } }}>
              Home
            </Link>
            <Link href="/profile" color="text.secondary" display="block" variant="body2" sx={{ mb: 1, textDecoration: 'none', '&:hover': { color: 'primary.main' } }}>
              My Account
            </Link>
            <Link href="/orders" color="text.secondary" display="block" variant="body2" sx={{ mb: 1, textDecoration: 'none', '&:hover': { color: 'primary.main' } }}>
              Order History
            </Link>
            <Typography
              component="button"
              onClick={() => openCustomerSupport()}
              sx={{
                display: 'block',
                border: 'none',
                bgcolor: 'transparent',
                p: 0,
                cursor: 'pointer',
                color: 'text.secondary',
                fontSize: '0.875rem',
                fontFamily: 'inherit',
                mb: 1,
                textAlign: 'left',
                '&:hover': { color: 'primary.main' }
              }}
            >
              Customer Support
            </Typography>
            <Link href="#" color="text.secondary" display="block" variant="body2" sx={{ mb: 1, textDecoration: 'none', '&:hover': { color: 'primary.main' } }}>
              Terms & Conditions
            </Link>
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <Typography variant="h6" color="text.primary" gutterBottom sx={{ fontSize: '1rem', fontWeight: 700 }}>
              Payment Methods
            </Typography>

            <Box sx={{ mb: 2 }}>
              <Typography
                variant="caption"
                sx={{
                  color: 'text.secondary',
                  fontWeight: 700,
                  textTransform: 'uppercase',
                  letterSpacing: '0.06em',
                  display: 'block',
                  mb: 1
                }}
              >
                Bank Card
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}>
                <Box
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 1,
                    px: 1.25,
                    py: 0.6,
                    borderRadius: 2,
                    border: '1px solid',
                    borderColor: 'divider',
                    bgcolor: (theme) => theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.03)' : '#f8fafc'
                  }}
                >
                  <MastercardBadge />
                  <Typography variant="body2" sx={{ fontWeight: 600, color: 'text.primary', fontSize: '0.8rem' }}>
                    Mastercard
                  </Typography>
                </Box>
                <Box
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 1,
                    px: 1.25,
                    py: 0.6,
                    borderRadius: 2,
                    border: '1px solid',
                    borderColor: 'divider',
                    bgcolor: (theme) => theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.03)' : '#f8fafc'
                  }}
                >
                  <VisaBadge />
                  <Typography variant="body2" sx={{ fontWeight: 600, color: 'text.primary', fontSize: '0.8rem' }}>
                    Visa Card
                  </Typography>
                </Box>
              </Box>
            </Box>

            <Box sx={{ mb: 2 }}>
              <Typography
                variant="caption"
                sx={{
                  color: 'text.secondary',
                  fontWeight: 700,
                  textTransform: 'uppercase',
                  letterSpacing: '0.06em',
                  display: 'block',
                  mb: 1
                }}
              >
                E-Wallet
              </Typography>
              <Box
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 1,
                  px: 1.25,
                  py: 0.6,
                  borderRadius: 2,
                  border: '1px solid',
                  borderColor: 'divider',
                  bgcolor: (theme) => theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.03)' : '#f8fafc',
                  width: 'fit-content'
                }}
              >
                <GCashBadge />
                <Typography variant="body2" sx={{ fontWeight: 600, color: 'text.primary', fontSize: '0.8rem' }}>
                  GCash
                </Typography>
              </Box>
            </Box>

            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
              <i className="fi fi-rr-shield-check" style={{ fontSize: '14px', color: '#16a34a' }}></i>
              <Typography variant="caption" sx={{ color: 'text.secondary', fontSize: '0.74rem' }}>
                Encrypted & Secure Payment
              </Typography>
            </Box>
          </Grid>
        </Grid>

        <Divider sx={{ my: 3 }} />
        
        <Box sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, alignItems: 'center', justifyContent: 'space-between', gap: 1.5 }}>
          <Typography variant="body2" color="text.secondary" align="center">
            © {new Date().getFullYear()} Mega Pacific Metal and Steel Roofing Systems. All rights reserved.
          </Typography>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <MastercardBadge />
            <VisaBadge />
            <GCashBadge />
          </Box>
        </Box>
      </Container>
    </Box>
  );
};

export default Footer;
