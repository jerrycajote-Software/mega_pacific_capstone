import React from 'react';
import { Box, Container, Grid, Typography, Link, IconButton, Divider } from '@mui/material';

const Footer = () => {
  return (
    <Box component="footer" sx={{ bgcolor: 'background.paper', pt: 6, pb: 3, borderTop: '1px solid', borderColor: 'divider', mt: 'auto' }}>
      <Container maxWidth="lg">
        <Grid container spacing={4}>
          {/* Company Info */}
          <Grid item xs={12} md={4}>
            <Box sx={{ mb: 2 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', fontFamily: 'Arial, sans-serif', fontWeight: 900, fontSize: 24, letterSpacing: '0.05em', lineHeight: 1 }}>
                <Typography variant="span" sx={{ color: 'primary.main', WebkitTextStroke: '1px #31572c' }}>MEGA</Typography>
                <Typography variant="span" sx={{ color: 'secondary.main', WebkitTextStroke: '1px #4f772d' }}>PACIFIC</Typography>
              </Box>
              <Typography sx={{ color: 'success.main', fontSize: '10px', fontWeight: 800, letterSpacing: '0.2em', mt: 0.5, fontFamily: 'Arial, sans-serif' }}>
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

          {/* Contact Details */}
          <Grid item xs={12} sm={6} md={3}>
            <Typography variant="h6" color="text.primary" gutterBottom>
              Contact Us
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'flex-start', mb: 1, gap: 1 }}>
              <i className="fi fi-rr-marker" style={{ fontSize: '14px', color: '#64748b', marginTop: '4px' }}></i>
              <Typography variant="body2" color="text.secondary">
                123 Industrial Ave, Cavite,<br /> Philippines 4100
              </Typography>
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 1, gap: 1 }}>
              <i className="fi fi-rr-phone-call" style={{ fontSize: '14px', color: '#64748b' }}></i>
              <Typography variant="body2" color="text.secondary">
                +63 (2) 1234 5678
              </Typography>
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <i className="fi fi-rr-envelope" style={{ fontSize: '14px', color: '#64748b' }}></i>
              <Typography variant="body2" color="text.secondary">
                info@megapacific.com
              </Typography>
            </Box>
          </Grid>

          {/* Quick Links */}
          <Grid item xs={12} sm={6} md={2}>
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
            <Link href="#" color="text.secondary" display="block" variant="body2" sx={{ mb: 1, textDecoration: 'none', '&:hover': { color: 'primary.main' } }}>
              Terms & Conditions
            </Link>
          </Grid>

          {/* Product Categories */}
          <Grid item xs={12} sm={6} md={3}>
            <Typography variant="h6" color="text.primary" gutterBottom>
              Products
            </Typography>
            <Link href="#" color="text.secondary" display="block" variant="body2" sx={{ mb: 1, textDecoration: 'none', '&:hover': { color: 'primary.main' } }}>
              Corrugated Roofing
            </Link>
            <Link href="#" color="text.secondary" display="block" variant="body2" sx={{ mb: 1, textDecoration: 'none', '&:hover': { color: 'primary.main' } }}>
              Rib Type Roofing
            </Link>
            <Link href="#" color="text.secondary" display="block" variant="body2" sx={{ mb: 1, textDecoration: 'none', '&:hover': { color: 'primary.main' } }}>
              Spandrel
            </Link>
            <Link href="#" color="text.secondary" display="block" variant="body2" sx={{ mb: 1, textDecoration: 'none', '&:hover': { color: 'primary.main' } }}>
              Steel Trusses
            </Link>
          </Grid>
        </Grid>

        <Divider sx={{ my: 3 }} />
        
        <Typography variant="body2" color="text.secondary" align="center">
          © {new Date().getFullYear()} Mega Pacific Roofing Systems. All rights reserved.
        </Typography>
      </Container>
    </Box>
  );
};

export default Footer;
