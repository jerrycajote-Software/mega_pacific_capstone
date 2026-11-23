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
  TextField,
  InputAdornment,
  FormControlLabel,
  Switch,
  Collapse,
  Avatar,
  Divider
} from '@mui/material';
import axios from 'axios';
import { toast } from 'react-hot-toast';
import {
  CustomAccountBalanceIcon,
  CustomReceiptLongIcon,
  CustomCashIcon,
  CustomInventory2Icon
} from '../../components/icons';
import DeliveryFleetRateControls from '../../components/finance/DeliveryFleetRateControls';
import RevenueExpensesBarChart from '../../components/finance/RevenueExpensesBarChart';
import PaymentDistributionCard from '../../components/finance/PaymentDistributionCard';
import ExpenseAllocationsCard from '../../components/finance/ExpenseAllocationsCard';
import { DEFAULT_VEHICLE_RULES } from '../../utils/deliveryFeeCalculator';

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
    plantOrigin: 'Mega Pacific Imus Plant (Imus, Cavite)',
    useDefaultFleetRates: true,
    vehicleSpecs: JSON.parse(JSON.stringify(DEFAULT_VEHICLE_RULES)),
    customVehicleSpecs: JSON.parse(JSON.stringify(DEFAULT_VEHICLE_RULES)),
    defaultVehicleSpecs: JSON.parse(JSON.stringify(DEFAULT_VEHICLE_RULES))
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
        const incoming = res.data.data;
        const defaultSpecs = incoming.defaultVehicleSpecs || JSON.parse(JSON.stringify(DEFAULT_VEHICLE_RULES));
        const customSpecs = incoming.customVehicleSpecs || incoming.vehicleSpecs || JSON.parse(JSON.stringify(defaultSpecs));
        setDeliverySettings({
          ...incoming,
          useDefaultFleetRates: incoming.useDefaultFleetRates !== false,
          defaultVehicleSpecs: defaultSpecs,
          customVehicleSpecs: customSpecs
        });
      }
    } catch (err) {
      console.warn('Failed to load delivery settings:', err.message);
    }
  };

  const handleToggleVehicleMatrix = () => {
    setShowVehicleRatesModal((prev) => !prev);
  };

  const handleToggleDefaultFleetRates = (checked) => {
    setDeliverySettings((prev) => ({
      ...prev,
      useDefaultFleetRates: checked
    }));
    if (checked) {
      toast('Switched to Default Guideline Truck Rates. Click "Save Delivery Settings" to apply.', { icon: 'ℹ️' });
    } else {
      toast('Custom Truck Rate editing enabled. Adjust truck rates below and save.', { icon: '✏️' });
    }
  };

  const handleRestoreDefaultFleetRates = () => {
    const cleanDefaults = JSON.parse(JSON.stringify(deliverySettings.defaultVehicleSpecs || DEFAULT_VEHICLE_RULES));
    setDeliverySettings((prev) => ({
      ...prev,
      customVehicleSpecs: cleanDefaults
    }));
    toast.success('Truck rate inputs restored to official guideline values.');
  };

  const handleUpdateVehicleField = (vehicleCode, field, rawValue) => {
    setDeliverySettings((prev) => {
      const currentCustom = Array.isArray(prev.customVehicleSpecs)
        ? prev.customVehicleSpecs
        : JSON.parse(JSON.stringify(DEFAULT_VEHICLE_RULES));
      const updatedCustom = currentCustom.map((v) =>
        v.code === vehicleCode ? { ...v, [field]: rawValue } : v
      );
      return {
        ...prev,
        customVehicleSpecs: updatedCustom
      };
    });
  };

  const handleUpdateVehicleTierFee = (vehicleCode, tierIndex, rawValue) => {
    setDeliverySettings((prev) => {
      const currentCustom = Array.isArray(prev.customVehicleSpecs)
        ? prev.customVehicleSpecs
        : JSON.parse(JSON.stringify(DEFAULT_VEHICLE_RULES));
      const updatedCustom = currentCustom.map((v) => {
        if (v.code !== vehicleCode) return v;
        const updatedTiers = (v.tlaTiers || []).map((t, idx) =>
          idx === tierIndex ? { ...t, tla: rawValue } : t
        );
        return { ...v, tlaTiers: updatedTiers };
      });
      return {
        ...prev,
        customVehicleSpecs: updatedCustom
      };
    });
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
        if (res.data.data) {
          setDeliverySettings((prev) => ({
            ...prev,
            ...res.data.data
          }));
        }
        toast.success(
          deliverySettings.useDefaultFleetRates
            ? 'Delivery settings saved with Default Guideline Truck Rates!'
            : 'Delivery settings and custom Truck Rates saved successfully!'
        );
      }
    } catch (err) {
      console.error('Failed to update delivery settings:', err);
      toast.error('Failed to save delivery fee and truck rate settings.');
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

    const handleFocus = () => {
      fetchDashboardData();
    };
    window.addEventListener('focus', handleFocus);

    return () => {
      window.removeEventListener('focus', handleFocus);
    };
  }, []);

  const handleChangeActivityFilter = (_, nextFilter) => {
    setActivityFilter(nextFilter);
  };

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

  // Format peso totals consistently with two decimal places for clean ledger alignment
  const formatPesoAmount = (amount) =>
    `₱${Number(amount || 0).toLocaleString('en-PH', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    })}`;

  const pendingPaymentsCount = Number(data.kpi.pendingPayments || 0);
  const pendingBalanceAmount = Number(data.kpi.pendingBalanceTotal || 0);
  const hasPendingActions = pendingPaymentsCount > 0 || pendingBalanceAmount > 0;

  const kpis = [
    {
      label: 'Collected Revenue',
      value: formatPesoAmount(data.kpi.totalRevenue),
      badge: `${data.kpi.paidOrdersCount || 0} Full Paid Orders`,
      trend: pendingBalanceAmount > 0
        ? `Pending 50%: ${formatPesoAmount(pendingBalanceAmount)}`
        : 'All verified payments collected',
      color: '#10B981',
      lightValueColor: '#047857',
      darkValueColor: '#34D399',
      hoverLightValueColor: '#065F46',
      hoverDarkValueColor: '#6EE7B7',
      hoverGlow: 'rgba(16, 185, 129, 0.32)',
      badgeBg: 'rgba(16, 185, 129, 0.1)',
      badgeColor: '#047857',
      darkBadgeColor: '#34D399',
      badgeBorder: 'rgba(16, 185, 129, 0.25)',
      glowShadow: 'rgba(16, 185, 129, 0.22)',
      lightGlow: 'rgba(16, 185, 129, 0.04)',
      darkGlow: 'rgba(16, 185, 129, 0.08)'
    },
    {
      label: 'Pending 50% & Bank Checks',
      value: `${pendingPaymentsCount}`,
      badge: hasPendingActions
        ? (pendingBalanceAmount > 0 ? `${formatPesoAmount(pendingBalanceAmount)} Pending` : 'Action Required')
        : 'All Caught Up',
      trend: hasPendingActions
        ? ((data.kpi.pending50OrdersCount || 0) > 0
            ? `${data.kpi.pending50OrdersCount} waiting on Logistics`
            : 'Awaiting verification')
        : 'No pending payments',
      color: hasPendingActions ? '#F59E0B' : '#10B981',
      lightValueColor: hasPendingActions ? '#B45309' : '#047857',
      darkValueColor: hasPendingActions ? '#FBBF24' : '#34D399',
      hoverLightValueColor: hasPendingActions ? '#92400E' : '#065F46',
      hoverDarkValueColor: hasPendingActions ? '#FDE68A' : '#6EE7B7',
      hoverGlow: hasPendingActions ? 'rgba(245, 158, 11, 0.32)' : 'rgba(16, 185, 129, 0.32)',
      badgeBg: hasPendingActions ? 'rgba(245, 158, 11, 0.1)' : 'rgba(16, 185, 129, 0.1)',
      badgeColor: hasPendingActions ? '#B45309' : '#047857',
      darkBadgeColor: hasPendingActions ? '#FBBF24' : '#34D399',
      badgeBorder: hasPendingActions ? 'rgba(245, 158, 11, 0.25)' : 'rgba(16, 185, 129, 0.25)',
      glowShadow: hasPendingActions ? 'rgba(245, 158, 11, 0.22)' : 'rgba(16, 185, 129, 0.22)',
      lightGlow: hasPendingActions ? 'rgba(245, 158, 11, 0.04)' : 'rgba(16, 185, 129, 0.04)',
      darkGlow: hasPendingActions ? 'rgba(245, 158, 11, 0.08)' : 'rgba(16, 185, 129, 0.08)'
    },
    {
      label: 'Total Expenses',
      value: formatPesoAmount(data.kpi.totalExpenses),
      badge: `${data.expenseCategoryBreakdown?.length || 0} Categories`,
      trend: 'Approved expenses',
      color: '#EF4444',
      lightValueColor: '#DC2626',
      darkValueColor: '#F87171',
      hoverLightValueColor: '#B91C1C',
      hoverDarkValueColor: '#FCA5A5',
      hoverGlow: 'rgba(239, 68, 68, 0.32)',
      badgeBg: 'rgba(239, 68, 68, 0.1)',
      badgeColor: '#DC2626',
      darkBadgeColor: '#F87171',
      badgeBorder: 'rgba(239, 68, 68, 0.25)',
      glowShadow: 'rgba(239, 68, 68, 0.22)',
      lightGlow: 'rgba(239, 68, 68, 0.04)',
      darkGlow: 'rgba(239, 68, 68, 0.08)'
    },
    {
      label: 'Net Operating Income',
      value: formatPesoAmount(data.kpi.netProfit),
      badge: `${data.kpi.profitMargin || 0}% Profit`,
      trend: 'Operating profit',
      color: '#2563EB',
      lightValueColor: '#1D4ED8',
      darkValueColor: '#60A5FA',
      hoverLightValueColor: '#1E40AF',
      hoverDarkValueColor: '#93C5FD',
      hoverGlow: 'rgba(37, 99, 235, 0.32)',
      badgeBg: 'rgba(37, 99, 235, 0.1)',
      badgeColor: '#1D4ED8',
      darkBadgeColor: '#60A5FA',
      badgeBorder: 'rgba(37, 99, 235, 0.25)',
      glowShadow: 'rgba(37, 99, 235, 0.22)',
      lightGlow: 'rgba(37, 99, 235, 0.04)',
      darkGlow: 'rgba(37, 99, 235, 0.08)'
    }
  ];

  return (
    <Box sx={{ p: { xs: 2.5, md: 4 }, animation: 'fadeIn 0.4s ease-in-out' }}>
      <Box sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, justifyContent: 'space-between', alignItems: { xs: 'flex-start', sm: 'center' }, gap: 2, mb: 4 }}>
        <Box>
          <Stack direction="row" alignItems="center" spacing={1.5} sx={{ mb: 0.5, flexWrap: 'wrap', gap: 1 }}>
            <Typography variant="h4" fontWeight={800} sx={{ color: 'text.primary', letterSpacing: '-0.02em' }}>
              Finance Overview
            </Typography>
            <span className="role-identity-pill">
              <span className="role-identity-dot" />
              Finance Operations
            </span>
            <Chip label="Live Analytics" size="small" sx={{ bgcolor: 'rgba(16, 185, 129, 0.12)', color: (theme) => theme.palette.mode === 'dark' ? '#34d399' : '#047857', fontWeight: 700, fontSize: '0.7rem' }} />
          </Stack>
          <Typography variant="body2" color="text.secondary">
            Summary of company revenue, expenses, and cash flow.
          </Typography>
        </Box>


      </Box>

      <Grid container spacing={2.5} sx={{ mb: 4 }}>
        {kpis.map((kpi, idx) => (
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
                  '&:hover': {
                    transform: 'translateY(-4px)',
                    boxShadow: `0 16px 32px -10px ${kpi.glowShadow}, 0 4px 12px rgba(0,0,0,0.04)`,
                    borderColor: kpi.color,
                    '& .mpi-fin-kpi-value': {
                      color: (theme) => theme.palette.mode === 'dark' ? kpi.hoverDarkValueColor : kpi.hoverLightValueColor,
                      textShadow: (theme) => theme.palette.mode === 'dark'
                        ? `0 0 18px ${kpi.hoverGlow}`
                        : `0 2px 12px ${kpi.hoverGlow}`,
                      transform: 'translateX(2px)'
                    }
                  }
                }}
              >
                <Box sx={{ display: 'flex', justifyContent: 'flex-start', alignItems: 'center', mb: 1.75 }}>
                  <Chip
                    label={kpi.badge}
                    size="small"
                    sx={{
                      bgcolor: kpi.badgeBg,
                      color: (theme) => theme.palette.mode === 'dark' ? kpi.darkBadgeColor : kpi.badgeColor,
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

                <Box sx={{ my: 0.5, flexGrow: 1, display: 'flex', alignItems: 'center' }}>
                  <Typography
                    variant="h4"
                    className="mpi-fin-kpi-value"
                    sx={{
                      fontWeight: 900,
                      color: (theme) => theme.palette.mode === 'dark' ? kpi.darkValueColor : kpi.lightValueColor,
                      letterSpacing: '-0.03em',
                      fontSize: { xs: '1.6rem', md: '1.85rem' },
                      fontVariantNumeric: 'tabular-nums',
                      lineHeight: 1.15,
                      transition: 'color 0.22s ease, text-shadow 0.22s ease, transform 0.22s ease'
                    }}
                  >
                    {kpi.value}
                  </Typography>
                </Box>

                <Box
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 0.75,
                    mt: 2,
                    pt: 1.5,
                    minHeight: { md: 44 },
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
                      fontSize: '0.73rem',
                      lineHeight: 1.35
                    }}
                  >
                    {kpi.trend} / {kpi.label}
                  </Typography>
                </Box>
              </Paper>
            </Grid>
        ))}
      </Grid>

      <DeliveryFleetRateControls
        deliverySettings={deliverySettings}
        setDeliverySettings={setDeliverySettings}
        savingDelivery={savingDelivery}
        showVehicleRatesModal={showVehicleRatesModal}
        handleToggleVehicleMatrix={handleToggleVehicleMatrix}
        handleSaveDeliverySettings={handleSaveDeliverySettings}
        handleToggleDefaultFleetRates={handleToggleDefaultFleetRates}
        handleRestoreDefaultFleetRates={handleRestoreDefaultFleetRates}
        handleUpdateVehicleField={handleUpdateVehicleField}
        handleUpdateVehicleTierFee={handleUpdateVehicleTierFee}
      />

      {/* Full-width stacked analytics, recent financial activity, and expense allocations */}
      <Grid container spacing={3}>
        <Grid size={{ xs: 12 }}>
          <RevenueExpensesBarChart trendData={data.revenueVsExpensesTrend} />
        </Grid>

        <Grid size={{ xs: 12 }}>
          <PaymentDistributionCard
            paymentBreakdown={data.paymentBreakdown}
            totalRevenue={data.kpi.totalRevenue}
          />
        </Grid>

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
                px: 3,
                py: 2.5,
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
                <Typography variant="h6" fontWeight={700} sx={{ letterSpacing: '-0.01em' }}>
                  Recent Financial Activity
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  Record of latest company expenses and customer orders
                </Typography>
              </Box>

              <Tabs
                value={activityFilter}
                onChange={handleChangeActivityFilter}
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
                  <TableRow sx={{ '& th': { borderBottom: '1px solid', borderColor: 'divider' } }}>
                    <TableCell sx={{ fontWeight: 700, fontSize: '0.75rem', color: 'text.secondary', bgcolor: (theme) => theme.palette.mode === 'dark' ? '#141d2e' : '#f8fafc', whiteSpace: 'nowrap' }}>Reference</TableCell>
                    <TableCell sx={{ fontWeight: 700, fontSize: '0.75rem', color: 'text.secondary', bgcolor: (theme) => theme.palette.mode === 'dark' ? '#141d2e' : '#f8fafc', whiteSpace: 'nowrap' }}>Date</TableCell>
                    <TableCell sx={{ fontWeight: 700, fontSize: '0.75rem', color: 'text.secondary', bgcolor: (theme) => theme.palette.mode === 'dark' ? '#141d2e' : '#f8fafc', whiteSpace: 'nowrap' }}>Entity / Source</TableCell>
                    <TableCell sx={{ fontWeight: 700, fontSize: '0.75rem', color: 'text.secondary', bgcolor: (theme) => theme.palette.mode === 'dark' ? '#141d2e' : '#f8fafc' }}>Channel</TableCell>
                    <TableCell sx={{ fontWeight: 700, fontSize: '0.75rem', color: 'text.secondary', bgcolor: (theme) => theme.palette.mode === 'dark' ? '#141d2e' : '#f8fafc', textAlign: 'right', whiteSpace: 'nowrap' }}>Amount</TableCell>
                    <TableCell sx={{ fontWeight: 700, fontSize: '0.75rem', color: 'text.secondary', bgcolor: (theme) => theme.palette.mode === 'dark' ? '#141d2e' : '#f8fafc', textAlign: 'center', whiteSpace: 'nowrap' }}>Status</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {filteredActivity.map((row, i) => (
                    <TableRow key={i} hover sx={{ '&:last-child td': { borderBottom: 0 } }}>
                      <TableCell sx={{ fontWeight: 600, color: row.type === 'expense' ? '#DC2626' : 'primary.main', fontSize: '0.85rem', whiteSpace: 'nowrap' }}>
                        {row.id}
                      </TableCell>
                      <TableCell sx={{ fontSize: '0.82rem', color: 'text.secondary', whiteSpace: 'nowrap', fontVariantNumeric: 'tabular-nums' }}>{row.date}</TableCell>
                      <TableCell sx={{ fontWeight: 500, fontSize: '0.85rem', whiteSpace: 'nowrap' }}>{row.by}</TableCell>
                      <TableCell>
                        <Stack direction="row" alignItems="center" spacing={1}>
                          {row.method === 'Bank Transfer' ? (
                            <CustomAccountBalanceIcon size={14} color="#64748B" />
                          ) : row.method === 'Expense' ? (
                            <CustomReceiptLongIcon size={14} color="#64748B" />
                          ) : (
                            <CustomCashIcon size={14} color="#64748B" />
                          )}
                          <Typography variant="body2" sx={{ fontSize: '0.8rem' }}>
                            {row.method}
                          </Typography>
                        </Stack>
                      </TableCell>
                      <TableCell sx={{ fontWeight: 800, textAlign: 'right', fontSize: '0.85rem', color: row.type === 'expense' ? 'error.dark' : 'text.primary', whiteSpace: 'nowrap', fontVariantNumeric: 'tabular-nums' }}>
                        {row.amount}
                      </TableCell>
                      <TableCell sx={{ textAlign: 'center', whiteSpace: 'nowrap' }}>
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
                        <Box sx={{ display: 'flex', justifyContent: 'center', mb: 1, opacity: 0.4 }}>
                          <CustomInventory2Icon size={32} color="#64748B" />
                        </Box>
                        <Typography variant="body2">No matching transactions found in this period.</Typography>
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          </Paper>
        </Grid>

        <Grid size={{ xs: 12 }}>
          <ExpenseAllocationsCard
            expenseCategoryBreakdown={data.expenseCategoryBreakdown}
            totalExpenses={data.kpi.totalExpenses}
          />
        </Grid>
      </Grid>
    </Box>
  );
};

export default FinanceDashboardPage;
