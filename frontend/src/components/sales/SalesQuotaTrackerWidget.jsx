import React from 'react';

// Pick badge and progress bar colors based on the current quota progress percentage
const getSalesQuotaPalette = (statusLabel, rawProgressPercent) => {
  if (statusLabel === 'Target Reached' || rawProgressPercent >= 100) {
    return {
      badgeColor: '#16a34a',
      badgeBg: 'rgba(34, 197, 94, 0.14)',
      badgeBorder: 'rgba(34, 197, 94, 0.3)',
      barColor: '#22c55e'
    };
  }
  if (statusLabel === 'On Track' || rawProgressPercent >= 70) {
    return {
      badgeColor: '#0284c7',
      badgeBg: 'rgba(14, 165, 233, 0.14)',
      badgeBorder: 'rgba(14, 165, 233, 0.3)',
      barColor: '#22c55e'
    };
  }
  if (statusLabel === 'In Progress' || rawProgressPercent >= 35) {
    return {
      badgeColor: '#d97706',
      badgeBg: 'rgba(245, 158, 11, 0.14)',
      badgeBorder: 'rgba(245, 158, 11, 0.3)',
      barColor: '#f59e0b'
    };
  }
  return {
    badgeColor: '#e11d48',
    badgeBg: 'rgba(244, 63, 94, 0.14)',
    badgeBorder: 'rgba(244, 63, 94, 0.3)',
    barColor: '#f59e0b'
  };
};

