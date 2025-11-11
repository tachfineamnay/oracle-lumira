import axios from 'axios';
import { getApiBaseUrl } from './apiBase';

// API base URL - prefer same-origin proxy in production to avoid CORS/CSP
const API_BASE_URL = getApiBaseUrl();

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
    register: '/expert/register',
    verify: '/expert/verify',
    stats: '/expert/stats',
    orders: '/expert/orders/pending',
    validationQueue: '/expert/orders/validation-queue',
    validateContent: '/expert/validate-content',
    orderDetails: (id: string) => `/expert/orders/${id}`,
    assignOrder: (id: string) => `/expert/orders/${id}/assign`,
    processOrder: '/expert/process-order',
    presignFile: '/expert/files/presign'
  }
};

export default api;
