import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import Inventory2Icon from '@mui/icons-material/Inventory2';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import LocalShippingIcon from '@mui/icons-material/LocalShipping';
import RefreshIcon from '@mui/icons-material/Refresh';
import BadgeIcon from '@mui/icons-material/Badge';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import CategoryIcon from '@mui/icons-material/Category';
import TodayIcon from '@mui/icons-material/Today';

const EmployeeDashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [spin, setSpin] = useState(false);

  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

  const fetchData = async () => {
    try {
      const token = localStorage.getItem('appToken');
      const res = await axios.get(`${API_URL}/api/employee/dashboard`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.data.success) {
        setData(res.data.data);
      }
    } catch (err) {
      console.error('Failed to fetch employee dashboard data', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const refresh = () => {
    setSpin(true);
    fetchData().then(() => setTimeout(() => setSpin(false), 800));
  };

  const th = {
    padding: '0.75rem 1.25rem',
    fontSize: '0.72rem',
    fontWeight: 600,
    letterSpacing: '0.08em',
    textTransform: 'uppercase',
    color: 'var(--text-muted)',
    background: 'rgba(0,0,0,0.03)',
    borderBottom: '1px solid var(--border-light)',
    textAlign: 'left'
  };

  const td = (right = false) => ({
    padding: '0.85rem 1.25rem',
    fontSize: '0.84rem',
    color: 'var(--text-primary)',
    textAlign: right ? 'right' : 'left',
    borderBottom: '1px solid var(--border-light)'
  });

  const statusColors = {
    delivered: 'badge-green',
    completed: 'badge-green',
    pending: 'badge-amber',
    shipped: 'badge-blue',
    out_for_delivery: 'badge-blue',
    cancelled: 'badge-red',
  };

  if (loading || !data) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '60vh', color: 'var(--text-muted)' }}>
        <RefreshIcon sx={{ fontSize: 24, animation: 'spin 1s linear infinite', marginRight: '10px' }} />
        Loading Dashboard Stats...
        <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  const { counts, inventorySummary, lowStockProducts, recentlyAdded, recentOrders, dailyActivity } = data;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem', animation: 'fadeIn 0.3s ease' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
            <BadgeIcon sx={{ fontSize: 20, color: 'var(--green)' }} />
            <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--green)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Employee Portal</span>
          </div>
          <h2 style={{ margin: 0, fontSize: '1.625rem', fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '-0.02em' }}>Welcome, {user?.name?.split(' ')[0]}!</h2>
          <p style={{ margin: '4px 0 0', fontSize: '0.82rem', color: 'var(--text-muted)' }}>
            {new Date().toLocaleDateString('en-PH', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
          </p>
        </div>
        <button onClick={refresh}
          style={{
            display: 'flex', alignItems: 'center', gap: 8, padding: '8px 16px',
            background: 'var(--bg-secondary)', border: '1px solid var(--border-light)', borderRadius: 10,
            color: 'var(--text-muted)', fontSize: '0.82rem', cursor: 'pointer', transition: 'all 0.2s'
          }}
          onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--green)'; e.currentTarget.style.color = 'var(--text-primary)'; }}
          onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border-light)'; e.currentTarget.style.color = 'var(--text-muted)'; }}
        >
          <RefreshIcon sx={{ fontSize: 15, animation: spin ? 'spin 0.8s linear infinite' : 'none', color: spin ? 'var(--green)' : 'inherit' }} />
          Refresh
        </button>
      </div>

      {/* Operational Counts Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1.25rem' }}>
        <div className="widget" style={{ padding: '1.5rem', display: 'flex', alignItems: 'center', gap: '1.25rem', position: 'relative', overflow: 'hidden' }}>
          <div style={{ padding: '0.85rem', borderRadius: 14, background: 'rgba(245,158,11,0.08)', border: '1px solid rgba(245,158,11,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <AccessTimeIcon sx={{ fontSize: 28, color: '#f59e0b' }} />
          </div>
          <div>
            <div style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Pending Orders</div>
            <div style={{ fontSize: '1.875rem', fontWeight: 800, color: 'var(--text-primary)', marginTop: 4 }}>{counts.pending}</div>
          </div>
          <div style={{ position: 'absolute', right: -15, bottom: -15, fontSize: '6rem', fontWeight: 900, color: 'rgba(245,158,11,0.03)', pointerEvents: 'none', userSelect: 'none' }}>{counts.pending}</div>
        </div>

        <div className="widget" style={{ padding: '1.5rem', display: 'flex', alignItems: 'center', gap: '1.25rem', position: 'relative', overflow: 'hidden' }}>
          <div style={{ padding: '0.85rem', borderRadius: 14, background: 'rgba(59,130,246,0.08)', border: '1px solid rgba(59,130,246,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <ShoppingCartIcon sx={{ fontSize: 28, color: '#3b82f6' }} />
          </div>
          <div>
            <div style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Active Processing</div>
            <div style={{ fontSize: '1.875rem', fontWeight: 800, color: 'var(--text-primary)', marginTop: 4 }}>{counts.processing}</div>
          </div>
          <div style={{ position: 'absolute', right: -15, bottom: -15, fontSize: '6rem', fontWeight: 900, color: 'rgba(59,130,246,0.03)', pointerEvents: 'none', userSelect: 'none' }}>{counts.processing}</div>
        </div>

        <div className="widget" style={{ padding: '1.5rem', display: 'flex', alignItems: 'center', gap: '1.25rem', position: 'relative', overflow: 'hidden' }}>
          <div style={{ padding: '0.85rem', borderRadius: 14, background: 'rgba(16,185,129,0.08)', border: '1px solid rgba(16,185,129,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <LocalShippingIcon sx={{ fontSize: 28, color: '#10b981' }} />
          </div>
          <div>
            <div style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Out for Delivery</div>
            <div style={{ fontSize: '1.875rem', fontWeight: 800, color: 'var(--text-primary)', marginTop: 4 }}>{counts.delivery}</div>
          </div>
          <div style={{ position: 'absolute', right: -15, bottom: -15, fontSize: '6rem', fontWeight: 900, color: 'rgba(16,185,129,0.03)', pointerEvents: 'none', userSelect: 'none' }}>{counts.delivery}</div>
        </div>
      </div>

      {/* Daily Activity Summary */}
      <div className="widget" style={{ padding: '1.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: '1.25rem' }}>
          <TodayIcon sx={{ fontSize: 18, color: 'var(--green)' }} />
          <h3 style={{ margin: 0, fontSize: '0.95rem', fontWeight: 700, color: 'var(--text-primary)' }}>Daily Activity Summary (Today)</h3>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem', textAlign: 'center' }}>
          <div style={{ padding: '1rem', background: 'var(--bg-primary)', borderRadius: 12, border: '1px solid var(--border-light)' }}>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 500 }}>Orders Placed Today</div>
            <div style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--text-primary)', marginTop: 6 }}>{dailyActivity.placed}</div>
          </div>
          <div style={{ padding: '1rem', background: 'var(--bg-primary)', borderRadius: 12, border: '1px solid var(--border-light)' }}>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 500 }}>Orders Delivered Today</div>
            <div style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--green)', marginTop: 6 }}>{dailyActivity.delivered}</div>
          </div>
          <div style={{ padding: '1rem', background: 'var(--bg-primary)', borderRadius: 12, border: '1px solid var(--border-light)' }}>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 500 }}>Items Sold Today</div>
            <div style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--text-primary)', marginTop: 6 }}>{dailyActivity.itemsSold}</div>
          </div>
        </div>
      </div>

      {/* Main Grid: Operational widgets */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(450px, 1fr))', gap: '1.5rem' }}>
        
        {/* Left Side: Orders and Products */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          
          {/* Recent Orders */}
          <div className="widget" style={{ padding: '1.25rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              <h3 style={{ margin: 0, fontSize: '0.9375rem', fontWeight: 700, color: 'var(--text-primary)' }}>Recent Customer Orders</h3>
              <button onClick={() => navigate('/employee/orders')}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--green)', fontSize: '0.78rem', fontWeight: 600 }}>
                Manage Orders →
              </button>
            </div>
            <div style={{ overflowX: 'auto' }}>
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
                      <td colSpan="4" style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.8rem' }}>No recent orders.</td>
                    </tr>
                  ) : (
                    recentOrders.map(o => (
                      <tr key={o.id} onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.015)'}
                        onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                        <td style={{ ...td(), fontFamily: 'monospace', color: 'var(--green)', fontWeight: 600 }}>{o.id}</td>
                        <td style={{ ...td(), fontWeight: 500 }}>{o.customer}</td>
                        <td style={td()}>
                          <span className={statusColors[o.status.toLowerCase()] || 'badge-blue'}
                            style={{ display: 'inline-flex', alignItems: 'center', gap: 4, padding: '2px 6px', borderRadius: 4, fontSize: '0.72rem' }}>
                            {o.status}
                          </span>
                        </td>
                        <td style={{ ...td(true), fontWeight: 600, color: 'var(--green)' }}>{o.total}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Recently Added Products */}
          <div className="widget" style={{ padding: '1.25rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              <h3 style={{ margin: 0, fontSize: '0.9375rem', fontWeight: 700, color: 'var(--text-primary)' }}>Recently Added Products</h3>
              <button onClick={() => navigate('/employee/products')}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--green)', fontSize: '0.78rem', fontWeight: 600 }}>
                Manage Catalog →
              </button>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {recentlyAdded.length === 0 ? (
                <div style={{ padding: '1.5rem', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.8rem' }}>No products registered yet.</div>
              ) : (
                recentlyAdded.map(p => (
                  <div key={p.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.75rem 1rem', background: 'var(--bg-primary)', border: '1px solid var(--border-light)', borderRadius: 12 }}>
                    <div>
                      <div style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-primary)' }}>{p.name}</div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: 2 }}>Type: {p.type} • Added {p.dateAdded}</div>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <div style={{ fontSize: '0.875rem', fontWeight: 700, color: 'var(--text-primary)' }}>₱{p.price.toLocaleString()}</div>
                      <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.04em', marginTop: 2 }}>{p.unit}</div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

        </div>

        {/* Right Side: Stock Alerts and Inventory Summary */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          
          {/* Low Stock Alerts */}
          <div className="widget" style={{ padding: '1.25rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <WarningAmberIcon sx={{ fontSize: 16, color: '#ef4444' }} />
                <h3 style={{ margin: 0, fontSize: '0.9375rem', fontWeight: 700, color: 'var(--text-primary)' }}>Low Stock Products Alert</h3>
              </div>
              <span style={{ fontSize: '0.75rem', background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)', color: '#ef4444', borderRadius: 9999, padding: '2px 8px', fontWeight: 600 }}>
                {inventorySummary.lowStock} flagged
              </span>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {lowStockProducts.length === 0 ? (
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6, padding: '2rem', border: '1px dashed var(--border-light)', borderRadius: 12 }}>
                  <CheckCircleIcon sx={{ fontSize: 32, color: 'var(--green)' }} />
                  <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>All stocks are healthy!</span>
                </div>
              ) : (
                lowStockProducts.map(p => (
                  <div key={p.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.75rem 1rem', background: 'rgba(239,68,68,0.03)', border: '1px solid rgba(239,68,68,0.15)', borderRadius: 12 }}>
                    <div>
                      <div style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-primary)' }}>{p.name}</div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: 2 }}>{p.category}</div>
                    </div>
                    <div>
                      <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, padding: '4px 8px', borderRadius: 6, fontSize: '0.75rem', fontWeight: 700, background: p.stock === 0 ? 'rgba(239,68,68,0.15)' : 'rgba(245,158,11,0.15)', color: p.stock === 0 ? '#ef4444' : '#f59e0b' }}>
                        {p.stock === 0 ? 'Out of Stock' : `${p.stock} units left`}
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Inventory Summary */}
          <div className="widget" style={{ padding: '1.25rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: '1.25rem' }}>
              <CategoryIcon sx={{ fontSize: 18, color: 'var(--text-primary)' }} />
              <h3 style={{ margin: 0, fontSize: '0.9375rem', fontWeight: 700, color: 'var(--text-primary)' }}>Inventory Summary</h3>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '0.75rem' }}>
              <div style={{ padding: '1rem', background: 'var(--bg-primary)', borderRadius: 12, border: '1px solid var(--border-light)' }}>
                <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>Total Products</div>
                <div style={{ fontSize: '1.375rem', fontWeight: 800, color: 'var(--text-primary)', marginTop: 4 }}>{inventorySummary.totalProducts}</div>
              </div>
              <div style={{ padding: '1rem', background: 'var(--bg-primary)', borderRadius: 12, border: '1px solid var(--border-light)' }}>
                <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>Categories</div>
                <div style={{ fontSize: '1.375rem', fontWeight: 800, color: 'var(--text-primary)', marginTop: 4 }}>{inventorySummary.totalCategories}</div>
              </div>
              <div style={{ padding: '1rem', background: 'var(--bg-primary)', borderRadius: 12, border: '1px solid var(--border-light)' }}>
                <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>Total Net Stock</div>
                <div style={{ fontSize: '1.375rem', fontWeight: 800, color: 'var(--text-primary)', marginTop: 4 }}>{inventorySummary.totalStock}</div>
              </div>
              <div style={{ padding: '1rem', background: 'var(--bg-primary)', borderRadius: 12, border: '1px solid var(--border-light)' }}>
                <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>Out of Stock Items</div>
                <div style={{ fontSize: '1.375rem', fontWeight: 800, color: inventorySummary.outOfStock > 0 ? '#ef4444' : 'var(--text-primary)', marginTop: 4 }}>{inventorySummary.outOfStock}</div>
              </div>
            </div>
          </div>

        </div>

      </div>

      <style>{`
        @keyframes fadeIn { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: translateY(0); } }
      `}</style>
    </div>
  );
};

export default EmployeeDashboard;
