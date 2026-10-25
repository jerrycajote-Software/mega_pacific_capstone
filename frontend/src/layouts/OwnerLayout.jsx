import React, { useState } from 'react';
import { NavLink, Link, Outlet, useNavigate } from 'react-router-dom';
import DashboardIcon from '@mui/icons-material/Dashboard';
import LogoutIcon from '@mui/icons-material/Logout';
import MenuOpenIcon from '@mui/icons-material/MenuOpen';
import { Tooltip } from '@mui/material';
import { useAuth } from '../context/AuthContext';
import ThemeSwitcher from '../components/ThemeSwitcher';
import LogoutConfirmModal from '../components/LogoutConfirmModal';
import { usePreventBackToLogin } from '../hooks/usePreventBackToLogin';

const navItems = [
  { name: 'Dashboard',  path: '/owner/dashboard',  icon: <DashboardIcon sx={{ fontSize: 18 }} /> },
];

const OwnerLayout = () => {
  usePreventBackToLogin();
  const { logout, user } = useAuth();
  const navigate = useNavigate();
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

  return (
    <div className="admin-shell">
      <aside className={`admin-sidebar ${isSidebarCollapsed ? 'collapsed' : ''}`} style={{ borderRightColor: 'rgba(245,158,11,0.2)' }}>
        {/* Sidebar header — user info */}
        <div
          className="sidebar-header-box"
          style={{
            padding: isSidebarCollapsed ? '1.25rem 0.5rem 1rem' : '1.25rem 1.25rem 1rem',
            borderBottom: '1px solid var(--border-light)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: isSidebarCollapsed ? 'center' : 'space-between',
            gap: '0.75rem',
            transition: 'all 0.28s ease',
          }}
        >
          <div className="sidebar-full-content" style={{ minWidth: 0, flex: 1 }}>
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
              onClick={handleToggleSidebarNavigation}
              aria-label={isSidebarCollapsed ? "Expand Navigation" : "Hide Navigation"}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: 32,
                height: 32,
                borderRadius: 8,
                background: 'transparent',
                border: '1px solid var(--border-light)',
                color: 'var(--text-muted)',
                cursor: 'pointer',
                flexShrink: 0,
                transition: 'all 0.18s ease',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = 'rgba(245, 158, 11, 0.1)';
                e.currentTarget.style.color = '#f59e0b';
                e.currentTarget.style.borderColor = 'rgba(245, 158, 11, 0.3)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'transparent';
                e.currentTarget.style.color = 'var(--text-muted)';
                e.currentTarget.style.borderColor = 'var(--border-light)';
              }}
            >
              <MenuOpenIcon sx={{ fontSize: 19, transform: isSidebarCollapsed ? 'rotate(180deg)' : 'none', transition: 'transform 0.28s ease' }} />
            </button>
          </Tooltip>
        </div>

        <div className="sidebar-full-content" style={{ padding: '1rem 1.25rem 0.5rem', fontSize: '0.65rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.1em', fontWeight: 600 }}>
          Navigation
        </div>

        <nav style={{ padding: isSidebarCollapsed ? '0 0.5rem' : '0 0.75rem', flex: 1, display: 'flex', flexDirection: 'column', gap: 4 }}>
          {navItems.map((item) => (
            <Tooltip key={item.name} title={item.name} placement="right" arrow disableHoverListener={!isSidebarCollapsed}>
              <NavLink
                to={item.path}
                className={({ isActive }) => `nav-link${isActive ? ' active' : ''}`}
                style={{
                  justifyContent: isSidebarCollapsed ? 'center' : 'flex-start',
                  padding: isSidebarCollapsed ? '0.75rem 0' : '0.75rem 1rem',
                }}
              >
                <span className="nav-icon" style={{ flexShrink: 0, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', color: 'inherit' }}>{item.icon}</span>
                <span className="sidebar-full-content">{item.name}</span>
              </NavLink>
            </Tooltip>
          ))}
        </nav>

        <div style={{ padding: isSidebarCollapsed ? '1rem 0.5rem' : '1rem', borderTop: '1px solid var(--border-light)', marginTop: 'auto' }}>
          <Tooltip title="Sign Out" placement="right" arrow disableHoverListener={!isSidebarCollapsed}>
            <button
              onClick={handleLogout}
              className="sidebar-signout-btn"
              style={{
                display: 'flex', alignItems: 'center',
                justifyContent: isSidebarCollapsed ? 'center' : 'flex-start',
                gap: 12,
                padding: isSidebarCollapsed ? '0.75rem 0' : '0.75rem 1rem',
                width: '100%', borderRadius: 12,
                background: 'none', border: '1px solid transparent', cursor: 'pointer',
                color: 'var(--text-muted)', fontSize: '0.875rem', fontWeight: 500, transition: 'all 0.18s',
              }}
              onMouseEnter={e => {
                e.currentTarget.style.background = 'rgba(245,158,11,0.08)';
                e.currentTarget.style.color = '#f59e0b';
                e.currentTarget.style.borderColor = 'rgba(245,158,11,0.2)';
              }}
              onMouseLeave={e => {
                e.currentTarget.style.background = 'none';
                e.currentTarget.style.color = 'var(--text-muted)';
                e.currentTarget.style.borderColor = 'transparent';
              }}
            >
              <LogoutIcon sx={{ fontSize: 18, flexShrink: 0 }} />
              <span className="sidebar-full-content">Sign Out</span>
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
