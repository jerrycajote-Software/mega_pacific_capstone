import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import CircularProgress from '@mui/material/CircularProgress';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { useAdminTheme } from '../../context/ThemeContext';
import {
  CustomCheckCircleIcon as CheckCircleIcon,
  CustomAccessTimeIcon as AccessTimeIcon,
  CustomChevronRightIcon as ChevronRightIcon
} from '../../components/icons';
import { formatOwnerPeso } from '../../services/ownerFinanceApi';
import OwnerExpenseCategoryCard from '../../components/owner/OwnerExpenseCategoryCard';

// Tooltip showing daily collected revenue, approved expenses, and net profit in the 30-day chart
const OwnerProfitTooltip = ({ active, payload, label, isDark }) => {
  if (!active || !payload || payload.length === 0) return null;
  const point = payload[0]?.payload || {};
  const rev = Number(point.revenue || 0);
  const exp = Number(point.expenses || 0);
  const net = rev - exp;

  return (
    <div style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border-light)', borderRadius: 10, padding: '0.65rem 0.85rem', boxShadow: '0 8px 24px rgba(0,0,0,0.2)', fontSize: '0.78rem' }}>
      <div style={{ fontWeight: 700, color: 'var(--text-primary)', marginBottom: 6 }}>{label}</div>
      <div style={{ display: 'flex', justifyContent: 'space-between', gap: 16, color: isDark ? '#fbbf24' : '#b45309', fontWeight: 600 }}>
        <span>Revenue:</span>
        <span>{formatOwnerPeso(rev)}</span>
      </div>
      <div style={{ display: 'flex', justifyContent: 'space-between', gap: 16, color: isDark ? '#f87171' : '#dc2626', fontWeight: 600, marginTop: 2 }}>
        <span>Expenses:</span>
        <span>{formatOwnerPeso(exp)}</span>
      </div>
      <div style={{ display: 'flex', justifyContent: 'space-between', gap: 16, borderTop: '1px solid var(--border-light)', marginTop: 6, paddingTop: 5, fontWeight: 800, color: net >= 0 ? (isDark ? '#34d399' : '#047857') : (isDark ? '#f87171' : '#dc2626') }}>
        <span>Net Profit:</span>
        <span>{formatOwnerPeso(net)}</span>
      </div>
    </div>
  );
};

const Widget = ({ title, action, children, style = {} }) => (
  <div className="widget" style={{ ...style, borderTop: '3px solid #f59e0b', background: 'var(--bg-secondary)', borderColor: 'var(--border-light)' }}>
    <div className="widget-header">
      <h3 className="widget-title" style={{ color: 'var(--text-primary)' }}>{title}</h3>
      {action && (
        <button
          type="button"
          onClick={action.fn}
          style={{ display: 'inline-flex', alignItems: 'center', gap: 2, background: 'none', border: 'none', cursor: 'pointer', color: '#f59e0b', fontSize: '0.78rem', fontWeight: 700 }}
        >
          <span>{action.label}</span>
          <ChevronRightIcon sx={{ fontSize: 15 }} />
        </button>
      )}
    </div>
    {children}
  </div>
);

