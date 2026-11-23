import React, { useState, useEffect, useCallback, useMemo } from 'react';
import CircularProgress from '@mui/material/CircularProgress';
import { useAdminTheme } from '../../context/ThemeContext';
import {
  CustomSearchIcon as SearchIcon,
  CustomFilterListIcon as FilterListIcon,
  CustomChevronLeftIcon as ChevronLeftIcon,
  CustomChevronRightIcon as ChevronRightIcon
} from '../../components/icons';
import { fetchOwnerExpensesData, formatOwnerPeso } from '../../services/ownerFinanceApi';
import OwnerExpenseCategoryCard from '../../components/owner/OwnerExpenseCategoryCard';
import OwnerExpenseVoucherModal from '../../components/owner/OwnerExpenseVoucherModal';

const PERIOD_OPTIONS = [
  { key: 'all', label: 'All Time' },
  { key: 'month', label: 'This Month' },
  { key: 'last_month', label: 'Last Month' },
  { key: 'quarter', label: 'This Quarter' },
  { key: 'year', label: 'This Year' }
];

const thStyle = {
  padding: '0.85rem 1.2rem',
  fontSize: '0.72rem',
  fontWeight: 700,
  letterSpacing: '0.06em',
  textTransform: 'uppercase',
  color: 'var(--text-muted)',
  background: 'rgba(255,255,255,0.02)',
  borderBottom: '1px solid var(--border-light)',
  whiteSpace: 'nowrap'
};

const tdStyle = {
  padding: '0.9rem 1.2rem',
  fontSize: '0.84rem',
  color: 'var(--text-primary)',
  borderBottom: '1px solid var(--border-light)'
};

