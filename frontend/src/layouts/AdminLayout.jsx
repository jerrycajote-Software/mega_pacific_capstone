import React, { useState, useCallback, useMemo, useEffect } from 'react';
import axios from 'axios';

import { NavLink, Link, Outlet, useNavigate, useLocation } from 'react-router-dom';
import {
  CustomDashboardIcon,
  CustomUsersIcon,
  CustomStaffManagementIcon,
  CustomSupportIcon,
  CustomAdminSecurityFlagsIcon,
  CustomSettingsIcon,
  CustomNavToggleIcon,
  CustomLogoutIcon as LogoutIcon,
  CustomLightModeIcon as LightModeIcon,
  CustomDarkModeIcon as DarkModeIcon
} from '../components/icons';
import { Tooltip } from '@mui/material';
import { useAuth } from '../context/AuthContext';
import { useAdminTheme } from '../context/ThemeContext';
import LogoutConfirmModal from '../components/LogoutConfirmModal';
import ErrorBoundary from '../components/ErrorBoundary';
import NotificationPermissionBanner from '../components/NotificationPermissionBanner';
import PortalNotificationAlerts from '../components/PortalNotificationAlerts';
import { usePortalNotificationManager } from '../hooks/usePortalNotificationManager';
import { usePreventBackToLogin } from '../hooks/usePreventBackToLogin';

const navItems = [
  { name: 'Dashboard', path: '/admin/dashboard', icon: <CustomDashboardIcon size={20} /> },
  { name: 'Users', path: '/admin/users', icon: <CustomUsersIcon size={20} /> },
  { name: 'Staff Management', path: '/admin/accounts', icon: <CustomStaffManagementIcon size={20} /> },
  { name: 'Staff Messages', path: '/admin/staff-messages', icon: <CustomSupportIcon size={20} /> },
  { name: 'Error Reports', path: '/admin/error-reports', icon: <CustomAdminSecurityFlagsIcon size={20} /> },
  { name: 'Settings', path: '/admin/settings', icon: <CustomSettingsIcon size={20} /> },
];

