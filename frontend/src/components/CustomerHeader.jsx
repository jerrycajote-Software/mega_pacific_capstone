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

const NAV_LINKS = [
  { to: '/dashboard', label: 'Home', icon: 'fi fi-rr-home' },
  { to: '/products', label: 'Products', icon: 'fi fi-rr-box-open' },
  { to: '/profile', label: 'Profile', icon: 'fi fi-rr-user' },
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
          bgcolor: 'background.paper',
          borderBottom: '1px solid',
          borderColor: 'divider',
          color: 'text.primary',
          zIndex: 1100,
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
                mt: 0.5,
              }}
            >
              METAL AND STEEL CORP
            </Typography>
          </Box>

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
                    px: 1.5,
                    bgcolor: isActive ? 'primary.50' : 'transparent',
                    '&:hover': { bgcolor: 'action.hover', color: 'text.primary' },
                  }}
                >
                  {link.label}
                </Button>
              );
            })}
          </Box>

          <Box sx={{ display: 'flex', alignItems: 'center', gap: { xs: 1, sm: 1.5 }, ml: 'auto' }}>
            <Avatar
              src={user?.avatarUrl || '/default-profile.png'}
              alt={user?.name || 'Customer'}
              sx={{
                width: { xs: 32, sm: 36 },
                height: { xs: 32, sm: 36 },
                bgcolor: 'background.default',
                border: '1.5px solid',
                borderColor: 'divider',
              }}
            />
            <Typography
              variant="body2"
              fontWeight={600}
              sx={{ display: { xs: 'none', sm: 'block' }, maxWidth: 120, noWrap: true }}
            >
              {user?.name}
            </Typography>

            <Tooltip title="Logout">
              <IconButton
                onClick={handleLogout}
                size="small"
                aria-label="Logout"
                sx={{
                  color: 'error.main',
                  border: '1px solid',
                  borderColor: 'error.light',
                  borderRadius: 2,
                  p: { xs: 0.75, sm: 1 },
                  '&:hover': { bgcolor: 'error.light', color: 'error.dark' },
                }}
              >
                <i className="fi fi-rr-sign-out-alt" style={{ fontSize: '15px' }}></i>
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
            <Typography sx={{ color: '#64748b', fontSize: '7.5px', fontWeight: 800, letterSpacing: '0.2em', mt: 0.5, fontFamily: 'Arial, sans-serif' }}>
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
            const isActive = location.pathname === link.to;
            return (
              <ListItem key={link.to} disablePadding sx={{ mb: 0.5 }}>
                <ListItemButton
                  onClick={() => {
                    setMobileDrawerOpen(false);
                    navigate(link.to);
                  }}
                  sx={{
                    borderRadius: 2,
                    bgcolor: isActive ? 'primary.50' : 'transparent',
                    color: isActive ? 'primary.main' : 'text.primary',
                    fontWeight: isActive ? 700 : 500,
                    '&:hover': { bgcolor: 'action.hover' },
                  }}
                >
                  <ListItemIcon sx={{ minWidth: 36, color: isActive ? 'primary.main' : 'text.secondary' }}>
                    <i className={link.icon} style={{ fontSize: '16px' }}></i>
                  </ListItemIcon>
                  <ListItemText primary={link.label} primaryTypographyProps={{ fontWeight: isActive ? 700 : 500, fontSize: '0.9rem' }} />
                </ListItemButton>
              </ListItem>
            );
          })}

          <ListItem disablePadding sx={{ mb: 0.5 }}>
            <ListItemButton
              onClick={() => {
                setMobileDrawerOpen(false);
                navigate('/roof-designer');
              }}
              sx={{
                borderRadius: 2,
                color: 'text.secondary',
                '&:hover': { bgcolor: 'action.hover' },
              }}
            >
              <ListItemIcon sx={{ minWidth: 36, color: 'text.secondary' }}>
                <i className="fi fi-rr-home" style={{ fontSize: '16px' }}></i>
              </ListItemIcon>
              <ListItemText
                primary={
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Typography sx={{ fontSize: '0.9rem', fontWeight: 500 }}>3D Roof Designer</Typography>
                    <Chip label="Desktop" size="small" sx={{ height: 16, fontSize: '0.6rem', bgcolor: '#fef3c7', color: '#92400e', fontWeight: 700 }} />
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