// Card displaying each key business metric with theme-aware accent colors and hover glow
const StatCard = ({
  label,
  value,
  sub,
  isDark,
  accentColor,
  lightValueColor,
  darkValueColor,
  hoverLightValueColor,
  hoverDarkValueColor,
  hoverGlow,
  badgeColor,
  darkBadgeColor,
  badgeBg,
  badgeBorder
}) => {
  const isLongVal = typeof value === 'string' && value.length > 12;
  const restValueColor = isDark ? darkValueColor : lightValueColor;
  const hoverValueColor = isDark ? hoverDarkValueColor : hoverLightValueColor;
  const valueShadow = isDark ? `0 0 18px ${hoverGlow}` : `0 2px 12px ${hoverGlow}`;

  return (
    <div
      className="widget mpi-owner-kpi-card"
      style={{
        padding: '1.4rem',
        cursor: 'default',
        borderRadius: 16,
        border: '1px solid var(--border-light)',
        background: 'var(--bg-secondary)',
        boxShadow: '0 4px 20px -8px rgba(0,0,0,0.1)',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        gap: '1rem',
        '--kpi-accent': accentColor,
        '--kpi-border': `${accentColor}88`,
        '--kpi-glow': `${accentColor}2e`,
        '--kpi-value-hover': hoverValueColor,
        '--kpi-value-shadow': valueShadow,
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'flex-start', alignItems: 'center' }}>
        <span
          style={{
            fontSize: '0.72rem',
            fontWeight: 700,
            padding: '4px 9px',
            borderRadius: 8,
            color: isDark ? darkBadgeColor : badgeColor,
            background: badgeBg,
            border: `1px solid ${badgeBorder}`,
            letterSpacing: '0.02em',
            textTransform: 'uppercase'
          }}
        >
          {sub}
        </span>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', flexGrow: 1, justifyContent: 'space-between' }}>
        <div
          className="mpi-owner-kpi-value"
          style={{
            fontSize: isLongVal ? '1.38rem' : '1.75rem',
            fontWeight: 800,
            lineHeight: 1.15,
            color: restValueColor,
            letterSpacing: '-0.02em',
            fontVariantNumeric: 'tabular-nums',
            wordBreak: 'break-word'
          }}
          title={typeof value === 'string' ? value : undefined}
        >
          {value}
        </div>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            marginTop: 14,
            paddingTop: 12,
            borderTop: '1px solid var(--border-light)'
          }}
        >
          <span
            style={{
              width: 7,
              height: 7,
              borderRadius: '50%',
              background: accentColor,
              boxShadow: `0 0 8px ${accentColor}`,
              flexShrink: 0
            }}
          />
          <span style={{ fontSize: '0.78rem', fontWeight: 600, color: 'var(--text-muted)', letterSpacing: '0.01em' }}>
            {label}
          </span>
        </div>
      </div>
    </div>
  );
};


const statusMap = {
  Completed: { cls: 'badge-green', Icon: CheckCircleIcon },
  Pending:   { cls: 'badge-amber', Icon: AccessTimeIcon },
};
const StatusBadge = ({ status }) => {
  const { cls, Icon } = statusMap[status] || { cls: 'badge-blue', Icon: AccessTimeIcon };
  return (
    <span className={cls} style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
      <Icon sx={{ fontSize: 10 }} />
      {status}
    </span>
  );
};

const th = {
  padding: '0.625rem 1.25rem',
  fontSize: '0.7rem',
  fontWeight: 600,
  letterSpacing: '0.08em',
  textTransform: 'uppercase',
  color: 'var(--text-muted)',
  background: 'var(--bg-secondary)',
  borderBottom: '1px solid var(--border-light)',
};
const td = (right = false) => ({
  padding: '0.8rem 1.25rem',
  fontSize: '0.85rem',
  color: 'var(--text-primary)',
  textAlign: right ? 'right' : 'left',
  borderBottom: '1px solid var(--border-light)',
});

