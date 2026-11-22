import React, { useMemo } from 'react';
import { Box, Paper, Typography, Stack, Chip, LinearProgress, useTheme } from '@mui/material';

const ALLOCATION_COLORS = ['#2563EB', '#10B981', '#F59E0B', '#8B5CF6', '#EC4899', '#06B6D4'];

// Format peso amounts consistently with two decimal places
const formatPesoExact = (value) => {
  const num = Number(value || 0);
  return `₱${num.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
};

// Display full-width Expense Allocations card showing department spending shares
const ExpenseAllocationsCard = ({ expenseCategoryBreakdown = [], totalExpenses = 0 }) => {
  const theme = useTheme();

  // Normalize and sort expense categories from highest spend to lowest
  const categories = useMemo(() => {
    if (!Array.isArray(expenseCategoryBreakdown)) return [];
    return expenseCategoryBreakdown
      .filter((item) => Number(item?.value || 0) > 0)
      .map((item, idx) => ({
        name: item?.name || 'Uncategorized',
        value: Number(item?.value || 0),
        color: ALLOCATION_COLORS[idx % ALLOCATION_COLORS.length]
      }))
      .sort((a, b) => b.value - a.value);
  }, [expenseCategoryBreakdown]);

  // Compute total allocated expenses with safe fallback to KPI total
  const computedTotal = useMemo(() => {
    const sum = categories.reduce((acc, item) => acc + item.value, 0);
    return sum > 0 ? sum : Number(totalExpenses || 0);
  }, [categories, totalExpenses]);

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
            Expense Allocations
          </Typography>
          <Typography variant="caption" color="text.secondary">
            Expenses by department
          </Typography>
        </Box>

        <Stack direction="row" spacing={1} alignItems="center" flexWrap="wrap">
          {categories.length > 0 && (
            <Chip
              label={`${categories.length} ${categories.length === 1 ? 'Category' : 'Categories'}`}
              size="small"
              variant="outlined"
              sx={{ fontWeight: 600, fontSize: '0.72rem' }}
            />
          )}
          <Chip
            label={`Total Expenses: ${formatPesoExact(computedTotal)}`}
            size="small"
            sx={{
              fontWeight: 700,
              fontSize: '0.74rem',
              fontVariantNumeric: 'tabular-nums',
              bgcolor: theme.palette.mode === 'dark' ? 'rgba(239, 68, 68, 0.14)' : 'rgba(239, 68, 68, 0.1)',
              color: theme.palette.mode === 'dark' ? '#F87171' : '#DC2626'
            }}
          />
        </Stack>
      </Box>

      {categories.length === 0 ? (
        <Box
          sx={{
            minHeight: 140,
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
            No expense allocations recorded yet.
          </Typography>
        </Box>
      ) : (
        <Stack spacing={2.25}>
          {categories.map((cat) => {
            const pct = computedTotal > 0 ? (cat.value / computedTotal) * 100 : 0;
            const pctLabel = `${pct.toFixed(1)}%`;

            return (
              <Box key={cat.name}>
                <Box
                  sx={{
                    display: 'flex',
                    flexWrap: 'wrap',
                    justifyContent: 'space-between',
                    alignItems: 'center',
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
                        bgcolor: cat.color,
                        flexShrink: 0
                      }}
                    />
                    <Typography variant="body2" fontWeight={700} color="text.primary">
                      {cat.name}
                    </Typography>
                  </Stack>

                  <Stack direction="row" spacing={1.25} alignItems="center" sx={{ ml: 'auto' }}>
                    <Typography
                      variant="body2"
                      fontWeight={800}
                      color="text.primary"
                      sx={{ fontVariantNumeric: 'tabular-nums' }}
                    >
                      {formatPesoExact(cat.value)}
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
                  value={Math.min(100, Math.max(pct > 0 ? 2 : 0, pct))}
                  sx={{
                    height: 8,
                    borderRadius: 4,
                    bgcolor: theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.08)' : 'grey.100',
                    '& .MuiLinearProgress-bar': {
                      bgcolor: cat.color,
                      borderRadius: 4
                    }
                  }}
                />
              </Box>
            );
          })}
        </Stack>
      )}
    </Paper>
  );
};

export default ExpenseAllocationsCard;
