/**
 * API Error Handler Utility
 * 
 * This utility provides functions to handle various API errors in a consistent way,
 * especially focusing on connection issues with Render.com free tier.
 */

// Error types for categorization
export const API_ERROR_TYPES = {
  CONNECTION_REFUSED: 'CONNECTION_REFUSED',
  CONNECTION_TIMEOUT: 'CONNECTION_TIMEOUT',
  RATE_LIMITED: 'RATE_LIMITED',
  AUTHENTICATION_FAILED: 'AUTHENTICATION_FAILED',
  SERVER_ERROR: 'SERVER_ERROR',
  NOT_FOUND: 'NOT_FOUND',
  VALIDATION_ERROR: 'VALIDATION_ERROR',
  UNKNOWN: 'UNKNOWN'
};

/**
 * Categorize an API error into a specific type
 * @param {Error} error - The error object from axios
 * @returns {string} The error type
 */
export const categorizeApiError = (error) => {
  // Connection refused or network error
  if (error.code === 'ECONNREFUSED' || error.code === 'ERR_CONNECTION_REFUSED' || 
      error.message.includes('Network Error')) {
    return API_ERROR_TYPES.CONNECTION_REFUSED;
  }
  
  // Connection timeout
  if (error.code === 'ECONNABORTED' || error.message.includes('timeout')) {
    return API_ERROR_TYPES.CONNECTION_TIMEOUT;
  }
  
  // Check response status codes
  if (error.response) {
    const status = error.response.status;
    
    // Rate limiting
    if (status === 429) {
      return API_ERROR_TYPES.RATE_LIMITED;
    }
    
    // Authentication errors
    if (status === 401 || status === 403) {
      return API_ERROR_TYPES.AUTHENTICATION_FAILED;
    }
    
    // Server errors
    if (status >= 500) {
      return API_ERROR_TYPES.SERVER_ERROR;
    }
    
    // Not found
    if (status === 404) {
      return API_ERROR_TYPES.NOT_FOUND;
    }
    
    // Validation errors
    if (status === 400 || status === 422) {
      return API_ERROR_TYPES.VALIDATION_ERROR;
    }
  }
  
  // Default to unknown
  return API_ERROR_TYPES.UNKNOWN;
};

/**
 * Get a user-friendly message for an API error
 * @param {Error} error - The error object from axios
 * @returns {string} A user-friendly error message
 */
export const getUserFriendlyErrorMessage = (error) => {
  const errorType = categorizeApiError(error);
  
  switch (errorType) {
    case API_ERROR_TYPES.CONNECTION_REFUSED:
      return "Cannot connect to the server. The service might be down or starting up.";
      
    case API_ERROR_TYPES.CONNECTION_TIMEOUT:
      return "The server is taking too long to respond. Please try again later.";
      
    case API_ERROR_TYPES.RATE_LIMITED:
      if (error.response?.data?.message?.includes('authentication attempts')) {
        return "Too many login attempts. Your account is temporarily locked. Please try again later.";
      }
      return "You've made too many requests. Please wait before trying again.";
      
    case API_ERROR_TYPES.AUTHENTICATION_FAILED:
      return "Authentication failed. Please check your credentials and try again.";
      
    case API_ERROR_TYPES.SERVER_ERROR:
      return "The server encountered an error. Please try again later.";
      
    case API_ERROR_TYPES.NOT_FOUND:
      return "The requested resource was not found.";
      
    case API_ERROR_TYPES.VALIDATION_ERROR:
      // Try to extract validation message from response
      const validationMessage = error.response?.data?.message;
      return validationMessage || "Please check your input and try again.";
      
    default:
      return "An unexpected error occurred. Please try again later.";
  }
};

/**
 * Check if an error is due to Render.com free tier spinning up
 * @param {Error} error - The error object from axios
 * @returns {boolean} True if it's likely a Render free tier issue
 */
export const isRenderStartupIssue = (error) => {
  const errorType = categorizeApiError(error);
  return errorType === API_ERROR_TYPES.CONNECTION_REFUSED || 
         errorType === API_ERROR_TYPES.CONNECTION_TIMEOUT;
};

/**
 * Get suggestions for dealing with Render.com free tier issues
 * @returns {string[]} Array of suggestion messages
 */
export const getRenderFreeServiceSuggestions = () => {
  return [
    "The backend service might be spinning up after inactivity (Render.com free tier)",
    "Wait 1-2 minutes for the service to start up",
    "Try refreshing the page in a moment",
    "If the problem persists, contact the administrator"
  ];
};

/**
 * Generate error details for logging or debugging
 * @param {Error} error - The error object from axios
 * @returns {Object} Structured error details
 */
export const getErrorDetails = (error) => {
  return {
    type: categorizeApiError(error),
    message: error.message,
    status: error.response?.status,
    data: error.response?.data,
    code: error.code
  };
};

export default {
  categorizeApiError,
  getUserFriendlyErrorMessage,
  isRenderStartupIssue,
  getRenderFreeServiceSuggestions,
  getErrorDetails,
  API_ERROR_TYPES
};
