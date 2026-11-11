import React from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  Chip,
  Grid,
} from '@mui/material';
import { AVAILABLE_3D_ROOF_MODELS } from '../services/roofModelRegistry';

const Home3DModelsShowcase = ({ product, onCustomizeIn3D }) => {
  return (
    <Box sx={{ mb: 6 }}>
      <Box
        sx={{
          display: 'flex',
          flexDirection: { xs: 'column', sm: 'row' },
          justifyContent: 'space-between',
          alignItems: { xs: 'flex-start', sm: 'flex-end' },
          gap: 1.5,
          mb: 3,
        }}
      >
        <Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
            <Chip
              label="Interactive 3D Visualizer"
              size="small"
              sx={{
                bgcolor: 'primary.main',
                color: '#ffffff',
                fontWeight: 800,
                fontSize: '0.7rem',
                borderRadius: 1.5,
                height: 22,
                '& .MuiChip-label': { px: 1 },
              }}
            />
          </Box>
          <Typography
            variant="h5"
            component="h2"
            sx={{
              fontWeight: 800,
              letterSpacing: '-0.02em',
              color: 'text.primary',
            }}
          >
            Available 3D Roof House Models
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Select a house design to explore in 360°, inspect roof trusses and purlins, and customize colors.
          </Typography>
        </Box>
      </Box>

      <Grid container spacing={{ xs: 2, sm: 2.5, md: 3 }}>
        {AVAILABLE_3D_ROOF_MODELS.map((model, index) => {
          const handleCustomizeIn3D = () => {
            if (onCustomizeIn3D) {
              onCustomizeIn3D(model);
            }
          };

          return (
            <Grid item xs={12} sm={6} lg={3} key={model.id}>
              <Card
                elevation={0}
                sx={{
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  borderRadius: 3.5,
                  bgcolor: 'background.paper',
                  border: '1px solid',
                  borderColor: 'divider',
                  overflow: 'hidden',
                  transition: 'all 0.25s cubic-bezier(0.4,0,0.2,1)',
                  '&:hover': {
                    transform: 'translateY(-4px)',
                    boxShadow: '0 16px 32px rgba(0,0,0,0.08)',
                    borderColor: 'primary.main',
                  },
                }}
              >
                {/* 3D Model Header Banner */}
                <Box
                  sx={{
                    position: 'relative',
                    height: 140,
                    bgcolor: (theme) =>
                      theme.palette.mode === 'dark' ? 'rgba(30, 41, 59, 0.7)' : 'rgba(241, 245, 249, 0.9)',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    p: 2,
                    background: (theme) =>
                      theme.palette.mode === 'dark'
                        ? 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)'
                        : 'linear-gradient(135deg, #ecfdf5 0%, #f0fdf4 50%, #e2e8f0 100%)',
                    borderBottom: '1px solid',
                    borderColor: 'divider',
                  }}
                >
                  <Chip
                    label="3D Model"
                    size="small"
                    sx={{
                      position: 'absolute',
                      top: 10,
                      left: 10,
                      fontWeight: 800,
                      fontSize: '0.65rem',
                      height: 20,
                      bgcolor: 'rgba(15, 23, 42, 0.85)',
                      color: '#ffffff',
                      backdropFilter: 'blur(4px)',
                    }}
                  />

                  <Chip
                    label={`Option ${index + 1}`}
                    size="small"
                    sx={{
                      position: 'absolute',
                      top: 10,
                      right: 10,
                      fontWeight: 800,
                      fontSize: '0.65rem',
                      height: 20,
                      bgcolor: 'primary.main',
                      color: '#ffffff',
                    }}
                  />

                  {/* House Visual Silhouette Icon */}
                  <Box
                    sx={{
                      width: 56,
                      height: 56,
                      borderRadius: '50%',
                      bgcolor: 'background.paper',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      boxShadow: '0 4px 14px rgba(0,0,0,0.08)',
                      mb: 1,
                    }}
                  >
                    <i
                      className="fi fi-rr-home-location-alt"
                      style={{ fontSize: '26px', color: '#16a34a' }}
                    ></i>
                  </Box>

                  <Typography
                    variant="caption"
                    sx={{
                      fontWeight: 700,
                      color: 'text.secondary',
                      letterSpacing: '0.04em',
                      textTransform: 'uppercase',
                      fontSize: '0.65rem',
                    }}
                  >
                    {model.shortLabel}
                  </Typography>
                </Box>

                {/* Card Content & Specifications */}
                <CardContent
                  sx={{
                    p: 2,
                    flex: 1,
                    display: 'flex',
                    flexDirection: 'column',
                    '&:last-child': { pb: 2 },
                  }}
                >
                  {/* Product Name Badge */}
                  <Box sx={{ mb: 1.2 }}>
                    <Chip
                      label={`Product: ${product?.name || model.profileName || 'Pico Rib 1220'}`}
                      size="small"
                      sx={{
                        bgcolor: (theme) =>
                          theme.palette.mode === 'dark' ? 'rgba(74, 222, 128, 0.15)' : 'rgba(79, 119, 45, 0.1)',
                        color: 'primary.main',
                        fontWeight: 800,
                        fontSize: '0.72rem',
                        height: 24,
                        border: '1px solid',
                        borderColor: (theme) =>
                          theme.palette.mode === 'dark' ? 'rgba(74, 222, 128, 0.3)' : 'rgba(79, 119, 45, 0.25)',
                        borderRadius: 1.5,
                        '& .MuiChip-label': { px: 1 },
                      }}
                    />
                  </Box>

                  <Typography
                    variant="subtitle1"
                    component="h3"
                    sx={{
                      fontWeight: 800,
                      fontSize: '0.95rem',
                      lineHeight: 1.25,
                      color: 'text.primary',
                      mb: 1.5,
                      minHeight: 40,
                    }}
                  >
                    {model.name}
                  </Typography>

                  {/* Specifications Grid */}
                  <Box
                    sx={{
                      display: 'grid',
                      gridTemplateColumns: 'repeat(2, 1fr)',
                      gap: 1,
                      mb: 2,
                      p: 1.25,
                      borderRadius: 2,
                      bgcolor: (theme) =>
                        theme.palette.mode === 'dark' ? 'rgba(15, 23, 42, 0.4)' : 'rgba(248, 250, 252, 0.9)',
                      border: '1px solid',
                      borderColor: 'divider',
                    }}
                  >
                    <Box>
                      <Typography
                        variant="caption"
                        sx={{
                          display: 'block',
                          color: 'text.secondary',
                          fontSize: '0.65rem',
                          fontWeight: 600,
                        }}
                      >
                        Floor Footprint
                      </Typography>
                      <Typography
                        variant="body2"
                        sx={{
                          fontWeight: 700,
                          fontSize: '0.75rem',
                          color: 'text.primary',
                        }}
                      >
                        {model.floorArea.split('(')[0].trim()}
                      </Typography>
                    </Box>

                    <Box>
                      <Typography
                        variant="caption"
                        sx={{
                          display: 'block',
                          color: 'text.secondary',
                          fontSize: '0.65rem',
                          fontWeight: 600,
                        }}
                      >
                        Roof Dimensions
                      </Typography>
                      <Typography
                        variant="body2"
                        sx={{
                          fontWeight: 700,
                          fontSize: '0.75rem',
                          color: 'text.primary',
                        }}
                      >
                        {model.roofDimensions.split('(')[0].trim()}
                      </Typography>
                    </Box>

                    <Box>
                      <Typography
                        variant="caption"
                        sx={{
                          display: 'block',
                          color: 'text.secondary',
                          fontSize: '0.65rem',
                          fontWeight: 600,
                        }}
                      >
                        Sheets Required
                      </Typography>
                      <Typography
                        variant="body2"
                        sx={{
                          fontWeight: 800,
                          fontSize: '0.8rem',
                          color: 'primary.main',
                        }}
                      >
                        {model.totalSheets} sheets
                      </Typography>
                    </Box>

                    <Box>
                      <Typography
                        variant="caption"
                        sx={{
                          display: 'block',
                          color: 'text.secondary',
                          fontSize: '0.65rem',
                          fontWeight: 600,
                        }}
                      >
                        Cut Length
                      </Typography>
                      <Typography
                        variant="body2"
                        sx={{
                          fontWeight: 800,
                          fontSize: '0.8rem',
                          color: 'text.primary',
                        }}
                      >
                        {model.recommendedLength}m
                      </Typography>
                    </Box>
                  </Box>

                  {/* Action Buttons */}
                  <Box
                    sx={{
                      mt: 'auto',
                      pt: 1,
                    }}
                  >
                    <Button
                      variant="contained"
                      color="primary"
                      fullWidth
                      onClick={handleCustomizeIn3D}
                      sx={{
                        borderRadius: 2,
                        py: 0.9,
                        fontWeight: 800,
                        fontSize: '0.82rem',
                        textTransform: 'none',
                        boxShadow: '0 4px 12px rgba(79,119,45,0.25)',
                        '&:hover': {
                          transform: 'translateY(-1px)',
                          boxShadow: '0 6px 16px rgba(79,119,45,0.35)',
                        },
                      }}
                    >
                      Customize in 3D
                    </Button>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          );
        })}
      </Grid>
    </Box>
  );
};

export default Home3DModelsShowcase;
