import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import PeopleIcon from '@mui/icons-material/People';
import BadgeIcon from '@mui/icons-material/Badge';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import WarningIcon from '@mui/icons-material/Warning';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import ShieldIcon from '@mui/icons-material/Shield';
import LockResetIcon from '@mui/icons-material/LockReset';
import TuneIcon from '@mui/icons-material/Tune';
import PhoneIcon from '@mui/icons-material/Phone';
import MailIcon from '@mui/icons-material/Mail';
import LocationOnIcon from '@mui/icons-material/LocationOn';
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

const roleLabels = {
  admin: { label: 'Admin (System)', color: '#6366f1', bg: 'rgba(99,102,241,0.12)' },
  owner: { label: 'Owner (Executive)', color: '#8b5cf6', bg: 'rgba(139,92,246,0.12)' },
  sales: { label: 'Sales Representative', color: '#10b981', bg: 'rgba(16,185,129,0.12)' },
  logistic: { label: 'Logistics Officer', color: '#f59e0b', bg: 'rgba(245,158,11,0.12)' },
  finance: { label: 'Finance Officer', color: '#06b6d4', bg: 'rgba(6,182,212,0.12)' },
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
    const syncInterval = setInterval(fetchStats, 10000);
    const handleFocus = () => fetchStats();
    window.addEventListener('focus', handleFocus);
    return () => {
      clearInterval(syncInterval);
      window.removeEventListener('focus', handleFocus);
    };
  }, []);

  if (loading) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '65vh', gap: 16 }}>
        <CircularProgress size={42} sx={{ color: '#4f772d' }} />
        <span style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>Loading administrative metrics...</span>
      </div>
    );
  }

  const kpi = data?.kpi || {
    totalCustomers: 0,
    newCustomersThisWeek: 0,
    activeCustomers: 0,
    suspendedCustomers: 0,
    verifiedCustomers: 0,
    unverifiedCustomers: 0,
    verificationRate: 100,
    totalStaff: 0,
    activeStaff: 0,
    flagsCount: 0
  };

  const staffMembers = data?.staffMembers || [];
  const recentCustomers = data?.recentCustomers || [];
  const systemStatus = data?.systemStatus || {
    singletonCount: staffMembers.length,
    maxSalesDevices: 3,
    activeSessionsCount: 1
  };

  return (
    <div style={{ padding: '1.75rem 2rem', maxWidth: 1400, margin: '0 auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.75rem', flexWrap: 'wrap', gap: 16 }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <h1 style={{ margin: 0, fontSize: '1.5rem', fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '-0.02em' }}>
              Backoffice Operations & Technical Support
            </h1>
            <span style={{
              fontSize: '0.7rem',
              fontWeight: 700,
              padding: '3px 8px',
              borderRadius: 6,
              background: 'rgba(79,119,45,0.15)',
              color: '#4f772d',
              border: '1px solid rgba(79,119,45,0.3)',
              textTransform: 'uppercase'
            }}>
              Live System
            </span>
          </div>
          <p style={{ margin: '4px 0 0', fontSize: '0.84rem', color: 'var(--text-muted)' }}>
            Real-time customer directory oversight, departmental staff clearance, and system security controls.
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
        <div style={{
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
            <div style={{ width: 36, height: 36, borderRadius: 10, background: 'rgba(59,130,246,0.12)', color: '#3b82f6', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <PeopleIcon sx={{ fontSize: 20 }} />
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

        {/* Operational Staff */}
        <div style={{
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
              Operational Staff
            </span>
            <div style={{ width: 36, height: 36, borderRadius: 10, background: 'rgba(79,119,45,0.15)', color: '#4f772d', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <BadgeIcon sx={{ fontSize: 20 }} />
            </div>
          </div>
          <div style={{ fontSize: '1.85rem', fontWeight: 800, color: 'var(--text-primary)', lineHeight: 1.1 }}>
            {kpi.activeStaff} / {kpi.totalStaff}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 8, fontSize: '0.75rem' }}>
            <span style={{ color: '#22c55e', fontWeight: 700 }}>Singleton 1:1 Policy</span>
            <span style={{ color: 'var(--text-muted)' }}>• All roles staffed</span>
          </div>
        </div>

        <div style={{
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
              Verification Health
            </span>
            <div style={{ width: 36, height: 36, borderRadius: 10, background: 'rgba(16,185,129,0.12)', color: '#10b981', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <CheckCircleIcon sx={{ fontSize: 20 }} />
            </div>
          </div>
          <div style={{ fontSize: '1.85rem', fontWeight: 800, color: 'var(--text-primary)', lineHeight: 1.1 }}>
            {kpi.verificationRate}%
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 8, fontSize: '0.75rem' }}>
            <span style={{ color: '#10b981', fontWeight: 700 }}>{kpi.verifiedCustomers} verified</span>
            <span style={{ color: 'var(--text-muted)' }}>• {kpi.unverifiedCustomers} pending OTP</span>
          </div>
        </div>

        <div style={{
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
              Security Flags
            </span>
            <div style={{
              width: 36,
              height: 36,
              borderRadius: 10,
              background: kpi.flagsCount > 0 ? 'rgba(245,158,11,0.15)' : 'rgba(34,197,94,0.12)',
              color: kpi.flagsCount > 0 ? '#f59e0b' : '#22c55e',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <WarningIcon sx={{ fontSize: 20 }} />
            </div>
          </div>
          <div style={{ fontSize: '1.85rem', fontWeight: 800, color: 'var(--text-primary)', lineHeight: 1.1 }}>
            {kpi.flagsCount}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 8, fontSize: '0.75rem' }}>
            <span style={{ color: kpi.suspendedCustomers > 0 ? '#ef4444' : '#22c55e', fontWeight: 700 }}>
              {kpi.suspendedCustomers} suspended
            </span>
            <span style={{ color: 'var(--text-muted)' }}>• 0 critical vulnerabilities</span>
          </div>
        </div>
      </div>

      <div style={{
        display: 'grid',
        gridTemplateColumns: 'minmax(0, 1.9fr) minmax(0, 1.1fr)',
        gap: '1.5rem',
        marginBottom: '1.75rem'
      }}>
        <div style={{
          background: 'var(--bg-secondary)',
          border: '1px solid var(--border-light)',
          borderRadius: 16,
          padding: '1.5rem',
          boxShadow: '0 4px 20px -8px rgba(0,0,0,0.1)',
          display: 'flex',
          flexDirection: 'column'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
            <div>
              <h3 style={{ margin: 0, fontSize: '1rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                Departmental Staff Clearance Directory
              </h3>
              <p style={{ margin: '2px 0 0', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                Active administrative & operational staff credentials.
              </p>
            </div>
            <button
              onClick={() => navigate('/admin/accounts')}
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
              <span>Manage Staff</span>
              <ArrowForwardIcon sx={{ fontSize: 14 }} />
            </button>
          </div>

          <div style={{ overflowX: 'auto', flex: 1 }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
              <thead>
                <tr>
                  <th style={th}>Role Clearance</th>
                  <th style={th}>Account Name</th>
                  <th style={th}>Official Email</th>
                  <th style={th}>Contact Number</th>
                  <th style={th}>Status</th>
                </tr>
              </thead>
              <tbody>
                {staffMembers.length === 0 ? (
                  <tr>
                    <td colSpan={5} style={{ ...td, textAlign: 'center', color: 'var(--text-muted)' }}>
                      No staff accounts found.
                    </td>
                  </tr>
                ) : (
                  staffMembers.map((staff) => {
                    const badge = roleLabels[staff.role] || { label: staff.role.toUpperCase(), color: '#64748b', bg: 'rgba(100,116,139,0.1)' };
                    return (
                      <tr key={staff.id}>
                        <td style={td}>
                          <span style={{
                            display: 'inline-block',
                            fontSize: '0.72rem',
                            fontWeight: 700,
                            padding: '3px 8px',
                            borderRadius: 6,
                            background: badge.bg,
                            color: badge.color
                          }}>
                            {badge.label}
                          </span>
                        </td>
                        <td style={{ ...td, fontWeight: 600 }}>{staff.name}</td>
                        <td style={{ ...td, fontFamily: 'monospace', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                          {staff.email}
                        </td>
                        <td style={{ ...td, fontFamily: 'monospace', fontSize: '0.8rem' }}>
                          {staff.contactNumber || '—'}
                        </td>
                        <td style={td}>
                          <span style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: 4,
                            fontSize: '0.72rem',
                            fontWeight: 700,
                            padding: '3px 8px',
                            borderRadius: 6,
                            background: staff.status === 'active' ? 'rgba(34,197,94,0.12)' : 'rgba(239,68,68,0.12)',
                            color: staff.status === 'active' ? '#22c55e' : '#ef4444'
                          }}>
                            <span style={{ width: 6, height: 6, borderRadius: '50%', background: staff.status === 'active' ? '#22c55e' : '#ef4444' }} />
                            {staff.status === 'active' ? 'Active & Ready' : 'Suspended'}
                          </span>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          <div style={{
            background: 'var(--bg-secondary)',
            border: '1px solid var(--border-light)',
            borderRadius: 16,
            padding: '1.5rem',
            boxShadow: '0 4px 20px -8px rgba(0,0,0,0.1)'
          }}>
            <h3 style={{ margin: '0 0 1rem', fontSize: '1rem', fontWeight: 700, color: 'var(--text-primary)' }}>
              Administrative Shortcuts
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              <div
                onClick={() => navigate('/admin/users')}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '0.85rem 1rem',
                  borderRadius: 12,
                  background: 'var(--bg-primary)',
                  border: '1px solid var(--border-light)',
                  cursor: 'pointer',
                  transition: 'all 0.2s'
                }}
                onMouseEnter={e => {
                  e.currentTarget.style.borderColor = '#4f772d';
                  e.currentTarget.style.transform = 'translateY(-1px)';
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.borderColor = 'var(--border-light)';
                  e.currentTarget.style.transform = 'none';
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <div style={{ width: 32, height: 32, borderRadius: 8, background: 'rgba(59,130,246,0.12)', color: '#3b82f6', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <PeopleIcon sx={{ fontSize: 18 }} />
                  </div>
                  <div>
                    <div style={{ fontSize: '0.84rem', fontWeight: 700, color: 'var(--text-primary)' }}>Customer Directory</div>
                    <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Inspect profiles, addresses & status</div>
                  </div>
                </div>
                <ArrowForwardIcon sx={{ fontSize: 16, color: 'var(--text-muted)' }} />
              </div>

              <div
                onClick={() => navigate('/admin/accounts')}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '0.85rem 1rem',
                  borderRadius: 12,
                  background: 'var(--bg-primary)',
                  border: '1px solid var(--border-light)',
                  cursor: 'pointer',
                  transition: 'all 0.2s'
                }}
                onMouseEnter={e => {
                  e.currentTarget.style.borderColor = '#4f772d';
                  e.currentTarget.style.transform = 'translateY(-1px)';
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.borderColor = 'var(--border-light)';
                  e.currentTarget.style.transform = 'none';
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <div style={{ width: 32, height: 32, borderRadius: 8, background: 'rgba(79,119,45,0.15)', color: '#4f772d', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <LockResetIcon sx={{ fontSize: 18 }} />
                  </div>
                  <div>
                    <div style={{ fontSize: '0.84rem', fontWeight: 700, color: 'var(--text-primary)' }}>Staff Clearance & Reset</div>
                    <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Update contact numbers or passwords</div>
                  </div>
                </div>
                <ArrowForwardIcon sx={{ fontSize: 16, color: 'var(--text-muted)' }} />
              </div>

              <div
                onClick={() => navigate('/admin/settings')}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '0.85rem 1rem',
                  borderRadius: 12,
                  background: 'var(--bg-primary)',
                  border: '1px solid var(--border-light)',
                  cursor: 'pointer',
                  transition: 'all 0.2s'
                }}
                onMouseEnter={e => {
                  e.currentTarget.style.borderColor = '#4f772d';
                  e.currentTarget.style.transform = 'translateY(-1px)';
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.borderColor = 'var(--border-light)';
                  e.currentTarget.style.transform = 'none';
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <div style={{ width: 32, height: 32, borderRadius: 8, background: 'rgba(139,92,246,0.12)', color: '#8b5cf6', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <TuneIcon sx={{ fontSize: 18 }} />
                  </div>
                  <div>
                    <div style={{ fontSize: '0.84rem', fontWeight: 700, color: 'var(--text-primary)' }}>Security & Device Limits</div>
                    <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Configure max concurrent sessions</div>
                  </div>
                </div>
                <ArrowForwardIcon sx={{ fontSize: 16, color: 'var(--text-muted)' }} />
              </div>
            </div>
          </div>

          <div style={{
            background: 'var(--bg-secondary)',
            border: '1px solid var(--border-light)',
            borderRadius: 16,
            padding: '1.25rem 1.5rem',
            boxShadow: '0 4px 20px -8px rgba(0,0,0,0.1)'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: '0.75rem' }}>
              <ShieldIcon sx={{ fontSize: 18, color: '#4f772d' }} />
              <span style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                System Policy & Controls
              </span>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8, fontSize: '0.75rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-muted)' }}>
                <span>Singleton 1-Account-per-Role:</span>
                <span style={{ color: '#22c55e', fontWeight: 700 }}>Enforced (1:1)</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-muted)' }}>
                <span>Max Concurrent Staff Devices:</span>
                <span style={{ color: 'var(--text-primary)', fontWeight: 700 }}>{systemStatus.maxSalesDevices} devices</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-muted)' }}>
                <span>Active System Sessions:</span>
                <span style={{ color: '#10b981', fontWeight: 700 }}>{systemStatus.activeSessionsCount} active</span>
              </div>
            </div>
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
            <span>View Full Directory</span>
            <ArrowForwardIcon sx={{ fontSize: 14 }} />
          </button>
        </div>

        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead>
              <tr>
                <th style={th}>Customer Name</th>
                <th style={th}>Official Email</th>
                <th style={th}>Contact Number</th>
                <th style={th}>Registered Location</th>
                <th style={th}>Email Verification</th>
                <th style={th}>Joined Date</th>
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
                    <td style={{ ...td, fontWeight: 600 }}>
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
                    <td style={{ ...td, fontFamily: 'monospace', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                      {cust.email}
                    </td>
                    <td style={{ ...td, fontFamily: 'monospace', fontSize: '0.8rem' }}>
                      {cust.contactNumber || '—'}
                    </td>
                    <td style={{ ...td, fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                        <LocationOnIcon sx={{ fontSize: 13, color: 'var(--text-muted)' }} />
                        <span>{cust.location}</span>
                      </div>
                    </td>
                    <td style={td}>
                      <span style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: 4,
                        fontSize: '0.72rem',
                        fontWeight: 700,
                        padding: '3px 8px',
                        borderRadius: 6,
                        background: cust.isEmailVerified ? 'rgba(34,197,94,0.12)' : 'rgba(245,158,11,0.12)',
                        color: cust.isEmailVerified ? '#22c55e' : '#f59e0b'
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
