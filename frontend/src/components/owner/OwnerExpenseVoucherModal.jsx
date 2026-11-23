import React from 'react';
import { CustomCloseIcon as CloseIcon } from '../icons';
import { formatOwnerPeso } from '../../services/ownerFinanceApi';
import { generateExpenseVoucherPDF } from '../../utils/documentGenerator';

// Read-only modal displaying official details for a selected company expense with PDF voucher export
const OwnerExpenseVoucherModal = ({ expense, onClose }) => {
  if (!expense) return null;

  const formattedDate = expense.date
    ? new Date(expense.date).toLocaleDateString('en-PH', {
        month: 'long',
        day: 'numeric',
        year: 'numeric'
      })
    : 'N/A';

  const handleDownloadExpenseVoucherPdf = () => {
    generateExpenseVoucherPDF(expense);
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="owner-expense-voucher-title"
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 1200,
        background: 'rgba(0, 0, 0, 0.72)',
        backdropFilter: 'blur(4px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '1.25rem'
      }}
    >
      <div
        style={{
          width: '100%',
          maxWidth: 500,
          background: 'var(--bg-secondary)',
          border: '1px solid var(--border-light)',
          borderRadius: 18,
          boxShadow: '0 24px 64px rgba(0, 0, 0, 0.45)',
          overflow: 'hidden'
        }}
      >
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            padding: '1.25rem 1.5rem',
            borderBottom: '1px solid var(--border-light)'
          }}
        >
          <div>
            <h3
              id="owner-expense-voucher-title"
              style={{ margin: 0, fontSize: '1.05rem', fontWeight: 800, color: 'var(--text-primary)' }}
            >
              Company Expense Voucher
            </h3>
            <p style={{ margin: '2px 0 0', fontSize: '0.76rem', color: 'var(--text-muted)' }}>
              Official expense record recorded by Finance.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close expense voucher modal"
            style={{
              background: 'transparent',
              border: '1px solid var(--border-light)',
              borderRadius: 9,
              padding: 6,
              color: 'var(--text-muted)',
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            <CloseIcon sx={{ fontSize: 16 }} />
          </button>
        </div>

        <div style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div
            style={{
              padding: '1rem 1.15rem',
              borderRadius: 12,
              background: 'rgba(239, 68, 68, 0.08)',
              border: '1px solid rgba(239, 68, 68, 0.22)',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              flexWrap: 'wrap',
              gap: 10
            }}
          >
            <div>
              <div style={{ fontSize: '0.72rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--text-muted)' }}>
                Voucher Amount
              </div>
              <div style={{ fontSize: '1.55rem', fontWeight: 900, color: '#ef4444', fontVariantNumeric: 'tabular-nums', marginTop: 2 }}>
                {formatOwnerPeso(expense.amount)}
              </div>
            </div>
            <span className="badge-green" style={{ fontSize: '0.74rem', fontWeight: 700 }}>
              {expense.status || 'Approved'}
            </span>
          </div>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(2, minmax(0, 1fr))',
              gap: '0.85rem'
            }}
          >
            <div style={{ padding: '0.75rem 0.9rem', borderRadius: 10, background: 'var(--bg-primary)', border: '1px solid var(--border-light)' }}>
              <div style={{ fontSize: '0.7rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-muted)' }}>Reference</div>
              <div style={{ fontSize: '0.86rem', fontWeight: 700, fontFamily: 'monospace', color: 'var(--text-primary)', marginTop: 3 }}>
                {expense.reference || `EXP-${expense.id}`}
              </div>
            </div>
            <div style={{ padding: '0.75rem 0.9rem', borderRadius: 10, background: 'var(--bg-primary)', border: '1px solid var(--border-light)' }}>
              <div style={{ fontSize: '0.7rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-muted)' }}>Expense Date</div>
              <div style={{ fontSize: '0.86rem', fontWeight: 600, color: 'var(--text-primary)', marginTop: 3 }}>
                {formattedDate}
              </div>
            </div>
          </div>

          <div style={{ padding: '0.85rem 1rem', borderRadius: 10, background: 'var(--bg-primary)', border: '1px solid var(--border-light)' }}>
            <div style={{ fontSize: '0.7rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-muted)' }}>Category</div>
            <div style={{ fontSize: '0.88rem', fontWeight: 700, color: 'var(--text-primary)', marginTop: 3 }}>
              {expense.category || 'Operations'}
            </div>
          </div>

          <div style={{ padding: '0.85rem 1rem', borderRadius: 10, background: 'var(--bg-primary)', border: '1px solid var(--border-light)' }}>
            <div style={{ fontSize: '0.7rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-muted)' }}>Description</div>
            <div style={{ fontSize: '0.86rem', color: 'var(--text-primary)', marginTop: 4, lineHeight: 1.55 }}>
              {expense.description || 'No description provided.'}
            </div>
          </div>
        </div>

        <div
          style={{
            padding: '0 1.5rem 1.35rem',
            display: 'flex',
            justifyContent: 'flex-end'
          }}
        >
          <button
            type="button"
            onClick={handleDownloadExpenseVoucherPdf}
            style={{
              padding: '0.7rem 1.35rem',
              borderRadius: 10,
              border: 'none',
              background: 'linear-gradient(135deg, #d97706, #b45309)',
              color: '#ffffff',
              fontSize: '0.84rem',
              fontWeight: 700,
              cursor: 'pointer'
            }}
          >
            Download Expense Voucher PDF
          </button>
        </div>
      </div>
    </div>
  );
};

export default OwnerExpenseVoucherModal;
