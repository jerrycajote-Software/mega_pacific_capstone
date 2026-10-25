import React, { useState, useEffect, useMemo } from 'react';
import axios from 'axios';
import SearchIcon from '@mui/icons-material/Search';
import FilterListIcon from '@mui/icons-material/FilterList';
import AdminPanelSettingsIcon from '@mui/icons-material/AdminPanelSettings';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import BadgeIcon from '@mui/icons-material/Badge';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';
import MailIcon from '@mui/icons-material/Mail';
import PhoneIcon from '@mui/icons-material/Phone';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import WarningIcon from '@mui/icons-material/Warning';
import PeopleIcon from '@mui/icons-material/People';
import BlockIcon from '@mui/icons-material/Block';
import CheckIcon from '@mui/icons-material/Check';
import CircularProgress from '@mui/material/CircularProgress';

const th = {
  padding: '0.875rem 1.25rem',
  fontSize: '0.72rem',
  fontWeight: 600,
  letterSpacing: '0.06em',
  textTransform: 'uppercase',
  color: 'var(--text-muted)',
  background: 'rgba(255,255,255,0.02)',
  borderBottom: '1px solid var(--border-light)',
  whiteSpace: 'nowrap'
};

const td = {
  padding: '0.95rem 1.25rem',
  fontSize: '0.85rem',
  color: 'var(--text-primary)',
  borderBottom: '1px solid var(--border-light)',
};

const roleStyles = {
  customer: { label: 'Customer', color: '#3b82f6', bg: 'rgba(59,130,246,0.12)', icon: AccountCircleIcon },
  sales: { label: 'Sales', color: '#10b981', bg: 'rgba(16,185,129,0.12)', icon: BadgeIcon },
  logistic: { label: 'Logistic', color: '#f59e0b', bg: 'rgba(245,158,11,0.12)', icon: BadgeIcon },
  finance: { label: 'Finance', color: '#06b6d4', bg: 'rgba(6,182,212,0.12)', icon: BadgeIcon },
  admin: { label: 'Admin', color: '#6366f1', bg: 'rgba(99,102,241,0.12)', icon: AdminPanelSettingsIcon },
  owner: { label: 'Owner', color: '#8b5cf6', bg: 'rgba(139,92,246,0.12)', icon: AdminPanelSettingsIcon },
};

