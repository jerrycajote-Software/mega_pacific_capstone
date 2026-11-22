import React, { useMemo } from 'react';
import { Box, Paper, Typography, Stack, Chip, LinearProgress, useTheme } from '@mui/material';
import {
  PieChart,
  Pie,
  Cell,
  Tooltip as RechartsTooltip,
  ResponsiveContainer
} from 'recharts';

const CHANNEL_COLOR_MAP = {
  'Bank Card': '#2563EB',
  GCash: '#10B981',
  'Cash on Delivery': '#8B5CF6',
  'Bank Transfer': '#F59E0B',
  Maya: '#06B6D4',
  PayMongo: '#EC4899',
  'Other Payment': '#64748B'
};

const FALLBACK_COLORS = ['#2563EB', '#10B981', '#8B5CF6', '#F59E0B', '#06B6D4', '#EC4899'];

// Format peso amounts consistently with two decimal places
const formatPesoExact = (value) => {
  const num = Number(value || 0);
  return `₱${num.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
};

// Format large center totals cleanly so text always fits inside the donut ring
const formatDonutCenterTotal = (value) => {
  const num = Number(value || 0);
  if (num >= 1000000) return `₱${(num / 1000000).toFixed(2)}M`;
  return formatPesoExact(num);
};

// Resolve a consistent brand color for each normalized payment channel
const getChannelColor = (name, index) => (
  CHANNEL_COLOR_MAP[name] || FALLBACK_COLORS[index % FALLBACK_COLORS.length]
);

// Render hover tooltip for each donut slice with amount, share, and order count
const PaymentDonutTooltip = ({ active, payload, totalAmount }) => {
  if (!active || !payload || payload.length === 0) return null;

  const entry = payload[0]?.payload;
  if (!entry) return null;

  const value = Number(entry.value || 0);
  const share = totalAmount > 0 ? ((value / totalAmount) * 100).toFixed(1) : '0.0';
  const orderLabel = entry.count === 1 ? '1 order' : `${entry.count || 0} orders`;

  return (
    <Paper
      elevation={4}
      sx={{
        p: 1.5,
        minWidth: 190,
        borderRadius: 2,
        border: '1px solid',
        borderColor: 'divider',
        bgcolor: 'background.paper'
      }}
    >
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
        <Box sx={{ width: 9, height: 9, borderRadius: '50%', bgcolor: entry.color, flexShrink: 0 }} />
        <Typography variant="caption" fontWeight={700} color="text.primary">
          {entry.name}
        </Typography>
      </Box>
      <Typography variant="body2" fontWeight={800} color="text.primary" sx={{ fontVariantNumeric: 'tabular-nums' }}>
        {formatPesoExact(value)}
      </Typography>
      <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 0.25 }}>
        {share}% of total inflow • {orderLabel}
      </Typography>
    </Paper>
  );
};

// Display full-width Payment Distribution card with a Donut chart on the left and clean grouped channels on the right
const PaymentDistributionCard = ({ paymentBreakdown = [], totalRevenue = 0 }) => {
  const theme = useTheme();

  // Normalize and sort channel entries defensively so the chart never breaks on empty or raw data
  const channels = useMemo(() => {
    if (!Array.isArray(paymentBreakdown)) return [];
    return paymentBreakdown
      .filter((item) => Number(item?.value || 0) > 0)
      .map((item, idx) => ({
        name: item?.name || 'Other Payment',
        value: Number(item?.value || 0),
        count: Number(item?.count || 0),
        subtitle: item?.subtitle || '',
        color: getChannelColor(item?.name, idx)
      }))
      .sort((a, b) => b.value - a.value);
  }, [paymentBreakdown]);

  // Compute total inflow and order count from channel breakdown with safe fallback
  const computedTotal = useMemo(() => {
    const sum = channels.reduce((acc, item) => acc + item.value, 0);
    return sum > 0 ? sum : Number(totalRevenue || 0);
  }, [channels, totalRevenue]);

  const totalOrders = useMemo(
    () => channels.reduce((acc, item) => acc + item.count, 0),
    [channels]
  );

  return (
    <Paper
      elevation={0}
      sx={{
        p: 3,
        borderRadius: 3.5,
        border: '1px solid',
        borderColor: 'divider'
      }}
    >
      <Box
        sx={{
          display: 'flex',
          flexWrap: 'wrap',
          justifyContent: 'space-between',
          alignItems: 'center',
          gap: 1.5,
          mb: 2.5
        }}
      >
        <Box>
          <Typography variant="h6" fontWeight={700} sx={{ letterSpacing: '-0.01em' }}>
            Payment Distribution
          </Typography>
          <Typography variant="caption" color="text.secondary">
            Collected inflow grouped by collection channel
          </Typography>
        </Box>

        <Stack direction="row" spacing={1} alignItems="center" flexWrap="wrap">
          {totalOrders > 0 && (
            <Chip
              label={`${totalOrders} ${totalOrders === 1 ? 'Order' : 'Orders'}`}
              size="small"
              variant="outlined"
              sx={{ fontWeight: 600, fontSize: '0.72rem' }}
            />
          )}
          <Chip
            label={`Total Inflow: ${formatPesoExact(computedTotal)}`}
            size="small"
            sx={{
              fontWeight: 700,
              fontSize: '0.74rem',
              fontVariantNumeric: 'tabular-nums',
              bgcolor: theme.palette.mode === 'dark' ? 'rgba(16, 185, 129, 0.14)' : 'rgba(16, 185, 129, 0.1)',
              color: theme.palette.mode === 'dark' ? '#34D399' : '#047857'
            }}
          />
        </Stack>
      </Box>

      {channels.length === 0 ? (
        <Box
          sx={{
            minHeight: 180,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            borderRadius: 2,
            border: '1px dashed',
            borderColor: 'divider',
            p: 3
          }}
        >
          <Typography variant="body2" color="text.secondary">
            No collected payment records available yet.
          </Typography>
        </Box>
      ) : (
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: { xs: '1fr', md: '260px 1fr' },
            gap: { xs: 3, md: 4 },
            alignItems: 'center'
          }}
        >
          <Box sx={{ width: '100%', maxWidth: 260, height: 225, mx: 'auto', position: 'relative' }}>
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={channels}
                  innerRadius={68}
                  outerRadius={98}
                  paddingAngle={3}
                  dataKey="value"
                  stroke="none"
                >
                  {channels.map((entry) => (
                    <Cell key={entry.name} fill={entry.color} />
                  ))}
                </Pie>
                <RechartsTooltip content={<PaymentDonutTooltip totalAmount={computedTotal} />} />
              </PieChart>
            </ResponsiveContainer>
            <Box
              sx={{
                position: 'absolute',
                top: '50%',
                left: '50%',
                transform: 'translate(-50%, -50%)',
                textAlign: 'center',
                pointerEvents: 'none',
                width: 124
              }}
            >
              <Typography
                variant="subtitle1"
                fontWeight={800}
                sx={{ lineHeight: 1.15, fontSize: '0.95rem', fontVariantNumeric: 'tabular-nums' }}
              >
                {formatDonutCenterTotal(computedTotal)}
              </Typography>
              <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.68rem', display: 'block', mt: 0.25 }}>
                Total Inflow
              </Typography>
            </Box>
          </Box>

          <Stack spacing={2.25}>
            {channels.map((channel) => {
              const pct = computedTotal > 0 ? (channel.value / computedTotal) * 100 : 0;
              const pctLabel = `${pct.toFixed(1)}%`;
              const orderText = channel.count > 0 ? `${channel.count} ${channel.count === 1 ? 'order' : 'orders'}` : '';
              const metaText = [channel.subtitle, orderText].filter(Boolean).join(' • ');

              return (
                <Box key={channel.name}>
                  <Box
                    sx={{
                      display: 'flex',
                      flexWrap: 'wrap',
                      justifyContent: 'space-between',
                      alignItems: 'baseline',
                      gap: 1,
                      mb: 0.75
                    }}
                  >
                    <Stack direction="row" spacing={1.25} alignItems="center" sx={{ minWidth: 0 }}>
                      <Box
                        sx={{
                          width: 10,
                          height: 10,
                          borderRadius: '50%',
                          bgcolor: channel.color,
                          flexShrink: 0
                        }}
                      />
                      <Box sx={{ minWidth: 0 }}>
                        <Typography variant="body2" fontWeight={700} color="text.primary" sx={{ lineHeight: 1.3 }}>
                          {channel.name}
                        </Typography>
                        {metaText && (
                          <Typography variant="caption" color="text.secondary" sx={{ display: 'block', lineHeight: 1.3 }}>
                            {metaText}
                          </Typography>
                        )}
                      </Box>
                    </Stack>

                    <Stack direction="row" spacing={1.25} alignItems="center" sx={{ ml: 'auto' }}>
                      <Typography
                        variant="body2"
                        fontWeight={800}
                        color="text.primary"
                        sx={{ fontVariantNumeric: 'tabular-nums' }}
                      >
                        {formatPesoExact(channel.value)}
                      </Typography>
                      <Chip
                        label={pctLabel}
                        size="small"
                        sx={{
                          height: 21,
                          minWidth: 52,
                          fontSize: '0.7rem',
                          fontWeight: 700,
                          fontVariantNumeric: 'tabular-nums',
                          bgcolor: theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.06)' : 'grey.100',
                          color: 'text.secondary'
                        }}
                      />
                    </Stack>
                  </Box>

                  <LinearProgress
                    variant="determinate"
                    value={Math.min(100, Math.max(2, pct))}
                    sx={{
                      height: 7,
                      borderRadius: 4,
                      bgcolor: theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.08)' : 'grey.100',
                      '& .MuiLinearProgress-bar': {
                        bgcolor: channel.color,
                        borderRadius: 4
                      }
                    }}
                  />
                </Box>
              );
            })}
          </Stack>
        </Box>
      )}
    </Paper>
  );
};

export default PaymentDistributionCard;
