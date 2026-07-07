import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  AppBar,
  Toolbar,
  Typography,
  Box,
  Button,
  IconButton,
  Avatar,
  Tooltip,
} from '@mui/material';
import Inventory2Icon from '@mui/icons-material/Inventory2';
import LogoutIcon from '@mui/icons-material/Logout';
import HomeIcon from '@mui/icons-material/Home';
import ShoppingBagIcon from '@mui/icons-material/ShoppingBag';
import LogoutConfirmModal from './LogoutConfirmModal';
import ThemeSwitcher from './ThemeSwitcher';

const CustomerHeader = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const getNavStyle = (isActive) => ({
    bgcolor: isActive ? 'primary.main' : 'transparent',
    color: isActive ? '#fff' : 'text.secondary',
    fontWeight: isActive ? 700 : 500,
    px: 2,
    py: 0.75,
    borderRadius: 2,
    fontSize: '0.875rem',
    '&:hover': {
      bgcolor: isActive ? 'primary.dark' : 'rgba(79,119,45,0.06)',
      color: isActive ? '#fff' : 'primary.main',
    },
  });

  const [isLogoutOpen, setIsLogoutOpen] = useState(false);

  const handleLogout = () => {
    setIsLogoutOpen(true);
  };

  return (
    <>
      <AppBar
      position="sticky"
      elevation={0}
      sx={{
        backgroundColor: 'background.paper',
        borderBottom: '1px solid',
        borderColor: 'divider',
        backdropFilter: 'blur(8px)',
      }}
    >
      <Toolbar sx={{ justifyContent: 'space-between', minHeight: 70, px: { xs: 2, md: 4 } }}>

        {/* Logo */}
        <Box
          component={Link}
          to="/dashboard"
          sx={{ textDecoration: 'none', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}
        >
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              fontFamily: 'Arial, sans-serif',
              fontWeight: 900,
              fontSize: { xs: 20, md: 26 },
              letterSpacing: '0.05em',
              lineHeight: 1,
            }}
          >
            <Typography
              component="span"
              sx={{ color: 'primary.main', WebkitTextStroke: '1px #31572c' }}
            >
              MEGA
            </Typography>
            <Typography
              component="span"
              sx={{ color: 'secondary.main', WebkitTextStroke: '1px #4f772d' }}
            >
              PACIFIC
            </Typography>
          </Box>
          <Typography
            sx={{
              color: 'success.main',
              fontSize: { xs: '7px', md: '9px' },
              fontWeight: 800,
              letterSpacing: '0.2em',
              mt: 0.4,
              fontFamily: 'Arial, sans-serif',
              color: 'text.secondary',
            }}
          >
            METAL AND STEEL CORP
          </Typography>
        </Box>

        {/* Center Navigation — Cart button removed (replaced by floating FAB) */}
        <Box sx={{ display: { xs: 'none', md: 'flex' }, gap: 0.5, position: 'absolute', left: '50%', transform: 'translateX(-50%)' }}>
          <Button
            component={Link}
            to="/dashboard"
            // startIcon={<HomeIcon />}
            sx={getNavStyle(location.pathname === '/dashboard')}
          >
            Home
          </Button>
          <Button
            component={Link}
            to="/products"
            
            sx={getNavStyle(location.pathname.startsWith('/product'))}
          >
            Products
          </Button>
          <Button
            component={Link}
            to="/orders"
            
            sx={getNavStyle(location.pathname.startsWith('/order'))}
          >
            Orders
          </Button>
        </Box>

        {/* Right Section — Profile + Logout */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: { xs: 1, md: 1.5 } }}>
          <ThemeSwitcher size="small" />
          {user && (
            <Box
              component={Link}
              to="/profile"
              sx={{
                textDecoration: 'none',
                display: 'flex',
                alignItems: 'center',
                gap: 1,
                px: { xs: 1.5, sm: 2 },
                py: 0.75,
                borderRadius: 5,
                border: '1px solid',
                borderColor: 'divider',
                transition: 'all 0.2s ease',
                '&:hover': { bgcolor: 'rgba(79,119,45,0.06)', borderColor: 'primary.main' },
              }}
            >
              <Avatar sx={{ width: 26, height: 26, bgcolor: 'primary.main', fontSize: 12, fontWeight: 700 }}>
                {user.name?.charAt(0)}
              </Avatar>
              <Typography
                variant="body2"
                sx={{ color: 'text.primary', fontWeight: 600, display: { xs: 'none', sm: 'block' } }}
              >
                Hello, {user.name?.split(' ')[0]}
              </Typography>
            </Box>
          )}

          <Tooltip title="Logout">
            <IconButton
              onClick={handleLogout}
              size="small"
              sx={{
                color: 'error.main',
                border: '1px solid',
                borderColor: 'error.light',
                borderRadius: 2,
                '&:hover': { bgcolor: 'error.light', color: 'error.dark' },
              }}
            >
              <LogoutIcon fontSize="small" />
            </IconButton>
          </Tooltip>
        </Box>
      </Toolbar>
    </AppBar>
      {isLogoutOpen && (
        <LogoutConfirmModal
          onClose={() => setIsLogoutOpen(false)}
          onConfirm={() => {
            setIsLogoutOpen(false);
            logout();
            navigate('/login');
          }}
        />
      )}
    </>
  );
};

export default CustomerHeader;
