import React, { useMemo } from 'react';
import { Box, Typography, Button, Chip, Stack } from '@mui/material';
import {
  STUDIO_HOUSE_ARCHITECTURES,
  getAvailableStudioRoofs,
} from '../services/roofModelRegistry';

const CUSTOMIZATION_STEPS = [
  {
    step: '01',
    title: 'Choose a House Design',
    description: 'Pick from 6 residential layouts matching single-storey and 2-storey homes.',
  },
  {
    step: '02',
    title: 'Compare Roof Profiles & Colors',
    description: 'Switch roof profiles, test in-stock colors, and adjust steel thickness live.',
  },
  {
    step: '03',
    title: 'Inspect & Order Directly',
    description: 'Rotate in 360°, check internal trusses, and carry your setup straight to the product page.',
  },
];

// Dedicated Home page spotlight section that launches the full-screen 3D Customization portal
const Home3DCustomizationBanner = ({ availableProducts = [], onOpen3DCustomization }) => {
  const activeRoofs = useMemo(
    () => getAvailableStudioRoofs(availableProducts),
    [availableProducts]
  );

  const houseCount = STUDIO_HOUSE_ARCHITECTURES.length;
  const roofSummaryLabel =
    activeRoofs.length > 0
      ? `${activeRoofs.length} Active Roof ${activeRoofs.length === 1 ? 'Profile' : 'Profiles'}`
      : 'Multiple Roof Profiles';

  return (
    <Box
      component="section"
      aria-label="3D Customization Portal"
      sx={{
        mb: { xs: 5, md: 6 },
        borderRadius: { xs: 3, md: 4 },
        overflow: 'hidden',
        bgcolor: 'background.paper',
        border: '1px solid',
        borderColor: 'rgba(30, 58, 138, 0.2)',
        boxShadow: '0 10px 30px rgba(15, 23, 42, 0.06)',
        position: 'relative',
        background: 'linear-gradient(135deg, #ffffff 0%, #f8fafc 58%, #eff6ff 100%)',
      }}
    >
      {/* Subtle top brand accent bar */}
      <Box
        sx={{
          height: 4,
          width: '100%',
          background: 'linear-gradient(90deg, #1e3a8a 0%, #2563eb 60%, #172554 100%)',
        }}
      />

      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: { xs: '1fr', lg: 'minmax(0, 1.25fr) minmax(0, 1fr)' },
          gap: { xs: 3, lg: 4 },
          p: { xs: 2.5, sm: 3.5, md: 4.5 },
          alignItems: 'center',
        }}
      >
        {/* Left column: Value proposition, active roof highlights, and primary launch button */}
        <Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1.25, flexWrap: 'wrap' }}>
            <Chip
              label="Full-Screen 3D Workspace"
              size="small"
              sx={{
                bgcolor: 'rgba(30, 58, 138, 0.1)',
                color: '#1e3a8a',
                border: '1px solid rgba(30, 58, 138, 0.22)',
                fontWeight: 800,
                fontSize: '0.72rem',
                borderRadius: 1.5,
                height: 24,
              }}
            />
            <Typography
              variant="caption"
              sx={{
                color: 'text.secondary',
                fontWeight: 700,
                letterSpacing: '0.02em',
              }}
            >
              {houseCount} House Designs • {roofSummaryLabel}
            </Typography>
          </Box>

          <Typography
            variant="h4"
            component="h2"
            sx={{
              fontWeight: 900,
              color: 'text.primary',
              fontSize: { xs: '1.5rem', sm: '1.85rem', md: '2.1rem' },
              letterSpacing: '-0.025em',
              lineHeight: 1.18,
              mb: 1.25,
            }}
          >
            3D Customization
          </Typography>

          <Typography
            variant="body1"
            sx={{
              color: 'text.secondary',
              fontSize: { xs: '0.92rem', md: '1rem' },
              lineHeight: 1.65,
              maxWidth: 560,
              mb: 2.25,
            }}
          >
            Preview how our metal roofing profiles look on a real house before placing your order. Switch house models, compare roof styles, test available colors and thicknesses, and inspect the roof framing in 360°.
          </Typography>

          {/* Show active catalog roof profiles available inside 3D Customization */}
          {activeRoofs.length > 0 && (
            <Box sx={{ mb: 2.75 }}>
              <Typography
                variant="caption"
                sx={{
                  display: 'block',
                  color: 'text.secondary',
                  fontWeight: 700,
                  textTransform: 'uppercase',
                  letterSpacing: '0.06em',
                  mb: 1,
                }}
              >
                Available Roof Profiles to Compare
              </Typography>
              <Stack direction="row" sx={{ flexWrap: 'wrap', gap: 0.75 }}>
                {activeRoofs.map((roof) => (
                  <Chip
                    key={roof.id}
                    label={roof.name}
                    size="small"
                    sx={{
                      bgcolor: '#ffffff',
                      color: '#0f172a',
                      border: '1px solid #cbd5e1',
                      fontWeight: 700,
                      fontSize: '0.74rem',
                      height: 26,
                      borderRadius: 1.5,
                    }}
                  />
                ))}
              </Stack>
            </Box>
          )}

          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, flexWrap: 'wrap' }}>
            <Button
              variant="contained"
              color="primary"
              size="large"
              onClick={onOpen3DCustomization}
              sx={{
                borderRadius: 2.5,
                px: { xs: 3, sm: 3.75 },
                py: 1.25,
                fontWeight: 800,
                fontSize: '0.94rem',
                textTransform: 'none',
                boxShadow: '0 8px 20px rgba(30, 58, 138, 0.28)',
                '&:hover': {
                  transform: 'translateY(-1px)',
                  boxShadow: '0 10px 24px rgba(23, 37, 84, 0.36)',
                },
              }}
            >
              Open 3D Customization
            </Button>

            <Typography
              variant="caption"
              sx={{
                color: 'text.secondary',
                fontWeight: 600,
                maxWidth: 260,
                lineHeight: 1.4,
              }}
            >
              Interactive 3D view with real-time coil color availability.
            </Typography>
          </Box>
        </Box>

        {/* Right column: Architectural preview guide card mirroring the dark 3D workspace */}
        <Box
          sx={{
            borderRadius: 3,
            p: { xs: 2.25, sm: 2.75 },
            background: 'linear-gradient(145deg, #0f172a 0%, #172554 62%, #1e3a8a 100%)',
            color: '#f8fafc',
            border: '1px solid rgba(148, 163, 184, 0.2)',
            boxShadow: '0 16px 32px rgba(15, 23, 42, 0.18)',
          }}
        >
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: 1,
              pb: 1.75,
              mb: 2,
              borderBottom: '1px solid rgba(255, 255, 255, 0.12)',
            }}
          >
            <Box>
              <Typography
                variant="caption"
                sx={{
                  color: '#93c5fd',
                  fontWeight: 800,
                  textTransform: 'uppercase',
                  letterSpacing: '0.08em',
                  display: 'block',
                }}
              >
                How It Works
              </Typography>
              <Typography variant="subtitle1" sx={{ fontWeight: 800, color: '#ffffff' }}>
                Customize Your Roof in 3 Simple Steps
              </Typography>
            </Box>
            <Chip
              label="360° View"
              size="small"
              sx={{
                bgcolor: 'rgba(147, 197, 253, 0.16)',
                color: '#dbeafe',
                border: '1px solid rgba(147, 197, 253, 0.35)',
                fontWeight: 800,
                fontSize: '0.7rem',
                height: 24,
              }}
            />
          </Box>

          <Stack spacing={1.5}>
            {CUSTOMIZATION_STEPS.map((item) => (
              <Box
                key={item.step}
                sx={{
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: 1.5,
                  p: 1.35,
                  borderRadius: 2,
                  bgcolor: 'rgba(255, 255, 255, 0.06)',
                  border: '1px solid rgba(255, 255, 255, 0.08)',
                }}
              >
                <Box
                  sx={{
                    width: 28,
                    height: 28,
                    borderRadius: 1.5,
                    bgcolor: 'rgba(59, 130, 246, 0.25)',
                    border: '1px solid rgba(147, 197, 253, 0.4)',
                    color: '#bfdbfe',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '0.74rem',
                    fontWeight: 800,
                    flexShrink: 0,
                    mt: 0.15,
                  }}
                >
                  {item.step}
                </Box>
                <Box sx={{ minWidth: 0 }}>
                  <Typography variant="body2" sx={{ fontWeight: 800, color: '#ffffff', lineHeight: 1.3 }}>
                    {item.title}
                  </Typography>
                  <Typography variant="caption" sx={{ color: '#cbd5e1', display: 'block', mt: 0.25, lineHeight: 1.45 }}>
                    {item.description}
                  </Typography>
                </Box>
              </Box>
            ))}
          </Stack>
        </Box>
      </Box>
    </Box>
  );
};

export default Home3DCustomizationBanner;
