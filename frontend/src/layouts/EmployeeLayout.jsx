import React, { useState } from 'react';
import { NavLink, Link, Outlet, useNavigate } from 'react-router-dom';
import DashboardIcon from '@mui/icons-material/Dashboard';
import Inventory2Icon from '@mui/icons-material/Inventory2';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import WarehouseIcon from '@mui/icons-material/Warehouse';
import SupportAgentIcon from '@mui/icons-material/SupportAgent';
import LogoutIcon from '@mui/icons-material/Logout';
import RateReviewIcon from '@mui/icons-material/RateReview';
import { useAuth } from '../context/AuthContext';
import ThemeSwitcher from '../components/ThemeSwitcher';
import { useAdminTheme } from '../context/ThemeContext';
import LogoutConfirmModal from '../components/LogoutConfirmModal';

const navItems = [
  { name: 'Dashboard',  path: '/employee/dashboard',  icon: <DashboardIcon sx={{ fontSize: 18 }} /> },
  { name: 'Orders',     path: '/employee/orders',      icon: <ShoppingCartIcon sx={{ fontSize: 18 }} /> },
  { name: 'Inventory',  path: '/employee/inventory',   icon: <WarehouseIcon sx={{ fontSize: 18 }} /> },
  { name: 'Reviews',    path: '/employee/reviews',     icon: <RateReviewIcon sx={{ fontSize: 18 }} /> },
  { name: 'Support',    path: '/employee/customer-service', icon: <SupportAgentIcon sx={{ fontSize: 18 }} /> },
];

const EmployeeLayout = () => {
  const { logout, user } = useAuth();
  const navigate = useNavigate();
  const [isLogoutOpen, setIsLogoutOpen] = useState(false);

  const handleLogout = () => {
    setIsLogoutOpen(true);
  };

  return (
    <div className="admin-shell">

      <div className="admin-main">

        {/* Floating top bar */}
        <header className="admin-topbar">
          <Link to="/employee/dashboard" style={{ textDecoration: 'none', display: 'flex', flexDirection: 'column', justifyContent: 'center', userSelect: 'none' }}>
            <div style={{ display: 'flex', alignItems: 'center', fontFamily: 'Arial, sans-serif', fontWeight: 900, fontSize: '28px', letterSpacing: '0.05em', lineHeight: 1 }}>
              <span style={{ color: 'var(--text-primary)', WebkitTextStroke: '1px #3a4fd4' }}>MEGA</span>
              <span style={{ color: 'var(--text-primary)', WebkitTextStroke: '1px #5b6ee8' }}>PACIFIC</span>
            </div>
            <div style={{ color: '#7a90e8', fontSize: '10px', fontWeight: 800, letterSpacing: '0.2em', marginTop: '4px', fontFamily: 'Arial, sans-serif' }}>
              EMPLOYEE PORTAL
            </div>
          </Link>

          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <ThemeSwitcher />
          </div>
        </header>

        {/* Page content */}
        <div className="admin-content">
          <Outlet />
        </div>
      </div>

      <aside className="admin-sidebar">

        {/* User info */}
        <div style={{ padding: '1.25rem 1.25rem 1rem', borderBottom: '1px solid var(--border-light)' }}>
          <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 4, fontWeight: 600 }}>
            Employee
          </div>
          <div style={{ fontWeight: 600, fontSize: '0.9rem', color: 'var(--text-primary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
            {user?.name || 'Employee'}
          </div>
          <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: 2, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
            {user?.email}
          </div>
        </div>

        <div style={{ padding: '1rem 1.25rem 0.5rem', fontSize: '0.65rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.1em', fontWeight: 600 }}>
          Operations
        </div>

        <nav style={{ padding: '0 0.75rem', flex: 1, display: 'flex', flexDirection: 'column', gap: 4 }}>
          {navItems.map((item) => (
            <NavLink
              key={item.name}
              to={item.path}
              className={({ isActive }) => `nav-link${isActive ? ' active' : ''}`}
            >
              <span style={{ flexShrink: 0 }}>{item.icon}</span>
              <span>{item.name}</span>
            </NavLink>
          ))}
        </nav>

        <div style={{ padding: '1rem', borderTop: '1px solid var(--border-light)', marginTop: 'auto' }}>
          <button
            onClick={handleLogout}
            style={{
              display: 'flex', alignItems: 'center', gap: 12,
              padding: '0.75rem 1rem', width: '100%', borderRadius: 12,
              background: 'none', border: '1px solid transparent', cursor: 'pointer',
              color: 'var(--text-muted)', fontSize: '0.875rem', fontWeight: 500, transition: 'all 0.18s',
            }}
            onMouseEnter={e => {
              e.currentTarget.style.background = 'rgba(239,68,68,0.08)';
              e.currentTarget.style.color = '#f87171';
              e.currentTarget.style.borderColor = 'rgba(239,68,68,0.2)';
            }}
            onMouseLeave={e => {
              e.currentTarget.style.background = 'none';
              e.currentTarget.style.color = 'var(--text-muted)';
              e.currentTarget.style.borderColor = 'transparent';
            }}
          >
            <LogoutIcon sx={{ fontSize: 18 }} />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>
      {isLogoutOpen && (
        <LogoutConfirmModal
          onClose={() => setIsLogoutOpen(false)}
          onConfirm={() => {
            setIsLogoutOpen(false);
            logout();
            navigate('/employee/login');
          }}
        />
      )}
    </div>
  );
};

export default EmployeeLayout;
