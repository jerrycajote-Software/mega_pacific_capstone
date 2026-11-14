import React, { useState } from 'react';
import OwnerSalesQuotaModal from './OwnerSalesQuotaModal';
import { useAdminTheme } from '../../context/ThemeContext';

// Return colors for the quota status pill and progress bar based on achievement progress
const getQuotaStatusStyle = (statusLabel) => {
  switch (statusLabel) {
    case 'Target Reached':
      return { color: '#10b981', bg: 'rgba(16, 185, 129, 0.14)', border: 'rgba(16, 185, 129, 0.35)', bar: '#10b981' };
    case 'On Track':
      return { color: '#0284c7', bg: 'rgba(14, 165, 233, 0.14)', border: 'rgba(14, 165, 233, 0.35)', bar: '#0ea5e9' };
    case 'In Progress':
      return { color: '#d97706', bg: 'rgba(245, 158, 11, 0.14)', border: 'rgba(245, 158, 11, 0.35)', bar: '#f59e0b' };
    default:
      return { color: '#e11d48', bg: 'rgba(244, 63, 94, 0.14)', border: 'rgba(244, 63, 94, 0.35)', bar: '#f43f5e' };
  }
};

const OwnerSalesQuotaWidget = ({ salesQuota, onQuotaUpdated }) => {
  const { mode } = useAdminTheme();
  const isLightMode = mode === 'light';
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleOpenSalesQuotaModal = () => setIsModalOpen(true);
  const handleCloseSalesQuotaModal = () => setIsModalOpen(false);

  const statusStyle = getQuotaStatusStyle(salesQuota?.statusLabel);
  const progressPercent = Math.min(Math.max(Number(salesQuota?.progressPercent ?? 0), 0), 100);
  const updatedTimeLabel = salesQuota?.updatedAt
    ? `Sent to Sales • Updated ${new Date(salesQuota.updatedAt).toLocaleString('en-PH', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}`
    : 'Active Default Sales Target';

  return (
    <>
      <div
        className="widget"
        style={{
          background: 'var(--bg-secondary, #ffffff)',
          border: '1px solid var(--border-light)',
          boxShadow: isLightMode ? '0 2px 12px rgba(15, 23, 42, 0.05)' : 'none',
          padding: '1.5rem',
          borderRadius: 16,
          display: 'flex',
          flexDirection: 'column',
          gap: '1.25rem'
        }}
      >
        {/* Header title and action button to set or update the business sales quota */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
              <h3 style={{ margin: 0, fontSize: '1.08rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                Business Sales Quota & Target
              </h3>
              <span
                style={{
                  fontSize: '0.72rem',
                  fontWeight: 700,
                  padding: '3px 10px',
                  borderRadius: 9999,
                  color: statusStyle.color,
                  background: statusStyle.bg,
                  border: `1px solid ${statusStyle.border}`
                }}
              >
                {salesQuota?.statusLabel || 'In Progress'}
              </span>
            </div>
            <p style={{ margin: '4px 0 0', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
              Set target sales for your Sales team and monitor real-time achievement
            </p>
          </div>

          <button
            type="button"
            onClick={handleOpenSalesQuotaModal}
            style={{
              padding: '0.6rem 1.15rem',
              borderRadius: 10,
              border: 'none',
              background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
              color: '#ffffff',
              fontSize: '0.82rem',
              fontWeight: 700,
              cursor: 'pointer',
              boxShadow: '0 4px 12px rgba(245, 158, 11, 0.28)'
            }}
          >
            {salesQuota?.updatedAt ? 'Update Sales Quota Target' : 'Set Sales Quota Target'}
          </button>
        </div>

        {/* Three main metrics: target quota, achieved sales, and remaining balance */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(210px, 1fr))', gap: '1rem' }}>
          <div style={{ padding: '1rem', borderRadius: 12, background: 'var(--bg-primary)', border: '1px solid var(--border-light)' }}>
            <div style={{ fontSize: '0.72rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--text-muted)' }}>
              Target Sales Quota
            </div>
            <div style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--text-primary)', marginTop: 4 }}>
              {salesQuota?.formattedTargetAmount ?? '₱0'}
            </div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: 4 }}>
              {salesQuota?.periodLabel || 'Monthly Sales Target'} • {salesQuota?.periodRangeText || ''}
            </div>
          </div>

          <div style={{ padding: '1rem', borderRadius: 12, background: 'var(--bg-primary)', border: '1px solid var(--border-light)' }}>
            <div style={{ fontSize: '0.72rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--text-muted)' }}>
              Achieved Sales
            </div>
            <div style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--green)', marginTop: 4 }}>
              {salesQuota?.formattedCurrentSales ?? '₱0'}
            </div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: 4 }}>
              {salesQuota?.currentOrdersCount ?? 0} valid orders{salesQuota?.targetOrders ? ` of ${salesQuota.targetOrders} target orders` : ''}
            </div>
          </div>

          <div style={{ padding: '1rem', borderRadius: 12, background: 'var(--bg-primary)', border: '1px solid var(--border-light)' }}>
            <div style={{ fontSize: '0.72rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--text-muted)' }}>
              Remaining to Goal
            </div>
            <div style={{ fontSize: '1.5rem', fontWeight: 800, color: salesQuota?.isQuotaReached ? 'var(--green)' : (isLightMode ? '#d97706' : '#f59e0b'), marginTop: 4 }}>
              {salesQuota?.isQuotaReached ? '₱0 (Goal Reached!)' : (salesQuota?.formattedRemainingAmount ?? '₱0')}
            </div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: 4 }}>
              {salesQuota?.rawProgressPercent ?? 0}% achieved
            </div>
          </div>
        </div>

        {/* Visual progress bar showing overall quota completion percentage */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.78rem', fontWeight: 700 }}>
            <span style={{ color: 'var(--text-muted)' }}>Quota Achievement Progress</span>
            <span style={{ color: statusStyle.color }}>{salesQuota?.rawProgressPercent ?? 0}%</span>
          </div>
          <div style={{ width: '100%', height: 10, borderRadius: 9999, background: 'var(--bg-primary)', border: '1px solid var(--border-light)', overflow: 'hidden' }}>
            <div
              style={{
                width: `${progressPercent}%`,
                height: '100%',
                borderRadius: 9999,
                background: statusStyle.bar,
                transition: 'width 0.35s ease'
              }}
            />
          </div>
        </div>

        {/* Owner directive message for the Sales team */}
        <div
          style={{
            padding: '0.85rem 1rem',
            borderRadius: 12,
            background: isLightMode ? '#fffbeb' : 'rgba(245, 158, 11, 0.08)',
            border: isLightMode ? '1px solid #fde68a' : '1px solid rgba(245, 158, 11, 0.22)',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: 8
          }}
        >
          <div style={{ fontSize: '0.82rem', color: 'var(--text-primary)' }}>
            <strong style={{ color: isLightMode ? '#b45309' : '#f59e0b' }}>Directive to Sales Staff: </strong>
            {salesQuota?.noteToSales || 'No message added yet for the Sales team.'}
          </div>
          <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontWeight: 600 }}>
            {updatedTimeLabel}
          </span>
        </div>
      </div>

      {/* Modal for setting or updating the Owner's target sales quota */}
      <OwnerSalesQuotaModal
        isOpen={isModalOpen}
        onClose={handleCloseSalesQuotaModal}
        initialQuota={salesQuota}
        onQuotaUpdated={onQuotaUpdated}
      />
    </>
  );
};

export default OwnerSalesQuotaWidget;
