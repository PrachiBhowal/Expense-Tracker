/**
 * Returns headers with JWT Authorization token for authenticated fetch calls.
 * Usage: fetch(url, { headers: authHeaders(), credentials: 'include' })
 */
export const authHeaders = (extra = {}) => {
  const token = localStorage.getItem('authToken');
  return {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...extra
  };
};

export const API_URL = import.meta.env.VITE_API_URL || 'https://expense-tracker-api-xrxj.onrender.com';
