import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { io } from 'socket.io-client';
import { useNavigate } from 'react-router-dom';
import { useAuth, getStoredAuthToken } from '../../context/AuthContext';
import SalesQuotaTrackerWidget from '../../components/sales/SalesQuotaTrackerWidget';
import { CustomChevronRightIcon as ChevronRightIcon } from '../../components/icons';

const SalesTargetPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [salesQuota, setSalesQuota] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [lastSyncedAt, setLastSyncedAt] = useState(new Date());

  const API_URL = import.meta.env.VITE_API_URL || '';

  // Fetch the current target sales quota and progress from the backend API
  const fetchSalesQuota = useCallback(async () => {
    const token = getStoredAuthToken();
    if (!token) {
      setError('Your session has expired. Please sign in again to view the sales target.');
      setLoading(false);
      return;
    }

    try {
      setError(null);
      const response = await axios.get(`${API_URL}/api/sales/dashboard/quota`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (response.data?.success) {
        setSalesQuota(response.data.data ?? null);
        setLastSyncedAt(new Date());
      }
    } catch (err) {
      console.error('Failed to fetch business sales target:', err);
      setError(err.response?.data?.message || 'Failed to load the business sales target from the server.');
    } finally {
      setLoading(false);
    }
  }, [API_URL]);

  // Load quota data on page mount and refresh whenever the browser window regains focus
  useEffect(() => {
    fetchSalesQuota();

    const handleWindowFocus = () => {
      fetchSalesQuota();
    };
    window.addEventListener('focus', handleWindowFocus);

    return () => {
      window.removeEventListener('focus', handleWindowFocus);
    };
  }, [fetchSalesQuota]);

  // Listen for real-time sales quota updates broadcast by the Business Owner
  useEffect(() => {
    const socket = io(API_URL, {
      auth: { user }
    });

    socket.on('sales_quota_updated', (payload) => {
      if (payload?.quota) {
        setSalesQuota(payload.quota);
        setLastSyncedAt(new Date());
        setError(null);
      }
    });

    return () => {
      socket.disconnect();
    };
  }, [API_URL, user?.id]);

  const handleNavigateToOrders = () => {
    navigate('/sales/orders');
  };

  const handleRetryFetchSalesQuota = () => {
    setLoading(true);
    fetchSalesQuota();
  };

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '1.5rem',
        animation: 'fadeInUp 0.25s ease-out',
        maxWidth: 1400,
        margin: '0 auto',
        width: '100%',
        paddingBottom: '3rem'
      }}
    >
      {/* Page breadcrumb, heading, and quick link to the Orders hub */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '1rem'
        }}
      >
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
            <span
              style={{
                fontSize: '0.74rem',
                color: 'var(--text-muted)',
                fontWeight: 600,
                textTransform: 'uppercase',
                letterSpacing: '0.04em'
              }}
            >
              Sales Operations
            </span>
            <ChevronRightIcon sx={{ fontSize: 13, color: 'var(--text-muted)' }} />
            <span
              style={{
                fontSize: '0.74rem',
                color: 'var(--green)',
                fontWeight: 700,
                textTransform: 'uppercase',
                letterSpacing: '0.04em'
              }}
            >
              Business Sales Target
            </span>
          </div>

          <h1
            style={{
              margin: 0,
              fontSize: '1.75rem',
              fontWeight: 800,
              color: 'var(--text-primary)',
              letterSpacing: '-0.025em'
            }}
          >
            Business Sales Target
          </h1>
          <p style={{ margin: '4px 0 0', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
            Track real-time sales progress, order volume, and directives from the Business Owner.
            {' • '}
            Synced {lastSyncedAt.toLocaleTimeString('en-PH', { hour: '2-digit', minute: '2-digit' })}
          </p>
        </div>

        <button
          type="button"
          onClick={handleNavigateToOrders}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 6,
            padding: '8px 16px',
            borderRadius: 10,
            background: 'var(--bg-primary)',
            border: '1px solid var(--border-light)',
            color: 'var(--text-primary)',
            fontSize: '0.8rem',
            fontWeight: 700,
            cursor: 'pointer',
            transition: 'all 0.18s ease'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.borderColor = 'var(--green)';
            e.currentTarget.style.color = 'var(--green)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.borderColor = 'var(--border-light)';
            e.currentTarget.style.color = 'var(--text-primary)';
          }}
        >
          <span>Manage Customer Orders</span>
          <ChevronRightIcon sx={{ fontSize: 16 }} />
        </button>
      </div>

      {/* Loading indicator while fetching the business sales target */}
      {loading ? (
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center',
            minHeight: '40vh',
            gap: 14,
            background: 'var(--bg-secondary)',
            border: '1px solid var(--border-light)',
            borderRadius: 16
          }}
        >
          <div
            style={{
              width: 40,
              height: 40,
              borderRadius: '50%',
              border: '3px solid var(--border-light)',
              borderTopColor: 'var(--green)',
              animation: 'spin 0.8s linear infinite'
            }}
          />
          <span style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-muted)' }}>
            Loading Business Sales Target...
          </span>
          <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
        </div>
      ) : error ? (
        /* Alert banner when loading the sales target from the server fails */
        <div
          style={{
            padding: '1.25rem 1.5rem',
            background: 'rgba(239, 68, 68, 0.08)',
            border: '1px solid rgba(239, 68, 68, 0.3)',
            borderRadius: 14,
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: 12
          }}
        >
          <div style={{ color: '#ef4444', fontSize: '0.875rem', fontWeight: 600 }}>
            {error}
          </div>
          <button
            type="button"
            onClick={handleRetryFetchSalesQuota}
            style={{
              padding: '0.5rem 1rem',
              borderRadius: 8,
              border: '1px solid rgba(239, 68, 68, 0.45)',
              background: 'rgba(239, 68, 68, 0.14)',
              color: '#ef4444',
              fontSize: '0.8rem',
              fontWeight: 700,
              cursor: 'pointer'
            }}
          >
            Retry Loading Sales Target
          </button>
        </div>
      ) : (
        /* Display the full sales quota tracker widget sent by the Business Owner */
        <SalesQuotaTrackerWidget salesQuota={salesQuota} />
      )}
    </div>
  );
};

export default SalesTargetPage;
