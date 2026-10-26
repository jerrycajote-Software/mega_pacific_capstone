import React from 'react';
import { Box, Typography, Button, Container, Chip } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import useIsMobileBrowser from '../hooks/useDeviceDetect';

const HeroSection = () => {
  const navigate = useNavigate();
  const isMobile = useIsMobileBrowser();


  return (
    <Box 
      sx={{ 
        bgcolor: 'background.paper', 
        borderRadius: { xs: 3, md: 4 }, 
        overflow: 'hidden', 
        position: 'relative',
        mb: { xs: 3, md: 6 },
        border: '1px solid',
        borderColor: 'divider',
        boxShadow: '0 4px 20px rgba(0, 0, 0, 0.05)'
      }}
    >
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
      
      <Container maxWidth="lg" sx={{ position: 'relative', zIndex: 1, px: { xs: 2.5, sm: 4 } }}>
        <Box 
          sx={{ 
            minHeight: { xs: 'auto', md: 380 }, 
            py: { xs: 4, sm: 6, md: 7 }, 
            display: 'flex', 
            flexDirection: 'column', 
            justifyContent: 'center' 
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.2, mb: 0.5, flexWrap: 'wrap' }}>
            <Typography 
              variant="overline" 
              sx={{ 
                color: 'primary.main', 
                fontWeight: 800, 
                letterSpacing: { xs: 1.5, sm: 2 },
                fontSize: { xs: '0.75rem', sm: '0.85rem' }
              }}
            >
              Metal Roofing & Steel Solutions
            </Typography>
            
          </Box>
          <Typography 
            variant="h2" 
            component="h1" 
            sx={{ 
              mt: 1, 
              mb: 1.5, 
              color: 'text.primary', 
              fontSize: { xs: '1.75rem', sm: '2.5rem', md: '3.25rem' },
              fontWeight: 900,
              lineHeight: { xs: 1.2, md: 1.15 }
            }}
          >
            Build the Future with <Box component="span" sx={{ color: 'primary.main' }}>Mega Pacific</Box>
          </Typography>
          <Typography 
            variant="body1" 
            sx={{ 
              mb: 3.5, 
              color: 'text.secondary', 
              fontSize: { xs: '0.95rem', md: '1.05rem' }, 
              maxWidth: 600,
              lineHeight: 1.6
            }}
          >
            Discover our wide range of durable roofing systems, steel trusses, and construction materials designed to withstand the test of time.
          </Typography>
          <Box sx={{ display: 'flex', gap: 1.5, flexWrap: 'wrap', alignItems: 'center' }}>
            <Button
              variant="contained"
              color="primary"
              size="large"
              onClick={() => navigate('/roof-designer')}
              sx={{
                px: { xs: 3, sm: 3.5 },
                py: { xs: 1.25, sm: 1.5 },
                fontSize: { xs: '0.9rem', sm: '1rem' },
                display: 'flex',
                alignItems: 'center',
                gap: 1.2,
                fontWeight: 700,
                borderRadius: 2.5,
                boxShadow: '0 4px 14px rgba(79,119,45,0.3)',
                width: { xs: '100%', sm: 'auto' },
                justifyContent: 'center',
                '&:hover': {
                  boxShadow: '0 8px 20px rgba(79,119,45,0.45)',
                  transform: 'translateY(-1px)'
                }
              }}
            >
              <i className="fi fi-rr-home" style={{ fontSize: '16px' }}></i>
              <span>3D Roof Designer</span>
              {isMobile && (
                <Chip 
                  label="Desktop" 
                  size="small" 
                  sx={{ 
                    height: 18, 
                    fontSize: '0.62rem', 
                    fontWeight: 800, 
                    bgcolor: 'rgba(255, 255, 255, 0.25)',
                    color: '#ffffff',
                    border: '1px solid rgba(255, 255, 255, 0.4)',
                    ml: 0.5
                  }} 
                />
              )}
            </Button>
          </Box>
        </Box>
      </Container>
    </Box>
  );
};

export default HeroSection;
