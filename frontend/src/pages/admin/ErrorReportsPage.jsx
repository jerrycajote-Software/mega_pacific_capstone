import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { io } from 'socket.io-client';
import {
  Box,
  Typography,
  Chip,
  TextField,
  MenuItem,
  Button,
  Alert,
  CircularProgress
} from '@mui/material';
import {
  CustomSearchIcon,
  CustomChevronRightIcon,
  CustomAdminSecurityFlagsIcon,
  CustomWarningIcon,
  CustomCheckCircleIcon
} from '../../components/icons';
import { useAuth } from '../../context/AuthContext';
import ErrorReportDetailModal from '../../components/admin/ErrorReportDetailModal';

const PORTAL_FILTERS = [
  { value: 'all', label: 'All Portals' },
  { value: 'customer', label: 'Customer' },
  { value: 'sales', label: 'Sales' },
  { value: 'finance', label: 'Finance' },
  { value: 'logistic', label: 'Logistic' },
  { value: 'owner', label: 'Owner' },
  { value: 'guest', label: 'Guest / Login' }
];

const STATUS_FILTERS = [
  { value: 'all', label: 'All Statuses' },
  { value: 'open', label: 'Open' },
  { value: 'investigating', label: 'Investigating' },
  { value: 'resolved', label: 'Resolved' }
];

const PORTAL_BADGE_STYLES = {
  customer: { color: '#3b82f6', bg: 'rgba(59,130,246,0.14)', label: 'Customer' },
  sales: { color: '#10b981', bg: 'rgba(16,185,129,0.14)', label: 'Sales' },
  finance: { color: '#06b6d4', bg: 'rgba(6,182,212,0.14)', label: 'Finance' },
  logistic: { color: '#f59e0b', bg: 'rgba(245,158,11,0.14)', label: 'Logistic' },
  owner: { color: '#8b5cf6', bg: 'rgba(139,92,246,0.14)', label: 'Owner' },
  guest: { color: '#64748b', bg: 'rgba(100,116,139,0.14)', label: 'Guest' }
};

const STATUS_BADGE_STYLES = {
  open: { color: '#ef4444', bg: 'rgba(239,68,68,0.14)', label: 'Open' },
  investigating: { color: '#f59e0b', bg: 'rgba(245,158,11,0.14)', label: 'Investigating' },
  resolved: { color: '#16a34a', bg: 'rgba(22,163,74,0.14)', label: 'Resolved' }
};

const thStyle = {
  padding: '0.85rem 1.1rem',
  fontSize: '0.72rem',
  fontWeight: 700,
  letterSpacing: '0.05em',
  textTransform: 'uppercase',
  color: 'var(--text-muted)',
  background: 'rgba(148,163,184,0.06)',
  borderBottom: '1px solid var(--border-light)',
  whiteSpace: 'nowrap',
  textAlign: 'left'
};

const tdStyle = {
  padding: '0.95rem 1.1rem',
  fontSize: '0.84rem',
  color: 'var(--text-primary)',
  borderBottom: '1px solid var(--border-light)',
  verticalAlign: 'middle'
};

