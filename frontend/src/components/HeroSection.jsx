import React from 'react';
import { Box, Typography, Button, Container, Grid } from '@mui/material';
import { useNavigate } from 'react-router-dom';

const HeroSection = () => {
  const navigate = useNavigate();

  return (
    <Box 
      sx={{ 
        bgcolor: 'background.paper', 
        borderRadius: 4, 
        overflow: 'hidden', 
        position: 'relative',
        mb: 6,
        border: '1px solid',
        borderColor: 'divider',
        boxShadow: '0 4px 20px rgba(0, 0, 0, 0.05)'
      }}
    >
      {/* Background Graphic or Gradient */}
      <Box 
        sx={{
          position: 'absolute',
          top: 0,
          right: 0,
          bottom: 0,
          width: '50%',
          background: 'linear-gradient(135deg, rgba(144, 169, 85, 0.1) 0%, rgba(79, 119, 45, 0.2) 100%)',
          clipPath: 'polygon(20% 0, 100% 0, 100% 100%, 0% 100%)',
          zIndex: 0,
          display: { xs: 'none', md: 'block' }
        }}
      />
      
      <Container maxWidth="lg" sx={{ position: 'relative', zIndex: 1 }}>
        <Box sx={{ minHeight: 400, py: { xs: 6, md: 8 }, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
          <Typography variant="overline" sx={{ color: 'primary.main', fontWeight: 700, letterSpacing: 2 }}>
            Premium Quality Materials
          </Typography>
          <Typography variant="h2" component="h1" sx={{ mt: 1, mb: 2, color: 'text.primary', fontSize: { xs: '2.5rem', md: '3.5rem' } }}>
            Build the Future with <Box component="span" sx={{ color: 'primary.main' }}>Mega Pacific</Box>
          </Typography>
          <Typography variant="body1" sx={{ mb: 4, color: 'text.secondary', fontSize: '1.1rem', maxWidth: 600 }}>
            Discover our wide range of durable roofing systems, steel trusses, and construction materials designed to withstand the test of time.
          </Typography>
          <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
            <Button 
              variant="contained" 
              color="primary" 
              size="large" 
              onClick={() => navigate('/dashboard')}
              sx={{ px: 4, py: 1.5, fontSize: '1rem', display: 'flex', alignItems: 'center', gap: 1 }}
            >
              Shop Now
              <i className="fi fi-rr-arrow-right" style={{ fontSize: '14px' }}></i>
            </Button>
          </Box>
        </Box>
      </Container>
    </Box>
  );
};

export default HeroSection;
