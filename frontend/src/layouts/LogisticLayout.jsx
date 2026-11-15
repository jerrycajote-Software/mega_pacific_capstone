import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { NavLink, Link, Outlet, useNavigate, useLocation } from 'react-router-dom';
import MenuIcon from '@mui/icons-material/Menu';
import CloseIcon from '@mui/icons-material/Close';
import {
  CustomDashboardIcon,
  CustomDeliveriesIcon,
  CustomCoilInventoryIcon,
  CustomNavToggleIcon,
  CustomLogoutIcon as LogoutIcon,
  CustomLightModeIcon as LightModeIcon,
  CustomDarkModeIcon as DarkModeIcon
} from '../components/icons';
import { useAuth } from '../context/AuthContext';
import { useAdminTheme } from '../context/ThemeContext';
import LogoutConfirmModal from '../components/LogoutConfirmModal';
import NotificationPermissionBanner from '../components/NotificationPermissionBanner';
import PortalNotificationAlerts from '../components/PortalNotificationAlerts';
import { usePortalNotificationManager } from '../hooks/usePortalNotificationManager';
import { Tooltip } from '@mui/material';
import { usePreventBackToLogin } from '../hooks/usePreventBackToLogin';

const navItems = [
  { name: 'Dashboard',       path: '/logistic/dashboard',   icon: <CustomDashboardIcon size={20} /> },
  { name: 'Deliveries',      path: '/logistic/deliveries',  icon: <CustomDeliveriesIcon size={20} /> },
  { name: 'Coil Inventory',  path: '/logistic/products',    icon: <CustomCoilInventoryIcon size={20} /> },
];

