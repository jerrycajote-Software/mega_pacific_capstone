import React, { useState, useMemo, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import {
  CustomSearchIcon as SearchIcon,
  CustomCloseIcon as ClearIcon,
  CustomChevronRightIcon as ChevronRightIcon
} from '../icons';

const statusConfig = {
  pending: { label: 'Pending Approval', color: '#f59e0b', bg: 'rgba(245, 158, 11, 0.1)', border: 'rgba(245, 158, 11, 0.25)' },
  sales_approved: { label: 'Sales Approved', color: '#3b82f6', bg: 'rgba(59, 130, 246, 0.1)', border: 'rgba(59, 130, 246, 0.25)' },
  processing: { label: 'In Processing', color: '#6366f1', bg: 'rgba(99, 102, 241, 0.1)', border: 'rgba(99, 102, 241, 0.25)' },
  shipped: { label: 'Shipped', color: '#06b6d4', bg: 'rgba(6, 182, 212, 0.1)', border: 'rgba(6, 182, 212, 0.25)' },
  out_for_delivery: { label: 'Out for Delivery', color: '#0ea5e9', bg: 'rgba(14, 165, 233, 0.1)', border: 'rgba(14, 165, 233, 0.25)' },
  delivered: { label: 'Delivered', color: '#10b981', bg: 'rgba(16, 185, 129, 0.1)', border: 'rgba(16, 185, 129, 0.25)' },
  completed: { label: 'Completed', color: '#10b981', bg: 'rgba(16, 185, 129, 0.1)', border: 'rgba(16, 185, 129, 0.25)' },
  cancelled: { label: 'Cancelled', color: '#ef4444', bg: 'rgba(239, 68, 68, 0.1)', border: 'rgba(239, 68, 68, 0.25)' },
  rejected: { label: 'Rejected', color: '#ef4444', bg: 'rgba(239, 68, 68, 0.1)', border: 'rgba(239, 68, 68, 0.25)' }
};

const filterTabs = [
  { key: 'ALL', label: 'All' },
  { key: 'PENDING', label: 'Pending' },
  { key: 'APPROVED', label: 'Approved' },
  { key: 'COMPLETED', label: 'Completed' }
];

const RecentCustomerOrdersWidget = ({
  orders: incomingOrders,
  showHeaderAction = true,
  title = 'Recent Customer Orders',
  subtitle = 'Latest orders placed by homeowners and contractors'
}) => {
  const navigate = useNavigate();
  const [internalOrders, setInternalOrders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [orderFilter, setOrderFilter] = useState('ALL');
  const [searchOrder, setSearchOrder] = useState('');

  const shouldFetchSelf = !incomingOrders;

  useEffect(() => {
    if (!shouldFetchSelf) return;

    let isMounted = true;
    const fetchRecentOrders = async () => {
      setLoading(true);
      try {
        const token = localStorage.getItem('appToken');
        const API_URL = import.meta.env.VITE_API_URL || '';
        const res = await axios.get(`${API_URL}/api/sales/dashboard/stats`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (isMounted && res.data?.success && Array.isArray(res.data.data?.recentOrders)) {
          setInternalOrders(res.data.data.recentOrders);
        }
      } catch (err) {
        console.error('Failed to load recent orders widget data', err);
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchRecentOrders();
    const handleFocus = () => fetchRecentOrders();
    window.addEventListener('focus', handleFocus);

    return () => {
      isMounted = false;
      window.removeEventListener('focus', handleFocus);
    };
  }, [shouldFetchSelf]);

  const activeOrders = useMemo(() => {
    if (incomingOrders && Array.isArray(incomingOrders)) {
      return incomingOrders;
    }
    return internalOrders;
  }, [incomingOrders, internalOrders]);

  const filteredOrders = useMemo(() => {
    if (!activeOrders || activeOrders.length === 0) return [];
    return activeOrders.filter((order) => {
      const statusKey = (order.status || '').toLowerCase();
      const matchFilter =
        orderFilter === 'ALL' ||
        (orderFilter === 'PENDING' && statusKey.includes('pending')) ||
        (orderFilter === 'APPROVED' && (statusKey.includes('approved') || statusKey.includes('processing'))) ||
        (orderFilter === 'COMPLETED' && (statusKey.includes('completed') || statusKey.includes('delivered')));

      const query = searchOrder.trim().toLowerCase();
      const matchSearch =
        query === '' ||
        (order.id || '').toLowerCase().includes(query) ||
        (order.customer || '').toLowerCase().includes(query) ||
        (order.paymentMode || '').toLowerCase().includes(query);

      return matchFilter && matchSearch;
    });
  }, [activeOrders, orderFilter, searchOrder]);

  const handleNavigateToOrdersHub = () => {
    navigate('/sales/orders');
  };

  const handleManageOrder = (order) => {
    navigate('/sales/orders', { state: { highlightOrderId: order.id, rawId: order.rawId } });
  };

  return (
    <div
      style={{
        background: 'var(--bg-secondary)',
        border: '1px solid var(--border-light)',
        borderRadius: 16,
        padding: '1.25rem',
        boxShadow: '0 2px 8px rgba(0,0,0,0.02)'
      }}
    >
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: 12,
          marginBottom: '1rem'
        }}
      >
        <div>
          <h3 style={{ margin: 0, fontSize: '0.975rem', fontWeight: 700, color: 'var(--text-primary)' }}>
            {title}
          </h3>
          <p style={{ margin: '2px 0 0', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
            {subtitle}
          </p>
        </div>

        {showHeaderAction && (
          <button
            type="button"
            onClick={handleNavigateToOrdersHub}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 6,
              padding: '6px 14px',
              borderRadius: 10,
              fontSize: '0.78rem',
              fontWeight: 700,
              color: 'var(--green)',
              background: 'rgba(34, 197, 94, 0.08)',
              border: '1.5px solid rgba(34, 197, 94, 0.28)',
              cursor: 'pointer',
              transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
              boxShadow: '0 2px 6px rgba(34, 197, 94, 0.08)'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = 'rgba(34, 197, 94, 0.16)';
              e.currentTarget.style.borderColor = 'var(--green)';
              e.currentTarget.style.transform = 'translateY(-1px)';
              e.currentTarget.style.boxShadow = '0 4px 12px rgba(34, 197, 94, 0.18)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'rgba(34, 197, 94, 0.08)';
              e.currentTarget.style.borderColor = 'rgba(34, 197, 94, 0.28)';
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = '0 2px 6px rgba(34, 197, 94, 0.08)';
            }}
          >
            <span>Full Orders Hub</span>
            <ChevronRightIcon sx={{ fontSize: 16 }} />
          </button>
        )}
      </div>

      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 10,
          flexWrap: 'wrap',
          marginBottom: '1rem'
        }}
      >
        <div
          style={{
            display: 'inline-flex',
            background: 'var(--bg-primary)',
            padding: 3,
            borderRadius: 10,
            border: '1px solid var(--border-light)'
          }}
        >
          {filterTabs.map((tab) => (
            <button
              key={tab.key}
              type="button"
              onClick={() => setOrderFilter(tab.key)}
              style={{
                padding: '5px 12px',
                borderRadius: 8,
                border: 'none',
                background: orderFilter === tab.key ? 'var(--green)' : 'transparent',
                color: orderFilter === tab.key ? '#fff' : 'var(--text-muted)',
                fontSize: '0.75rem',
                fontWeight: orderFilter === tab.key ? 700 : 500,
                cursor: 'pointer',
                transition: 'all 0.15s ease'
              }}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 6,
            background: 'var(--bg-primary)',
            border: '1px solid var(--border-light)',
            borderRadius: 10,
            padding: '4px 10px',
            width: 220
          }}
        >
          <SearchIcon sx={{ fontSize: 16, color: 'var(--text-muted)' }} />
          <input
            type="text"
            placeholder="Filter customer or ID..."
            value={searchOrder}
            onChange={(e) => setSearchOrder(e.target.value)}
            style={{
              border: 'none',
              background: 'transparent',
              outline: 'none',
              fontSize: '0.78rem',
              color: 'var(--text-primary)',
              width: '100%'
            }}
          />
          {searchOrder && (
            <ClearIcon
              onClick={() => setSearchOrder('')}
              sx={{ fontSize: 14, color: 'var(--text-muted)', cursor: 'pointer' }}
            />
          )}
        </div>
      </div>

      <div style={{ overflowX: 'auto', borderRadius: 12, border: '1px solid var(--border-light)' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', minWidth: 620 }}>
          <thead>
            <tr style={{ borderBottom: '1px solid var(--border-light)', background: 'rgba(0,0,0,0.02)' }}>
              <th style={{ padding: '10px 14px', fontSize: '0.72rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', width: '36%' }}>Customer</th>
              <th style={{ padding: '10px 14px', fontSize: '0.72rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', width: '16%', whiteSpace: 'nowrap' }}>Order ID</th>
              <th style={{ padding: '10px 14px', fontSize: '0.72rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', width: '18%', whiteSpace: 'nowrap' }}>Status</th>
              <th style={{ padding: '10px 14px', fontSize: '0.72rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', textAlign: 'right', width: '16%', whiteSpace: 'nowrap' }}>Total</th>
              <th style={{ padding: '10px 14px', fontSize: '0.72rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', textAlign: 'right', width: '14%', whiteSpace: 'nowrap' }}>Action</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan="5" style={{ padding: '2.5rem', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.825rem' }}>
                  Loading recent customer orders...
                </td>
              </tr>
            ) : filteredOrders.length === 0 ? (
              <tr>
                <td colSpan="5" style={{ padding: '2.5rem', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.825rem' }}>
                  No orders matching current filter criteria.
                </td>
              </tr>
            ) : (
              filteredOrders.map((order) => {
                const statusKey = (order.status || '').toLowerCase();
                const cfg = statusConfig[statusKey] || {
                  label: order.status || 'Pending',
                  color: '#64748b',
                  bg: 'rgba(100, 116, 139, 0.1)',
                  border: 'rgba(100, 116, 139, 0.25)'
                };

                return (
                  <tr
                    key={order.id || order.rawId}
                    style={{
                      borderBottom: '1px solid var(--border-light)',
                      transition: 'all 0.15s ease'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background = 'rgba(34, 197, 94, 0.03)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = 'transparent';
                    }}
                  >
                    <td style={{ padding: '12px 14px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <img
                          src={order.avatarUrl || '/default-profile.png'}
                          alt={order.customer || 'Customer'}
                          style={{
                            width: 34,
                            height: 34,
                            borderRadius: '50%',
                            objectFit: 'cover',
                            flexShrink: 0,
                            border: '1.5px solid var(--border-light)'
                          }}
                        />
                        <div style={{ minWidth: 0 }}>
                          <div style={{ fontSize: '0.84rem', fontWeight: 700, color: 'var(--text-primary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                            {order.customer}
                          </div>
                          <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: 2, display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
                            <span>{order.date}</span>
                            <span style={{ opacity: 0.35 }}>•</span>
                            <span
                              style={{
                                fontSize: '0.68rem',
                                padding: '1px 6px',
                                borderRadius: 4,
                                background: 'var(--bg-primary)',
                                border: '1px solid var(--border-light)',
                                color: 'var(--text-muted)'
                              }}
                            >
                              {order.paymentMode || 'COD'}
                            </span>
                          </div>
                        </div>
                      </div>
                    </td>

                    <td style={{ padding: '12px 14px', whiteSpace: 'nowrap' }}>
                      <span
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace',
                          fontWeight: 700,
                          fontSize: '0.78rem',
                          color: 'var(--green)',
                          background: 'rgba(34, 197, 94, 0.09)',
                          border: '1px solid rgba(34, 197, 94, 0.25)',
                          padding: '3px 8px',
                          borderRadius: 6,
                          letterSpacing: '0.03em',
                          whiteSpace: 'nowrap'
                        }}
                      >
                        {order.id}
                      </span>
                    </td>

                    <td style={{ padding: '12px 14px', whiteSpace: 'nowrap' }}>
                      <span
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: 6,
                          padding: '3px 10px',
                          borderRadius: 9999,
                          fontSize: '0.72rem',
                          fontWeight: 700,
                          background: cfg.bg,
                          color: cfg.color,
                          border: `1px solid ${cfg.border}`,
                          whiteSpace: 'nowrap'
                        }}
                      >
                        <span style={{ width: 6, height: 6, borderRadius: '50%', background: cfg.color, boxShadow: `0 0 6px ${cfg.color}` }} />
                        {cfg.label}
                      </span>
                    </td>

                    <td style={{ padding: '12px 14px', textAlign: 'right', whiteSpace: 'nowrap' }}>
                      <span
                        style={{
                          fontSize: '0.875rem',
                          fontWeight: 800,
                          color: 'var(--text-primary)',
                          fontVariantNumeric: 'tabular-nums',
                          letterSpacing: '-0.01em'
                        }}
                      >
                        {order.total}
                      </span>
                    </td>

                    <td style={{ padding: '12px 14px', textAlign: 'right', whiteSpace: 'nowrap' }}>
                      <button
                        type="button"
                        onClick={() => handleManageOrder(order)}
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: 4,
                          padding: '5px 12px',
                          borderRadius: 8,
                          background: 'var(--bg-primary)',
                          border: '1px solid var(--border-light)',
                          color: 'var(--text-primary)',
                          fontSize: '0.74rem',
                          fontWeight: 600,
                          cursor: 'pointer',
                          transition: 'all 0.18s ease'
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.borderColor = 'var(--green)';
                          e.currentTarget.style.color = 'var(--green)';
                          e.currentTarget.style.background = 'rgba(34, 197, 94, 0.06)';
                          e.currentTarget.style.transform = 'translateX(2px)';
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.borderColor = 'var(--border-light)';
                          e.currentTarget.style.color = 'var(--text-primary)';
                          e.currentTarget.style.background = 'var(--bg-primary)';
                          e.currentTarget.style.transform = 'translateX(0)';
                        }}
                      >
                        <span>Manage</span>
                      </button>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default RecentCustomerOrdersWidget;

