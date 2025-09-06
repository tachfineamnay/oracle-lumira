import axios from 'axios';

// API base URL - adjust based on environment
// API Configuration
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

// Create axios instance
export const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
  withCredentials: false,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  }
});

// Request interceptor
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('expert_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    // Handle common errors
    if (error.response?.status === 401) {
      // Token expired or invalid
      localStorage.removeItem('expert_token');
      window.location.href = '/login';
    }
    
    return Promise.reject(error);
  }
);

// API endpoints
export const endpoints = {
  expert: {
    login: '/expert/login',
    verify: '/expert/verify',
    stats: '/expert/stats',
    orders: '/expert/orders/pending',
    orderDetails: (id: string) => `/expert/orders/${id}`,
    processOrder: '/expert/process-order'
  }
};

export default api;
