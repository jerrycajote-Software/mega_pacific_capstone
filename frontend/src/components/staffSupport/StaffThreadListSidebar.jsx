import React from 'react';
import CircularProgress from '@mui/material/CircularProgress';
import { CustomSearchIcon as SearchIcon } from '../icons';
import {
  CATEGORY_OPTIONS,
  STATUS_OPTIONS,
  DEPARTMENT_OPTIONS,
  getCategoryMeta,
  getStatusMeta,
  getDepartmentMeta,
  formatRelativeChatTime
} from './staffSupportConstants';

const StaffThreadListSidebar = ({
  isAdminView = false,
  threads = [],
  loading = false,
  selectedThreadId = null,
  searchTerm = '',
  statusFilter = 'all',
  categoryFilter = 'all',
  departmentFilter = 'all',
  onSearchChange,
  onStatusFilterChange,
  onCategoryFilterChange,
  onDepartmentFilterChange,
  onSelectThread
}) => {
  return (
    <div
      style={{
        background: 'var(--bg-secondary)',
        border: '1px solid var(--border-light)',
        borderRadius: 16,
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
        minHeight: 540,
        maxHeight: '76vh'
      }}
    >
      <div style={{ padding: '1rem', borderBottom: '1px solid var(--border-light)', display: 'flex', flexDirection: 'column', gap: 10 }}>
        <div style={{ position: 'relative' }}>
          <SearchIcon sx={{ fontSize: 17, color: 'var(--text-muted)', position: 'absolute', left: 11, top: '50%', transform: 'translateY(-50%)' }} />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => onSearchChange?.(e.target.value)}
            placeholder={isAdminView ? 'Search staff, subject, or message...' : 'Search conversations...'}
            style={{
              width: '100%',
              background: 'var(--bg-primary)',
              border: '1px solid var(--border-light)',
              borderRadius: 10,
              padding: '8px 12px 8px 34px',
              color: 'var(--text-primary)',
              fontSize: '0.82rem',
              outline: 'none',
              boxSizing: 'border-box'
            }}
          />
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: isAdminView ? '1fr 1fr' : '1fr 1fr', gap: 8 }}>
          <select
            aria-label="Filter by status"
            value={statusFilter}
            onChange={(e) => onStatusFilterChange?.(e.target.value)}
            style={{
              background: 'var(--bg-primary)',
              border: '1px solid var(--border-light)',
              borderRadius: 8,
              padding: '6px 10px',
              color: 'var(--text-primary)',
              fontSize: '0.78rem',
              fontWeight: 600
            }}
          >
            <option value="all">All Statuses</option>
            {STATUS_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>

          <select
            aria-label="Filter by category"
            value={categoryFilter}
            onChange={(e) => onCategoryFilterChange?.(e.target.value)}
            style={{
              background: 'var(--bg-primary)',
              border: '1px solid var(--border-light)',
              borderRadius: 8,
              padding: '6px 10px',
              color: 'var(--text-primary)',
              fontSize: '0.78rem',
              fontWeight: 600
            }}
          >
            <option value="all">All Topics</option>
            {CATEGORY_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>

          {isAdminView && (
            <select
              aria-label="Filter by department"
              value={departmentFilter}
              onChange={(e) => onDepartmentFilterChange?.(e.target.value)}
              style={{
                gridColumn: '1 / -1',
                background: 'var(--bg-primary)',
                border: '1px solid var(--border-light)',
                borderRadius: 8,
                padding: '6px 10px',
                color: 'var(--text-primary)',
                fontSize: '0.78rem',
                fontWeight: 600
              }}
            >
              <option value="all">All Departments (Logistics, Finance, Sales, Owner)</option>
              {DEPARTMENT_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          )}
        </div>
      </div>

      <div style={{ flex: 1, overflowY: 'auto' }}>
        {loading ? (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '3rem 1rem', gap: 10 }}>
            <CircularProgress size={26} sx={{ color: '#4f772d' }} />
            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Loading conversations...</span>
          </div>
        ) : threads.length === 0 ? (
          <div style={{ padding: '2.5rem 1.25rem', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.83rem', lineHeight: 1.55 }}>
            {isAdminView
              ? 'No staff conversations match your current filters.'
              : 'You have not messaged the Administrator yet. Click "Start New Conversation" to report a system issue or suggest a feature.'}
          </div>
        ) : (
          threads.map((thread) => {
            const isSelected = thread.id === selectedThreadId;
            const unread = isAdminView ? (thread.adminUnreadCount || 0) : (thread.staffUnreadCount || 0);
            const categoryMeta = getCategoryMeta(thread.category);
            const statusMeta = getStatusMeta(thread.status);
            const deptMeta = getDepartmentMeta(thread.staffRole);

            return (
              <button
                key={thread.id}
                type="button"
                onClick={() => onSelectThread?.(thread.id)}
                style={{
                  width: '100%',
                  textAlign: 'left',
                  padding: '0.95rem 1.05rem',
                  border: 'none',
                  borderBottom: '1px solid var(--border-light)',
                  borderLeft: isSelected ? '3px solid #4f772d' : '3px solid transparent',
                  background: isSelected ? 'rgba(79, 119, 45, 0.12)' : 'transparent',
                  cursor: 'pointer',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 6
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 8 }}>
                  <div style={{ fontWeight: 700, fontSize: '0.86rem', color: 'var(--text-primary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {thread.subject}
                  </div>
                  {unread > 0 && (
                    <span
                      style={{
                        minWidth: 20,
                        height: 20,
                        padding: '0 6px',
                        borderRadius: 999,
                        background: '#ef4444',
                        color: '#ffffff',
                        fontSize: '0.7rem',
                        fontWeight: 800,
                        display: 'inline-flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexShrink: 0
                      }}
                    >
                      {unread}
                    </span>
                  )}
                </div>

                {isAdminView && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
                    <span style={{ fontSize: '0.74rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                      {thread.staffName || thread.staffEmail}
                    </span>
                    <span style={{ padding: '2px 7px', borderRadius: 6, background: deptMeta.bg, color: deptMeta.color, fontSize: '0.68rem', fontWeight: 700 }}>
                      {deptMeta.label}
                    </span>
                  </div>
                )}

                <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
                  <span style={{ padding: '2px 7px', borderRadius: 6, background: categoryMeta.bg, color: categoryMeta.color, fontSize: '0.68rem', fontWeight: 700 }}>
                    {categoryMeta.label}
                  </span>
                  <span style={{ padding: '2px 7px', borderRadius: 6, background: statusMeta.bg, color: statusMeta.color, fontSize: '0.68rem', fontWeight: 700 }}>
                    {statusMeta.label}
                  </span>
                  {thread.priority === 'urgent' && (
                    <span style={{ padding: '2px 7px', borderRadius: 6, background: 'rgba(220,38,38,0.16)', color: '#dc2626', fontSize: '0.68rem', fontWeight: 800 }}>
                      Urgent
                    </span>
                  )}
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 8 }}>
                  <span style={{ fontSize: '0.76rem', color: 'var(--text-muted)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {thread.lastMessagePreview || 'No messages yet'}
                  </span>
                  <span style={{ fontSize: '0.68rem', color: 'var(--text-muted)', whiteSpace: 'nowrap', flexShrink: 0 }}>
                    {formatRelativeChatTime(thread.lastMessageAt)}
                  </span>
                </div>
              </button>
            );
          })
        )}
      </div>
    </div>
  );
};

export default StaffThreadListSidebar;
