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
  LinearProgress
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
  const [refreshing, setRefreshing] = useState(false);
  const [activityFilter, setActivityFilter] = useState('all');
  const [data, setData] = useState({
    kpi: {},
    revenueVsExpensesTrend: [],
    paymentBreakdown: [],
    expenseCategoryBreakdown: [],
    recentActivity: []
  });

  const fetchDashboardData = async (isManual = false) => {
    if (isManual) setRefreshing(true);
    try {
      const token = localStorage.getItem('appToken');
      const API_URL = import.meta.env.VITE_API_URL || '';
      const res = await axios.get(`${API_URL}/api/finance/dashboard`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.data.success) {
        setData(res.data.data);
        if (isManual) toast.success('Dashboard metrics refreshed');
      }
    } catch (error) {
      console.error('Failed to load finance dashboard:', error);
      toast.error('Failed to load dashboard data');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
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
          Loading financial intelligence overview...
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
      icon: 'fi fi-rr-money-bill-wave'
    },
    {
      label: 'Pending Payments',
      value: `${data.kpi.pendingPayments || 0}`,
      badge: 'Action Required',
      trend: 'Bank verification queue',
      color: '#F59E0B',
      bg: 'rgba(245, 158, 11, 0.08)',
      icon: 'fi fi-rr-time-fast'
    },
    {
      label: 'Total Expenses',
      value: `₱${(data.kpi.totalExpenses || 0).toLocaleString()}`,
      badge: `${data.expenseCategoryBreakdown?.length || 0} Categories`,
      trend: 'Approved disbursals',
      color: '#EF4444',
      bg: 'rgba(239, 68, 68, 0.08)',
      icon: 'fi fi-rr-chart-pie-alt'
    },
    {
      label: 'Net Operating Income',
      value: `₱${(data.kpi.netProfit || 0).toLocaleString()}`,
      badge: `${data.kpi.profitMargin || 0}% Margin`,
      trend: 'Net EBITDA',
      color: '#2563EB',
      bg: 'rgba(37, 99, 235, 0.08)',
      icon: 'fi fi-rr-chart-histogram'
    }
  ];

  return (
    <Box sx={{ p: { xs: 2.5, md: 4 }, animation: 'fadeIn 0.4s ease-in-out' }}>
      {/* Header with Title and Action Tools */}
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

        <Stack direction="row" spacing={1.5}>
          <Button
            variant="outlined"
            size="small"
            onClick={() => fetchDashboardData(true)}
            disabled={refreshing}
            startIcon={<i className={`fi fi-rr-refresh ${refreshing ? 'spin-icon' : ''}`} style={{ fontSize: 13 }} />}
            sx={{ borderRadius: 2, textTransform: 'none', fontWeight: 600, px: 2, borderColor: 'divider', color: 'text.primary' }}
          >
            {refreshing ? 'Updating...' : 'Refresh Data'}
          </Button>
        </Stack>
      </Box>

      {/* KPI Cards */}
      <Grid container spacing={2.5} sx={{ mb: 4 }}>
        {kpis.map((kpi, idx) => (
          <Grid item xs={12} sm={6} md={3} key={idx}>
            <Paper
              elevation={0}
              sx={{
                p: 2.5,
                borderRadius: 3.5,
                border: '1px solid',
                borderColor: 'divider',
                bgcolor: 'background.paper',
                transition: 'all 0.25s cubic-bezier(0.4, 0, 0.2, 1)',
                '&:hover': {
                  transform: 'translateY(-3px)',
                  boxShadow: '0 12px 24px -10px rgba(0,0,0,0.08)',
                  borderColor: kpi.color
                }
              }}
            >
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                <Box
                  sx={{
                    width: 44,
                    height: 44,
                    borderRadius: 2.5,
                    bgcolor: kpi.bg,
                    color: kpi.color,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}
                >
                  <i className={kpi.icon} style={{ fontSize: 20 }} />
                </Box>
                <Chip
                  label={kpi.badge}
                  size="small"
                  sx={{
                    bgcolor: 'grey.100',
                    color: 'text.secondary',
                    fontWeight: 700,
                    fontSize: '0.65rem'
                  }}
                />
              </Box>

              <Typography variant="body2" color="text.secondary" fontWeight={600} sx={{ mb: 0.5 }}>
                {kpi.label}
              </Typography>
              <Typography variant="h5" fontWeight={900} sx={{ color: 'text.primary', letterSpacing: '-0.02em', mb: 1 }}>
                {kpi.value}
              </Typography>
              <Typography variant="caption" sx={{ color: 'text.secondary', display: 'flex', alignItems: 'center', gap: 0.5 }}>
                <span style={{ color: kpi.color, fontWeight: 700 }}>●</span> {kpi.trend}
              </Typography>
            </Paper>
          </Grid>
        ))}
      </Grid>

      {/* Interactive Charts Row */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        {/* Revenue vs Expenses Area Chart */}
        <Grid item xs={12} lg={8}>
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

        {/* Payment Methods Breakdown (Donut Chart) */}
        <Grid item xs={12} lg={4}>
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

      {/* Bottom Grid: Recent Activity & Expense Allocation */}
      <Grid container spacing={3}>
        {/* Recent Financial Activity Table */}
        <Grid item xs={12} lg={8}>
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

        {/* Expense Category Allocations */}
        <Grid item xs={12} lg={4}>
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
