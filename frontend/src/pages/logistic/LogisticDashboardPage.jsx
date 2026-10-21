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
  Button,
  CircularProgress,
  Tabs,
  Tab
} from '@mui/material';
import {
  BarChart,
  Bar,
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
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-hot-toast';
import { usePreventBackToLogin } from '../../hooks/usePreventBackToLogin';

const DONUT_COLORS = ['#2563EB', '#8B5CF6', '#10B981', '#F59E0B'];

const CustomLogisticTooltip = ({ active, payload, label }) => {
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
              {item.value} order{item.value !== 1 ? 's' : ''}
            </Typography>
          </Box>
        ))}
      </Paper>
    );
  }
  return null;
};

const LogisticDashboardPage = () => {
  usePreventBackToLogin();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [dispatchFilter, setDispatchFilter] = useState('all');
  const [data, setData] = useState({
    kpi: {},
    fulfillmentTrend: [],
    fulfillmentDistribution: [],
    alerts: [],
    recentDeliveries: []
  });

  const fetchDashboardData = async (isManual = false) => {
    if (isManual) setRefreshing(true);
    try {
      const token = localStorage.getItem('appToken');
      const API_URL = import.meta.env.VITE_API_URL || '';
      const res = await axios.get(`${API_URL}/api/logistic/dashboard`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.data.success) {
        setData(res.data.data);
        if (isManual) toast.success('Logistics operations refreshed');
      }
    } catch (error) {
      console.error('Failed to load logistic dashboard:', error);
      toast.error('Failed to load logistics data');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const filteredDeliveries = useMemo(() => {
    if (!data.recentDeliveries) return [];
    if (dispatchFilter === 'completed') return data.recentDeliveries.filter(d => d.status === 'completed' || d.status === 'delivered');
    if (dispatchFilter === 'transit') return data.recentDeliveries.filter(d => d.status === 'shipped' || d.status === 'out_for_delivery');
    if (dispatchFilter === 'processing') return data.recentDeliveries.filter(d => d.status === 'processing' || d.status === 'finance_verified');
    if (dispatchFilter === 'pickups') return data.recentDeliveries.filter(d => d.fulfillmentType === 'Pickup' || d.status === 'ready_for_pickup');
    return data.recentDeliveries;
  }, [data.recentDeliveries, dispatchFilter]);

  if (loading) {
    return (
      <Box sx={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', minHeight: '80vh', gap: 2 }}>
        <CircularProgress size={48} thickness={4} sx={{ color: 'primary.main' }} />
        <Typography variant="body2" color="text.secondary" fontWeight={500}>
          Loading logistics & fleet monitoring...
        </Typography>
      </Box>
    );
  }

  const kpis = [
    {
      label: 'Orders Ready to Ship',
      value: data.kpi.readyToShip || 0,
      badge: 'Action Required',
      sub: 'Awaiting courier dispatch',
      color: '#F59E0B',
      bg: 'rgba(245, 158, 11, 0.08)',
      icon: 'fi fi-rr-box-open'
    },
    {
      label: 'Out for Delivery',
      value: data.kpi.outForDelivery || 0,
      badge: 'In Transit',
      sub: 'En-route to customer',
      color: '#2563EB',
      bg: 'rgba(37, 99, 235, 0.08)',
      icon: 'fi fi-rr-truck-side'
    },
    {
      label: 'Completed Today',
      value: data.kpi.completedToday || 0,
      badge: 'Fulfillment Goal',
      sub: 'Successfully received',
      color: '#10B981',
      bg: 'rgba(16, 185, 129, 0.08)',
      icon: 'fi fi-sr-check-circle'
    },
    {
      label: 'Store Counter Pickups',
      value: data.kpi.pendingPickups || 0,
      badge: 'Warehouse Dock',
      sub: 'Ready for customer retrieval',
      color: '#8B5CF6',
      bg: 'rgba(139, 92, 246, 0.08)',
      icon: 'fi fi-rr-shop'
    }
  ];

  return (
    <Box sx={{ p: { xs: 2.5, md: 4 }, animation: 'fadeIn 0.4s ease-in-out' }}>
      <Box sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, justifyContent: 'space-between', alignItems: { xs: 'flex-start', sm: 'center' }, gap: 2, mb: 4 }}>
        <Box>
          <Stack direction="row" alignItems="center" spacing={1.5} sx={{ mb: 0.5 }}>
            <Typography variant="h4" fontWeight={800} sx={{ color: 'text.primary', letterSpacing: '-0.02em' }}>
              Logistics Overview
            </Typography>
            <Chip
              label="Fleet Active • On-Time: 98.8%"
              size="small"
              sx={{ bgcolor: 'rgba(16, 185, 129, 0.12)', color: '#047857', fontWeight: 700, fontSize: '0.7rem' }}
            />
          </Stack>
          <Typography variant="body2" color="text.secondary">
            Real-time fulfillment metrics, route dispatch velocities, and store pickup management.
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
            {refreshing ? 'Syncing...' : 'Refresh Fleet'}
          </Button>

          <Button
            variant="contained"
            color="primary"
            size="small"
            onClick={() => navigate('/logistic/deliveries')}
            startIcon={<i className="fi fi-rr-boxes" style={{ fontSize: 13 }} />}
            sx={{ borderRadius: 2, textTransform: 'none', fontWeight: 700, px: 2.5 }}
          >
            Manage Deliveries
          </Button>
        </Stack>
      </Box>

      <Grid container spacing={2.5} sx={{ mb: 4 }}>
        {kpis.map((kpi, idx) => (
          <Grid size={{ xs: 12, sm: 6, md: 3 }} key={idx}>
            <Paper
              elevation={0}
              sx={{
                p: 2.5,
                borderRadius: 3.5,
                border: '1px solid',
                borderColor: 'divider',
                bgcolor: 'background.paper',
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
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
              <Typography variant="h5" fontWeight={900} sx={{ color: 'text.primary', letterSpacing: '-0.02em', mb: 0.5 }}>
                {kpi.value}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                {kpi.sub}
              </Typography>
            </Paper>
          </Grid>
        ))}
      </Grid>

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
                  Fulfillment Volume (Trailing 7 Days)
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  Daily distribution between direct deliveries and counter pickups
                </Typography>
              </Box>
              <Chip label="Real-Time" size="small" variant="outlined" sx={{ fontWeight: 600, fontSize: '0.7rem' }} />
            </Box>

            <Box sx={{ width: '100%', height: 320, flex: 1, minHeight: 300 }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={data.fulfillmentTrend}
                  margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(226, 232, 240, 0.8)" vertical={false} />
                  <XAxis
                    dataKey="day"
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
                    allowDecimals={false}
                  />
                  <RechartsTooltip content={<CustomLogisticTooltip />} />
                  <Legend verticalAlign="top" align="right" wrapperStyle={{ paddingBottom: 15, fontSize: '0.8rem' }} />
                  <Bar
                    dataKey="deliveries"
                    name="Direct Delivery"
                    fill="#2563EB"
                    radius={[4, 4, 0, 0]}
                    maxBarSize={32}
                  />
                  <Bar
                    dataKey="pickups"
                    name="Store Pickup"
                    fill="#8B5CF6"
                    radius={[4, 4, 0, 0]}
                    maxBarSize={32}
                  />
                </BarChart>
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
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2.5 }}>
              <Typography variant="h6" fontWeight={700} sx={{ letterSpacing: '-0.01em' }}>
                Operational Alerts
              </Typography>
              <i className="fi fi-rr-bell-ring" style={{ color: '#2563EB', fontSize: 18 }} />
            </Box>

            <Stack spacing={2} sx={{ mb: 3 }}>
              {data.alerts?.map((alert, i) => (
                <Box
                  key={i}
                  sx={{
                    p: 2,
                    borderRadius: 2.5,
                    border: '1px solid',
                    borderColor:
                      alert.type === 'warning'
                        ? 'rgba(245, 158, 11, 0.3)'
                        : alert.type === 'info'
                        ? 'rgba(37, 99, 235, 0.3)'
                        : alert.type === 'primary'
                        ? 'rgba(139, 92, 246, 0.3)'
                        : 'rgba(16, 185, 129, 0.3)',
                    bgcolor:
                      alert.type === 'warning'
                        ? 'rgba(245, 158, 11, 0.04)'
                        : alert.type === 'info'
                        ? 'rgba(37, 99, 235, 0.04)'
                        : alert.type === 'primary'
                        ? 'rgba(139, 92, 246, 0.04)'
                        : 'rgba(16, 185, 129, 0.04)'
                  }}
                >
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 0.5 }}>
                    <Typography variant="subtitle2" fontWeight={700} sx={{ color: 'text.primary' }}>
                      {alert.title}
                    </Typography>
                    <Chip
                      label={alert.action}
                      size="small"
                      onClick={() => navigate('/logistic/deliveries')}
                      sx={{
                        fontSize: '0.65rem',
                        fontWeight: 700,
                        cursor: 'pointer',
                        height: 20,
                        bgcolor: 'background.paper',
                        borderColor: 'divider'
                      }}
                      variant="outlined"
                    />
                  </Box>
                  <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.8rem' }}>
                    {alert.message}
                  </Typography>
                </Box>
              ))}
            </Stack>

            <Box sx={{ mt: 'auto', pt: 2, borderTop: '1px solid', borderColor: 'divider' }}>
              <Typography variant="caption" fontWeight={700} color="text.secondary" sx={{ textTransform: 'uppercase', letterSpacing: 0.5, display: 'block', mb: 1 }}>
                Fulfillment Type Share
              </Typography>
              <Box sx={{ width: '100%', height: 130, position: 'relative' }}>
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={data.fulfillmentDistribution}
                      innerRadius={36}
                      outerRadius={56}
                      paddingAngle={4}
                      dataKey="value"
                    >
                      {data.fulfillmentDistribution?.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={DONUT_COLORS[index % DONUT_COLORS.length]} />
                      ))}
                    </Pie>
                    <RechartsTooltip />
                  </PieChart>
                </ResponsiveContainer>
              </Box>
            </Box>
          </Paper>
        </Grid>
      </Grid>

      <Grid container spacing={3}>
        <Grid size={{ xs: 12 }}>
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
                  Recent Dispatches & Pickups
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  Active delivery waybills, destination addresses, and current transit milestones
                </Typography>
              </Box>

              <Tabs
                value={dispatchFilter}
                onChange={(_, val) => setDispatchFilter(val)}
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
                <Tab label="All Dispatches" value="all" />
                <Tab label="In Transit" value="transit" />
                <Tab label="Processing" value="processing" />
                <Tab label="Store Pick-ups" value="pickups" />
                <Tab label="Completed" value="completed" />
              </Tabs>
            </Box>

            <TableContainer sx={{ maxHeight: 420 }}>
              <Table stickyHeader>
                <TableHead>
                  <TableRow>
                    <TableCell sx={{ fontWeight: 700, fontSize: '0.75rem', color: 'text.secondary', bgcolor: 'grey.50' }}>Order Tracking ID</TableCell>
                    <TableCell sx={{ fontWeight: 700, fontSize: '0.75rem', color: 'text.secondary', bgcolor: 'grey.50' }}>Recipient Customer</TableCell>
                    <TableCell sx={{ fontWeight: 700, fontSize: '0.75rem', color: 'text.secondary', bgcolor: 'grey.50' }}>Destination Address</TableCell>
                    <TableCell sx={{ fontWeight: 700, fontSize: '0.75rem', color: 'text.secondary', bgcolor: 'grey.50' }}>Date Dispatched</TableCell>
                    <TableCell sx={{ fontWeight: 700, fontSize: '0.75rem', color: 'text.secondary', bgcolor: 'grey.50', textAlign: 'center' }}>Fulfillment Status</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {filteredDeliveries.map((row, i) => {
                    const isPickupReady = row.status === 'ready_for_pickup';
                    return (
                      <TableRow key={i} hover sx={{ '&:last-child td': { borderBottom: 0 } }}>
                        <TableCell sx={{ fontWeight: 700, color: 'primary.main', fontSize: '0.85rem' }}>
                          {row.id}
                        </TableCell>
                        <TableCell sx={{ fontWeight: 500, fontSize: '0.85rem' }}>
                          {row.customer}
                        </TableCell>
                        <TableCell sx={{ color: 'text.secondary', fontSize: '0.82rem' }}>
                          <Stack direction="row" spacing={0.75} alignItems="center">
                            <i className="fi fi-rr-marker" style={{ fontSize: 12, color: '#64748B' }} />
                            <span>{row.address}</span>
                          </Stack>
                        </TableCell>
                        <TableCell sx={{ fontSize: '0.82rem', color: 'text.secondary' }}>
                          {row.date}
                        </TableCell>
                        <TableCell sx={{ textAlign: 'center' }}>
                          <Chip
                            label={isPickupReady ? 'READY FOR PICK-UP' : row.status.replace(/_/g, ' ').toUpperCase()}
                            size="small"
                            sx={{
                              fontWeight: 700,
                              fontSize: '0.65rem',
                              height: 22,
                              bgcolor:
                                isPickupReady
                                  ? 'rgba(139, 92, 246, 0.15)'
                                  : row.status === 'delivered' || row.status === 'completed'
                                  ? 'rgba(16, 185, 129, 0.12)'
                                  : row.status === 'out_for_delivery' || row.status === 'shipped'
                                  ? 'rgba(37, 99, 235, 0.12)'
                                  : 'rgba(245, 158, 11, 0.12)',
                              color:
                                isPickupReady
                                  ? '#7C3AED'
                                  : row.status === 'delivered' || row.status === 'completed'
                                  ? '#047857'
                                  : row.status === 'out_for_delivery' || row.status === 'shipped'
                                  ? '#1D4ED8'
                                  : '#B45309'
                            }}
                          />
                        </TableCell>
                      </TableRow>
                    );
                  })}
                  {filteredDeliveries.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={5} align="center" sx={{ py: 6, color: 'text.secondary' }}>
                        <i className="fi fi-rr-truck-side" style={{ fontSize: 32, display: 'block', marginBottom: 8, opacity: 0.4 }} />
                        <Typography variant="body2">No dispatches found matching this filter.</Typography>
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default LogisticDashboardPage;
