import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import {
  TrendingUp,
  Package,
  ShoppingCart,
  Users,
  AlertTriangle,
  ArrowUpRight,
  CheckCircle2,
  Clock,
  XCircle,
  Truck,
  RefreshCw,
} from 'lucide-react';

/* Widget shell */
const Widget = ({ title, action, children, style = {} }) => (
  <div className="widget" style={style}>
    <div className="widget-header">
      <h3 className="widget-title">{title}</h3>
      {action && (
        <button
          onClick={action.fn}
          style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#22c55e', fontSize: '0.78rem', fontWeight: 600 }}
        >
          {action.label}
        </button>
      )}
    </div>
    {children}
  </div>
);

/* Stat card */
const StatCard = ({ label, value, change, icon, iconBg }) => (
  <div className="widget" style={{ padding: '1.5rem', cursor: 'default', transition: 'border-color 0.2s' }}
    onMouseEnter={e => e.currentTarget.style.borderColor = 'rgba(34,197,94,0.3)'}
    onMouseLeave={e => e.currentTarget.style.borderColor = '#2e2e2e'}
  >
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
      <div style={{ padding: '0.6rem', borderRadius: 12, background: iconBg }}>
        {icon}
      </div>
      <span className="badge-green">{change}</span>
    </div>
    <div style={{ fontSize: '1.75rem', fontWeight: 800, lineHeight: 1.1 }}>{value}</div>
    <div style={{ fontSize: '0.8rem', color: '#9ca3af', marginTop: 4 }}>{label}</div>
  </div>
);

/* Status badge */
const statusMap = {
  Completed: { cls: 'badge-green', Icon: CheckCircle2 },
  Pending: { cls: 'badge-amber', Icon: Clock },
  Shipped: { cls: 'badge-blue', Icon: Truck },
  Cancelled: { cls: 'badge-red', Icon: XCircle },
};
const StatusBadge = ({ status }) => {
  const { cls, Icon } = statusMap[status] || { cls: 'badge-blue', Icon: Clock };
  return (
    <span className={cls} style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
      <Icon size={10} />
      {status}
    </span>
  );
};

/* Dynamic data is fetched from the backend */

/* Shared table styles */
const th = {
  padding: '0.625rem 1.25rem',
  fontSize: '0.7rem',
  fontWeight: 600,
  letterSpacing: '0.08em',
  textTransform: 'uppercase',
  color: '#6b7280',
  background: 'rgba(255,255,255,0.02)',
  borderBottom: '1px solid #1f1f1f',
};
const td = (right = false) => ({
  padding: '0.8rem 1.25rem',
  fontSize: '0.85rem',
  color: '#d1d5db',
  textAlign: right ? 'right' : 'left',
  borderBottom: '1px solid #1a1a1a',
});

