import axios from 'axios';

const getApiBaseUrl = () => import.meta.env.VITE_API_URL || '';

const buildAuthHeaders = (tokenOverride) => {
  const token = tokenOverride || localStorage.getItem('appToken');
  return token ? { Authorization: `Bearer ${token}` } : {};
};

// Fetch the signed-in customer's live eligibility and current deletion request status
export const fetchCustomerDeletionStatus = async (token) => {
  const res = await axios.get(`${getApiBaseUrl()}/api/customer/account-deletion/status`, {
    headers: buildAuthHeaders(token)
  });
  return res.data;
};

// Submit a new customer account deletion request with password confirmation
export const submitCustomerDeletionRequest = async ({ password, reason }, token) => {
  const res = await axios.post(
    `${getApiBaseUrl()}/api/customer/account-deletion/request`,
    { password, reason },
    { headers: buildAuthHeaders(token) }
  );
  return res.data;
};

// Cancel the signed-in customer's pending account deletion request
export const cancelCustomerDeletionRequest = async (token) => {
  const res = await axios.patch(
    `${getApiBaseUrl()}/api/customer/account-deletion/cancel`,
    {},
    { headers: buildAuthHeaders(token) }
  );
  return res.data;
};

// Fetch filtered account deletion requests and KPI counts for Admin review
export const fetchAdminDeletionRequests = async ({ status = 'all', search = '' } = {}, token) => {
  const params = new URLSearchParams();
  if (status && status !== 'all') params.set('status', status);
  if (search && search.trim()) params.set('search', search.trim());

  const query = params.toString();
  const res = await axios.get(
    `${getApiBaseUrl()}/api/admin/account-deletion-requests${query ? `?${query}` : ''}`,
    { headers: buildAuthHeaders(token) }
  );
  return res.data;
};

// Fetch full customer info and fresh order/refund eligibility for one deletion request
export const fetchAdminDeletionRequestDetail = async (requestId, token) => {
  const res = await axios.get(
    `${getApiBaseUrl()}/api/admin/account-deletion-requests/${requestId}`,
    { headers: buildAuthHeaders(token) }
  );
  return res.data;
};

// Approve a pending account deletion request and soft-delete the customer account
export const approveAdminDeletionRequest = async (requestId, { adminNotes = '' } = {}, token) => {
  const res = await axios.patch(
    `${getApiBaseUrl()}/api/admin/account-deletion-requests/${requestId}/approve`,
    { adminNotes },
    { headers: buildAuthHeaders(token) }
  );
  return res.data;
};

// Reject a pending account deletion request with an explanation for the customer
export const rejectAdminDeletionRequest = async (requestId, { adminNotes }, token) => {
  const res = await axios.patch(
    `${getApiBaseUrl()}/api/admin/account-deletion-requests/${requestId}/reject`,
    { adminNotes },
    { headers: buildAuthHeaders(token) }
  );
  return res.data;
};