// Admin center for viewing, filtering, tracing, and resolving end-user error reports in real time
const ErrorReportsPage = () => {
  const { user } = useAuth();
  const [reports, setReports] = useState([]);
  const [summary, setSummary] = useState({ total: 0, open: 0, investigating: 0, resolved: 0, todayCount: 0 });
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState('');

  const [filterPortal, setFilterPortal] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedReport, setSelectedReport] = useState(null);

  const fetchErrorReportsList = useCallback(async (showSpinner = false) => {
    if (showSpinner) setLoading(true);
    setFetchError('');

    try {
      const token = localStorage.getItem('appToken');
      const API_URL = import.meta.env.VITE_API_URL || '';
      const res = await axios.get(`${API_URL}/api/admin/error-reports`, {
        params: {
          portal: filterPortal,
          status: filterStatus,
          search: searchTerm.trim() || undefined
        },
        headers: { Authorization: `Bearer ${token}` }
      });

      if (res.data?.success) {
        setReports(res.data.data || []);
        if (res.data.summary) {
          setSummary(res.data.summary);
        }
      }
    } catch (err) {
      setFetchError(
        err?.response?.data?.message || 'Unable to load error reports right now. Please try again.'
      );
    } finally {
      setLoading(false);
    }
  }, [filterPortal, filterStatus, searchTerm]);

  useEffect(() => {
    const debounceId = setTimeout(() => {
      fetchErrorReportsList(false);
    }, 200);
    return () => clearTimeout(debounceId);
  }, [fetchErrorReportsList]);

  useEffect(() => {
    if (!user) return;
    const API_URL = import.meta.env.VITE_API_URL || '';
    const socket = io(API_URL, { auth: { user } });
    socket.emit('join_room', 'admin');

    const handleRealtimeRefresh = () => {
      fetchErrorReportsList(false);
    };

    socket.on('admin_error_report_created', handleRealtimeRefresh);
    socket.on('admin_error_report_updated', handleRealtimeRefresh);

    return () => {
      socket.off('admin_error_report_created', handleRealtimeRefresh);
      socket.off('admin_error_report_updated', handleRealtimeRefresh);
      socket.disconnect();
    };
  }, [user, fetchErrorReportsList]);

  const handleInspectReport = (report) => {
    setSelectedReport(report);
  };

  const handleReportUpdated = () => {
    fetchErrorReportsList(false);
  };

  return (
    <Box sx={{ p: { xs: 2, md: 4 }, maxWidth: 1440, mx: 'auto' }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 2, mb: 3 }}>
        <Box>
          <Typography variant="h4" fontWeight={800} sx={{ color: 'var(--text-primary)', letterSpacing: '-0.02em' }}>
            Error Reports & Monitoring
          </Typography>
          <Typography variant="body2" sx={{ color: 'var(--text-muted)', mt: 0.5 }}>
            Review errors reported by Customer, Sales, Finance, Logistics, and Owner users and match Reference Codes directly with server terminal logs.
          </Typography>
        </Box>
        <Button
          variant="outlined"
          onClick={() => fetchErrorReportsList(true)}
          sx={{ borderRadius: 2.5, textTransform: 'none', fontWeight: 700, px: 2.5 }}
        >
          Refresh Reports
        </Button>
      </Box>

      {/* Summary KPI Cards */}
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: { xs: '1fr 1fr', lg: 'repeat(4, 1fr)' },
          gap: 2,
          mb: 3
        }}
      >
        {[
          { label: 'Open Reports', value: summary.open, color: '#ef4444', icon: <CustomWarningIcon size={20} color="#ef4444" /> },
          { label: 'Investigating', value: summary.investigating, color: '#f59e0b', icon: <CustomAdminSecurityFlagsIcon size={20} /> },
          { label: 'Resolved', value: summary.resolved, color: '#16a34a', icon: <CustomCheckCircleIcon size={20} color="#16a34a" /> },
          { label: 'Reported Today', value: summary.todayCount, color: '#3b82f6', icon: <CustomAdminSecurityFlagsIcon size={20} /> }
        ].map((card) => (
          <Box
            key={card.label}
            sx={{
              p: 2.25,
              borderRadius: 3,
              bgcolor: 'var(--bg-secondary)',
              border: '1px solid var(--border-light)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: 1.5
            }}
          >
            <Box>
              <Typography variant="caption" sx={{ color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase' }}>
                {card.label}
              </Typography>
              <Typography variant="h4" fontWeight={800} sx={{ color: card.color, mt: 0.5 }}>
                {card.value}
              </Typography>
            </Box>
            <Box
              sx={{
                width: 44,
                height: 44,
                borderRadius: 2.5,
                bgcolor: 'rgba(148,163,184,0.1)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              {card.icon}
            </Box>
          </Box>
        ))}
      </Box>

      {/* Filter Bar */}
      <Box
        sx={{
          p: 2,
          mb: 3,
          borderRadius: 3,
          bgcolor: 'var(--bg-secondary)',
          border: '1px solid var(--border-light)',
          display: 'grid',
          gridTemplateColumns: { xs: '1fr', md: '1fr 200px 200px' },
          gap: 2
        }}
      >
        <TextField
          fullWidth
          size="small"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Search by Reference Code (ex. ERR-2026...), error message, user email, or page..."
          InputProps={{
            startAdornment: (
              <Box sx={{ mr: 1, display: 'flex', alignItems: 'center', color: 'var(--text-muted)' }}>
                <CustomSearchIcon size={16} />
              </Box>
            )
          }}
        />

        <TextField
          select
          size="small"
          label="Portal"
          value={filterPortal}
          onChange={(e) => setFilterPortal(e.target.value)}
        >
          {PORTAL_FILTERS.map((opt) => (
            <MenuItem key={opt.value} value={opt.value}>
              {opt.label}
            </MenuItem>
          ))}
        </TextField>

        <TextField
          select
          size="small"
          label="Status"
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
        >
          {STATUS_FILTERS.map((opt) => (
            <MenuItem key={opt.value} value={opt.value}>
              {opt.label}
            </MenuItem>
          ))}
        </TextField>
      </Box>

      {fetchError && (
        <Alert
          severity="error"
          sx={{ mb: 3, borderRadius: 2.5 }}
          action={
            <Button color="inherit" size="small" onClick={() => fetchErrorReportsList(true)}>
              Retry
            </Button>
          }
        >
          {fetchError}
        </Alert>
      )}

      {/* Error Reports Table */}
      <Box
        sx={{
          borderRadius: 3,
          bgcolor: 'var(--bg-secondary)',
          border: '1px solid var(--border-light)',
          overflow: 'hidden'
        }}
      >
        {loading ? (
          <Box sx={{ py: 10, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 1.5 }}>
            <CircularProgress size={36} />
            <Typography variant="body2" sx={{ color: 'var(--text-muted)' }}>
              Loading error reports...
            </Typography>
          </Box>
        ) : reports.length === 0 ? (
          <Box sx={{ py: 10, px: 3, textAlign: 'center' }}>
            <Typography variant="h6" fontWeight={800} sx={{ color: 'var(--text-primary)', mb: 0.75 }}>
              No Error Reports Found
            </Typography>
            <Typography variant="body2" sx={{ color: 'var(--text-muted)' }}>
              When customers or staff report an error from any portal, it will appear here immediately with its Reference Code and stack trace.
            </Typography>
          </Box>
        ) : (
          <Box sx={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr>
                  <th style={thStyle}>Reference Code</th>
                  <th style={thStyle}>Portal & Reporter</th>
                  <th style={thStyle}>Page & Error Summary</th>
                  <th style={thStyle}>Status</th>
                  <th style={thStyle}>Reported At</th>
                  <th style={{ ...thStyle, textAlign: 'right' }}>Action</th>
                </tr>
              </thead>
              <tbody>
                {reports.map((report) => {
                  const portalBadge = PORTAL_BADGE_STYLES[report.portal] || PORTAL_BADGE_STYLES.guest;
                  const statusBadge = STATUS_BADGE_STYLES[report.status] || STATUS_BADGE_STYLES.open;

                  return (
                    <tr key={report.id}>
                      <td style={tdStyle}>
                        <Typography
                          variant="caption"
                          sx={{
                            fontFamily: 'monospace',
                            fontWeight: 800,
                            px: 1,
                            py: 0.4,
                            borderRadius: 1.5,
                            bgcolor: 'rgba(239, 68, 68, 0.12)',
                            color: '#ef4444',
                            display: 'inline-block'
                          }}
                        >
                          {report.traceId}
                        </Typography>
                      </td>

                      <td style={tdStyle}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.35 }}>
                          <Chip
                            label={portalBadge.label}
                            size="small"
                            sx={{
                              bgcolor: portalBadge.bg,
                              color: portalBadge.color,
                              fontWeight: 700,
                              height: 22,
                              fontSize: '0.7rem'
                            }}
                          />
                          <Typography variant="body2" fontWeight={700}>
                            {report.reporterName || report.reporterRole}
                          </Typography>
                        </Box>
                        {report.reporterEmail && (
                          <Typography variant="caption" sx={{ color: 'var(--text-muted)' }}>
                            {report.reporterEmail}
                          </Typography>
                        )}
                      </td>

                      <td style={{ ...tdStyle, maxWidth: 380 }}>
                        <Typography
                          variant="body2"
                          fontWeight={700}
                          sx={{
                            display: '-webkit-box',
                            WebkitLineClamp: 1,
                            WebkitBoxOrient: 'vertical',
                            overflow: 'hidden'
                          }}
                        >
                          {report.errorMessage}
                        </Typography>
                        <Typography
                          variant="caption"
                          sx={{ color: 'var(--text-muted)', display: 'block', fontFamily: 'monospace' }}
                        >
                          {report.pageUrl}
                        </Typography>
                        {report.userDescription && (
                          <Typography
                            variant="caption"
                            sx={{
                              color: '#3b82f6',
                              display: '-webkit-box',
                              WebkitLineClamp: 1,
                              WebkitBoxOrient: 'vertical',
                              overflow: 'hidden',
                              mt: 0.25
                            }}
                          >
                            Note: {report.userDescription}
                          </Typography>
                        )}
                      </td>

                      <td style={tdStyle}>
                        <Chip
                          label={statusBadge.label}
                          size="small"
                          sx={{
                            bgcolor: statusBadge.bg,
                            color: statusBadge.color,
                            fontWeight: 800,
                            fontSize: '0.72rem'
                          }}
                        />
                      </td>

                      <td style={{ ...tdStyle, whiteSpace: 'nowrap' }}>
                        <Typography variant="caption" sx={{ color: 'var(--text-muted)' }}>
                          {new Date(report.createdAt).toLocaleString('en-PH')}
                        </Typography>
                      </td>

                      <td style={{ ...tdStyle, textAlign: 'right', whiteSpace: 'nowrap' }}>
                        <Button
                          size="small"
                          variant="outlined"
                          onClick={() => handleInspectReport(report)}
                          sx={{
                            borderRadius: 2,
                            textTransform: 'none',
                            fontWeight: 700,
                            px: 1.5,
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: 0.5
                          }}
                        >
                          <span>Inspect Report</span>
                          <CustomChevronRightIcon size={14} />
                        </Button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </Box>
        )}
      </Box>

      <ErrorReportDetailModal
        open={Boolean(selectedReport)}
        onClose={() => setSelectedReport(null)}
        report={selectedReport}
        onUpdated={handleReportUpdated}
      />
    </Box>
  );
};

export default ErrorReportsPage;