const OwnerExpensesPage = () => {
  const { mode } = useAdminTheme();
  const isDark = mode === 'dark';

  const [period, setPeriod] = useState('all');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [reportData, setReportData] = useState(null);
  const [selectedVoucher, setSelectedVoucher] = useState(null);

  const itemsPerPage = 10;

  // Load company expenses and real net profit for the active reporting period
  const loadExpensesReport = useCallback(async (targetPeriod = period) => {
    try {
      setError('');
      const res = await fetchOwnerExpensesData({ period: targetPeriod });
      if (res?.success) {
        setReportData(res.data);
      } else {
        setError(res?.message || 'Unable to load company expenses.');
      }
    } catch (err) {
      console.error('Failed to load Owner expenses page:', err);
      setError(err.response?.data?.message || 'Unable to load company expenses right now. Please try again.');
    } finally {
      setLoading(false);
    }
  }, [period]);

  useEffect(() => {
    setLoading(true);
    loadExpensesReport(period);
  }, [period, loadExpensesReport]);

  useEffect(() => {
    const handleWindowFocus = () => loadExpensesReport(period);
    window.addEventListener('focus', handleWindowFocus);
    return () => window.removeEventListener('focus', handleWindowFocus);
  }, [period, loadExpensesReport]);

  const handleSelectReportingPeriod = (nextPeriod) => {
    setPeriod(nextPeriod);
    setSelectedCategory('All');
    setCurrentPage(1);
  };

  const handleSelectExpenseCategory = (nextCategory) => {
    setSelectedCategory(nextCategory);
    setCurrentPage(1);
  };

  const handleSearchExpensesChange = (e) => {
    setSearchTerm(e.target.value);
    setCurrentPage(1);
  };

  const handleOpenExpenseVoucher = (expense) => {
    setSelectedVoucher(expense);
  };

  const handleCloseExpenseVoucher = () => {
    setSelectedVoucher(null);
  };

  const summary = reportData?.summary || {
    totalRevenue: 0,
    totalExpenses: 0,
    netProfit: 0,
    profitMargin: 0,
    expenseRatio: 0,
    expensesCount: 0,
    expenseCategoriesCount: 0
  };

  const allExpenses = Array.isArray(reportData?.expenses) ? reportData.expenses : [];
  const categories = Array.isArray(reportData?.categories) ? reportData.categories : [];
  const categoryBreakdown = Array.isArray(reportData?.categoryBreakdown) ? reportData.categoryBreakdown : [];

  const filteredExpenses = useMemo(() => {
    const query = searchTerm.trim().toLowerCase();
    return allExpenses.filter((expense) => {
      const matchesCategory =
        selectedCategory === 'All' ||
        String(expense?.category || '').toLowerCase() === selectedCategory.toLowerCase();
      const matchesQuery =
        !query ||
        String(expense?.reference || '').toLowerCase().includes(query) ||
        String(expense?.category || '').toLowerCase().includes(query) ||
        String(expense?.description || '').toLowerCase().includes(query);
      return matchesCategory && matchesQuery;
    });
  }, [allExpenses, selectedCategory, searchTerm]);

  const filteredSubtotal = useMemo(() => {
    return filteredExpenses.reduce((sum, item) => sum + (Number(item?.amount) || 0), 0);
  }, [filteredExpenses]);

  const totalPages = Math.ceil(filteredExpenses.length / itemsPerPage) || 1;
  const safeCurrentPage = Math.min(currentPage, totalPages);
  const paginatedExpenses = useMemo(() => {
    const start = (safeCurrentPage - 1) * itemsPerPage;
    return filteredExpenses.slice(start, start + itemsPerPage);
  }, [filteredExpenses, safeCurrentPage]);

  const isProfitPositive = summary.netProfit >= 0;

  const kpiCards = [
    {
      label: 'Gross Collected Revenue',
      value: formatOwnerPeso(summary.totalRevenue),
      pill: reportData?.periodLabel || 'All Time',
      accent: '#f59e0b',
      lightColor: '#b45309',
      darkColor: '#fbbf24',
      hoverLight: '#92400e',
      hoverDark: '#fde68a',
      glow: 'rgba(245, 158, 11, 0.34)',
      pillBg: 'rgba(245, 158, 11, 0.12)',
      pillBorder: 'rgba(245, 158, 11, 0.28)'
    },
    {
      label: 'Total Company Expenses',
      value: formatOwnerPeso(summary.totalExpenses),
      pill: `${summary.expensesCount} ${summary.expensesCount === 1 ? 'Entry' : 'Entries'}`,
      accent: '#ef4444',
      lightColor: '#dc2626',
      darkColor: '#f87171',
      hoverLight: '#b91c1c',
      hoverDark: '#fca5a5',
      glow: 'rgba(239, 68, 68, 0.34)',
      pillBg: 'rgba(239, 68, 68, 0.12)',
      pillBorder: 'rgba(239, 68, 68, 0.28)'
    },
    {
      label: 'Net Profit',
      value: formatOwnerPeso(summary.netProfit),
      pill: isProfitPositive ? `${summary.profitMargin}% Profit` : 'Net Loss',
      accent: isProfitPositive ? '#10b981' : '#ef4444',
      lightColor: isProfitPositive ? '#047857' : '#dc2626',
      darkColor: isProfitPositive ? '#34d399' : '#f87171',
      hoverLight: isProfitPositive ? '#065f46' : '#b91c1c',
      hoverDark: isProfitPositive ? '#6ee7b7' : '#fca5a5',
      glow: isProfitPositive ? 'rgba(16, 185, 129, 0.34)' : 'rgba(239, 68, 68, 0.34)',
      pillBg: isProfitPositive ? 'rgba(16, 185, 129, 0.12)' : 'rgba(239, 68, 68, 0.12)',
      pillBorder: isProfitPositive ? 'rgba(16, 185, 129, 0.28)' : 'rgba(239, 68, 68, 0.28)'
    },
    {
      label: 'Expense Share of Revenue',
      value: `${summary.expenseRatio}%`,
      pill: `${summary.expenseCategoriesCount} ${summary.expenseCategoriesCount === 1 ? 'Category' : 'Categories'}`,
      accent: '#2563eb',
      lightColor: '#1d4ed8',
      darkColor: '#60a5fa',
      hoverLight: '#1e40af',
      hoverDark: '#93c5fd',
      glow: 'rgba(37, 99, 235, 0.34)',
      pillBg: 'rgba(37, 99, 235, 0.12)',
      pillBorder: 'rgba(37, 99, 235, 0.28)'
    }
  ];

  if (loading && !reportData) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '65vh', gap: 14 }}>
        <CircularProgress size={34} color="primary" />
        <span style={{ fontSize: '0.86rem', color: 'var(--text-muted)' }}>Loading company expenses and net profit...</span>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.75rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 16 }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
            <h2 style={{ margin: 0, fontSize: '1.5rem', fontWeight: 800, color: 'var(--text-primary)' }}>
              Expenses &amp; Profit
            </h2>
            <span className="role-identity-pill">
              <span className="role-identity-dot" />
              Read-Only Financial Audit
            </span>
          </div>
          <p style={{ margin: '4px 0 0', fontSize: '0.84rem', color: 'var(--text-muted)' }}>
            Review approved company expenses recorded by Finance and track overall net profit.
          </p>
        </div>

        <div
          style={{
            display: 'inline-flex',
            flexWrap: 'wrap',
            background: 'var(--bg-secondary)',
            border: '1px solid var(--border-light)',
            borderRadius: 12,
            padding: 4,
            gap: 4
          }}
        >
          {PERIOD_OPTIONS.map((option) => {
            const active = period === option.key;
            return (
              <button
                key={option.key}
                type="button"
                onClick={() => handleSelectReportingPeriod(option.key)}
                style={{
                  padding: '7px 13px',
                  borderRadius: 9,
                  border: 'none',
                  fontSize: '0.78rem',
                  fontWeight: 700,
                  cursor: 'pointer',
                  background: active ? 'linear-gradient(135deg, #d97706, #b45309)' : 'transparent',
                  color: active ? '#ffffff' : 'var(--text-muted)'
                }}
              >
                {option.label}
              </button>
            );
          })}
        </div>
      </div>

      {error && (
        <div
          style={{
            padding: '1rem 1.25rem',
            borderRadius: 12,
            background: 'rgba(239, 68, 68, 0.1)',
            border: '1px solid rgba(239, 68, 68, 0.3)',
            color: isDark ? '#fca5a5' : '#b91c1c',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            gap: 12,
            flexWrap: 'wrap'
          }}
        >
          <span style={{ fontSize: '0.86rem', fontWeight: 600 }}>{error}</span>
          <button
            type="button"
            onClick={() => loadExpensesReport(period)}
            style={{
              padding: '6px 14px',
              borderRadius: 8,
              border: '1px solid rgba(239, 68, 68, 0.4)',
              background: 'transparent',
              color: 'inherit',
              fontSize: '0.78rem',
              fontWeight: 700,
              cursor: 'pointer'
            }}
          >
            Retry Loading Expenses
          </button>
        </div>
      )}

      {/* Four unified Light/Dark financial KPI summary cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(230px, 1fr))', gap: '1.25rem' }}>
        {kpiCards.map((card) => (
          <div
            key={card.label}
            className="widget mpi-owner-kpi-card"
            style={{
              padding: '1.35rem',
              borderRadius: 16,
              border: '1px solid var(--border-light)',
              background: 'var(--bg-secondary)',
              boxShadow: '0 4px 20px -8px rgba(0,0,0,0.08)',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              gap: '0.9rem',
              '--kpi-border': `${card.accent}88`,
              '--kpi-glow': `${card.accent}2e`,
              '--kpi-value-hover': isDark ? card.hoverDark : card.hoverLight,
              '--kpi-value-shadow': isDark ? `0 0 18px ${card.glow}` : `0 2px 12px ${card.glow}`
            }}
          >
            <div>
              <span
                style={{
                  fontSize: '0.7rem',
                  fontWeight: 700,
                  padding: '4px 9px',
                  borderRadius: 8,
                  color: isDark ? card.darkColor : card.lightColor,
                  background: card.pillBg,
                  border: `1px solid ${card.pillBorder}`,
                  letterSpacing: '0.02em',
                  textTransform: 'uppercase'
                }}
              >
                {card.pill}
              </span>
            </div>

            <div
              className="mpi-owner-kpi-value"
              style={{
                fontSize: String(card.value).length > 12 ? '1.42rem' : '1.75rem',
                fontWeight: 800,
                lineHeight: 1.15,
                color: isDark ? card.darkColor : card.lightColor,
                fontVariantNumeric: 'tabular-nums',
                letterSpacing: '-0.02em'
              }}
            >
              {card.value}
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: 8, paddingTop: 12, borderTop: '1px solid var(--border-light)' }}>
              <span style={{ width: 7, height: 7, borderRadius: '50%', background: card.accent, boxShadow: `0 0 8px ${card.accent}`, flexShrink: 0 }} />
              <span style={{ fontSize: '0.78rem', fontWeight: 600, color: 'var(--text-muted)' }}>{card.label}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Category share breakdown (click a category to filter the ledger) */}
      <OwnerExpenseCategoryCard
        title="Company Expense Breakdown"
        subtitle="Click any category to filter the expense records below."
        categories={categoryBreakdown}
        totalExpenses={summary.totalExpenses}
        selectedCategory={selectedCategory}
        onSelectCategory={handleSelectExpenseCategory}
        isDark={isDark}
      />

      {/* Searchable expense ledger */}
      <div
        style={{
          background: 'var(--bg-secondary)',
          borderRadius: 16,
          border: '1px solid var(--border-light)',
          overflow: 'hidden',
          boxShadow: '0 4px 20px -8px rgba(0,0,0,0.08)'
        }}
      >
        <div
          style={{
            padding: '1rem 1.25rem',
            borderBottom: '1px solid var(--border-light)',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: 12
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, flex: 1, minWidth: 260, flexWrap: 'wrap' }}>
            <div style={{ position: 'relative', flex: 1, minWidth: 220, maxWidth: 380 }}>
              <SearchIcon sx={{ fontSize: 17, color: 'var(--text-muted)', position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)' }} />
              <input
                type="text"
                placeholder="Search by reference, category, or description..."
                value={searchTerm}
                onChange={handleSearchExpensesChange}
                style={{
                  width: '100%',
                  background: 'var(--bg-primary)',
                  border: '1px solid var(--border-light)',
                  padding: '8px 12px 8px 36px',
                  borderRadius: 10,
                  color: 'var(--text-primary)',
                  fontSize: '0.83rem',
                  outline: 'none',
                  boxSizing: 'border-box'
                }}
              />
            </div>

            <div style={{ position: 'relative' }}>
              <FilterListIcon sx={{ fontSize: 15, color: 'var(--text-muted)', position: 'absolute', left: 11, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }} />
              <select
                aria-label="Filter expenses by category"
                value={selectedCategory}
                onChange={(e) => handleSelectExpenseCategory(e.target.value)}
                style={{
                  appearance: 'none',
                  background: 'var(--bg-primary)',
                  border: '1px solid var(--border-light)',
                  padding: '8px 22px 8px 32px',
                  borderRadius: 10,
                  color: 'var(--text-primary)',
                  fontSize: '0.82rem',
                  fontWeight: 600,
                  outline: 'none',
                  cursor: 'pointer'
                }}
              >
                <option value="All" style={{ background: 'var(--bg-secondary)', color: 'var(--text-primary)' }}>All Categories</option>
                {categories.map((cat) => (
                  <option key={cat} value={cat} style={{ background: 'var(--bg-secondary)', color: 'var(--text-primary)' }}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
            Showing <strong>{filteredExpenses.length}</strong> {filteredExpenses.length === 1 ? 'expense' : 'expenses'} • Subtotal:{' '}
            <strong style={{ color: isDark ? '#f87171' : '#dc2626' }}>{formatOwnerPeso(filteredSubtotal)}</strong>
          </div>
        </div>

        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead>
              <tr>
                <th style={thStyle}>Reference</th>
                <th style={thStyle}>Date</th>
                <th style={thStyle}>Category</th>
                <th style={thStyle}>Description</th>
                <th style={thStyle}>Status</th>
                <th style={{ ...thStyle, textAlign: 'right' }}>Amount</th>
                <th style={{ ...thStyle, textAlign: 'right' }}>Voucher</th>
              </tr>
            </thead>
            <tbody>
              {paginatedExpenses.length === 0 ? (
                <tr>
                  <td colSpan={7} style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-muted)' }}>
                    No company expenses found for the selected period or filter.
                  </td>
                </tr>
              ) : (
                paginatedExpenses.map((expense) => (
                  <tr
                    key={expense.id}
                    style={{ transition: 'background 0.15s' }}
                    onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(255,255,255,0.02)'; }}
                    onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; }}
                  >
                    <td style={{ ...tdStyle, fontFamily: 'monospace', fontWeight: 700, color: isDark ? '#fbbf24' : '#b45309', whiteSpace: 'nowrap' }}>
                      {expense.reference}
                    </td>
                    <td style={{ ...tdStyle, color: 'var(--text-muted)', whiteSpace: 'nowrap' }}>
                      {expense.date
                        ? new Date(expense.date).toLocaleDateString('en-PH', { month: 'short', day: 'numeric', year: 'numeric' })
                        : 'N/A'}
                    </td>
                    <td style={{ ...tdStyle, fontWeight: 600, whiteSpace: 'nowrap' }}>{expense.category}</td>
                    <td style={{ ...tdStyle, maxWidth: 340 }}>{expense.description}</td>
                    <td style={{ ...tdStyle, whiteSpace: 'nowrap' }}>
                      <span className="badge-green">{expense.status}</span>
                    </td>
                    <td style={{ ...tdStyle, textAlign: 'right', fontWeight: 800, color: isDark ? '#f87171' : '#dc2626', fontVariantNumeric: 'tabular-nums', whiteSpace: 'nowrap' }}>
                      {formatOwnerPeso(expense.amount)}
                    </td>
                    <td style={{ ...tdStyle, textAlign: 'right', whiteSpace: 'nowrap' }}>
                      <button
                        type="button"
                        onClick={() => handleOpenExpenseVoucher(expense)}
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: 2,
                          background: 'none',
                          border: 'none',
                          color: isDark ? '#fbbf24' : '#b45309',
                          fontSize: '0.78rem',
                          fontWeight: 700,
                          cursor: 'pointer'
                        }}
                      >
                        <span>View Voucher</span>
                        <ChevronRightIcon sx={{ fontSize: 15 }} />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {totalPages > 1 && (
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              padding: '0.95rem 1.25rem',
              borderTop: '1px solid var(--border-light)',
              flexWrap: 'wrap',
              gap: 10
            }}
          >
            <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
              Showing <strong>{(safeCurrentPage - 1) * itemsPerPage + 1}</strong> to{' '}
              <strong>{Math.min(safeCurrentPage * itemsPerPage, filteredExpenses.length)}</strong> of{' '}
              <strong>{filteredExpenses.length}</strong> expenses
            </span>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <button
                type="button"
                onClick={() => setCurrentPage(Math.max(1, safeCurrentPage - 1))}
                disabled={safeCurrentPage === 1}
                aria-label="Previous expenses page"
                style={{
                  background: 'var(--bg-primary)',
                  border: '1px solid var(--border-light)',
                  color: 'var(--text-primary)',
                  borderRadius: 8,
                  padding: 6,
                  display: 'inline-flex',
                  cursor: safeCurrentPage === 1 ? 'not-allowed' : 'pointer',
                  opacity: safeCurrentPage === 1 ? 0.4 : 1
                }}
              >
                <ChevronLeftIcon sx={{ fontSize: 16 }} />
              </button>
              <span style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-primary)', padding: '0 6px' }}>
                Page {safeCurrentPage} of {totalPages}
              </span>
              <button
                type="button"
                onClick={() => setCurrentPage(Math.min(totalPages, safeCurrentPage + 1))}
                disabled={safeCurrentPage === totalPages}
                aria-label="Next expenses page"
                style={{
                  background: 'var(--bg-primary)',
                  border: '1px solid var(--border-light)',
                  color: 'var(--text-primary)',
                  borderRadius: 8,
                  padding: 6,
                  display: 'inline-flex',
                  cursor: safeCurrentPage === totalPages ? 'not-allowed' : 'pointer',
                  opacity: safeCurrentPage === totalPages ? 0.4 : 1
                }}
              >
                <ChevronRightIcon sx={{ fontSize: 16 }} />
              </button>
            </div>
          </div>
        )}
      </div>

      <OwnerExpenseVoucherModal expense={selectedVoucher} onClose={handleCloseExpenseVoucher} />

      <style>{`
        .mpi-owner-kpi-card {
          transition: transform 0.24s cubic-bezier(0.22, 1, 0.36, 1), border-color 0.24s ease, box-shadow 0.24s ease;
        }
        .mpi-owner-kpi-card:hover {
          transform: translateY(-4px);
          border-color: var(--kpi-border) !important;
          box-shadow: 0 14px 28px -8px var(--kpi-glow), 0 4px 12px rgba(0, 0, 0, 0.08) !important;
        }
        .mpi-owner-kpi-value {
          transition: color 0.22s ease, text-shadow 0.22s ease, transform 0.22s ease;
        }
        .mpi-owner-kpi-card:hover .mpi-owner-kpi-value {
          color: var(--kpi-value-hover) !important;
          text-shadow: var(--kpi-value-shadow);
          transform: translateX(2px);
        }
      `}</style>
    </div>
  );
};

export default OwnerExpensesPage;
