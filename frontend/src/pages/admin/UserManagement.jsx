import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import axios from 'axios';
import CircularProgress from '@mui/material/CircularProgress';
import DeletionRequestsTab from '../../components/admin/DeletionRequestsTab';
import { fetchAdminDeletionRequests } from '../../services/accountDeletionApi';
import {
  CustomAdminCustomersIcon,
  CustomAdminUserAccountIcon,
  CustomAdminSuspendedIcon,
  CustomSearchIcon as SearchIcon,
  CustomFilterListIcon as FilterListIcon,
  CustomMailIcon as MailIcon,
  CustomPhoneIcon as PhoneIcon,
  CustomLocationOnIcon as LocationOnIcon,
  CustomChevronLeftIcon as ChevronLeftIcon,
  CustomChevronRightIcon as ChevronRightIcon,
  CustomWarningIcon as WarningIcon
} from '../../components/icons';


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

const UserManagement = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const activeTab = searchParams.get('tab') === 'deletion-requests' ? 'deletion-requests' : 'accounts';
  const rawStatusParam = searchParams.get('status');
  const filterStatus =
    rawStatusParam === 'active' || rawStatusParam === 'suspended' || rawStatusParam === 'deleted'
      ? rawStatusParam
      : 'All';
  const rawVerificationParam = searchParams.get('verification');
  const filterVerification =
    rawVerificationParam === 'verified' || rawVerificationParam === 'pending_otp'
      ? rawVerificationParam
      : 'All';

  const [users, setUsers] = useState([]);
  const [pendingDeletionCount, setPendingDeletionCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;
  const [confirmModal, setConfirmModal] = useState({ isOpen: false, user: null, actionText: '', newStatus: '' });

  const fetchPendingDeletionCount = useCallback(async () => {
    try {
      const res = await fetchAdminDeletionRequests({ status: 'pending' });
      if (res?.summary) {
        setPendingDeletionCount(res.summary.pending || 0);
      }
    } catch {
      // Ignore silent badge refresh failures
    }
  }, []);

  const fetchUsers = useCallback(async () => {
    try {
      const token = localStorage.getItem('appToken');
      const API_URL = import.meta.env.VITE_API_URL || '';
      const res = await axios.get(`${API_URL}/api/admin/users`, {
        params: { role: 'customer' },
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.data.success) {
        setUsers(res.data.data);
      }
    } catch (err) {
      console.error('Failed to fetch customer accounts', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchUsers();
    fetchPendingDeletionCount();
    const handleFocus = () => {
      fetchUsers();
      fetchPendingDeletionCount();
    };
    window.addEventListener('focus', handleFocus);
    return () => {
      window.removeEventListener('focus', handleFocus);
    };
  }, [fetchUsers, fetchPendingDeletionCount]);

  const handleSwitchUserManagementTab = (tabName) => {
    if (tabName === 'deletion-requests') {
      setSearchParams({ tab: 'deletion-requests' });
    } else {
      setSearchParams({});
    }
  };

  // Sync the account status filter with the URL query string so dashboard drill-downs stay bookmarked
  const handleFilterStatusChange = (nextStatus) => {
    const nextParams = new URLSearchParams(searchParams);
    if (nextStatus === 'All') {
      nextParams.delete('status');
    } else {
      nextParams.set('status', nextStatus);
    }
    setSearchParams(nextParams);
    setCurrentPage(1);
  };

  // Sync the email verification filter with the URL query string so dashboard drill-downs stay bookmarked
  const handleFilterVerificationChange = (nextVerification) => {
    const nextParams = new URLSearchParams(searchParams);
    if (nextVerification === 'All') {
      nextParams.delete('verification');
    } else {
      nextParams.set('verification', nextVerification);
    }
    setSearchParams(nextParams);
    setCurrentPage(1);
  };

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

  // Keep only customer accounts for KPI metrics and table display
  const customerUsers = useMemo(() => {
    return (Array.isArray(users) ? users : []).filter(
      (user) => (user?.role || '').toLowerCase() === 'customer'
    );
  }, [users]);

  const metrics = useMemo(() => {
    return {
      totalCustomers: customerUsers.length,
      activeCustomers: customerUsers.filter((u) => u.status === 'active').length,
      suspendedCustomers: customerUsers.filter((u) => u.status === 'suspended').length
    };
  }, [customerUsers]);

  const filteredUsers = useMemo(() => {
    return customerUsers.filter((user) => {
      const name = user?.name || '';
      const email = user?.email || '';
      const phone = user?.contactNumber || '';
      const status = (user?.status || '').toLowerCase();
      const isVerified = Boolean(user?.isEmailVerified);
      const q = searchTerm.toLowerCase();

      const matchesSearch =
        !q ||
        name.toLowerCase().includes(q) ||
        email.toLowerCase().includes(q) ||
        phone.includes(q);

      const matchesStatus = filterStatus === 'All' || status === filterStatus.toLowerCase();

      // Match the Admin Dashboard KPI definition by excluding soft-deleted accounts from verification buckets
      const matchesVerification =
        filterVerification === 'All' ||
        (filterVerification === 'verified' && isVerified && status !== 'deleted') ||
        (filterVerification === 'pending_otp' && !isVerified && status !== 'deleted');

      return matchesSearch && matchesStatus && matchesVerification;
    });
  }, [customerUsers, searchTerm, filterStatus, filterVerification]);

  const totalPages = Math.ceil(filteredUsers.length / itemsPerPage) || 1;
  const safeCurrentPage = Math.min(currentPage, totalPages);
  const paginatedUsers = useMemo(() => {
    const start = (safeCurrentPage - 1) * itemsPerPage;
    return filteredUsers.slice(start, start + itemsPerPage);
  }, [filteredUsers, safeCurrentPage, itemsPerPage]);

  if (loading) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '65vh', gap: 16 }}>
        <CircularProgress size={40} sx={{ color: '#4f772d' }} />
        <span style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>Loading customer accounts...</span>
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
            Oversee registered customer accounts, contact details, account deletion requests, and access states.
          </p>
        </div>

        <div style={{ display: 'inline-flex', background: 'var(--bg-secondary)', border: '1px solid var(--border-light)', borderRadius: 12, padding: 4, gap: 4 }}>
          <button
            type="button"
            onClick={() => handleSwitchUserManagementTab('accounts')}
            style={{
              padding: '8px 16px',
              borderRadius: 9,
              border: 'none',
              fontSize: '0.82rem',
              fontWeight: 700,
              cursor: 'pointer',
              background: activeTab === 'accounts' ? '#4f772d' : 'transparent',
              color: activeTab === 'accounts' ? '#ffffff' : 'var(--text-muted)'
            }}
          >
            All Accounts
          </button>
          <button
            type="button"
            onClick={() => handleSwitchUserManagementTab('deletion-requests')}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 8,
              padding: '8px 16px',
              borderRadius: 9,
              border: 'none',
              fontSize: '0.82rem',
              fontWeight: 700,
              cursor: 'pointer',
              background: activeTab === 'deletion-requests' ? '#4f772d' : 'transparent',
              color: activeTab === 'deletion-requests' ? '#ffffff' : 'var(--text-muted)'
            }}
          >
            <span>Deletion Requests</span>
            {pendingDeletionCount > 0 && (
              <span
                style={{
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
                {pendingDeletionCount > 99 ? '99+' : pendingDeletionCount}
              </span>
            )}
          </button>
        </div>
      </div>

      {activeTab === 'deletion-requests' ? (
        <DeletionRequestsTab
          onRequestsChanged={() => {
            fetchUsers();
            fetchPendingDeletionCount();
          }}
        />
      ) : (
        <>

      {/* Customer KPI summary cards */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
        gap: '1rem'
      }}>
        {/* Customer Accounts */}
        <div className="mpi-admin-kpi-card" style={{
          background: 'var(--bg-secondary)',
          border: '1px solid var(--border-light)',
          borderRadius: 14,
          padding: '1.15rem',
          display: 'flex',
          alignItems: 'center',
          gap: 14,
          boxShadow: '0 4px 18px -6px rgba(0,0,0,0.1)'
        }}>
          <div className="mpi-admin-badge" style={{
            width: 44,
            height: 44,
            borderRadius: 12,
            background: 'rgba(37,99,235,0.08)',
            border: '1px solid rgba(37,99,235,0.18)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
            boxShadow: '0 2px 8px rgba(37,99,235,0.1)'
          }}>
            <CustomAdminCustomersIcon size={26} />
          </div>
          <div>
            <div style={{ fontSize: '1.45rem', fontWeight: 800, color: 'var(--text-primary)', lineHeight: 1.1 }}>{metrics.totalCustomers}</div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: 2 }}>Customer Accounts</div>
          </div>
        </div>

        {/* Active Accounts */}
        <div className="mpi-admin-kpi-card" style={{
          background: 'var(--bg-secondary)',
          border: '1px solid var(--border-light)',
          borderRadius: 14,
          padding: '1.15rem',
          display: 'flex',
          alignItems: 'center',
          gap: 14,
          boxShadow: '0 4px 18px -6px rgba(0,0,0,0.1)'
        }}>
          <div className="mpi-admin-badge" style={{
            width: 44,
            height: 44,
            borderRadius: 12,
            background: 'rgba(16,185,129,0.08)',
            border: '1px solid rgba(16,185,129,0.2)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
            boxShadow: '0 2px 8px rgba(16,185,129,0.1)'
          }}>
            <CustomAdminUserAccountIcon size={26} />
          </div>
          <div>
            <div style={{ fontSize: '1.45rem', fontWeight: 800, color: 'var(--text-primary)', lineHeight: 1.1 }}>{metrics.activeCustomers}</div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: 2 }}>Active Accounts</div>
          </div>
        </div>

        {/* Suspended Accounts */}
        <div className="mpi-admin-kpi-card" style={{
          background: 'var(--bg-secondary)',
          border: '1px solid var(--border-light)',
          borderRadius: 14,
          padding: '1.15rem',
          display: 'flex',
          alignItems: 'center',
          gap: 14,
          boxShadow: '0 4px 18px -6px rgba(0,0,0,0.1)'
        }}>
          <div className="mpi-admin-badge" style={{
            width: 44,
            height: 44,
            borderRadius: 12,
            background: metrics.suspendedCustomers > 0 ? 'rgba(239,68,68,0.09)' : 'rgba(16,185,129,0.08)',
            border: `1px solid ${metrics.suspendedCustomers > 0 ? 'rgba(239,68,68,0.22)' : 'rgba(16,185,129,0.2)'}`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
            boxShadow: `0 2px 8px ${metrics.suspendedCustomers > 0 ? 'rgba(239,68,68,0.12)' : 'rgba(16,185,129,0.1)'}`
          }}>
            <CustomAdminSuspendedIcon size={26} isSuspended={metrics.suspendedCustomers > 0} />
          </div>
          <div>
            <div style={{ fontSize: '1.45rem', fontWeight: 800, color: metrics.suspendedCustomers > 0 ? '#ef4444' : 'var(--text-primary)', lineHeight: 1.1 }}>
              {metrics.suspendedCustomers}
            </div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: 2 }}>Suspended Accounts</div>
          </div>
        </div>
      </div>

      {/* Search and status filter toolbar */}
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
            <FilterListIcon sx={{
              fontSize: 16,
              color: filterStatus === 'suspended' ? '#ef4444' : filterStatus === 'active' ? '#22c55e' : 'var(--text-muted)',
              position: 'absolute',
              left: 12,
              top: '50%',
              transform: 'translateY(-50%)',
              pointerEvents: 'none'
            }} />
            <select
              aria-label="Filter customer accounts by status"
              value={filterStatus}
              onChange={(e) => handleFilterStatusChange(e.target.value)}
              style={{
                appearance: 'none',
                background: filterStatus === 'suspended'
                  ? 'rgba(239,68,68,0.1)'
                  : filterStatus === 'active'
                    ? 'rgba(34,197,94,0.1)'
                    : 'var(--bg-primary)',
                border: `1px solid ${
                  filterStatus === 'suspended'
                    ? 'rgba(239,68,68,0.4)'
                    : filterStatus === 'active'
                      ? 'rgba(34,197,94,0.4)'
                      : 'var(--border-light)'
                }`,
                padding: '9px 24px 9px 34px',
                borderRadius: 10,
                color: filterStatus === 'suspended'
                  ? '#ef4444'
                  : filterStatus === 'active'
                    ? '#22c55e'
                    : 'var(--text-primary)',
                fontSize: '0.82rem',
                fontWeight: 600,
                outline: 'none',
                cursor: 'pointer'
              }}
            >
              <option value="All" style={{ background: 'var(--bg-secondary)', color: 'var(--text-primary)' }}>All Statuses</option>
              <option value="active" style={{ background: 'var(--bg-secondary)', color: 'var(--text-primary)' }}>Active Only</option>
              <option value="suspended" style={{ background: 'var(--bg-secondary)', color: 'var(--text-primary)' }}>Suspended Only</option>
              <option value="deleted" style={{ background: 'var(--bg-secondary)', color: 'var(--text-primary)' }}>Deleted Only</option>
            </select>
          </div>

          <select
            aria-label="Filter customer accounts by email verification"
            value={filterVerification}
            onChange={(e) => handleFilterVerificationChange(e.target.value)}
            style={{
              appearance: 'none',
              background: filterVerification === 'pending_otp'
                ? 'rgba(245,158,11,0.1)'
                : filterVerification === 'verified'
                  ? 'rgba(34,197,94,0.1)'
                  : 'var(--bg-primary)',
              border: `1px solid ${
                filterVerification === 'pending_otp'
                  ? 'rgba(245,158,11,0.4)'
                  : filterVerification === 'verified'
                    ? 'rgba(34,197,94,0.4)'
                    : 'var(--border-light)'
              }`,
              padding: '9px 18px',
              borderRadius: 10,
              color: filterVerification === 'pending_otp'
                ? '#f59e0b'
                : filterVerification === 'verified'
                  ? '#22c55e'
                  : 'var(--text-primary)',
              fontSize: '0.82rem',
              fontWeight: 600,
              outline: 'none',
              cursor: 'pointer'
            }}
          >
            <option value="All" style={{ background: 'var(--bg-secondary)', color: 'var(--text-primary)' }}>All Verification</option>
            <option value="verified" style={{ background: 'var(--bg-secondary)', color: 'var(--text-primary)' }}>Verified Only</option>
            <option value="pending_otp" style={{ background: 'var(--bg-secondary)', color: 'var(--text-primary)' }}>Pending OTP Only</option>
          </select>
        </div>

        <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
          Showing <strong>{filteredUsers.length}</strong> matching customer accounts
        </div>
      </div>

      {/* Customer accounts table */}
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
                <th style={{ ...th, minWidth: 200 }}>Customer Profile</th>
                <th style={{ ...th, minWidth: 220 }}>Contact Info</th>
                <th style={{ ...th, minWidth: 220, whiteSpace: 'nowrap' }}>Registered Location</th>
                <th style={{ ...th, minWidth: 140, whiteSpace: 'nowrap' }}>Email Verification</th>
                <th style={{ ...th, minWidth: 120, whiteSpace: 'nowrap' }}>Account Status</th>
                <th style={{ ...th, minWidth: 130, whiteSpace: 'nowrap' }}>Registered Date</th>
                <th style={{ ...th, minWidth: 120, textAlign: 'right', whiteSpace: 'nowrap' }}>Access Control</th>
              </tr>
            </thead>
            <tbody>
              {paginatedUsers.length === 0 ? (
                <tr>
                  <td colSpan="7" style={{ padding: '3.5rem', textAlign: 'center', color: 'var(--text-muted)' }}>
                    No customer accounts found matching your search or filter.
                  </td>
                </tr>
              ) : (
                paginatedUsers.map(user => {
                  const isActive = user.status === 'active';
                  const isDeleted = user.status === 'deleted';
                  const isEmailVerified = Boolean(user?.isEmailVerified);

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
                            background: 'rgba(59,130,246,0.12)',
                            color: '#3b82f6',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontWeight: 800,
                            fontSize: '0.9rem',
                            flexShrink: 0
                          }}>
                            {(user?.name || 'C').charAt(0).toUpperCase()}
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

                      <td style={{ ...td, whiteSpace: 'nowrap' }}>
                        <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: '0.82rem', color: 'var(--text-muted)', whiteSpace: 'nowrap' }}>
                          <LocationOnIcon sx={{ fontSize: 15, color: '#3b82f6', flexShrink: 0 }} />
                          <span style={{ whiteSpace: 'nowrap' }}>{user?.location || 'CALABARZON, Region IV\u2011A'}</span>
                        </div>
                      </td>

                      <td style={{ ...td, whiteSpace: 'nowrap' }}>
                        {isDeleted ? (
                          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600 }}>
                            —
                          </span>
                        ) : (
                          <span style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: 4,
                            padding: '3px 8px',
                            borderRadius: 6,
                            background: isEmailVerified ? 'rgba(34,197,94,0.12)' : 'rgba(245,158,11,0.12)',
                            color: isEmailVerified ? '#22c55e' : '#f59e0b',
                            fontSize: '0.74rem',
                            fontWeight: 700,
                            whiteSpace: 'nowrap'
                          }}>
                            {isEmailVerified ? '✓ Verified' : 'Pending OTP'}
                          </span>
                        )}
                      </td>

                      <td style={td}>
                        <span style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: 5,
                          padding: '3px 8px',
                          borderRadius: 6,
                          background: isDeleted
                            ? 'rgba(100,116,139,0.16)'
                            : isActive
                              ? 'rgba(34,197,94,0.12)'
                              : 'rgba(239,68,68,0.12)',
                          color: isDeleted ? '#94a3b8' : isActive ? '#22c55e' : '#ef4444',
                          fontSize: '0.74rem',
                          fontWeight: 700
                        }}>
                          <span style={{ width: 6, height: 6, borderRadius: '50%', background: isDeleted ? '#94a3b8' : isActive ? '#22c55e' : '#ef4444' }} />
                          <span>{isDeleted ? 'Deleted' : isActive ? 'Active' : 'Suspended'}</span>
                        </span>
                      </td>

                      <td style={{ ...td, color: 'var(--text-muted)', fontSize: '0.8rem', whiteSpace: 'nowrap' }}>
                        {user?.createdAt ? new Date(user.createdAt).toLocaleDateString('en-PH', { month: 'short', day: 'numeric', year: 'numeric' }) : 'N/A'}
                      </td>

                      <td style={{ ...td, textAlign: 'right' }}>
                        {isDeleted ? (
                          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600 }}>
                            Archived
                          </span>
                        ) : (
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
                            <span>{isActive ? 'Suspend' : 'Activate'}</span>
                          </button>
                        )}
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
              Showing <strong>{(safeCurrentPage - 1) * itemsPerPage + 1}</strong> to <strong>{Math.min(safeCurrentPage * itemsPerPage, filteredUsers.length)}</strong> of <strong>{filteredUsers.length}</strong> customer accounts
            </span>
            <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
              <button
                onClick={() => setCurrentPage(Math.max(1, safeCurrentPage - 1))}
                disabled={safeCurrentPage === 1}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  background: 'var(--bg-primary)',
                  border: '1px solid var(--border-light)',
                  color: safeCurrentPage === 1 ? 'var(--text-muted)' : 'var(--text-primary)',
                  padding: '6px',
                  borderRadius: 8,
                  cursor: safeCurrentPage === 1 ? 'not-allowed' : 'pointer',
                  opacity: safeCurrentPage === 1 ? 0.4 : 1
                }}
              >
                <ChevronLeftIcon sx={{ fontSize: 16 }} />
              </button>
              {Array.from({ length: totalPages }).map((_, idx) => (
                <button
                  key={idx}
                  onClick={() => setCurrentPage(idx + 1)}
                  style={{
                    background: safeCurrentPage === idx + 1 ? 'linear-gradient(135deg, #4f772d, #3d5c22)' : 'var(--bg-primary)',
                    border: `1px solid ${safeCurrentPage === idx + 1 ? '#4f772d' : 'var(--border-light)'}`,
                    color: '#fff',
                    fontWeight: safeCurrentPage === idx + 1 ? 800 : 500,
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
                onClick={() => setCurrentPage(Math.min(totalPages, safeCurrentPage + 1))}
                disabled={safeCurrentPage === totalPages}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  background: 'var(--bg-primary)',
                  border: '1px solid var(--border-light)',
                  color: safeCurrentPage === totalPages ? 'var(--text-muted)' : 'var(--text-primary)',
                  padding: '6px',
                  borderRadius: 8,
                  cursor: safeCurrentPage === totalPages ? 'not-allowed' : 'pointer',
                  opacity: safeCurrentPage === totalPages ? 0.4 : 1
                }}
              >
                <ChevronRightIcon sx={{ fontSize: 16 }} />
              </button>
            </div>
          </div>
        )}
      </div>
        </>
      )}

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
