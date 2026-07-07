import React, { useState, useEffect } from 'react';
import axios from 'axios';
import SearchIcon from '@mui/icons-material/Search';
import FilterListIcon from '@mui/icons-material/FilterList';
import RefreshIcon from '@mui/icons-material/Refresh';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import AdminPanelSettingsIcon from '@mui/icons-material/AdminPanelSettings';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import BadgeIcon from '@mui/icons-material/Badge';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';
import MailIcon from '@mui/icons-material/Mail';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';

const th = {
  padding: '1rem 1.25rem',
  fontSize: '0.75rem',
  fontWeight: 600,
  letterSpacing: '0.05em',
  textTransform: 'uppercase',
  color: 'var(--text-muted)',
  background: 'rgba(255,255,255,0.02)',
  borderBottom: '1px solid var(--border-light)',
  whiteSpace: 'nowrap'
};

const td = {
  padding: '1rem 1.25rem',
  fontSize: '0.85rem',
  color: 'var(--text-primary)',
  borderBottom: '1px solid var(--border)',
};

const UserManagement = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [spin, setSpin] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterRole, setFilterRole] = useState('All');
  
  
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const fetchUsers = async () => {
    try {
      const token = localStorage.getItem('appToken');
      const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
      const res = await axios.get(`${API_URL}/api/admin/users`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.data.success) {
        setUsers(res.data.data);
      }
    } catch (err) {
      console.error('Failed to fetch users', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const refresh = () => {
    setSpin(true);
    fetchUsers().then(() => setTimeout(() => setSpin(false), 800));
  };

  
  const filteredUsers = users.filter(user => {
    const matchesSearch = 
      user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesFilter = filterRole === 'All' || user.role.toLowerCase() === filterRole.toLowerCase();
    
    return matchesSearch && matchesFilter;
  });

  
  const totalPages = Math.ceil(filteredUsers.length / itemsPerPage);
  const paginatedUsers = filteredUsers.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '60vh', color: '#9ca3af' }}>
        <RefreshIcon sx={{ fontSize: 24, animation: 'spin 1s linear infinite', marginRight: '10px' }} />
        Loading Users...
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', animation: 'fadeIn 0.3s ease' }}>
     
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <h2 style={{ margin: 0, fontSize: '1.75rem', fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '-0.02em' }}>User Management</h2>
          <p style={{ margin: '6px 0 0', fontSize: '0.9rem', color: 'var(--text-muted)' }}>
            Manage registered accounts, roles, and platform access.
          </p>
        </div>
        <button
          onClick={refresh}
          style={{
            display: 'flex', alignItems: 'center', gap: 8, padding: '8px 16px',
            background: 'var(--bg-tertiary)', border: '1px solid var(--border-light)', borderRadius: 10,
            color: 'var(--text-muted)', fontSize: '0.85rem', cursor: 'pointer', transition: 'all 0.2s',
          }}
          onMouseEnter={e => { e.currentTarget.style.borderColor = '#22c55e'; e.currentTarget.style.color = 'var(--text-primary)'; }}
          onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border-light)'; e.currentTarget.style.color = 'var(--text-muted)'; }}
        >
          <RefreshIcon sx={{ fontSize: 15, animation: spin ? 'spin 0.8s linear infinite' : 'none', color: spin ? '#22c55e' : 'inherit' }} />
          Refresh Data
        </button>
      </div>

     
      <div style={{ 
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        background: 'var(--bg-secondary)', padding: '1rem', borderRadius: 16, border: '1px solid var(--border)',
        boxShadow: '0 4px 20px rgba(0,0,0,0.2)'
      }}>
        <div style={{ display: 'flex', gap: '1rem', flex: 1 }}>
          <div style={{ position: 'relative', width: '300px' }}>
            <SearchIcon sx={{ fontSize: 16, color: '#6b7280', position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)' }} />
            <input 
              type="text" 
              placeholder="Search by Name or Email..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{
                width: '100%', background: 'var(--bg-primary)', border: '1px solid var(--border-light)',
                padding: '10px 14px 10px 38px', borderRadius: 10, color: 'var(--text-primary)', fontSize: '0.85rem',
                outline: 'none', transition: 'border-color 0.2s'
              }}
              onFocus={e => e.target.style.borderColor = '#22c55e'}
              onBlur={e => e.target.style.borderColor = 'var(--border-light)'}
            />
          </div>
          
          <div style={{ position: 'relative' }}>
            <FilterListIcon sx={{ fontSize: 14, color: '#6b7280', position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)' }} />
            <select
              value={filterRole}
              onChange={(e) => { setFilterRole(e.target.value); setCurrentPage(1); }}
              style={{
                appearance: 'none', background: 'var(--bg-primary)', border: '1px solid var(--border-light)',
                padding: '10px 32px', borderRadius: 10, color: 'var(--text-primary)', fontSize: '0.85rem',
                outline: 'none', cursor: 'pointer', minWidth: '140px'
              }}
            >
              <option value="All">All Roles</option>
              <option value="customer">Customer</option>
              <option value="employee">Employee</option>
              <option value="admin">Admin</option>
            </select>
          </div>
        </div>
      </div>

     
      <div style={{ background: 'var(--bg-secondary)', borderRadius: 16, border: '1px solid var(--border)', overflowX: 'auto', boxShadow: '0 4px 20px rgba(0,0,0,0.2)' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '800px' }}>
          <thead>
            <tr>
              <th style={th}>User Profile</th>
              <th style={th}>Contact Info</th>
              <th style={th}>Role</th>
              <th style={th}>Status</th>
              <th style={th}>Registration Date</th>
              <th style={{ ...th, textAlign: 'right' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {paginatedUsers.length === 0 ? (
              <tr>
                <td colSpan="6" style={{ padding: '3rem', textAlign: 'center', color: '#6b7280' }}>
                  No users found matching your criteria.
                </td>
              </tr>
            ) : (
              paginatedUsers.map(user => (
                <tr key={user.id} style={{ transition: 'background 0.15s' }}
                  onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.02)'}
                  onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                >
                  <td style={td}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                      {user.avatarUrl ? (
                        <img src={user.avatarUrl} alt={user.name} style={{ width: 40, height: 40, borderRadius: '50%', objectFit: 'cover' }} />
                      ) : (
                        <div style={{
                          width: 40, height: 40, borderRadius: '50%',
                          background: 'linear-gradient(135deg, #3b82f6, #2563eb)',
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          color: '#fff', fontWeight: 700, fontSize: '1.1rem', flexShrink: 0,
                          boxShadow: '0 4px 10px rgba(59,130,246,0.3)'
                        }}>
                          {user.name.charAt(0).toUpperCase()}
                        </div>
                      )}
                      <div>
                        <div style={{ fontWeight: 600, color: 'var(--text-primary)', fontSize: '0.9rem' }}>{user.name}</div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>ID: #{user.id.toString().padStart(4, '0')}</div>
                      </div>
                    </div>
                  </td>
                  <td style={td}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                      <MailIcon sx={{ fontSize: 14 }} />
                      {user.email}
                    </div>
                  </td>
                  <td style={td}>
                    <span className={user.role === 'admin' ? 'badge-amber' : user.role === 'employee' ? 'badge-green' : 'badge-blue'} style={{ display: 'inline-flex', alignItems: 'center', gap: 4, padding: '4px 8px', borderRadius: 99 }}>
                      {user.role === 'admin' ? <AdminPanelSettingsIcon sx={{ fontSize: 12 }} /> : user.role === 'employee' ? <BadgeIcon sx={{ fontSize: 12 }} /> : <AccountCircleIcon sx={{ fontSize: 12 }} />}
                      <span style={{ textTransform: 'capitalize' }}>{user.role}</span>
                    </span>
                  </td>
                  <td style={td}>
                    <span className={user.status === 'active' ? 'badge-green' : 'badge-red'} style={{ display: 'inline-flex', alignItems: 'center', gap: 4, padding: '4px 8px', borderRadius: 99 }}>
                      {user.status === 'active' ? <CheckCircleIcon sx={{ fontSize: 12 }} /> : <CancelIcon sx={{ fontSize: 12 }} />}
                      <span style={{ textTransform: 'capitalize' }}>{user.status}</span>
                    </span>
                  </td>
                  <td style={{ ...td, color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                    {new Date(user.createdAt).toLocaleDateString('en-PH', { month: 'long', day: 'numeric', year: 'numeric' })}
                  </td>
                  <td style={{ ...td, textAlign: 'right' }}>
                    <button 
                      style={{ background: 'transparent', border: 'none', padding: '6px', borderRadius: 6, color: 'var(--text-muted)', cursor: 'pointer', transition: 'all 0.2s' }}
                      onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.05)'; e.currentTarget.style.color = 'var(--text-primary)'; }}
                      onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'var(--text-muted)'; }}
                      title="More Options"
                    >
                      <MoreVertIcon sx={{ fontSize: 16 }} />
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>

       
        {totalPages > 1 && (
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1rem 1.25rem', borderTop: '1px solid var(--border)' }}>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
              Showing {(currentPage - 1) * itemsPerPage + 1} to {Math.min(currentPage * itemsPerPage, filteredUsers.length)} of {filteredUsers.length} entries
            </span>
            <div style={{ display: 'flex', gap: 4 }}>
              <button 
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  background: currentPage === 1 ? 'transparent' : 'var(--bg-tertiary)',
                  border: `1px solid ${currentPage === 1 ? 'var(--border-light)' : 'var(--border)'}`,
                  color: currentPage === 1 ? 'var(--text-muted)' : 'var(--text-primary)',
                  padding: '6px', borderRadius: 6, cursor: currentPage === 1 ? 'not-allowed' : 'pointer'
                }}
              >
                <ChevronLeftIcon sx={{ fontSize: 16 }} />
              </button>
              {Array.from({ length: totalPages }).map((_, idx) => (
                <button
                  key={idx}
                  onClick={() => setCurrentPage(idx + 1)}
                  style={{
                    background: currentPage === idx + 1 ? '#3b82f6' : 'transparent',
                    border: `1px solid ${currentPage === idx + 1 ? '#3b82f6' : '#2e2e2e'}`,
                    color: currentPage === idx + 1 ? '#fff' : '#e5e7eb',
                    fontWeight: currentPage === idx + 1 ? 600 : 400,
                    width: 30, height: 30, borderRadius: 6, cursor: 'pointer',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.8rem'
                  }}
                >
                  {idx + 1}
                </button>
              ))}
              <button 
                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  background: currentPage === totalPages ? 'transparent' : 'var(--bg-tertiary)',
                  border: `1px solid ${currentPage === totalPages ? 'var(--border-light)' : 'var(--border)'}`,
                  color: currentPage === totalPages ? 'var(--text-muted)' : 'var(--text-primary)',
                  padding: '6px', borderRadius: 6, cursor: currentPage === totalPages ? 'not-allowed' : 'pointer'
                }}
              >
                <ChevronRightIcon sx={{ fontSize: 16 }} />
              </button>
            </div>
          </div>
        )}
      </div>

      <style>{`
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
      `}</style>
    </div>
  );
};

export default UserManagement;
