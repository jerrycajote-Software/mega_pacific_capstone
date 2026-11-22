// Plain-language labels and badge colors shared by Staff and Admin Support Chat screens

export const CATEGORY_OPTIONS = [
  { value: 'system_problem', label: 'System Problem', color: '#ef4444', bg: 'rgba(239, 68, 68, 0.14)' },
  { value: 'feature_request', label: 'Feature Request', color: '#3b82f6', bg: 'rgba(59, 130, 246, 0.14)' },
  { value: 'general_help', label: 'General Help', color: '#10b981', bg: 'rgba(16, 185, 129, 0.14)' }
];

export const STATUS_OPTIONS = [
  { value: 'open', label: 'Open', color: '#f59e0b', bg: 'rgba(245, 158, 11, 0.14)' },
  { value: 'in_progress', label: 'In Progress', color: '#3b82f6', bg: 'rgba(59, 130, 246, 0.14)' },
  { value: 'resolved', label: 'Resolved', color: '#16a34a', bg: 'rgba(22, 163, 74, 0.14)' }
];

export const PRIORITY_OPTIONS = [
  { value: 'normal', label: 'Normal', color: '#64748b', bg: 'rgba(100, 116, 139, 0.14)' },
  { value: 'urgent', label: 'Urgent', color: '#dc2626', bg: 'rgba(220, 38, 38, 0.16)' }
];

export const DEPARTMENT_OPTIONS = [
  { value: 'logistic', label: 'Logistics', color: '#f59e0b', bg: 'rgba(245, 158, 11, 0.14)' },
  { value: 'finance', label: 'Finance', color: '#06b6d4', bg: 'rgba(6, 182, 212, 0.14)' },
  { value: 'sales', label: 'Sales', color: '#10b981', bg: 'rgba(16, 185, 129, 0.14)' },
  { value: 'owner', label: 'Owner', color: '#8b5cf6', bg: 'rgba(139, 92, 246, 0.14)' }
];

export const getCategoryMeta = (value) =>
  CATEGORY_OPTIONS.find((item) => item.value === value) || CATEGORY_OPTIONS[0];

export const getStatusMeta = (value) =>
  STATUS_OPTIONS.find((item) => item.value === value) || STATUS_OPTIONS[0];

export const getPriorityMeta = (value) =>
  PRIORITY_OPTIONS.find((item) => item.value === value) || PRIORITY_OPTIONS[0];

export const getDepartmentMeta = (value) =>
  DEPARTMENT_OPTIONS.find((item) => item.value === String(value || '').toLowerCase()) || {
    value: value || 'staff',
    label: value ? value.charAt(0).toUpperCase() + value.slice(1) : 'Staff',
    color: '#64748b',
    bg: 'rgba(100, 116, 139, 0.14)'
  };

export const formatRelativeChatTime = (dateValue) => {
  if (!dateValue) return '';
  const date = new Date(dateValue);
  if (Number.isNaN(date.getTime())) return '';
  return date.toLocaleString('en-PH', {
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit'
  });
};
