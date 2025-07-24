import axios from 'axios';
import { toast } from 'react-toastify';
import {
  getUserFriendlyErrorMessage,
  isRenderStartupIssue,
  getRenderFreeServiceSuggestions,
  getErrorDetails
} from '../utils/apiErrorHandler';

// Create axios instance with improved configuration
const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL || 'http://localhost:5000/api',
  timeout: 15000, // Increased timeout for render.com free tier
  headers: {
    'Content-Type': 'application/json',
  },
  // Retry logic for failed requests
  retry: 2,
  retryDelay: 1000
});

// Add request retry logic
api.interceptors.response.use(undefined, async (err) => {
  const { config } = err;
  if (!config || !config.retry) {
    return Promise.reject(err);
  }
  
  // Don't retry on rate limiting (429) or auth errors (401, 403, 423)
  if (err.response && [401, 403, 423, 429].includes(err.response.status)) {
    return Promise.reject(err);
  }
  
  // Only retry on connection issues, not auth errors or server errors
  if (!isRenderStartupIssue(err)) {
    return Promise.reject(err);
  }
  
  // Set the retry count
  config.__retryCount = config.__retryCount || 0;
  
  // Check if we've maxed out the total number of retries
  if (config.__retryCount >= config.retry) {
    // If it still fails after retries, show a special message for render.com
    if (isRenderStartupIssue(err)) {
      toast.info("Server might be starting up. Please wait a moment and try again.", {
        autoClose: false
      });
    }
    return Promise.reject(err);
  }
  
  // Increase the retry count
  config.__retryCount += 1;
  
  // Show notification for retry
  toast.info(`Connecting to server, attempt ${config.__retryCount}...`, {
    autoClose: 2000
  });
  
  // Create new promise to handle retry
  const backoff = new Promise((resolve) => {
    setTimeout(() => {
      console.log(`Retrying request: ${config.url} (Attempt ${config.__retryCount})`);
      resolve();
    }, config.retryDelay || 1000);
  });
  
  // Return the promise in which recalls axios to retry the request
  await backoff;
  return api(config);
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
    // Log detailed error for debugging
    console.error('API Error:', getErrorDetails(error));
    
    // Handle authentication failures
    if (error.response?.status === 401) {
      localStorage.removeItem('adminToken');
      localStorage.removeItem('adminUser');
      
      // Only redirect if it's truly an auth error, not during login
      const isLoginAttempt = error.config?.url?.includes('/login');
      if (!isLoginAttempt) {
        window.location.href = '/login';
      }
    }
    
    // Get user-friendly error message
    const message = getUserFriendlyErrorMessage(error);
    
    // Show specific instructions for render.com startup issues
    if (isRenderStartupIssue(error) && !error.__showedStartupToast) {
      error.__showedStartupToast = true; // Prevent duplicate toasts
      
      const suggestions = getRenderFreeServiceSuggestions();
      toast.info(
        <div>
          <p><strong>Server might be starting up</strong></p>
          <ul style={{textAlign: 'left', paddingLeft: '20px'}}>
            {suggestions.map((s, i) => <li key={i}>{s}</li>)}
          </ul>
        </div>,
        { autoClose: false }
      );
    } else {
      // Show regular error message
      toast.error(message);
    }
    
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
