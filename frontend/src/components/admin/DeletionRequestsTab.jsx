import React, { useState, useEffect, useCallback } from 'react';
import CircularProgress from '@mui/material/CircularProgress';
import {
  CustomSearchIcon as SearchIcon,
  CustomChevronRightIcon as ChevronRightIcon
} from '../icons';
import DeletionRequestReviewModal from './DeletionRequestReviewModal';
import {
  fetchAdminDeletionRequests,
  approveAdminDeletionRequest,
  rejectAdminDeletionRequest
} from '../../services/accountDeletionApi';

const thStyle = {
  padding: '0.875rem 1.25rem',
  fontSize: '0.72rem',
  fontWeight: 600,
  letterSpacing: '0.06em',
  textTransform: 'uppercase',
  color: 'var(--text-muted)',
  background: 'rgba(255,255,255,0.02)',
  borderBottom: '1px solid var(--border-light)',
  whiteSpace: 'nowrap'
};

const tdStyle = {
  padding: '0.95rem 1.25rem',
  fontSize: '0.85rem',
  color: 'var(--text-primary)',
  borderBottom: '1px solid var(--border-light)'
};

const statusBadgeStyles = {
  pending: { label: 'Pending Review', color: '#d97706', bg: 'rgba(245,158,11,0.14)' },
  approved: { label: 'Approved & Deleted', color: '#dc2626', bg: 'rgba(239,68,68,0.14)' },
  rejected: { label: 'Rejected', color: '#64748b', bg: 'rgba(100,116,139,0.16)' },
  cancelled: { label: 'Cancelled by Customer', color: '#64748b', bg: 'rgba(100,116,139,0.14)' }
};

