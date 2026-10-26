import React, { useState } from 'react';

import { NavLink, Link, Outlet, useNavigate, useLocation } from 'react-router-dom';
import LogoutIcon from '@mui/icons-material/Logout';
import {
  CustomDashboardIcon,
  CustomUsersIcon,
  CustomStaffManagementIcon,
  CustomSettingsIcon,
  CustomNavToggleIcon
} from '../components/icons';
import { Tooltip } from '@mui/material';
import { useAuth } from '../context/AuthContext';
import { useAdminTheme } from '../context/ThemeContext';
import ThemeSwitcher from '../components/ThemeSwitcher';
import LogoutConfirmModal from '../components/LogoutConfirmModal';
import { io } from 'socket.io-client';
import { usePreventBackToLogin } from '../hooks/usePreventBackToLogin';

const navItems = [
  { name: 'Dashboard', path: '/admin/dashboard', icon: <CustomDashboardIcon size={20} /> },
  { name: 'Users', path: '/admin/users', icon: <CustomUsersIcon size={20} /> },
  { name: 'Staff Management', path: '/admin/accounts', icon: <CustomStaffManagementIcon size={20} /> },
  { name: 'Settings', path: '/admin/settings', icon: <CustomSettingsIcon size={20} /> },
];

const AdminLayout = () => {
  usePreventBackToLogin();
  const { logout, user } = useAuth();
  const { mode } = useAdminTheme();
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

  React.useEffect(() => {
    if (!user) return;
    const API_URL = import.meta.env.VITE_API_URL || '';
    const socket = io(API_URL, {
      auth: { user }
    });

    socket.emit("join_room", "admin");

    return () => {
      socket.disconnect();
    };
  }, [user]);

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

        <div className="sidebar-header-box">
          <div className="sidebar-header-content">
            <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 4, fontWeight: 600 }}>
              Admin
            </div>
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
                      background: 'linear-gradient(90deg, rgba(34, 197, 94, 0.28) 0%, rgba(16, 185, 129, 0.16) 60%, rgba(34, 197, 94, 0.08) 100%)',
                      color: '#ffffff',
                      border: '1.5px solid rgba(74, 222, 128, 0.65)',
                      boxShadow: '0 4px 20px -2px rgba(34, 197, 94, 0.35)',
                      fontWeight: 700,
                    } : {
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

        <header className="admin-topbar">
          <Link to="/admin/dashboard" style={{ textDecoration: 'none', display: 'flex', flexDirection: 'column', justifyContent: 'center', userSelect: 'none' }}>
            <div style={{ display: 'flex', alignItems: 'center', fontFamily: 'Arial, sans-serif', fontWeight: 900, fontSize: '28px', letterSpacing: '0.05em', lineHeight: 1 }}>
              <span style={{ color: 'var(--text-primary)', WebkitTextStroke: '1px #3a4fd4' }}>MEGA</span>
              <span style={{ color: 'var(--text-primary)', WebkitTextStroke: '1px #5b6ee8' }}>PACIFIC</span>
            </div>
            
            <div style={{
              color: '#7a90e8',
              fontSize: '10px',
              fontWeight: 800,
              letterSpacing: '0.2em',
              marginTop: '4px',
              fontFamily: 'Arial, sans-serif'
            }}>
              METAL AND STEEL CORP
            </div>
          </Link>

          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <ThemeSwitcher />
          </div>
        </header>

        <div className="admin-content">
          <Outlet />
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
    </div>
  );
};

export default AdminLayout;
