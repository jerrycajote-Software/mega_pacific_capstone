import React, { useState, useCallback, useMemo } from 'react';
import axios from 'axios';
import { NavLink, Link, Outlet, useNavigate, useLocation } from 'react-router-dom';
import {
  CustomDashboardIcon,
  CustomPreOrderIcon,
  CustomOrdersIcon,
  CustomRecentOrdersIcon,
  CustomReviewsIcon,
  CustomSupportIcon,
  CustomSalesTargetIcon,
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
import ErrorBoundary from '../components/ErrorBoundary';

// Sales portal sidebar navigation items including the dedicated Business Sales Target view
const navItems = [
  { name: 'Dashboard',             path: '/sales/dashboard',          icon: <CustomDashboardIcon size={20} /> },
  { name: 'Pre-Order Products',    path: '/sales/pre-order-products', icon: <CustomPreOrderIcon size={20} /> },
  { name: 'Orders',                path: '/sales/orders',             icon: <CustomOrdersIcon size={20} /> },
  { name: 'Recent Orders',         path: '/sales/recent-orders',      icon: <CustomRecentOrdersIcon size={20} /> },
  { name: 'Reviews',               path: '/sales/reviews',            icon: <CustomReviewsIcon size={20} /> },
  { name: 'Support',               path: '/sales/customer-service',   icon: <CustomSupportIcon size={20} /> },
  { name: 'Business Sales Target', path: '/sales/sales-target',       icon: <CustomSalesTargetIcon size={20} /> },
];

const SalesLayout = () => {
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

  // Remind Sales staff about pending customer orders, open support messages, and low pre-order stock
  const fetchSalesReminders = useCallback(async () => {
    const token = localStorage.getItem('appToken');
    if (!token) return null;
    const API_URL = import.meta.env.VITE_API_URL || '';
    const headers = { Authorization: `Bearer ${token}` };

    const [ordersRes, inquiriesRes, dashboardRes] = await Promise.allSettled([
      axios.get(`${API_URL}/api/sales/orders`, { headers }),
      axios.get(`${API_URL}/api/inquiries`, { headers }),
      axios.get(`${API_URL}/api/sales/dashboard`, { headers })
    ]);

    const orders = ordersRes.status === 'fulfilled' ? (ordersRes.value.data?.data || []) : [];
    const inquiries = inquiriesRes.status === 'fulfilled' && Array.isArray(inquiriesRes.value.data)
      ? inquiriesRes.value.data
      : [];
    const dashboardData = dashboardRes.status === 'fulfilled' ? (dashboardRes.value.data?.data || {}) : {};

    const pendingOrdersCount = orders.filter((o) => o.orderStatus === 'pending').length;
    const openInquiriesCount = inquiries.filter(
      (inq) => !['resolved', 'closed'].includes(String(inq.status || '').toLowerCase())
    ).length;
    const lowStockCount = Number(dashboardData?.lowStockCount || 0);

    const parts = [];
    if (pendingOrdersCount > 0) parts.push(`${pendingOrdersCount} pending order(s) needing approval`);
    if (openInquiriesCount > 0) parts.push(`${openInquiriesCount} open customer support inquiry(ies)`);
    if (lowStockCount > 0) parts.push(`${lowStockCount} low-stock product(s)`);

    if (parts.length === 0) return null;

    let targetUrl = '/sales/orders';
    let actionLabel = 'Review Orders';
    if (pendingOrdersCount === 0 && openInquiriesCount > 0) {
      targetUrl = '/sales/customer-service';
      actionLabel = 'Open Support';
    } else if (pendingOrdersCount === 0 && openInquiriesCount === 0 && lowStockCount > 0) {
      targetUrl = '/sales/pre-order-products';
      actionLabel = 'Check Products';
    }

    return {
      title: 'Sales Reminder',
      body: `Needs attention: ${parts.join(', ')}.`,
      severity: pendingOrdersCount > 0 || openInquiriesCount > 0 ? 'warning' : 'info',
      url: targetUrl,
      actionLabel,
      tag: 'sales-session-reminder'
    };
  }, []);

  const salesExtraEvents = useMemo(() => ({
    new_inquiry: (inquiry) => ({
      title: 'New Customer Inquiry',
      body: `${inquiry?.customer?.customerProfile?.name || 'A customer'} started a new support inquiry.`,
      severity: 'info',
      url: '/sales/customer-service',
      actionLabel: 'Open Support',
      tag: `sales-new-inquiry-${inquiry?.id || Date.now()}`
    }),
    inquiry_updated: (data) => {
      if (data?.message?.sender?.role !== 'customer') return null;
      return {
        title: 'New Customer Message',
        body: 'A customer replied in Customer Support.',
        severity: 'info',
        url: '/sales/customer-service',
        actionLabel: 'Reply Now',
        tag: `sales-inquiry-reply-${data?.inquiryId || Date.now()}`
      };
    },
    sales_quota_updated: (payload) => ({
      title: 'Sales Quota Target Updated',
      body: payload?.message || 'The Business Owner has updated the Sales Quota Target.',
      severity: 'success',
      url: '/sales/sales-target',
      actionLabel: 'View Target',
      tag: 'sales-quota-updated'
    })
  }), []);

  const {
    activeNotification,
    permissionFeedback,
    setPermissionFeedback,
    handleCloseNotification,
    handleClosePermissionFeedback
  } = usePortalNotificationManager({
    user,
    rooms: ['sales', 'saless'],
    primaryEvent: 'sales_notification',
    extraEvents: salesExtraEvents,
    reminderStorageKey: user?.id ? `megapacific_sales_reminded_${user.id}` : null,
    fetchPendingReminder: fetchSalesReminders
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
    if (targetPath === '/sales/pre-order-products' && currentPath === '/sales/inventory') {
      return true;
    }
    return false;
  };

  return (
    <div className="admin-shell">

      <aside className={`admin-sidebar ${isSidebarCollapsed ? 'collapsed' : ''}`}>

        <div className="sidebar-brand-box">
          <Tooltip title="Mega Pacific Sales Dashboard" placement="right" arrow disableHoverListener={!isSidebarCollapsed}>
            <Link to="/sales/dashboard" className="sidebar-brand-link">
              <div className="sidebar-brand-full">
                <div style={{ display: 'flex', alignItems: 'center', fontFamily: 'Arial, sans-serif', fontWeight: 900, fontSize: '20px', letterSpacing: '0.04em', lineHeight: 1 }}>
                  <span style={{ color: 'var(--text-primary)', WebkitTextStroke: '1px #3a4fd4' }}>MEGA</span>
                  <span style={{ color: 'var(--text-primary)', WebkitTextStroke: '1px #5b6ee8' }}>PACIFIC</span>
                </div>
                <div style={{ color: '#7a90e8', fontSize: '9px', fontWeight: 800, letterSpacing: '0.18em', marginTop: '4px', fontFamily: 'Arial, sans-serif' }}>
                  SALES DASHBOARD
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
              {user?.name || 'Sales'}
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
            bannerKey="megapacific_sales_banner_dismissed"
            sx={{ mx: { xs: 2, md: 5 }, mt: 2, mb: 0 }}
            title="Turn On Live Sales Order & Customer Alerts"
            description="Allow browser alerts in Chrome, Edge, or Safari to get instant reminders for new orders needing approval, customer messages, product reviews, and sales target updates."
            deniedDescription="To receive live Sales pop-ups in Chrome, Edge, or Safari, allow notifications for this website in your browser address bar settings."
            sampleNotification={{
              title: 'Mega Pacific Sales Alerts Active',
              body: 'You will now receive instant alerts for new orders needing approval, customer support messages, product reviews, and target updates.',
              url: '/sales/orders',
              tag: 'megapacific-sales-test'
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
            navigate('/sales-1megapacific/login', { replace: true });
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

export default SalesLayout;
