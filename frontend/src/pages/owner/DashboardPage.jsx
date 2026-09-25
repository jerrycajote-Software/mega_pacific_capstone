import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import InventoryIcon from '@mui/icons-material/Inventory2';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import RefreshIcon from '@mui/icons-material/Refresh';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

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

const StatCard = ({ label, value, sub, icon, iconBg }) => (
  <div className="widget" style={{ padding: '1.5rem', cursor: 'default', transition: 'border-color 0.2s', borderTop: '3px solid transparent', background: 'var(--bg-card)', borderColor: 'var(--border-light)' }}
    onMouseEnter={e => e.currentTarget.style.borderColor = 'rgba(245,158,11,0.5)'}
    onMouseLeave={e => e.currentTarget.style.borderColor = 'var(--border-light)'}
  >
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
      <div style={{ padding: '0.6rem', borderRadius: 12, background: iconBg }}>
        {icon}
      </div>
      <span className="badge-green" style={{ fontSize: '0.7rem' }}>{sub}</span>
    </div>
    <div style={{ fontSize: '1.75rem', fontWeight: 800, lineHeight: 1.1, color: 'var(--text-primary)' }}>{value}</div>
    <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: 4 }}>{label}</div>
  </div>
);

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
  const [spin, setSpin] = useState(false);
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
  }, []);

  const refresh = () => {
    setSpin(true);
    fetchDashboardData().then(() => setTimeout(() => setSpin(false), 800));
  };

  if (loading || !data) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '60vh', color: 'var(--text-muted)' }}>
        <RefreshIcon sx={{ fontSize: 24, animation: 'spin 1s linear infinite', marginRight: '10px' }} />
        Gathering Executive Insights...
      </div>
    );
  }

  const { totals, revenueChartData, recentOrders, stockAlerts, topProducts } = data;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      {/* Page header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h2 style={{ margin: 0, fontSize: '1.5rem', fontWeight: 700, color: 'var(--text-primary)' }}>Executive Overview</h2>
          <p style={{ margin: '4px 0 0', fontSize: '0.82rem', color: 'var(--text-muted)' }}>
            {new Date().toLocaleDateString('en-PH', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
          </p>
        </div>
        <button
          onClick={refresh}
          style={{
            display: 'flex', alignItems: 'center', gap: 8, padding: '8px 16px',
            background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.2)', borderRadius: 10,
            color: '#10b981', fontSize: '0.82rem', cursor: 'pointer', transition: 'background 0.2s'
          }}
          onMouseEnter={e => e.currentTarget.style.background = 'rgba(16,185,129,0.2)'}
          onMouseLeave={e => e.currentTarget.style.background = 'rgba(16,185,129,0.1)'}
        >
          <RefreshIcon sx={{ fontSize: 15, animation: spin ? 'spin 0.8s linear infinite' : 'none', color: 'inherit' }} />
          Refresh
        </button>
      </div>

      {error && (
        <div style={{ padding: '1rem', background: 'rgba(239,68,68,0.1)', border: '1px solid #ef4444', color: '#fca5a5', borderRadius: 8 }}>
          {error}
        </div>
      )}

      {/* Row 1: High-Level Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1.25rem' }}>
        <StatCard label="Gross Revenue" value={totals.revenue} sub="Total" icon={<TrendingUpIcon sx={{ fontSize: 20, color: '#fbbf24' }} />} iconBg="rgba(245,158,11,0.15)" />
        <StatCard label="Total Inventory Value" value={totals.inventoryValue} sub="Capital" icon={<AttachMoneyIcon sx={{ fontSize: 20, color: '#34d399' }} />} iconBg="rgba(16,185,129,0.15)" />
        <StatCard label="Total Orders" value={totals.orders} sub="Volume" icon={<ShoppingCartIcon sx={{ fontSize: 20, color: '#38bdf8' }} />} iconBg="rgba(14,165,233,0.15)" />
        <StatCard label="Avg Order Value" value={totals.avgOrderValue} sub="AOV" icon={<TrendingUpIcon sx={{ fontSize: 20, color: '#a78bfa' }} />} iconBg="rgba(139,92,246,0.15)" />
      </div>

      {/* Row 2: Charts and Alerts */}
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

        <Widget title="Inventory Alerts">
          <div style={{ padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
             <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', margin: 0 }}>
                Items below critical threshold (20 units)
             </p>
             <div style={{ display: 'flex', flexDirection: 'column', gap: 8, overflowY: 'auto', maxHeight: 240 }}>
                {stockAlerts.map(a => (
                  <div key={a.name} style={{
                    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                    padding: '0.75rem', borderRadius: 8,
                    background: a.stock === 0 ? 'rgba(239,68,68,0.1)' : 'rgba(245,158,11,0.05)', 
                    border: `1px solid ${a.stock === 0 ? 'rgba(239,68,68,0.2)' : 'rgba(245,158,11,0.15)'}`,
                  }}>
                    <div style={{ display: 'flex', flexDirection: 'column' }}>
                      <span style={{ color: a.stock === 0 ? '#ef4444' : '#f59e0b', fontSize: '0.85rem', fontWeight: 600 }}>
                        {a.name}
                      </span>
                      <span style={{ color: 'var(--text-muted)', fontSize: '0.7rem' }}>{a.type}</span>
                    </div>
                    <span className={a.stock === 0 ? "badge-red" : "badge-amber"}>{a.stock} units</span>
                  </div>
                ))}
                {stockAlerts.length === 0 && (
                  <div style={{ textAlign: 'center', padding: '2rem 0', color: '#10b981', fontSize: '0.85rem' }}>
                    <CheckCircleIcon sx={{ fontSize: 24, mb: 1 }} />
                    <p>All inventory levels are healthy.</p>
                  </div>
                )}
             </div>
          </div>
        </Widget>
      </div>

      {/* Row 3: Top Products and Actionable Orders */}
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