const DeletionRequestsTab = ({ onRequestsChanged }) => {
  const [requests, setRequests] = useState([]);
  const [summary, setSummary] = useState({ pending: 0, approved: 0, rejected: 0, cancelled: 0, total: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [statusFilter, setStatusFilter] = useState('pending');
  const [searchTerm, setSearchTerm] = useState('');

  const [selectedRequest, setSelectedRequest] = useState(null);
  const [processingAction, setProcessingAction] = useState('');
  const [actionError, setActionError] = useState('');
  const [feedbackMessage, setFeedbackMessage] = useState('');

  const loadDeletionRequests = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const res = await fetchAdminDeletionRequests({
        status: statusFilter,
        search: searchTerm
      });
      if (res?.success) {
        setRequests(res.data ?? []);
        if (res.summary) setSummary(res.summary);
      } else {
        setError(res?.message || 'Unable to load account deletion requests.');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load account deletion requests.');
    } finally {
      setLoading(false);
    }
  }, [statusFilter, searchTerm]);

  useEffect(() => {
    loadDeletionRequests();
  }, [loadDeletionRequests]);

  const handleOpenReviewModal = (reqItem) => {
    setActionError('');
    setSelectedRequest(reqItem);
  };

  const handleCloseReviewModal = () => {
    if (processingAction) return;
    setSelectedRequest(null);
    setActionError('');
  };

  const handleApproveAccountDeletion = async (requestId, adminNotes) => {
    setProcessingAction('approve');
    setActionError('');
    try {
      const res = await approveAdminDeletionRequest(requestId, { adminNotes });
      if (res?.success) {
        setSelectedRequest(null);
        setFeedbackMessage(res.message || 'Account deletion approved successfully.');
        await loadDeletionRequests();
        onRequestsChanged?.();
      }
    } catch (err) {
      setActionError(err.response?.data?.message || 'Unable to approve this account deletion request.');
    } finally {
      setProcessingAction('');
    }
  };

  const handleRejectAccountDeletion = async (requestId, adminNotes) => {
    setProcessingAction('reject');
    setActionError('');
    try {
      const res = await rejectAdminDeletionRequest(requestId, { adminNotes });
      if (res?.success) {
        setSelectedRequest(null);
        setFeedbackMessage(res.message || 'Account deletion request rejected.');
        await loadDeletionRequests();
        onRequestsChanged?.();
      }
    } catch (err) {
      setActionError(err.response?.data?.message || 'Unable to reject this account deletion request.');
    } finally {
      setProcessingAction('');
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
      {feedbackMessage && (
        <div
          style={{
            padding: '0.85rem 1.15rem',
            borderRadius: 12,
            background: 'rgba(22,163,74,0.12)',
            border: '1px solid rgba(22,163,74,0.3)',
            color: '#16a34a',
            fontSize: '0.85rem',
            fontWeight: 700,
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            gap: 12
          }}
        >
          <span>{feedbackMessage}</span>
          <button
            type="button"
            aria-label="Dismiss notification"
            onClick={() => setFeedbackMessage('')}
            style={{ background: 'transparent', border: 'none', color: 'inherit', cursor: 'pointer', fontWeight: 800 }}
          >
            ✕
          </button>
        </div>
      )}

      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          background: 'var(--bg-secondary)',
          padding: '0.875rem 1.25rem',
          borderRadius: 14,
          border: '1px solid var(--border-light)',
          flexWrap: 'wrap',
          gap: 12
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, flex: 1, minWidth: 260, flexWrap: 'wrap' }}>
          <div style={{ position: 'relative', flex: 1, minWidth: 220, maxWidth: 380 }}>
            <SearchIcon sx={{ fontSize: 18, color: 'var(--text-muted)', position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)' }} />
            <input
              type="text"
              placeholder="Search by customer name, email, or reason..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{
                width: '100%',
                background: 'var(--bg-primary)',
                border: '1px solid var(--border-light)',
                padding: '9px 12px 9px 38px',
                borderRadius: 10,
                color: 'var(--text-primary)',
                fontSize: '0.84rem',
                outline: 'none',
                boxSizing: 'border-box'
              }}
            />
          </div>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            style={{
              background: 'var(--bg-primary)',
              border: '1px solid var(--border-light)',
              padding: '9px 14px',
              borderRadius: 10,
              color: 'var(--text-primary)',
              fontSize: '0.82rem',
              fontWeight: 600,
              cursor: 'pointer'
            }}
          >
            <option value="pending">Pending Review ({summary.pending})</option>
            <option value="all">All Requests ({summary.total})</option>
            <option value="approved">Approved ({summary.approved})</option>
            <option value="rejected">Rejected ({summary.rejected})</option>
            <option value="cancelled">Cancelled ({summary.cancelled})</option>
          </select>
        </div>

        <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
          Showing <strong>{requests.length}</strong> deletion {requests.length === 1 ? 'request' : 'requests'}
        </div>
      </div>

      <div
        style={{
          background: 'var(--bg-secondary)',
          borderRadius: 16,
          border: '1px solid var(--border-light)',
          overflow: 'hidden',
          boxShadow: '0 4px 20px -8px rgba(0,0,0,0.1)'
        }}
      >
        {loading ? (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '3.5rem', gap: 12 }}>
            <CircularProgress size={32} sx={{ color: '#4f772d' }} />
            <span style={{ fontSize: '0.84rem', color: 'var(--text-muted)' }}>Loading deletion requests...</span>
          </div>
        ) : error ? (
          <div style={{ padding: '2rem', textAlign: 'center', color: '#ef4444', fontSize: '0.88rem' }}>
            <div>{error}</div>
            <button
              type="button"
              onClick={loadDeletionRequests}
              style={{
                marginTop: 12,
                padding: '7px 16px',
                borderRadius: 8,
                border: '1px solid var(--border-light)',
                background: 'var(--bg-primary)',
                color: 'var(--text-primary)',
                fontWeight: 700,
                cursor: 'pointer'
              }}
            >
              Retry Loading
            </button>
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
              <thead>
                <tr>
                  <th style={{ ...thStyle, minWidth: 210 }}>Customer</th>
                  <th style={{ ...thStyle, minWidth: 200 }}>Reason</th>
                  <th style={{ ...thStyle, minWidth: 190 }}>Order &amp; Refund Check</th>
                  <th style={{ ...thStyle, minWidth: 140 }}>Status</th>
                  <th style={{ ...thStyle, minWidth: 130 }}>Requested Date</th>
                  <th style={{ ...thStyle, minWidth: 130, textAlign: 'right' }}>Action</th>
                </tr>
              </thead>
              <tbody>
                {requests.length === 0 ? (
                  <tr>
                    <td colSpan="6" style={{ padding: '3.25rem', textAlign: 'center', color: 'var(--text-muted)' }}>
                      No account deletion requests found for this filter.
                    </td>
                  </tr>
                ) : (
                  requests.map((item) => {
                    const badge = statusBadgeStyles[item.status] || statusBadgeStyles.pending;
                    const isPending = item.status === 'pending';
                    const eligibility = item.eligibility;
                    const ongoingCount = eligibility?.ongoingOrdersCount || 0;
                    const refundCount = eligibility?.pendingRefundsCount || 0;

                    return (
                      <tr key={item.id}>
                        <td style={tdStyle}>
                          <div style={{ fontWeight: 700, color: 'var(--text-primary)' }}>{item.customerName || 'Customer'}</div>
                          <div style={{ fontSize: '0.76rem', fontFamily: 'monospace', color: 'var(--text-muted)', marginTop: 2 }}>
                            {item.customerEmail || 'N/A'}
                          </div>
                        </td>
                        <td style={{ ...tdStyle, maxWidth: 240 }}>
                          <div style={{ fontSize: '0.82rem', color: item.reason ? 'var(--text-primary)' : 'var(--text-muted)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                            {item.reason || 'No reason provided'}
                          </div>
                        </td>
                        <td style={tdStyle}>
                          {isPending && eligibility ? (
                            eligibility.eligible ? (
                              <span style={{ padding: '4px 9px', borderRadius: 6, background: 'rgba(34,197,94,0.12)', color: '#16a34a', fontSize: '0.74rem', fontWeight: 700 }}>
                                Ready to Approve
                              </span>
                            ) : (
                              <span style={{ padding: '4px 9px', borderRadius: 6, background: 'rgba(239,68,68,0.12)', color: '#ef4444', fontSize: '0.74rem', fontWeight: 700 }}>
                                Blocked ({ongoingCount} order{ongoingCount === 1 ? '' : 's'}, {refundCount} refund{refundCount === 1 ? '' : 's'})
                              </span>
                            )
                          ) : (
                            <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>Completed</span>
                          )}
                        </td>
                        <td style={tdStyle}>
                          <span style={{ padding: '4px 9px', borderRadius: 6, background: badge.bg, color: badge.color, fontSize: '0.74rem', fontWeight: 700 }}>
                            {badge.label}
                          </span>
                        </td>
                        <td style={{ ...tdStyle, fontSize: '0.8rem', color: 'var(--text-muted)', whiteSpace: 'nowrap' }}>
                          {item.createdAt ? new Date(item.createdAt).toLocaleDateString('en-PH', { month: 'short', day: 'numeric', year: 'numeric' }) : 'N/A'}
                        </td>
                        <td style={{ ...tdStyle, textAlign: 'right' }}>
                          <button
                            type="button"
                            onClick={() => handleOpenReviewModal(item)}
                            style={{
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: 4,
                              padding: '6px 12px',
                              borderRadius: 8,
                              border: '1px solid var(--border-light)',
                              background: isPending ? 'rgba(30,58,138,0.14)' : 'var(--bg-primary)',
                              color: isPending ? '#60a5fa' : 'var(--text-primary)',
                              fontSize: '0.78rem',
                              fontWeight: 700,
                              cursor: 'pointer'
                            }}
                          >
                            <span>{isPending ? 'Review Request' : 'View Decision'}</span>
                            <ChevronRightIcon sx={{ fontSize: 15 }} />
                          </button>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <DeletionRequestReviewModal
        requestId={selectedRequest?.id || null}
        initialRequest={selectedRequest}
        processingAction={processingAction}
        actionError={actionError}
        onCloseModal={handleCloseReviewModal}
        onApproveDeletionRequest={handleApproveAccountDeletion}
        onRejectDeletionRequest={handleRejectAccountDeletion}
      />
    </div>
  );
};

export default DeletionRequestsTab;
