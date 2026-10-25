import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import BadgeIcon from '@mui/icons-material/Badge';
import CircularProgress from '@mui/material/CircularProgress';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';
import LockResetIcon from '@mui/icons-material/LockReset';
import EditIcon from '@mui/icons-material/Edit';
import SearchIcon from '@mui/icons-material/Search';
import MailIcon from '@mui/icons-material/Mail';
import PhoneIcon from '@mui/icons-material/Phone';
import CloseIcon from '@mui/icons-material/Close';
import WarningIcon from '@mui/icons-material/Warning';

const th = {
  padding: '1rem 1.25rem',
  fontSize: '0.75rem', fontWeight: 600, letterSpacing: '0.05em',
  textTransform: 'uppercase', color: 'var(--text-muted)',
  background: 'rgba(255,255,255,0.02)', borderBottom: '1px solid var(--border-light)',
  whiteSpace: 'nowrap'
};
const td = {
  padding: '1rem 1.25rem', fontSize: '0.85rem',
  color: 'var(--text-primary)', borderBottom: '1px solid var(--border)',
};

const SalesManagement = () => {
  const { logout } = useAuth();
  const navigate = useNavigate();
  const [salesList, setSalesList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  const [showModal, setShowModal] = useState(false);
  const [modalMode, setModalMode] = useState('edit'); 
  const [selectedSales, setSelectedSales] = useState(null);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState('');

  const [form, setForm] = useState({ name: '', contactNumber: '' });
  const [resetPassword, setResetPassword] = useState('');
  const [adminPassword, setAdminPassword] = useState('');
  const [logoutWarning, setLogoutWarning] = useState(false);
  const [confirmModal, setConfirmModal] = useState({ isOpen: false, emp: null, actionText: '', newStatus: '' });
  const [successModal, setSuccessModal] = useState({ isOpen: false, message: '' });

  const API_URL = import.meta.env.VITE_API_URL || '';
  
  const appUserStr = localStorage.getItem('appUser');
  const currentUser = appUserStr ? JSON.parse(appUserStr) : null;
  const isSuperAdmin = currentUser?.role === 'superadmin' || currentUser?.role === 'super_admin';

  const fetchSalesList = async () => {
    try {
      const token = localStorage.getItem('appToken');
      const res = await axios.get(`${API_URL}/api/admin/sales`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.data.success) setSalesList(res.data.data);
    } catch (err) {
      console.error('Failed to fetch sales accounts', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSalesList();
    const syncInterval = setInterval(fetchSalesList, 10000);
    const handleFocus = () => fetchSalesList();
    window.addEventListener('focus', handleFocus);
    return () => {
      clearInterval(syncInterval);
      window.removeEventListener('focus', handleFocus);
    };
  }, []);

  const openEdit = (emp) => {
    setModalMode('edit');
    setSelectedSales(emp);
    setForm({ name: emp.name || '', contactNumber: emp.contactNumber || '' });
    setFormError('');
    setShowModal(true);
  };

  const openReset = (emp) => {
    setModalMode('reset');
    setSelectedSales(emp);
    setResetPassword('');
    setAdminPassword('');
    setFormError('');
    setShowModal(true);
  };

  const handleEdit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setFormError('');
    if (form.contactNumber && form.contactNumber.trim()) {
      if (!/^09[0-9]{9}$/.test(form.contactNumber.trim())) {
        setFormError('Contact number must be an 11-digit Philippine mobile number starting with 09 (ex. 09171234567).');
        setSaving(false);
        return;
      }
    }

    try {
      const token = localStorage.getItem('appToken');
      await axios.put(`${API_URL}/api/admin/sales/${selectedSales.id}`, {
        name: form.name, contactNumber: form.contactNumber ? form.contactNumber.trim() : null
      }, { headers: { Authorization: `Bearer ${token}` } });
      await fetchSalesList();
      setShowModal(false);
    } catch (err) {
      setFormError(err.response?.data?.error || 'Failed to update sales.');
    } finally {
      setSaving(false);
    }
  };

  const handleReset = async (e) => {
    e.preventDefault();
    setSaving(true);
    setFormError('');
    try {
      const token = localStorage.getItem('appToken');
      await axios.patch(`${API_URL}/api/admin/sales/${selectedSales.id}/reset-password`,
        { newPassword: resetPassword, adminPassword },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setShowModal(false);
      setSuccessModal({ isOpen: true, message: 'Password changed successfully.' });
    } catch (err) {
      if (err.response?.data?.forceLogout) {
        setShowModal(false);
        setLogoutWarning(true);
      } else {
        setFormError(err.response?.data?.error || 'Failed to reset password.');
      }
    } finally {
      setSaving(false);
    }
  };

  const toggleStatusClick = (emp) => {
    const newStatus = emp.status === 'active' ? 'suspended' : 'active';
    const actionText = emp.status === 'pending' ? 'verify' : (newStatus === 'suspended' ? 'deactivate' : 'activate');
    setConfirmModal({ isOpen: true, emp, actionText, newStatus });
  };

  const handleConfirmStatus = async () => {
    const { emp, newStatus } = confirmModal;
    setConfirmModal({ isOpen: false, emp: null, actionText: '', newStatus: '' });
    try {
      const token = localStorage.getItem('appToken');
      await axios.patch(`${API_URL}/api/admin/sales/${emp.id}/status`,
        { status: newStatus },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      await fetchSalesList();
    } catch (err) {
      console.error('Failed to toggle status', err);
    }
  };

  const filtered = salesList.filter(e =>
    e.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    e.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '60vh', color: '#9ca3af' }}>
        <CircularProgress size={22} sx={{ color: '#60a5fa', marginRight: '10px' }} />
        Loading Staff...
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <h2 style={{ margin: 0, fontSize: '1.75rem', fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '-0.02em', display: 'flex', alignItems: 'center', gap: 10 }}>
            <BadgeIcon sx={{ fontSize: 28, color: '#60a5fa' }} /> Staff Management
          </h2>
          <p style={{ margin: '6px 0 0', fontSize: '0.9rem', color: 'var(--text-muted)' }}>
            Manage operational staff accounts for sales, logistics, and finance.
          </p>
        </div>
      </div>

      <div style={{ position: 'relative', maxWidth: 360 }}>
        <SearchIcon sx={{ fontSize: 16, color: 'var(--text-muted)', position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)' }} />
        <input
          type="text"
          placeholder="Search by name or email..."
          value={searchTerm}
          onChange={e => setSearchTerm(e.target.value)}
          style={{ width: '100%', background: 'var(--bg-secondary)', border: '1px solid var(--border-light)', padding: '10px 14px 10px 36px', borderRadius: 10, color: 'var(--text-primary)', fontSize: '0.85rem', outline: 'none', boxSizing: 'border-box' }}
        />
      </div>

      <div style={{ background: 'var(--bg-secondary)', borderRadius: 16, border: '1px solid var(--border)', overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 700 }}>
          <thead>
            <tr>
              <th style={th}>Account</th>
              <th style={th}>Role</th>
              <th style={th}>Contact</th>
              <th style={th}>Status</th>
              <th style={th}>Created</th>
              <th style={{ ...th, textAlign: 'right' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={5} style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-muted)' }}>
                  {salesList.length === 0 ? 'No accounts yet.' : 'No accounts match your search.'}
                </td>
              </tr>
            ) : (
              filtered.map(emp => (
                <tr key={emp.id}
                  onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.02)'}
                  onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                  style={{ transition: 'background 0.15s' }}
                >
                  <td style={td}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                      <div style={{ width: 38, height: 38, borderRadius: '50%', background: 'linear-gradient(135deg, #4f772d, #3d5c22)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 700, fontSize: '1rem', flexShrink: 0 }}>
                        {emp.name.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <div style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{emp.name}</div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                          <MailIcon sx={{ fontSize: 11 }} /> {emp.email}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td style={td}>
                    <span style={{ textTransform: 'capitalize', fontSize: '0.82rem', color: 'var(--text-primary)', fontWeight: 500 }}>
                      {emp.role}
                    </span>
                  </td>
                  <td style={td}>
                    {emp.contactNumber ? (
                      <div style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: '0.82rem', color: 'var(--text-muted)' }}>
                        <PhoneIcon sx={{ fontSize: 13 }} /> {emp.contactNumber}
                      </div>
                    ) : (
                      <span style={{ color: 'var(--text-muted)', fontSize: '0.78rem', fontStyle: 'italic' }}>Not set</span>
                    )}
                  </td>
                  <td style={td}>
                    {emp.status === 'pending' ? (
                      <span className="badge-yellow" style={{ display: 'inline-flex', alignItems: 'center', gap: 4, padding: '4px 8px', borderRadius: 99, color: '#d97706', background: 'rgba(217,119,6,0.1)' }}>
                        Pending
                      </span>
                    ) : (
                      <span
                        className={emp.status === 'active' ? 'badge-green' : 'badge-red'}
                        style={{ display: 'inline-flex', alignItems: 'center', gap: 4, padding: '4px 8px', borderRadius: 99, cursor: 'pointer' }}
                        onClick={() => toggleStatusClick(emp)}
                        title="Click to toggle status"
                      >
                        {emp.status === 'active' ? <CheckCircleIcon sx={{ fontSize: 12 }} /> : <CancelIcon sx={{ fontSize: 12 }} />}
                        <span style={{ textTransform: 'capitalize' }}>{emp.status}</span>
                      </span>
                    )}
                  </td>
                  <td style={{ ...td, color: 'var(--text-muted)', fontSize: '0.8rem' }}>
                    {new Date(emp.createdAt).toLocaleDateString('en-PH', { month: 'long', day: 'numeric', year: 'numeric' })}
                  </td>
                  <td style={{ ...td, textAlign: 'right' }}>
                    <div style={{ display: 'flex', gap: 6, justifyContent: 'flex-end' }}>
                      {emp.status === 'pending' && isSuperAdmin && (
                        <button onClick={() => toggleStatusClick(emp)}
                          style={{ background: 'rgba(74,222,128,0.1)', border: 'none', padding: '6px 10px', borderRadius: 8, color: '#4ade80', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4, fontSize: '0.78rem', fontWeight: 500 }}>
                          <CheckCircleIcon sx={{ fontSize: 14 }} /> Verify
                        </button>
                      )}
                      <button onClick={() => openEdit(emp)}
                        style={{ background: 'rgba(96,165,250,0.1)', border: 'none', padding: '6px 10px', borderRadius: 8, color: '#60a5fa', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4, fontSize: '0.78rem', fontWeight: 500 }}>
                        <EditIcon sx={{ fontSize: 14 }} /> Edit
                      </button>
                      <button onClick={() => openReset(emp)}
                        style={{ background: 'rgba(251,191,36,0.1)', border: 'none', padding: '6px 10px', borderRadius: 8, color: '#fbbf24', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4, fontSize: '0.78rem', fontWeight: 500 }}>
                        <LockResetIcon sx={{ fontSize: 14 }} /> Reset PW
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {showModal && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 100, background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1.5rem' }}
          onClick={e => e.target === e.currentTarget && setShowModal(false)}>
          <div style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border)', borderRadius: 20, width: '100%', maxWidth: 460, boxShadow: '0 32px 80px rgba(0,0,0,0.7)' }}>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1.25rem 1.5rem', borderBottom: '1px solid var(--border)' }}>
              <div>
                <h3 style={{ margin: 0, fontWeight: 700, color: 'var(--text-primary)', fontSize: '1rem' }}>
                  {modalMode === 'edit' ? 'Edit Staff Profile' : 'Reset Staff Password'}
                </h3>
                <p style={{ margin: '2px 0 0', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                  {modalMode === 'edit' ? 'Update name and contact number.' : `Reset password for ${selectedSales?.name}.`}
                </p>
              </div>
              <button onClick={() => setShowModal(false)} style={{ background: 'none', border: '1px solid var(--border-light)', borderRadius: 8, padding: 6, color: 'var(--text-muted)', cursor: 'pointer', display: 'flex' }}>
                <CloseIcon sx={{ fontSize: 15 }} />
              </button>
            </div>

            <form onSubmit={modalMode === 'edit' ? handleEdit : handleReset}>
              <div style={{ padding: '1.25rem 1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {formError && (
                  <div style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)', borderRadius: 10, padding: '0.65rem 1rem', color: '#f87171', fontSize: '0.82rem' }}>
                    {formError}
                  </div>
                )}

                {modalMode === 'edit' && (
                  <>
                    <div>
                      <label style={{ fontSize: '0.72rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', display: 'block', marginBottom: 6 }}>Full Name</label>
                      <input value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))}
                        placeholder="Cedric Torres"
                        style={{ width: '100%', background: 'var(--bg-primary)', border: '1px solid var(--border-light)', borderRadius: 10, padding: '0.65rem 0.85rem', color: 'var(--text-primary)', fontSize: '0.875rem', outline: 'none', boxSizing: 'border-box' }} />
                    </div>
                    <div>
                      <label style={{ fontSize: '0.72rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', display: 'block', marginBottom: 6 }}>Contact Number (Optional)</label>
                      <input
                        value={form.contactNumber}
                        type="tel"
                        inputMode="numeric"
                        maxLength={11}
                        onChange={e => {
                          let digits = e.target.value.replace(/[^0-9]/g, '');
                          if (digits.startsWith('63')) digits = '0' + digits.slice(2);
                          else if (digits.length > 0 && !digits.startsWith('0') && digits.startsWith('9')) digits = '0' + digits;
                          if (digits.length > 0 && !digits.startsWith('0')) return;
                          if (digits.length > 1 && !digits.startsWith('09')) return;
                          setForm(p => ({ ...p, contactNumber: digits.slice(0, 11) }));
                        }}
                        placeholder="09123456789"
                        style={{ width: '100%', background: 'var(--bg-primary)', border: '1px solid var(--border-light)', borderRadius: 10, padding: '0.65rem 0.85rem', color: 'var(--text-primary)', fontSize: '0.875rem', outline: 'none', boxSizing: 'border-box' }}
                      />
                      <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: 4 }}>
                        {form.contactNumber && !form.contactNumber.startsWith('09') ? (
                          <span style={{ color: '#f59e0b' }}>Must start with 09</span>
                        ) : form.contactNumber && form.contactNumber.length < 11 ? (
                          <span>11 digits required ({11 - form.contactNumber.length} more)</span>
                        ) : form.contactNumber && form.contactNumber.length === 11 ? (
                          <span style={{ color: '#22c55e' }}>✓ Valid Philippine mobile number</span>
                        ) : (
                          <span>Format: 09XXXXXXXXX (11 digits)</span>
                        )}
                      </div>
                    </div>
                  </>
                )}

                {modalMode === 'reset' && (
                  <>
                    <div>
                      <label style={{ fontSize: '0.72rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', display: 'block', marginBottom: 6 }}>New Password *</label>
                      <input required type="password" value={resetPassword} onChange={e => setResetPassword(e.target.value)}
                        placeholder="Min. 6 characters" minLength={6}
                        style={{ width: '100%', background: 'var(--bg-primary)', border: '1px solid var(--border-light)', borderRadius: 10, padding: '0.65rem 0.85rem', color: 'var(--text-primary)', fontSize: '0.875rem', outline: 'none', boxSizing: 'border-box' }} />
                    </div>
                    <div>
                      <label style={{ fontSize: '0.72rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', display: 'block', marginBottom: 6, marginTop: 12 }}>Your Admin Password *</label>
                      <input required type="password" value={adminPassword} onChange={e => setAdminPassword(e.target.value)}
                        placeholder="Confirm with your password"
                        style={{ width: '100%', background: 'var(--bg-primary)', border: '1px solid var(--border-light)', borderRadius: 10, padding: '0.65rem 0.85rem', color: 'var(--text-primary)', fontSize: '0.875rem', outline: 'none', boxSizing: 'border-box' }} />
                    </div>
                  </>
                )}
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8, padding: '0 1.5rem 1.5rem' }}>
                <button type="button" onClick={() => setShowModal(false)}
                  style={{ padding: '0.6rem 1.2rem', borderRadius: 10, border: '1px solid var(--border-light)', background: 'transparent', color: 'var(--text-muted)', fontSize: '0.84rem', cursor: 'pointer' }}>
                  Cancel
                </button>
                <button type="submit" disabled={saving}
                  style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '0.6rem 1.4rem', borderRadius: 10, border: 'none', background: 'linear-gradient(135deg, #4f772d, #3d5c22)', color: '#fff', fontSize: '0.84rem', fontWeight: 600, cursor: 'pointer', opacity: saving ? 0.7 : 1 }}>
                  {saving ? <CircularProgress size={14} thickness={5} sx={{ color: '#fff' }} /> : null}
                  {modalMode === 'edit' ? 'Save Changes' : 'Confirm Reset'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {logoutWarning && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 200, background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1.5rem' }}>
          <div style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border)', borderRadius: 20, width: '100%', maxWidth: 400, padding: '2rem', textAlign: 'center', boxShadow: '0 32px 80px rgba(0,0,0,0.7)' }}>
            <div style={{ width: 60, height: 60, borderRadius: '50%', background: 'rgba(239,68,68,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.5rem', color: '#ef4444' }}>
              <CancelIcon sx={{ fontSize: 32 }} />
            </div>
            <h3 style={{ margin: '0 0 0.5rem', fontWeight: 700, color: 'var(--text-primary)', fontSize: '1.25rem' }}>
              Security Warning
            </h3>
            <p style={{ margin: '0 0 1.5rem', fontSize: '0.9rem', color: 'var(--text-muted)', lineHeight: 1.5 }}>
              Incorrect admin password. For security reasons, you have been logged out.
            </p>
            <button 
              onClick={() => {
                setLogoutWarning(false);
                logout();
                navigate('/admin-1megapacific/login', { replace: true });
              }}
              style={{ background: '#ef4444', color: '#fff', border: 'none', padding: '0.75rem 2rem', borderRadius: 10, fontSize: '0.9rem', fontWeight: 600, cursor: 'pointer', width: '100%' }}
            >
              Acknowledge
            </button>
          </div>
        </div>
      )}

      {confirmModal.isOpen && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 200, background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1.5rem' }}>
          <div style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border)', borderRadius: 20, width: '100%', maxWidth: 400, padding: '2rem', textAlign: 'center', boxShadow: '0 32px 80px rgba(0,0,0,0.7)' }}>
            <div style={{ width: 60, height: 60, borderRadius: '50%', background: confirmModal.newStatus === 'suspended' ? 'rgba(239,68,68,0.1)' : 'rgba(34,197,94,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.5rem', color: confirmModal.newStatus === 'suspended' ? '#ef4444' : '#22c55e' }}>
              <WarningIcon sx={{ fontSize: 32 }} />
            </div>
            <h3 style={{ margin: '0 0 0.5rem', fontWeight: 700, color: 'var(--text-primary)', fontSize: '1.25rem', textTransform: 'capitalize' }}>
              {confirmModal.actionText} Account?
            </h3>
            <p style={{ margin: '0 0 1.5rem', fontSize: '0.9rem', color: 'var(--text-muted)', lineHeight: 1.5 }}>
              Are you sure you want to {confirmModal.actionText} <strong>{confirmModal.emp?.name || confirmModal.emp?.email}</strong>?
            </p>
            <div style={{ display: 'flex', gap: '1rem' }}>
              <button 
                onClick={() => setConfirmModal({ isOpen: false, emp: null, actionText: '', newStatus: '' })}
                style={{ flex: 1, background: 'transparent', color: 'var(--text-muted)', border: '1px solid var(--border-light)', padding: '0.75rem', borderRadius: 10, fontSize: '0.9rem', fontWeight: 600, cursor: 'pointer' }}
              >
                Cancel
              </button>
              <button 
                onClick={handleConfirmStatus}
                style={{ flex: 1, background: confirmModal.newStatus === 'suspended' ? '#ef4444' : '#22c55e', color: '#fff', border: 'none', padding: '0.75rem', borderRadius: 10, fontSize: '0.9rem', fontWeight: 600, cursor: 'pointer' }}
              >
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}

      {successModal.isOpen && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 200, background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1.5rem' }}>
          <div style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border)', borderRadius: 20, width: '100%', maxWidth: 400, padding: '2rem', textAlign: 'center', boxShadow: '0 32px 80px rgba(0,0,0,0.7)' }}>
            <div style={{ width: 60, height: 60, borderRadius: '50%', background: 'rgba(34,197,94,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.5rem', color: '#22c55e' }}>
              <CheckCircleIcon sx={{ fontSize: 32 }} />
            </div>
            <h3 style={{ margin: '0 0 0.5rem', fontWeight: 700, color: 'var(--text-primary)', fontSize: '1.25rem' }}>
              Success
            </h3>
            <p style={{ margin: '0 0 1.5rem', fontSize: '0.9rem', color: 'var(--text-muted)', lineHeight: 1.5 }}>
              {successModal.message}
            </p>
            <button 
              onClick={() => setSuccessModal({ isOpen: false, message: '' })}
              style={{ background: '#22c55e', color: '#fff', border: 'none', padding: '0.75rem 2rem', borderRadius: 10, fontSize: '0.9rem', fontWeight: 600, cursor: 'pointer', width: '100%' }}
            >
              Okay
            </button>
          </div>
        </div>
      )}

      <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
    </div>
  );
};

export default SalesManagement;
