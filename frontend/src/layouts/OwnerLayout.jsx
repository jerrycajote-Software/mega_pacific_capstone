import React, { useState } from 'react';
import { NavLink, Link, Outlet, useNavigate, useLocation } from 'react-router-dom';
import LogoutIcon from '@mui/icons-material/Logout';
import { CustomDashboardIcon, CustomNavToggleIcon } from '../components/icons';
import { Tooltip } from '@mui/material';
import { useAuth } from '../context/AuthContext';
import { useAdminTheme } from '../context/ThemeContext';
import ThemeSwitcher from '../components/ThemeSwitcher';
import LogoutConfirmModal from '../components/LogoutConfirmModal';
import { usePreventBackToLogin } from '../hooks/usePreventBackToLogin';

const navItems = [
  { name: 'Dashboard',  path: '/owner/dashboard',  icon: <CustomDashboardIcon size={20} /> },
];

const OwnerLayout = () => {
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
      <aside className={`admin-sidebar owner-sidebar ${isSidebarCollapsed ? 'collapsed' : ''}`}>
        <div className="sidebar-header-box">
          <div className="sidebar-header-content">
            <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 4, fontWeight: 600 }}>
              Owner
            </div>
            <div style={{ fontWeight: 600, fontSize: '0.9rem', color: '#f59e0b', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
              {user?.name || 'Owner'}
            </div>
            <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: 2, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
              {user?.email || 'owner@megapacific.com'}
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
                      background: 'linear-gradient(90deg, rgba(245, 158, 11, 0.32) 0%, rgba(217, 119, 6, 0.18) 60%, rgba(245, 158, 11, 0.08) 100%)',
                      color: '#ffffff',
                      border: '1.5px solid rgba(251, 191, 36, 0.75)',
                      boxShadow: '0 4px 18px rgba(245, 158, 11, 0.35)',
                      fontWeight: 700,
                    } : {
                      background: '#fef3c7',
                      color: '#92400e',
                      border: '1.5px solid #f59e0b',
                      boxShadow: '0 4px 14px rgba(245, 158, 11, 0.28)',
                      fontWeight: 700,
                    };
                  }}
                >
                  <span className="nav-icon" style={{ color: 'inherit' }}>{item.icon}</span>
                  <span
                    className="sidebar-nav-label"
                    style={isTabActive ? { fontWeight: 750, color: isDark ? '#ffffff' : '#92400e' } : undefined}
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
          <Link to="/owner/dashboard" style={{ textDecoration: 'none', display: 'flex', flexDirection: 'column', justifyContent: 'center', userSelect: 'none' }}>
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
            navigate('/owner-1megapacific/login', { replace: true });
          }}
        />
      )}
    </div>
  );
};

export default OwnerLayout;
