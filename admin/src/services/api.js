import axios from 'axios';
import { toast } from 'react-toastify';

// Create axios instance
const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL || 'http://localhost:5000/api',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('adminToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle errors
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('adminToken');
      localStorage.removeItem('adminUser');
      window.location.href = '/login';
    }
    
    const message = error.response?.data?.message || 'An error occurred';
    toast.error(message);
    
    return Promise.reject(error);
  }
);

// Auth API calls
export const authAPI = {
  login: (credentials) => api.post('/auth/admin/login', credentials),
  getProfile: () => api.get('/admin/profile'),
  logout: () => {
    localStorage.removeItem('adminToken');
    localStorage.removeItem('adminUser');
  }
};

// Admin API calls
export const adminAPI = {
  // Dashboard
  getDashboardStats: () => api.get('/admin/dashboard'),
  
  // Users
  getUsers: (params = {}) => api.get('/admin/users', { params }),
  getUserDetails: (userId) => api.get(`/admin/users/${userId}`),
  toggleUserStatus: (userId) => api.post(`/admin/users/${userId}/toggle-status`),
  
  // Wallet Management
  manageWallet: (data) => api.post('/admin/wallet/manage', data),
  
  // Results
  setResult: (data) => api.post('/admin/results/set', data),
  getResults: (params = {}) => api.get('/admin/results', { params }),
  getWinners: (roundId) => api.get(`/admin/results/${roundId}/winners`),
  
  // Reports
  getReports: (params = {}) => api.get('/admin/reports', { params }),
};

export default api;
