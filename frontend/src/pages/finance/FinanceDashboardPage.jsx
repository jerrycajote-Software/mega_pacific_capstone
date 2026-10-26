import React, { useState, useEffect, useMemo } from 'react';
import {
  Box,
  Grid,
  Paper,
  Typography,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  CircularProgress,
  Button,
  Tabs,
  Tab,
  LinearProgress,
  TextField,
  InputAdornment,
  FormControlLabel,
  Switch,
  Collapse,
  Avatar,
  Divider
} from '@mui/material';
import {
  AreaChart,
  Area,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  ResponsiveContainer,
  Legend
} from 'recharts';
import axios from 'axios';
import { toast } from 'react-hot-toast';
import {
  CustomFinanceRevenueIcon,
  CustomFinancePendingIcon,
  CustomFinanceExpensesIcon,
  CustomFinanceNetIncomeIcon
} from '../../components/icons';

const DONUT_COLORS = ['#2563EB', '#10B981', '#F59E0B', '#8B5CF6', '#EC4899', '#06B6D4'];

const CustomChartTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <Paper
        elevation={4}
        sx={{
          p: 1.5,
          borderRadius: 2,
          border: '1px solid',
          borderColor: 'divider',
          bgcolor: 'background.paper'
        }}
      >
        <Typography variant="caption" fontWeight="bold" color="text.secondary" sx={{ display: 'block', mb: 0.5 }}>
          {label}
        </Typography>
        {payload.map((item, idx) => (
          <Box key={idx} sx={{ display: 'flex', alignItems: 'center', gap: 1, my: 0.25 }}>
            <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: item.color }} />
            <Typography variant="caption" sx={{ color: 'text.secondary', minWidth: 65 }}>
              {item.name}:
            </Typography>
            <Typography variant="caption" fontWeight="bold" sx={{ color: item.color }}>
              ₱{Number(item.value || 0).toLocaleString()}
            </Typography>
          </Box>
        ))}
      </Paper>
    );
  }
  return null;
};

