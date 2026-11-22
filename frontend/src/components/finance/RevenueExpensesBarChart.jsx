import React, { useMemo, useState } from 'react';
import {
  Box,
  Paper,
  Typography,
  Stack,
  Chip,
  ToggleButton,
  ToggleButtonGroup,
  useTheme
} from '@mui/material';
import {
  Bar,
  ComposedChart,
  LineChart,
  Line,
  ReferenceLine,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  ResponsiveContainer,
  Legend
} from 'recharts';

const REVENUE_COLOR = '#10B981';
const EXPENSES_COLOR = '#EF4444';
const NET_PROFIT_COLOR = '#2563EB';

const CHART_VIEW_OPTIONS = [
  { value: 'combo', label: 'Combo', ariaLabel: 'Show Combo Bar and Net Profit Line Chart' },
  { value: 'line', label: 'Line', ariaLabel: 'Show Clean Line Chart' }
];

// Format Y-axis currency ticks cleanly for positive and negative values
const formatAxisPeso = (value) => {
  const num = Number(value || 0);
  const abs = Math.abs(num);
  const sign = num < 0 ? '-' : '';
  if (abs >= 1000000) return `${sign}₱${(abs / 1000000).toFixed(1)}M`;
  if (abs >= 1000) return `${sign}₱${(abs / 1000).toFixed(0)}k`;
  return `${sign}₱${abs}`;
};

// Format full peso amounts with thousand separators
const formatFullPeso = (value) => {
  const num = Number(value || 0);
  const prefix = num < 0 ? '-₱' : '₱';
  return `${prefix}${Math.abs(num).toLocaleString()}`;
};

// Render detailed hover card showing monthly Revenue, Expenses, and Net Profit
const RevenueExpensesTooltip = ({ active, payload, label, chartView }) => {
  if (!active || !payload || payload.length === 0) return null;

  const revenueVal = Number(payload.find((entry) => entry.dataKey === 'revenue')?.value || 0);
  const expensesVal = Number(payload.find((entry) => entry.dataKey === 'expenses')?.value || 0);
  const netVal = revenueVal - expensesVal;

  const primaryRows = [
    { name: 'Revenue', value: revenueVal, color: REVENUE_COLOR },
    { name: 'Expenses', value: expensesVal, color: EXPENSES_COLOR }
  ];

  return (
    <Paper
      elevation={4}
      sx={{
        p: 1.5,
        minWidth: 180,
        borderRadius: 2,
        border: '1px solid',
        borderColor: 'divider',
        bgcolor: 'background.paper'
      }}
    >
      <Typography variant="caption" fontWeight={700} color="text.secondary" sx={{ display: 'block', mb: 0.75 }}>
        {label}
      </Typography>
      {primaryRows.map((item) => (
        <Box key={item.name} sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 2, my: 0.35 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Box sx={{ width: 8, height: 8, borderRadius: 0.75, bgcolor: item.color }} />
            <Typography variant="caption" sx={{ color: 'text.secondary' }}>
              {item.name}
            </Typography>
          </Box>
          <Typography variant="caption" fontWeight={700} sx={{ color: item.color }}>
            {formatFullPeso(item.value)}
          </Typography>
        </Box>
      ))}
      <Box
        sx={{
          mt: 0.75,
          pt: 0.75,
          borderTop: '1px solid',
          borderColor: 'divider',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 2
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          {chartView === 'combo' && (
            <Box sx={{ width: 8, height: 3, borderRadius: 1, bgcolor: NET_PROFIT_COLOR }} />
          )}
          <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 600 }}>
            Net Profit
          </Typography>
        </Box>
        <Typography variant="caption" fontWeight={800} sx={{ color: netVal >= 0 ? REVENUE_COLOR : EXPENSES_COLOR }}>
          {formatFullPeso(netVal)}
        </Typography>
      </Box>
    </Paper>
  );
};