const AdminLayout = () => {
  usePreventBackToLogin();
  const { logout, user } = useAuth();
  const { mode, toggleTheme } = useAdminTheme();
  const isDark = mode === 'dark';
  const navigate = useNavigate();
  const location = useLocation();
  const [isLogoutOpen, setIsLogoutOpen] = useState(false);
  const [openErrorReportsCount, setOpenErrorReportsCount] = useState(0);
  const [pendingDeletionRequestsCount, setPendingDeletionRequestsCount] = useState(0);
  const [unreadStaffMessagesCount, setUnreadStaffMessagesCount] = useState(0);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(() => {
    return localStorage.getItem('mega_admin_sidebar_collapsed') === 'true';
  });

  const fetchOpenErrorReportsCount = useCallback(async () => {
    try {
      const token = localStorage.getItem('appToken');
      if (!token) return 0;
      const API_URL = import.meta.env.VITE_API_URL || '';
      const res = await axios.get(`${API_URL}/api/admin/error-reports?status=open`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const count = res.data?.summary?.open || 0;
      setOpenErrorReportsCount(count);
      return count;
    } catch {
      return 0;
    }
  }, []);

  const fetchPendingDeletionRequestsCount = useCallback(async () => {
    try {
      const token = localStorage.getItem('appToken');
      if (!token) return 0;
      const API_URL = import.meta.env.VITE_API_URL || '';
      const res = await axios.get(`${API_URL}/api/admin/account-deletion-requests?status=pending`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const count = res.data?.summary?.pending || 0;
      setPendingDeletionRequestsCount(count);
      return count;
    } catch {
      return 0;
    }
  }, []);

  const fetchUnreadStaffMessagesCount = useCallback(async () => {
    try {
      const token = localStorage.getItem('appToken');
      if (!token) return 0;
      const API_URL = import.meta.env.VITE_API_URL || '';
      const res = await axios.get(`${API_URL}/api/staff-support/unread-summary`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const count = res.data?.data?.unreadMessages || 0;
      setUnreadStaffMessagesCount(count);
      return count;
    } catch {
      return 0;
    }
  }, []);

  const handleToggleSidebarNavigation = () => {
    setIsSidebarCollapsed((prev) => {
      const nextState = !prev;
      localStorage.setItem('mega_admin_sidebar_collapsed', String(nextState));
      return nextState;
    });
  };

  // Load initial sidebar badge counts when Admin signs in
  useEffect(() => {
    if (!user?.id) return;
    fetchOpenErrorReportsCount();
    fetchPendingDeletionRequestsCount();
    fetchUnreadStaffMessagesCount();
  }, [user?.id, fetchOpenErrorReportsCount, fetchPendingDeletionRequestsCount, fetchUnreadStaffMessagesCount]);

  // Remind Admin once per session about unread staff messages, deletion requests, and open error reports
  const fetchAdminReminders = useCallback(async () => {
    const [unreadStaff, pendingDeletions, openErrors] = await Promise.all([
      fetchUnreadStaffMessagesCount(),
      fetchPendingDeletionRequestsCount(),
      fetchOpenErrorReportsCount()
    ]);

    const parts = [];
    if (unreadStaff > 0) {
      parts.push(`${unreadStaff} unread staff ${unreadStaff === 1 ? 'message' : 'messages'}`);
    }
    if (pendingDeletions > 0) {
      parts.push(`${pendingDeletions} account deletion ${pendingDeletions === 1 ? 'request' : 'requests'}`);
    }
    if (openErrors > 0) {
      parts.push(`${openErrors} open error ${openErrors === 1 ? 'report' : 'reports'}`);
    }

    if (parts.length === 0) return null;

    let targetUrl = '/admin/staff-messages';
    let actionLabel = 'Open Staff Messages';
    if (unreadStaff === 0 && pendingDeletions > 0) {
      targetUrl = '/admin/users?tab=deletion-requests';
      actionLabel = 'Review Requests';
    } else if (unreadStaff === 0 && pendingDeletions === 0 && openErrors > 0) {
      targetUrl = '/admin/error-reports';
      actionLabel = 'View Reports';
    }

    return {
      title: 'Admin Action Reminder',
      body: `Needs attention: ${parts.join(', ')}.`,
      severity: openErrors > 0 || pendingDeletions > 0 ? 'warning' : 'info',
      url: targetUrl,
      actionLabel,
      tag: 'admin-session-reminder'
    };
  }, [fetchUnreadStaffMessagesCount, fetchPendingDeletionRequestsCount, fetchOpenErrorReportsCount]);

  // Map incoming Admin Socket.IO events to browser desktop alerts, in-app Snackbars, and badge updates
  const adminExtraEvents = useMemo(() => ({
    admin_staff_support_created: (payload) => {
      fetchUnreadStaffMessagesCount();
      if (!payload?.thread) return null;
      return {
        title: payload.title || 'New Staff Message',
        body: payload.body || payload.thread.subject,
        severity: payload.severity || 'warning',
        url: payload.url || `/admin/staff-messages?threadId=${payload.thread.id}`,
        actionLabel: 'Open Chat',
        tag: `admin-staff-thread-${payload.thread.id}`
      };
    },
    admin_staff_support_updated: (payload) => {
      fetchUnreadStaffMessagesCount();
      if (!payload?.isNewStaffMessage || !payload?.thread) return null;
      return {
        title: payload.title || 'New Staff Reply',
        body: payload.body || payload.thread.subject,
        severity: 'info',
        url: payload.url || `/admin/staff-messages?threadId=${payload.thread.id}`,
        actionLabel: 'Open Chat',
        tag: `admin-staff-reply-${payload.thread.id}-${payload.message?.id || Date.now()}`
      };
    },
    admin_deletion_request_created: (payload) => {
      fetchPendingDeletionRequestsCount();
      const request = payload?.request;
      if (!request) return null;
      const customerLabel = request.customerName || request.customerEmail || 'A customer';
      return {
        title: 'New Account Deletion Request',
        body: `${customerLabel} requested account deletion and is waiting for your review.`,
        severity: 'warning',
        url: '/admin/users?tab=deletion-requests',
        actionLabel: 'Review Request',
        tag: `admin-deletion-request-${request.id || Date.now()}`
      };
    },
    admin_deletion_request_updated: () => {
      fetchPendingDeletionRequestsCount();
      return null;
    },
    admin_error_report_created: (payload) => {
      fetchOpenErrorReportsCount();
      const report = payload?.report;
      if (!report) return null;
      return {
        title: `New Error Report (${report.traceId || 'Trace'})`,
        body: `Reported from the ${report.portal || 'user'} portal by ${report.reporterName || report.reporterRole || 'a user'}.`,
        severity: 'error',
        url: '/admin/error-reports',
        actionLabel: 'View Report',
        tag: `admin-error-report-${report.id || Date.now()}`
      };
    },
    admin_error_report_updated: () => {
      fetchOpenErrorReportsCount();
      return null;
    }
  }), [fetchUnreadStaffMessagesCount, fetchPendingDeletionRequestsCount, fetchOpenErrorReportsCount]);

  const {
    activeNotification,
    permissionFeedback,
    setPermissionFeedback,
    handleCloseNotification,
    handleClosePermissionFeedback
  } = usePortalNotificationManager({
    user,
    rooms: ['admin'],
    primaryEvent: 'admin_notification',
    extraEvents: adminExtraEvents,
    reminderStorageKey: user?.id ? `megapacific_admin_reminded_${user.id}` : null,
    fetchPendingReminder: fetchAdminReminders
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
    if (targetPath === '/admin/accounts' && (currentPath === '/admin/staff' || currentPath === '/admin/sales-management')) {
      return true;
    }
    return false;
  };

  return (
    <div className="admin-shell">

      <aside className={`admin-sidebar ${isSidebarCollapsed ? 'collapsed' : ''}`}>

        <div className="sidebar-brand-box">
          <Tooltip title="Mega Pacific Admin Dashboard" placement="right" arrow disableHoverListener={!isSidebarCollapsed}>
            <Link to="/admin/dashboard" className="sidebar-brand-link">
              <div className="sidebar-brand-full">
                <div style={{ display: 'flex', alignItems: 'center', fontFamily: 'Arial, sans-serif', fontWeight: 900, fontSize: '20px', letterSpacing: '0.04em', lineHeight: 1 }}>
                  <span style={{ color: 'var(--text-primary)', WebkitTextStroke: '1px #3a4fd4' }}>MEGA</span>
                  <span style={{ color: 'var(--text-primary)', WebkitTextStroke: '1px #5b6ee8' }}>PACIFIC</span>
                </div>
                <div style={{ color: '#7a90e8', fontSize: '9px', fontWeight: 800, letterSpacing: '0.18em', marginTop: '4px', fontFamily: 'Arial, sans-serif' }}>
                  ADMIN DASHBOARD
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
            {/* <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 4, fontWeight: 600 }}>
              Admin
            </div> */}
            <div style={{ fontWeight: 600, fontSize: '0.9rem', color: 'var(--text-primary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
              {user?.name || 'Administrator'}
            </div>
            <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: 2, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
              {user?.email || 'admin@megapacific.com'}
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
          Navigation
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
                  {item.path === '/admin/users' && pendingDeletionRequestsCount > 0 && (
                    <span
                      style={{
                        marginLeft: 'auto',
                        minWidth: 20,
                        height: 20,
                        padding: '0 6px',
                        borderRadius: 999,
                        background: '#ef4444',
                        color: '#ffffff',
                        fontSize: '0.7rem',
                        fontWeight: 800,
                        display: 'inline-flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                      }}
                    >
                      {pendingDeletionRequestsCount > 99 ? '99+' : pendingDeletionRequestsCount}
                    </span>
                  )}
                  {item.path === '/admin/staff-messages' && unreadStaffMessagesCount > 0 && (
                    <span
                      style={{
                        marginLeft: 'auto',
                        minWidth: 20,
                        height: 20,
                        padding: '0 6px',
                        borderRadius: 999,
                        background: '#ef4444',
                        color: '#ffffff',
                        fontSize: '0.7rem',
                        fontWeight: 800,
                        display: 'inline-flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                      }}
                    >
                      {unreadStaffMessagesCount > 99 ? '99+' : unreadStaffMessagesCount}
                    </span>
                  )}
                  {item.path === '/admin/error-reports' && openErrorReportsCount > 0 && (
                    <span
                      style={{
                        marginLeft: 'auto',
                        minWidth: 20,
                        height: 20,
                        padding: '0 6px',
                        borderRadius: 999,
                        background: '#ef4444',
                        color: '#ffffff',
                        fontSize: '0.7rem',
                        fontWeight: 800,
                        display: 'inline-flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                      }}
                    >
                      {openErrorReportsCount > 99 ? '99+' : openErrorReportsCount}
                    </span>
                  )}
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
            bannerKey="megapacific_admin_banner_dismissed"
            sx={{ mx: { xs: 2, md: 5 }, mt: 2, mb: 0 }}
            title="Turn On Live Admin System Alerts"
            description="Allow browser alerts in Chrome, Edge, or Safari to get notified right away when staff send new messages, customers request account deletion, or error reports arrive."
            deniedDescription="To receive live Admin pop-ups in Chrome, Edge, or Safari, allow notifications for this website in your browser address bar settings."
            sampleNotification={{
              title: 'Mega Pacific Admin Alerts Active',
              body: 'You will now receive instant browser alerts for Staff Messages, Account Deletion Requests, and Error Reports.',
              url: '/admin/staff-messages',
              tag: 'megapacific-admin-test'
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
            navigate('/admin-1megapacific/login', { replace: true });
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

export default AdminLayout;
