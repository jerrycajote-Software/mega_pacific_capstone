import React from 'react';
import { Box, Typography } from '@mui/material';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  CustomCustomerHomeIcon,
  CustomCustomerCatalogIcon,
  CustomCustomerProfileIcon,
} from './icons';

const NAV_ITEMS = [
  { path: '/dashboard', label: 'Home', icon: CustomCustomerHomeIcon },
  { path: '/products', label: 'Catalog', icon: CustomCustomerCatalogIcon },
  { path: '/profile', label: 'Profile', icon: CustomCustomerProfileIcon },
];

const CustomerBottomNav = () => {
  const navigate = useNavigate();
  const location = useLocation();

  return (
    <Box
      component="nav"
      aria-label="Mobile Bottom Navigation"
      sx={{
        display: { xs: 'flex', md: 'none' },
        position: 'fixed',
        bottom: 0,
        left: 0,
        right: 0,
        zIndex: 1150,
        bgcolor: 'background.paper',
        borderTop: '1px solid',
        borderColor: 'divider',
        boxShadow: '0 -4px 16px rgba(0, 0, 0, 0.08)',
        py: 0.75,
        px: 1,
        pb: 'max(8px, env(safe-area-inset-bottom))',
        justifyContent: 'space-around',
        alignItems: 'center',
        backdropFilter: 'blur(12px)',
      }}
    >
      {NAV_ITEMS.map((item) => {
        const isActive = (
          item.path === '/dashboard'
            ? location.pathname === '/dashboard' || location.pathname === '/'
            : location.pathname.startsWith(item.path)
        );
        const IconComponent = item.icon;

        return (
          <Box
            key={item.label}
            onClick={() => navigate(item.path)}
            sx={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              minWidth: 56,
              py: 0.5,
              px: 1,
              borderRadius: 2,
              cursor: 'pointer',
              userSelect: 'none',
              transition: 'all 0.18s ease',
              color: isActive ? 'primary.main' : 'text.secondary',
              '&:active': {
                transform: 'scale(0.92)',
              },
            }}
          >
            <Box sx={{ position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center', mb: 0.25 }}>
              <IconComponent size={22} isActive={isActive} />
            </Box>

            <Typography
              variant="caption"
              sx={{
                fontSize: '0.68rem',
                fontWeight: isActive ? 800 : 500,
                lineHeight: 1,
                letterSpacing: '0.01em',
              }}
            >
              {item.label}
            </Typography>
          </Box>
        );
      })}
    </Box>
  );
};

export default CustomerBottomNav;
