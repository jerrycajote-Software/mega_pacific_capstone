import React, { useState, useCallback } from 'react';
import axios from 'axios';
import { NavLink, Link, Outlet, useNavigate, useLocation } from 'react-router-dom';
import {
  CustomDashboardIcon,
  CustomExpensesIcon,
  CustomPaymentIcon,
  CustomRefundsIcon,
  CustomReportsIcon,
  CustomNavToggleIcon,
  CustomLogoutIcon as LogoutIcon,
  CustomLightModeIcon as LightModeIcon,
  CustomDarkModeIcon as DarkModeIcon
} from '../components/icons';
import { useAuth } from '../context/AuthContext';
import { useAdminTheme } from '../context/ThemeContext';
import LogoutConfirmModal from '../components/LogoutConfirmModal';
import ErrorBoundary from '../components/ErrorBoundary';
import NotificationPermissionBanner from '../components/NotificationPermissionBanner';
import PortalNotificationAlerts from '../components/PortalNotificationAlerts';
import { usePortalNotificationManager } from '../hooks/usePortalNotificationManager';
import { Tooltip } from '@mui/material';
import { usePreventBackToLogin } from '../hooks/usePreventBackToLogin';

const navItems = [
  { name: 'Dashboard',  path: '/finance/dashboard',  icon: <CustomDashboardIcon size={20} /> },
  { name: 'Expenses',   path: '/finance/expenses',   icon: <CustomExpensesIcon size={20} /> },
  { name: 'Payments',   path: '/finance/payments',   icon: <CustomPaymentIcon size={20} /> },
  { name: 'Refunds',    path: '/finance/refunds',    icon: <CustomRefundsIcon size={20} /> },
  { name: 'Reports',    path: '/finance/reports',    icon: <CustomReportsIcon size={20} /> },
];

const FinanceLayout = () => {
  usePreventBackToLogin();
  const { logout, user } = useAuth();
  const { mode, toggleTheme } = useAdminTheme();
  const isDark = mode === 'dark';
  const navigate = useNavigate();
  const location = useLocation();
  const [isLogoutOpen, setIsLogoutOpen] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(() => {
    return localStorage.getItem('mega_admin_sidebar_collapsed') === 'true';
  });

  const handleToggleSidebarNavigation = () => {
    setIsSidebarCollapsed((prev) => {
      const nextState = !prev;
      localStorage.setItem('mega_admin_sidebar_collapsed', String(nextState));
      return nextState;
    });
  };

  // Remind Finance staff about Sales-approved orders waiting for Payment Verification and pending refunds
  const fetchFinanceReminders = useCallback(async () => {
    const token = localStorage.getItem('appToken');
    if (!token) return null;
    const API_URL = import.meta.env.VITE_API_URL || '';
    const headers = { Authorization: `Bearer ${token}` };

    const [ordersRes, refundsRes] = await Promise.allSettled([
      axios.get(`${API_URL}/api/finance/orders`, { headers }),
      axios.get(`${API_URL}/api/finance/refunds?status=pending`, { headers })
    ]);

    const orders = ordersRes.status === 'fulfilled' ? (ordersRes.value.data?.data || []) : [];
    const refunds = refundsRes.status === 'fulfilled' ? (refundsRes.value.data?.data || []) : [];

    const pendingVerificationCount = orders.filter((o) => o.orderStatus === 'sales_approved').length;
    const pendingRefundCount = refunds.filter((r) => (r.status || '').toLowerCase() === 'pending').length;

    const parts = [];
    if (pendingVerificationCount > 0) {
      parts.push(`${pendingVerificationCount} order(s) waiting for Payment Verification`);
    }
    if (pendingRefundCount > 0) {
      parts.push(`${pendingRefundCount} refund request(s) waiting for processing`);
    }

    if (parts.length === 0) return null;

    const targetUrl = pendingVerificationCount > 0 ? '/finance/payments' : '/finance/refunds';
    return {
      title: 'Finance Action Reminder',
      body: `Needs your review: ${parts.join(' and ')}.`,
      severity: 'warning',
      url: targetUrl,
      actionLabel: pendingVerificationCount > 0 ? 'Verify Payments' : 'View Refunds',
      tag: 'finance-session-reminder'
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
    rooms: ['finance'],
    primaryEvent: 'finance_notification',
    reminderStorageKey: user?.id ? `megapacific_finance_reminded_${user.id}` : null,
    fetchPendingReminder: fetchFinanceReminders
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

      <aside className={`admin-sidebar ${isSidebarCollapsed ? 'collapsed' : ''}`}>

        <div className="sidebar-brand-box">
          <Tooltip title="Mega Pacific Finance Dashboard" placement="right" arrow disableHoverListener={!isSidebarCollapsed}>
            <Link to="/finance/dashboard" className="sidebar-brand-link">
              <div className="sidebar-brand-full">
                <div style={{ display: 'flex', alignItems: 'center', fontFamily: 'Arial, sans-serif', fontWeight: 900, fontSize: '20px', letterSpacing: '0.04em', lineHeight: 1 }}>
                  <span style={{ color: 'var(--text-primary)', WebkitTextStroke: '1px #3a4fd4' }}>MEGA</span>
                  <span style={{ color: 'var(--text-primary)', WebkitTextStroke: '1px #5b6ee8' }}>PACIFIC</span>
                </div>
                <div style={{ color: '#7a90e8', fontSize: '9px', fontWeight: 800, letterSpacing: '0.18em', marginTop: '4px', fontFamily: 'Arial, sans-serif' }}>
                  FINANCE DASHBOARD
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
              {user?.name || 'Finance Staff'}
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
        <div className="admin-content">
          <NotificationPermissionBanner
            bannerKey="megapacific_finance_banner_dismissed"
            sx={{ mx: { xs: 2, md: 5 }, mt: 2, mb: 0 }}
            title="Turn On Live Payment & Refund Alerts"
            description="Allow browser alerts in Chrome, Edge, or Safari to get notified when orders require Payment Verification, refunds are requested, or Logistics collects final cash payments."
            deniedDescription="To receive live Finance pop-ups in Chrome, Edge, or Safari, allow notifications for this website in your browser address bar settings."
            sampleNotification={{
              title: 'Mega Pacific Finance Alerts Active',
              body: 'You will now receive instant alerts for orders needing Payment Verification, refund requests, and completed cash collections.',
              url: '/finance/payments',
              tag: 'megapacific-finance-test'
            }}
            onStatusFeedback={(message, severity) => setPermissionFeedback({ message, severity })}
          />
          <ErrorBoundary>
            <Outlet />
          </ErrorBoundary>
        </div>
      </div>
      {isLogoutOpen && (
        <LogoutConfirmModal
          onClose={() => setIsLogoutOpen(false)}
          onConfirm={() => {
            setIsLogoutOpen(false);
            logout();
            navigate('/finance-1megapacific/login', { replace: true });
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

export default FinanceLayout;