// Display monthly Revenue vs. Expenses with a switchable Combo and Line view
const RevenueExpensesBarChart = ({ trendData = [] }) => {
  const theme = useTheme();
  const [chartView, setChartView] = useState('combo');

  // Switch the active chart view when Finance staff choose Combo or Line
  const handleSelectChartView = (_, nextView) => {
    if (nextView) setChartView(nextView);
  };

  // Safeguard chart records and compute monthly net profit for the Combo view
  const safeTrendData = useMemo(() => {
    if (!Array.isArray(trendData)) return [];
    return trendData.map((row) => {
      const revenue = Number(row?.revenue || 0);
      const expenses = Number(row?.expenses || 0);
      return { month: row?.month ?? '', revenue, expenses, netProfit: revenue - expenses };
    });
  }, [trendData]);

  // Show a zero baseline in Combo mode whenever any month records a net loss
  const hasNegativeNet = useMemo(
    () => safeTrendData.some((row) => row.netProfit < 0),
    [safeTrendData]
  );

  // Shared configuration objects passed directly to Recharts children
  const gridProps = { strokeDasharray: '3 3', stroke: theme.palette.divider, vertical: false };
  const xAxisProps = {
    dataKey: 'month',
    stroke: theme.palette.text.secondary,
    fontSize: 12,
    tickLine: false,
    axisLine: { stroke: theme.palette.divider }
  };
  const yAxisProps = {
    stroke: theme.palette.text.secondary,
    fontSize: 12,
    tickLine: false,
    axisLine: false,
    tickFormatter: formatAxisPeso
  };
  const legendProps = {
    verticalAlign: 'top',
    align: 'right',
    iconType: 'circle',
    iconSize: 9,
    wrapperStyle: { paddingBottom: 16, fontSize: '0.8rem' }
  };
  const barCursor = { fill: theme.palette.action.hover, radius: 6 };
  const lineCursor = { stroke: theme.palette.divider, strokeWidth: 1.5 };
  const dotStroke = theme.palette.background.paper;

  return (
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
      <Box sx={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', gap: 1.5, mb: 2.5 }}>
        <Box>
          <Typography variant="h6" fontWeight={700} sx={{ letterSpacing: '-0.01em' }}>
            Revenue & Expenses Trend
          </Typography>
          <Typography variant="caption" color="text.secondary">
            Monthly performance comparison (Past 6 Months)
          </Typography>
        </Box>
        <Stack direction="row" spacing={1} alignItems="center" flexWrap="wrap">
          <ToggleButtonGroup
            value={chartView}
            exclusive
            onChange={handleSelectChartView}
            size="small"
            aria-label="Revenue and expenses chart type"
            sx={{
              bgcolor: (t) => (t.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.04)' : 'grey.100'),
              p: 0.35,
              borderRadius: 2,
              border: '1px solid',
              borderColor: 'divider',
              '& .MuiToggleButtonGroup-grouped': {
                border: 0,
                borderRadius: '6px !important',
                px: 1.5,
                py: 0.4,
                fontSize: '0.75rem',
                fontWeight: 600,
                textTransform: 'none',
                color: 'text.secondary',
                '&.Mui-selected': {
                  bgcolor: 'background.paper',
                  color: 'text.primary',
                  boxShadow: (t) => (t.palette.mode === 'dark' ? '0 1px 3px rgba(0,0,0,0.4)' : '0 1px 2px rgba(15,23,42,0.1)'),
                  '&:hover': { bgcolor: 'background.paper' }
                }
              }
            }}
          >
            {CHART_VIEW_OPTIONS.map((option) => (
              <ToggleButton key={option.value} value={option.value} aria-label={option.ariaLabel}>
                {option.label}
              </ToggleButton>
            ))}
          </ToggleButtonGroup>
          <Chip label="Profit & Loss" size="small" variant="outlined" sx={{ fontWeight: 600, fontSize: '0.7rem' }} />
        </Stack>
      </Box>

      {safeTrendData.length === 0 ? (
        <Box
          sx={{
            flex: 1,
            minHeight: 300,
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
            No monthly revenue or expense records available yet.
          </Typography>
        </Box>
      ) : (
        <Box sx={{ width: '100%', height: 320, flex: 1, minHeight: 300 }}>
          <ResponsiveContainer width="100%" height="100%">
            {chartView === 'line' ? (
              <LineChart data={safeTrendData} margin={{ top: 10, right: 16, left: -10, bottom: 0 }}>
                <CartesianGrid {...gridProps} />
                <XAxis {...xAxisProps} />
                <YAxis {...yAxisProps} />
                <RechartsTooltip content={<RevenueExpensesTooltip chartView={chartView} />} cursor={lineCursor} />
                <Legend {...legendProps} />
                <Line
                  type="linear"
                  dataKey="revenue"
                  name="Revenue"
                  stroke={REVENUE_COLOR}
                  strokeWidth={2.5}
                  dot={{ r: 4.5, fill: REVENUE_COLOR, stroke: dotStroke, strokeWidth: 2 }}
                  activeDot={{ r: 6.5, fill: REVENUE_COLOR, stroke: dotStroke, strokeWidth: 2 }}
                />
                <Line
                  type="linear"
                  dataKey="expenses"
                  name="Expenses"
                  stroke={EXPENSES_COLOR}
                  strokeWidth={2.5}
                  strokeDasharray="6 4"
                  dot={{ r: 4.5, fill: EXPENSES_COLOR, stroke: dotStroke, strokeWidth: 2 }}
                  activeDot={{ r: 6.5, fill: EXPENSES_COLOR, stroke: dotStroke, strokeWidth: 2 }}
                />
              </LineChart>
            ) : (
              <ComposedChart data={safeTrendData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }} barGap={6} barCategoryGap="24%">
                <CartesianGrid {...gridProps} />
                <XAxis {...xAxisProps} />
                <YAxis {...yAxisProps} />
                <RechartsTooltip content={<RevenueExpensesTooltip chartView={chartView} />} cursor={barCursor} />
                <Legend {...legendProps} />
                {hasNegativeNet && <ReferenceLine y={0} stroke={theme.palette.text.disabled} strokeWidth={1.2} />}
                <Bar dataKey="revenue" name="Revenue" fill={REVENUE_COLOR} fillOpacity={0.88} radius={[6, 6, 0, 0]} maxBarSize={26} />
                <Bar dataKey="expenses" name="Expenses" fill={EXPENSES_COLOR} fillOpacity={0.88} radius={[6, 6, 0, 0]} maxBarSize={26} />
                <Line
                  type="linear"
                  dataKey="netProfit"
                  name="Net Profit"
                  stroke={NET_PROFIT_COLOR}
                  strokeWidth={2.5}
                  dot={{ r: 4, fill: NET_PROFIT_COLOR, stroke: dotStroke, strokeWidth: 2 }}
                  activeDot={{ r: 6, fill: NET_PROFIT_COLOR, stroke: dotStroke, strokeWidth: 2 }}
                />
              </ComposedChart>
            )}
          </ResponsiveContainer>
        </Box>
      )}
    </Paper>
  );
};

export default RevenueExpensesBarChart;
