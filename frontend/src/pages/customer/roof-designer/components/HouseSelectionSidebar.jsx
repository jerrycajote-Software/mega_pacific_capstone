import React from 'react';
import { Box, Typography, Card, CardActionArea, CardContent, Chip } from '@mui/material';

const HouseSelectionSidebar = ({ houseLoaded, loadHouse }) => {
  return (
    <Box
      sx={{
        width: 250,
        flexShrink: 0,
        bgcolor: '#ffffff',
        borderRight: '1px solid',
        borderColor: 'divider',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      <Box sx={{ p: 2, borderBottom: '1px solid', borderColor: 'divider', bgcolor: '#f8fafc' }}>
        <Typography variant="subtitle2" fontWeight={800} color="text.primary">
          House Model
        </Typography>
        <Typography variant="caption" color="text.secondary">
          Select a base structure
        </Typography>
      </Box>

      <Box sx={{ p: 2, overflowY: 'auto', flex: 1 }}>
        <Card 
          elevation={0}
          sx={{ 
            border: '2px solid',
            borderColor: houseLoaded ? '#4f772d' : 'divider',
            bgcolor: houseLoaded ? '#f8fdf5' : 'transparent',
            transition: 'all 0.2s',
          }}
        >
          <CardActionArea onClick={loadHouse} disabled={houseLoaded}>
            <Box 
              sx={{ 
                height: 120, 
                bgcolor: '#e2e8f0', 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center',
                color: '#94a3b8'
              }}
            >
              <i className="fi fi-rr-home" style={{ fontSize: '32px' }}></i>
            </Box>
            <CardContent sx={{ p: 1.5 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 0.5 }}>
                <Typography variant="body2" fontWeight={700}>
                  Standard 88sqm
                </Typography>
                {houseLoaded && (
                  <Chip label="Loaded" size="small" sx={{ height: 18, fontSize: '0.6rem', bgcolor: '#dcfce7', color: '#16a34a', fontWeight: 800 }} />
                )}
              </Box>
              <Typography variant="caption" color="text.secondary" display="block" sx={{ lineHeight: 1.2 }}>
                Basic 2-story foundation with standard roof pitch.
              </Typography>
            </CardContent>
          </CardActionArea>
        </Card>
      </Box>
    </Box>
  );
};

export default HouseSelectionSidebar;
