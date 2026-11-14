import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import CircularProgress from '@mui/material/CircularProgress';
import { getStoredAuthToken } from '../../context/AuthContext';
import { CustomChevronRightIcon as ChevronRightIcon } from '../../components/icons';
import OwnerSalesQuotaWidget from '../../components/owner/OwnerSalesQuotaWidget';

const API_URL = import.meta.env.VITE_API_URL || '';

// Page for the Owner to set the business sales quota target and track sales progress
const OwnerSalesQuotaPage = () => {
  const [salesQuota, setSalesQuota] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [quotaFeedback, setQuotaFeedback] = useState(null);
  const feedbackTimerRef = useRef(null);

  // Fetch the current sales quota target and progress from the backend API
  const fetchOwnerSalesQuota = useCallback(async (showSpinner = false) => {
    try {
      if (showSpinner) {
        setLoading(true);
      }
      setError(null);

      const token = getStoredAuthToken();
      if (!token) {
        setError('Your owner session could not be verified. Please sign in again.');
        return;
      }

      const res = await axios.get(`${API_URL}/api/owner/sales-quota`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (res.data?.success) {
        setSalesQuota(res.data?.data ?? null);
      } else {
        setError(res.data?.message || 'Unable to load Business Sales Quota details.');
      }
    } catch (err) {
      console.error('Hindi nakuha ang datos ng Owner sales quota:', err);
      setError(err.response?.data?.message || 'Failed to load Business Sales Quota data. Please try again.');
    } finally {
      setLoading(false);
    }
  }, []);

  // Fetch quota data on mount and refresh whenever the browser window regains focus
  useEffect(() => {
    fetchOwnerSalesQuota(true);

    const handleWindowFocus = () => {
      // Skip background refreshes while the edit modal is open so unsaved inputs stay intact
      if (document.querySelector('[role="dialog"]')) return;
      fetchOwnerSalesQuota(false);
    };

    window.addEventListener('focus', handleWindowFocus);
    return () => {
      window.removeEventListener('focus', handleWindowFocus);
      if (feedbackTimerRef.current) {
        clearTimeout(feedbackTimerRef.current);
      }
    };
  }, [fetchOwnerSalesQuota]);

  // Retry loading the sales quota after a fetch error
  const handleRetryFetchOwnerQuota = () => {
    fetchOwnerSalesQuota(true);
  };

  // Update the displayed sales quota and show a temporary confirmation banner
  const handleSalesQuotaUpdated = (updatedQuota) => {
    if (updatedQuota) {
      setSalesQuota(updatedQuota);
    }
    setQuotaFeedback('Sales quota target has been saved and sent to your Sales team.');

    if (feedbackTimerRef.current) {
      clearTimeout(feedbackTimerRef.current);
    }
    feedbackTimerRef.current = setTimeout(() => {
      setQuotaFeedback(null);
    }, 5000);
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
      {/* Breadcrumb and page header for Business Sales Quota */}
      <div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
          <Link
            to="/owner/dashboard"
            style={{
              fontSize: '0.74rem',
              color: 'var(--text-muted)',
              fontWeight: 600,
              textTransform: 'uppercase',
              letterSpacing: '0.04em',
              textDecoration: 'none'
            }}
          >
            Business Overview
          </Link>
          <ChevronRightIcon sx={{ fontSize: 13, color: 'var(--text-muted)' }} />
          <span
            style={{
              fontSize: '0.74rem',
              color: '#d97706',
              fontWeight: 700,
              textTransform: 'uppercase',
              letterSpacing: '0.04em'
            }}
          >
            Business Sales Quota
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
          Business Sales Quota
        </h1>
        <p style={{ margin: '4px 0 0', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
          Set target sales for your Sales team and monitor real-time achievement.
        </p>
      </div>

      {/* Confirmation banner shown after sending a new quota target to the Sales team */}
      {quotaFeedback && (
        <div
          style={{
            padding: '0.9rem 1.15rem',
            background: 'rgba(16, 185, 129, 0.12)',
            border: '1px solid rgba(16, 185, 129, 0.35)',
            color: 'var(--green)',
            borderRadius: 10,
            fontSize: '0.85rem',
            fontWeight: 600
          }}
        >
          {quotaFeedback}
        </div>
      )}

      {/* Loading indicator while fetching the current sales quota details */}
      {loading ? (
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center',
            minHeight: '38vh',
            gap: 14,
            background: 'var(--bg-secondary)',
            border: '1px solid var(--border-light)',
            borderRadius: 16
          }}
        >
          <CircularProgress size={36} sx={{ color: '#f59e0b' }} />
          <span style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-muted)' }}>
            Loading Business Sales Quota...
          </span>
        </div>
      ) : error ? (
        /* Error alert shown when the quota request fails, with a retry action button */
        <div
          style={{
            padding: '1.25rem',
            background: 'rgba(239, 68, 68, 0.08)',
            border: '1px solid rgba(239, 68, 68, 0.35)',
            color: '#ef4444',
            borderRadius: 12,
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: '1rem'
          }}
        >
          <span style={{ fontSize: '0.875rem', fontWeight: 600 }}>{error}</span>
          <button
            type="button"
            onClick={handleRetryFetchOwnerQuota}
            style={{
              padding: '8px 16px',
              borderRadius: 8,
              border: '1px solid rgba(239, 68, 68, 0.45)',
              background: 'rgba(239, 68, 68, 0.12)',
              color: '#ef4444',
              fontSize: '0.8rem',
              fontWeight: 700,
              cursor: 'pointer'
            }}
          >
            Reload Business Sales Quota
          </button>
        </div>
      ) : salesQuota ? (
        /* Main widget for setting the business quota and tracking real-time sales progress */
        <OwnerSalesQuotaWidget
          salesQuota={salesQuota}
          onQuotaUpdated={handleSalesQuotaUpdated}
        />
      ) : (
        /* Empty state message shown when no quota record was returned */
        <div
          style={{
            padding: '2rem',
            textAlign: 'center',
            background: 'var(--bg-secondary)',
            border: '1px solid var(--border-light)',
            borderRadius: 16,
            color: 'var(--text-muted)',
            fontSize: '0.9rem'
          }}
        >
          No Business Sales Quota record is currently available. Please refresh to load your quota settings.
        </div>
      )}
    </div>
  );
};

export default OwnerSalesQuotaPage;
