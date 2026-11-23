import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || '';

// Format Philippine peso values cleanly with two decimal places, handling negative figures properly
export const formatOwnerPeso = (rawAmount, fallbackLabel = '₱0.00') => {
  if (typeof rawAmount === 'number' && Number.isFinite(rawAmount)) {
    const isNegative = rawAmount < 0;
    const formatted = Math.abs(rawAmount).toLocaleString('en-PH', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    });
    return `${isNegative ? '-₱' : '₱'}${formatted}`;
  }
  return fallbackLabel;
};

// Fetch read-only Owner company expenses, category breakdown, and period profit summary
export const fetchOwnerExpensesData = async ({ period = 'all', category = 'All', search = '' } = {}) => {
  const token = localStorage.getItem('appToken');
  const params = { period };

  if (category && category !== 'All') {
    params.category = category;
  }
  if (search && search.trim()) {
    params.search = search.trim();
  }

  const response = await axios.get(`${API_URL}/api/owner/expenses`, {
    params,
    headers: { Authorization: `Bearer ${token}` }
  });

  return response.data;
};