const SalesQuotaTrackerWidget = ({ salesQuota }) => {
  // Show a helpful fallback card if no sales quota record is available yet
  if (!salesQuota) {
    return (
      <div
        style={{
          padding: '1.25rem',
          background: 'var(--bg-secondary)',
          border: '1px solid var(--border-light)',
          borderRadius: 16
        }}
      >
        <div style={{ fontSize: '0.95rem', fontWeight: 700, color: 'var(--text-primary)' }}>
          Business Sales Target from Owner
        </div>
        <p style={{ margin: '6px 0 0', fontSize: '0.82rem', color: 'var(--text-muted)' }}>
          No active sales target has been set by the Business Owner yet.
        </p>
      </div>
    );
  }

  const rawPercent = Number(salesQuota.rawProgressPercent ?? 0);
  const progressPercent = Math.min(Math.max(Number(salesQuota.progressPercent ?? 0), 0), 100);
  const palette = getSalesQuotaPalette(salesQuota.statusLabel, rawPercent);

  const updatedLabel = salesQuota.updatedAt
    ? `Updated by ${salesQuota.updatedBy || 'Business Owner'} • ${new Date(salesQuota.updatedAt).toLocaleString('en-PH', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}`
    : `Set by ${salesQuota.updatedBy || 'Business Owner'}`;

  return (
    <div
      style={{
        padding: '1.4rem 1.5rem',
        background: 'var(--bg-secondary)',
        border: '1px solid var(--border-light)',
        borderRadius: 16,
        display: 'flex',
        flexDirection: 'column',
        gap: '1.15rem',
        boxShadow: '0 2px 8px rgba(0,0,0,0.02)'
      }}
    >
      {/* Sales target card header showing the period range and current status */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 10 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
          <h3 style={{ margin: 0, fontSize: '1.05rem', fontWeight: 800, color: 'var(--text-primary)' }}>
            Business Sales Target from Owner
          </h3>
          <span
            style={{
              fontSize: '0.72rem',
              fontWeight: 700,
              padding: '3px 10px',
              borderRadius: 9999,
              background: 'rgba(34, 197, 94, 0.1)',
              border: '1px solid rgba(34, 197, 94, 0.25)',
              color: 'var(--green)'
            }}
          >
            {salesQuota.periodLabel || 'Monthly Sales Target'} ({salesQuota.periodRangeText || ''})
          </span>
        </div>

        <span
          style={{
            fontSize: '0.74rem',
            fontWeight: 700,
            padding: '4px 10px',
            borderRadius: 9999,
            color: palette.badgeColor,
            background: palette.badgeBg,
            border: `1px solid ${palette.badgeBorder}`
          }}
        >
          {salesQuota.statusLabel || 'In Progress'}
        </span>
      </div>

      {/* Four summary cards showing target quota, achieved sales, remaining balance, and order count */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(185px, 1fr))', gap: '0.9rem' }}>
        <div style={{ padding: '0.95rem 1rem', borderRadius: 12, background: 'var(--bg-primary)', border: '1px solid var(--border-light)' }}>
          <div style={{ fontSize: '0.7rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            Target Sales Quota
          </div>
          <div style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--text-primary)', marginTop: 4, fontVariantNumeric: 'tabular-nums' }}>
            {salesQuota.formattedTargetAmount ?? '₱0'}
          </div>
        </div>

        <div style={{ padding: '0.95rem 1rem', borderRadius: 12, background: 'var(--bg-primary)', border: '1px solid var(--border-light)' }}>
          <div style={{ fontSize: '0.7rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            Current Sales Achieved
          </div>
          <div style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--green)', marginTop: 4, fontVariantNumeric: 'tabular-nums' }}>
            {salesQuota.formattedCurrentSales ?? '₱0'}
          </div>
          <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: 2 }}>
            {rawPercent}% of quota
          </div>
        </div>

        <div style={{ padding: '0.95rem 1rem', borderRadius: 12, background: 'var(--bg-primary)', border: '1px solid var(--border-light)' }}>
          <div style={{ fontSize: '0.7rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            Remaining to Reach Target
          </div>
          <div style={{ fontSize: '1.4rem', fontWeight: 800, color: salesQuota.isQuotaReached ? 'var(--green)' : '#f59e0b', marginTop: 4, fontVariantNumeric: 'tabular-nums' }}>
            {salesQuota.isQuotaReached ? 'Target Reached! 🎉' : (salesQuota.formattedRemainingAmount ?? '₱0')}
          </div>
        </div>

        <div style={{ padding: '0.95rem 1rem', borderRadius: 12, background: 'var(--bg-primary)', border: '1px solid var(--border-light)' }}>
          <div style={{ fontSize: '0.7rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            Orders Progress
          </div>
          <div style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--text-primary)', marginTop: 4, fontVariantNumeric: 'tabular-nums' }}>
            {salesQuota.currentOrdersCount ?? 0}
            {salesQuota.targetOrders ? ` / ${salesQuota.targetOrders}` : ''} orders
          </div>
        </div>
      </div>

      {/* Progress bar showing how close the Sales team is to the target */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.78rem', fontWeight: 700 }}>
          <span style={{ color: 'var(--text-muted)' }}>Quota Progress</span>
          <span style={{ color: palette.badgeColor }}>{rawPercent}%</span>
        </div>
        <div style={{ width: '100%', height: 10, borderRadius: 9999, background: 'var(--bg-primary)', border: '1px solid var(--border-light)', overflow: 'hidden' }}>
          <div
            style={{
              width: `${progressPercent}%`,
              height: '100%',
              borderRadius: 9999,
              background: palette.barColor,
              transition: 'width 0.35s ease'
            }}
          />
        </div>
      </div>

      {/* Note or directive from the Business Owner for the Sales team */}
      <div
        style={{
          padding: '0.85rem 1rem',
          borderRadius: 12,
          background: 'rgba(34, 197, 94, 0.07)',
          border: '1px solid rgba(34, 197, 94, 0.22)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: 8
        }}
      >
        <div style={{ fontSize: '0.82rem', color: 'var(--text-primary)' }}>
          <strong style={{ color: 'var(--green)' }}>Owner's Note: </strong>
          {salesQuota.noteToSales || 'Keep following up on customer orders and inquiries to hit our target.'}
        </div>
        <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontWeight: 600 }}>
          {updatedLabel}
        </span>
      </div>
    </div>
  );
};

export default SalesQuotaTrackerWidget;
