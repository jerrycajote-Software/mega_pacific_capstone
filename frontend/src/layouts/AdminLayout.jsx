import React from 'react';
import { NavLink, Link, Outlet, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  Package,
  ShoppingCart,
  LogOut,
  Settings,
  Users,
  Bell,
  Search,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const navItems = [
  { name: 'Dashboard', path: '/admin/dashboard', icon: <LayoutDashboard size={20} /> },
  { name: 'Inventory',  path: '/admin/inventory',  icon: <Package size={20} /> },
  { name: 'Orders',     path: '/admin/orders',     icon: <ShoppingCart size={20} /> },
  { name: 'Users',      path: '/admin/users',      icon: <Users size={20} /> },
  { name: 'Settings',   path: '/admin/settings',   icon: <Settings size={20} /> },
];

const AdminLayout = () => {
  const { logout, user } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    if (window.confirm('Are you sure you want to log out?')) {
      logout();
      navigate('/admin/login');
    }
  };

  return (
    <div className="admin-shell">

     

      <div className="admin-main">

        {/* Sticky top bar */}
        <header className="admin-topbar">
          {/* Brand */}
          <Link to="/admin/dashboard" style={{ textDecoration: 'none', display: 'flex', flexDirection: 'column', justifyContent: 'center', userSelect: 'none' }}>
            <div style={{ display: 'flex', alignItems: 'center', fontFamily: 'Arial, sans-serif', fontWeight: 900, fontSize: '28px', letterSpacing: '0.05em', lineHeight: 1 }}>
              <span style={{ color: '#111b2e', WebkitTextStroke: '1px #3a4fd4' }}>MEGA</span>
              <span style={{ color: '#111b2e', WebkitTextStroke: '1px #5b6ee8' }}>PACIFIC</span>
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

              {/* <div style={{ color: '#7a90e8', fontSize: '10px', fontWeight: 800, letterSpacing: '0.2em', marginTop: '4px', fontFamily: 'Arial, sans-serif' }}>
              ADMIN PORTAL
            </div> */}
          </Link>

          {/* Search */}
          {/* <div style={{ position: 'relative', flex: 1, maxWidth: 420 }}>
            <Search size={15} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: '#6b7280' }} />
            <input
              type="text"
              placeholder="Quick search…"
              style={{
                width: '100%',
                background: '#1a1a1a',
                border: '1px solid #2e2e2e',
                borderRadius: 10,
                padding: '8px 12px 8px 36px',
                color: '#f0f0f0',
                fontSize: '0.875rem',
                outline: 'none',
              }}
            />
          </div> */}

          {/* Right actions */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <button style={{
              position: 'relative', background: 'none', border: 'none', cursor: 'pointer',
              color: '#9ca3af', padding: 8, borderRadius: 8,
            }}>
              {/* <Bell size={20} />
              <span style={{
                position: 'absolute', top: 8, right: 8, height: 6, width: 6,
                background: '#22c55e', borderRadius: '50%',
              }} /> */}
            </button>
            {/* <div style={{
              height: 36, width: 36, borderRadius: '50%',
              background: 'rgba(34,197,94,0.15)',
              border: '1px solid rgba(34,197,94,0.3)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: '#4ade80', fontWeight: 700, fontSize: '0.9rem', userSelect: 'none',
            }}>
              {user?.name?.charAt(0)?.toUpperCase() || 'A'}
            </div> */}
          </div>
        </header>

        {/* Page content */}
        <div className="admin-content">
          <Outlet />
        </div>
      </div>

      

      <aside className="admin-sidebar">

        {/* Sidebar header — user info */}
        <div style={{ padding: '1.25rem 1.25rem 1rem', borderBottom: '1px solid #222' }}>
          {/* <div style={{ fontSize: '0.65rem', color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 6 }}>
            Signed in as
          </div> */}
          <div style={{ fontWeight: 600, fontSize: '0.9rem', color: '#e5e7eb', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
            {user?.name || 'Administrator'}
          </div>
          <div style={{ fontSize: '0.7rem', color: '#6b7280', marginTop: 2, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
            {user?.email || 'admin@megapacific.com'}
          </div>
          {/* <div style={{
            display: 'inline-flex', alignItems: 'center', gap: 5, marginTop: 8,
            fontSize: '0.68rem', color: '#4ade80',
            background: 'rgba(34,197,94,0.08)', border: '1px solid rgba(36, 94, 57, 0.2)',
            borderRadius: 9999, padding: '2px 8px',
          }}>
            <span style={{ height: 6, width: 6, borderRadius: '50%', background: '#22c55e', display: 'inline-block', animation: 'pulse 2s infinite' }} />
            Online
          </div> */}
        </div>

        
        <div style={{ padding: '1rem 1.25rem 0.5rem', fontSize: '0.65rem', color: '#4b5563', textTransform: 'uppercase', letterSpacing: '0.1em', fontWeight: 600 }}>
          Navigation
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

        
        <div style={{ padding: '1rem', borderTop: '1px solid #222', marginTop: 'auto' }}>
          <button
            onClick={handleLogout}
            style={{
              display: 'flex', alignItems: 'center', gap: 12,
              padding: '0.75rem 1rem', width: '100%', borderRadius: 12,
              background: 'none', border: '1px solid transparent', cursor: 'pointer',
              color: '#9ca3af', fontSize: '0.875rem', fontWeight: 500, transition: 'all 0.18s',
            }}
            onMouseEnter={e => {
              e.currentTarget.style.background = 'rgba(239,68,68,0.08)';
              e.currentTarget.style.color = '#f87171';
              e.currentTarget.style.borderColor = 'rgba(239,68,68,0.2)';
            }}
            onMouseLeave={e => {
              e.currentTarget.style.background = 'none';
              e.currentTarget.style.color = '#9ca3af';
              e.currentTarget.style.borderColor = 'transparent';
            }}
          >
            <LogOut size={18} />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>
    </div>
  );
};

export default AdminLayout;
