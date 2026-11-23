import React from 'react';
import { CustomChevronRightIcon as ChevronRightIcon } from '../icons';
import { formatOwnerPeso } from '../../services/ownerFinanceApi';

const CATEGORY_COLORS = ['#ef4444', '#f59e0b', '#3b82f6', '#8b5cf6', '#10b981', '#0ea5e9'];

// Reusable breakdown card displaying company expense totals and shares per category
const OwnerExpenseCategoryCard = ({
  title = 'Expenses by Category',
  subtitle = 'Share of approved company expenses by department or cost type.',
  categories = [],
  totalExpenses = 0,
  selectedCategory = 'All',
  onSelectCategory = null,
  actionLabel = '',
  onActionClick = null,
  isDark = false
}) => {
  const safeCategories = Array.isArray(categories) ? categories : [];

  return (
    <div
      className="widget"
      style={{
        borderTop: '3px solid #ef4444',
        background: 'var(--bg-secondary)',
        borderColor: 'var(--border-light)',
        borderRadius: 16
      }}
    >
      <div className="widget-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12 }}>
        <div>
          <h3 className="widget-title" style={{ color: 'var(--text-primary)', margin: 0 }}>
            {title}
          </h3>
          {subtitle && (
            <p style={{ margin: '3px 0 0', fontSize: '0.74rem', color: 'var(--text-muted)' }}>
              {subtitle}
            </p>
          )}
        </div>
        {actionLabel && onActionClick && (
          <button
            type="button"
            onClick={onActionClick}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 2,
              background: 'none',
              border: 'none',
              color: isDark ? '#fbbf24' : '#b45309',
              fontSize: '0.78rem',
              fontWeight: 700,
              cursor: 'pointer',
              whiteSpace: 'nowrap'
            }}
          >
            <span>{actionLabel}</span>
            <ChevronRightIcon sx={{ fontSize: 15 }} />
          </button>
        )}
      </div>

      <div style={{ padding: '1.15rem 1.25rem', display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
        {safeCategories.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '1.75rem 1rem', color: 'var(--text-muted)', fontSize: '0.84rem' }}>
            No approved company expenses recorded for this period yet.
          </div>
        ) : (
          safeCategories.map((item, idx) => {
            const barColor = CATEGORY_COLORS[idx % CATEGORY_COLORS.length];
            const isSelected = selectedCategory && selectedCategory !== 'All' && selectedCategory.toLowerCase() === item.name.toLowerCase();
            const share = typeof item.sharePercent === 'number'
              ? item.sharePercent
              : totalExpenses > 0
                ? Number(((item.amount / totalExpenses) * 100).toFixed(1))
                : 0;

            return (
              <div
                key={item.name}
                onClick={onSelectCategory ? () => onSelectCategory(isSelected ? 'All' : item.name) : undefined}
                role={onSelectCategory ? 'button' : undefined}
                tabIndex={onSelectCategory ? 0 : undefined}
                onKeyDown={
                  onSelectCategory
                    ? (e) => {
                        if (e.key === 'Enter' || e.key === ' ') {
                          e.preventDefault();
                          onSelectCategory(isSelected ? 'All' : item.name);
                        }
                      }
                    : undefined
                }
                style={{
                  padding: '0.75rem 0.9rem',
                  borderRadius: 11,
                  background: isSelected ? 'rgba(239, 68, 68, 0.08)' : 'var(--bg-primary)',
                  border: `1px solid ${isSelected ? 'rgba(239, 68, 68, 0.45)' : 'var(--border-light)'}`,
                  cursor: onSelectCategory ? 'pointer' : 'default',
                  transition: 'border-color 0.18s ease, background 0.18s ease'
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 10, marginBottom: 6 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, minWidth: 0 }}>
                    <span style={{ width: 8, height: 8, borderRadius: '50%', background: barColor, flexShrink: 0 }} />
                    <span style={{ fontSize: '0.84rem', fontWeight: 700, color: 'var(--text-primary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {item.name}
                    </span>
                    <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', whiteSpace: 'nowrap' }}>
                      ({item.count} {item.count === 1 ? 'entry' : 'entries'})
                    </span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}>
                    <span style={{ fontSize: '0.84rem', fontWeight: 800, color: isDark ? '#f87171' : '#dc2626', fontVariantNumeric: 'tabular-nums' }}>
                      {formatOwnerPeso(item.amount)}
                    </span>
                    <span style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--text-muted)', minWidth: 42, textAlign: 'right', fontVariantNumeric: 'tabular-nums' }}>
                      {share}%
                    </span>
                  </div>
                </div>
                <div style={{ width: '100%', height: 6, borderRadius: 999, background: 'rgba(148, 163, 184, 0.16)', overflow: 'hidden' }}>
                  <div
                    style={{
                      width: `${Math.max(Math.min(share, 100), 3)}%`,
                      height: '100%',
                      borderRadius: 999,
                      background: barColor,
                      transition: 'width 0.3s ease'
                    }}
                  />
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

export default OwnerExpenseCategoryCard;
