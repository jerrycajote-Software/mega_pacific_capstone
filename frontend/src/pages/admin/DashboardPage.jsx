import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import CircularProgress from '@mui/material/CircularProgress';
import {
  CustomAdminCustomersIcon,
  CustomAdminStaffIcon,
  CustomAdminVerificationIcon,
  CustomAdminSecurityFlagsIcon,
  CustomChevronRightIcon as ChevronRightIcon,
  CustomLocationOnIcon as LocationOnIcon
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

const DashboardPage = () => {
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const API_URL = import.meta.env.VITE_API_URL || '';

  const fetchStats = async () => {
    try {
      const token = localStorage.getItem('appToken');
      const res = await axios.get(`${API_URL}/api/admin/dashboard`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.data.success) {
        setData(res.data.data);
      }
    } catch (err) {
      console.error('Failed to load admin dashboard statistics:', err);
      setError('Unable to load dashboard metrics. Please refresh.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
    const handleFocus = () => fetchStats();
    window.addEventListener('focus', handleFocus);
    return () => {
      window.removeEventListener('focus', handleFocus);
    };
  }, []);

  if (loading) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '65vh', gap: 16 }}>
        <CircularProgress size={42} color="primary" />
        <span style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>Loading administrative metrics...</span>
      </div>
    );
  }

  const kpi = data?.kpi || {
    totalCustomers: 0,
    newCustomersThisWeek: 0,
    activeCustomers: 0,
    suspendedCustomers: 0,
    pendingDeletionRequests: 0,
    verifiedCustomers: 0,
    unverifiedCustomers: 0,
    verificationRate: 100,
    totalStaff: 0,
    activeStaff: 0,
    flagsCount: 0
  };

  const recentCustomers = data?.recentCustomers || [];

  // Open User Management pre-filtered to customer accounts waiting for email OTP verification
  const handleViewPendingOtpCustomers = () => {
    navigate('/admin/users?verification=pending_otp');
  };

  // Open User Management pre-filtered to suspended customer accounts
  const handleViewSuspendedCustomers = () => {
    navigate('/admin/users?status=suspended');
  };

  // Open User Management directly on the customer account deletion requests tab
  const handleViewDeletionRequests = () => {
    navigate('/admin/users?tab=deletion-requests');
  };

  return (
    <div style={{ padding: '1.75rem 2rem', maxWidth: 1400, margin: '0 auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.75rem', flexWrap: 'wrap', gap: 16 }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
            <h1 style={{ margin: 0, fontSize: '1.5rem', fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '-0.02em' }}>
              Backoffice Operations & Technical Support
            </h1>
            <span className="role-identity-pill">
              <span className="role-identity-dot" />
              System Administration
            </span>
            <span style={{
              fontSize: '0.7rem',
              fontWeight: 700,
              padding: '3px 8px',
              borderRadius: 6,
              background: 'var(--green-glow)',
              color: 'var(--green)',
              border: '1px solid var(--green-border)',
              textTransform: 'uppercase'
            }}>
              Live System
            </span>
          </div>
          <p style={{ margin: '4px 0 0', fontSize: '0.84rem', color: 'var(--text-muted)' }}>
            Manage customer accounts, staff roles, and system security settings.
          </p>
        </div>

      </div>

      {error && (
        <div style={{ padding: '0.9rem 1.25rem', borderRadius: 12, background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.25)', color: '#ef4444', fontSize: '0.85rem', marginBottom: '1.5rem' }}>
          {error}
        </div>
      )}

      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
        gap: '1.25rem',
        marginBottom: '1.75rem'
      }}>
        {/* Registered Customers KPI */}
        <div className="mpi-admin-kpi-card" style={{
          background: 'var(--bg-secondary)',
          border: '1px solid var(--border-light)',
          borderRadius: 16,
          padding: '1.35rem',
          position: 'relative',
          overflow: 'hidden',
          boxShadow: '0 4px 20px -8px rgba(0,0,0,0.1)'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.75rem' }}>
            <span style={{ fontSize: '0.75rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--text-muted)' }}>
              Registered Customers
            </span>
            <div className="mpi-admin-badge" style={{
              width: 46,
              height: 46,
              borderRadius: 13,
              background: 'rgba(37,99,235,0.08)',
              border: '1px solid rgba(37,99,235,0.18)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 2px 8px rgba(37,99,235,0.1)'
            }}>
              <CustomAdminCustomersIcon size={28} />
            </div>
          </div>
          <div style={{ fontSize: '1.85rem', fontWeight: 800, color: 'var(--text-primary)', lineHeight: 1.1 }}>
            {kpi.totalCustomers.toLocaleString()}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 8, fontSize: '0.75rem' }}>
            <span style={{ color: '#22c55e', fontWeight: 700 }}>+{kpi.newCustomersThisWeek} this week</span>
            <span style={{ color: 'var(--text-muted)' }}>• {kpi.activeCustomers} active</span>
          </div>
        </div>

        {/* Operational Staff KPI */}
        <div className="mpi-admin-kpi-card" style={{
          background: 'var(--bg-secondary)',
          border: '1px solid var(--border-light)',
          borderRadius: 16,
          padding: '1.35rem',
          position: 'relative',
          overflow: 'hidden',
          boxShadow: '0 4px 20px -8px rgba(0,0,0,0.1)'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.75rem' }}>
            <span style={{ fontSize: '0.75rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--text-muted)' }}>
              Staff Accounts
            </span>
            <div className="mpi-admin-badge" style={{
              width: 46,
              height: 46,
              borderRadius: 13,
              background: 'rgba(79,119,45,0.09)',
              border: '1px solid rgba(79,119,45,0.22)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 2px 8px rgba(79,119,45,0.12)'
            }}>
              <CustomAdminStaffIcon size={28} />
            </div>
          </div>
          <div style={{ fontSize: '1.85rem', fontWeight: 800, color: 'var(--text-primary)', lineHeight: 1.1 }}>
            {kpi.activeStaff} / {kpi.totalStaff}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 8, fontSize: '0.75rem' }}>
            <span style={{ color: '#22c55e', fontWeight: 700 }}>One account per role</span>
            <span style={{ color: 'var(--text-muted)' }}>• All roles filled</span>
          </div>
        </div>

        {/* Verification Health KPI */}
        <div className="mpi-admin-kpi-card" style={{
          background: 'var(--bg-secondary)',
          border: '1px solid var(--border-light)',
          borderRadius: 16,
          padding: '1.35rem',
          position: 'relative',
          overflow: 'hidden',
          boxShadow: '0 4px 20px -8px rgba(0,0,0,0.1)'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.75rem' }}>
            <span style={{ fontSize: '0.75rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--text-muted)' }}>
              Verified Accounts
            </span>
            <div className="mpi-admin-badge" style={{
              width: 46,
              height: 46,
              borderRadius: 13,
              background: 'rgba(16,185,129,0.09)',
              border: '1px solid rgba(16,185,129,0.22)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 2px 8px rgba(16,185,129,0.12)'
            }}>
              <CustomAdminVerificationIcon size={28} />
            </div>
          </div>
          <div style={{ fontSize: '1.85rem', fontWeight: 800, color: 'var(--text-primary)', lineHeight: 1.1 }}>
            {kpi.verificationRate}%
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 8, fontSize: '0.75rem', flexWrap: 'wrap' }}>
            <span style={{ color: '#10b981', fontWeight: 700 }}>{kpi.verifiedCustomers} verified</span>
            <span style={{ color: 'var(--text-muted)' }}>•</span>
            <button
              type="button"
              onClick={handleViewPendingOtpCustomers}
              title="View all customer accounts pending email OTP verification"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 2,
                padding: 0,
                background: 'none',
                border: 'none',
                color: kpi.unverifiedCustomers > 0 ? '#f59e0b' : 'var(--text-muted)',
                fontSize: '0.75rem',
                fontWeight: kpi.unverifiedCustomers > 0 ? 700 : 500,
                cursor: 'pointer'
              }}
            >
              <span style={{ textDecoration: 'underline', textUnderlineOffset: 3 }}>
                {kpi.unverifiedCustomers} pending OTP
              </span>
              <ChevronRightIcon sx={{ fontSize: 14 }} />
            </button>
          </div>
        </div>

        {/* Security Flags KPI */}
        <div className="mpi-admin-kpi-card" style={{
          background: 'var(--bg-secondary)',
          border: '1px solid var(--border-light)',
          borderRadius: 16,
          padding: '1.35rem',
          position: 'relative',
          overflow: 'hidden',
          boxShadow: '0 4px 20px -8px rgba(0,0,0,0.1)'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.75rem' }}>
            <span style={{ fontSize: '0.75rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--text-muted)' }}>
              Account Alerts
            </span>
            <div className="mpi-admin-badge" style={{
              width: 46,
              height: 46,
              borderRadius: 13,
              background: kpi.flagsCount > 0 ? 'rgba(245,158,11,0.1)' : 'rgba(34,197,94,0.1)',
              border: `1px solid ${kpi.flagsCount > 0 ? 'rgba(245,158,11,0.25)' : 'rgba(34,197,94,0.25)'}`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: `0 2px 8px ${kpi.flagsCount > 0 ? 'rgba(245,158,11,0.15)' : 'rgba(34,197,94,0.15)'}`
            }}>
              <CustomAdminSecurityFlagsIcon size={28} />
            </div>
          </div>
          <div style={{ fontSize: '1.85rem', fontWeight: 800, color: 'var(--text-primary)', lineHeight: 1.1 }}>
            {kpi.flagsCount}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 8, fontSize: '0.75rem', flexWrap: 'wrap' }}>
            <button
              type="button"
              onClick={handleViewSuspendedCustomers}
              title="View all suspended customer accounts"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 2,
                padding: 0,
                background: 'none',
                border: 'none',
                color: kpi.suspendedCustomers > 0 ? '#ef4444' : '#22c55e',
                fontSize: '0.75rem',
                fontWeight: 700,
                cursor: 'pointer'
              }}
            >
              <span style={{ textDecoration: 'underline', textUnderlineOffset: 3 }}>
                {kpi.suspendedCustomers} suspended
              </span>
              <ChevronRightIcon sx={{ fontSize: 14 }} />
            </button>
            <span style={{ color: 'var(--text-muted)' }}>•</span>
            <button
              type="button"
              onClick={handleViewDeletionRequests}
              title="Review pending customer account deletion requests"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 2,
                padding: 0,
                background: 'none',
                border: 'none',
                color: kpi.pendingDeletionRequests > 0 ? '#f59e0b' : 'var(--text-muted)',
                fontSize: '0.75rem',
                fontWeight: kpi.pendingDeletionRequests > 0 ? 700 : 500,
                cursor: 'pointer'
              }}
            >
              <span style={{ textDecoration: 'underline', textUnderlineOffset: 3 }}>
                {kpi.pendingDeletionRequests} deletion {kpi.pendingDeletionRequests === 1 ? 'request' : 'requests'}
              </span>
              <ChevronRightIcon sx={{ fontSize: 14 }} />
            </button>
          </div>
        </div>
      </div>

      <div style={{
        background: 'var(--bg-secondary)',
        border: '1px solid var(--border-light)',
        borderRadius: 16,
        padding: '1.5rem',
        boxShadow: '0 4px 20px -8px rgba(0,0,0,0.1)'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
          <div>
            <h3 style={{ margin: 0, fontSize: '1rem', fontWeight: 700, color: 'var(--text-primary)' }}>
              Recent Customer Registrations
            </h3>
            <p style={{ margin: '2px 0 0', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
              Latest customer signups and verification status.
            </p>
          </div>
          <button
            onClick={() => navigate('/admin/users')}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 4,
              background: 'none',
              border: 'none',
              color: '#4f772d',
              fontSize: '0.78rem',
              fontWeight: 700,
              cursor: 'pointer'
            }}
          >
            <span>View All Customers</span>
            <ChevronRightIcon sx={{ fontSize: 16 }} />
          </button>
        </div>

        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead>
              <tr>
                <th style={{ ...th, minWidth: 160, whiteSpace: 'nowrap' }}>Customer Name</th>
                <th style={{ ...th, minWidth: 180, whiteSpace: 'nowrap' }}>Official Email</th>
                <th style={{ ...th, minWidth: 130, whiteSpace: 'nowrap' }}>Contact Number</th>
                <th style={{ ...th, minWidth: 170, whiteSpace: 'nowrap' }}>Registered Location</th>
                <th style={{ ...th, minWidth: 140, whiteSpace: 'nowrap' }}>Email Verification</th>
                <th style={{ ...th, minWidth: 120, whiteSpace: 'nowrap' }}>Joined Date</th>
              </tr>
            </thead>
            <tbody>
              {recentCustomers.length === 0 ? (
                <tr>
                  <td colSpan={6} style={{ ...td, textAlign: 'center', color: 'var(--text-muted)' }}>
                    No customer registrations recorded yet.
                  </td>
                </tr>
              ) : (
                recentCustomers.map((cust) => (
                  <tr key={cust.id}>
                    <td style={{ ...td, fontWeight: 600, whiteSpace: 'nowrap' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <div style={{
                          width: 28,
                          height: 28,
                          borderRadius: '50%',
                          background: 'rgba(79,119,45,0.15)',
                          color: '#4f772d',
                          fontSize: '0.75rem',
                          fontWeight: 700,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center'
                        }}>
                          {(cust.name || 'C').charAt(0).toUpperCase()}
                        </div>
                        <span>{cust.name}</span>
                      </div>
                    </td>
                    <td style={{ ...td, fontFamily: 'monospace', fontSize: '0.8rem', color: 'var(--text-muted)', whiteSpace: 'nowrap' }}>
                      {cust.email}
                    </td>
                    <td style={{ ...td, fontFamily: 'monospace', fontSize: '0.8rem', whiteSpace: 'nowrap' }}>
                      {cust.contactNumber || '—'}
                    </td>
                    <td style={{ ...td, fontSize: '0.8rem', color: 'var(--text-muted)', whiteSpace: 'nowrap' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 5, whiteSpace: 'nowrap' }}>
                        <LocationOnIcon sx={{ fontSize: 14, color: '#3b82f6', flexShrink: 0 }} />
                        <span style={{ whiteSpace: 'nowrap' }}>{cust.location}</span>
                      </div>
                    </td>
                    <td style={{ ...td, whiteSpace: 'nowrap' }}>
                      <span style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: 4,
                        fontSize: '0.72rem',
                        fontWeight: 700,
                        padding: '3px 8px',
                        borderRadius: 6,
                        background: cust.isEmailVerified ? 'rgba(34,197,94,0.12)' : 'rgba(245,158,11,0.12)',
                        color: cust.isEmailVerified ? '#22c55e' : '#f59e0b',
                        whiteSpace: 'nowrap'
                      }}>
                        {cust.isEmailVerified ? '✓ Verified' : 'Pending OTP'}
                      </span>
                    </td>
                    <td style={{ ...td, fontSize: '0.78rem', color: 'var(--text-muted)', whiteSpace: 'nowrap' }}>
                      {new Date(cust.createdAt).toLocaleDateString('en-PH', { month: 'short', day: 'numeric', year: 'numeric' })}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;