/* Main Component */
const DashboardPage = () => {
  const navigate = useNavigate();
  const [spin, setSpin] = useState(false);
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchDashboardData = async () => {
    try {
      const token = localStorage.getItem('appToken');
      const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
      const res = await axios.get(`${API_URL}/api/admin/dashboard`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.data.success) {
        setData(res.data.data);
      }
    } catch (err) {
      console.error('Failed to fetch dashboard data', err);
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
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '60vh', color: '#9ca3af' }}>
        <RefreshCw size={24} style={{ animation: 'spin 1s linear infinite', marginRight: 10 }} />
        Loading Dashboard Data...
      </div>
    );
  }

  const { totals, recentOrders, stockAlerts, inventoryBars, topProducts, salesSummary } = data; //recentUsers

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>

      {/* Page header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h2 style={{ margin: 0, fontSize: '1.5rem', fontWeight: 700 }}>Dashboard Overview</h2>
          <p style={{ margin: '4px 0 0', fontSize: '0.82rem', color: '#6b7280' }}>
            {new Date().toLocaleDateString('en-PH', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
          </p>
        </div>
        <button
          onClick={refresh}
          style={{
            display: 'flex', alignItems: 'center', gap: 8, padding: '8px 16px',
            background: '#1a1a1a', border: '1px solid #2e2e2e', borderRadius: 10,
            color: '#9ca3af', fontSize: '0.82rem', cursor: 'pointer',
          }}
        >
          <RefreshCw size={15} style={{ animation: spin ? 'spin 0.8s linear infinite' : 'none', color: spin ? '#22c55e' : 'inherit' }} />
          Refresh
        </button>
      </div>

      {/* Row 1: Stat cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1.25rem' }}>
        <StatCard label="Total Revenue" value={totals.revenue} change="Updated" icon={<TrendingUp size={20} color="#22c55e" />} iconBg="rgba(34,197,94,0.1)" />
        <StatCard label="Total Products" value={totals.products} change="Updated" icon={<Package size={20} color="#60a5fa" />} iconBg="rgba(96,165,250,0.1)" />
        <StatCard label="Total Orders" value={totals.orders} change="Updated" icon={<ShoppingCart size={20} color="#c084fc" />} iconBg="rgba(192,132,252,0.1)" />
        {/* <StatCard label="Registered Users" value={totals.users} change="Updated" icon={<Users size={20} color="#22d3ee" />} iconBg="rgba(34,211,238,0.1)" /> */}
      </div>

      {/*  Row 2: Recent Orders + Inventory Status  */}
      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '1.25rem' }}>

        {/* Recent Orders */}
        <Widget title="Recent Orders" action={{ label: 'View all orders', fn: () => navigate('/admin/orders') }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr>
                <th style={th}>Order ID</th>
                <th style={th}>Customer</th>
                <th style={th}>Date</th>
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
                  <td style={{ ...td(), fontFamily: 'monospace', color: '#4ade80', fontSize: '0.8rem' }}>{o.id}</td>
                  <td style={{ ...td(), fontWeight: 500, color: '#e5e7eb' }}>{o.customer}</td>
                  <td style={{ ...td(), color: '#6b7280' }}>{o.date}</td>
                  <td style={td()}><StatusBadge status={o.status} /></td>
                  <td style={{ ...td(true), fontWeight: 600 }}>{o.total}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </Widget>

        {/* Inventory Status */}
        {/* <Widget title="Inventory Status">
          <div style={{ padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            {inventoryBars.map(bar => (
              <div key={bar.label}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6, fontSize: '0.8rem' }}>
                  <span style={{ color: '#9ca3af' }}>{bar.label}</span>
                  <span style={{ fontWeight: 700 }}>{bar.pct}%</span>
                </div>
                <div style={{ background: '#1f1f1f', height: 6, borderRadius: 99, overflow: 'hidden' }}>
                  <div style={{
                    height: '100%', width: `${bar.pct}%`, borderRadius: 99,
                    background: bar.color,
                    boxShadow: `0 0 8px ${bar.glow}`,
                  }} />
                </div>
              </div>
            ))}

           
            <div style={{ paddingTop: '1rem', borderTop: '1px solid #1f1f1f' }}>
              <p style={{ fontSize: '0.65rem', color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.1em', fontWeight: 600, marginBottom: 10 }}>
                ⚠ Stock Alerts
              </p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                {stockAlerts.map(a => (
                  <div key={a.name} style={{
                    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                    padding: '0.6rem 0.75rem', borderRadius: 8,
                    background: 'rgba(239,68,68,0.04)', border: '1px solid rgba(239,68,68,0.12)',
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: '#f87171', fontSize: '0.8rem' }}>
                      <AlertTriangle size={13} />
                      {a.name}
                    </div>
                    <span className="badge-red">{a.stock} left</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </Widget> */}
      </div>

      {/* Row 3: Top Products + Recent Users */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem' }}>

        {/* Top Products */}
        <Widget title="Top Selling Products" action={{ label: 'Go to Inventory', fn: () => navigate('/admin/inventory') }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr>
                <th style={th}>Product</th>
                <th style={th}>Sold</th>
                <th style={th}>Revenue</th>
                <th style={th}>Stock</th>
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
                    <div style={{ fontWeight: 500, color: '#e5e7eb' }}>{p.name}</div>
                    <div style={{ fontSize: '0.7rem', color: '#4b5563' }}>{p.type}</div>
                  </td>
                  <td style={td()}>{p.sold}</td>
                  <td style={{ ...td(), color: '#4ade80', fontWeight: 600 }}>{p.revenue}</td>
                  <td style={td()}>
                    <span className={p.stock < 50 ? 'badge-red' : 'badge-green'}>{p.stock} units</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </Widget>

        {/* Recent Users */}
        {/* <Widget title="Recently Registered Users" action={{ label: 'Manage Users', fn: () => { } }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr>
                <th style={th}>Name</th>
                <th style={th}>Email</th>
                <th style={th}>Role</th>
                <th style={th}>Joined</th>
              </tr>
            </thead>
            <tbody>
              {recentUsers.map(u => (
                <tr key={u.email}
                  onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.02)'}
                  onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                  style={{ transition: 'background 0.15s' }}
                >
                  <td style={td()}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <div style={{
                        height: 28, width: 28, borderRadius: '50%',
                        background: 'linear-gradient(135deg, #22c55e, #16a34a)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        color: '#000', fontWeight: 700, fontSize: '0.75rem', flexShrink: 0,
                      }}>
                        {u.name.charAt(0)}
                      </div>
                      <span style={{ fontWeight: 500, color: '#e5e7eb' }}>{u.name}</span>
                    </div>
                  </td>
                  <td style={{ ...td(), color: '#6b7280', fontSize: '0.78rem' }}>{u.email}</td>
                  <td style={td()}><span className="badge-blue">{u.role}</span></td>
                  <td style={{ ...td(), color: '#6b7280' }}>{u.joined}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <div style={{
            display: 'flex', justifyContent: 'space-between', alignItems: 'center',
            padding: '0.75rem 1.25rem', borderTop: '1px solid #1a1a1a',
          }}>
            <span style={{ fontSize: '0.75rem', color: '#4b5563' }}>Showing {recentUsers.length} of {totals.users} users</span>
            <button style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#22c55e', fontSize: '0.75rem', fontWeight: 600 }}>
              View all users →
            </button>
          </div>
        </Widget> */}
        
      </div>

      {/* Row 4: Sales Summary bar */}
      {/* <Widget title="Quick Sales Summary">
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', borderTop: '1px solid #1a1a1a' }}>
          {salesSummary.map((s, i) => (
            <div key={s.label} style={{
              padding: '1.25rem 1.5rem', textAlign: 'center',
              borderRight: i < salesSummary.length - 1 ? '1px solid #1a1a1a' : 'none',
            }}>
              <div style={{ fontSize: '1.5rem', fontWeight: 800, color: '#fff' }}>{s.value}</div>
              <div style={{ fontSize: '0.75rem', color: '#6b7280', marginTop: 4 }}>{s.label}</div>
              <div style={{ fontSize: '0.72rem', color: '#22c55e', fontWeight: 600, marginTop: 2 }}>{s.sub}</div>
            </div>
          ))}
        </div>
      </Widget> */}

      <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
    </div>
  );
};

export default DashboardPage;
