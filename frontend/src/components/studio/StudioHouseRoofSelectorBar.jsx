import React from 'react';
import { Box, Typography, Button, Chip, Tooltip, Stack } from '@mui/material';

// Top studio control bar allowing customers to switch between the 6 house models and available roof types
const StudioHouseRoofSelectorBar = ({
  houseArchitectures = [],
  selectedHouseId,
  onSelectHouseModel,
  availableRoofs = [],
  selectedRoofId,
  onSelectRoofType,
  activeModel,
  currentThickness,
  onExitStudio,
}) => {
  return (
    <Box
      sx={{
        px: { xs: 2, md: 3 },
        py: 1.5,
        borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
        bgcolor: 'rgba(15, 23, 42, 0.96)',
        display: 'flex',
        flexDirection: 'column',
        gap: 1.25,
        zIndex: 10,
      }}
    >
      {/* Title Row & Exit Studio Button */}
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 1.5,
          flexWrap: 'wrap',
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.25, flexWrap: 'wrap' }}>
          <Typography variant="subtitle1" fontWeight={800} sx={{ color: '#f8fafc' }}>
            3D Customization
          </Typography>
          {activeModel && (
            <Chip
              label={`${activeModel.name} • ${activeModel.profileName} • ${activeModel.recommendedLength}m Cut • ${currentThickness}`}
              size="small"
              sx={{
                bgcolor: 'rgba(79, 119, 45, 0.28)',
                color: '#86efac',
                border: '1px solid rgba(74, 222, 128, 0.35)',
                fontWeight: 700,
                fontSize: '0.72rem',
              }}
            />
          )}
        </Box>

        <Button
          size="small"
          variant="outlined"
          onClick={onExitStudio}
          sx={{
            color: '#fca5a5',
            borderColor: 'rgba(248, 113, 113, 0.45)',
            bgcolor: 'rgba(127, 29, 29, 0.25)',
            borderRadius: 1.8,
            px: 1.75,
            py: 0.45,
            fontSize: '0.76rem',
            fontWeight: 800,
            textTransform: 'none',
            '&:hover': {
              color: '#ffffff',
              borderColor: '#ef4444',
              bgcolor: 'rgba(220, 38, 38, 0.45)',
            },
          }}
        >
          Exit 3D Customization
        </Button>
      </Box>

      {/* House Model & Available Roof Type Selectors */}
      <Box
        sx={{
          display: 'flex',
          flexDirection: { xs: 'column', lg: 'row' },
          alignItems: { xs: 'flex-start', lg: 'center' },
          justifyContent: 'space-between',
          gap: 1.25,
        }}
      >
        {/* 6 Residential House Models */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}>
          <Typography
            variant="caption"
            sx={{ color: '#94a3b8', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.04em', mr: 0.5 }}
          >
            House Model:
          </Typography>
          <Stack direction="row" spacing={0.6} sx={{ flexWrap: 'wrap', gap: 0.6 }}>
            {houseArchitectures.map((house) => {
              const isSelected = house.id === selectedHouseId;
              return (
                <Tooltip
                  key={house.id}
                  title={`${house.name} • ${house.floorArea} • ${house.roofLabel}`}
                  arrow
                >
                  <Button
                    size="small"
                    onClick={() => onSelectHouseModel(house.id)}
                    sx={{
                      py: 0.35,
                      px: 1.2,
                      minWidth: 0,
                      fontSize: '0.72rem',
                      fontWeight: 700,
                      borderRadius: 1.5,
                      textTransform: 'none',
                      color: isSelected ? '#ffffff' : '#cbd5e1',
                      bgcolor: isSelected ? 'rgba(56, 189, 248, 0.26)' : 'rgba(30, 41, 59, 0.8)',
                      border: '1px solid',
                      borderColor: isSelected ? '#38bdf8' : 'rgba(255, 255, 255, 0.12)',
                      '&:hover': {
                        bgcolor: isSelected ? 'rgba(56, 189, 248, 0.36)' : 'rgba(51, 65, 85, 0.9)',
                      },
                    }}
                  >
                    {house.shortLabel}
                  </Button>
                </Tooltip>
              );
            })}
          </Stack>
        </Box>

        {/* Active Catalog Roof Types (strictly filtered to existing Pre-Order products) */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}>
          <Typography
            variant="caption"
            sx={{ color: '#94a3b8', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.04em', mr: 0.5 }}
          >
            Roof Type:
          </Typography>
          <Stack direction="row" spacing={0.75} sx={{ flexWrap: 'wrap', gap: 0.6 }}>
            {availableRoofs.map((roof) => {
              const isSelected = roof.id === selectedRoofId;
              return (
                <Tooltip
                  key={roof.id}
                  title={`${roof.name} — ${roof.profileTagline} (Linked to ${roof.product?.name || roof.name})`}
                  arrow
                >
                  <Button
                    size="small"
                    onClick={() => onSelectRoofType(roof.id)}
                    sx={{
                      py: 0.4,
                      px: 1.4,
                      minWidth: 0,
                      fontSize: '0.75rem',
                      fontWeight: 800,
                      borderRadius: 1.5,
                      textTransform: 'none',
                      color: isSelected ? '#ffffff' : '#e2e8f0',
                      bgcolor: isSelected ? 'primary.main' : 'rgba(30, 41, 59, 0.85)',
                      border: '1px solid',
                      borderColor: isSelected ? '#4ade80' : 'rgba(255, 255, 255, 0.16)',
                      boxShadow: isSelected ? '0 0 12px rgba(74, 222, 128, 0.25)' : 'none',
                      '&:hover': {
                        bgcolor: isSelected ? 'primary.dark' : 'rgba(51, 65, 85, 0.95)',
                      },
                    }}
                  >
                    {roof.name}
                  </Button>
                </Tooltip>
              );
            })}
          </Stack>
        </Box>
      </Box>
    </Box>
  );
};

export default StudioHouseRoofSelectorBar;
