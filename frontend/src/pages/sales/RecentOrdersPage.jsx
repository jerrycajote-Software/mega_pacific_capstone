import React from 'react';
import { useNavigate } from 'react-router-dom';
import RecentCustomerOrdersWidget from '../../components/sales/RecentCustomerOrdersWidget';
import { CustomChevronRightIcon as ChevronRightIcon } from '../../components/icons';

const RecentOrdersPage = () => {
  const navigate = useNavigate();

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
              Recent Customer Orders
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
            Recent Customer Orders
          </h1>
          <p style={{ margin: '4px 0 0', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
            Live overview of latest orders placed by homeowners, architects, and building contractors.
          </p>
        </div>

        <button
          type="button"
          onClick={() => navigate('/sales/orders')}
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
          <span>Open Full Orders Hub</span>
          <ChevronRightIcon sx={{ fontSize: 16 }} />
        </button>
      </div>

      <RecentCustomerOrdersWidget
        showHeaderAction={false}
        title="Live Customer Order Activity"
        subtitle="Real-time order feed filtered by status and customer information"
      />
    </div>
  );
};

export default RecentOrdersPage;