const UserManagement = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterRole, setFilterRole] = useState('All');
  const [filterStatus, setFilterStatus] = useState('All');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;
  const [confirmModal, setConfirmModal] = useState({ isOpen: false, user: null, actionText: '', newStatus: '' });

  const fetchUsers = async () => {
    try {
      const token = localStorage.getItem('appToken');
      const API_URL = import.meta.env.VITE_API_URL || '';
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
    const syncInterval = setInterval(fetchUsers, 10000);
    const handleFocus = () => fetchUsers();
    window.addEventListener('focus', handleFocus);
    return () => {
      clearInterval(syncInterval);
      window.removeEventListener('focus', handleFocus);
    };
  }, []);

  const handleToggleStatusClick = (user) => {
    const newStatus = user.status === 'active' ? 'suspended' : 'active';
    const actionText = user.status === 'active' ? 'suspend' : 'activate';
    setConfirmModal({ isOpen: true, user, actionText, newStatus });
  };

  const handleConfirmAction = async () => {
    const { user, newStatus } = confirmModal;
    setConfirmModal({ isOpen: false, user: null, actionText: '', newStatus: '' });

    try {
      const token = localStorage.getItem('appToken');
      const API_URL = import.meta.env.VITE_API_URL || '';
      await axios.patch(`${API_URL}/api/admin/users/${user.id}/status`, 
        { status: newStatus },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      fetchUsers();
    } catch (error) {
      console.error('Failed to update user status', error);
    }
  };

  const metrics = useMemo(() => {
    const all = Array.isArray(users) ? users : [];
    return {
      total: all.length,
      customers: all.filter(u => u.role === 'customer').length,
      staff: all.filter(u => u.role !== 'customer').length,
      suspended: all.filter(u => u.status === 'suspended').length
    };
  }, [users]);

  const filteredUsers = useMemo(() => {
    return (Array.isArray(users) ? users : []).filter(user => {
      const name = user?.name || '';
      const email = user?.email || '';
      const phone = user?.contactNumber || '';
      const role = user?.role || '';
      const status = user?.status || '';
      const q = searchTerm.toLowerCase();

      const matchesSearch = 
        !q ||
        name.toLowerCase().includes(q) ||
        email.toLowerCase().includes(q) ||
        phone.includes(q);

      const matchesRole = filterRole === 'All' || role.toLowerCase() === filterRole.toLowerCase();
      const matchesStatus = filterStatus === 'All' || status.toLowerCase() === filterStatus.toLowerCase();

      return matchesSearch && matchesRole && matchesStatus;
    });
  }, [users, searchTerm, filterRole, filterStatus]);

  const totalPages = Math.ceil(filteredUsers.length / itemsPerPage) || 1;
  const paginatedUsers = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredUsers.slice(start, start + itemsPerPage);
  }, [filteredUsers, currentPage, itemsPerPage]);

  if (loading) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '65vh', gap: 16 }}>
        <CircularProgress size={40} sx={{ color: '#4f772d' }} />
        <span style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>Loading customer directory...</span>
      </div>
    );
  }

  return (
    <div style={{ padding: '1.75rem 2rem', maxWidth: 1400, margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {/* Header section */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 16 }}>
        <div>
          <h1 style={{ margin: 0, fontSize: '1.5rem', fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '-0.02em' }}>
            User Management
          </h1>
          <p style={{ margin: '4px 0 0', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
            Oversee registered customer accounts, contact details, role clearances, and access states.
          </p>
        </div>
      </div>

      {/* Metric Cards Bar */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
        gap: '1rem'
      }}>
        <div style={{
          background: 'var(--bg-secondary)',
          border: '1px solid var(--border-light)',
          borderRadius: 14,
          padding: '1.15rem',
          display: 'flex',
          alignItems: 'center',
          gap: 14,
          boxShadow: '0 4px 18px -6px rgba(0,0,0,0.1)'
        }}>
          <div style={{ width: 40, height: 40, borderRadius: 10, background: 'rgba(59,130,246,0.12)', color: '#3b82f6', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <PeopleIcon sx={{ fontSize: 22 }} />
          </div>
          <div>
            <div style={{ fontSize: '1.45rem', fontWeight: 800, color: 'var(--text-primary)', lineHeight: 1.1 }}>{metrics.total}</div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: 2 }}>Total Registered</div>
          </div>
        </div>

        <div style={{
          background: 'var(--bg-secondary)',
          border: '1px solid var(--border-light)',
          borderRadius: 14,
          padding: '1.15rem',
          display: 'flex',
          alignItems: 'center',
          gap: 14,
          boxShadow: '0 4px 18px -6px rgba(0,0,0,0.1)'
        }}>
          <div style={{ width: 40, height: 40, borderRadius: 10, background: 'rgba(16,185,129,0.12)', color: '#10b981', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <AccountCircleIcon sx={{ fontSize: 22 }} />
          </div>
          <div>
            <div style={{ fontSize: '1.45rem', fontWeight: 800, color: 'var(--text-primary)', lineHeight: 1.1 }}>{metrics.customers}</div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: 2 }}>Customer Accounts</div>
          </div>
        </div>

        <div style={{
          background: 'var(--bg-secondary)',
          border: '1px solid var(--border-light)',
          borderRadius: 14,
          padding: '1.15rem',
          display: 'flex',
          alignItems: 'center',
          gap: 14,
          boxShadow: '0 4px 18px -6px rgba(0,0,0,0.1)'
        }}>
          <div style={{ width: 40, height: 40, borderRadius: 10, background: 'rgba(79,119,45,0.15)', color: '#4f772d', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <BadgeIcon sx={{ fontSize: 22 }} />
          </div>
          <div>
            <div style={{ fontSize: '1.45rem', fontWeight: 800, color: 'var(--text-primary)', lineHeight: 1.1 }}>{metrics.staff}</div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: 2 }}>Operational Roles</div>
          </div>
        </div>

        <div style={{
          background: 'var(--bg-secondary)',
          border: '1px solid var(--border-light)',
          borderRadius: 14,
          padding: '1.15rem',
          display: 'flex',
          alignItems: 'center',
          gap: 14,
          boxShadow: '0 4px 18px -6px rgba(0,0,0,0.1)'
        }}>
          <div style={{
            width: 40,
            height: 40,
            borderRadius: 10,
            background: metrics.suspended > 0 ? 'rgba(239,68,68,0.12)' : 'rgba(34,197,94,0.12)',
            color: metrics.suspended > 0 ? '#ef4444' : '#22c55e',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <BlockIcon sx={{ fontSize: 20 }} />
          </div>
          <div>
            <div style={{ fontSize: '1.45rem', fontWeight: 800, color: metrics.suspended > 0 ? '#ef4444' : 'var(--text-primary)', lineHeight: 1.1 }}>
              {metrics.suspended}
            </div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: 2 }}>Suspended Accounts</div>
          </div>
        </div>
      </div>

      {/* Search & Filters Toolbar */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        background: 'var(--bg-secondary)',
        padding: '0.875rem 1.25rem',
        borderRadius: 14,
        border: '1px solid var(--border-light)',
        flexWrap: 'wrap',
        gap: 12
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, flex: 1, minWidth: 280, flexWrap: 'wrap' }}>
          <div style={{ position: 'relative', flex: 1, minWidth: 240, maxWidth: 420 }}>
            <SearchIcon sx={{ fontSize: 18, color: 'var(--text-muted)', position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)' }} />
            <input
              type="text"
              placeholder="Search by name, email, or contact number..."
              value={searchTerm}
              onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
              style={{
                width: '100%',
                background: 'var(--bg-primary)',
                border: '1px solid var(--border-light)',
                padding: '9px 12px 9px 38px',
                borderRadius: 10,
                color: 'var(--text-primary)',
                fontSize: '0.84rem',
                outline: 'none',
                boxSizing: 'border-box'
              }}
            />
          </div>

          <div style={{ position: 'relative' }}>
            <FilterListIcon sx={{ fontSize: 16, color: 'var(--text-muted)', position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)' }} />
            <select
              value={filterRole}
              onChange={(e) => { setFilterRole(e.target.value); setCurrentPage(1); }}
              style={{
                appearance: 'none',
                background: 'var(--bg-primary)',
                border: '1px solid var(--border-light)',
                padding: '9px 32px 9px 34px',
                borderRadius: 10,
                color: 'var(--text-primary)',
                fontSize: '0.82rem',
                fontWeight: 600,
                outline: 'none',
                cursor: 'pointer'
              }}
            >
              <option value="All">All Roles</option>
              <option value="customer">Customer</option>
              <option value="sales">Sales</option>
              <option value="logistic">Logistic</option>
              <option value="finance">Finance</option>
              <option value="admin">Admin</option>
            </select>
          </div>

          <select
            value={filterStatus}
            onChange={(e) => { setFilterStatus(e.target.value); setCurrentPage(1); }}
            style={{
              appearance: 'none',
              background: 'var(--bg-primary)',
              border: '1px solid var(--border-light)',
              padding: '9px 18px',
              borderRadius: 10,
              color: 'var(--text-primary)',
              fontSize: '0.82rem',
              fontWeight: 600,
              outline: 'none',
              cursor: 'pointer'
            }}
          >
            <option value="All">All Statuses</option>
            <option value="active">Active Only</option>
            <option value="suspended">Suspended Only</option>
          </select>
        </div>

        <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
          Showing <strong>{filteredUsers.length}</strong> matching accounts
        </div>
      </div>

      {/* Users Table */}
      <div style={{
        background: 'var(--bg-secondary)',
        borderRadius: 16,
        border: '1px solid var(--border-light)',
        overflow: 'hidden',
        boxShadow: '0 4px 20px -8px rgba(0,0,0,0.1)'
      }}>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead>
              <tr>
                <th style={th}>User Profile</th>
                <th style={th}>Contact Info</th>
                <th style={th}>Registered Location</th>
                <th style={th}>Role</th>
                <th style={th}>Account Status</th>
                <th style={th}>Registered Date</th>
                <th style={{ ...th, textAlign: 'right' }}>Access Control</th>
              </tr>
            </thead>
            <tbody>
              {paginatedUsers.length === 0 ? (
                <tr>
                  <td colSpan="7" style={{ padding: '3.5rem', textAlign: 'center', color: 'var(--text-muted)' }}>
                    No users found matching your search or filters.
                  </td>
                </tr>
              ) : (
                paginatedUsers.map(user => {
                  const roleConfig = roleStyles[user.role?.toLowerCase()] || roleStyles.customer;
                  const RoleIcon = roleConfig.icon;
                  const isActive = user.status === 'active';

                  return (
                    <tr
                      key={user.id}
                      style={{ transition: 'background 0.15s' }}
                      onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.02)'}
                      onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                    >
                      <td style={td}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                          <div style={{
                            width: 36,
                            height: 36,
                            borderRadius: '50%',
                            background: roleConfig.bg,
                            color: roleConfig.color,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontWeight: 800,
                            fontSize: '0.9rem',
                            flexShrink: 0
                          }}>
                            {(user?.name || 'U').charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <div style={{ fontWeight: 700, color: 'var(--text-primary)', fontSize: '0.88rem' }}>
                              {user?.name || 'Unknown'}
                            </div>
                            <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontFamily: 'monospace' }}>
                              ID: #{user?.id?.toString().padStart(4, '0')}
                            </div>
                          </div>
                        </div>
                      </td>

                      <td style={td}>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.82rem', fontFamily: 'monospace', color: 'var(--text-primary)' }}>
                            <MailIcon sx={{ fontSize: 13, color: 'var(--text-muted)' }} />
                            <span>{user?.email || 'N/A'}</span>
                          </div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.78rem', fontFamily: 'monospace', color: user.contactNumber ? '#4f772d' : 'var(--text-muted)' }}>
                            <PhoneIcon sx={{ fontSize: 12, color: 'var(--text-muted)' }} />
                            <span>{user?.contactNumber || 'No phone set'}</span>
                          </div>
                        </div>
                      </td>

                      <td style={td}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                          <LocationOnIcon sx={{ fontSize: 14, color: 'var(--text-muted)' }} />
                          <span>{user?.location || 'CALABARZON, Region IV-A'}</span>
                        </div>
                      </td>

                      <td style={td}>
                        <span style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: 5,
                          padding: '3px 8px',
                          borderRadius: 6,
                          background: roleConfig.bg,
                          color: roleConfig.color,
                          fontSize: '0.74rem',
                          fontWeight: 700
                        }}>
                          <RoleIcon sx={{ fontSize: 13 }} />
                          <span>{roleConfig.label}</span>
                        </span>
                      </td>

                      <td style={td}>
                        <span style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: 5,
                          padding: '3px 8px',
                          borderRadius: 6,
                          background: isActive ? 'rgba(34,197,94,0.12)' : 'rgba(239,68,68,0.12)',
                          color: isActive ? '#22c55e' : '#ef4444',
                          fontSize: '0.74rem',
                          fontWeight: 700
                        }}>
                          <span style={{ width: 6, height: 6, borderRadius: '50%', background: isActive ? '#22c55e' : '#ef4444' }} />
                          <span>{isActive ? 'Active' : 'Suspended'}</span>
                        </span>
                      </td>

                      <td style={{ ...td, color: 'var(--text-muted)', fontSize: '0.8rem', whiteSpace: 'nowrap' }}>
                        {user?.createdAt ? new Date(user.createdAt).toLocaleDateString('en-PH', { month: 'short', day: 'numeric', year: 'numeric' }) : 'N/A'}
                      </td>

                      <td style={{ ...td, textAlign: 'right' }}>
                        <button
                          onClick={() => handleToggleStatusClick(user)}
                          style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: 5,
                            padding: '5px 11px',
                            borderRadius: 8,
                            fontSize: '0.76rem',
                            fontWeight: 700,
                            cursor: 'pointer',
                            transition: 'all 0.18s',
                            border: `1px solid ${isActive ? 'rgba(239,68,68,0.3)' : 'rgba(34,197,94,0.3)'}`,
                            background: isActive ? 'rgba(239,68,68,0.08)' : 'rgba(34,197,94,0.08)',
                            color: isActive ? '#f87171' : '#4ade80'
                          }}
                        >
                          {isActive ? <BlockIcon sx={{ fontSize: 13 }} /> : <CheckIcon sx={{ fontSize: 13 }} />}
                          <span>{isActive ? 'Suspend' : 'Activate'}</span>
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Bar */}
        {totalPages > 1 && (
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            padding: '1rem 1.25rem',
            borderTop: '1px solid var(--border-light)',
            flexWrap: 'wrap',
            gap: 12
          }}>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
              Showing <strong>{(currentPage - 1) * itemsPerPage + 1}</strong> to <strong>{Math.min(currentPage * itemsPerPage, filteredUsers.length)}</strong> of <strong>{filteredUsers.length}</strong> accounts
            </span>
            <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
              <button
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  background: 'var(--bg-primary)',
                  border: '1px solid var(--border-light)',
                  color: currentPage === 1 ? 'var(--text-muted)' : 'var(--text-primary)',
                  padding: '6px',
                  borderRadius: 8,
                  cursor: currentPage === 1 ? 'not-allowed' : 'pointer',
                  opacity: currentPage === 1 ? 0.4 : 1
                }}
              >
                <ChevronLeftIcon sx={{ fontSize: 16 }} />
              </button>
              {Array.from({ length: totalPages }).map((_, idx) => (
                <button
                  key={idx}
                  onClick={() => setCurrentPage(idx + 1)}
                  style={{
                    background: currentPage === idx + 1 ? 'linear-gradient(135deg, #4f772d, #3d5c22)' : 'var(--bg-primary)',
                    border: `1px solid ${currentPage === idx + 1 ? '#4f772d' : 'var(--border-light)'}`,
                    color: '#fff',
                    fontWeight: currentPage === idx + 1 ? 800 : 500,
                    width: 30,
                    height: 30,
                    borderRadius: 8,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '0.8rem'
                  }}
                >
                  {idx + 1}
                </button>
              ))}
              <button
                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  background: 'var(--bg-primary)',
                  border: '1px solid var(--border-light)',
                  color: currentPage === totalPages ? 'var(--text-muted)' : 'var(--text-primary)',
                  padding: '6px',
                  borderRadius: 8,
                  cursor: currentPage === totalPages ? 'not-allowed' : 'pointer',
                  opacity: currentPage === totalPages ? 0.4 : 1
                }}
              >
                <ChevronRightIcon sx={{ fontSize: 16 }} />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Confirmation Modal */}
      {confirmModal.isOpen && (
        <div style={{
          position: 'fixed',
          inset: 0,
          zIndex: 1000,
          background: 'rgba(0,0,0,0.8)',
          backdropFilter: 'blur(4px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '1.5rem'
        }}>
          <div style={{
            background: 'var(--bg-secondary)',
            border: '1px solid var(--border-light)',
            borderRadius: 18,
            width: '100%',
            maxWidth: 440,
            padding: '2rem',
            textAlign: 'center',
            boxShadow: '0 24px 60px rgba(0,0,0,0.6)'
          }}>
            <div style={{
              width: 56,
              height: 56,
              borderRadius: '50%',
              background: confirmModal.newStatus === 'suspended' ? 'rgba(239,68,68,0.12)' : 'rgba(34,197,94,0.12)',
              color: confirmModal.newStatus === 'suspended' ? '#ef4444' : '#22c55e',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 1.25rem'
            }}>
              <WarningIcon sx={{ fontSize: 28 }} />
            </div>
            <h3 style={{ margin: '0 0 0.5rem', fontWeight: 800, color: 'var(--text-primary)', fontSize: '1.25rem' }}>
              Confirm Account {confirmModal.actionText.toUpperCase()}
            </h3>
            <p style={{ margin: '0 0 1.5rem', fontSize: '0.88rem', color: 'var(--text-muted)', lineHeight: 1.5 }}>
              Are you sure you want to <strong>{confirmModal.actionText}</strong> the account for{' '}
              <strong style={{ color: 'var(--text-primary)' }}>{confirmModal.user?.name}</strong> ({confirmModal.user?.email})?
              {confirmModal.newStatus === 'suspended' ? ' The user will immediately be blocked from logging into the platform.' : ' The user will regain access to sign in.'}
            </p>
            <div style={{ display: 'flex', gap: 10, justifyContent: 'center' }}>
              <button
                onClick={() => setConfirmModal({ isOpen: false, user: null, actionText: '', newStatus: '' })}
                style={{
                  padding: '0.65rem 1.4rem',
                  borderRadius: 10,
                  border: '1px solid var(--border-light)',
                  background: 'transparent',
                  color: 'var(--text-muted)',
                  fontSize: '0.85rem',
                  cursor: 'pointer',
                  fontWeight: 600
                }}
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmAction}
                style={{
                  padding: '0.65rem 1.6rem',
                  borderRadius: 10,
                  border: 'none',
                  background: confirmModal.newStatus === 'suspended' ? '#ef4444' : 'linear-gradient(135deg, #4f772d, #3d5c22)',
                  color: '#fff',
                  fontSize: '0.85rem',
                  fontWeight: 700,
                  cursor: 'pointer'
                }}
              >
                Confirm {confirmModal.actionText.toUpperCase()}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserManagement;
