import React from 'react';
import { Box, Chip, Typography } from '@mui/material';

// Compact context strip shown on the Product Page when a customer arrived from 3D Customization
const Product3DOriginBanner = ({ houseShortLabel = '' }) => {
  return (
    <Box
      role="status"
      aria-label="3D Customization session context"
      sx={{
        mb: { xs: 2.5, md: 3 },
        px: { xs: 1.75, sm: 2.25 },
        py: 1.35,
        borderRadius: 2.5,
        display: 'flex',
        flexDirection: { xs: 'column', sm: 'row' },
        alignItems: { xs: 'flex-start', sm: 'center' },
        justifyContent: 'space-between',
        gap: 1,
        bgcolor: (theme) =>
          theme.palette.mode === 'dark' ? 'rgba(30, 58, 138, 0.22)' : 'rgba(30, 58, 138, 0.06)',
        border: '1px solid',
        borderColor: (theme) =>
          theme.palette.mode === 'dark' ? 'rgba(96, 165, 250, 0.35)' : 'rgba(30, 58, 138, 0.2)',
      }}
    >
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.25, flexWrap: 'wrap' }}>
        <Chip
          label="From 3D Customization"
          size="small"
          sx={{
            bgcolor: 'primary.main',
            color: '#ffffff',
            fontWeight: 800,
            fontSize: '0.72rem',
            height: 24,
            borderRadius: 1.5,
            '& .MuiChip-label': { px: 1.1 },
          }}
        />
        {houseShortLabel && (
          <Typography
            variant="body2"
            sx={{
              fontWeight: 800,
              color: 'text.primary',
              fontSize: '0.84rem',
            }}
          >
            House Model: {houseShortLabel}
          </Typography>
        )}
      </Box>

      <Typography
        variant="caption"
        sx={{
          color: 'text.secondary',
          fontWeight: 600,
          lineHeight: 1.45,
        }}
      >
        Changes to thickness, color, or sheet quantity will sync when you return to 3D Customization.
      </Typography>
    </Box>
  );
};

export default Product3DOriginBanner;
