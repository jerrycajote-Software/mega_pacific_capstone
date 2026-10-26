import React, { useState, useEffect } from 'react';
import axios from 'axios';
import CircularProgress from '@mui/material/CircularProgress';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import {
  CustomOwnerRevenueIcon,
  CustomOwnerCoilStockIcon,
  CustomOwnerInventoryValueIcon,
  CustomOwnerOrdersVolumeIcon,
  CustomOwnerAvgOrderValueIcon
} from '../../components/icons';

const Widget = ({ title, action, children, style = {} }) => (
  <div className="widget" style={{ ...style, borderTop: '3px solid #f59e0b', background: 'var(--bg-card)', borderColor: 'var(--border-light)' }}>
    <div className="widget-header">
      <h3 className="widget-title" style={{ color: 'var(--text-primary)' }}>{title}</h3>
      {action && (
        <button
          onClick={action.fn}
          style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#f59e0b', fontSize: '0.78rem', fontWeight: 600 }}
        >
          {action.label}
        </button>
      )}
    </div>
    {children}
  </div>
);

const StatCard = ({ label, value, sub, icon, accentColor, bgGradient, badgeColor, badgeBg, badgeBorder }) => {
  const isLongVal = typeof value === 'string' && value.length > 12;
  return (
    <div
      className="widget mpi-owner-kpi-card"
      style={{
        padding: '1.4rem',
        cursor: 'default',
        borderRadius: 16,
        border: '1px solid var(--border-light)',
        borderTop: `3px solid ${accentColor}`,
        background: 'var(--bg-card)',
        boxShadow: '0 4px 20px -8px rgba(0,0,0,0.1)',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between'
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
        <div
          className="mpi-owner-badge"
          style={{
            width: 48,
            height: 48,
            borderRadius: 13,
            background: bgGradient,
            border: `1px solid ${accentColor}33`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
            boxShadow: `0 2px 10px ${accentColor}22`
          }}
        >
          {icon}
        </div>
        <span
          style={{
            fontSize: '0.72rem',
            fontWeight: 700,
            padding: '4px 9px',
            borderRadius: 8,
            color: badgeColor,
            background: badgeBg,
            border: `1px solid ${badgeBorder}`,
            letterSpacing: '0.02em',
            textTransform: 'uppercase'
          }}
        >
          {sub}
        </span>
      </div>
      <div>
        <div
          style={{
            fontSize: isLongVal ? '1.45rem' : '1.75rem',
            fontWeight: 800,
            lineHeight: 1.15,
            color: 'var(--text-primary)',
            letterSpacing: '-0.02em',
            wordBreak: 'break-word'
          }}
          title={typeof value === 'string' ? value : undefined}
        >
          {value}
        </div>
        <div style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-muted)', marginTop: 6, letterSpacing: '0.01em' }}>
          {label}
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
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

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
    const syncInterval = setInterval(fetchDashboardData, 10000);
    const handleFocus = () => fetchDashboardData();
    window.addEventListener('focus', handleFocus);
    return () => {
      clearInterval(syncInterval);
      window.removeEventListener('focus', handleFocus);
    };
  }, []);

  if (loading || !data) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '60vh', color: 'var(--text-muted)' }}>
        <CircularProgress size={22} sx={{ color: '#10b981', marginRight: '10px' }} />
        Gathering Executive Insights...
      </div>
    );
  }

  const { totals, revenueChartData, recentOrders, stockAlerts, topProducts } = data;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h2 style={{ margin: 0, fontSize: '1.5rem', fontWeight: 700, color: 'var(--text-primary)' }}>Executive Overview</h2>
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

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1.25rem' }}>
        <StatCard
          label="Gross Revenue"
          value={totals.revenue}
          sub="Total"
          icon={<CustomOwnerRevenueIcon size={30} />}
          accentColor="#f59e0b"
          bgGradient="rgba(245, 158, 11, 0.1)"
          badgeColor="#d97706"
          badgeBg="rgba(245, 158, 11, 0.12)"
          badgeBorder="rgba(245, 158, 11, 0.28)"
        />
        <StatCard
          label="Raw Coil Stock"
          value={totals.rawCoilMeters || '95,400 m'}
          sub={`${data.coilHealth?.totalCoils || 56} Coils`}
          icon={<CustomOwnerCoilStockIcon size={30} />}
          accentColor="#0ea5e9"
          bgGradient="rgba(14, 165, 233, 0.1)"
          badgeColor="#0284c7"
          badgeBg="rgba(14, 165, 233, 0.12)"
          badgeBorder="rgba(14, 165, 233, 0.28)"
        />
        <StatCard
          label="Total Inventory Value"
          value={totals.inventoryValue}
          sub="Capital"
          icon={<CustomOwnerInventoryValueIcon size={30} />}
          accentColor="#10b981"
          bgGradient="rgba(16, 185, 129, 0.1)"
          badgeColor="#059669"
          badgeBg="rgba(16, 185, 129, 0.12)"
          badgeBorder="rgba(16, 185, 129, 0.28)"
        />
        <StatCard
          label="Total Orders"
          value={totals.orders}
          sub="Volume"
          icon={<CustomOwnerOrdersVolumeIcon size={30} />}
          accentColor="#f43f5e"
          bgGradient="rgba(244, 63, 94, 0.1)"
          badgeColor="#e11d48"
          badgeBg="rgba(244, 63, 94, 0.12)"
          badgeBorder="rgba(244, 63, 94, 0.28)"
        />
        <StatCard
          label="Avg Order Value"
          value={totals.avgOrderValue}
          sub="AOV"
          icon={<CustomOwnerAvgOrderValueIcon size={30} />}
          accentColor="#8b5cf6"
          bgGradient="rgba(139, 92, 246, 0.1)"
          badgeColor="#7c3aed"
          badgeBg="rgba(139, 92, 246, 0.12)"
          badgeBorder="rgba(139, 92, 246, 0.28)"
        />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '1.25rem' }}>
        <Widget title="30-Day Revenue Trend">
          <div style={{ width: '100%', height: 300, padding: '1rem' }}>
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={revenueChartData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="#f59e0b" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border-light)" vertical={false} />
                <XAxis dataKey="date" stroke="var(--text-muted)" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke="var(--text-muted)" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value) => `₱${value.toLocaleString()}`} />
                <Tooltip 
                  contentStyle={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border-light)', borderRadius: 8, color: 'var(--text-primary)' }}
                  itemStyle={{ color: '#fbbf24' }}
                />
                <Area type="monotone" dataKey="revenue" stroke="#f59e0b" strokeWidth={3} fillOpacity={1} fill="url(#colorRevenue)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </Widget>

        <Widget title="Raw Material Coil Health">
          <div style={{ padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
             <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
               <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                 Steel coils across 14 official colors
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

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem' }}>
        <Widget title="Top Performing Products">
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
                  <td style={{ ...td(true), color: '#34d399', fontWeight: 600 }}>{p.revenueStr}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </Widget>

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
              {recentOrders.map(o => (
                <tr key={o.id} style={{ transition: 'background 0.15s' }}
                  onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.02)'}
                  onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                >
                  <td style={{ ...td(), fontFamily: 'monospace', color: '#fbbf24', fontSize: '0.8rem' }}>{o.id}</td>
                  <td style={{ ...td(), fontWeight: 500, color: 'var(--text-primary)' }}>{o.customer}</td>
                  <td style={td()}><StatusBadge status={o.status} /></td>
                  <td style={{ ...td(true), fontWeight: 600 }}>{o.total}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </Widget>
      </div>

      <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
    </div>
  );
};

export default OwnerDashboardPage;