const LogisticLayout = () => {
  usePreventBackToLogin();
  const { logout, user } = useAuth();
  const { mode, toggleTheme } = useAdminTheme();
  const isDark = mode === 'dark';
  const navigate = useNavigate();
  const location = useLocation();
  const [isLogoutOpen, setIsLogoutOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(() => {
    return localStorage.getItem('mega_admin_sidebar_collapsed') === 'true';
  });

  useEffect(() => {
    setMobileMenuOpen(false);
  }, [location.pathname]);

  const handleToggleSidebarNavigation = () => {
    setIsSidebarCollapsed((prev) => {
      const nextState = !prev;
      localStorage.setItem('mega_admin_sidebar_collapsed', String(nextState));
      return nextState;
    });
  };

  // Remind Logistics staff about Finance-approved orders waiting for dispatch and low coil inventory
  const fetchLogisticReminders = useCallback(async () => {
    const token = localStorage.getItem('appToken');
    if (!token) return null;
    const API_URL = import.meta.env.VITE_API_URL || '';
    const headers = { Authorization: `Bearer ${token}` };

    const [ordersRes, coilsRes] = await Promise.allSettled([
      axios.get(`${API_URL}/api/logistic/orders`, { headers }),
      axios.get(`${API_URL}/api/logistic/coils/summary`, { headers })
    ]);

    const orders = ordersRes.status === 'fulfilled' ? (ordersRes.value.data?.data || []) : [];
    const coilSummary = coilsRes.status === 'fulfilled' ? (coilsRes.value.data?.data || {}) : {};

    const readyToPrepare = orders.filter(
      (o) => o.orderStatus === 'finance_verified' || o.orderStatus === 'processing'
    ).length;
    const inTransit = orders.filter(
      (o) => o.orderStatus === 'shipped' || o.orderStatus === 'out_for_delivery'
    ).length;
    const pickupReady = orders.filter((o) => o.orderStatus === 'ready_for_pickup').length;
    const lowCoilCount = (coilSummary.criticalCount || 0) + (coilSummary.lowCount || 0);

    const parts = [];
    if (readyToPrepare > 0) parts.push(`${readyToPrepare} approved order(s) waiting for dispatch`);
    if (inTransit > 0) parts.push(`${inTransit} active delivery(ies) on the road`);
    if (pickupReady > 0) parts.push(`${pickupReady} order(s) waiting for store pick-up`);
    if (lowCoilCount > 0) parts.push(`${lowCoilCount} coil item(s) low or out of stock`);

    if (parts.length === 0) return null;

    const targetUrl = (readyToPrepare + inTransit + pickupReady) > 0 ? '/logistic/deliveries' : '/logistic/products';
    return {
      title: 'Logistics Reminder',
      body: `Pending items: ${parts.join(', ')}.`,
      severity: readyToPrepare > 0 || lowCoilCount > 0 ? 'warning' : 'info',
      url: targetUrl,
      actionLabel: targetUrl === '/logistic/deliveries' ? 'View Deliveries' : 'View Inventory',
      tag: 'logistic-session-reminder'
    };
  }, []);

  const {
    activeNotification,
    permissionFeedback,
    setPermissionFeedback,
    handleCloseNotification,
    handleClosePermissionFeedback
  } = usePortalNotificationManager({
    user,
    rooms: ['logistic'],
    primaryEvent: 'logistic_notification',
    reminderStorageKey: user?.id ? `megapacific_logistic_reminded_${user.id}` : null,
    fetchPendingReminder: fetchLogisticReminders
  });

  const handleLogout = () => {
    setIsLogoutOpen(true);
  };

  const checkIsActive = (itemPath) => {
    const currentPath = (location.pathname || '').toLowerCase().replace(/\/$/, '');
    const targetPath = (itemPath || '').toLowerCase().replace(/\/$/, '');
    if (!currentPath || !targetPath) return false;
    if (currentPath === targetPath) return true;
    if (targetPath.endsWith('/dashboard') && currentPath === targetPath.replace('/dashboard', '')) {
      return true;
    }
    if (currentPath.startsWith(`${targetPath}/`)) {
      return true;
    }
    return false;
  };

  return (
    <div className="admin-shell">
      {mobileMenuOpen && (
        <div
          className="admin-mobile-overlay"
          onClick={() => setMobileMenuOpen(false)}
          aria-hidden="true"
        />
      )}

      <aside className={`admin-sidebar ${isSidebarCollapsed ? 'collapsed' : ''} ${mobileMenuOpen ? 'mobile-open' : ''}`}>

        <div className="sidebar-brand-box">
          <Tooltip title="Mega Pacific Logistic Dashboard" placement="right" arrow disableHoverListener={!isSidebarCollapsed}>
            <Link to="/logistic/dashboard" className="sidebar-brand-link">
              <div className="sidebar-brand-full">
                <div style={{ display: 'flex', alignItems: 'center', fontFamily: 'Arial, sans-serif', fontWeight: 900, fontSize: '20px', letterSpacing: '0.04em', lineHeight: 1 }}>
                  <span style={{ color: 'var(--text-primary)', WebkitTextStroke: '1px #3a4fd4' }}>MEGA</span>
                  <span style={{ color: 'var(--text-primary)', WebkitTextStroke: '1px #5b6ee8' }}>PACIFIC</span>
                </div>
                <div style={{ color: '#7a90e8', fontSize: '9px', fontWeight: 800, letterSpacing: '0.18em', marginTop: '4px', fontFamily: 'Arial, sans-serif' }}>
                  LOGISTIC DASHBOARD
                </div>
              </div>
              <div className="sidebar-brand-compact">
                <div className="sidebar-brand-badge">
                  MP
                </div>
              </div>
            </Link>
          </Tooltip>
        </div>

        <div className="sidebar-header-box">
          <div className="sidebar-header-content">
            
            <div style={{ fontWeight: 600, fontSize: '0.9rem', color: 'var(--text-primary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
              {user?.name || 'Logistic Staff'}
            </div>
            <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: 2, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
              {user?.email}
            </div>
          </div>

          <Tooltip title={isSidebarCollapsed ? "Expand Navigation" : "Hide Navigation"} arrow placement={isSidebarCollapsed ? "right" : "left"}>
            <button
              type="button"
              className="sidebar-toggle-btn"
              onClick={handleToggleSidebarNavigation}
              aria-label={isSidebarCollapsed ? "Expand Navigation" : "Hide Navigation"}
            >
              <CustomNavToggleIcon isCollapsed={isSidebarCollapsed} size={19} />
            </button>
          </Tooltip>
        </div>

        <div className="sidebar-section-title">
          Operations
        </div>

        <nav className="sidebar-nav">
          {navItems.map((item) => {
            const isTabActive = checkIsActive(item.path);
            return (
              <Tooltip key={item.name} title={item.name} placement="right" arrow disableHoverListener={!isSidebarCollapsed}>
                <NavLink
                  to={item.path}
                  onClick={() => setMobileMenuOpen(false)}
                  data-active={isTabActive ? "true" : undefined}
                  className={({ isActive }) => `nav-link${isActive || isTabActive ? ' active' : ''}`}
                  style={({ isActive }) => {
                    const active = isActive || isTabActive;
                    if (!active) return undefined;
                    return isDark ? {
                      borderRadius: '12px',
                      background: 'linear-gradient(90deg, rgba(34, 197, 94, 0.28) 0%, rgba(16, 185, 129, 0.16) 60%, rgba(34, 197, 94, 0.08) 100%)',
                      color: '#ffffff',
                      border: '1.5px solid rgba(74, 222, 128, 0.65)',
                      boxShadow: '0 4px 20px -2px rgba(34, 197, 94, 0.35)',
                      fontWeight: 700,
                    } : {
                      borderRadius: '12px',
                      background: '#dcfce7',
                      color: '#15803d',
                      border: '1.5px solid #22c55e',
                      boxShadow: '0 4px 14px rgba(34, 197, 94, 0.25)',
                      fontWeight: 700,
                    };
                  }}
                >
                  <span className="nav-icon">{item.icon}</span>
                  <span
                    className="sidebar-nav-label"
                    style={isTabActive ? { fontWeight: 750, color: isDark ? '#ffffff' : '#15803d' } : undefined}
                  >
                    {item.name}
                  </span>
                </NavLink>
              </Tooltip>
            );
          })}
        </nav>

        <div className="sidebar-footer">
          <Tooltip title={isDark ? "Switch to Light Mode" : "Switch to Dark Mode"} placement="right" arrow disableHoverListener={!isSidebarCollapsed}>
            <button
              type="button"
              onClick={toggleTheme}
              className="sidebar-theme-btn"
              aria-label={isDark ? "Switch to Light Mode" : "Switch to Dark Mode"}
            >
              <span className="nav-icon">
                {isDark ? <LightModeIcon sx={{ fontSize: 18, color: '#fbbf24' }} /> : <DarkModeIcon sx={{ fontSize: 18, color: '#475569' }} />}
              </span>
              <span className="sidebar-nav-label">{isDark ? "Light Mode" : "Dark Mode"}</span>
            </button>
          </Tooltip>

          <Tooltip title="Sign Out" placement="right" arrow disableHoverListener={!isSidebarCollapsed}>
            <button
              type="button"
              onClick={handleLogout}
              className="sidebar-signout-btn"
              aria-label="Sign Out"
            >
              <span className="nav-icon">
                <LogoutIcon sx={{ fontSize: 18 }} />
              </span>
              <span className="sidebar-nav-label">Sign Out</span>
            </button>
          </Tooltip>
        </div>
      </aside>

      <div className={`admin-main ${isSidebarCollapsed ? 'sidebar-collapsed' : ''}`}>
        <header className="admin-mobile-topbar">
          <button
            type="button"
            onClick={() => setMobileMenuOpen((prev) => !prev)}
            aria-label={mobileMenuOpen ? 'Close navigation menu' : 'Open navigation menu'}
            style={{
              width: 42,
              height: 42,
              borderRadius: 10,
              border: '1px solid var(--border-light)',
              background: 'var(--bg-secondary)',
              color: 'var(--text-primary)',
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              flexShrink: 0
            }}
          >
            {mobileMenuOpen ? <CloseIcon fontSize="small" /> : <MenuIcon fontSize="small" />}
          </button>

          <Link to="/logistic/dashboard" style={{ textDecoration: 'none', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <span style={{ fontWeight: 900, fontSize: '0.95rem', letterSpacing: '0.04em', color: 'var(--text-primary)' }}>
              MEGA PACIFIC
            </span>
            <span style={{ fontSize: '0.62rem', fontWeight: 800, letterSpacing: '0.14em', color: '#7a90e8' }}>
              LOGISTICS PORTAL
            </span>
          </Link>

          <button
            type="button"
            onClick={toggleTheme}
            aria-label={isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
            style={{
              width: 42,
              height: 42,
              borderRadius: 10,
              border: '1px solid var(--border-light)',
              background: 'var(--bg-secondary)',
              color: 'var(--text-primary)',
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              flexShrink: 0
            }}
          >
            {isDark ? <LightModeIcon sx={{ fontSize: 18, color: '#fbbf24' }} /> : <DarkModeIcon sx={{ fontSize: 18, color: '#475569' }} />}
          </button>
        </header>

        <div className="admin-content">
          <NotificationPermissionBanner
            bannerKey="megapacific_logistic_banner_dismissed"
            sx={{ mx: { xs: 2, md: 5 }, mt: 2, mb: 0 }}
            title="Turn On Live Delivery & Dispatch Alerts"
            description="Allow browser alerts in Chrome, Edge, or Safari to get notified right away when Finance approves a new order, delivery status updates, or coil stock runs low."
            deniedDescription="To receive live delivery pop-ups in Chrome, Edge, or Safari, allow notifications for this website in your browser address bar settings."
            sampleNotification={{
              title: 'Mega Pacific Logistics Alerts Active',
              body: 'You will now receive instant alerts when Finance approves new orders for delivery or pick-up, or when coil stock runs low.',
              url: '/logistic/deliveries',
              tag: 'megapacific-logistic-test'
            }}
            onStatusFeedback={(message, severity) => setPermissionFeedback({ message, severity })}
          />
          <Outlet />
        </div>
      </div>
      {isLogoutOpen && (
        <LogoutConfirmModal
          onClose={() => setIsLogoutOpen(false)}
          onConfirm={() => {
            setIsLogoutOpen(false);
            logout();
            navigate('/logistic-1megapacific/login', { replace: true });
          }}
        />
      )}

      <PortalNotificationAlerts
        activeNotification={activeNotification}
        onCloseNotification={handleCloseNotification}
        permissionFeedback={permissionFeedback}
        onClosePermissionFeedback={handleClosePermissionFeedback}
      />
    </div>
  );
};

export default LogisticLayout;
