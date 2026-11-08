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
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Divider,
  Chip,
} from '@mui/material';
import LogoutConfirmModal from './LogoutConfirmModal';
import { openCustomerSupport } from '../utils/supportEvents';
import {
  CustomCustomerHomeIcon,
  CustomCustomerCatalogIcon,
  CustomCustomerProfileIcon,
  CustomCustomerSupportDeskIcon,
} from './icons';

const NAV_LINKS = [
  { to: '/dashboard', label: 'Home', icon: CustomCustomerHomeIcon },
  { to: '/products', label: 'Products', icon: CustomCustomerCatalogIcon },
  { to: '/profile', label: 'Profile', icon: CustomCustomerProfileIcon },
];

const CustomerHeader = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [isLogoutOpen, setIsLogoutOpen] = useState(false);
  const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false);

  const handleLogout = () => setIsLogoutOpen(true);

  return (
    <>
      <AppBar
        position="sticky"
        elevation={0}
        sx={{
          bgcolor: (theme) => theme.palette.mode === 'dark' ? 'rgba(15, 23, 42, 0.92)' : 'rgba(255, 255, 255, 0.92)',
          backdropFilter: 'blur(12px)',
          borderBottom: '1px solid',
          borderColor: (theme) => theme.palette.mode === 'dark' ? 'rgba(51, 65, 85, 0.7)' : 'rgba(226, 232, 240, 0.9)',
          boxShadow: (theme) => theme.palette.mode === 'dark'
            ? '0 4px 20px -2px rgba(0, 0, 0, 0.5)'
            : '0 2px 12px -2px rgba(0, 0, 0, 0.04), 0 1px 3px rgba(0, 0, 0, 0.02)',
          color: 'text.primary',
          zIndex: 1100,
          transition: 'all 0.25s ease',
        }}
      >
        <Toolbar sx={{ gap: { xs: 1, sm: 2 }, px: { xs: 1.5, sm: 3 } }}>
          <IconButton
            onClick={() => setMobileDrawerOpen(true)}
            size="medium"
            aria-label="Open mobile navigation menu"
            sx={{
              display: { xs: 'inline-flex', md: 'none' },
              color: 'text.primary',
              p: 1,
              borderRadius: 2,
              '&:hover': { bgcolor: 'action.hover' },
            }}
          >
            <i className="fi fi-rr-menu-burger" style={{ fontSize: '18px' }}></i>
          </IconButton>

          <Box
            component={Link}
            to="/dashboard"
            sx={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'flex-start',
              textDecoration: 'none',
              mr: { xs: 1, md: 3 },
              transition: 'transform 0.2s ease',
              '&:hover': { transform: 'translateY(-1px)' },
            }}
          >
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                fontFamily: 'Arial, sans-serif',
                fontWeight: 900,
                fontSize: { xs: 20, sm: 24 },
                letterSpacing: '0.05em',
                lineHeight: 1,
              }}
            >
              <Typography component="span" sx={{ color: '#1e3a8a', fontSize: 'inherit', fontWeight: 'inherit' }}>MEGA</Typography>
              <Typography component="span" sx={{ color: (theme) => theme.palette.mode === 'dark' ? '#f8fafc' : '#0f172a', fontSize: 'inherit', fontWeight: 'inherit' }}>PACIFIC</Typography>
            </Box>
            <Typography
              sx={{
                color: '#64748b',
                fontSize: { xs: '8px', sm: '10px' },
                fontWeight: 800,
                letterSpacing: '0.2em',
                fontFamily: 'Arial, sans-serif',
                lineHeight: 1,
                mt: { xs: '-1px', sm: '-2px' },
              }}
            >
              METAL AND STEEL CORP
            </Typography>
          </Box>

          <Box
            sx={{
              display: { xs: 'none', md: 'inline-flex' },
              alignItems: 'center',
              gap: 0.75,
              p: '5px 7px',
              borderRadius: '9999px',
              bgcolor: (theme) => theme.palette.mode === 'dark' ? 'rgba(30, 41, 59, 0.65)' : '#f1f5f9',
              border: '1px solid',
              borderColor: (theme) => theme.palette.mode === 'dark' ? 'rgba(51, 65, 85, 0.75)' : 'rgba(226, 232, 240, 0.9)',
              boxShadow: 'inset 0 1px 2px rgba(0, 0, 0, 0.04)',
            }}
          >
            {NAV_LINKS.map((link) => {
              const isActive = link.to === '/dashboard'
                ? (location.pathname === '/' || location.pathname === '/dashboard')
                : location.pathname.startsWith(link.to);

              return (
                <Button
                  key={link.to}
                  component={Link}
                  to={link.to}
                  size="small"
                  sx={{
                    px: 2.2,
                    py: 0.6,
                    borderRadius: '9999px',
                    fontSize: '0.86rem',
                    textTransform: 'none',
                    fontWeight: isActive ? 750 : 600,
                    color: isActive
                      ? (theme) => theme.palette.mode === 'dark' ? '#4ade80' : '#15803d'
                      : 'text.secondary',
                    bgcolor: isActive
                      ? (theme) => theme.palette.mode === 'dark' ? 'rgba(34, 197, 94, 0.2)' : '#ffffff'
                      : 'transparent',
                    border: '1px solid',
                    borderColor: isActive
                      ? (theme) => theme.palette.mode === 'dark' ? 'rgba(74, 222, 128, 0.45)' : 'rgba(34, 197, 94, 0.35)'
                      : 'transparent',
                    boxShadow: isActive
                      ? (theme) => theme.palette.mode === 'dark'
                        ? '0 2px 10px rgba(34, 197, 94, 0.25)'
                        : '0 2px 8px rgba(34, 197, 94, 0.16), 0 1px 2px rgba(0, 0, 0, 0.04)'
                      : 'none',
                    transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                    '&:hover': {
                      bgcolor: isActive
                        ? (theme) => theme.palette.mode === 'dark' ? 'rgba(34, 197, 94, 0.26)' : '#ffffff'
                        : (theme) => theme.palette.mode === 'dark' ? 'rgba(34, 197, 94, 0.14)' : '#dcfce7',
                      color: (theme) => theme.palette.mode === 'dark' ? '#4ade80' : '#15803d',
                      borderColor: (theme) => theme.palette.mode === 'dark' ? 'rgba(74, 222, 128, 0.35)' : 'rgba(34, 197, 94, 0.3)',
                      transform: 'translateY(-1px)',
                      boxShadow: (theme) => theme.palette.mode === 'dark'
                        ? '0 4px 12px rgba(34, 197, 94, 0.25)'
                        : '0 3px 10px rgba(34, 197, 94, 0.18)',
                    },
                  }}
                >
                  {link.label}
                </Button>
              );
            })}
          </Box>

          <Box sx={{ display: 'flex', alignItems: 'center', gap: { xs: 1, sm: 1.5 }, ml: 'auto' }}>
            <Box
              component={Link}
              to="/profile"
              sx={{
                display: 'flex',
                alignItems: 'center',
                gap: 1.2,
                textDecoration: 'none',
                color: 'text.primary',
                p: '3px 10px 3px 4px',
                borderRadius: '9999px',
                border: '1px solid',
                borderColor: (theme) => theme.palette.mode === 'dark' ? 'rgba(51, 65, 85, 0.7)' : 'rgba(226, 232, 240, 0.9)',
                bgcolor: (theme) => theme.palette.mode === 'dark' ? 'rgba(30, 41, 59, 0.5)' : 'rgba(248, 250, 252, 0.9)',
                transition: 'all 0.2s ease',
                '&:hover': {
                  bgcolor: (theme) => theme.palette.mode === 'dark' ? 'rgba(34, 197, 94, 0.12)' : '#f0fdf4',
                  borderColor: (theme) => theme.palette.mode === 'dark' ? 'rgba(74, 222, 128, 0.35)' : 'rgba(34, 197, 94, 0.35)',
                  transform: 'translateY(-1px)',
                },
              }}
            >
              <Avatar
                src={user?.avatarUrl || '/default-profile.png'}
                alt={user?.name || 'Customer'}
                sx={{
                  width: { xs: 30, sm: 34 },
                  height: { xs: 30, sm: 34 },
                  bgcolor: 'background.default',
                  border: '1.5px solid',
                  borderColor: (theme) => theme.palette.mode === 'dark' ? '#334155' : '#cbd5e1',
                }}
              />
              <Typography
                variant="body2"
                fontWeight={700}
                sx={{
                  display: { xs: 'none', sm: 'block' },
                  maxWidth: 130,
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  fontSize: '0.84rem'
                }}
              >
                {user?.name || 'Customer'}
              </Typography>
            </Box>

            <Tooltip title="Sign Out">
              <IconButton
                onClick={handleLogout}
                size="small"
                aria-label="Sign Out"
                sx={{
                  color: '#ef4444',
                  border: '1px solid',
                  borderColor: 'rgba(239, 68, 68, 0.25)',
                  borderRadius: '50%',
                  width: { xs: 32, sm: 36 },
                  height: { xs: 32, sm: 36 },
                  transition: 'all 0.2s ease',
                  '&:hover': {
                    bgcolor: 'rgba(239, 68, 68, 0.1)',
                    borderColor: '#ef4444',
                    color: '#dc2626',
                    transform: 'scale(1.05)',
                  },
                }}
              >
                <i className="fi fi-rr-sign-out-alt" style={{ fontSize: '14px' }}></i>
              </IconButton>
            </Tooltip>
          </Box>
        </Toolbar>
      </AppBar>

      <Drawer
        anchor="left"
        open={mobileDrawerOpen}
        onClose={() => setMobileDrawerOpen(false)}
        PaperProps={{
          sx: {
            width: 280,
            bgcolor: 'background.paper',
            p: 2,
            display: 'flex',
            flexDirection: 'column',
          },
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
          <Box>
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                fontFamily: 'Arial, sans-serif',
                fontWeight: 900,
                fontSize: 18,
                letterSpacing: '0.05em',
                lineHeight: 1,
              }}
            >
              <Typography component="span" sx={{ color: '#1e3a8a', fontSize: 'inherit', fontWeight: 'inherit' }}>MEGA</Typography>
              <Typography component="span" sx={{ color: (theme) => theme.palette.mode === 'dark' ? '#f8fafc' : '#0f172a', fontSize: 'inherit', fontWeight: 'inherit' }}>PACIFIC</Typography>
            </Box>
            <Typography sx={{ color: '#64748b', fontSize: '7.5px', fontWeight: 800, letterSpacing: '0.2em', lineHeight: 1, mt: '-1px', fontFamily: 'Arial, sans-serif' }}>
              METAL AND STEEL CORP
            </Typography>
          </Box>
          <IconButton size="small" onClick={() => setMobileDrawerOpen(false)} aria-label="Close menu">
            <i className="fi fi-rr-cross" style={{ fontSize: '14px' }}></i>
          </IconButton>
        </Box>

        <Box sx={{ p: 1.5, mb: 2, borderRadius: 2.5, bgcolor: 'action.hover', display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <Avatar
            src={user?.avatarUrl || '/default-profile.png'}
            alt={user?.name || 'Customer'}
            sx={{
              width: 40,
              height: 40,
              bgcolor: 'background.default',
              border: '1px solid',
              borderColor: 'divider',
            }}
          />
          <Box sx={{ minWidth: 0, flex: 1 }}>
            <Typography variant="body2" fontWeight={700} noWrap>
              {user?.name || 'Customer'}
            </Typography>
            <Typography variant="caption" color="text.secondary" noWrap display="block">
              {user?.email || 'customer@megapacific.ph'}
            </Typography>
          </Box>
        </Box>

        <Divider sx={{ mb: 1.5 }} />

        <List sx={{ p: 0, flexGrow: 1 }}>
          {NAV_LINKS.map((link) => {
            const isActive = link.to === '/dashboard'
              ? (location.pathname === '/' || location.pathname === '/dashboard')
              : location.pathname.startsWith(link.to);
            const IconComponent = link.icon;

            return (
              <ListItem key={link.to} disablePadding sx={{ mb: 0.5 }}>
                <ListItemButton
                  onClick={() => {
                    setMobileDrawerOpen(false);
                    navigate(link.to);
                  }}
                  sx={{
                    borderRadius: 2.5,
                    bgcolor: isActive
                      ? (theme) => theme.palette.mode === 'dark' ? 'rgba(34, 197, 94, 0.18)' : '#dcfce7'
                      : 'transparent',
                    color: isActive
                      ? (theme) => theme.palette.mode === 'dark' ? '#4ade80' : '#15803d'
                      : 'text.primary',
                    fontWeight: isActive ? 700 : 500,
                    transition: 'all 0.2s ease',
                    '&:hover': {
                      bgcolor: isActive
                        ? (theme) => theme.palette.mode === 'dark' ? 'rgba(34, 197, 94, 0.24)' : '#dcfce7'
                        : (theme) => theme.palette.mode === 'dark' ? 'rgba(34, 197, 94, 0.1)' : '#f0fdf4',
                      color: (theme) => theme.palette.mode === 'dark' ? '#4ade80' : '#15803d',
                      transform: 'translateX(3px)',
                    },
                  }}
                >
                  <ListItemIcon sx={{ minWidth: 36, display: 'flex', alignItems: 'center' }}>
                    <IconComponent size={20} isActive={isActive} />
                  </ListItemIcon>
                  <ListItemText primary={link.label} primaryTypographyProps={{ fontWeight: isActive ? 750 : 500, fontSize: '0.9rem' }} />
                </ListItemButton>
              </ListItem>
            );
          })}



          <ListItem disablePadding sx={{ mb: 0.5 }}>
            <ListItemButton
              onClick={() => {
                setMobileDrawerOpen(false);
                openCustomerSupport();
              }}
              sx={{
                borderRadius: 2,
                color: 'text.primary',
                '&:hover': { bgcolor: 'action.hover' },
              }}
            >
              <ListItemIcon sx={{ minWidth: 36, display: 'flex', alignItems: 'center' }}>
                <CustomCustomerSupportDeskIcon size={20} />
              </ListItemIcon>
              <ListItemText
                primary={
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Typography sx={{ fontSize: '0.9rem', fontWeight: 600 }}>Live Support Desk</Typography>
                    <Chip label="Online" size="small" sx={{ height: 16, fontSize: '0.6rem', bgcolor: '#dcfce7', color: '#15803d', fontWeight: 700 }} />
                  </Box>
                }
              />
            </ListItemButton>
          </ListItem>
        </List>

        <Divider sx={{ my: 1.5 }} />

        <Button
          fullWidth
          variant="outlined"
          color="error"
          onClick={() => {
            setMobileDrawerOpen(false);
            handleLogout();
          }}
          startIcon={<i className="fi fi-rr-sign-out-alt" style={{ fontSize: '14px' }}></i>}
          sx={{ borderRadius: 2, fontWeight: 700, py: 1 }}
        >
          Sign Out
        </Button>
      </Drawer>

      {isLogoutOpen && (
        <LogoutConfirmModal
          onClose={() => setIsLogoutOpen(false)}
          onConfirm={() => {
            setIsLogoutOpen(false);
            logout();
            navigate('/login', { replace: true });
          }}
        />
      )}
    </>
  );
};

export default CustomerHeader;
