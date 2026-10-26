import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';
import ShieldIcon from '@mui/icons-material/Shield';
import LockIcon from '@mui/icons-material/Lock';
import DevicesIcon from '@mui/icons-material/Devices';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import FactoryIcon from '@mui/icons-material/Factory';
import HubIcon from '@mui/icons-material/Hub';
import KeyIcon from '@mui/icons-material/Key';
import CircularProgress from '@mui/material/CircularProgress';
import {
  CustomAdminConcurrencyIcon,
  CustomAdminFacilityIcon,
  CustomAdminPasswordGuardIcon,
  CustomAdminPlatformGuardIcon
} from '../../components/icons';


const SettingsPage = () => {
  const [maxDevices, setMaxDevices] = useState('3');
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  const { token, user } = useAuth();

  const API_URL = import.meta.env.VITE_API_URL || '';

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${API_URL}/api/admin/settings`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const settings = res.data.data;
      const deviceSetting = settings.find(s => s.key === 'max_sales_devices');
      if (deviceSetting) {
        setMaxDevices(deviceSetting.value);
      }
    } catch (err) {
      setMessage({ type: 'error', text: 'Failed to load system settings from server.' });
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    setMessage({ type: '', text: '' });

    try {
      await axios.put(`${API_URL}/api/admin/settings/max_sales_devices`, {
        value: maxDevices.toString(),
        description: 'Maximum simultaneous devices a staff member can log into'
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setMessage({ type: 'success', text: 'System settings updated successfully.' });
      setTimeout(() => setMessage({ type: '', text: '' }), 4000);
    } catch (err) {
      setMessage({ type: 'error', text: 'Failed to update system settings.' });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div style={{ padding: '1.75rem 2rem', maxWidth: 1400, margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '1.75rem' }}>
      {/* Header section */}
      <div>
        <h1 style={{ margin: 0, fontSize: '1.5rem', fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '-0.02em' }}>
          System & Security Settings
        </h1>
        <p style={{ margin: '4px 0 0', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
          Configure security protocols, session concurrency controls, and operational platform safeguards.
        </p>
      </div>

      {message.text && (
        <div style={{
          padding: '0.875rem 1.25rem',
          borderRadius: 12,
          background: message.type === 'success' ? 'rgba(34,197,94,0.12)' : 'rgba(239,68,68,0.12)',
          border: `1px solid ${message.type === 'success' ? 'rgba(34,197,94,0.3)' : 'rgba(239,68,68,0.3)'}`,
          color: message.type === 'success' ? '#22c55e' : '#ef4444',
          fontSize: '0.85rem',
          display: 'flex',
          alignItems: 'center',
          gap: 10
        }}>
          {message.type === 'success' ? <CheckCircleIcon sx={{ fontSize: 18 }} /> : <ShieldIcon sx={{ fontSize: 18 }} />}
          <span>{message.text}</span>
        </div>
      )}

      {/* Two Column Layout */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'minmax(0, 1.4fr) minmax(0, 1fr)',
        gap: '1.75rem',
        alignItems: 'start'
      }}>
        {/* Left Column: Editable Configuration */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {/* Security & Access Card */}
          <div className="mpi-admin-kpi-card" style={{
            background: 'var(--bg-secondary)',
            border: '1px solid var(--border-light)',
            borderTop: '3px solid #4f772d',
            borderRadius: 18,
            padding: '1.75rem',
            boxShadow: '0 4px 20px -8px rgba(0,0,0,0.1)'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: '1.25rem' }}>
              <div className="mpi-admin-badge" style={{
                width: 46,
                height: 46,
                borderRadius: 13,
                background: 'rgba(79,119,45,0.09)',
                border: '1px solid rgba(79,119,45,0.22)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
                boxShadow: '0 2px 8px rgba(79,119,45,0.12)'
              }}>
                <CustomAdminConcurrencyIcon size={28} />
              </div>
              <div>
                <h3 style={{ margin: 0, fontSize: '1.05rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                  Device Concurrency & Login Limits
                </h3>
                <p style={{ margin: '2px 0 0', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                  Controls how many browser sessions or devices each operational staff member can maintain concurrently.
                </p>
              </div>
            </div>

            {loading ? (
              <div style={{ display: 'flex', justifyContent: 'center', padding: '2rem' }}>
                <CircularProgress size={30} sx={{ color: '#4f772d' }} />
              </div>
            ) : (
              <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                <div>
                  <label style={{
                    display: 'block',
                    fontSize: '0.75rem',
                    fontWeight: 700,
                    textTransform: 'uppercase',
                    letterSpacing: '0.05em',
                    color: 'var(--text-muted)',
                    marginBottom: 8
                  }}>
                    Maximum Simultaneous Devices per Staff
                  </label>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <input
                      type="number"
                      min={1}
                      max={10}
                      value={maxDevices}
                      onChange={(e) => setMaxDevices(e.target.value)}
                      required
                      style={{
                        width: 120,
                        background: 'var(--bg-primary)',
                        border: '1px solid var(--border-light)',
                        padding: '10px 14px',
                        borderRadius: 10,
                        color: 'var(--text-primary)',
                        fontSize: '1rem',
                        fontWeight: 700,
                        fontFamily: 'monospace',
                        outline: 'none',
                        boxSizing: 'border-box'
                      }}
                    />
                    <span style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
                      Active device sessions allowed (recommended: 2–3)
                    </span>
                  </div>
                  <p style={{ margin: '8px 0 0', fontSize: '0.75rem', color: 'var(--text-muted)', lineHeight: 1.5 }}>
                    When a staff member attempts to sign into a new device beyond this threshold, an OTP verification challenge is triggered and past dormant sessions are reviewed.
                  </p>
                </div>

                <div style={{ paddingTop: '0.5rem' }}>
                  <button
                    type="submit"
                    disabled={saving}
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: 8,
                      padding: '0.7rem 1.6rem',
                      borderRadius: 10,
                      border: 'none',
                      background: 'linear-gradient(135deg, #4f772d, #3d5c22)',
                      color: '#fff',
                      fontSize: '0.85rem',
                      fontWeight: 700,
                      cursor: saving ? 'not-allowed' : 'pointer',
                      boxShadow: '0 4px 14px rgba(79,119,45,0.25)',
                      opacity: saving ? 0.7 : 1,
                      transition: 'all 0.2s'
                    }}
                  >
                    {saving && <CircularProgress size={16} sx={{ color: '#fff' }} />}
                    <span>{saving ? 'Saving...' : 'Save Configuration'}</span>
                  </button>
                </div>
              </form>
            )}
          </div>

          {/* Password Security Standards Card */}
          <div className="mpi-admin-kpi-card" style={{
            background: 'var(--bg-secondary)',
            border: '1px solid var(--border-light)',
            borderTop: '3px solid #2563eb',
            borderRadius: 18,
            padding: '1.75rem',
            boxShadow: '0 4px 20px -8px rgba(0,0,0,0.1)'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: '1.25rem' }}>
              <div className="mpi-admin-badge" style={{
                width: 46,
                height: 46,
                borderRadius: 13,
                background: 'rgba(37,99,235,0.08)',
                border: '1px solid rgba(37,99,235,0.2)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
                boxShadow: '0 2px 8px rgba(37,99,235,0.1)'
              }}>
                <CustomAdminPasswordGuardIcon size={28} />
              </div>
              <div>
                <h3 style={{ margin: 0, fontSize: '1.05rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                  Password Complexity & Reset Guard
                </h3>
                <p style={{ margin: '2px 0 0', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                  Enforced cryptographic password requirements across all user tiers.
                </p>
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 12, fontSize: '0.82rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, color: 'var(--text-primary)' }}>
                <CheckCircleIcon sx={{ fontSize: 16, color: '#22c55e' }} />
                <span>Minimum 8 characters length standard</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, color: 'var(--text-primary)' }}>
                <CheckCircleIcon sx={{ fontSize: 16, color: '#22c55e' }} />
                <span>Mandatory uppercase, lowercase, and numeric digits</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, color: 'var(--text-primary)' }}>
                <CheckCircleIcon sx={{ fontSize: 16, color: '#22c55e' }} />
                <span>Special character required: <code>!@#$%^&*~</code> (including tilde)</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, color: 'var(--text-primary)' }}>
                <CheckCircleIcon sx={{ fontSize: 16, color: '#22c55e' }} />
                <span>Zero-reuse policy: Re-submitting previous password during reset is rejected</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Platform Identity & Operational Status */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {/* Platform Identity Card */}
          <div className="mpi-admin-kpi-card" style={{
            background: 'var(--bg-secondary)',
            border: '1px solid var(--border-light)',
            borderTop: '3px solid #f59e0b',
            borderRadius: 18,
            padding: '1.75rem',
            boxShadow: '0 4px 20px -8px rgba(0,0,0,0.1)'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: '1.25rem' }}>
              <div className="mpi-admin-badge" style={{
                width: 46,
                height: 46,
                borderRadius: 13,
                background: 'rgba(245,158,11,0.09)',
                border: '1px solid rgba(245,158,11,0.22)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
                boxShadow: '0 2px 8px rgba(245,158,11,0.12)'
              }}>
                <CustomAdminFacilityIcon size={28} />
              </div>
              <div>
                <h3 style={{ margin: 0, fontSize: '1.05rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                  Manufacturing & Operating Facility
                </h3>
                <p style={{ margin: '2px 0 0', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                  Enterprise facility parameters and fulfillment center coverage.
                </p>
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 10, fontSize: '0.8rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid var(--border-light)' }}>
                <span style={{ color: 'var(--text-muted)' }}>Organization:</span>
                <span style={{ fontWeight: 700, color: 'var(--text-primary)' }}>Mega Pacific Metal and Steel Corp</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid var(--border-light)' }}>
                <span style={{ color: 'var(--text-muted)' }}>Fulfillment Center:</span>
                <span style={{ fontWeight: 700, color: 'var(--text-primary)' }}>Region IV-A (CALABARZON)</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid var(--border-light)' }}>
                <span style={{ color: 'var(--text-muted)' }}>Production Facility:</span>
                <span style={{ fontWeight: 700, color: 'var(--text-primary)' }}>Imus, Cavite Manufacturing Plant</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0' }}>
                <span style={{ color: 'var(--text-muted)' }}>Operating Hours:</span>
                <span style={{ fontWeight: 700, color: '#4f772d' }}>Mon–Sat, 8:00 AM – 5:00 PM</span>
              </div>
            </div>
          </div>

          {/* Active Security Safeguards */}
          <div className="mpi-admin-kpi-card" style={{
            background: 'var(--bg-secondary)',
            border: '1px solid var(--border-light)',
            borderTop: '3px solid #10b981',
            borderRadius: 18,
            padding: '1.75rem',
            boxShadow: '0 4px 20px -8px rgba(0,0,0,0.1)'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: '1.25rem' }}>
              <div className="mpi-admin-badge" style={{
                width: 46,
                height: 46,
                borderRadius: 13,
                background: 'rgba(16,185,129,0.09)',
                border: '1px solid rgba(16,185,129,0.22)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
                boxShadow: '0 2px 8px rgba(16,185,129,0.12)'
              }}>
                <CustomAdminPlatformGuardIcon size={28} />
              </div>
              <div>
                <h3 style={{ margin: 0, fontSize: '1.05rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                  Platform Guard Status
                </h3>
                <p style={{ margin: '2px 0 0', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                  Real-time backoffice security & infrastructure monitors.
                </p>
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 12, fontSize: '0.8rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--text-muted)' }}>Two-Factor Auth (2FA / OTP):</span>
                <span style={{ color: '#22c55e', fontWeight: 700, background: 'rgba(34,197,94,0.12)', padding: '2px 8px', borderRadius: 6 }}>
                  Active
                </span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--text-muted)' }}>Singleton Role Guard:</span>
                <span style={{ color: '#22c55e', fontWeight: 700, background: 'rgba(34,197,94,0.12)', padding: '2px 8px', borderRadius: 6 }}>
                  1:1 Account Policy
                </span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--text-muted)' }}>Session Inactivity Timeout:</span>
                <span style={{ color: 'var(--text-primary)', fontWeight: 700 }}>
                  24-Hour Auto Logout
                </span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--text-muted)' }}>Live Gateway Channel:</span>
                <span style={{ color: '#3b82f6', fontWeight: 700, fontFamily: 'monospace' }}>
                  ws://admin
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SettingsPage;
