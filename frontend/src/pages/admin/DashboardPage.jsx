import React, { useState } from 'react';
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

/* ─── Widget shell ─── */
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

/* ─── Stat card ─── */
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

/* ─── Status badge ─── */
const statusMap = {
  Completed: { cls: 'badge-green', Icon: CheckCircle2 },
  Pending:   { cls: 'badge-amber', Icon: Clock },
  Shipped:   { cls: 'badge-blue',  Icon: Truck },
  Cancelled: { cls: 'badge-red',   Icon: XCircle },
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

/* ─── Mock data ─── */
const recentOrders = [
  { id: '#ORD-001', customer: 'Juan dela Cruz',  date: 'Apr 12, 2026', status: 'Completed', total: '₱12,450' },
  { id: '#ORD-002', customer: 'Maria Santos',    date: 'Apr 12, 2026', status: 'Pending',   total: '₱8,200'  },
  { id: '#ORD-003', customer: 'Pedro Reyes',     date: 'Apr 11, 2026', status: 'Shipped',   total: '₱31,000' },
  { id: '#ORD-004', customer: 'Rosa Garcia',     date: 'Apr 11, 2026', status: 'Completed', total: '₱5,750'  },
  { id: '#ORD-005', customer: 'Carlos Mendoza',  date: 'Apr 10, 2026', status: 'Cancelled', total: '₱14,900' },
];

const topProducts = [
  { name: 'Rib Type Blue',  type: 'Rib Type',  sold: 142, revenue: '₱35,500', stock: 88  },
  { name: 'Spandrel White', type: 'Spandrel',  sold: 98,  revenue: '₱24,500', stock: 42  },
  { name: 'Flat Type Gray', type: 'Flat Type', sold: 76,  revenue: '₱19,000', stock: 60  },
  { name: 'Rib Type Brown', type: 'Rib Type',  sold: 65,  revenue: '₱16,250', stock: 110 },
];

const inventoryBars = [
  { label: 'Rib Type',    pct: 85, color: '#22c55e', glow: 'rgba(34,197,94,0.5)'   },
  { label: 'Spandrel',    pct: 42, color: '#f59e0b', glow: 'rgba(245,158,11,0.5)'  },
  { label: 'Flat Type',   pct: 68, color: '#10b981', glow: 'rgba(16,185,129,0.5)'  },
  { label: 'Accessories', pct: 90, color: '#06b6d4', glow: 'rgba(6,182,212,0.5)'   },
];

const stockAlerts = [
  { name: 'Spandrel Blue', stock: 4 },
  { name: 'Flat Type Red', stock: 2 },
  { name: 'Rib Type Green', stock: 7 },
];

const recentUsers = [
  { name: 'Juan dela Cruz', email: 'juan@email.com',  role: 'Customer', joined: 'Apr 12' },
  { name: 'Maria Santos',   email: 'maria@email.com', role: 'Customer', joined: 'Apr 11' },
  { name: 'Pedro Reyes',    email: 'pedro@email.com', role: 'Customer', joined: 'Apr 10' },
];

const salesSummary = [
  { label: "Today's Sales",   value: '₱12,400',  sub: '8 orders'        },
  { label: 'This Week',       value: '₱58,300',  sub: '42 orders'       },
  { label: 'This Month',      value: '₱128,450', sub: '156 orders'      },
  { label: 'Avg Order Value', value: '₱824',     sub: 'Per transaction' },
];

/* ─── Shared table styles ─── */
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

/* ─── Main Component ─── */
const DashboardPage = () => {
  const [spin, setSpin] = useState(false);

  const refresh = () => {
    setSpin(true);
    setTimeout(() => setSpin(false), 800);
  };

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

      {/* ── Row 1: Stat cards ── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1.25rem' }}>
        <StatCard label="Total Revenue"    value="₱128,450" change="+12%"         icon={<TrendingUp size={20} color="#22c55e"/>} iconBg="rgba(34,197,94,0.1)"  />
        <StatCard label="Total Products"   value="42"        change="+3 new"       icon={<Package    size={20} color="#60a5fa"/>} iconBg="rgba(96,165,250,0.1)" />
        <StatCard label="Total Orders"     value="156"       change="+18%"         icon={<ShoppingCart size={20} color="#c084fc"/>} iconBg="rgba(192,132,252,0.1)" />
        <StatCard label="Registered Users" value="89"        change="+5 this week" icon={<Users      size={20} color="#22d3ee"/>} iconBg="rgba(34,211,238,0.1)" />
      </div>

      {/* ── Row 2: Recent Orders + Inventory Status ── */}
      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '1.25rem' }}>

        {/* Recent Orders */}
        <Widget title="Recent Orders" action={{ label: 'View all orders', fn: () => {} }}>
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
        <Widget title="Inventory Status">
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

            {/* Stock alerts */}
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
        </Widget>
      </div>

      {/* ── Row 3: Top Products + Recent Users ── */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem' }}>

        {/* Top Products */}
        <Widget title="Top Selling Products" action={{ label: 'Go to Inventory', fn: () => {} }}>
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
        <Widget title="Recently Registered Users" action={{ label: 'Manage Users', fn: () => {} }}>
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
            <span style={{ fontSize: '0.75rem', color: '#4b5563' }}>Showing 3 of 89 users</span>
            <button style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#22c55e', fontSize: '0.75rem', fontWeight: 600 }}>
              View all users →
            </button>
          </div>
        </Widget>
      </div>

      {/* ── Row 4: Sales Summary bar ── */}
      <Widget title="Quick Sales Summary">
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
      </Widget>

      <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
    </div>
  );
};

export default DashboardPage;
