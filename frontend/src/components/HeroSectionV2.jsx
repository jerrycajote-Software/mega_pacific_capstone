import React from 'react';
import { Box, Typography, Button, Grid, Paper, Chip } from '@mui/material';
import { useNavigate } from 'react-router-dom';

const HeroSectionV2 = () => {
  const navigate = useNavigate();

  return (
    <Box
      sx={{
        bgcolor: '#ffffff',
        background: 'linear-gradient(135deg, #ffffff 0%, #f8fafc 60%, #eff6ff 100%)',
        color: '#0f172a',
        py: { xs: 4, md: 6 },
        px: { xs: 3, md: 5 },
        borderRadius: '20px',
        mb: 4,
        position: 'relative',
        overflow: 'hidden',
        border: '1px solid #e2e8f0',
        boxShadow: '0 10px 30px rgba(15, 23, 42, 0.04)',
      }}
    >
      {/* Background Graphic Grid */}
      <Box
        sx={{
          position: 'absolute',
          inset: 0,
          opacity: 0.05,
          backgroundImage: `radial-gradient(#1e3a8a 1px, transparent 1px)`,
          backgroundSize: '24px 24px',
          pointerEvents: 'none',
        }}
      />

      <Grid container spacing={4} alignItems="center" sx={{ position: 'relative', zIndex: 1 }}>
        <Grid item xs={12} md={7}>
          <Box sx={{ display: 'flex', gap: 1, mb: 2, flexWrap: 'wrap' }}>
            <Chip
              icon={<i className="fi fi-rr-shield-check" style={{ fontSize: '13px', color: '#1d4ed8' }}></i>}
              label="ISO 9001 MILL DIRECT STEEL"
              size="small"
              sx={{
                bgcolor: '#eff6ff',
                color: '#1d4ed8',
                border: '1px solid #bfdbfe',
                fontWeight: 800,
                fontSize: '0.7rem',
                borderRadius: '8px',
                py: 0.2,
              }}
            />
            <Chip
              icon={<i className="fi fi-rr-truck-side" style={{ fontSize: '13px', color: '#15803d' }}></i>}
              label="SUBIC & VALENZUELA DEPOTS"
              size="small"
              sx={{
                bgcolor: '#f0fdf4',
                color: '#15803d',
                border: '1px solid #bbf7d0',
                fontWeight: 800,
                fontSize: '0.7rem',
                borderRadius: '8px',
                py: 0.2,
              }}
            />
          </Box>

          <Typography
            variant="h3"
            component="h1"
            sx={{
              fontFamily: '"Poppins", sans-serif',
              fontWeight: 900,
              fontSize: { xs: '1.85rem', md: '2.75rem' },
              lineHeight: 1.2,
              mb: 2,
              color: '#0f172a',
            }}
          >
            Modern Industrial Steel & Metal Supply Portal
          </Typography>

          <Typography
            variant="body1"
            sx={{
              color: '#475569',
              fontSize: { xs: '0.95rem', md: '1.05rem' },
              lineHeight: 1.6,
              mb: 4,
              maxWidth: 620,
            }}
          >
            Direct mill inventory on ASTM structural I-beams, wide flanges, deformed steel bars, galvanized roofing, and custom cut-to-size metals with instant depot dispatch across Luzon.
          </Typography>

          <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
            <Button
              variant="contained"
              size="large"
              onClick={() => navigate('/products')}
              sx={{
                bgcolor: '#1e3a8a',
                color: '#ffffff',
                fontWeight: 800,
                px: 3.5,
                py: 1.4,
                borderRadius: '12px',
                boxShadow: '0 8px 24px rgba(30, 58, 138, 0.25)',
                textTransform: 'none',
                fontSize: '0.95rem',
                display: 'flex',
                alignItems: 'center',
                gap: 1,
                '&:hover': { bgcolor: '#1d4ed8' },
              }}
            >
              <i className="fi fi-rr-shopping-bag" style={{ fontSize: '16px' }}></i>
              Explore Products Catalog
            </Button>

            <Button
              variant="outlined"
              size="large"
              onClick={() => navigate('/orders')}
              sx={{
                color: '#1e3a8a',
                borderColor: '#cbd5e1',
                bgcolor: '#ffffff',
                fontWeight: 700,
                px: 3,
                py: 1.4,
                borderRadius: '12px',
                textTransform: 'none',
                fontSize: '0.95rem',
                display: 'flex',
                alignItems: 'center',
                gap: 1,
                '&:hover': {
                  borderColor: '#1e3a8a',
                  bgcolor: '#f8fafc',
                },
              }}
            >
              <i className="fi fi-rr-box" style={{ fontSize: '16px' }}></i>
              Track Active Orders
            </Button>
          </Box>
        </Grid>

        <Grid item xs={12} md={5}>
          <Grid container spacing={2}>
            <Grid item xs={6}>
              <Paper
                elevation={0}
                sx={{
                  p: 2.5,
                  bgcolor: '#ffffff',
                  border: '1px solid #e2e8f0',
                  borderRadius: '16px',
                  boxShadow: '0 4px 12px rgba(0,0,0,0.02)',
                  transition: 'all 0.2s ease',
                  '&:hover': { transform: 'translateY(-2px)', borderColor: '#93c5fd' },
                }}
              >
                <Box
                  sx={{
                    width: 44,
                    height: 44,
                    borderRadius: '12px',
                    bgcolor: '#eff6ff',
                    color: '#1d4ed8',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    mb: 1.5,
                    fontSize: '20px',
                  }}
                >
                  <i className="fi fi-rr-scissors"></i>
                </Box>
                <Typography variant="subtitle2" fontWeight="800" sx={{ color: '#0f172a', mb: 0.5 }}>
                  Cut-to-Size Service
                </Typography>
                <Typography variant="caption" sx={{ color: '#64748b' }}>
                  Custom length plasma & saw cutting directly at depot
                </Typography>
              </Paper>
            </Grid>

            <Grid item xs={6}>
              <Paper
                elevation={0}
                sx={{
                  p: 2.5,
                  bgcolor: '#ffffff',
                  border: '1px solid #e2e8f0',
                  borderRadius: '16px',
                  boxShadow: '0 4px 12px rgba(0,0,0,0.02)',
                  transition: 'all 0.2s ease',
                  '&:hover': { transform: 'translateY(-2px)', borderColor: '#86efac' },
                }}
              >
                <Box
                  sx={{
                    width: 44,
                    height: 44,
                    borderRadius: '12px',
                    bgcolor: '#f0fdf4',
                    color: '#16a34a',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    mb: 1.5,
                    fontSize: '20px',
                  }}
                >
                  <i className="fi fi-rr-truck-side"></i>
                </Box>
                <Typography variant="subtitle2" fontWeight="800" sx={{ color: '#0f172a', mb: 0.5 }}>
                  Depot Direct Logistics
                </Typography>
                <Typography variant="caption" sx={{ color: '#64748b' }}>
                  Direct boom truck freight dispatch across Luzon
                </Typography>
              </Paper>
            </Grid>

            <Grid item xs={12}>
              <Paper
                elevation={0}
                sx={{
                  p: 2.5,
                  bgcolor: '#ffffff',
                  border: '1px solid #e2e8f0',
                  borderRadius: '16px',
                  boxShadow: '0 4px 12px rgba(0,0,0,0.02)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 2,
                }}
              >
                <Box
                  sx={{
                    width: 48,
                    height: 48,
                    borderRadius: '12px',
                    bgcolor: '#fef3c7',
                    color: '#d97706',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                    fontSize: '22px',
                  }}
                >
                  <i className="fi fi-sr-shield-check"></i>
                </Box>
                <Box>
                  <Typography variant="subtitle2" fontWeight="800" sx={{ color: '#0f172a' }}>
                    100% Guaranteed Mill Traceability
                  </Typography>
                  <Typography variant="caption" sx={{ color: '#64748b' }}>
                    All structural batches supplied with official Mill Test Certificates (MTC)
                  </Typography>
                </Box>
              </Paper>
            </Grid>
          </Grid>
        </Grid>
      </Grid>
    </Box>
  );
};

export default HeroSectionV2;
