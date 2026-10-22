import React, { useState, useEffect, useMemo, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';
import { io } from 'socket.io-client';
import { toast, Toaster } from 'react-hot-toast';
import { usePreventBackToLogin } from '../../hooks/usePreventBackToLogin';
import { validateRealisticEmail } from '../../utils/emailValidator';
import {
  Shield,
  ShieldCheck,
  ShieldAlert,
  Activity,
  Users,
  Clock,
  Eye,
  EyeOff,
  RefreshCw,
  Power,
  Search,
  Download,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Cpu,
  Wifi,
  Globe,
  Laptop,
  Smartphone,
  Radio,
  Check,
  X,
  Server,
  Database,
  Layers,
  ChevronLeft,
  ChevronRight,
  Terminal,
  CircleDot,
  HardDrive,
  UserPlus,
  Key,
  Filter,
} from 'lucide-react';

const SuperAdminDashboardPage = () => {
  usePreventBackToLogin();
  const navigate = useNavigate();
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
  const [allAccounts, setAllAccounts] = useState([]);
  const [accountsSearch, setAccountsSearch] = useState('');
  const [accountsRoleFilter, setAccountsRoleFilter] = useState('all');
  const [accountsStatusFilter, setAccountsStatusFilter] = useState('all');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [createForm, setCreateForm] = useState({
    name: '',
    email: '',
    password: '',
    role: 'admin',
    contactNumber: '',
    status: 'active',
  });
  const [showCreatePassword, setShowCreatePassword] = useState(false);
  const [creatingAccount, setCreatingAccount] = useState(false);
  const [createError, setCreateError] = useState('');
  const [systemInfo, setSystemInfo] = useState(null);
  const [latencyMs, setLatencyMs] = useState(null);
  const [testingLatency, setTestingLatency] = useState(false);

  const [currentTime, setCurrentTime] = useState(new Date());

  const [activeTab, setActiveTab] = useState('portals');

  const [activeUsersSearch, setActiveUsersSearch] = useState('');
  const [logsSearch, setLogsSearch] = useState('');
  const [logsStatusFilter, setLogsStatusFilter] = useState('all');
  const [logsRoleFilter, setLogsRoleFilter] = useState('all');
  const [logsPage, setLogsPage] = useState(1);
  const [logsPerPage, setLogsPerPage] = useState(10);

  const [countdown, setCountdown] = useState(10);
  const [refreshing, setRefreshing] = useState(false);

  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [confirmModal, setConfirmModal] = useState({
    show: false,
    action: null,
    account: null,
    password: '',
    error: '',
    submitting: false,
    showPassword: false,
  });
  const [portalConfirmModal, setPortalConfirmModal] = useState({
    show: false,
    portalKey: null,
    targetStatus: null,
    portalName: '',
  });

  const socketRef = useRef(null);

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    fetchAllData();

    const intervalId = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          fetchAllData(false);
          return 10;
        }
        return prev - 1;
      });
    }, 1000);

    const API_URL = import.meta.env.VITE_API_URL || '';
    const socket = io(API_URL, {
      auth: { user },
    });
    socketRef.current = socket;

    socket.emit('join_room', 'superadmin');

    socket.on('active_users_update', (users) => {
      setActiveUsers(users || []);
    });

    socket.on('system_status_updated', ({ key, value }) => {
      setStatuses((prev) => ({ ...prev, [key]: value }));
      toast(`Portal ${key.replace(/_/g, ' ')} changed to ${value.toUpperCase()}`, {
        icon: value === 'online' ? '🟢' : '🔴',
      });
    });

    return () => {
      clearInterval(intervalId);
      socket.disconnect();
    };
  }, [token]);

  const fetchAllData = async (showToast = false) => {
    try {
      setRefreshing(true);
      await Promise.allSettled([
        fetchStatuses(),
        fetchActiveUsers(),
        fetchSessionLogs(),
        fetchAccounts(),
        fetchSystemInfo(),
      ]);
      if (showToast) {
        toast.success('Telemetry synchronized');
      }
    } finally {
      setRefreshing(false);
      setLoading(false);
    }
  };

  const fetchAccounts = async () => {
    try {
      const API_URL = import.meta.env.VITE_API_URL || '';
      const res = await axios.get(`${API_URL}/api/admin/sales`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.data.success) {
        const data = res.data.data || [];
        setAllAccounts(data);
        setPendingAccounts(data.filter((acc) => acc.status === 'pending'));
      }
    } catch (err) {
      console.error('Failed to fetch accounts', err);
    }
  };

  const fetchStatuses = async () => {
    try {
      const API_URL = import.meta.env.VITE_API_URL || '';
      const res = await axios.get(`${API_URL}/api/superadmin/status`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.data.success) {
        setStatuses(res.data.data);
      }
    } catch (err) {
      console.error('Failed to fetch statuses', err);
    }
  };

  const fetchActiveUsers = async () => {
    try {
      const API_URL = import.meta.env.VITE_API_URL || '';
      const res = await axios.get(`${API_URL}/api/superadmin/active-users`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.data.success) {
        setActiveUsers(res.data.data || []);
      }
    } catch (err) {
      console.error('Failed to fetch active users', err);
    }
  };

  const fetchSessionLogs = async () => {
    try {
      const API_URL = import.meta.env.VITE_API_URL || '';
      const res = await axios.get(`${API_URL}/api/superadmin/session-logs`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.data.success) {
        setSessionLogs(res.data.data || []);
      }
    } catch (err) {
      console.error('Failed to fetch session logs', err);
    }
  };

  const fetchSystemInfo = async () => {
    try {
      const API_URL = import.meta.env.VITE_API_URL || '';
      const res = await axios.get(`${API_URL}/api/superadmin/system-info`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.data.success) {
        setSystemInfo(res.data.data);
      }
    } catch (err) {
      console.error('Failed to fetch system info', err);
    }
  };

  const measureLatency = async () => {
    setTestingLatency(true);
    const start = performance.now();
    try {
      const API_URL = import.meta.env.VITE_API_URL || '';
      await axios.get(`${API_URL}/api/system/status`);
      const duration = Math.round(performance.now() - start);
      setLatencyMs(duration);
      toast.success(`Server latency: ${duration}ms`);
    } catch (err) {
      setLatencyMs(null);
      toast.error('Latency measurement failed');
    } finally {
      setTestingLatency(false);
    }
  };

  // Safe Portal Toggle
  const requestTogglePortal = (key, name) => {
    const currentStatus = statuses[key];
    const newStatus = currentStatus === 'online' ? 'offline' : 'online';

    // If bringing offline, warn superadmin to prevent accidental service outage
    if (newStatus === 'offline') {
      setPortalConfirmModal({
        show: true,
        portalKey: key,
        targetStatus: newStatus,
        portalName: name,
      });
    } else {
      executePortalToggle(key, newStatus);
    }
  };

  const executePortalToggle = async (key, targetStatus) => {
    const currentStatus = statuses[key];
    // Optimistic UI update
    setStatuses((prev) => ({ ...prev, [key]: targetStatus }));
    setPortalConfirmModal({ show: false, portalKey: null, targetStatus: null, portalName: '' });

    try {
      const API_URL = import.meta.env.VITE_API_URL || '';
      await axios.put(
        `${API_URL}/api/superadmin/status`,
        {
          key,
          value: targetStatus,
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      toast.success(`${key.replace(/_/g, ' ').toUpperCase()} is now ${targetStatus.toUpperCase()}`);
    } catch (err) {
      console.error('Failed to update status', err);
      // Revert on error
      setStatuses((prev) => ({ ...prev, [key]: currentStatus }));
      toast.error('Failed to update portal status');
    }
  };

  const executeAccountAction = async () => {
    if (!confirmModal.password) {
      setConfirmModal((prev) => ({ ...prev, error: 'Super Admin password is required.' }));
      return;
    }

    setConfirmModal((prev) => ({ ...prev, submitting: true, error: '' }));

    try {
      const API_URL = import.meta.env.VITE_API_URL || '';

      if (confirmModal.action === 'approve') {
        await axios.patch(
          `${API_URL}/api/admin/sales/${confirmModal.account.id}/status`,
          {
            status: 'active',
            adminPassword: confirmModal.password,
          },
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        toast.success(`Account approved: ${confirmModal.account.email}`);
      } else if (confirmModal.action === 'reject') {
        await axios.delete(`${API_URL}/api/admin/sales/${confirmModal.account.id}`, {
          headers: { Authorization: `Bearer ${token}` },
          data: { adminPassword: confirmModal.password },
        });
        toast.success(`Account rejected & purged: ${confirmModal.account.email}`);
      }

      setConfirmModal({
        show: false,
        action: null,
        account: null,
        password: '',
        error: '',
        submitting: false,
        showPassword: false,
      });
      fetchAccounts();
    } catch (err) {
      console.error(`Failed to ${confirmModal.action} account`, err);
      setConfirmModal((prev) => ({
        ...prev,
        submitting: false,
        error: err.response?.data?.error || `Failed to ${confirmModal.action} account. Verify your password.`,
      }));
    }
  };

  const promptApproveAccount = (acc) => {
    setConfirmModal({
      show: true,
      action: 'approve',
      account: acc,
      password: '',
      error: '',
      submitting: false,
      showPassword: false,
    });
  };

  const promptRejectAccount = (acc) => {
    setConfirmModal({
      show: true,
      action: 'reject',
      account: acc,
      password: '',
      error: '',
      submitting: false,
      showPassword: false,
    });
  };

  const exportLogsToCSV = () => {
    if (!sessionLogs || sessionLogs.length === 0) {
      toast.error('No session logs to export');
      return;
    }

    const headers = ['Session ID', 'User ID', 'User Email', 'User Role', 'Status', 'Device Info', 'IP Address', 'Logged In At', 'Logged Out At'];
    const rows = sessionLogs.map((log) => [
      log.id,
      log.userId,
      `"${log.user?.email || 'N/A'}"`,
      `"${log.user?.role || 'N/A'}"`,
      log.isActive ? 'Active' : 'Inactive',
      `"${(log.deviceInfo || 'Unknown').replace(/"/g, '""')}"`,
      `"${log.ipAddress || 'N/A'}"`,
      `"${log.createdAt ? new Date(log.createdAt).toLocaleString() : 'N/A'}"`,
      `"${log.loggedOutAt ? new Date(log.loggedOutAt).toLocaleString() : 'Currently Active'}"`,
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `mega_pacific_sessions_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success('Session audit logs exported to CSV');
  };

  const parseDevice = (uaString) => {
    const ua = (uaString || '').toLowerCase();
    let browser = 'Browser';
    let isMobile = ua.includes('mobile') || ua.includes('android') || ua.includes('iphone');
    if (ua.includes('edg')) browser = 'Edge';
    else if (ua.includes('chrome')) browser = 'Chrome';
    else if (ua.includes('firefox')) browser = 'Firefox';
    else if (ua.includes('safari')) browser = 'Safari';

    let os = 'OS';
    if (ua.includes('windows')) os = 'Windows';
    else if (ua.includes('macintosh') || ua.includes('mac os')) os = 'macOS';
    else if (ua.includes('linux')) os = 'Linux';
    else if (ua.includes('android')) os = 'Android';
    else if (ua.includes('iphone') || ua.includes('ipad')) os = 'iOS';

    return { browser, os, isMobile };
  };


  const filteredAccounts = useMemo(() => {
    return allAccounts.filter((acc) => {
      const q = accountsSearch.toLowerCase();
      const matchSearch =
        acc.name?.toLowerCase().includes(q) ||
        acc.email?.toLowerCase().includes(q) ||
        acc.role?.toLowerCase().includes(q);
      const matchRole =
        accountsRoleFilter === 'all' ||
        acc.role?.toLowerCase() === accountsRoleFilter.toLowerCase();
      const matchStatus =
        accountsStatusFilter === 'all' ||
        acc.status?.toLowerCase() === accountsStatusFilter.toLowerCase();
      return matchSearch && matchRole && matchStatus;
    });
  }, [allAccounts, accountsSearch, accountsRoleFilter, accountsStatusFilter]);

  const generateRandomPassword = () => {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789!@#$%&*';
    let pwd = '';
    for (let i = 0; i < 12; i++) {
      pwd += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setCreateForm((prev) => ({ ...prev, password: pwd }));
    setShowCreatePassword(true);
    toast.success('Generated secure password');
  };

  const handleCreateAccount = async (e) => {
    e.preventDefault();
    if (!createForm.email || !createForm.password || !createForm.name) {
      setCreateError('Name, email, and password are required.');
      return;
    }
    const cleanEmail = createForm.email.trim().toLowerCase();
    const emailCheck = validateRealisticEmail(cleanEmail);
    if (!emailCheck.isValid) {
      setCreateError(emailCheck.error);
      return;
    }

    // Strict Singleton Rule: Only one account can exist for Super Admin, Admin, Owner, Sales, Finance, Logistic
    const existingRoleAccount = allAccounts.find(
      (a) => a.role === createForm.role && a.status !== 'deleted'
    );
    if (existingRoleAccount) {
      setCreateError(
        `Account creation rejected: Only one account can exist for ${createForm.role.toUpperCase()}. An active account already exists (${existingRoleAccount.email}). Creating another one is not allowed.`
      );
      return;
    }

    const alreadyExists = allAccounts.find(
      (a) => a.email && a.email.trim().toLowerCase() === cleanEmail
    );
    if (alreadyExists) {
      setCreateError(
        `Account creation rejected: An account with email "${alreadyExists.email}" already exists with role '${(alreadyExists.role || '').toUpperCase()}'.`
      );
      return;
    }

    setCreatingAccount(true);
    setCreateError('');
    try {
      const API_URL = import.meta.env.VITE_API_URL || '';
      const res = await axios.post(`${API_URL}/api/admin/sales`, {
        ...createForm,
        email: cleanEmail
      }, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.data.success) {
        toast.success(`Account for ${res.data.data?.name || createForm.email} (${createForm.role.toUpperCase()}) created!`);
        setShowCreateModal(false);
        setCreateForm({
          name: '',
          email: '',
          password: '',
          role: 'admin',
          contactNumber: '',
          status: 'active',
        });
        fetchAccounts();
      }
    } catch (err) {
      console.error('Failed to create account', err);
      setCreateError(err.response?.data?.error || 'Failed to create account. Please verify input.');
    } finally {
      setCreatingAccount(false);
    }
  };

  const isRoleTaken = (role) => {
    return allAccounts.some((a) => a.role === role && a.status !== 'deleted');
  };
  const isCurrentRoleTaken = isRoleTaken(createForm.role);
  const existingAccountForSelectedRole = allAccounts.find(
    (a) => a.role === createForm.role && a.status !== 'deleted'
  );
  const allSingletonRolesTaken = ['admin', 'owner', 'sales', 'logistic', 'finance'].every((r) => isRoleTaken(r));

  const filteredActiveUsers = useMemo(() => {
    return activeUsers.filter((u) => {
      const q = activeUsersSearch.toLowerCase();
      return (
        u.name?.toLowerCase().includes(q) ||
        u.email?.toLowerCase().includes(q) ||
        u.role?.toLowerCase().includes(q)
      );
    });
  }, [activeUsers, activeUsersSearch]);

  const filteredLogs = useMemo(() => {
    return sessionLogs.filter((log) => {
      const q = (logsSearch || '').trim().toLowerCase();
      const userEmail = (log.user?.email || '').toLowerCase();
      const userRole = (log.user?.role || '').toLowerCase();
      const deviceInfo = (log.deviceInfo || '').toLowerCase();
      const ipAddress = (log.ipAddress || '').toLowerCase();

      const matchesSearch =
        !q ||
        userEmail.includes(q) ||
        userRole.includes(q) ||
        deviceInfo.includes(q) ||
        ipAddress.includes(q);

      const matchesStatus =
        logsStatusFilter === 'all' ||
        (logsStatusFilter === 'active' && log.isActive) ||
        (logsStatusFilter === 'inactive' && !log.isActive);

      const matchesRole =
        logsRoleFilter === 'all' ||
        userRole === logsRoleFilter.toLowerCase();

      return matchesSearch && matchesStatus && matchesRole;
    });
  }, [sessionLogs, logsSearch, logsStatusFilter, logsRoleFilter]);

  const totalLogsPages = Math.ceil(filteredLogs.length / logsPerPage) || 1;
  const paginatedLogs = useMemo(() => {
    const start = (logsPage - 1) * logsPerPage;
    return filteredLogs.slice(start, start + logsPerPage);
  }, [filteredLogs, logsPage, logsPerPage]);

  const portals = [
    {
      key: 'customer_portal_status',
      name: 'Customer Storefront',
      badge: 'Public E-Commerce',
      icon: <Globe className="w-6 h-6" />,
      route: '/',
      description: 'Public storefront interface for product catalog, custom pre-orders, and customer order tracking.',
    },
    {
      key: 'admin_portal_status',
      name: 'Admin Backoffice',
      badge: 'Management Core',
      icon: <Shield className="w-6 h-6" />,
      route: '/admin',
      description: 'Backoffice management portal for inventory, catalog configuration, and operational oversight.',
    },
    {
      key: 'sales_portal_status',
      name: 'Sales Staff Portal',
      badge: 'Point of Sale',
      icon: <Layers className="w-6 h-6" />,
      route: '/sales',
      description: 'Internal POS terminal and quotation manager for sales representatives and cashiers.',
    },
  ];

  const onlinePortalsCount = Object.values(statuses).filter((s) => s === 'online').length;
  const activeSessionsCount = sessionLogs.filter((s) => s.isActive).length;

  const roleColorBadge = (role) => {
    switch (role?.toLowerCase()) {
      case 'superadmin':
      case 'super_admin':
        return 'bg-purple-500/10 text-purple-300 border-purple-500/30';
      case 'owner':
        return 'bg-amber-500/10 text-amber-300 border-amber-500/30';
      case 'admin':
        return 'bg-sky-500/10 text-sky-300 border-sky-500/30';
      case 'sales':
        return 'bg-emerald-500/10 text-emerald-300 border-emerald-500/30';
      case 'finance':
        return 'bg-indigo-500/10 text-indigo-300 border-indigo-500/30';
      case 'logistic':
        return 'bg-orange-500/10 text-orange-300 border-orange-500/30';
      default:
        return 'bg-slate-500/10 text-slate-300 border-slate-500/30';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#060913] flex flex-col items-center justify-center text-slate-300">
        <div className="relative flex items-center justify-center mb-4">
          <div className="w-14 h-14 rounded-full border-2 border-indigo-500/20 border-t-indigo-500 animate-spin" />
          <Terminal className="w-6 h-6 text-indigo-400 absolute" />
        </div>
        <p className="text-xs font-mono tracking-widest text-slate-400 uppercase">
          Initializing Mission Control HUD...
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#060913] text-slate-100 font-sans selection:bg-indigo-500/30 selection:text-indigo-200">
      <Toaster
        position="top-right"
        toastOptions={{
          style: {
            background: '#0f172a',
            color: '#f8fafc',
            border: '1px solid rgba(148, 163, 184, 0.2)',
            borderRadius: '12px',
            fontSize: '13px',
            fontFamily: 'Inter, sans-serif',
          },
        }}
      />

      <div className="fixed top-0 left-1/4 w-[500px] h-[500px] bg-indigo-600/5 rounded-full blur-[140px] pointer-events-none" />
      <div className="fixed bottom-0 right-1/4 w-[500px] h-[500px] bg-sky-500/5 rounded-full blur-[140px] pointer-events-none" />

      <header className="sticky top-0 z-30 bg-[#060913]/85 backdrop-blur-xl border-b border-slate-800/80 px-4 sm:px-8 py-3.5 transition-all">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500/20 to-sky-500/10 border border-indigo-500/30 flex items-center justify-center text-indigo-400 shadow-[0_0_15px_rgba(99,102,241,0.2)]">
              <Terminal className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-base sm:text-lg font-bold tracking-tight text-white flex items-center gap-2">
                  Mega Pacific Mission Control
                </h1>
                <span className="hidden sm:inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-mono uppercase bg-indigo-950/90 text-indigo-300 border border-indigo-500/30">
                  <ShieldCheck className="w-3 h-3 text-indigo-400" />
                  ROOT-0
                </span>
              </div>
              <div className="flex items-center gap-3 text-xs text-slate-400 font-mono mt-0.5">
                <span className="flex items-center gap-1.5 text-emerald-400">
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                  </span>
                  LIVE NODE
                </span>
                <span className="text-slate-600">|</span>
                <span className="text-slate-400 flex items-center gap-1">
                  <Clock className="w-3 h-3 text-slate-500" />
                  {currentTime.toLocaleTimeString()}
                </span>
                <span className="hidden lg:inline text-slate-500">
                  ({currentTime.toUTCString().slice(17, 25)} UTC)
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2.5 sm:gap-3 flex-wrap">
            <div className="flex items-center gap-2 px-3 py-1.5 bg-slate-900/80 border border-slate-800 rounded-xl text-xs font-mono text-slate-400">
              <span className="text-slate-500 hidden sm:inline">SYNC IN:</span>
              <span className="text-indigo-400 font-bold w-4 text-center">{countdown}s</span>
              <button
                onClick={() => fetchAllData(true)}
                disabled={refreshing}
                title="Synchronize Telemetry Now"
                className="p-1 hover:text-indigo-300 focus:outline-none transition-colors"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? 'animate-spin text-indigo-400' : ''}`} />
              </button>
            </div>

            <div className="flex items-center gap-2 px-3 py-1.5 bg-slate-900/80 border border-slate-800 rounded-xl text-xs">
              <div className="w-6 h-6 rounded-lg bg-indigo-500/20 text-indigo-300 flex items-center justify-center font-bold text-[11px]">
                {user?.name?.[0]?.toUpperCase() || 'S'}
              </div>
              <div className="hidden sm:block text-left">
                <div className="font-medium text-slate-200 leading-tight">{user?.name || 'Super Admin'}</div>
                <div className="text-[10px] text-indigo-400 font-mono">ROOT CLEARANCE</div>
              </div>
            </div>


            <button
              onClick={() => setShowLogoutConfirm(true)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 border border-rose-500/20 hover:border-rose-500/30 transition-all focus:outline-none"
            >
              <Power className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Logout</span>
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-8 py-6 sm:py-8 space-y-6 sm:space-y-8">
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-slate-900/60 backdrop-blur-xl border border-slate-800/80 rounded-2xl p-5 shadow-lg relative overflow-hidden group hover:border-slate-700/80 transition-all">
            <div className="flex items-center justify-between text-slate-400 mb-2">
              <span className="text-xs font-mono uppercase tracking-wider">Fleet Operational</span>
              <Server className="w-4 h-4 text-indigo-400" />
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-bold font-mono text-white">
                {onlinePortalsCount}/3
              </span>
              <span className={`text-xs font-semibold ${onlinePortalsCount === 3 ? 'text-emerald-400' : 'text-amber-400'}`}>
                {onlinePortalsCount === 3 ? 'All Normal' : 'Degraded State'}
              </span>
            </div>
            <div className="mt-3 flex items-center gap-1.5">
              {portals.map((p) => (
                <div
                  key={p.key}
                  title={`${p.name}: ${statuses[p.key]}`}
                  className={`h-1.5 flex-1 rounded-full ${
                    statuses[p.key] === 'online' ? 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]' : 'bg-rose-500'
                  }`}
                />
              ))}
            </div>
          </div>

          <div className="bg-slate-900/60 backdrop-blur-xl border border-slate-800/80 rounded-2xl p-5 shadow-lg relative overflow-hidden group hover:border-slate-700/80 transition-all">
            <div className="flex items-center justify-between text-slate-400 mb-2">
              <span className="text-xs font-mono uppercase tracking-wider">Active Sockets</span>
              <Radio className="w-4 h-4 text-emerald-400 animate-pulse" />
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-bold font-mono text-white">
                {activeUsers.length}
              </span>
              <span className="text-xs text-slate-400">Users Online</span>
            </div>
            <div className="mt-3 text-xs text-slate-400 flex items-center justify-between font-mono">
              <span>STREAM: ACTIVE</span>
              <span className="text-emerald-400">WEBSOCKET</span>
            </div>
          </div>

          <div 
            onClick={() => {
              setActiveTab('accounts');
              setAccountsStatusFilter(pendingAccounts.length > 0 ? 'pending' : 'all');
            }}
            className={`cursor-pointer bg-slate-900/60 backdrop-blur-xl border rounded-2xl p-5 shadow-lg relative overflow-hidden group transition-all ${
            pendingAccounts.length > 0 ? 'border-amber-500/40 bg-amber-950/10' : 'border-slate-800/80 hover:border-slate-700/80'
          }`}>
            <div className="flex items-center justify-between text-slate-400 mb-2">
              <span className="text-xs font-mono uppercase tracking-wider">Pending Authorizations</span>
              <ShieldAlert className={`w-4 h-4 ${pendingAccounts.length > 0 ? 'text-amber-400 animate-bounce' : 'text-slate-500'}`} />
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-bold font-mono text-white">
                {pendingAccounts.length}
              </span>
              <span className={`text-xs font-semibold ${pendingAccounts.length > 0 ? 'text-amber-400' : 'text-slate-400'}`}>
                {pendingAccounts.length > 0 ? 'Requires Root Approval' : 'Queue Clear'}
              </span>
            </div>
            <div className="mt-3 text-xs text-slate-400 font-mono">
              {pendingAccounts.length > 0 ? (
                <span className="text-amber-400">Review requested roles</span>
              ) : (
                <span>Zero pending accounts</span>
              )}
            </div>
          </div>

          <div className="bg-slate-900/60 backdrop-blur-xl border border-slate-800/80 rounded-2xl p-5 shadow-lg relative overflow-hidden group hover:border-slate-700/80 transition-all">
            <div className="flex items-center justify-between text-slate-400 mb-2">
              <span className="text-xs font-mono uppercase tracking-wider">Audit Trail (Recent)</span>
              <Activity className="w-4 h-4 text-sky-400" />
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-bold font-mono text-white">
                {sessionLogs.length}
              </span>
              <span className="text-xs text-emerald-400 font-mono font-medium">
                {activeSessionsCount} active
              </span>
            </div>
            <div className="mt-3 text-xs text-slate-400 font-mono flex items-center justify-between">
              <span>LIMIT: 100 RECORDS</span>
              <button
                onClick={exportLogsToCSV}
                className="text-indigo-400 hover:text-indigo-300 transition-colors inline-flex items-center gap-1"
              >
                <Download className="w-3 h-3" />
                <span>Export</span>
              </button>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between border-b border-slate-800 pb-3 flex-wrap gap-3">
          <nav className="flex items-center gap-1.5 sm:gap-2 p-1.5 bg-slate-900/90 border border-slate-800 rounded-2xl overflow-x-auto max-w-full">
            <button
              onClick={() => setActiveTab('portals')}
              className={`px-3.5 py-2 rounded-xl text-xs sm:text-sm font-medium transition-all flex items-center gap-2 whitespace-nowrap ${
                activeTab === 'portals'
                  ? 'bg-indigo-600 text-white shadow-[0_0_15px_rgba(99,102,241,0.4)]'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
              }`}
            >
              <Server className="w-4 h-4" />
              <span>Fleet & Portals</span>
            </button>

            <button
              onClick={() => setActiveTab('accounts')}
              className={`px-3.5 py-2 rounded-xl text-xs sm:text-sm font-medium transition-all flex items-center gap-2 whitespace-nowrap relative ${
                activeTab === 'accounts' || activeTab === 'pending'
                  ? 'bg-indigo-600 text-white shadow-[0_0_15px_rgba(99,102,241,0.4)]'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
              }`}
            >
              <Users className="w-4 h-4" />
              <span>Accounts & Provisioning</span>
              {pendingAccounts.length > 0 && (
                <span className="w-5 h-5 rounded-full bg-amber-500 text-slate-950 font-bold text-[11px] flex items-center justify-center font-mono">
                  {pendingAccounts.length}
                </span>
              )}
            </button>

            <button
              onClick={() => setActiveTab('live')}
              className={`px-3.5 py-2 rounded-xl text-xs sm:text-sm font-medium transition-all flex items-center gap-2 whitespace-nowrap ${
                activeTab === 'live'
                  ? 'bg-indigo-600 text-white shadow-[0_0_15px_rgba(99,102,241,0.4)]'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
              }`}
            >
              <Radio className="w-4 h-4" />
              <span>Live Sockets</span>
              <span className="px-1.5 py-0.5 rounded text-[11px] font-mono bg-slate-800 text-slate-300">
                {activeUsers.length}
              </span>
            </button>

            <button
              onClick={() => setActiveTab('logs')}
              className={`px-3.5 py-2 rounded-xl text-xs sm:text-sm font-medium transition-all flex items-center gap-2 whitespace-nowrap ${
                activeTab === 'logs'
                  ? 'bg-indigo-600 text-white shadow-[0_0_15px_rgba(99,102,241,0.4)]'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
              }`}
            >
              <Activity className="w-4 h-4" />
              <span>Session Audit Trail</span>
            </button>

            <button
              onClick={() => setActiveTab('diagnostics')}
              className={`px-3.5 py-2 rounded-xl text-xs sm:text-sm font-medium transition-all flex items-center gap-2 whitespace-nowrap ${
                activeTab === 'diagnostics'
                  ? 'bg-indigo-600 text-white shadow-[0_0_15px_rgba(99,102,241,0.4)]'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
              }`}
            >
              <Cpu className="w-4 h-4" />
              <span>Diagnostics</span>
            </button>
          </nav>
        </div>

        {activeTab === 'portals' && (
          <section className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-bold text-white tracking-tight">Portal Fleet Operations</h2>
                <p className="text-xs sm:text-sm text-slate-400">
                  Control operational availability and maintenance states across client gateways.
                </p>
              </div>
              <span className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-mono bg-slate-900 border border-slate-800 text-slate-400">
                <CircleDot className="w-3.5 h-3.5 text-indigo-400" />
                Guarded Switches Active
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {portals.map((portal) => {
                const isOnline = statuses[portal.key] === 'online';
                return (
                  <div
                    key={portal.key}
                    className={`bg-slate-900/60 backdrop-blur-xl border rounded-2xl p-6 flex flex-col justify-between transition-all duration-300 relative overflow-hidden group shadow-lg ${
                      isOnline
                        ? 'border-slate-800/80 hover:border-emerald-500/40'
                        : 'border-rose-900/50 bg-rose-950/10 hover:border-rose-500/50'
                    }`}
                  >
                    <div
                      className={`absolute top-0 left-0 right-0 h-1 transition-colors ${
                        isOnline ? 'bg-gradient-to-r from-emerald-500 to-teal-400' : 'bg-rose-500'
                      }`}
                    />

                    <div>
                      <div className="flex items-center justify-between mb-4">
                        <div
                          className={`w-12 h-12 rounded-xl flex items-center justify-center border transition-colors ${
                            isOnline
                              ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20 group-hover:border-emerald-500/40'
                              : 'bg-rose-500/10 text-rose-400 border-rose-500/20'
                          }`}
                        >
                          {portal.icon}
                        </div>

                        <div className="flex items-center gap-2">
                          <span
                            className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-mono font-bold tracking-wider uppercase border ${
                              isOnline
                                ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20 shadow-[0_0_12px_rgba(16,185,129,0.2)]'
                                : 'bg-rose-500/10 text-rose-400 border-rose-500/20 shadow-[0_0_12px_rgba(244,63,94,0.2)]'
                            }`}
                          >
                            <span
                              className={`w-1.5 h-1.5 rounded-full ${
                                isOnline ? 'bg-emerald-400 animate-pulse' : 'bg-rose-400'
                              }`}
                            />
                            {isOnline ? 'Online' : 'Maintenance'}
                          </span>
                        </div>
                      </div>

                      <div className="mb-2">
                        <span className="text-[11px] font-mono text-slate-500 uppercase tracking-wider block mb-1">
                          {portal.badge}
                        </span>
                        <h3 className="text-xl font-bold text-white group-hover:text-indigo-200 transition-colors">
                          {portal.name}
                        </h3>
                      </div>

                      <p className="text-xs sm:text-sm text-slate-400 leading-relaxed mb-6">
                        {portal.description}
                      </p>
                    </div>

                    {/* Footer Guarded Switch & Route */}
                    <div className="pt-4 border-t border-slate-800/80 flex items-center justify-between">
                      <div className="flex flex-col">
                        <span className="text-[11px] font-mono text-slate-500">GATEWAY ROUTE</span>
                        <span className="text-xs font-mono text-slate-300">{portal.route}</span>
                      </div>

                      {/* Interactive Guarded Switch */}
                      <div className="flex items-center gap-3">
                        <span className={`text-xs font-medium ${isOnline ? 'text-emerald-400' : 'text-rose-400'}`}>
                          {isOnline ? 'Accepting Traffic' : 'Blocked'}
                        </span>
                        <button
                          type="button"
                          onClick={() => requestTogglePortal(portal.key, portal.name)}
                          aria-label={`Toggle status for ${portal.name}`}
                          className={`relative inline-flex h-7 w-13 shrink-0 cursor-pointer rounded-full border-2 transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-indigo-500/40 ${
                            isOnline ? 'bg-emerald-600 border-emerald-500' : 'bg-slate-800 border-slate-700'
                          }`}
                        >
                          <span
                            className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-md ring-0 transition duration-200 ease-in-out mt-0.5 ${
                              isOnline ? 'translate-x-6' : 'translate-x-1'
                            }`}
                          />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </section>
        )}

        {(activeTab === 'accounts' || activeTab === 'pending') && (
          <section className="space-y-6">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
              <div>
                <h2 className="text-lg font-bold text-white tracking-tight flex items-center gap-2">
                  <span>Management & Staff Accounts</span>
                  <span className="px-2.5 py-0.5 rounded-full text-xs font-mono bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                    {allAccounts.length} Total Accounts
                  </span>
                  {pendingAccounts.length > 0 && (
                    <span className="px-2.5 py-0.5 rounded-full text-xs font-mono bg-amber-500/20 text-amber-300 border border-amber-500/30 animate-pulse">
                      {pendingAccounts.length} Awaiting Clearance
                    </span>
                  )}
                </h2>
                <p className="text-xs sm:text-sm text-slate-400">
                  Provision Admin, Owner, and staff credentials with immediate root authorization or review candidates.
                </p>
              </div>

              <div className="flex items-center gap-3 flex-wrap">
                <div className="relative w-full sm:w-64">
                  <Search className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    placeholder="Search name, email, role..."
                    value={accountsSearch}
                    onChange={(e) => setAccountsSearch(e.target.value)}
                    className="w-full pl-9 pr-4 py-2 bg-slate-900/80 border border-slate-800 rounded-xl text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition-colors"
                  />
                </div>

                <select
                  value={accountsRoleFilter}
                  onChange={(e) => setAccountsRoleFilter(e.target.value)}
                  className="px-3 py-2 bg-slate-900/80 border border-slate-800 rounded-xl text-xs text-slate-300 focus:outline-none focus:border-indigo-500 font-mono"
                >
                  <option value="all">All Roles</option>
                  <option value="admin">Admin</option>
                  <option value="owner">Owner</option>
                  <option value="super_admin">Super Admin (Developer)</option>
                  <option value="sales">Sales</option>
                  <option value="logistic">Logistic</option>
                  <option value="finance">Finance</option>
                </select>

                <select
                  value={accountsStatusFilter}
                  onChange={(e) => setAccountsStatusFilter(e.target.value)}
                  className="px-3 py-2 bg-slate-900/80 border border-slate-800 rounded-xl text-xs text-slate-300 focus:outline-none focus:border-indigo-500 font-mono"
                >
                  <option value="all">All Statuses</option>
                  <option value="active">Active</option>
                  <option value="pending">Pending</option>
                  <option value="suspended">Suspended</option>
                </select>

                <button
                  type="button"
                  onClick={() => {
                    setCreateError('');
                    setShowCreateModal(true);
                  }}
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-semibold shadow-[0_0_15px_rgba(99,102,241,0.35)] border border-indigo-400/30 transition-all flex items-center gap-1.5 focus:outline-none shrink-0"
                >
                  <UserPlus className="w-4 h-4" />
                  <span>+ Provision Account</span>
                </button>
              </div>
            </div>

            <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs font-mono">
              <button
                type="button"
                onClick={() => {
                  setAccountsRoleFilter('all');
                  setAccountsStatusFilter('all');
                }}
                className={`px-3 py-1.5 rounded-lg border transition-all ${
                  accountsRoleFilter === 'all' && accountsStatusFilter === 'all'
                    ? 'bg-indigo-500/20 text-indigo-300 border-indigo-500/40'
                    : 'bg-slate-900/60 text-slate-400 border-slate-800 hover:text-slate-200'
                }`}
              >
                All Accounts ({allAccounts.length})
              </button>

              <button
                type="button"
                onClick={() => {
                  setAccountsRoleFilter('admin');
                  setAccountsStatusFilter('all');
                }}
                className={`px-3 py-1.5 rounded-lg border transition-all ${
                  accountsRoleFilter === 'admin'
                    ? 'bg-sky-500/20 text-sky-300 border-sky-500/40'
                    : 'bg-slate-900/60 text-slate-400 border-slate-800 hover:text-slate-200'
                }`}
              >
                Admins ({allAccounts.filter((a) => a.role === 'admin').length})
              </button>

              <button
                type="button"
                onClick={() => {
                  setAccountsRoleFilter('owner');
                  setAccountsStatusFilter('all');
                }}
                className={`px-3 py-1.5 rounded-lg border transition-all ${
                  accountsRoleFilter === 'owner'
                    ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                    : 'bg-slate-900/60 text-slate-400 border-slate-800 hover:text-slate-200'
                }`}
              >
                Owners ({allAccounts.filter((a) => a.role === 'owner').length})
              </button>

              <button
                type="button"
                onClick={() => {
                  setAccountsRoleFilter('all');
                  setAccountsStatusFilter('pending');
                }}
                className={`px-3 py-1.5 rounded-lg border transition-all flex items-center gap-1.5 ${
                  accountsStatusFilter === 'pending'
                    ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                    : 'bg-slate-900/60 text-slate-400 border-slate-800 hover:text-slate-200'
                }`}
              >
                <ShieldAlert className="w-3.5 h-3.5 text-amber-400" />
                <span>Pending Clearances ({pendingAccounts.length})</span>
              </button>
            </div>

            <div className="bg-slate-900/60 backdrop-blur-xl border border-slate-800/80 rounded-2xl overflow-hidden shadow-xl">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs sm:text-sm border-collapse">
                  <thead>
                    <tr className="border-b border-slate-800 text-slate-400 font-mono text-[11px] uppercase tracking-wider bg-slate-950/40">
                      <th className="py-3.5 px-4 sm:px-6">Account Holder</th>
                      <th className="py-3.5 px-4">Role Clearance</th>
                      <th className="py-3.5 px-4">Status</th>
                      <th className="py-3.5 px-4">Contact</th>
                      <th className="py-3.5 px-4">Created Date</th>
                      <th className="py-3.5 px-4 sm:px-6 text-right">Root Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/50">
                    {filteredAccounts.length === 0 ? (
                      <tr>
                        <td colSpan="6" className="py-12 text-center text-slate-500">
                          <div className="flex flex-col items-center justify-center gap-2">
                            <Users className="w-8 h-8 text-slate-600" />
                            <p className="text-sm font-medium text-slate-300">No matching accounts found.</p>
                            <p className="text-xs text-slate-500">Try adjusting your filters or click "+ Provision Account" above.</p>
                          </div>
                        </td>
                      </tr>
                    ) : (
                      filteredAccounts.map((acc) => (
                        <tr key={acc.id} className="hover:bg-slate-800/30 transition-colors">
                          <td className="py-4 px-4 sm:px-6">
                            <div className="flex items-center gap-3">
                              <div className="w-9 h-9 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 flex items-center justify-center font-bold text-xs shrink-0">
                                {acc.name?.[0]?.toUpperCase() || 'U'}
                              </div>
                              <div className="min-w-0">
                                <div className="font-semibold text-slate-100 truncate">{acc.name}</div>
                                <div className="text-xs text-slate-400 font-mono truncate">{acc.email}</div>
                              </div>
                            </div>
                          </td>
                          <td className="py-4 px-4">
                            <span className={`inline-flex px-2.5 py-1 rounded-md text-xs font-mono font-semibold border ${roleColorBadge(acc.role)}`}>
                              {acc.role?.toUpperCase()}
                            </span>
                          </td>
                          <td className="py-4 px-4">
                            <span
                              className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md text-[11px] font-mono capitalize border ${
                                acc.status === 'active'
                                  ? 'bg-emerald-500/10 text-emerald-300 border-emerald-500/30'
                                  : acc.status === 'pending'
                                  ? 'bg-amber-500/10 text-amber-300 border-amber-500/30'
                                  : 'bg-rose-500/10 text-rose-300 border-rose-500/30'
                              }`}
                            >
                              <span
                                className={`w-1.5 h-1.5 rounded-full ${
                                  acc.status === 'active' ? 'bg-emerald-400' : acc.status === 'pending' ? 'bg-amber-400' : 'bg-rose-400'
                                }`}
                              />
                              {acc.status}
                            </span>
                          </td>
                          <td className="py-4 px-4 text-slate-300 font-mono text-xs">
                            {acc.contactNumber || '—'}
                          </td>
                          <td className="py-4 px-4 text-slate-400 text-xs">
                            {new Date(acc.createdAt).toLocaleDateString()}
                          </td>
                          <td className="py-4 px-4 sm:px-6 text-right">
                            {acc.role === 'super_admin' || acc.role === 'superadmin' ? (
                              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-mono text-indigo-400 bg-indigo-500/10 border border-indigo-500/20">
                                Developer Root
                              </span>
                            ) : acc.status === 'pending' ? (
                              <div className="flex items-center justify-end gap-2">
                                <button
                                  type="button"
                                  onClick={() => promptRejectAccount(acc)}
                                  className="px-2.5 py-1.5 rounded-xl text-xs font-medium text-rose-300 bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/20 hover:border-rose-500/30 transition-all focus:outline-none inline-flex items-center gap-1"
                                >
                                  <XCircle className="w-3.5 h-3.5" />
                                  <span>Reject</span>
                                </button>
                                <button
                                  type="button"
                                  onClick={() => promptApproveAccount(acc)}
                                  className="px-2.5 py-1.5 rounded-xl text-xs font-medium text-emerald-300 bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/20 hover:border-emerald-500/30 transition-all focus:outline-none inline-flex items-center gap-1"
                                >
                                  <CheckCircle2 className="w-3.5 h-3.5" />
                                  <span>Authorize</span>
                                </button>
                              </div>
                            ) : (
                              <div className="flex items-center justify-end gap-2">
                                <button
                                  type="button"
                                  onClick={() => promptRejectAccount(acc)}
                                  className="px-2.5 py-1.5 rounded-xl text-xs font-medium text-slate-400 hover:text-rose-300 hover:bg-rose-500/10 border border-slate-800 hover:border-rose-500/30 transition-all focus:outline-none inline-flex items-center gap-1"
                                  title="Purge account from system"
                                >
                                  <XCircle className="w-3.5 h-3.5" />
                                  <span>Purge</span>
                                </button>
                              </div>
                            )}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </section>
        )}

        {activeTab === 'live' && (
          <section className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h2 className="text-lg font-bold text-white tracking-tight flex items-center gap-2">
                  <Radio className="w-5 h-5 text-emerald-400 animate-pulse" />
                  <span>Real-Time Active Socket Connections</span>
                </h2>
                <p className="text-xs sm:text-sm text-slate-400">
                  Live connected clients tracked by backend Socket.IO telemetry cluster.
                </p>
              </div>

              <div className="relative w-full sm:w-72">
                <Search className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Filter active users..."
                  value={activeUsersSearch}
                  onChange={(e) => setActiveUsersSearch(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 bg-slate-900/80 border border-slate-800 rounded-xl text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition-colors"
                />
              </div>
            </div>

            <div className="bg-slate-900/60 backdrop-blur-xl border border-slate-800/80 rounded-2xl overflow-hidden shadow-xl">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs sm:text-sm border-collapse">
                  <thead>
                    <tr className="border-b border-slate-800 text-slate-400 font-mono text-[11px] uppercase tracking-wider bg-slate-950/40">
                      <th className="py-3.5 px-4 sm:px-6">Connected Identity</th>
                      <th className="py-3.5 px-4">Portal Role</th>
                      <th className="py-3.5 px-4">Concurrent Sockets</th>
                      <th className="py-3.5 px-4 sm:px-6">Initial Handshake</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/50">
                    {filteredActiveUsers.length === 0 ? (
                      <tr>
                        <td colSpan="4" className="py-12 text-center text-slate-500">
                          <div className="flex flex-col items-center justify-center gap-2">
                            <Radio className="w-8 h-8 text-slate-600" />
                            <p className="text-sm font-medium text-slate-300">No active socket clients connected.</p>
                            <p className="text-xs text-slate-500">Listening to WebSocket telemetry room...</p>
                          </div>
                        </td>
                      </tr>
                    ) : (
                      filteredActiveUsers.map((u, i) => (
                        <tr key={i} className="hover:bg-slate-800/30 transition-colors">
                          <td className="py-4 px-4 sm:px-6">
                            <div className="flex items-center gap-3">
                              <div className="relative">
                                <div className="w-9 h-9 rounded-xl bg-slate-800 border border-slate-700 text-slate-200 flex items-center justify-center font-bold text-xs">
                                  {u.name?.[0]?.toUpperCase() || 'U'}
                                </div>
                                <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-emerald-500 border-2 border-slate-900" />
                              </div>
                              <div>
                                <div className="font-semibold text-slate-100">{u.name}</div>
                                <div className="text-xs text-slate-400 font-mono">{u.email}</div>
                              </div>
                            </div>
                          </td>
                          <td className="py-4 px-4">
                            <span className={`inline-flex px-2.5 py-1 rounded-md text-xs font-mono font-semibold border ${roleColorBadge(u.role)}`}>
                              {u.role?.toUpperCase()}
                            </span>
                          </td>
                          <td className="py-4 px-4">
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-mono bg-indigo-950/80 text-indigo-300 border border-indigo-500/30">
                              <Laptop className="w-3.5 h-3.5" />
                              {u.sessionCount} {u.sessionCount === 1 ? 'Socket' : 'Sockets'}
                            </span>
                          </td>
                          <td className="py-4 px-4 sm:px-6 text-slate-400 text-xs font-mono">
                            {new Date(u.connectedAt).toLocaleTimeString()}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </section>
        )}

        {activeTab === 'logs' && (
          <section className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <h2 className="text-lg font-bold text-white tracking-tight flex items-center gap-2">
                  <Activity className="w-5 h-5 text-indigo-400" />
                  <span>Security Session Audit Trail</span>
                </h2>
                <p className="text-xs sm:text-sm text-slate-400">
                  Permanent authentication and session logs retained across all subsystems.
                </p>
              </div>

              <div className="flex items-center gap-2.5 flex-wrap">
                <button
                  onClick={exportLogsToCSV}
                  className="px-3.5 py-2 rounded-xl text-xs font-medium bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-700/80 transition-all flex items-center gap-1.5"
                >
                  <Download className="w-3.5 h-3.5 text-indigo-400" />
                  <span>Export CSV</span>
                </button>
              </div>
            </div>

            <div className="p-4 bg-slate-900/60 backdrop-blur-xl border border-slate-800/80 rounded-2xl flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
              <div className="relative flex-1">
                <Search className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Search user email, role, device, or IP..."
                  value={logsSearch}
                  onChange={(e) => {
                    setLogsSearch(e.target.value);
                    setLogsPage(1);
                  }}
                  className="w-full pl-9 pr-4 py-2 bg-slate-950/80 border border-slate-800 rounded-xl text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition-colors"
                />
              </div>

              <div className="flex items-center gap-1 bg-slate-950/80 p-1 rounded-xl border border-slate-800 text-xs">
                <button
                  onClick={() => {
                    setLogsStatusFilter('all');
                    setLogsPage(1);
                  }}
                  className={`px-3 py-1 rounded-lg transition-colors ${
                    logsStatusFilter === 'all' ? 'bg-indigo-600 text-white font-medium' : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  All ({sessionLogs.length})
                </button>
                <button
                  onClick={() => {
                    setLogsStatusFilter('active');
                    setLogsPage(1);
                  }}
                  className={`px-3 py-1 rounded-lg transition-colors ${
                    logsStatusFilter === 'active' ? 'bg-emerald-600 text-white font-medium' : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  Active ({activeSessionsCount})
                </button>
                <button
                  onClick={() => {
                    setLogsStatusFilter('inactive');
                    setLogsPage(1);
                  }}
                  className={`px-3 py-1 rounded-lg transition-colors ${
                    logsStatusFilter === 'inactive' ? 'bg-slate-700 text-white font-medium' : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  Closed ({sessionLogs.length - activeSessionsCount})
                </button>
              </div>

              <div className="flex items-center gap-2">
                <Filter className="w-3.5 h-3.5 text-slate-500" />
                <select
                  value={logsRoleFilter}
                  onChange={(e) => {
                    setLogsRoleFilter(e.target.value);
                    setLogsPage(1);
                  }}
                  className="bg-slate-950/80 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-300 focus:outline-none focus:border-indigo-500 cursor-pointer font-mono"
                >
                  <option value="all">All Roles</option>
                  <option value="superadmin">Super Admin</option>
                  <option value="owner">Owner</option>
                  <option value="admin">Admin</option>
                  <option value="sales">Sales</option>
                  <option value="finance">Finance</option>
                  <option value="logistic">Logistic</option>
                  <option value="customer">Customer</option>
                </select>
              </div>
            </div>

            <div className="bg-slate-900/60 backdrop-blur-xl border border-slate-800/80 rounded-2xl overflow-hidden shadow-xl">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs sm:text-sm border-collapse">
                  <thead>
                    <tr className="border-b border-slate-800 text-slate-400 font-mono text-[11px] uppercase tracking-wider bg-slate-950/40">
                      <th className="py-3.5 px-4 sm:px-6">User Account</th>
                      <th className="py-3.5 px-4">Role</th>
                      <th className="py-3.5 px-4">State</th>
                      <th className="py-3.5 px-4">Platform / Client</th>
                      <th className="py-3.5 px-4">Session Login</th>
                      <th className="py-3.5 px-4 sm:px-6">Session Terminated</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/50">
                    {paginatedLogs.length === 0 ? (
                      <tr>
                        <td colSpan="6" className="py-12 text-center text-slate-500">
                          No audit sessions matched your search criteria.
                        </td>
                      </tr>
                    ) : (
                      paginatedLogs.map((log) => {
                        const meta = parseDevice(log.deviceInfo);
                        return (
                          <tr key={log.id} className="hover:bg-slate-800/30 transition-colors">
                            <td className="py-3.5 px-4 sm:px-6">
                              <div className="font-semibold text-slate-200">
                                {log.user?.email || 'N/A'}
                              </div>
                              <div className="text-[11px] text-slate-500 font-mono">
                                UID #{log.userId}
                              </div>
                            </td>
                            <td className="py-3.5 px-4">
                              <span className={`inline-flex px-2 py-0.5 rounded text-[11px] font-mono font-semibold border ${roleColorBadge(log.user?.role)}`}>
                                {log.user?.role?.toUpperCase() || 'GUEST'}
                              </span>
                            </td>
                            <td className="py-3.5 px-4">
                              <span
                                className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-medium border ${
                                  log.isActive
                                    ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                                    : 'bg-slate-700/20 text-slate-400 border-slate-700/40'
                                }`}
                              >
                                <span className={`w-1.5 h-1.5 rounded-full ${log.isActive ? 'bg-emerald-400' : 'bg-slate-500'}`} />
                                {log.isActive ? 'Active' : 'Closed'}
                              </span>
                            </td>
                            <td className="py-3.5 px-4">
                              <div className="flex items-center gap-2 text-slate-300 text-xs">
                                {meta?.isMobile ? (
                                  <Smartphone className="w-4 h-4 text-sky-400" />
                                ) : (
                                  <Laptop className="w-4 h-4 text-indigo-400" />
                                )}
                                <span>{meta?.browser || 'Browser'} on {meta?.os || 'Client'}</span>
                              </div>
                              <div className="text-[10px] text-slate-500 font-mono truncate max-w-xs" title={log.deviceInfo || 'Unknown Client'}>
                                {log.deviceInfo || 'Unknown Client'}
                              </div>
                            </td>
                            <td className="py-3.5 px-4 text-slate-400 text-xs font-mono">
                              {log.createdAt ? new Date(log.createdAt).toLocaleString() : 'N/A'}
                            </td>
                            <td className="py-3.5 px-4 sm:px-6 text-slate-400 text-xs font-mono">
                              {log.loggedOutAt ? (
                                new Date(log.loggedOutAt).toLocaleString()
                              ) : (
                                <span className="text-emerald-400 font-semibold">Active Session</span>
                              )}
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>

              <div className="p-4 border-t border-slate-800 flex items-center justify-between flex-wrap gap-3 text-xs text-slate-400">
                <div className="flex items-center gap-2">
                  <span>Showing page {logsPage} of {totalLogsPages}</span>
                  <span className="text-slate-600">|</span>
                  <span>Total filtered: {filteredLogs.length}</span>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setLogsPage((p) => Math.max(p - 1, 1))}
                    disabled={logsPage === 1}
                    className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  <span className="font-mono text-slate-200 px-2">{logsPage}</span>
                  <button
                    onClick={() => setLogsPage((p) => Math.min(p + 1, totalLogsPages))}
                    disabled={logsPage >= totalLogsPages}
                    className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          </section>
        )}

        {activeTab === 'diagnostics' && (
          <section className="space-y-6">
            <div>
              <h2 className="text-lg font-bold text-white tracking-tight flex items-center gap-2">
                <Cpu className="w-5 h-5 text-indigo-400" />
                <span>Subsystem Telemetry & Diagnostics</span>
              </h2>
              <p className="text-xs sm:text-sm text-slate-400">
                Low-level runtime environmental stats, database connection parameters, and client latency.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div className="bg-slate-900/60 backdrop-blur-xl border border-slate-800/80 rounded-2xl p-6 shadow-lg flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-xs font-mono text-slate-400 uppercase tracking-wider">Gateway Latency</span>
                    <Wifi className="w-5 h-5 text-indigo-400" />
                  </div>
                  <div className="flex items-baseline gap-2 mb-2">
                    <span className="text-3xl font-bold font-mono text-white">
                      {latencyMs !== null ? `${latencyMs} ms` : '--'}
                    </span>
                    <span className={`text-xs font-semibold ${latencyMs && latencyMs < 100 ? 'text-emerald-400' : 'text-slate-400'}`}>
                      {latencyMs ? (latencyMs < 100 ? 'Excellent' : 'Nominal') : 'Untested'}
                    </span>
                  </div>
                  <p className="text-xs text-slate-400 mb-6">
                    Ping test between Super Admin browser client and backend HTTP gateway.
                  </p>
                </div>
                <button
                  onClick={measureLatency}
                  disabled={testingLatency}
                  className="w-full py-2.5 px-4 rounded-xl text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-500 shadow-[0_0_15px_rgba(99,102,241,0.3)] transition-all flex items-center justify-center gap-2"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${testingLatency ? 'animate-spin' : ''}`} />
                  <span>{testingLatency ? 'Pinging Gateway...' : 'Test Gateway Latency'}</span>
                </button>
              </div>

              <div className="bg-slate-900/60 backdrop-blur-xl border border-slate-800/80 rounded-2xl p-6 shadow-lg">
                <div className="flex items-center justify-between mb-4">
                  <span className="text-xs font-mono text-slate-400 uppercase tracking-wider">Runtime Environment</span>
                  <HardDrive className="w-5 h-5 text-sky-400" />
                </div>
                <div className="space-y-3 font-mono text-xs">
                  <div className="flex items-center justify-between py-1.5 border-b border-slate-800">
                    <span className="text-slate-400">Node.js Engine:</span>
                    <span className="text-slate-100">{systemInfo?.nodeVersion || 'v20.x'}</span>
                  </div>
                  <div className="flex items-center justify-between py-1.5 border-b border-slate-800">
                    <span className="text-slate-400">Platform OS:</span>
                    <span className="text-slate-100">{systemInfo?.platform || 'win32'} ({systemInfo?.arch || 'x64'})</span>
                  </div>
                  <div className="flex items-center justify-between py-1.5 border-b border-slate-800">
                    <span className="text-slate-400">Server Uptime:</span>
                    <span className="text-emerald-400 font-semibold">
                      {systemInfo?.uptimeSeconds ? `${Math.floor(systemInfo.uptimeSeconds / 60)} mins` : 'Live'}
                    </span>
                  </div>
                  <div className="flex items-center justify-between py-1.5">
                    <span className="text-slate-400">Database Driver:</span>
                    <span className="text-emerald-400 font-semibold flex items-center gap-1">
                      <Check className="w-3 h-3" /> Prisma ORM / PostgreSQL
                    </span>
                  </div>
                </div>
              </div>

              <div className="bg-slate-900/60 backdrop-blur-xl border border-slate-800/80 rounded-2xl p-6 shadow-lg">
                <div className="flex items-center justify-between mb-4">
                  <span className="text-xs font-mono text-slate-400 uppercase tracking-wider">Memory Allocation</span>
                  <Database className="w-5 h-5 text-purple-400" />
                </div>
                <div className="space-y-3 font-mono text-xs">
                  <div className="flex items-center justify-between py-1.5 border-b border-slate-800">
                    <span className="text-slate-400">Heap Used:</span>
                    <span className="text-slate-100">{systemInfo?.memory?.heapUsedMB || 84} MB</span>
                  </div>
                  <div className="flex items-center justify-between py-1.5 border-b border-slate-800">
                    <span className="text-slate-400">Heap Total:</span>
                    <span className="text-slate-100">{systemInfo?.memory?.heapTotalMB || 128} MB</span>
                  </div>
                  <div className="flex items-center justify-between py-1.5 border-b border-slate-800">
                    <span className="text-slate-400">Resident Set (RSS):</span>
                    <span className="text-slate-100">{systemInfo?.memory?.rssMB || 160} MB</span>
                  </div>
                  <div className="flex items-center justify-between py-1.5">
                    <span className="text-slate-400">Socket.IO Room:</span>
                    <span className="text-indigo-400 font-semibold">superadmin (Connected)</span>
                  </div>
                </div>
              </div>
            </div>
          </section>
        )}

      </main>

      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fadeIn">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-lg w-full shadow-2xl relative overflow-hidden flex flex-col max-h-[92vh]">
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-indigo-500 via-sky-500 to-purple-500" />
            
            <div className="p-6 border-b border-slate-800/80 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 flex items-center justify-center">
                  <UserPlus className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white tracking-tight">Provision Management Account</h3>
                  <p className="text-xs text-slate-400">Deploy root-authorized credentials for Admin, Owner, or Department staff.</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowCreateModal(false)}
                className="text-slate-400 hover:text-slate-200 p-1.5 rounded-lg hover:bg-slate-800 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateAccount} className="p-6 space-y-4 overflow-y-auto">
              {createError && (
                <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 shrink-0" />
                  <span>{createError}</span>
                </div>
              )}

              {allSingletonRolesTaken && (
                <div className="p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs flex items-start gap-2.5">
                  <AlertTriangle className="w-4 h-4 shrink-0 text-amber-400 mt-0.5" />
                  <div>
                    <div className="font-semibold font-mono uppercase tracking-wide">All Singleton Roles Provisioned (5/5)</div>
                    <div className="text-[11px] text-amber-300/90 mt-0.5">
                      Admin, Owner, Sales, Logistics, and Finance each already have 1 active account. System policy restricts each role to strictly 1 account.
                    </div>
                  </div>
                </div>
              )}

              <div>
                <label className="block text-xs font-mono uppercase tracking-wider text-slate-300 mb-1.5">
                  Target Role Clearance * (Strict 1 Account per Role)
                </label>
                <select
                  value={createForm.role}
                  onChange={(e) => setCreateForm((prev) => ({ ...prev, role: e.target.value }))}
                  className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-100 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                >
                  <option value="admin" disabled={isRoleTaken('admin')}>
                    Admin (User & Staff Administrator) {isRoleTaken('admin') ? '— [1 of 1 Exists: Provisioned]' : ''}
                  </option>
                  <option value="owner" disabled={isRoleTaken('owner')}>
                    Owner (Business Executive) {isRoleTaken('owner') ? '— [1 of 1 Exists: Provisioned]' : ''}
                  </option>
                  <option value="sales" disabled={isRoleTaken('sales')}>
                    Sales Representative {isRoleTaken('sales') ? '— [1 of 1 Exists: Provisioned]' : ''}
                  </option>
                  <option value="logistic" disabled={isRoleTaken('logistic')}>
                    Logistics Officer {isRoleTaken('logistic') ? '— [1 of 1 Exists: Provisioned]' : ''}
                  </option>
                  <option value="finance" disabled={isRoleTaken('finance')}>
                    Finance Officer {isRoleTaken('finance') ? '— [1 of 1 Exists: Provisioned]' : ''}
                  </option>
                </select>
                {isCurrentRoleTaken && (
                  <div className="mt-2 p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-300 text-[11px] font-mono flex items-start gap-2">
                    <AlertTriangle className="w-4 h-4 shrink-0 text-amber-400 mt-0.5" />
                    <div>
                      <span className="font-bold">SINGLETON POLICY: </span>
                      <span>An account for {createForm.role.toUpperCase()} already exists ({existingAccountForSelectedRole?.email}). Only one account can exist for Super Admin, Admin, Owner, Sales, Finance, and Logistic. Creating another one is not allowed.</span>
                    </div>
                  </div>
                )}
              </div>

              <div>
                <label className="block text-xs font-mono uppercase tracking-wider text-slate-300 mb-1.5">
                  Full Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Juan dela Cruz"
                  value={createForm.name}
                  onChange={(e) => setCreateForm((prev) => ({ ...prev, name: e.target.value }))}
                  className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-mono uppercase tracking-wider text-slate-300 mb-1.5">
                  Official Email Address *
                </label>
                <input
                  type="email"
                  required
                  placeholder="admin@megapacific.com"
                  value={createForm.email}
                  onChange={(e) => setCreateForm((prev) => ({ ...prev, email: e.target.value }))}
                  className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 font-mono"
                />
                {createForm.email && allAccounts.some((a) => a.email && a.email.trim().toLowerCase() === createForm.email.trim().toLowerCase()) && (
                  <p className="mt-1.5 text-[11px] text-amber-400 font-mono flex items-center gap-1.5">
                    <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
                    <span>An account with this email already exists. Submission will be rejected.</span>
                  </p>
                )}
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-xs font-mono uppercase tracking-wider text-slate-300">
                    Initial Password *
                  </label>
                  <button
                    type="button"
                    onClick={generateRandomPassword}
                    className="text-[11px] font-mono text-indigo-400 hover:text-indigo-300 inline-flex items-center gap-1 transition-colors"
                  >
                    <Key className="w-3 h-3" />
                    <span>Generate Strong</span>
                  </button>
                </div>
                <div className="relative">
                  <input
                    type={showCreatePassword ? "text" : "password"}
                    required
                    minLength={6}
                    placeholder="Min. 6 characters"
                    value={createForm.password}
                    onChange={(e) => setCreateForm((prev) => ({ ...prev, password: e.target.value }))}
                    className="w-full pl-3.5 pr-10 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 font-mono"
                  />
                  <button
                    type="button"
                    onClick={() => setShowCreatePassword(!showCreatePassword)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-200 focus:outline-none"
                  >
                    {showCreatePassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-mono uppercase tracking-wider text-slate-300 mb-1.5">
                  Contact Number (Optional)
                </label>
                <input
                  type="text"
                  placeholder="0917-xxx-xxxx"
                  value={createForm.contactNumber}
                  onChange={(e) => setCreateForm((prev) => ({ ...prev, contactNumber: e.target.value }))}
                  className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-mono uppercase tracking-wider text-slate-300 mb-1.5">
                  Initial Authorization State
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setCreateForm((prev) => ({ ...prev, status: 'active' }))}
                    className={`p-3 rounded-xl border text-left transition-all ${
                      createForm.status === 'active'
                        ? 'bg-emerald-500/10 border-emerald-500/40 text-emerald-300 shadow-[0_0_12px_rgba(16,185,129,0.15)]'
                        : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:border-slate-700'
                    }`}
                  >
                    <div className="flex items-center gap-2 font-semibold text-xs text-white">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                      <span>Active & Ready</span>
                    </div>
                    <p className="text-[11px] text-slate-400 mt-1">Can log in immediately with assigned credentials.</p>
                  </button>

                  <button
                    type="button"
                    onClick={() => setCreateForm((prev) => ({ ...prev, status: 'pending' }))}
                    className={`p-3 rounded-xl border text-left transition-all ${
                      createForm.status === 'pending'
                        ? 'bg-amber-500/10 border-amber-500/40 text-amber-300 shadow-[0_0_12px_rgba(245,158,11,0.15)]'
                        : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:border-slate-700'
                    }`}
                  >
                    <div className="flex items-center gap-2 font-semibold text-xs text-white">
                      <Clock className="w-3.5 h-3.5 text-amber-400" />
                      <span>Pending Clearance</span>
                    </div>
                    <p className="text-[11px] text-slate-400 mt-1">Held in authorization queue until explicitly activated.</p>
                  </button>
                </div>
              </div>

              <div className="pt-4 border-t border-slate-800 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 rounded-xl text-xs font-medium text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={creatingAccount || isCurrentRoleTaken}
                  className="px-5 py-2.5 rounded-xl text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-500 shadow-lg shadow-indigo-600/30 transition-all flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {creatingAccount ? (
                    <>
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                      <span>Provisioning...</span>
                    </>
                  ) : isCurrentRoleTaken ? (
                    <>
                      <AlertTriangle className="w-3.5 h-3.5 text-amber-300" />
                      <span>Role Limit Reached (1 Allowed)</span>
                    </>
                  ) : (
                    <>
                      <UserPlus className="w-3.5 h-3.5" />
                      <span>Create {createForm.role.toUpperCase()} Account</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* CONFIRMATION MODAL: Super Admin Password Verification for Account Authorizations */}
      {confirmModal.show && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fadeIn">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 sm:p-7 max-w-md w-full shadow-2xl relative overflow-hidden">
            <div
              className={`absolute top-0 left-0 right-0 h-1 ${
                confirmModal.action === 'approve'
                  ? 'bg-gradient-to-r from-emerald-500 to-teal-400'
                  : 'bg-rose-500'
              }`}
            />

            <div className="flex items-start gap-4 mb-4">
              <div
                className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 border ${
                  confirmModal.action === 'approve'
                    ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                    : 'bg-rose-500/10 text-rose-400 border-rose-500/20'
                }`}
              >
                {confirmModal.action === 'approve' ? (
                  <ShieldCheck className="w-6 h-6" />
                ) : (
                  <ShieldAlert className="w-6 h-6" />
                )}
              </div>
              <div>
                <h3 className="text-lg font-bold text-white tracking-tight">
                  {confirmModal.action === 'approve' ? 'Authorize Staff Account' : 'Reject & Purge Account'}
                </h3>
                <p className="text-xs text-slate-400 mt-1">
                  Root authorization required. Please authenticate with your Super Admin password.
                </p>
              </div>
            </div>

            <div className="p-3 bg-slate-950/60 rounded-xl border border-slate-800 mb-4 text-xs font-mono">
              <div className="text-slate-400 flex justify-between py-0.5">
                <span>Account:</span>
                <span className="text-slate-200 font-bold">{confirmModal.account?.name}</span>
              </div>
              <div className="text-slate-400 flex justify-between py-0.5">
                <span>Email:</span>
                <span className="text-slate-300">{confirmModal.account?.email}</span>
              </div>
              <div className="text-slate-400 flex justify-between py-0.5">
                <span>Role:</span>
                <span className="text-indigo-400 uppercase font-semibold">{confirmModal.account?.role}</span>
              </div>
            </div>

            {confirmModal.error && (
              <div className="mb-4 p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0" />
                <span>{confirmModal.error}</span>
              </div>
            )}

            <div className="space-y-1.5 mb-6">
              <label className="block text-xs font-medium text-slate-300 uppercase tracking-wider">
                Super Admin Password
              </label>
              <div className="relative">
                <input
                  type={confirmModal.showPassword ? 'text' : 'password'}
                  placeholder="Enter your root password..."
                  value={confirmModal.password}
                  onChange={(e) => setConfirmModal((prev) => ({ ...prev, password: e.target.value, error: '' }))}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') executeAccountAction();
                    if (e.key === 'Escape') setConfirmModal((prev) => ({ ...prev, show: false }));
                  }}
                  autoFocus
                  className="w-full pl-3.5 pr-10 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 font-mono"
                />
                <button
                  type="button"
                  onClick={() => setConfirmModal((prev) => ({ ...prev, showPassword: !prev.showPassword }))}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-200 focus:outline-none"
                >
                  {confirmModal.showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() =>
                  setConfirmModal({
                    show: false,
                    action: null,
                    account: null,
                    password: '',
                    error: '',
                    submitting: false,
                    showPassword: false,
                  })
                }
                className="px-4 py-2 rounded-xl text-xs font-medium text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={executeAccountAction}
                disabled={confirmModal.submitting}
                className={`px-4 py-2 rounded-xl text-xs font-semibold text-white shadow-lg transition-all flex items-center gap-2 ${
                  confirmModal.action === 'approve'
                    ? 'bg-emerald-600 hover:bg-emerald-500 shadow-emerald-600/30'
                    : 'bg-rose-600 hover:bg-rose-500 shadow-rose-600/30'
                } disabled:opacity-50`}
              >
                {confirmModal.submitting ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    <span>Verifying...</span>
                  </>
                ) : (
                  <>
                    {confirmModal.action === 'approve' ? <Check className="w-3.5 h-3.5" /> : <X className="w-3.5 h-3.5" />}
                    <span>Confirm {confirmModal.action === 'approve' ? 'Authorization' : 'Rejection'}</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* CONFIRMATION MODAL: Safe Portal Offline Safeguard */}
      {portalConfirmModal.show && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fadeIn">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 sm:p-7 max-w-md w-full shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 left-0 right-0 h-1 bg-amber-500" />

            <div className="flex items-start gap-4 mb-4">
              <div className="w-12 h-12 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20 flex items-center justify-center shrink-0">
                <AlertTriangle className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-white tracking-tight">
                  Take {portalConfirmModal.portalName} Offline?
                </h3>
                <p className="text-xs text-slate-400 mt-1">
                  Warning: Bringing this gateway offline will immediately put active client sessions into maintenance mode.
                </p>
              </div>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed bg-slate-950/60 p-3 rounded-xl border border-slate-800 mb-6">
              Only proceed if you are preparing for scheduled server maintenance or emergency database updates.
            </p>

            <div className="flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => setPortalConfirmModal({ show: false, portalKey: null, targetStatus: null, portalName: '' })}
                className="px-4 py-2 rounded-xl text-xs font-medium text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => executePortalToggle(portalConfirmModal.portalKey, portalConfirmModal.targetStatus)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-white bg-rose-600 hover:bg-rose-500 shadow-lg shadow-rose-600/30 transition-all flex items-center gap-1.5"
              >
                <Power className="w-3.5 h-3.5" />
                <span>Confirm Offline</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {showLogoutConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fadeIn">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 sm:p-7 max-w-sm w-full shadow-2xl text-center">
            <div className="w-12 h-12 rounded-2xl bg-rose-500/10 text-rose-400 border border-rose-500/20 flex items-center justify-center mx-auto mb-4">
              <Power className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-white mb-2">Terminate Root Session?</h3>
            <p className="text-xs text-slate-400 mb-6">
              You will be signed out of Mega Pacific Mission Control and returned to standard login.
            </p>
            <div className="flex items-center justify-center gap-3">
              <button
                type="button"
                onClick={() => setShowLogoutConfirm(false)}
                className="px-4 py-2 rounded-xl text-xs font-medium text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-colors"
              >
                Stay Logged In
              </button>
              <button
                type="button"
                onClick={async () => {
                  setShowLogoutConfirm(false);
                  await logout();
                  navigate('/superadmin-0megapacific/login', { replace: true });
                }}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-white bg-rose-600 hover:bg-rose-500 shadow-lg shadow-rose-600/30 transition-all"
              >
                Confirm Logout
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default SuperAdminDashboardPage;