const FinanceDashboardPage = () => {
  const [loading, setLoading] = useState(true);
  const [activityFilter, setActivityFilter] = useState('all');
  const [data, setData] = useState({
    kpi: {},
    revenueVsExpensesTrend: [],
    paymentBreakdown: [],
    expenseCategoryBreakdown: [],
    recentActivity: []
  });

  const [deliverySettings, setDeliverySettings] = useState({
    dieselPrice: 105.00,
    adminCostPct: 20.0,
    includeDepreciation: true,
    plantOrigin: 'Mega Pacific Imus Plant (Imus, Cavite)'
  });
  const [savingDelivery, setSavingDelivery] = useState(false);
  const [showVehicleRatesModal, setShowVehicleRatesModal] = useState(false);

  const fetchDeliverySettings = async () => {
    try {
      const token = localStorage.getItem('appToken');
      const API_URL = import.meta.env.VITE_API_URL || '';
      const res = await axios.get(`${API_URL}/api/finance/delivery-settings`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.data.success && res.data.data) {
        setDeliverySettings(res.data.data);
      }
    } catch (err) {
      console.warn('Failed to load delivery settings:', err.message);
    }
  };

  const handleSaveDeliverySettings = async () => {
    setSavingDelivery(true);
    try {
      const token = localStorage.getItem('appToken');
      const API_URL = import.meta.env.VITE_API_URL || '';
      const res = await axios.put(`${API_URL}/api/finance/delivery-settings`, deliverySettings, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.data.success) {
        toast.success('Delivery and fuel rates updated successfully!');
      }
    } catch (err) {
      console.error('Failed to update delivery settings:', err);
      toast.error('Failed to save delivery settings');
    } finally {
      setSavingDelivery(false);
    }
  };

  const fetchDashboardData = async () => {
    try {
      const token = localStorage.getItem('appToken');
      const API_URL = import.meta.env.VITE_API_URL || '';
      const res = await axios.get(`${API_URL}/api/finance/dashboard`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.data.success) {
        setData(res.data.data);
      }
    } catch (error) {
      console.error('Failed to load finance dashboard:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
    fetchDeliverySettings();
    const syncInterval = setInterval(() => {
      fetchDashboardData();
    }, 10000);

    const handleFocus = () => {
      fetchDashboardData();
    };
    window.addEventListener('focus', handleFocus);

    return () => {
      clearInterval(syncInterval);
      window.removeEventListener('focus', handleFocus);
    };
  }, []);

  const filteredActivity = useMemo(() => {
    if (!data.recentActivity) return [];
    if (activityFilter === 'orders') return data.recentActivity.filter(a => a.type === 'order');
    if (activityFilter === 'expenses') return data.recentActivity.filter(a => a.type === 'expense');
    return data.recentActivity;
  }, [data.recentActivity, activityFilter]);

  if (loading) {
    return (
      <Box sx={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', minHeight: '80vh', gap: 2 }}>
        <CircularProgress size={48} thickness={4} sx={{ color: 'primary.main' }} />
        <Typography variant="body2" color="text.secondary" fontWeight={500}>
          Loading financial overview...
        </Typography>
      </Box>
    );
  }

  const kpis = [
    {
      label: 'Total Revenue',
      value: `₱${(data.kpi.totalRevenue || 0).toLocaleString()}`,
      badge: `${data.kpi.paidOrdersCount || 0} Paid Orders`,
      trend: '+12.4% vs last mo',
      color: '#10B981',
      bg: 'rgba(16, 185, 129, 0.08)',
      borderColor: 'rgba(16, 185, 129, 0.25)',
      badgeBg: 'rgba(16, 185, 129, 0.1)',
      badgeColor: '#059669',
      badgeBorder: 'rgba(16, 185, 129, 0.25)',
      glowShadow: 'rgba(16, 185, 129, 0.22)',
      lightGlow: 'rgba(16, 185, 129, 0.04)',
      darkGlow: 'rgba(16, 185, 129, 0.08)',
      IconComponent: CustomFinanceRevenueIcon
    },
    {
      label: 'Pending Payments',
      value: `${data.kpi.pendingPayments || 0}`,
      badge: 'Action Required',
      trend: 'Bank verification queue',
      color: '#F59E0B',
      bg: 'rgba(245, 158, 11, 0.08)',
      borderColor: 'rgba(245, 158, 11, 0.25)',
      badgeBg: 'rgba(245, 158, 11, 0.1)',
      badgeColor: '#d97706',
      badgeBorder: 'rgba(245, 158, 11, 0.25)',
      glowShadow: 'rgba(245, 158, 11, 0.22)',
      lightGlow: 'rgba(245, 158, 11, 0.04)',
      darkGlow: 'rgba(245, 158, 11, 0.08)',
      IconComponent: CustomFinancePendingIcon
    },
    {
      label: 'Total Expenses',
      value: `₱${(data.kpi.totalExpenses || 0).toLocaleString()}`,
      badge: `${data.expenseCategoryBreakdown?.length || 0} Categories`,
      trend: 'Approved disbursals',
      color: '#EF4444',
      bg: 'rgba(239, 68, 68, 0.08)',
      borderColor: 'rgba(239, 68, 68, 0.25)',
      badgeBg: 'rgba(239, 68, 68, 0.1)',
      badgeColor: '#dc2626',
      badgeBorder: 'rgba(239, 68, 68, 0.25)',
      glowShadow: 'rgba(239, 68, 68, 0.22)',
      lightGlow: 'rgba(239, 68, 68, 0.04)',
      darkGlow: 'rgba(239, 68, 68, 0.08)',
      IconComponent: CustomFinanceExpensesIcon
    },
    {
      label: 'Net Operating Income',
      value: `₱${(data.kpi.netProfit || 0).toLocaleString()}`,
      badge: `${data.kpi.profitMargin || 0}% Margin`,
      trend: 'Net EBITDA',
      color: '#2563EB',
      bg: 'rgba(37, 99, 235, 0.08)',
      borderColor: 'rgba(37, 99, 235, 0.25)',
      badgeBg: 'rgba(37, 99, 235, 0.1)',
      badgeColor: '#2563eb',
      badgeBorder: 'rgba(37, 99, 235, 0.25)',
      glowShadow: 'rgba(37, 99, 235, 0.22)',
      lightGlow: 'rgba(37, 99, 235, 0.04)',
      darkGlow: 'rgba(37, 99, 235, 0.08)',
      IconComponent: CustomFinanceNetIncomeIcon
    }
  ];

  return (
    <Box sx={{ p: { xs: 2.5, md: 4 }, animation: 'fadeIn 0.4s ease-in-out' }}>
      <Box sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, justifyContent: 'space-between', alignItems: { xs: 'flex-start', sm: 'center' }, gap: 2, mb: 4 }}>
        <Box>
          <Stack direction="row" alignItems="center" spacing={1.5} sx={{ mb: 0.5 }}>
            <Typography variant="h4" fontWeight={800} sx={{ color: 'text.primary', letterSpacing: '-0.02em' }}>
              Finance Overview
            </Typography>
            <Chip label="Live Analytics" size="small" sx={{ bgcolor: 'rgba(16, 185, 129, 0.12)', color: '#047857', fontWeight: 700, fontSize: '0.7rem' }} />
          </Stack>
          <Typography variant="body2" color="text.secondary">
            Consolidated fiscal statements, cash-flow velocity, and expense allocations.
          </Typography>
        </Box>


      </Box>

      <Grid container spacing={2.5} sx={{ mb: 4 }}>
        {kpis.map((kpi, idx) => {
          const IconComponent = kpi.IconComponent;
          return (
            <Grid size={{ xs: 12, sm: 6, md: 3 }} key={idx}>
              <Paper
                elevation={0}
                sx={{
                  p: { xs: 2.5, md: 3 },
                  borderRadius: 4,
                  border: '1px solid',
                  borderColor: 'divider',
                  bgcolor: 'background.paper',
                  background: theme => theme.palette.mode === 'dark' 
                    ? `linear-gradient(145deg, ${kpi.darkGlow} 0%, rgba(15, 23, 42, 0.85) 100%)`
                    : `linear-gradient(145deg, ${kpi.lightGlow} 0%, #ffffff 100%)`,
                  position: 'relative',
                  overflow: 'hidden',
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  transition: 'all 0.28s cubic-bezier(0.4, 0, 0.2, 1)',
                  boxShadow: '0 4px 20px -8px rgba(0,0,0,0.05)',
                  '&::before': {
                    content: '""',
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    height: '3px',
                    background: `linear-gradient(90deg, ${kpi.color} 0%, transparent 100%)`,
                    opacity: 0.9
                  },
                  '&:hover': {
                    transform: 'translateY(-4px)',
                    boxShadow: `0 16px 32px -10px ${kpi.glowShadow}, 0 4px 12px rgba(0,0,0,0.04)`,
                    borderColor: kpi.color,
                    '& .mpi-fin-icon-wrap': {
                      transform: 'scale(1.08) rotate(2deg)',
                      borderColor: kpi.color,
                      boxShadow: `0 8px 18px -4px ${kpi.glowShadow}`
                    }
                  }
                }}
              >
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2.2 }}>
                  <Box
                    className="mpi-fin-icon-wrap"
                    sx={{
                      width: 48,
                      height: 48,
                      borderRadius: 3,
                      bgcolor: kpi.bg,
                      border: '1.5px solid',
                      borderColor: kpi.borderColor,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      transition: 'all 0.28s cubic-bezier(0.34, 1.56, 0.64, 1)',
                      boxShadow: `0 4px 12px ${kpi.glowShadow}`
                    }}
                  >
                    <IconComponent size={28} />
                  </Box>
                  <Chip
                    label={kpi.badge}
                    size="small"
                    sx={{
                      bgcolor: kpi.badgeBg,
                      color: kpi.badgeColor,
                      border: '1px solid',
                      borderColor: kpi.badgeBorder,
                      fontWeight: 700,
                      fontSize: '0.68rem',
                      letterSpacing: '0.02em',
                      px: 0.5,
                      height: 24,
                      borderRadius: 2
                    }}
                  />
                </Box>

                <Box sx={{ my: 0.5 }}>
                  <Typography
                    variant="caption"
                    sx={{
                      color: 'text.secondary',
                      fontWeight: 700,
                      fontSize: '0.75rem',
                      textTransform: 'uppercase',
                      letterSpacing: '0.06em',
                      display: 'block',
                      mb: 0.75
                    }}
                  >
                    {kpi.label}
                  </Typography>
                  <Typography
                    variant="h4"
                    sx={{
                      fontWeight: 900,
                      color: 'text.primary',
                      letterSpacing: '-0.03em',
                      fontSize: { xs: '1.6rem', md: '1.85rem' },
                      fontVariantNumeric: 'tabular-nums',
                      lineHeight: 1.15
                    }}
                  >
                    {kpi.value}
                  </Typography>
                </Box>

                <Box
                  sx={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 0.75,
                    mt: 2,
                    pt: 1.5,
                    borderTop: '1px solid',
                    borderColor: 'divider',
                    width: '100%'
                  }}
                >
                  <Box
                    sx={{
                      width: 7,
                      height: 7,
                      borderRadius: '50%',
                      bgcolor: kpi.color,
                      boxShadow: `0 0 8px ${kpi.color}`,
                      flexShrink: 0
                    }}
                  />
                  <Typography
                    variant="caption"
                    sx={{
                      color: 'text.secondary',
                      fontWeight: 600,
                      fontSize: '0.74rem',
                      whiteSpace: 'nowrap',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis'
                    }}
                  >
                    {kpi.trend}
                  </Typography>
                </Box>
              </Paper>
            </Grid>
          );
        })}
      </Grid>

      <Paper
        elevation={0}
        sx={{
          p: 3,
          mb: 4,
          borderRadius: 3.5,
          border: '1px solid',
          borderColor: 'divider',
          bgcolor: 'background.paper',
          boxShadow: '0 4px 20px -8px rgba(0,0,0,0.05)'
        }}
      >
        <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, justifyContent: 'space-between', alignItems: { xs: 'flex-start', md: 'center' }, gap: 2, mb: 3 }}>
          <Box>
            <Stack direction="row" spacing={1.5} alignItems="center">
              <Avatar sx={{ bgcolor: 'primary.main', width: 38, height: 38, borderRadius: 2.5 }}>
                <i className="fi fi-rr-gas-pump" style={{ fontSize: 18, color: '#fff' }} />
              </Avatar>
              <Box>
                <Typography variant="h6" fontWeight={800} sx={{ letterSpacing: '-0.01em' }}>
                  Delivery Fee & Fuel Rate Controls
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  Origin: <strong>Mega Pacific Imus Plant</strong> • Live formula parameters for all customer orders
                </Typography>
              </Box>
            </Stack>
          </Box>

          <Stack direction="row" spacing={1.5} alignItems="center">
            <Button
              variant="outlined"
              size="small"
              onClick={() => setShowVehicleRatesModal(!showVehicleRatesModal)}
              startIcon={<i className="fi fi-rr-truck-side" style={{ fontSize: 13 }} />}
              sx={{ borderRadius: 2, textTransform: 'none', fontWeight: 600, fontSize: '0.8rem' }}
            >
              {showVehicleRatesModal ? 'Hide Vehicle Matrix' : 'View Vehicle Matrix'}
            </Button>
            <Button
              variant="contained"
              size="small"
              onClick={handleSaveDeliverySettings}
              disabled={savingDelivery}
              startIcon={savingDelivery ? <CircularProgress size={14} color="inherit" /> : <i className="fi fi-rr-disk" style={{ fontSize: 13 }} />}
              sx={{ borderRadius: 2, textTransform: 'none', fontWeight: 700, px: 2.5, bgcolor: 'primary.main' }}
            >
              {savingDelivery ? 'Saving...' : 'Save Settings'}
            </Button>
          </Stack>
        </Box>

        <Grid container spacing={2.5} alignItems="center">
          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <TextField
              fullWidth
              size="small"
              label="Current Diesel Price (DP)"
              value={deliverySettings.dieselPrice}
              onChange={(e) => setDeliverySettings(prev => ({ ...prev, dieselPrice: e.target.value }))}
              InputProps={{
                startAdornment: <InputAdornment position="start">₱</InputAdornment>,
                endAdornment: <InputAdornment position="end">/ Liter</InputAdornment>
              }}
              helperText="Gas station unit price (Guidelines: ₱105.00)"
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <TextField
              fullWidth
              size="small"
              label="Admin Cost / PMS Rate"
              value={deliverySettings.adminCostPct}
              onChange={(e) => setDeliverySettings(prev => ({ ...prev, adminCostPct: e.target.value }))}
              InputProps={{
                endAdornment: <InputAdornment position="end">%</InputAdornment>
              }}
              helperText="Operation cost & PMS (Guidelines: 20%)"
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <TextField
              fullWidth
              size="small"
              disabled
              label="Manufacturing Plant Origin"
              value={deliverySettings.plantOrigin}
              InputProps={{
                startAdornment: <InputAdornment position="start"><i className="fi fi-rr-marker" style={{ fontSize: 13 }} /></InputAdornment>
              }}
              helperText="Origin for CALABARZON route calculations"
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <FormControlLabel
              control={
                <Switch
                  checked={deliverySettings.includeDepreciation}
                  onChange={(e) => setDeliverySettings(prev => ({ ...prev, includeDepreciation: e.target.checked }))}
                  color="primary"
                />
              }
              label={
                <Box>
                  <Typography variant="body2" fontWeight={600}>Vehicle Depreciation</Typography>
                  <Typography variant="caption" color="text.secondary">Include in base subtotal</Typography>
                </Box>
              }
            />
          </Grid>
        </Grid>

        <Collapse in={showVehicleRatesModal} timeout="auto" unmountOnExit>
          <Divider sx={{ my: 2.5 }} />
          <Typography variant="subtitle2" fontWeight={700} sx={{ mb: 1.5, display: 'flex', alignItems: 'center', gap: 1 }}>
            <i className="fi fi-rr-info" style={{ color: '#2563EB', fontSize: 14 }} />
            Delivery Fleet Rate Reference Table (from Guidelines)
          </Typography>
          <TableContainer component={Paper} elevation={0} sx={{ border: '1px solid #e2e8f0', borderRadius: 2 }}>
            <Table size="small">
              <TableHead sx={{ bgcolor: 'grey.50' }}>
                <TableRow>
                  <TableCell sx={{ fontWeight: 700, fontSize: '0.75rem' }}>Truck Type</TableCell>
                  <TableCell sx={{ fontWeight: 700, fontSize: '0.75rem' }}>Fuel Economy (KL)</TableCell>
                  <TableCell sx={{ fontWeight: 700, fontSize: '0.75rem' }}>Manpower (TM)</TableCell>
                  <TableCell sx={{ fontWeight: 700, fontSize: '0.75rem' }}>Bed Load Capacity</TableCell>
                  <TableCell sx={{ fontWeight: 700, fontSize: '0.75rem' }}>Top Load Capacity & Surcharge (TLA)</TableCell>
                  <TableCell sx={{ fontWeight: 700, fontSize: '0.75rem' }}>Depreciation (VD)</TableCell>
                </TableRow>
              </TableHead>
              <TableBody sx={{ fontSize: '0.75rem' }}>
                <TableRow>
                  <TableCell sx={{ fontWeight: 600 }}>Elf 6-Wheeler</TableCell>
                  <TableCell>7 km/L</TableCell>
                  <TableCell>₱1,900.00</TableCell>
                  <TableCell>Up to 6m, 5 mt</TableCell>
                  <TableCell>7–9m: ₱1,000 | 9.01–12m: ₱2,000 (Max 4 mt)</TableCell>
                  <TableCell>₱2,000.00</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell sx={{ fontWeight: 600 }}>Forward 6-Wheeler</TableCell>
                  <TableCell>5 km/L</TableCell>
                  <TableCell>₱2,100.00</TableCell>
                  <TableCell>Up to 8m, 8 mt</TableCell>
                  <TableCell>9.01–13m: ₱2,000 | 13.1–16m: ₱3,000 (Max 4 mt)</TableCell>
                  <TableCell>₱3,000.00</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell sx={{ fontWeight: 600 }}>10-Wheeler Drop-side</TableCell>
                  <TableCell>3 km/L</TableCell>
                  <TableCell>₱2,200.00</TableCell>
                  <TableCell>Up to 9m, 25 mt</TableCell>
                  <TableCell>10–15m: ₱4,000 | 16–21m: ₱6,000 (Max 2.5 mt)</TableCell>
                  <TableCell>₱6,000.00</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell sx={{ fontWeight: 600 }}>Tractor Head w/ Trailer</TableCell>
                  <TableCell>2 km/L</TableCell>
                  <TableCell>₱3,600.00</TableCell>
                  <TableCell>Up to 12m, 40 mt</TableCell>
                  <TableCell>Case-to-case / Heavy Rigging: ₱8,000</TableCell>
                  <TableCell>₱12,000.00</TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </TableContainer>
        </Collapse>
      </Paper>

      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid size={{ xs: 12, lg: 8 }}>
          <Paper
            elevation={0}
            sx={{
              p: 3,
              borderRadius: 3.5,
              border: '1px solid',
              borderColor: 'divider',
              height: '100%',
              display: 'flex',
              flexDirection: 'column'
            }}
          >
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2.5 }}>
              <Box>
                <Typography variant="h6" fontWeight={700} sx={{ letterSpacing: '-0.01em' }}>
                  Revenue & Expenses Trend
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  Monthly performance comparison (Trailing 6 Months)
                </Typography>
              </Box>
              <Stack direction="row" spacing={1} alignItems="center">
                <Chip label="Net P&L" size="small" variant="outlined" sx={{ fontWeight: 600, fontSize: '0.7rem' }} />
              </Stack>
            </Box>

            <Box sx={{ width: '100%', height: 320, flex: 1, minHeight: 300 }}>
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart
                  data={data.revenueVsExpensesTrend}
                  margin={{ top: 10, right: 10, left: -10, bottom: 0 }}
                >
                  <defs>
                    <linearGradient id="revGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10B981" stopOpacity={0.4} />
                      <stop offset="95%" stopColor="#10B981" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="expGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#EF4444" stopOpacity={0.4} />
                      <stop offset="95%" stopColor="#EF4444" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(226, 232, 240, 0.8)" vertical={false} />
                  <XAxis
                    dataKey="month"
                    stroke="#94A3B8"
                    fontSize={12}
                    tickLine={false}
                    axisLine={{ stroke: '#E2E8F0' }}
                  />
                  <YAxis
                    stroke="#94A3B8"
                    fontSize={12}
                    tickLine={false}
                    axisLine={false}
                    tickFormatter={(val) => `₱${val >= 1000 ? `${(val / 1000).toFixed(0)}k` : val}`}
                  />
                  <RechartsTooltip content={<CustomChartTooltip />} />
                  <Legend
                    verticalAlign="top"
                    align="right"
                    wrapperStyle={{ paddingBottom: 15, fontSize: '0.8rem' }}
                  />
                  <Area
                    type="monotone"
                    name="Revenue"
                    dataKey="revenue"
                    stroke="#10B981"
                    strokeWidth={2.5}
                    fillOpacity={1}
                    fill="url(#revGrad)"
                  />
                  <Area
                    type="monotone"
                    name="Expenses"
                    dataKey="expenses"
                    stroke="#EF4444"
                    strokeWidth={2.5}
                    fillOpacity={1}
                    fill="url(#expGrad)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </Box>
          </Paper>
        </Grid>

        <Grid size={{ xs: 12, lg: 4 }}>
          <Paper
            elevation={0}
            sx={{
              p: 3,
              borderRadius: 3.5,
              border: '1px solid',
              borderColor: 'divider',
              height: '100%',
              display: 'flex',
              flexDirection: 'column'
            }}
          >
            <Box sx={{ mb: 2 }}>
              <Typography variant="h6" fontWeight={700} sx={{ letterSpacing: '-0.01em' }}>
                Payment Distribution
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Breakdown by collection channel
              </Typography>
            </Box>

            <Box sx={{ width: '100%', height: 210, position: 'relative' }}>
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={data.paymentBreakdown}
                    innerRadius={55}
                    outerRadius={85}
                    paddingAngle={3}
                    dataKey="value"
                  >
                    {data.paymentBreakdown.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={DONUT_COLORS[index % DONUT_COLORS.length]} />
                    ))}
                  </Pie>
                  <RechartsTooltip content={<CustomChartTooltip />} />
                </PieChart>
              </ResponsiveContainer>
              <Box
                sx={{
                  position: 'absolute',
                  top: '50%',
                  left: '50%',
                  transform: 'translate(-50%, -50%)',
                  textAlign: 'center',
                  pointerEvents: 'none'
                }}
              >
                <Typography variant="h6" fontWeight={900} sx={{ lineHeight: 1 }}>
                  ₱{(data.kpi.totalRevenue || 0).toLocaleString()}
                </Typography>
                <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.65rem' }}>
                  Total Inflow
                </Typography>
              </Box>
            </Box>

            <Stack spacing={1.2} sx={{ mt: 2, pt: 1, borderTop: '1px solid', borderColor: 'divider' }}>
              {data.paymentBreakdown.map((item, index) => (
                <Box key={index} sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Stack direction="row" spacing={1} alignItems="center">
                    <Box sx={{ width: 10, height: 10, borderRadius: '50%', bgcolor: DONUT_COLORS[index % DONUT_COLORS.length] }} />
                    <Typography variant="body2" fontWeight={500} color="text.primary">
                      {item.name}
                    </Typography>
                  </Stack>
                  <Typography variant="body2" fontWeight={700}>
                    ₱{Number(item.value || 0).toLocaleString()}
                  </Typography>
                </Box>
              ))}
            </Stack>
          </Paper>
        </Grid>
      </Grid>

      <Grid container spacing={3}>
        <Grid size={{ xs: 12, lg: 8 }}>
          <Paper
            elevation={0}
            sx={{
              borderRadius: 3.5,
              border: '1px solid',
              borderColor: 'divider',
              overflow: 'hidden'
            }}
          >
            <Box
              sx={{
                p: 2.5,
                borderBottom: '1px solid',
                borderColor: 'divider',
                display: 'flex',
                flexDirection: { xs: 'column', sm: 'row' },
                justifyContent: 'space-between',
                alignItems: { xs: 'flex-start', sm: 'center' },
                gap: 1.5
              }}
            >
              <Box>
                <Typography variant="h6" fontWeight={700}>
                  Recent Financial Activity
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  Audited record of latest disbursements and incoming orders
                </Typography>
              </Box>

              <Tabs
                value={activityFilter}
                onChange={(_, val) => setActivityFilter(val)}
                sx={{
                  minHeight: 32,
                  '& .MuiTab-root': {
                    minHeight: 32,
                    textTransform: 'none',
                    fontWeight: 600,
                    fontSize: '0.75rem',
                    px: 1.5,
                    py: 0.5
                  }
                }}
              >
                <Tab label="All Records" value="all" />
                <Tab label="Incoming Orders" value="orders" />
                <Tab label="Expenses" value="expenses" />
              </Tabs>
            </Box>

            <TableContainer sx={{ maxHeight: 380 }}>
              <Table stickyHeader>
                <TableHead>
                  <TableRow>
                    <TableCell sx={{ fontWeight: 700, fontSize: '0.75rem', color: 'text.secondary', bgcolor: 'grey.50' }}>Reference</TableCell>
                    <TableCell sx={{ fontWeight: 700, fontSize: '0.75rem', color: 'text.secondary', bgcolor: 'grey.50' }}>Date</TableCell>
                    <TableCell sx={{ fontWeight: 700, fontSize: '0.75rem', color: 'text.secondary', bgcolor: 'grey.50' }}>Entity / Source</TableCell>
                    <TableCell sx={{ fontWeight: 700, fontSize: '0.75rem', color: 'text.secondary', bgcolor: 'grey.50' }}>Channel</TableCell>
                    <TableCell sx={{ fontWeight: 700, fontSize: '0.75rem', color: 'text.secondary', bgcolor: 'grey.50', textAlign: 'right' }}>Amount</TableCell>
                    <TableCell sx={{ fontWeight: 700, fontSize: '0.75rem', color: 'text.secondary', bgcolor: 'grey.50', textAlign: 'center' }}>Status</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {filteredActivity.map((row, i) => (
                    <TableRow key={i} hover sx={{ '&:last-child td': { borderBottom: 0 } }}>
                      <TableCell sx={{ fontWeight: 600, color: row.type === 'expense' ? '#DC2626' : 'primary.main', fontSize: '0.85rem' }}>
                        {row.id}
                      </TableCell>
                      <TableCell sx={{ fontSize: '0.82rem', color: 'text.secondary' }}>{row.date}</TableCell>
                      <TableCell sx={{ fontWeight: 500, fontSize: '0.85rem' }}>{row.by}</TableCell>
                      <TableCell>
                        <Stack direction="row" alignItems="center" spacing={1}>
                          <i
                            className={row.method === 'Bank Transfer' ? 'fi fi-rr-bank' : row.method === 'Expense' ? 'fi fi-rr-receipt' : 'fi fi-rr-money-bill-wave'}
                            style={{ color: '#64748B', fontSize: 13 }}
                          />
                          <Typography variant="body2" sx={{ fontSize: '0.8rem' }}>
                            {row.method}
                          </Typography>
                        </Stack>
                      </TableCell>
                      <TableCell sx={{ fontWeight: 800, textAlign: 'right', fontSize: '0.85rem', color: row.type === 'expense' ? 'error.dark' : 'text.primary' }}>
                        {row.amount}
                      </TableCell>
                      <TableCell sx={{ textAlign: 'center' }}>
                        <Chip
                          label={row.status.toUpperCase()}
                          size="small"
                          sx={{
                            fontWeight: 700,
                            fontSize: '0.65rem',
                            height: 22,
                            bgcolor:
                              row.status === 'verified' || row.status === 'approved' || row.status === 'paid'
                                ? 'rgba(16, 185, 129, 0.12)'
                                : 'rgba(245, 158, 11, 0.12)',
                            color:
                              row.status === 'verified' || row.status === 'approved' || row.status === 'paid'
                                ? '#047857'
                                : '#B45309'
                          }}
                        />
                      </TableCell>
                    </TableRow>
                  ))}
                  {filteredActivity.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={6} align="center" sx={{ py: 6, color: 'text.secondary' }}>
                        <i className="fi fi-rr-box-open" style={{ fontSize: 32, display: 'block', marginBottom: 8, opacity: 0.4 }} />
                        <Typography variant="body2">No matching transactions found in this period.</Typography>
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          </Paper>
        </Grid>

        <Grid size={{ xs: 12, lg: 4 }}>
          <Paper
            elevation={0}
            sx={{
              p: 3,
              borderRadius: 3.5,
              border: '1px solid',
              borderColor: 'divider',
              height: '100%',
              display: 'flex',
              flexDirection: 'column'
            }}
          >
            <Box sx={{ mb: 2 }}>
              <Typography variant="h6" fontWeight={700}>
                Expense Allocations
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Disbursements by functional department
              </Typography>
            </Box>

            <Stack spacing={2.5} sx={{ my: 'auto' }}>
              {data.expenseCategoryBreakdown?.map((cat, idx) => {
                const total = data.kpi.totalExpenses || 1;
                const pct = Math.round((cat.value / total) * 100);
                const color = DONUT_COLORS[idx % DONUT_COLORS.length];
                return (
                  <Box key={idx}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 0.5 }}>
                      <Typography variant="body2" fontWeight={600} color="text.primary">
                        {cat.name}
                      </Typography>
                      <Stack direction="row" spacing={1} alignItems="center">
                        <Typography variant="body2" fontWeight={700}>
                          ₱{cat.value.toLocaleString()}
                        </Typography>
                        <Chip label={`${pct}%`} size="small" sx={{ height: 18, fontSize: '0.65rem', fontWeight: 700 }} />
                      </Stack>
                    </Box>
                    <LinearProgress
                      variant="determinate"
                      value={pct}
                      sx={{
                        height: 8,
                        borderRadius: 4,
                        bgcolor: 'grey.100',
                        '& .MuiLinearProgress-bar': { bgcolor: color, borderRadius: 4 }
                      }}
                    />
                  </Box>
                );
              })}

              {(!data.expenseCategoryBreakdown || data.expenseCategoryBreakdown.length === 0) && (
                <Box sx={{ textAlign: 'center', py: 4, color: 'text.secondary' }}>
                  <Typography variant="body2">No expense allocations recorded.</Typography>
                </Box>
              )}
            </Stack>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default FinanceDashboardPage;
