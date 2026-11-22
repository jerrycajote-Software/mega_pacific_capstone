import React, { useState, useEffect } from 'react';
import CircularProgress from '@mui/material/CircularProgress';
import { fetchAdminDeletionRequestDetail } from '../../services/accountDeletionApi';

const formatCurrencyPhp = (amount) =>
  `₱${Number(amount || 0).toLocaleString('en-PH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

const formatDateTime = (value) => {
  if (!value) return 'N/A';
  return new Date(value).toLocaleString('en-PH', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit'
  });
};

const DeletionRequestReviewModal = ({
  requestId,
  initialRequest,
  processingAction,
  actionError,
  onCloseModal,
  onApproveDeletionRequest,
  onRejectDeletionRequest
}) => {
  const [detail, setDetail] = useState(initialRequest || null);
  const [loadingDetail, setLoadingDetail] = useState(true);
  const [loadError, setLoadError] = useState('');
  const [adminNotes, setAdminNotes] = useState('');
  const [notesError, setNotesError] = useState('');

  useEffect(() => {
    if (!requestId) return;
    let cancelled = false;
    setLoadingDetail(true);
    setLoadError('');
    setAdminNotes(initialRequest?.adminNotes || '');
    setNotesError('');

    const loadFreshDetail = async () => {
      try {
        const res = await fetchAdminDeletionRequestDetail(requestId);
        if (!cancelled && res?.success) {
          setDetail(res.data);
        }
      } catch (err) {
        if (!cancelled) {
          setLoadError(err.response?.data?.message || 'Unable to refresh live order and refund checks.');
        }
      } finally {
        if (!cancelled) setLoadingDetail(false);
      }
    };

    loadFreshDetail();
    return () => {
      cancelled = true;
    };
  }, [requestId, initialRequest]);

  if (!requestId) return null;

  const current = detail || initialRequest;
  const eligibility = current?.eligibility || null;
  const ongoingOrders = eligibility?.ongoingOrders ?? [];
  const pendingRefunds = eligibility?.pendingRefunds ?? [];
  const isPending = current?.status === 'pending';
  const canApprove = Boolean(isPending && eligibility?.eligible && !loadingDetail && !processingAction);

  const handleClickRejectRequest = () => {
    if (!adminNotes.trim()) {
      setNotesError('Please write a short reason explaining why this deletion request is being rejected.');
      return;
    }
    setNotesError('');
    onRejectDeletionRequest?.(current.id, adminNotes.trim());
  };

  const handleClickApproveRequest = () => {
    setNotesError('');
    onApproveDeletionRequest?.(current.id, adminNotes.trim());
  };

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 1200,
        background: 'rgba(0,0,0,0.78)',
        backdropFilter: 'blur(4px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '1.25rem'
      }}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="deletion-review-modal-title"
        style={{
          background: 'var(--bg-secondary)',
          border: '1px solid var(--border-light)',
          borderRadius: 18,
          width: '100%',
          maxWidth: 620,
          maxHeight: '90vh',
          overflowY: 'auto',
          boxShadow: '0 24px 60px rgba(0,0,0,0.55)',
          position: 'relative'
        }}
      >
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'flex-start',
            padding: '1.4rem 1.6rem',
            borderBottom: '1px solid var(--border-light)'
          }}
        >
          <div>
            <h3 id="deletion-review-modal-title" style={{ margin: 0, fontSize: '1.15rem', fontWeight: 800, color: 'var(--text-primary)' }}>
              Review Account Deletion Request
            </h3>
            <p style={{ margin: '4px 0 0', fontSize: '0.82rem', color: 'var(--text-muted)' }}>
              Verify that the customer has no ongoing orders or unreturned refunds before approving deletion.
            </p>
          </div>
          <button
            type="button"
            aria-label="Close review modal"
            disabled={Boolean(processingAction)}
            onClick={onCloseModal}
            style={{
              background: 'transparent',
              border: '1px solid var(--border-light)',
              color: 'var(--text-muted)',
              width: 34,
              height: 34,
              borderRadius: 10,
              cursor: processingAction ? 'not-allowed' : 'pointer',
              fontWeight: 700,
              fontSize: '0.95rem',
              flexShrink: 0
            }}
          >
            ✕
          </button>
        </div>

        <div style={{ padding: '1.4rem 1.6rem', display: 'flex', flexDirection: 'column', gap: '1.15rem' }}>
          <div
            style={{
              background: 'var(--bg-primary)',
              border: '1px solid var(--border-light)',
              borderRadius: 12,
              padding: '1rem 1.15rem',
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(210px, 1fr))',
              gap: '0.85rem'
            }}
          >
            <div>
              <div style={{ fontSize: '0.7rem', textTransform: 'uppercase', color: 'var(--text-muted)', fontWeight: 700 }}>Customer Name</div>
              <div style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--text-primary)', marginTop: 2 }}>{current?.customerName || 'Unknown'}</div>
            </div>
            <div>
              <div style={{ fontSize: '0.7rem', textTransform: 'uppercase', color: 'var(--text-muted)', fontWeight: 700 }}>Email Address</div>
              <div style={{ fontSize: '0.84rem', fontFamily: 'monospace', color: 'var(--text-primary)', marginTop: 2 }}>{current?.customerEmail || 'N/A'}</div>
            </div>
            <div>
              <div style={{ fontSize: '0.7rem', textTransform: 'uppercase', color: 'var(--text-muted)', fontWeight: 700 }}>Requested On</div>
              <div style={{ fontSize: '0.82rem', color: 'var(--text-primary)', marginTop: 2 }}>{formatDateTime(current?.createdAt)}</div>
            </div>
            <div>
              <div style={{ fontSize: '0.7rem', textTransform: 'uppercase', color: 'var(--text-muted)', fontWeight: 700 }}>Request Status</div>
              <div style={{ fontSize: '0.82rem', fontWeight: 700, textTransform: 'capitalize', color: 'var(--text-primary)', marginTop: 2 }}>{current?.status || 'pending'}</div>
            </div>
          </div>

          <div style={{ background: 'var(--bg-primary)', border: '1px solid var(--border-light)', borderRadius: 12, padding: '0.95rem 1.15rem' }}>
            <div style={{ fontSize: '0.72rem', textTransform: 'uppercase', color: 'var(--text-muted)', fontWeight: 700 }}>
              Customer Reason
            </div>
            <div style={{ fontSize: '0.85rem', color: 'var(--text-primary)', marginTop: 4, lineHeight: 1.5 }}>
              {current?.reason || 'No reason provided by the customer.'}
            </div>
          </div>

          <div
            style={{
              borderRadius: 12,
              padding: '1rem 1.15rem',
              border: `1px solid ${loadingDetail ? 'var(--border-light)' : eligibility?.eligible ? 'rgba(34,197,94,0.35)' : 'rgba(239,68,68,0.4)'}`,
              background: loadingDetail ? 'var(--bg-primary)' : eligibility?.eligible ? 'rgba(34,197,94,0.08)' : 'rgba(239,68,68,0.08)'
            }}
          >
            <div style={{ fontSize: '0.78rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: 6 }}>
              Live Order &amp; Refund Eligibility Check
            </div>

            {loadingDetail ? (
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: '0.82rem', color: 'var(--text-muted)' }}>
                <CircularProgress size={16} />
                <span>Checking ongoing orders and pending refunds...</span>
              </div>
            ) : loadError ? (
              <div style={{ fontSize: '0.82rem', color: '#ef4444' }}>{loadError}</div>
            ) : eligibility?.eligible ? (
              <div style={{ fontSize: '0.84rem', color: '#16a34a', fontWeight: 600 }}>
                No ongoing orders and no unreturned refunds found. This account meets all requirements for deletion.
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                <div style={{ fontSize: '0.83rem', color: '#ef4444', fontWeight: 700 }}>
                  {eligibility?.blockerMessage || 'This account still has active orders or unreturned refunds.'}
                </div>

                {ongoingOrders.length > 0 && (
                  <div>
                    <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: 4 }}>
                      Ongoing Orders ({ongoingOrders.length})
                    </div>
                    {ongoingOrders.map((ord) => (
                      <div key={ord.orderId} style={{ fontSize: '0.8rem', color: 'var(--text-muted)', display: 'flex', justifyContent: 'space-between', padding: '3px 0' }}>
                        <span>{ord.orderNumber} ({formatCurrencyPhp(ord.total)})</span>
                        <strong style={{ color: '#f59e0b' }}>{ord.statusLabel}</strong>
                      </div>
                    ))}
                  </div>
                )}

                {pendingRefunds.length > 0 && (
                  <div>
                    <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: 4 }}>
                      Ongoing Refunds Not Yet Returned ({pendingRefunds.length})
                    </div>
                    {pendingRefunds.map((ref) => (
                      <div key={`${ref.orderId}-${ref.refundId || 'ref'}`} style={{ fontSize: '0.8rem', color: 'var(--text-muted)', display: 'flex', justifyContent: 'space-between', padding: '3px 0' }}>
                        <span>{ref.refundNumber ? `${ref.refundNumber} — ` : ''}{ref.orderNumber} ({formatCurrencyPhp(ref.amount)})</span>
                        <strong style={{ color: '#ef4444' }}>{ref.statusLabel}</strong>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>

          {actionError && (
            <div style={{ padding: '0.75rem 1rem', borderRadius: 10, background: 'rgba(239,68,68,0.12)', border: '1px solid rgba(239,68,68,0.35)', color: '#ef4444', fontSize: '0.83rem', fontWeight: 600 }}>
              {actionError}
            </div>
          )}

          {isPending ? (
            <div>
              <label htmlFor="admin-deletion-notes" style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: 6 }}>
                Administrator Notes (Required when rejecting)
              </label>
              <textarea
                id="admin-deletion-notes"
                rows={3}
                value={adminNotes}
                onChange={(e) => {
                  setAdminNotes(e.target.value);
                  if (notesError) setNotesError('');
                }}
                placeholder="ex. Approved after verifying all orders and refunds are completed, or explain why the request is rejected"
                disabled={Boolean(processingAction)}
                style={{
                  width: '100%',
                  background: 'var(--bg-primary)',
                  border: `1px solid ${notesError ? '#ef4444' : 'var(--border-light)'}`,
                  borderRadius: 10,
                  padding: '0.75rem',
                  color: 'var(--text-primary)',
                  fontSize: '0.84rem',
                  resize: 'vertical',
                  boxSizing: 'border-box'
                }}
              />
              {notesError && (
                <div style={{ color: '#ef4444', fontSize: '0.76rem', marginTop: 4, fontWeight: 600 }}>
                  {notesError}
                </div>
              )}
            </div>
          ) : (
            <div style={{ background: 'var(--bg-primary)', border: '1px solid var(--border-light)', borderRadius: 12, padding: '0.95rem 1.15rem' }}>
              <div style={{ fontSize: '0.72rem', textTransform: 'uppercase', color: 'var(--text-muted)', fontWeight: 700 }}>
                Review Decision Details
              </div>
              <div style={{ fontSize: '0.83rem', color: 'var(--text-primary)', marginTop: 4 }}>
                Reviewed by <strong>{current?.reviewedByName || 'Administrator'}</strong> on {formatDateTime(current?.reviewedAt || current?.cancelledAt)}
              </div>
              {current?.adminNotes && (
                <div style={{ fontSize: '0.83rem', color: 'var(--text-muted)', marginTop: 6 }}>
                  Note: {current.adminNotes}
                </div>
              )}
            </div>
          )}
        </div>

        {isPending && (
          <div
            style={{
              display: 'flex',
              justifyContent: 'flex-end',
              gap: 10,
              flexWrap: 'wrap',
              padding: '1.1rem 1.6rem',
              borderTop: '1px solid var(--border-light)'
            }}
          >
            <button
              type="button"
              disabled={Boolean(processingAction)}
              onClick={handleClickRejectRequest}
              style={{
                padding: '0.65rem 1.25rem',
                borderRadius: 10,
                border: '1px solid rgba(245,158,11,0.45)',
                background: 'rgba(245,158,11,0.1)',
                color: '#d97706',
                fontSize: '0.83rem',
                fontWeight: 700,
                cursor: processingAction ? 'not-allowed' : 'pointer'
              }}
            >
              {processingAction === 'reject' ? 'Rejecting...' : 'Reject Deletion Request'}
            </button>

            <button
              type="button"
              disabled={!canApprove}
              onClick={handleClickApproveRequest}
              style={{
                padding: '0.65rem 1.35rem',
                borderRadius: 10,
                border: 'none',
                background: canApprove ? '#dc2626' : 'rgba(148,163,184,0.35)',
                color: '#ffffff',
                fontSize: '0.83rem',
                fontWeight: 700,
                cursor: canApprove ? 'pointer' : 'not-allowed',
                opacity: canApprove ? 1 : 0.65
              }}
            >
              {processingAction === 'approve' ? 'Approving...' : 'Approve Account Deletion'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default DeletionRequestReviewModal;
