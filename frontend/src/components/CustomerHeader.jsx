import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useCustomerUi } from '../context/CustomerUiContext';
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
import LogoutConfirmModal from './LogoutConfirmModal';

const NAV_LINKS = [
  { to: '/dashboard', label: 'Home' },
  { to: '/orders', label: 'Orders' },
  { to: '/profile', label: 'Profile' },
];

const CustomerHeader = () => {
  const { user, logout } = useAuth();
  const { uiVersion, toggleUiVersion } = useCustomerUi();
  const navigate = useNavigate();
  const location = useLocation();
  const [isLogoutOpen, setIsLogoutOpen] = useState(false);

  const handleLogout = () => setIsLogoutOpen(true);

  return (
    <>
      <AppBar
        position="sticky"
        elevation={0}
        sx={{
          bgcolor: 'background.paper',
          borderBottom: '1px solid',
          borderColor: 'divider',
          color: 'text.primary',
        }}
      >
        <Toolbar sx={{ gap: 2 }}>
          {/* Brand */}
          <Box
            component={Link}
            to="/dashboard"
            sx={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'flex-start',
              textDecoration: 'none',
              mr: 3,
            }}
          >
            <Box
              sx={{
                display: 'flex',
                fontFamily: 'Arial, sans-serif',
                fontWeight: 900,
                fontSize: 22,
                letterSpacing: '0.05em',
                lineHeight: 1,
              }}
            >
              <Typography component="span" sx={{ color: 'primary.main' }}>MEGA</Typography>
              <Typography component="span" sx={{ color: 'secondary.main' }}>PACIFIC</Typography>
            </Box>
            <Typography
              sx={{
                color: 'success.main',
                fontSize: '8px',
                fontWeight: 800,
                letterSpacing: '0.2em',
                fontFamily: 'Arial, sans-serif',
              }}
            >
              METAL AND STEEL CORP
            </Typography>
          </Box>

          {/* Nav Links */}
          <Box sx={{ display: { xs: 'none', md: 'flex' }, gap: 0.5, flexGrow: 1 }}>
            {NAV_LINKS.map((link) => {
              const isActive = location.pathname === link.to;
              return (
                <Button
                  key={link.to}
                  component={Link}
                  to={link.to}
                  size="small"
                  sx={{
                    color: isActive ? 'primary.main' : 'text.secondary',
                    fontWeight: isActive ? 700 : 500,
                    textTransform: 'none',
                    borderRadius: 2,
                    bgcolor: isActive ? 'primary.50' : 'transparent',
                    '&:hover': { bgcolor: 'action.hover', color: 'text.primary' },
                  }}
                >
                  {link.label}
                </Button>
              );
            })}
          </Box>

          {/* Right side: Avatar + Logout */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, ml: 'auto' }}>
            {/* UI Version Switcher Pill */}
            <Box
              sx={{
                bgcolor: '#f1f5f9',
                p: 0.4,
                borderRadius: '10px',
                display: 'flex',
                alignItems: 'center',
                border: '1px solid #e2e8f0',
              }}
            >
              <Button
                size="small"
                onClick={() => toggleUiVersion()}
                sx={{
                  px: 1.2,
                  py: 0.3,
                  fontSize: '0.725rem',
                  fontWeight: 700,
                  borderRadius: '8px',
                  bgcolor: uiVersion === 'v1' ? '#2563eb' : 'transparent',
                  color: uiVersion === 'v1' ? '#ffffff' : '#64748b',
                  '&:hover': { bgcolor: uiVersion === 'v1' ? '#1d4ed8' : '#e2e8f0' },
                }}
              >
                V1 Classic
              </Button>
              <Button
                size="small"
                onClick={() => toggleUiVersion()}
                sx={{
                  px: 1.2,
                  py: 0.3,
                  fontSize: '0.725rem',
                  fontWeight: 700,
                  borderRadius: '8px',
                  bgcolor: uiVersion === 'v2' ? '#1e3a8a' : 'transparent',
                  color: uiVersion === 'v2' ? '#ffffff' : '#64748b',
                  '&:hover': { bgcolor: uiVersion === 'v2' ? '#1e293b' : '#e2e8f0' },
                }}
              >
                V2 Light Store
              </Button>
            </Box>

            <Avatar
              sx={{
                width: 32,
                height: 32,
                bgcolor: 'primary.main',
                color: 'primary.contrastText',
                fontSize: '0.875rem',
                fontWeight: 700,
              }}
            >
              {user?.name?.charAt(0)?.toUpperCase() || 'C'}
            </Avatar>
            <Typography
              variant="body2"
              fontWeight={600}
              sx={{ display: { xs: 'none', sm: 'block' } }}
            >
              {user?.name}
            </Typography>

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
                <i className="fi fi-rr-sign-out-alt" style={{ fontSize: '15px' }}></i>
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
