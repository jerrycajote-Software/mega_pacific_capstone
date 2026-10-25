import React, { useState, useEffect, useMemo } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import LocalShippingIcon from '@mui/icons-material/LocalShipping';
import BadgeIcon from '@mui/icons-material/Badge';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import CategoryIcon from '@mui/icons-material/Category';
import SupportAgentIcon from '@mui/icons-material/SupportAgent';
import StarIcon from '@mui/icons-material/Star';
import SearchIcon from '@mui/icons-material/Search';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import RateReviewIcon from '@mui/icons-material/RateReview';
import StorefrontIcon from '@mui/icons-material/Storefront';
import ClearIcon from '@mui/icons-material/Clear';

const SalesDashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState(new Date());
  const [orderFilter, setOrderFilter] = useState('ALL');
  const [searchOrder, setSearchOrder] = useState('');
  const [hoveredBarIndex, setHoveredBarIndex] = useState(null);
  const [coilSummary, setCoilSummary] = useState(null);

  const API_URL = import.meta.env.VITE_API_URL || '';

  const fetchData = async () => {
    try {
      const token = localStorage.getItem('appToken');
      const res = await axios.get(`${API_URL}/api/sales/dashboard`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.data.success) {
        setData(res.data.data);
        setLastUpdated(new Date());
      }

      try {
        const coilRes = await axios.get(`${API_URL}/api/logistic/coils/summary`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (coilRes.data.success) {
          setCoilSummary(coilRes.data.data);
        }
      } catch (cErr) {
      }
    } catch (err) {
      console.error('Failed to fetch sales dashboard data', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    const syncInterval = setInterval(() => {
      fetchData();
    }, 10000);

    const handleFocus = () => {
      fetchData();
    };
    window.addEventListener('focus', handleFocus);

    return () => {
      clearInterval(syncInterval);
      window.removeEventListener('focus', handleFocus);
    };
  }, []);

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 18) return 'Good afternoon';
    return 'Good evening';
  };

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

  const filteredOrders = useMemo(() => {
    if (!data?.recentOrders) return [];
    return data.recentOrders.filter(order => {
      const matchFilter =
        orderFilter === 'ALL' ||
        (orderFilter === 'PENDING' && order.status.toLowerCase().includes('pending')) ||
        (orderFilter === 'APPROVED' && (order.status.toLowerCase().includes('approved') || order.status.toLowerCase().includes('processing'))) ||
        (orderFilter === 'COMPLETED' && (order.status.toLowerCase().includes('completed') || order.status.toLowerCase().includes('delivered')));

      const matchSearch =
        searchOrder.trim() === '' ||
        order.id.toLowerCase().includes(searchOrder.toLowerCase()) ||
        order.customer.toLowerCase().includes(searchOrder.toLowerCase());

      return matchFilter && matchSearch;
    });
  }, [data?.recentOrders, orderFilter, searchOrder]);

  if (loading || !data) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', height: '65vh', gap: 16 }}>
        <div style={{
          width: 44,
          height: 44,
          borderRadius: '50%',
          border: '3px solid var(--border-light)',
          borderTopColor: 'var(--green)',
          animation: 'spin 0.8s linear infinite'
        }} />
        <span style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-muted)' }}>
          Loading Sales Operations Telemetry...
        </span>
        <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  const {
    counts = {},
    inventorySummary = {},
    lowStockProducts = [],
    recentOrders = [],
    dailyActivity = {},
    totals = {},
    topProducts = [],
    salesTrend = [],
    customerService = {}
  } = data;

  const totalPipelineActive = (counts.pending || 0) + (counts.processing || 0);
  const maxWeeklyOrders = Math.max(...(salesTrend.map(s => s.orders || 0)), 1);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.75rem', paddingBottom: '3rem', animation: 'fadeInUp 0.25s ease-out' }}>
      
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        flexWrap: 'wrap',
        gap: '1.25rem',
        padding: '1.5rem',
        background: 'var(--bg-secondary)',
        border: '1px solid var(--border-light)',
        borderRadius: 16,
        boxShadow: '0 2px 8px rgba(0,0,0,0.02)'
      }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
            <span style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 6,
              padding: '3px 10px',
              borderRadius: 9999,
              background: 'rgba(34, 197, 94, 0.1)',
              border: '1px solid rgba(34, 197, 94, 0.25)',
              color: 'var(--green)',
              fontSize: '0.72rem',
              fontWeight: 700,
              letterSpacing: '0.06em',
              textTransform: 'uppercase'
            }}>
            
              Sales Operations
            </span>
            <span style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 6,
              fontSize: '0.75rem',
              color: 'var(--text-muted)',
              fontWeight: 500
            }}>
              <span style={{ width: 7, height: 7, borderRadius: '50%', background: '#22c55e', display: 'inline-block' }} />
              Live Telemetry Stream
            </span>
          </div>

          <h1 style={{
            margin: 0,
            fontSize: '1.75rem',
            fontWeight: 800,
            color: 'var(--text-primary)',
            letterSpacing: '-0.025em'
          }}>
            {getGreeting()}, {user?.name?.split(' ')[0] || 'Sales Rep'}!
          </h1>
          <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--text-muted)' }}>
            {new Date().toLocaleDateString('en-PH', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
            {' • '}
            Synced {lastUpdated.toLocaleTimeString('en-PH', { hour: '2-digit', minute: '2-digit' })}
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
          <button
            onClick={() => navigate('/sales/orders')}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 6,
              padding: '8px 14px',
              borderRadius: 10,
              background: 'var(--bg-primary)',
              border: '1px solid var(--border-light)',
              color: 'var(--text-primary)',
              fontSize: '0.8rem',
              fontWeight: 600,
              cursor: 'pointer',
              transition: 'all 0.18s ease'
            }}
            onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--green)'; }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border-light)'; }}
          >
            
            Manage Orders
          </button>

          <button
            onClick={() => navigate('/sales/customer-service')}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 6,
              padding: '8px 14px',
              borderRadius: 10,
              background: 'var(--bg-primary)',
              border: '1px solid var(--border-light)',
              color: 'var(--text-primary)',
              fontSize: '0.8rem',
              fontWeight: 600,
              cursor: 'pointer',
              transition: 'all 0.18s ease'
            }}
            onMouseEnter={e => { e.currentTarget.style.borderColor = '#8b5cf6'; }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border-light)'; }}
          >
            
            Inquiries
            {customerService?.openInquiries > 0 && (
              <span style={{
                background: '#8b5cf6',
                color: '#fff',
                fontSize: '0.7rem',
                fontWeight: 700,
                padding: '1px 6px',
                borderRadius: 9999
              }}>
                {customerService.openInquiries}
              </span>
            )}
          </button>


        </div>
      </div>

      {(counts.pending > 0 || customerService?.openInquiries > 0 || lowStockProducts.length > 0) && (
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: 12,
          padding: '0.9rem 1.25rem',
          borderRadius: 12,
          background: 'rgba(245, 158, 11, 0.06)',
          border: '1px solid rgba(245, 158, 11, 0.25)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
            <span style={{
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: 28,
              height: 28,
              borderRadius: '50%',
              background: 'rgba(245, 158, 11, 0.15)',
              color: '#f59e0b'
            }}>
              <WarningAmberIcon sx={{ fontSize: 16 }} />
            </span>
            <span style={{ fontSize: '0.825rem', fontWeight: 600, color: 'var(--text-primary)' }}>
              Action Needed:
            </span>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
              {counts.pending > 0 && (
                <span
                  onClick={() => navigate('/sales/orders')}
                  style={{
                    fontSize: '0.75rem',
                    fontWeight: 600,
                    color: '#f59e0b',
                    background: 'rgba(245, 158, 11, 0.12)',
                    padding: '3px 8px',
                    borderRadius: 6,
                    cursor: 'pointer'
                  }}
                >
                  ⚡ {counts.pending} Orders Awaiting Approval
                </span>
              )}
              {customerService?.openInquiries > 0 && (
                <span
                  onClick={() => navigate('/sales/customer-service')}
                  style={{
                    fontSize: '0.75rem',
                    fontWeight: 600,
                    color: '#8b5cf6',
                    background: 'rgba(139, 92, 246, 0.12)',
                    padding: '3px 8px',
                    borderRadius: 6,
                    cursor: 'pointer'
                  }}
                >
                  💬 {customerService.openInquiries} Inquiries Requiring Reply
                </span>
              )}
              {coilSummary && (coilSummary.lowCount + coilSummary.criticalCount > 0) && (
                <span
                  onClick={() => navigate('/sales/pre-order-products')}
                  style={{
                    fontSize: '0.75rem',
                    fontWeight: 600,
                    color: coilSummary.criticalCount > 0 ? '#ef4444' : '#f59e0b',
                    background: coilSummary.criticalCount > 0 ? 'rgba(239, 68, 68, 0.12)' : 'rgba(245, 158, 11, 0.12)',
                    padding: '3px 8px',
                    borderRadius: 6,
                    cursor: 'pointer'
                  }}
                >
                  ⚡ Raw Material Coils: {coilSummary.criticalCount > 0 ? `${coilSummary.criticalCount} Critical Gauges` : `${coilSummary.lowCount} Gauges Low`}
                </span>
              )}
              <span
                onClick={() => navigate('/sales/pre-order-products')}
                style={{
                  fontSize: '0.75rem',
                  fontWeight: 600,
                  color: '#3b82f6',
                  background: 'rgba(59, 130, 246, 0.12)',
                  padding: '3px 8px',
                  borderRadius: 6,
                  cursor: 'pointer'
                }}
              >
                🛠️ Manage Pre-Order Products
              </span>
            </div>
          </div>
        </div>
      )}

      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
        gap: '1.25rem'
      }}>
        <div style={{
          padding: '1.35rem',
          background: 'var(--bg-secondary)',
          border: '1px solid var(--border-light)',
          borderRadius: 16,
          display: 'flex',
          flexDirection: 'column',
          gap: 12,
          position: 'relative',
          overflow: 'hidden',
          transition: 'all 0.2s ease',
          boxShadow: '0 2px 8px rgba(0,0,0,0.02)'
        }}
        onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.borderColor = 'var(--green)'; }}
        onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.borderColor = 'var(--border-light)'; }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
              Gross Revenue
            </span>
            <div style={{
              width: 38,
              height: 38,
              borderRadius: 10,
              background: 'rgba(34, 197, 94, 0.1)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <TrendingUpIcon sx={{ fontSize: 20, color: 'var(--green)' }} />
            </div>
          </div>

          <div>
            <div style={{ fontSize: '1.875rem', fontWeight: 800, color: 'var(--text-primary)', fontVariantNumeric: 'tabular-nums', letterSpacing: '-0.02em', lineHeight: 1.1 }}>
              {totals?.revenue || '₱0'}
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 8, fontSize: '0.78rem', color: 'var(--text-muted)' }}>
              <span style={{
                color: 'var(--green)',
                fontWeight: 700,
                background: 'rgba(34, 197, 94, 0.1)',
                padding: '2px 6px',
                borderRadius: 4
              }}>
                {totals?.orders || 0} orders
              </span>
              <span>across catalog</span>
            </div>
          </div>
        </div>

        <div style={{
          padding: '1.35rem',
          background: 'var(--bg-secondary)',
          border: '1px solid var(--border-light)',
          borderRadius: 16,
          display: 'flex',
          flexDirection: 'column',
          gap: 12,
          position: 'relative',
          overflow: 'hidden',
          transition: 'all 0.2s ease',
          boxShadow: '0 2px 8px rgba(0,0,0,0.02)'
        }}
        onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.borderColor = '#f59e0b'; }}
        onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.borderColor = 'var(--border-light)'; }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
              Order Pipeline
            </span>
            <div style={{
              width: 38,
              height: 38,
              borderRadius: 10,
              background: 'rgba(245, 158, 11, 0.1)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <AccessTimeIcon sx={{ fontSize: 20, color: '#f59e0b' }} />
            </div>
          </div>

          <div>
            <div style={{ fontSize: '1.875rem', fontWeight: 800, color: 'var(--text-primary)', fontVariantNumeric: 'tabular-nums', letterSpacing: '-0.02em', lineHeight: 1.1 }}>
              {totalPipelineActive}
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 8, fontSize: '0.75rem' }}>
              <span style={{
                color: '#f59e0b',
                fontWeight: 700,
                background: 'rgba(245, 158, 11, 0.12)',
                padding: '2px 6px',
                borderRadius: 4
              }}>
                {counts.pending || 0} Pending
              </span>
              <span style={{
                color: '#3b82f6',
                fontWeight: 700,
                background: 'rgba(59, 130, 246, 0.12)',
                padding: '2px 6px',
                borderRadius: 4
              }}>
                {counts.processing || 0} In Production
              </span>
            </div>
          </div>
        </div>

        <div style={{
          padding: '1.35rem',
          background: 'var(--bg-secondary)',
          border: '1px solid var(--border-light)',
          borderRadius: 16,
          display: 'flex',
          flexDirection: 'column',
          gap: 12,
          position: 'relative',
          overflow: 'hidden',
          transition: 'all 0.2s ease',
          boxShadow: '0 2px 8px rgba(0,0,0,0.02)'
        }}
        onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.borderColor = '#0ea5e9'; }}
        onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.borderColor = 'var(--border-light)'; }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
              Active Dispatch
            </span>
            <div style={{
              width: 38,
              height: 38,
              borderRadius: 10,
              background: 'rgba(14, 165, 233, 0.1)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <LocalShippingIcon sx={{ fontSize: 20, color: '#0ea5e9' }} />
            </div>
          </div>

          <div>
            <div style={{ fontSize: '1.875rem', fontWeight: 800, color: 'var(--text-primary)', fontVariantNumeric: 'tabular-nums', letterSpacing: '-0.02em', lineHeight: 1.1 }}>
              {counts.delivery || 0}
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 8, fontSize: '0.78rem', color: 'var(--text-muted)' }}>
              <span style={{
                color: '#0ea5e9',
                fontWeight: 700,
                background: 'rgba(14, 165, 233, 0.1)',
                padding: '2px 6px',
                borderRadius: 4
              }}>
                {dailyActivity.delivered || 0} delivered today
              </span>
              <span>via freight</span>
            </div>
          </div>
        </div>

        <div style={{
          padding: '1.35rem',
          background: 'var(--bg-secondary)',
          border: '1px solid var(--border-light)',
          borderRadius: 16,
          display: 'flex',
          flexDirection: 'column',
          gap: 12,
          position: 'relative',
          overflow: 'hidden',
          transition: 'all 0.2s ease',
          boxShadow: '0 2px 8px rgba(0,0,0,0.02)'
        }}
        onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.borderColor = '#8b5cf6'; }}
        onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.borderColor = 'var(--border-light)'; }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
              Customer Sentiment
            </span>
            <div style={{
              width: 38,
              height: 38,
              borderRadius: 10,
              background: 'rgba(139, 92, 246, 0.1)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <SupportAgentIcon sx={{ fontSize: 20, color: '#8b5cf6' }} />
            </div>
          </div>

          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <span style={{ fontSize: '1.875rem', fontWeight: 800, color: 'var(--text-primary)', fontVariantNumeric: 'tabular-nums', letterSpacing: '-0.02em', lineHeight: 1.1 }}>
                {customerService?.averageRating || 4.9}
              </span>
              <div style={{ display: 'flex', alignItems: 'center', color: '#eab308' }}>
                <StarIcon sx={{ fontSize: 18 }} />
              </div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 8, fontSize: '0.75rem' }}>
              <span style={{
                color: '#8b5cf6',
                fontWeight: 700,
                background: 'rgba(139, 92, 246, 0.12)',
                padding: '2px 6px',
                borderRadius: 4
              }}>
                {customerService?.openInquiries || 0} Open Tickets
              </span>
              <span style={{ color: 'var(--text-muted)' }}>
                {customerService?.pendingReviews || 0} reviews pending reply
              </span>
            </div>
          </div>
        </div>
      </div>

      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
        gap: '1.25rem'
      }}>
        <div style={{
          padding: '1.5rem',
          background: 'var(--bg-secondary)',
          border: '1px solid var(--border-light)',
          borderRadius: 16,
          display: 'flex',
          flexDirection: 'column',
          gap: 16
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <div style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--green)' }} />
              <h3 style={{ margin: 0, fontSize: '0.95rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                Today's Daily Pulse
              </h3>
            </div>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 500 }}>
              Live counters
            </span>
          </div>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(2, 1fr)',
            gap: 12
          }}>
            <div style={{
              padding: '1rem',
              borderRadius: 12,
              background: 'var(--bg-primary)',
              border: '1px solid var(--border-light)',
              display: 'flex',
              flexDirection: 'column',
              gap: 4
            }}>
              <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                Orders Placed
              </span>
              <span style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--text-primary)', fontVariantNumeric: 'tabular-nums' }}>
                {dailyActivity.placed || 0}
              </span>
              <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>logged today</span>
            </div>

            <div style={{
              padding: '1rem',
              borderRadius: 12,
              background: 'var(--bg-primary)',
              border: '1px solid var(--border-light)',
              display: 'flex',
              flexDirection: 'column',
              gap: 4
            }}>
              <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                Delivered Today
              </span>
              <span style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--green)', fontVariantNumeric: 'tabular-nums' }}>
                {dailyActivity.delivered || 0}
              </span>
              <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>completed delivery</span>
            </div>

            <div style={{
              padding: '1rem',
              borderRadius: 12,
              background: 'var(--bg-primary)',
              border: '1px solid var(--border-light)',
              display: 'flex',
              flexDirection: 'column',
              gap: 4
            }}>
              <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                Items Dispatched
              </span>
              <span style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--text-primary)', fontVariantNumeric: 'tabular-nums' }}>
                {dailyActivity.itemsSold || 0}
              </span>
              <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>units / linear meters</span>
            </div>

            <div style={{
              padding: '1rem',
              borderRadius: 12,
              background: 'var(--bg-primary)',
              border: '1px solid var(--border-light)',
              display: 'flex',
              flexDirection: 'column',
              gap: 4
            }}>
              <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                Today's Bookings
              </span>
              <span style={{ fontSize: '1.35rem', fontWeight: 800, color: 'var(--green)', fontVariantNumeric: 'tabular-nums' }}>
                {dailyActivity.todayRevenue || '₱0'}
              </span>
              <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>invoiced value</span>
            </div>
          </div>
        </div>

        <div style={{
          padding: '1.5rem',
          background: 'var(--bg-secondary)',
          border: '1px solid var(--border-light)',
          borderRadius: 16,
          display: 'flex',
          flexDirection: 'column',
          gap: 16
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <h3 style={{ margin: 0, fontSize: '0.95rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                7-Day Order Velocity
              </h3>
              <p style={{ margin: '2px 0 0', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                Daily order volume distribution over the past week
              </p>
            </div>
            <span style={{
              fontSize: '0.72rem',
              fontWeight: 700,
              color: 'var(--green)',
              background: 'rgba(34, 197, 94, 0.1)',
              padding: '3px 8px',
              borderRadius: 6
            }}>
              Peak: {maxWeeklyOrders} orders
            </span>
          </div>

          <div style={{
            display: 'flex',
            alignItems: 'flex-end',
            justifyContent: 'space-between',
            gap: 8,
            height: 140,
            paddingTop: 16,
            paddingBottom: 4
          }}>
            {salesTrend.map((slot, idx) => {
              const heightPercent = maxWeeklyOrders > 0 ? Math.max((slot.orders / maxWeeklyOrders) * 100, 10) : 10;
              const isHovered = hoveredBarIndex === idx;

              return (
                <div
                  key={idx}
                  style={{
                    flex: 1,
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: 8,
                    height: '100%',
                    justifyContent: 'flex-end',
                    cursor: 'pointer',
                    position: 'relative'
                  }}
                  onMouseEnter={() => setHoveredBarIndex(idx)}
                  onMouseLeave={() => setHoveredBarIndex(null)}
                >
                  {isHovered && (
                    <div style={{
                      position: 'absolute',
                      bottom: '100%',
                      marginBottom: 8,
                      background: 'var(--text-primary)',
                      color: 'var(--bg-primary)',
                      padding: '6px 10px',
                      borderRadius: 8,
                      fontSize: '0.72rem',
                      whiteSpace: 'nowrap',
                      pointerEvents: 'none',
                      zIndex: 20,
                      boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                      textAlign: 'center'
                    }}>
                      <div style={{ fontWeight: 700 }}>{slot.date}</div>
                      <div>{slot.orders} orders ({slot.revenue ? `₱${slot.revenue.toLocaleString()}` : '₱0'})</div>
                    </div>
                  )}

                  <span style={{
                    fontSize: '0.7rem',
                    fontWeight: 700,
                    color: isHovered ? 'var(--green)' : 'var(--text-muted)',
                    fontVariantNumeric: 'tabular-nums'
                  }}>
                    {slot.orders}
                  </span>

                  <div style={{
                    width: '100%',
                    maxWidth: 36,
                    height: `${heightPercent}%`,
                    minHeight: 12,
                    borderRadius: '6px 6px 2px 2px',
                    background: isHovered
                      ? 'var(--green)'
                      : slot.orders > 0
                        ? 'rgba(34, 197, 94, 0.45)'
                        : 'rgba(0,0,0,0.06)',
                    transition: 'all 0.18s ease'
                  }} />

                  <span style={{
                    fontSize: '0.72rem',
                    fontWeight: isHovered ? 700 : 500,
                    color: isHovered ? 'var(--text-primary)' : 'var(--text-muted)'
                  }}>
                    {slot.day}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'minmax(0, 1.4fr) minmax(0, 1fr)',
        gap: '1.5rem',
        alignItems: 'start'
      }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          
          <div style={{
            background: 'var(--bg-secondary)',
            border: '1px solid var(--border-light)',
            borderRadius: 16,
            padding: '1.25rem',
            boxShadow: '0 2px 8px rgba(0,0,0,0.02)'
          }}>
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              flexWrap: 'wrap',
              gap: 12,
              marginBottom: '1rem'
            }}>
              <div>
                <h3 style={{ margin: 0, fontSize: '0.975rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                  Recent Customer Orders
                </h3>
                <p style={{ margin: '2px 0 0', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                  Latest orders placed by homeowners and contractors
                </p>
              </div>

              <button
                onClick={() => navigate('/sales/orders')}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 4,
                  background: 'none',
                  border: 'none',
                  color: 'var(--green)',
                  fontSize: '0.8rem',
                  fontWeight: 700,
                  cursor: 'pointer',
                  padding: '4px 8px',
                  borderRadius: 6
                }}
              >
                Full Orders Hub <ArrowForwardIcon sx={{ fontSize: 14 }} />
              </button>
            </div>

            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: 10,
              flexWrap: 'wrap',
              marginBottom: '1rem'
            }}>
              <div style={{
                display: 'inline-flex',
                background: 'var(--bg-primary)',
                padding: 3,
                borderRadius: 10,
                border: '1px solid var(--border-light)'
              }}>
                {[
                  { key: 'ALL', label: 'All' },
                  { key: 'PENDING', label: 'Pending' },
                  { key: 'APPROVED', label: 'Approved' },
                  { key: 'COMPLETED', label: 'Completed' }
                ].map(tab => (
                  <button
                    key={tab.key}
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

              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: 6,
                background: 'var(--bg-primary)',
                border: '1px solid var(--border-light)',
                borderRadius: 10,
                padding: '4px 10px',
                width: 200
              }}>
                <SearchIcon sx={{ fontSize: 16, color: 'var(--text-muted)' }} />
                <input
                  type="text"
                  placeholder="Filter customer or ID..."
                  value={searchOrder}
                  onChange={e => setSearchOrder(e.target.value)}
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

            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid var(--border-light)' }}>
                    <th style={{ padding: '8px 12px', fontSize: '0.72rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Customer</th>
                    <th style={{ padding: '8px 12px', fontSize: '0.72rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Order ID</th>
                    <th style={{ padding: '8px 12px', fontSize: '0.72rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Status</th>
                    <th style={{ padding: '8px 12px', fontSize: '0.72rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', textAlign: 'right' }}>Total</th>
                    <th style={{ padding: '8px 12px', fontSize: '0.72rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', textAlign: 'right' }}>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredOrders.length === 0 ? (
                    <tr>
                      <td colSpan="5" style={{ padding: '2.5rem', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.825rem' }}>
                        No orders matching current filter criteria.
                      </td>
                    </tr>
                  ) : (
                    filteredOrders.map(order => {
                      const cfg = statusConfig[order.status.toLowerCase()] || {
                        label: order.status,
                        color: '#64748b',
                        bg: 'rgba(100, 116, 139, 0.1)',
                        border: 'rgba(100, 116, 139, 0.25)'
                      };

                      return (
                        <tr
                          key={order.id}
                          style={{
                            borderBottom: '1px solid var(--border-light)',
                            transition: 'background 0.15s ease'
                          }}
                          onMouseEnter={e => e.currentTarget.style.background = 'rgba(0,0,0,0.015)'}
                          onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                        >
                          <td style={{ padding: '10px 12px' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                              <img
                                src={order.avatarUrl || '/default-profile.png'}
                                alt={order.customer}
                                style={{
                                  width: 32,
                                  height: 32,
                                  borderRadius: '50%',
                                  objectFit: 'cover',
                                  flexShrink: 0,
                                  border: '1px solid var(--border-light)'
                                }}
                              />
                              <div>
                                <div style={{ fontSize: '0.84rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                                  {order.customer}
                                </div>
                                <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                                  {order.date} • {order.paymentMode || 'COD'}
                                </div>
                              </div>
                            </div>
                          </td>

                          <td style={{ padding: '10px 12px' }}>
                            <span style={{
                              fontFamily: 'monospace',
                              fontWeight: 700,
                              fontSize: '0.8rem',
                              color: 'var(--green)',
                              background: 'rgba(34, 197, 94, 0.08)',
                              padding: '2px 8px',
                              borderRadius: 6
                            }}>
                              {order.id}
                            </span>
                          </td>

                          <td style={{ padding: '10px 12px' }}>
                            <span style={{
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: 6,
                              padding: '3px 8px',
                              borderRadius: 9999,
                              fontSize: '0.72rem',
                              fontWeight: 700,
                              background: cfg.bg,
                              color: cfg.color,
                              border: `1px solid ${cfg.border}`
                            }}>
                              <span style={{ width: 6, height: 6, borderRadius: '50%', background: cfg.color }} />
                              {cfg.label}
                            </span>
                          </td>

                          <td style={{ padding: '10px 12px', textAlign: 'right' }}>
                            <span style={{
                              fontSize: '0.875rem',
                              fontWeight: 800,
                              color: 'var(--text-primary)',
                              fontVariantNumeric: 'tabular-nums'
                            }}>
                              {order.total}
                            </span>
                          </td>

                          <td style={{ padding: '10px 12px', textAlign: 'right' }}>
                            <button
                              onClick={() => navigate('/sales/orders')}
                              style={{
                                padding: '4px 10px',
                                borderRadius: 8,
                                background: 'var(--bg-primary)',
                                border: '1px solid var(--border-light)',
                                color: 'var(--text-primary)',
                                fontSize: '0.72rem',
                                fontWeight: 600,
                                cursor: 'pointer',
                                transition: 'all 0.15s ease'
                              }}
                              onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--green)'; }}
                              onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border-light)'; }}
                            >
                              Manage
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

          <div style={{
            background: 'var(--bg-secondary)',
            border: '1px solid var(--border-light)',
            borderRadius: 16,
            padding: '1.25rem',
            boxShadow: '0 2px 8px rgba(0,0,0,0.02)'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
              <div>
                <h3 style={{ margin: 0, fontSize: '0.975rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                  Top Selling Roofing Products
                </h3>
                <p style={{ margin: '2px 0 0', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                  Highest volume metal roofing profiles and accessories
                </p>
              </div>
              <button
                onClick={() => navigate('/sales/pre-order-products')}
                style={{
                  background: 'none',
                  border: 'none',
                  color: 'var(--green)',
                  fontSize: '0.8rem',
                  fontWeight: 700,
                  cursor: 'pointer'
                }}
              >
                Catalog →
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {(!topProducts || topProducts.length === 0) ? (
                <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.8rem' }}>
                  No top selling product analytics recorded yet.
                </div>
              ) : (
                topProducts.map((p, idx) => {
                  const maxSold = Math.max(...topProducts.map(t => t.sold || 0), 1);
                  const progressPct = Math.max(((p.sold || 0) / maxSold) * 100, 5);

                  const rankBadges = ['🥇', '🥈', '🥉', '4th'];

                  return (
                    <div
                      key={idx}
                      style={{
                        padding: '0.9rem 1rem',
                        borderRadius: 12,
                        background: 'var(--bg-primary)',
                        border: '1px solid var(--border-light)',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: 8,
                        transition: 'all 0.15s ease'
                      }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                          <span style={{ fontSize: '0.9rem' }}>{rankBadges[idx] || `#${idx + 1}`}</span>
                          <span style={{ fontSize: '0.875rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                            {p.name}
                          </span>
                          <span style={{
                            fontSize: '0.7rem',
                            padding: '2px 6px',
                            borderRadius: 4,
                            background: 'rgba(0,0,0,0.04)',
                            color: 'var(--text-muted)',
                            fontWeight: 600
                          }}>
                            {p.type}
                          </span>
                        </div>

                        <div style={{ textAlign: 'right' }}>
                          <span style={{ fontSize: '0.875rem', fontWeight: 800, color: 'var(--green)', fontVariantNumeric: 'tabular-nums' }}>
                            {p.revenue}
                          </span>
                        </div>
                      </div>

                      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <div style={{
                          flex: 1,
                          height: 6,
                          borderRadius: 9999,
                          background: 'rgba(0,0,0,0.06)',
                          overflow: 'hidden'
                        }}>
                          <div style={{
                            height: '100%',
                            width: `${progressPct}%`,
                            borderRadius: 9999,
                            background: 'var(--green)'
                          }} />
                        </div>
                        <span style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--text-muted)', fontVariantNumeric: 'tabular-nums' }}>
                          {p.sold} units sold
                        </span>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          
          <div style={{
            background: 'var(--bg-secondary)',
            border: '1px solid var(--border-light)',
            borderRadius: 16,
            padding: '1.25rem',
            boxShadow: '0 2px 8px rgba(0,0,0,0.02)'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              
                <h3 style={{ margin: 0, fontSize: '0.975rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                  Warehouse Stock Health
                </h3>
              </div>
              <span style={{
                fontSize: '0.72rem',
                fontWeight: 700,
                padding: '3px 8px',
                borderRadius: 9999,
                background: inventorySummary.lowStock > 0 ? 'rgba(239,68,68,0.1)' : 'rgba(34,197,94,0.1)',
                color: inventorySummary.lowStock > 0 ? '#ef4444' : 'var(--green)',
                border: `1px solid ${inventorySummary.lowStock > 0 ? 'rgba(239,68,68,0.25)' : 'rgba(34,197,94,0.25)'}`
              }}>
                {inventorySummary.lowStock > 0 ? `${inventorySummary.lowStock} Low Stock` : 'All Stocks Healthy'}
              </span>
            </div>

            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(2, 1fr)',
              gap: 10,
              marginBottom: '1.25rem'
            }}>
              <div style={{
                padding: '0.9rem',
                borderRadius: 12,
                background: 'var(--bg-primary)',
                border: '1px solid var(--border-light)'
              }}>
                <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                  Total SKUs
                </span>
                <div style={{ fontSize: '1.35rem', fontWeight: 800, color: 'var(--text-primary)', marginTop: 2, fontVariantNumeric: 'tabular-nums' }}>
                  {inventorySummary.totalProducts || 0}
                </div>
              </div>

              <div style={{
                padding: '0.9rem',
                borderRadius: 12,
                background: 'var(--bg-primary)',
                border: '1px solid var(--border-light)'
              }}>
                <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                  Profile Types
                </span>
                <div style={{ fontSize: '1.35rem', fontWeight: 800, color: 'var(--text-primary)', marginTop: 2, fontVariantNumeric: 'tabular-nums' }}>
                  {inventorySummary.totalCategories || 0}
                </div>
              </div>

              <div style={{
                padding: '0.9rem',
                borderRadius: 12,
                background: 'var(--bg-primary)',
                border: '1px solid var(--border-light)'
              }}>
                <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                  Net Warehouse Units
                </span>
                <div style={{ fontSize: '1.35rem', fontWeight: 800, color: 'var(--text-primary)', marginTop: 2, fontVariantNumeric: 'tabular-nums' }}>
                  {inventorySummary.totalStock || 0}
                </div>
              </div>

              <div style={{
                padding: '0.9rem',
                borderRadius: 12,
                background: 'var(--bg-primary)',
                border: '1px solid var(--border-light)'
              }}>
                <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                  Out of Stock
                </span>
                <div style={{
                  fontSize: '1.35rem',
                  fontWeight: 800,
                  color: inventorySummary.outOfStock > 0 ? '#ef4444' : 'var(--text-primary)',
                  marginTop: 2,
                  fontVariantNumeric: 'tabular-nums'
                }}>
                  {inventorySummary.outOfStock || 0}
                </div>
              </div>
            </div>

            {lowStockProducts.length > 0 ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#ef4444' }}>
                  Items Requiring Reorder:
                </span>
                {lowStockProducts.map(p => (
                  <div
                    key={p.id}
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      padding: '8px 12px',
                      borderRadius: 10,
                      background: 'rgba(239, 68, 68, 0.04)',
                      border: '1px solid rgba(239, 68, 68, 0.18)'
                    }}
                  >
                    <div>
                      <div style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-primary)' }}>{p.name}</div>
                      <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>{p.category}</div>
                    </div>
                    <span style={{
                      fontSize: '0.72rem',
                      fontWeight: 700,
                      padding: '3px 8px',
                      borderRadius: 6,
                      background: p.stock === 0 ? 'rgba(239, 68, 68, 0.15)' : 'rgba(245, 158, 11, 0.15)',
                      color: p.stock === 0 ? '#ef4444' : '#f59e0b'
                    }}>
                      {p.stock === 0 ? 'Out of Stock' : `${p.stock} units left`}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: 12,
                padding: '1rem',
                borderRadius: 12,
                background: 'rgba(34, 197, 94, 0.05)',
                border: '1px solid rgba(34, 197, 94, 0.2)'
              }}>
                <CheckCircleIcon sx={{ fontSize: 24, color: 'var(--green)' }} />
                <div>
                  <div style={{ fontSize: '0.84rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                    Warehouse Buffer Stable
                  </div>
                  <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                    All products meet required sales inventory levels.
                  </div>
                </div>
              </div>
            )}
          </div>

          <div style={{
            background: 'var(--bg-secondary)',
            border: '1px solid var(--border-light)',
            borderRadius: 16,
            padding: '1.25rem',
            boxShadow: '0 2px 8px rgba(0,0,0,0.02)'
          }}>
            <h3 style={{ margin: '0 0 1rem', fontSize: '0.975rem', fontWeight: 700, color: 'var(--text-primary)' }}>
              Quick Operations Desk
            </h3>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              <div
                onClick={() => navigate('/sales/orders')}
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  padding: '10px 14px',
                  borderRadius: 12,
                  background: 'var(--bg-primary)',
                  border: '1px solid var(--border-light)',
                  cursor: 'pointer',
                  transition: 'all 0.18s ease'
                }}
                onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--green)'; }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border-light)'; }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  
                  <div>
                    <div style={{ fontSize: '0.825rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                      Process Pending Orders
                    </div>
                    <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
                      Approve quotations & dispatch
                    </div>
                  </div>
                </div>
                {counts.pending > 0 ? (
                  <span style={{
                    fontSize: '0.7rem',
                    fontWeight: 700,
                    background: 'rgba(245, 158, 11, 0.15)',
                    color: '#f59e0b',
                    padding: '2px 8px',
                    borderRadius: 9999
                  }}>
                    {counts.pending} pending
                  </span>
                ) : (
                  <ArrowForwardIcon sx={{ fontSize: 16, color: 'var(--text-muted)' }} />
                )}
              </div>

              <div
                onClick={() => navigate('/sales/customer-service')}
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  padding: '10px 14px',
                  borderRadius: 12,
                  background: 'var(--bg-primary)',
                  border: '1px solid var(--border-light)',
                  cursor: 'pointer',
                  transition: 'all 0.18s ease'
                }}
                onMouseEnter={e => { e.currentTarget.style.borderColor = '#8b5cf6'; }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border-light)'; }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  
                  <div>
                    <div style={{ fontSize: '0.825rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                      Customer Support Desk
                    </div>
                    <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
                      Live chat & inquiry resolutions
                    </div>
                  </div>
                </div>
                {customerService?.openInquiries > 0 ? (
                  <span style={{
                    fontSize: '0.7rem',
                    fontWeight: 700,
                    background: 'rgba(139, 92, 246, 0.15)',
                    color: '#8b5cf6',
                    padding: '2px 8px',
                    borderRadius: 9999
                  }}>
                    {customerService.openInquiries} open
                  </span>
                ) : (
                  <ArrowForwardIcon sx={{ fontSize: 16, color: 'var(--text-muted)' }} />
                )}
              </div>

              <div
                onClick={() => navigate('/sales/reviews')}
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  padding: '10px 14px',
                  borderRadius: 12,
                  background: 'var(--bg-primary)',
                  border: '1px solid var(--border-light)',
                  cursor: 'pointer',
                  transition: 'all 0.18s ease'
                }}
                onMouseEnter={e => { e.currentTarget.style.borderColor = '#eab308'; }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border-light)'; }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  
                  <div>
                    <div style={{ fontSize: '0.825rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                      Customer Reviews & Feedback
                    </div>
                    <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
                      Publish staff replies & macros
                    </div>
                  </div>
                </div>
                {customerService?.pendingReviews > 0 ? (
                  <span style={{
                    fontSize: '0.7rem',
                    fontWeight: 700,
                    background: 'rgba(234, 179, 8, 0.15)',
                    color: '#ca8a04',
                    padding: '2px 8px',
                    borderRadius: 9999
                  }}>
                    {customerService.pendingReviews} awaiting
                  </span>
                ) : (
                  <ArrowForwardIcon sx={{ fontSize: 16, color: 'var(--text-muted)' }} />
                )}
              </div>

              <div
                onClick={() => navigate('/sales/pre-order-products')}
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  padding: '10px 14px',
                  borderRadius: 12,
                  background: 'var(--bg-primary)',
                  border: '1px solid var(--border-light)',
                  cursor: 'pointer',
                  transition: 'all 0.18s ease'
                }}
                onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--green)'; }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border-light)'; }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  {/* <StorefrontIcon sx={{ fontSize: 18, color: 'var(--green)' }} /> */}
                  <div>
                    <div style={{ fontSize: '0.825rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                      Pre-Order Products
                    </div>
                    <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
                      Manage custom roofing profiles & pricing
                    </div>
                  </div>
                </div>
                <ArrowForwardIcon sx={{ fontSize: 16, color: 'var(--text-muted)' }} />
              </div>
            </div>
          </div>

        </div>
      </div>

      <style>{`
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(6px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </div>
  );
};

export default SalesDashboard;
