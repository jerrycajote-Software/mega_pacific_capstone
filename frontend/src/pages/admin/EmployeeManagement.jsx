import React, { useState, useEffect } from 'react';
import axios from 'axios';
import BadgeIcon from '@mui/icons-material/Badge';
import AddIcon from '@mui/icons-material/Add';
import RefreshIcon from '@mui/icons-material/Refresh';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';
import LockResetIcon from '@mui/icons-material/LockReset';
import EditIcon from '@mui/icons-material/Edit';
import SearchIcon from '@mui/icons-material/Search';
import MailIcon from '@mui/icons-material/Mail';
import PhoneIcon from '@mui/icons-material/Phone';
import CloseIcon from '@mui/icons-material/Close';
import CircularProgress from '@mui/material/CircularProgress';

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

const EmployeeManagement = () => {
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [spin, setSpin] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  // Modal state
  const [showModal, setShowModal] = useState(false);
  const [modalMode, setModalMode] = useState('create'); // 'create' | 'edit' | 'reset'
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState('');

  const [form, setForm] = useState({ name: '', email: '', password: '', contactNumber: '' });
  const [resetPassword, setResetPassword] = useState('');

  const API_URL = import.meta.env.VITE_API_URL || '';

  const fetchEmployees = async () => {
    try {
      const token = localStorage.getItem('appToken');
      const res = await axios.get(`${API_URL}/api/admin/employees`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.data.success) setEmployees(res.data.data);
    } catch (err) {
      console.error('Failed to fetch employees', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchEmployees(); }, []);

  const refresh = () => {
    setSpin(true);
    fetchEmployees().then(() => setTimeout(() => setSpin(false), 800));
  };

  const openCreate = () => {
    setModalMode('create');
    setForm({ name: '', email: '', password: '', contactNumber: '' });
    setFormError('');
    setShowModal(true);
  };

  const openEdit = (emp) => {
    setModalMode('edit');
    setSelectedEmployee(emp);
    setForm({ name: emp.name, email: emp.email, contactNumber: emp.contactNumber || '', password: '' });
    setFormError('');
    setShowModal(true);
  };

  const openReset = (emp) => {
    setModalMode('reset');
    setSelectedEmployee(emp);
    setResetPassword('');
    setFormError('');
    setShowModal(true);
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    setSaving(true);
    setFormError('');
    try {
      const token = localStorage.getItem('appToken');
      const res = await axios.post(`${API_URL}/api/admin/employees`, form, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.data.success) {
        await fetchEmployees();
        setShowModal(false);
      }
    } catch (err) {
      setFormError(err.response?.data?.error || 'Failed to create employee.');
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setFormError('');
    try {
      const token = localStorage.getItem('appToken');
      await axios.put(`${API_URL}/api/admin/employees/${selectedEmployee.id}`, {
        name: form.name, contactNumber: form.contactNumber
      }, { headers: { Authorization: `Bearer ${token}` } });
      await fetchEmployees();
      setShowModal(false);
    } catch (err) {
      setFormError(err.response?.data?.error || 'Failed to update employee.');
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
      await axios.patch(`${API_URL}/api/admin/employees/${selectedEmployee.id}/reset-password`,
        { newPassword: resetPassword },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setShowModal(false);
    } catch (err) {
      setFormError(err.response?.data?.error || 'Failed to reset password.');
    } finally {
      setSaving(false);
    }
  };

  const toggleStatus = async (emp) => {
    const newStatus = emp.status === 'active' ? 'suspended' : 'active';
    if (!window.confirm(`${newStatus === 'suspended' ? 'Deactivate' : 'Activate'} ${emp.name}?`)) return;
    try {
      const token = localStorage.getItem('appToken');
      await axios.patch(`${API_URL}/api/admin/employees/${emp.id}/status`,
        { status: newStatus },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      await fetchEmployees();
    } catch (err) {
      console.error('Failed to toggle status', err);
    }
  };

  const filtered = employees.filter(e =>
    e.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    e.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '60vh', color: '#9ca3af' }}>
        <RefreshIcon sx={{ fontSize: 24, animation: 'spin 1s linear infinite', marginRight: '10px' }} />
        Loading Employees...
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <h2 style={{ margin: 0, fontSize: '1.75rem', fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '-0.02em', display: 'flex', alignItems: 'center', gap: 10 }}>
            <BadgeIcon sx={{ fontSize: 28, color: '#60a5fa' }} /> Employee Management
          </h2>
          <p style={{ margin: '6px 0 0', fontSize: '0.9rem', color: 'var(--text-muted)' }}>
            Create and manage employee accounts. Admin controls access and resets passwords.
          </p>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <button onClick={refresh}
            style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '8px 14px', background: 'var(--bg-tertiary)', border: '1px solid var(--border-light)', borderRadius: 10, color: 'var(--text-muted)', fontSize: '0.85rem', cursor: 'pointer' }}>
            <RefreshIcon sx={{ fontSize: 15, animation: spin ? 'spin 0.8s linear infinite' : 'none', color: spin ? '#22c55e' : 'inherit' }} />
            Refresh
          </button>
          <button onClick={openCreate}
            style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '8px 16px', background: 'linear-gradient(135deg, #4f772d, #3d5c22)', border: 'none', borderRadius: 10, color: '#fff', fontSize: '0.85rem', fontWeight: 600, cursor: 'pointer', boxShadow: '0 2px 12px rgba(79,119,45,0.3)' }}>
            <AddIcon sx={{ fontSize: 18 }} /> Add Employee
          </button>
        </div>
      </div>

      {/* Search */}
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

      {/* Table */}
      <div style={{ background: 'var(--bg-secondary)', borderRadius: 16, border: '1px solid var(--border)', overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 700 }}>
          <thead>
            <tr>
              <th style={th}>Employee</th>
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
                  {employees.length === 0 ? 'No employees yet. Click "Add Employee" to create the first one.' : 'No employees match your search.'}
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
                    {emp.contactNumber ? (
                      <div style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: '0.82rem', color: 'var(--text-muted)' }}>
                        <PhoneIcon sx={{ fontSize: 13 }} /> {emp.contactNumber}
                      </div>
                    ) : (
                      <span style={{ color: 'var(--text-muted)', fontSize: '0.78rem', fontStyle: 'italic' }}>Not set</span>
                    )}
                  </td>
                  <td style={td}>
                    <span
                      className={emp.status === 'active' ? 'badge-green' : 'badge-red'}
                      style={{ display: 'inline-flex', alignItems: 'center', gap: 4, padding: '4px 8px', borderRadius: 99, cursor: 'pointer' }}
                      onClick={() => toggleStatus(emp)}
                      title="Click to toggle status"
                    >
                      {emp.status === 'active' ? <CheckCircleIcon sx={{ fontSize: 12 }} /> : <CancelIcon sx={{ fontSize: 12 }} />}
                      <span style={{ textTransform: 'capitalize' }}>{emp.status}</span>
                    </span>
                  </td>
                  <td style={{ ...td, color: 'var(--text-muted)', fontSize: '0.8rem' }}>
                    {new Date(emp.createdAt).toLocaleDateString('en-PH', { month: 'long', day: 'numeric', year: 'numeric' })}
                  </td>
                  <td style={{ ...td, textAlign: 'right' }}>
                    <div style={{ display: 'flex', gap: 6, justifyContent: 'flex-end' }}>
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

      {/* Modal */}
      {showModal && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 100, background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1.5rem' }}
          onClick={e => e.target === e.currentTarget && setShowModal(false)}>
          <div style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border)', borderRadius: 20, width: '100%', maxWidth: 460, boxShadow: '0 32px 80px rgba(0,0,0,0.7)' }}>

            {/* Modal header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1.25rem 1.5rem', borderBottom: '1px solid var(--border)' }}>
              <div>
                <h3 style={{ margin: 0, fontWeight: 700, color: 'var(--text-primary)', fontSize: '1rem' }}>
                  {modalMode === 'create' ? 'Add New Employee' : modalMode === 'edit' ? 'Edit Employee' : 'Reset Password'}
                </h3>
                <p style={{ margin: '2px 0 0', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                  {modalMode === 'create' ? 'Admin sets the initial password for this account.' : modalMode === 'edit' ? 'Update employee info.' : `Reset password for ${selectedEmployee?.name}.`}
                </p>
              </div>
              <button onClick={() => setShowModal(false)} style={{ background: 'none', border: '1px solid var(--border-light)', borderRadius: 8, padding: 6, color: 'var(--text-muted)', cursor: 'pointer', display: 'flex' }}>
                <CloseIcon sx={{ fontSize: 15 }} />
              </button>
            </div>

            {/* Modal body */}
            <form onSubmit={modalMode === 'create' ? handleCreate : modalMode === 'edit' ? handleEdit : handleReset}>
              <div style={{ padding: '1.25rem 1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {formError && (
                  <div style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)', borderRadius: 10, padding: '0.65rem 1rem', color: '#f87171', fontSize: '0.82rem' }}>
                    {formError}
                  </div>
                )}

                {modalMode !== 'reset' && (
                  <>
                    <div>
                      <label style={{ fontSize: '0.72rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', display: 'block', marginBottom: 6 }}>Full Name *</label>
                      <input required value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))}
                        placeholder="Cedric Torres"
                        style={{ width: '100%', background: 'var(--bg-primary)', border: '1px solid var(--border-light)', borderRadius: 10, padding: '0.65rem 0.85rem', color: 'var(--text-primary)', fontSize: '0.875rem', outline: 'none', boxSizing: 'border-box' }} />
                    </div>
                    {modalMode === 'create' && (
                      <div>
                        <label style={{ fontSize: '0.72rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', display: 'block', marginBottom: 6 }}>Gmail Address *</label>
                        <input required type="email" value={form.email} onChange={e => setForm(p => ({ ...p, email: e.target.value }))}
                          placeholder="cedrictorres@gmail.com"
                          style={{ width: '100%', background: 'var(--bg-primary)', border: '1px solid var(--border-light)', borderRadius: 10, padding: '0.65rem 0.85rem', color: 'var(--text-primary)', fontSize: '0.875rem', outline: 'none', boxSizing: 'border-box' }} />
                      </div>
                    )}
                    <div>
                      <label style={{ fontSize: '0.72rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', display: 'block', marginBottom: 6 }}>Contact Number</label>
                      <input value={form.contactNumber} onChange={e => setForm(p => ({ ...p, contactNumber: e.target.value }))}
                        placeholder="09123456789"
                        style={{ width: '100%', background: 'var(--bg-primary)', border: '1px solid var(--border-light)', borderRadius: 10, padding: '0.65rem 0.85rem', color: 'var(--text-primary)', fontSize: '0.875rem', outline: 'none', boxSizing: 'border-box' }} />
                    </div>
                    {modalMode === 'create' && (
                      <div>
                        <label style={{ fontSize: '0.72rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', display: 'block', marginBottom: 6 }}>Initial Password *</label>
                        <input required type="password" value={form.password} onChange={e => setForm(p => ({ ...p, password: e.target.value }))}
                          placeholder="Min. 8 characters" minLength={8}
                          style={{ width: '100%', background: 'var(--bg-primary)', border: '1px solid var(--border-light)', borderRadius: 10, padding: '0.65rem 0.85rem', color: 'var(--text-primary)', fontSize: '0.875rem', outline: 'none', boxSizing: 'border-box' }} />
                      </div>
                    )}
                  </>
                )}

                {modalMode === 'reset' && (
                  <div>
                    <label style={{ fontSize: '0.72rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', display: 'block', marginBottom: 6 }}>New Password *</label>
                    <input required type="password" value={resetPassword} onChange={e => setResetPassword(e.target.value)}
                      placeholder="Min. 6 characters" minLength={6}
                      style={{ width: '100%', background: 'var(--bg-primary)', border: '1px solid var(--border-light)', borderRadius: 10, padding: '0.65rem 0.85rem', color: 'var(--text-primary)', fontSize: '0.875rem', outline: 'none', boxSizing: 'border-box' }} />
                  </div>
                )}
              </div>

              {/* Footer */}
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8, padding: '0 1.5rem 1.5rem' }}>
                <button type="button" onClick={() => setShowModal(false)}
                  style={{ padding: '0.6rem 1.2rem', borderRadius: 10, border: '1px solid var(--border-light)', background: 'transparent', color: 'var(--text-muted)', fontSize: '0.84rem', cursor: 'pointer' }}>
                  Cancel
                </button>
                <button type="submit" disabled={saving}
                  style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '0.6rem 1.4rem', borderRadius: 10, border: 'none', background: 'linear-gradient(135deg, #4f772d, #3d5c22)', color: '#fff', fontSize: '0.84rem', fontWeight: 600, cursor: 'pointer', opacity: saving ? 0.7 : 1 }}>
                  {saving ? <CircularProgress size={14} thickness={5} sx={{ color: '#fff' }} /> : null}
                  {modalMode === 'create' ? 'Create Employee' : modalMode === 'edit' ? 'Save Changes' : 'Reset Password'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
    </div>
  );
};

export default EmployeeManagement;
