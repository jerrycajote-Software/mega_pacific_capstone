import axios from 'axios';

const getApiBaseUrl = () => import.meta.env.VITE_API_URL || '';

const buildAuthHeaders = (tokenOverride) => {
  const token = tokenOverride || localStorage.getItem('appToken');
  return token ? { Authorization: `Bearer ${token}` } : {};
};

// Fetch unread Staff-to-Admin message counts for sidebar badges
export const fetchStaffSupportUnreadSummary = async (token) => {
  const res = await axios.get(`${getApiBaseUrl()}/api/staff-support/unread-summary`, {
    headers: buildAuthHeaders(token)
  });
  return res.data;
};

// Fetch filtered conversation threads for the signed-in staff user or Admin inbox
export const fetchStaffSupportThreads = async (
  { status = 'all', category = 'all', department = 'all', search = '' } = {},
  token
) => {
  const params = new URLSearchParams();
  if (status && status !== 'all') params.set('status', status);
  if (category && category !== 'all') params.set('category', category);
  if (department && department !== 'all') params.set('department', department);
  if (search && search.trim()) params.set('search', search.trim());

  const query = params.toString();
  const res = await axios.get(
    `${getApiBaseUrl()}/api/staff-support/threads${query ? `?${query}` : ''}`,
    { headers: buildAuthHeaders(token) }
  );
  return res.data;
};

// Create a new Staff-to-Admin conversation thread
export const createStaffSupportThread = async ({ category, priority, subject, message, image }, token) => {
  const res = await axios.post(
    `${getApiBaseUrl()}/api/staff-support/threads`,
    { category, priority, subject, message, image },
    { headers: buildAuthHeaders(token) }
  );
  return res.data;
};

// Load a single thread with full chronological message history
export const fetchStaffSupportThreadDetail = async (threadId, token) => {
  const res = await axios.get(`${getApiBaseUrl()}/api/staff-support/threads/${threadId}`, {
    headers: buildAuthHeaders(token)
  });
  return res.data;
};

// Send a reply message (with optional compressed screenshot) inside a thread
export const sendStaffSupportReply = async (threadId, { content, image }, token) => {
  const res = await axios.post(
    `${getApiBaseUrl()}/api/staff-support/threads/${threadId}/messages`,
    { content, image },
    { headers: buildAuthHeaders(token) }
  );
  return res.data;
};

// Mark a conversation thread as read for the active portal side
export const markStaffSupportThreadAsRead = async (threadId, token) => {
  const res = await axios.patch(
    `${getApiBaseUrl()}/api/staff-support/threads/${threadId}/read`,
    {},
    { headers: buildAuthHeaders(token) }
  );
  return res.data;
};

// Update thread status (open, in_progress, resolved) from the Admin portal
export const updateStaffSupportThreadStatus = async (threadId, status, token) => {
  const res = await axios.patch(
    `${getApiBaseUrl()}/api/staff-support/threads/${threadId}/status`,
    { status },
    { headers: buildAuthHeaders(token) }
  );
  return res.data;
};
