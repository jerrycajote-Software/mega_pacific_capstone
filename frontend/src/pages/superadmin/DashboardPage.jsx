import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';
import DeveloperModeIcon from '@mui/icons-material/DeveloperMode';
import AdminPanelSettingsIcon from '@mui/icons-material/AdminPanelSettings';
import BadgeIcon from '@mui/icons-material/Badge';
import StorefrontIcon from '@mui/icons-material/Storefront';
import PowerSettingsNewIcon from '@mui/icons-material/PowerSettingsNew';
import GroupIcon from '@mui/icons-material/Group';
import HistoryIcon from '@mui/icons-material/History';
import { io } from 'socket.io-client';

const SuperAdminDashboardPage = () => {
  const { token, logout, user } = useAuth();
  const [statuses, setStatuses] = useState({
    admin_portal_status: 'online',
    sales_portal_status: 'online',
    customer_portal_status: 'online',
  });
  const [activeUsers, setActiveUsers] = useState([]);
  const [sessionLogs, setSessionLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pendingAccounts, setPendingAccounts] = useState([]);

  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [confirmModal, setConfirmModal] = useState({ show: false, action: null, accountId: null, password: '', error: '' });

  useEffect(() => {
    fetchStatuses();
    fetchActiveUsers();
    fetchSessionLogs();
    fetchPendingAccounts();

    const intervalId = setInterval(() => {
      fetchStatuses();
      fetchActiveUsers();
      fetchSessionLogs();
      fetchPendingAccounts();
    }, 10000);

    const API_URL = import.meta.env.VITE_API_URL || '';
    const socket = io(API_URL, {
      auth: { user }
    });

    socket.emit("join_room", "superadmin");
    socket.on("active_users_update", (users) => {
      setActiveUsers(users);
    });

    return () => {
      clearInterval(intervalId);
      socket.disconnect();
    };
  }, []);

  const fetchPendingAccounts = async () => {
    try {
      const API_URL = import.meta.env.VITE_API_URL || '';
      // Super admin can access admin routes since we updated verifyAdmin middleware
      const res = await axios.get(`${API_URL}/api/admin/saless`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.data.success) {
        setPendingAccounts(res.data.data.filter(acc => acc.status === 'pending'));
      }
    } catch (err) {
      console.error("Failed to fetch pending accounts", err);
    }
  };

  const fetchStatuses = async () => {
    try {
      const API_URL = import.meta.env.VITE_API_URL || '';
      const res = await axios.get(`${API_URL}/api/superadmin/status`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.data.success) {
        setStatuses(res.data.data);
      }
    } catch (err) {
      console.error("Failed to fetch statuses", err);
    } finally {
      setLoading(false);
    }
  };

  const fetchActiveUsers = async () => {
    try {
      const API_URL = import.meta.env.VITE_API_URL || '';
      const res = await axios.get(`${API_URL}/api/superadmin/active-users`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.data.success) {
        setActiveUsers(res.data.data);
      }
    } catch (err) {
      console.error("Failed to fetch active users", err);
    }
  };

  const fetchSessionLogs = async () => {
    try {
      const API_URL = import.meta.env.VITE_API_URL || '';
      const res = await axios.get(`${API_URL}/api/superadmin/session-logs`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.data.success) {
        setSessionLogs(res.data.data);
      }
    } catch (err) {
      console.error("Failed to fetch session logs", err);
    }
  };

  const executeAction = async () => {
    if (!confirmModal.password) {
      setConfirmModal(prev => ({ ...prev, error: "Password is required." }));
      return;
    }
    
    try {
      const API_URL = import.meta.env.VITE_API_URL || '';
      
      if (confirmModal.action === 'approve') {
        await axios.patch(`${API_URL}/api/admin/saless/${confirmModal.accountId}/status`, {
          status: 'active',
          adminPassword: confirmModal.password
        }, {
          headers: { Authorization: `Bearer ${token}` }
        });
      } else if (confirmModal.action === 'reject') {
        await axios.delete(`${API_URL}/api/admin/saless/${confirmModal.accountId}`, {
          headers: { Authorization: `Bearer ${token}` },
          data: { adminPassword: confirmModal.password }
        });
      }
      
      setConfirmModal({ show: false, action: null, accountId: null, password: '', error: '' });
      fetchPendingAccounts();
    } catch (err) {
      console.error(`Failed to ${confirmModal.action} account`, err);
      setConfirmModal(prev => ({ 
        ...prev, 
        error: err.response?.data?.error || `Failed to ${confirmModal.action} account.` 
      }));
    }
  };

  const verifyAccount = (id) => {
    setConfirmModal({ show: true, action: 'approve', accountId: id, password: '', error: '' });
  };

  const rejectAccount = (id) => {
    setConfirmModal({ show: true, action: 'reject', accountId: id, password: '', error: '' });
  };

  const toggleStatus = async (key) => {
    const currentStatus = statuses[key];
    const newStatus = currentStatus === 'online' ? 'offline' : 'online';
    
    // Optimistic UI update
    setStatuses(prev => ({ ...prev, [key]: newStatus }));

    try {
      const API_URL = import.meta.env.VITE_API_URL || '';
      await axios.put(`${API_URL}/api/superadmin/status`, {
        key,
        value: newStatus
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
    } catch (err) {
      console.error("Failed to update status", err);
      // Revert on error
      setStatuses(prev => ({ ...prev, [key]: currentStatus }));
      alert("Failed to update status.");
    }
  };

  const portals = [
    { key: 'customer_portal_status', name: 'Customer Portal', icon: <StorefrontIcon sx={{ fontSize: 32 }} /> },
    { key: 'admin_portal_status', name: 'Admin Portal', icon: <AdminPanelSettingsIcon sx={{ fontSize: 32 }} /> },
    { key: 'sales_portal_status', name: 'Sales Portal', icon: <BadgeIcon sx={{ fontSize: 32 }} /> },
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-[#020617] flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-indigo-500/20 border-t-indigo-500 rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#020617', color: '#f8fafc', padding: '2rem', fontFamily: 'Inter, sans-serif' }}>
      <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
        
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '3rem', borderBottom: '1px solid rgba(148,163,184,0.1)', paddingBottom: '1.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <div style={{ background: 'rgba(99,102,241,0.1)', color: '#818cf8', padding: '10px', borderRadius: '12px' }}>
              <DeveloperModeIcon sx={{ fontSize: 28 }} />
            </div>
            <div>
              <h1 style={{ fontSize: '1.5rem', fontWeight: 700, margin: 0 }}>System Control Center</h1>
              <p style={{ fontSize: '0.85rem', color: '#94a3b8', margin: '4px 0 0 0' }}>Welcome, {user?.name}</p>
            </div>
          </div>
          <button
            onClick={() => setShowLogoutConfirm(true)}
            style={{
              display: 'flex', alignItems: 'center', gap: '8px',
              background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)', color: '#fca5a5',
              padding: '8px 16px', borderRadius: '8px', cursor: 'pointer', fontWeight: 600, fontSize: '0.9rem'
            }}
          >
            <PowerSettingsNewIcon sx={{ fontSize: 18 }} />
            Logout
          </button>
        </div>

        {/* Portals Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.5rem' }}>
          {portals.map((portal) => {
            const isOnline = statuses[portal.key] === 'online';
            return (
              <div key={portal.key} style={{
                background: 'rgba(30,41,59,0.5)',
                border: '1px solid rgba(148,163,184,0.1)',
                borderRadius: '16px',
                padding: '2rem',
                display: 'flex',
                flexDirection: 'column',
                gap: '1.5rem'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div style={{ color: isOnline ? '#34d399' : '#f87171' }}>
                    {portal.icon}
                  </div>
                  <span style={{
                    background: isOnline ? 'rgba(52,211,153,0.1)' : 'rgba(248,113,113,0.1)',
                    color: isOnline ? '#34d399' : '#f87171',
                    padding: '4px 12px',
                    borderRadius: '20px',
                    fontSize: '0.75rem',
                    fontWeight: 700,
                    textTransform: 'uppercase',
                    letterSpacing: '0.05em'
                  }}>
                    {isOnline ? 'Online' : 'Offline'}
                  </span>
                </div>
                
                <div>
                  <h3 style={{ fontSize: '1.25rem', fontWeight: 600, margin: '0 0 0.25rem 0' }}>{portal.name}</h3>
                  <p style={{ fontSize: '0.85rem', color: '#94a3b8', margin: 0 }}>
                    {isOnline ? 'System is running normally and accepting traffic.' : 'System is currently down for maintenance.'}
                  </p>
                </div>

                {/* Custom Toggle Switch */}
                <div style={{ marginTop: 'auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <span style={{ fontSize: '0.9rem', color: '#cbd5e1', fontWeight: 500 }}>
                    {isOnline ? 'Take Offline' : 'Bring Online'}
                  </span>
                  <div 
                    onClick={() => toggleStatus(portal.key)}
                    style={{
                      width: '56px',
                      height: '32px',
                      background: isOnline ? '#10b981' : 'rgba(15,23,42,0.8)',
                      border: isOnline ? 'none' : '1px solid rgba(148,163,184,0.2)',
                      borderRadius: '100px',
                      position: 'relative',
                      cursor: 'pointer',
                      transition: 'all 0.3s ease'
                    }}
                  >
                    <div style={{
                      width: '24px',
                      height: '24px',
                      background: 'white',
                      borderRadius: '50%',
                      position: 'absolute',
                      top: '4px',
                      left: isOnline ? '28px' : '4px',
                      transition: 'all 0.3s ease',
                      boxShadow: '0 2px 4px rgba(0,0,0,0.2)'
                    }} />
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Pending Account Approvals Section */}
        <div style={{ marginTop: '3rem' }}>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 600, margin: '0 0 1.5rem 0', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <BadgeIcon style={{ color: '#818cf8' }} /> Pending Account Approvals
          </h2>
          <div style={{
            background: 'rgba(30,41,59,0.5)', border: '1px solid rgba(148,163,184,0.1)',
            borderRadius: '16px', padding: '1.5rem', overflowX: 'auto'
          }}>
            <table style={{ width: '100%', textAlign: 'left', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ color: '#94a3b8', fontSize: '0.85rem', textTransform: 'uppercase', borderBottom: '1px solid rgba(148,163,184,0.1)' }}>
                  <th style={{ padding: '0 1rem 1rem 0' }}>User</th>
                  <th style={{ padding: '0 1rem 1rem 0' }}>Role</th>
                  <th style={{ padding: '0 1rem 1rem 0' }}>Created At</th>
                  <th style={{ padding: '0 0 1rem 0' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {pendingAccounts.length === 0 ? (
                  <tr>
                    <td colSpan="4" style={{ padding: '2rem 0', textAlign: 'center', color: '#64748b' }}>No pending accounts require approval.</td>
                  </tr>
                ) : (
                  pendingAccounts.map((acc, i) => (
                    <tr key={i} style={{ borderBottom: '1px solid rgba(148,163,184,0.05)' }}>
                      <td style={{ padding: '1rem 1rem 1rem 0' }}>
                        <div style={{ fontWeight: 600, color: '#e2e8f0' }}>{acc.name}</div>
                        <div style={{ fontSize: '0.8rem', color: '#64748b' }}>{acc.email}</div>
                      </td>
                      <td style={{ padding: '1rem 1rem 1rem 0', color: '#94a3b8', textTransform: 'capitalize' }}>{acc.role}</td>
                      <td style={{ padding: '1rem 1rem 1rem 0', color: '#94a3b8' }}>{new Date(acc.createdAt).toLocaleString()}</td>
                      <td style={{ padding: '1rem 0 1rem 0' }}>
                        <div style={{ display: 'flex', gap: '8px' }}>
                          <button
                            onClick={() => rejectAccount(acc.id)}
                            style={{
                              background: 'transparent', border: '1px solid rgba(239,68,68,0.3)', color: '#f87171',
                              padding: '6px 12px', borderRadius: '6px', cursor: 'pointer', fontWeight: 600, fontSize: '0.8rem',
                              transition: 'all 0.2s ease'
                            }}
                            onMouseOver={(e) => {
                              e.currentTarget.style.background = 'rgba(239,68,68,0.1)';
                            }}
                            onMouseOut={(e) => {
                              e.currentTarget.style.background = 'transparent';
                            }}
                          >
                            Reject
                          </button>
                          <button
                            onClick={() => verifyAccount(acc.id)}
                            style={{
                              background: 'rgba(52,211,153,0.1)', border: '1px solid rgba(52,211,153,0.2)', color: '#34d399',
                              padding: '6px 12px', borderRadius: '6px', cursor: 'pointer', fontWeight: 600, fontSize: '0.8rem',
                              transition: 'all 0.2s ease'
                            }}
                            onMouseOver={(e) => {
                              e.currentTarget.style.background = 'rgba(52,211,153,0.2)';
                            }}
                            onMouseOut={(e) => {
                              e.currentTarget.style.background = 'rgba(52,211,153,0.1)';
                            }}
                          >
                            Approve
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Password Confirmation Modal */}
        {confirmModal.show && (
          <div style={{
            position: 'fixed', top: 0, left: 0, width: '100%', height: '100%',
            background: 'rgba(2,6,23,0.8)', backdropFilter: 'blur(4px)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000
          }}>
            <div style={{
              background: '#0f172a', border: '1px solid rgba(148,163,184,0.1)',
              padding: '2rem', borderRadius: '16px', maxWidth: '400px', width: '90%'
            }}>
              <h3 style={{ margin: '0 0 1rem 0', fontSize: '1.25rem', fontWeight: 600 }}>
                {confirmModal.action === 'approve' ? 'Approve Account' : 'Reject Account'}
              </h3>
              <p style={{ color: '#94a3b8', fontSize: '0.9rem', marginBottom: '1.5rem' }}>
                Please enter your Super Admin password to confirm this action.
              </p>
              
              {confirmModal.error && (
                <div style={{ background: 'rgba(239,68,68,0.1)', color: '#f87171', padding: '10px', borderRadius: '8px', fontSize: '0.85rem', marginBottom: '1rem' }}>
                  {confirmModal.error}
                </div>
              )}

              <input
                type="password"
                placeholder="Super Admin Password"
                value={confirmModal.password}
                onChange={(e) => setConfirmModal(prev => ({ ...prev, password: e.target.value }))}
                style={{
                  width: '100%', padding: '12px', background: 'rgba(30,41,59,0.5)',
                  border: '1px solid rgba(148,163,184,0.2)', borderRadius: '8px',
                  color: '#f8fafc', marginBottom: '1.5rem', outline: 'none'
                }}
              />
              
              <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
                <button
                  onClick={() => setConfirmModal({ show: false, action: null, accountId: null, password: '', error: '' })}
                  style={{
                    background: 'transparent', color: '#94a3b8', border: 'none',
                    padding: '8px 16px', cursor: 'pointer', fontWeight: 600
                  }}
                >
                  Cancel
                </button>
                <button
                  onClick={executeAction}
                  style={{
                    background: confirmModal.action === 'approve' ? '#10b981' : '#ef4444',
                    color: 'white', border: 'none', borderRadius: '8px',
                    padding: '8px 16px', cursor: 'pointer', fontWeight: 600
                  }}
                >
                  Confirm {confirmModal.action === 'approve' ? 'Approval' : 'Rejection'}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Real-Time Monitoring Section */}
        <div style={{ marginTop: '3rem' }}>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 600, margin: '0 0 1.5rem 0', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <GroupIcon style={{ color: '#818cf8' }} /> Real-Time Online Users
          </h2>
          <div style={{
            background: 'rgba(30,41,59,0.5)', border: '1px solid rgba(148,163,184,0.1)',
            borderRadius: '16px', padding: '1.5rem', overflowX: 'auto'
          }}>
            <table style={{ width: '100%', textAlign: 'left', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ color: '#94a3b8', fontSize: '0.85rem', textTransform: 'uppercase', borderBottom: '1px solid rgba(148,163,184,0.1)' }}>
                  <th style={{ padding: '0 1rem 1rem 0' }}>User</th>
                  <th style={{ padding: '0 1rem 1rem 0' }}>Role</th>
                  <th style={{ padding: '0 1rem 1rem 0' }}>Sessions</th>
                  <th style={{ padding: '0 0 1rem 0' }}>Connected At</th>
                </tr>
              </thead>
              <tbody>
                {activeUsers.length === 0 ? (
                  <tr>
                    <td colSpan="4" style={{ padding: '2rem 0', textAlign: 'center', color: '#64748b' }}>No users currently online.</td>
                  </tr>
                ) : (
                  activeUsers.map((u, i) => (
                    <tr key={i} style={{ borderBottom: '1px solid rgba(148,163,184,0.05)' }}>
                      <td style={{ padding: '1rem 1rem 1rem 0' }}>
                        <div style={{ fontWeight: 600, color: '#e2e8f0' }}>{u.name}</div>
                        <div style={{ fontSize: '0.8rem', color: '#64748b' }}>{u.email}</div>
                      </td>
                      <td style={{ padding: '1rem 1rem 1rem 0', color: '#94a3b8', textTransform: 'capitalize' }}>{u.role}</td>
                      <td style={{ padding: '1rem 1rem 1rem 0', color: '#94a3b8' }}>{u.sessionCount} active connections</td>
                      <td style={{ padding: '1rem 0 1rem 0', color: '#94a3b8' }}>{new Date(u.connectedAt).toLocaleTimeString()}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Historical Session Logs */}
        <div style={{ marginTop: '3rem', marginBottom: '3rem' }}>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 600, margin: '0 0 1.5rem 0', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <HistoryIcon style={{ color: '#818cf8' }} /> Historical Session Logs
          </h2>
          <div style={{
            background: 'rgba(30,41,59,0.5)', border: '1px solid rgba(148,163,184,0.1)',
            borderRadius: '16px', padding: '1.5rem', overflowX: 'auto'
          }}>
            <table style={{ width: '100%', textAlign: 'left', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ color: '#94a3b8', fontSize: '0.85rem', textTransform: 'uppercase', borderBottom: '1px solid rgba(148,163,184,0.1)' }}>
                  <th style={{ padding: '0 1rem 1rem 0' }}>User</th>
                  <th style={{ padding: '0 1rem 1rem 0' }}>Role</th>
                  <th style={{ padding: '0 1rem 1rem 0' }}>Status</th>
                  <th style={{ padding: '0 1rem 1rem 0' }}>Device Info</th>
                  <th style={{ padding: '0 0 1rem 0' }}>Logged In At</th>
                  <th style={{ padding: '0 0 1rem 0' }}>Logged Out At</th>
                </tr>
              </thead>
              <tbody>
                {sessionLogs.length === 0 ? (
                  <tr>
                    <td colSpan="6" style={{ padding: '2rem 0', textAlign: 'center', color: '#64748b' }}>No session logs available.</td>
                  </tr>
                ) : (
                  sessionLogs.map((log) => (
                    <tr key={log.id} style={{ borderBottom: '1px solid rgba(148,163,184,0.05)' }}>
                      <td style={{ padding: '1rem 1rem 1rem 0' }}>
                        <div style={{ fontWeight: 600, color: '#e2e8f0' }}>{log.user?.name || 'Unknown'}</div>
                        <div style={{ fontSize: '0.8rem', color: '#64748b' }}>{log.user?.email || 'N/A'}</div>
                      </td>
                      <td style={{ padding: '1rem 1rem 1rem 0', color: '#94a3b8', textTransform: 'capitalize' }}>{log.user?.role || 'N/A'}</td>
                      <td style={{ padding: '1rem 1rem 1rem 0' }}>
                        <span style={{
                          background: log.isActive ? 'rgba(52,211,153,0.1)' : 'rgba(148,163,184,0.1)',
                          color: log.isActive ? '#34d399' : '#94a3b8',
                          padding: '4px 8px', borderRadius: '4px', fontSize: '0.75rem', fontWeight: 600
                        }}>
                          {log.isActive ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      <td style={{ padding: '1rem 1rem 1rem 0', color: '#94a3b8', fontSize: '0.8rem', maxWidth: '200px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }} title={log.deviceInfo}>
                        {log.deviceInfo || 'Unknown'}
                      </td>
                      <td style={{ padding: '1rem 0 1rem 0', color: '#94a3b8', fontSize: '0.85rem' }}>{new Date(log.createdAt).toLocaleString()}</td>
                      <td style={{ padding: '1rem 0 1rem 0', color: '#94a3b8', fontSize: '0.85rem' }}>{log.loggedOutAt ? new Date(log.loggedOutAt).toLocaleString() : '-'}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

      </div>

      {/* Logout Confirmation Modal */}
      {showLogoutConfirm && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, zIndex: 9999,
          background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center'
        }}>
          <div style={{
            background: '#0f172a', border: '1px solid rgba(148,163,184,0.2)',
            borderRadius: '16px', padding: '2rem', maxWidth: '400px', width: '90%',
            boxShadow: '0 25px 50px -12px rgba(0,0,0,0.5)', textAlign: 'center'
          }}>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 600, color: '#f8fafc', margin: '0 0 1rem 0' }}>
              Confirm Logout
            </h3>
            <p style={{ color: '#94a3b8', fontSize: '0.9rem', marginBottom: '2rem' }}>
              Are you sure you want to log out of the System Control Center?
            </p>
            <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
              <button
                onClick={() => setShowLogoutConfirm(false)}
                style={{
                  padding: '10px 24px', borderRadius: '8px', background: 'transparent',
                  border: '1px solid rgba(148,163,184,0.3)', color: '#cbd5e1', cursor: 'pointer', fontWeight: 500
                }}
              >
                Cancel
              </button>
              <button
                onClick={logout}
                style={{
                  padding: '10px 24px', borderRadius: '8px', background: '#ef4444',
                  border: 'none', color: '#fff', cursor: 'pointer', fontWeight: 500
                }}
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default SuperAdminDashboardPage;
