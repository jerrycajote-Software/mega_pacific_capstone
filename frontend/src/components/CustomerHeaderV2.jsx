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
  Chip,
} from '@mui/material';
import LogoutConfirmModal from './LogoutConfirmModal';

const CustomerHeaderV2 = () => {
  const { user, logout } = useAuth();
  const { uiVersion, toggleUiVersion } = useCustomerUi();

  const navigate = useNavigate();
  const location = useLocation();
  const [isLogoutOpen, setIsLogoutOpen] = useState(false);

  const getNavStyle = (isActive) => ({
    color: isActive ? '#1d4ed8' : '#475569',
    fontWeight: isActive ? 700 : 600,
    fontSize: '0.875rem',
    px: 2,
    py: 0.75,
    borderRadius: '10px',
    bgcolor: isActive ? '#eff6ff' : 'transparent',
    border: isActive ? '1px solid #bfdbfe' : '1px solid transparent',
    transition: 'all 0.2s ease',
    '&:hover': {
      bgcolor: '#f1f5f9',
      color: '#1d4ed8',
    },
  });

  return (
    <>
      {/* ── Top Announcement Ticker Bar (Light Mode / Temu Style) ─────────── */}
      <Box
        sx={{
          bgcolor: '#f8fafc',
          color: '#475569',
          fontSize: '0.75rem',
          py: 0.75,
          px: { xs: 2, md: 4 },
          borderBottom: '1px solid #e2e8f0',
          display: { xs: 'none', sm: 'flex' },
          justifyContent: 'space-between',
          alignItems: 'center',
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75, color: '#16a34a' }}>
            <Box
              sx={{
                width: 7,
                height: 7,
                borderRadius: '50%',
                bgcolor: '#16a34a',
                boxShadow: '0 0 6px rgba(22, 163, 74, 0.4)',
              }}
            />
            <Typography variant="caption" fontWeight="700" sx={{ color: '#15803d', display: 'flex', alignItems: 'center', gap: 0.5 }}>
              <i className="fi fi-rr-truck-side" style={{ fontSize: '12px' }}></i>
              Subic & Valenzuela Depots: Live Dispatch Available
            </Typography>
          </Box>

          <Typography variant="caption" sx={{ color: '#cbd5e1' }}>|</Typography>

          <Typography variant="caption" sx={{ color: '#64748b', display: 'flex', alignItems: 'center', gap: 0.5, fontWeight: 500 }}>
            <i className="fi fi-sr-shield-check" style={{ fontSize: '13px', color: '#1d4ed8' }}></i>
            ISO 9001:2015 Certified Steel Mill Products
          </Typography>
        </Box>

        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Box
            component={Link}
            to="/orders"
            sx={{
              color: '#334155',
              fontSize: '0.75rem',
              fontWeight: 600,
              textDecoration: 'none',
              display: 'flex',
              alignItems: 'center',
              gap: 0.5,
              '&:hover': { color: '#1d4ed8' },
            }}
          >
            <i className="fi fi-rr-box" style={{ fontSize: '13px', color: '#1d4ed8' }}></i>
            Track Orders
          </Box>

          <Typography variant="caption" sx={{ color: '#cbd5e1' }}>|</Typography>

          <Typography variant="caption" sx={{ color: '#64748b', display: 'flex', alignItems: 'center', gap: 0.5, fontWeight: 600 }}>
            <i className="fi fi-rr-headset" style={{ fontSize: '13px', color: '#0284c7' }}></i>
            Customer Support Direct Hotline
          </Typography>
        </Box>
      </Box>

      {/* ── Main Clean Light E-Commerce Header ─────────────────────────────── */}
      <AppBar
        position="sticky"
        elevation={0}
        sx={{
          backgroundColor: '#ffffff',
          borderBottom: '1px solid #e2e8f0',
          boxShadow: '0 4px 16px rgba(15, 23, 42, 0.04)',
        }}
      >
        <Toolbar sx={{ justifyContent: 'space-between', minHeight: 68, px: { xs: 2, md: 4 } }}>
          {/* Logo */}
          <Box
            component={Link}
            to="/dashboard"
            sx={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 1.5 }}
          >
            <Box
              sx={{
                width: 40,
                height: 40,
                borderRadius: '10px',
                background: 'linear-gradient(135deg, #1e3a8a 0%, #0f172a 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#ffffff',
                fontWeight: 900,
                fontSize: '1.15rem',
                boxShadow: '0 4px 12px rgba(30, 58, 138, 0.25)',
              }}
            >
              MP
            </Box>
            <Box sx={{ display: 'flex', flexDirection: 'column' }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
                <Typography
                  sx={{
                    fontFamily: '"Poppins", sans-serif',
                    fontWeight: 900,
                    fontSize: { xs: 18, md: 21 },
                    letterSpacing: '0.02em',
                    color: '#0f172a',
                    lineHeight: 1,
                  }}
                >
                  MEGA PACIFIC
                </Typography>
                <Chip
                  label="V2 STORE"
                  size="small"
                  sx={{
                    height: 20,
                    fontSize: '0.65rem',
                    fontWeight: 800,
                    bgcolor: '#1e3a8a',
                    color: '#ffffff',
                    borderRadius: '6px',
                    '& .MuiChip-label': { px: 0.8 },
                  }}
                />
              </Box>
              <Typography
                sx={{
                  color: '#64748b',
                  fontSize: '0.65rem',
                  fontWeight: 700,
                  letterSpacing: '0.12em',
                  mt: 0.3,
                }}
              >
                MODERN INDUSTRIAL STEEL E-COMMERCE
              </Typography>
            </Box>
          </Box>

          {/* Center Navigation Links */}
          <Box sx={{ display: { xs: 'none', md: 'flex' }, alignItems: 'center', gap: 1 }}>
            <Button
              component={Link}
              to="/dashboard"
              sx={getNavStyle(location.pathname === '/dashboard')}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
                <i className="fi fi-rr-store" style={{ fontSize: '15px' }}></i>
                Products Catalog
              </Box>
            </Button>
            <Button
              component={Link}
              to="/products"
              sx={getNavStyle(location.pathname === '/products' || location.pathname.startsWith('/product/'))}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
                <i className="fi fi-rr-grid" style={{ fontSize: '15px' }}></i>
                All Products
              </Box>
            </Button>
            <Button
              component={Link}
              to="/orders"
              sx={getNavStyle(location.pathname.startsWith('/order'))}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
                <i className="fi fi-rr-shopping-bag" style={{ fontSize: '15px' }}></i>
                My Orders
              </Box>
            </Button>
          </Box>

          {/* Right Controls — UI Switcher & Profile */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
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

            {user && (
              <Box
                component={Link}
                to="/profile"
                sx={{
                  textDecoration: 'none',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 1,
                  px: 1.5,
                  py: 0.6,
                  borderRadius: '10px',
                  bgcolor: '#f8fafc',
                  border: '1px solid #e2e8f0',
                  transition: 'all 0.2s ease',
                  '&:hover': { bgcolor: '#f1f5f9', borderColor: '#cbd5e1' },
                }}
              >
                <Avatar sx={{ width: 26, height: 26, bgcolor: '#1e3a8a', fontSize: 12, fontWeight: 800 }}>
                  {user.name?.charAt(0)}
                </Avatar>
                <Typography
                  variant="caption"
                  sx={{ color: '#0f172a', fontWeight: 700, display: { xs: 'none', sm: 'block' } }}
                >
                  {user.name?.split(' ')[0]}
                </Typography>
              </Box>
            )}

            <Tooltip title="Logout">
              <IconButton
                onClick={() => setIsLogoutOpen(true)}
                size="small"
                sx={{
                  color: '#dc2626',
                  border: '1px solid #fee2e2',
                  bgcolor: '#fef2f2',
                  borderRadius: '10px',
                  p: 0.8,
                  '&:hover': { bgcolor: '#fee2e2', borderColor: '#fca5a5' },
                }}
              >
                <i className="fi fi-rr-sign-out-alt" style={{ fontSize: '15px' }}></i>
              </IconButton>
            </Tooltip>
          </Box>
        </Toolbar>
      </AppBar>

      {/* Logout Confirmation Modal */}
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

export default CustomerHeaderV2;