const OwnerDashboardPage = () => {
  const navigate = useNavigate();
  const { mode } = useAdminTheme();
  const isDark = mode === 'dark';
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch all business metrics and chart data for the Owner dashboard
  const fetchDashboardData = async () => {
    try {
      setError(null);
      const token = localStorage.getItem('appToken');
      const API_URL = import.meta.env.VITE_API_URL || '';
      const res = await axios.get(`${API_URL}/api/owner/dashboard`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.data.success) {
        setData(res.data.data);
      }
    } catch (err) {
      console.error('Failed to fetch owner dashboard data', err);
      setError("Failed to load dashboard data.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
    const handleFocus = () => fetchDashboardData();
    window.addEventListener('focus', handleFocus);
    return () => {
      window.removeEventListener('focus', handleFocus);
    };
  }, []);

  if (loading || !data) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '60vh', color: 'var(--text-muted)' }}>
        <CircularProgress size={22} color="primary" sx={{ marginRight: '10px' }} />
        Gathering Executive Insights...
      </div>
    );
  }

  const { totals, revenueChartData, recentOrders, topProducts, expenseSummary } = data;

  const coilAlertCount = (data.coilHealth?.criticalCount || 0) + (data.coilHealth?.lowCount || 0);
  const coilStockBadge = coilAlertCount > 0
    ? `${coilAlertCount} Low Stock`
    : `${data.coilHealth?.uniqueColorCount || 14} Colors`;

  const rawNetProfit = typeof totals.rawNetProfit === 'number'
    ? totals.rawNetProfit
    : (Number(totals.rawRevenue || 0) - Number(totals.rawTotalExpenses || 0));
  const isNetProfitPositive = rawNetProfit >= 0;
  const profitMarginLabel = isNetProfitPositive
    ? `${totals.profitMargin ?? 0}% Profit`
    : 'Net Loss';

  const handleOpenOwnerExpensesPage = () => {
    navigate('/owner/expenses');
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.75rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
            <h2 style={{ margin: 0, fontSize: '1.5rem', fontWeight: 700, color: 'var(--text-primary)' }}>Business Overview</h2>
            <span className="role-identity-pill">
              <span className="role-identity-dot" />
              Executive Overview
            </span>
          </div>
          <p style={{ margin: '4px 0 0', fontSize: '0.82rem', color: 'var(--text-muted)' }}>
            {new Date().toLocaleDateString('en-PH', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
          </p>
        </div>
      </div>

      {error && (
        <div style={{ padding: '1rem', background: 'rgba(239,68,68,0.1)', border: '1px solid #ef4444', color: '#fca5a5', borderRadius: 8 }}>
          {error}
        </div>
      )}

      {/* Row 1: Financial Health KPIs (Revenue, Expenses, and Real Net Profit) */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
        <div style={{ fontSize: '0.72rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--text-muted)' }}>
          Financial Health
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '1.25rem' }}>
          <StatCard
            label="Gross Collected Revenue"
            value={formatOwnerPeso(totals.rawRevenue, totals.revenue)}
            sub={totals.rawPendingBalanceTotal > 0 ? `Pending 50%: ${formatOwnerPeso(totals.rawPendingBalanceTotal, totals.pendingBalanceTotal)}` : 'Collected Total'}
            isDark={isDark}
            accentColor="#f59e0b"
            lightValueColor="#b45309"
            darkValueColor="#fbbf24"
            hoverLightValueColor="#92400e"
            hoverDarkValueColor="#fde68a"
            hoverGlow="rgba(245, 158, 11, 0.34)"
            badgeColor="#b45309"
            darkBadgeColor="#fbbf24"
            badgeBg="rgba(245, 158, 11, 0.12)"
            badgeBorder="rgba(245, 158, 11, 0.28)"
          />
          <StatCard
            label="Total Company Expenses"
            value={formatOwnerPeso(totals.rawTotalExpenses, totals.totalExpenses)}
            sub={`${totals.expenseCategoriesCount || 0} ${(totals.expenseCategoriesCount || 0) === 1 ? 'Category' : 'Categories'}`}
            isDark={isDark}
            accentColor="#ef4444"
            lightValueColor="#dc2626"
            darkValueColor="#f87171"
            hoverLightValueColor="#b91c1c"
            hoverDarkValueColor="#fca5a5"
            hoverGlow="rgba(239, 68, 68, 0.34)"
            badgeColor="#dc2626"
            darkBadgeColor="#f87171"
            badgeBg="rgba(239, 68, 68, 0.12)"
            badgeBorder="rgba(239, 68, 68, 0.28)"
          />
          <StatCard
            label="Net Profit"
            value={formatOwnerPeso(rawNetProfit, totals.netProfit)}
            sub={profitMarginLabel}
            isDark={isDark}
            accentColor={isNetProfitPositive ? '#10b981' : '#ef4444'}
            lightValueColor={isNetProfitPositive ? '#047857' : '#dc2626'}
            darkValueColor={isNetProfitPositive ? '#34d399' : '#f87171'}
            hoverLightValueColor={isNetProfitPositive ? '#065f46' : '#b91c1c'}
            hoverDarkValueColor={isNetProfitPositive ? '#6ee7b7' : '#fca5a5'}
            hoverGlow={isNetProfitPositive ? 'rgba(16, 185, 129, 0.34)' : 'rgba(239, 68, 68, 0.34)'}
            badgeColor={isNetProfitPositive ? '#047857' : '#dc2626'}
            darkBadgeColor={isNetProfitPositive ? '#34d399' : '#f87171'}
            badgeBg={isNetProfitPositive ? 'rgba(16, 185, 129, 0.12)' : 'rgba(239, 68, 68, 0.12)'}
            badgeBorder={isNetProfitPositive ? 'rgba(16, 185, 129, 0.28)' : 'rgba(239, 68, 68, 0.28)'}
          />
        </div>
      </div>

      {/* Row 2: Operations & Volume KPIs */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
        <div style={{ fontSize: '0.72rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--text-muted)' }}>
          Operations &amp; Volume
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1.25rem' }}>
          <StatCard
            label="Raw Coil Stock"
            value={totals.rawCoilMeters || `${data.coilHealth?.totalCoils || 0} Coils`}
            sub={coilStockBadge}
            isDark={isDark}
            accentColor="#0ea5e9"
            lightValueColor="#0369a1"
            darkValueColor="#38bdf8"
            hoverLightValueColor="#075985"
            hoverDarkValueColor="#7dd3fc"
            hoverGlow="rgba(14, 165, 233, 0.34)"
            badgeColor="#0369a1"
            darkBadgeColor="#38bdf8"
            badgeBg="rgba(14, 165, 233, 0.12)"
            badgeBorder="rgba(14, 165, 233, 0.28)"
          />
          <StatCard
            label="Total Inventory Value"
            value={formatOwnerPeso(totals.rawInventoryValue, totals.inventoryValue)}
            sub="Estimated Capital"
            isDark={isDark}
            accentColor="#10b981"
            lightValueColor="#047857"
            darkValueColor="#34d399"
            hoverLightValueColor="#065f46"
            hoverDarkValueColor="#6ee7b7"
            hoverGlow="rgba(16, 185, 129, 0.34)"
            badgeColor="#047857"
            darkBadgeColor="#34d399"
            badgeBg="rgba(16, 185, 129, 0.12)"
            badgeBorder="rgba(16, 185, 129, 0.28)"
          />
          <StatCard
            label="Total Orders"
            value={totals.orders}
            sub="All Valid Orders"
            isDark={isDark}
            accentColor="#f43f5e"
            lightValueColor="#be123c"
            darkValueColor="#fb7185"
            hoverLightValueColor="#9f1239"
            hoverDarkValueColor="#fda4af"
            hoverGlow="rgba(244, 63, 94, 0.34)"
            badgeColor="#be123c"
            darkBadgeColor="#fb7185"
            badgeBg="rgba(244, 63, 94, 0.12)"
            badgeBorder="rgba(244, 63, 94, 0.28)"
          />
          <StatCard
            label="Avg Order Value"
            value={formatOwnerPeso(totals.rawAvgOrderValue, totals.avgOrderValue)}
            sub="Avg Spend"
            isDark={isDark}
            accentColor="#8b5cf6"
            lightValueColor="#6d28d9"
            darkValueColor="#a78bfa"
            hoverLightValueColor="#5b21b6"
            hoverDarkValueColor="#c4b5fd"
            hoverGlow="rgba(139, 92, 246, 0.34)"
            badgeColor="#6d28d9"
            darkBadgeColor="#a78bfa"
            badgeBg="rgba(139, 92, 246, 0.12)"
            badgeBorder="rgba(139, 92, 246, 0.28)"
          />
        </div>
      </div>

      {/* Financial Analytics Row: 30-Day Revenue vs. Expenses Chart + Expense Category Breakdown */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.25rem' }}>
        <div style={{ gridColumn: 'span 1' }}>
          <Widget
            title="30-Day Revenue vs. Expenses"
            action={{ label: 'View All Expenses', fn: handleOpenOwnerExpensesPage }}
          >
            <div style={{ width: '100%', height: 300, padding: '1rem' }}>
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={revenueChartData} margin={{ top: 10, right: 24, left: 0, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.65} />
                      <stop offset="95%" stopColor="#f59e0b" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="colorExpenses" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#ef4444" stopOpacity={0.5} />
                      <stop offset="95%" stopColor="#ef4444" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border-light)" vertical={false} />
                  <XAxis dataKey="date" stroke="var(--text-muted)" fontSize={12} tickLine={false} axisLine={false} />
                  <YAxis stroke="var(--text-muted)" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value) => `₱${value.toLocaleString()}`} />
                  <Tooltip content={<OwnerProfitTooltip isDark={isDark} />} />
                  <Legend wrapperStyle={{ fontSize: '0.78rem', paddingTop: 6 }} />
                  <Area type="monotone" dataKey="revenue" name="Collected Revenue" stroke="#f59e0b" strokeWidth={2.5} fillOpacity={1} fill="url(#colorRevenue)" />
                  <Area type="monotone" dataKey="expenses" name="Company Expenses" stroke="#ef4444" strokeWidth={2.5} fillOpacity={1} fill="url(#colorExpenses)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </Widget>
        </div>

        <OwnerExpenseCategoryCard
          title="Company Expenses Breakdown"
          subtitle="Where approved operating expenses go."
          categories={expenseSummary?.categoryBreakdown || []}
          totalExpenses={totals.rawTotalExpenses || 0}
          actionLabel="View All Expenses"
          onActionClick={handleOpenOwnerExpensesPage}
          isDark={isDark}
        />
      </div>

      {/* Operations Row: Top Selling Products + Raw Material Coil Stock */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.25rem' }}>
        <Widget title="Top Selling Products">
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr>
                <th style={th}>Product</th>
                <th style={th}>Sold</th>
                <th style={{ ...th, textAlign: 'right' }}>Generated Revenue</th>
              </tr>
            </thead>
            <tbody>
              {topProducts.map(p => (
                <tr key={p.name}
                  onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.02)'}
                  onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                  style={{ transition: 'background 0.15s' }}
                >
                  <td style={td()}>
                    <div style={{ fontWeight: 500, color: 'var(--text-primary)' }}>{p.name}</div>
                    <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>{p.type}</div>
                  </td>
                  <td style={td()}>{p.sold}</td>
                  <td style={{ ...td(true), color: isDark ? '#34d399' : '#047857', fontWeight: 600 }}>{p.revenueStr}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </Widget>

        <Widget title="Raw Material Coil Stock">
          <div style={{ padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
             <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
               <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                 Steel coils across 14 colors
               </span>
               <span className="badge-green" style={{ fontSize: '0.7rem' }}>
                 {(data.coilHealth?.totalCoils || 0).toLocaleString()} rolls in stock
               </span>
             </div>

             <div style={{ display: 'flex', flexDirection: 'column', gap: 8, overflowY: 'auto', maxHeight: 240 }}>
                {data.coilHealth?.lowCoils && data.coilHealth.lowCoils.length > 0 ? (
                  data.coilHealth.lowCoils.map(c => (
                    <div key={c.name} style={{
                      display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                      padding: '0.75rem', borderRadius: 8,
                      background: (c.availableMeters || 0) === 0 ? 'rgba(239,68,68,0.1)' : 'rgba(245,158,11,0.08)',
                      border: `1px solid ${(c.availableMeters || 0) === 0 ? 'rgba(239,68,68,0.2)' : 'rgba(245,158,11,0.2)'}`,
                    }}>
                      <div style={{ display: 'flex', flexDirection: 'column' }}>
                        <span style={{ color: (c.availableMeters || 0) === 0 ? '#ef4444' : '#f59e0b', fontSize: '0.85rem', fontWeight: 600 }}>
                          {c.name}
                        </span>
                        <span style={{ color: 'var(--text-muted)', fontSize: '0.7rem' }}>
                          Min alert: {c.minAlertMeters || 1} roll
                        </span>
                      </div>
                      <span className={(c.availableMeters || 0) === 0 ? 'badge-red' : 'badge-amber'}>
                        {c.availableMeters || 0} {(c.availableMeters || 0) === 1 ? 'roll' : 'rolls'}
                      </span>
                    </div>
                  ))
                ) : (
                  <div style={{ textAlign: 'center', padding: '2rem 0', color: '#10b981', fontSize: '0.85rem' }}>
                    <CheckCircleIcon sx={{ fontSize: 26, mb: 1, display: 'block', margin: '0 auto 8px' }} />
                    <p style={{ margin: 0, fontWeight: 600 }}>All {data.coilHealth?.totalCoils || 56} coils in optimal stock.</p>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Raw materials ready for roll-forming.</span>
                  </div>
                )}
             </div>
          </div>
        </Widget>
      </div>

      <Widget title="Recent Actionable Orders">
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr>
              <th style={th}>Order ID</th>
              <th style={th}>Customer</th>
              <th style={th}>Status</th>
              <th style={{ ...th, textAlign: 'right' }}>Total</th>
            </tr>
          </thead>
          <tbody>
            {recentOrders.length === 0 ? (
              <tr>
                <td colSpan={4} style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.84rem' }}>
                  No pending actionable orders right now.
                </td>
              </tr>
            ) : (
              recentOrders.map(o => (
                <tr key={o.id} style={{ transition: 'background 0.15s' }}
                  onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.02)'}
                  onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                >
                  <td style={{ ...td(), fontFamily: 'monospace', color: isDark ? '#fbbf24' : '#b45309', fontSize: '0.8rem', fontWeight: 700 }}>{o.id}</td>
                  <td style={{ ...td(), fontWeight: 500, color: 'var(--text-primary)' }}>{o.customer}</td>
                  <td style={td()}><StatusBadge status={o.status} /></td>
                  <td style={{ ...td(true), fontWeight: 600 }}>{o.total}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </Widget>

      {/* Spinner animation and accent-colored hover transitions for Owner KPI cards */}
      <style>{`
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
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

export default OwnerDashboardPage;
