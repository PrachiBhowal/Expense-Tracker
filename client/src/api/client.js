import axios from 'axios';

const API_BASE = import.meta.env.VITE_API_URL || 'https://expense-tracker-api-xrxj.onrender.com/api';

const axiosInstance = axios.create({
  baseURL: API_BASE,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Request interceptor
axiosInstance.interceptors.request.use(
  (config) => {
    console.log(`📤 ${config.method.toUpperCase()} ${config.url}`);
    // Attach JWT token if available
    const token = localStorage.getItem('authToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    console.error('Request error:', error);
    return Promise.reject(error);
  }
);

// Response interceptor
axiosInstance.interceptors.response.use(
  (response) => {
    console.log(`📥 ${response.status} ${response.config.url}`);
    return response;
  },
  (error) => {
    const message = error.response?.data?.message || error.message;
    console.error(`❌ ${error.response?.status} - ${message}`);
    
    if (error.response?.status === 401) {
      localStorage.removeItem('authToken');
      localStorage.removeItem('authUsername');
      window.location.href = '/login';
    }
    
    return Promise.reject({
      status: error.response?.status,
      message: message,
      data: error.response?.data
    });
  }
);

export default axiosInstance;