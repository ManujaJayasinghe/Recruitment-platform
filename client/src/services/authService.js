import api from './api';

const authService = {
  /**
   * Register a new user
   * @param {Object} data - Registration data
   * @param {string} data.fullName - User's full name
   * @param {string} data.email - User's email
   * @param {string} data.password - User's password
   * @param {string} data.role - User role (Candidate, Recruiter, HiringManager, Admin)
   * @returns {Promise} Response with token and user info
   */
  register: async (data) => {
    const response = await api.post('/auth/register', data);
    
    // Store token and user info in localStorage
    if (response.data.token) {
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('userId', response.data.userId);
      localStorage.setItem('role', response.data.role);
      localStorage.setItem('user', JSON.stringify({
        userId: response.data.userId,
        fullName: response.data.fullName,
        role: response.data.role,
        expiresAt: response.data.expiresAt,
      }));
    }
    
    return response.data;
  },

  /**
   * Login user
   * @param {Object} data - Login credentials
   * @param {string} data.email - User's email
   * @param {string} data.password - User's password
   * @returns {Promise} Response with token and user info
   */
  login: async (data) => {
    const response = await api.post('/auth/login', data);
    
    // Store token and user info in localStorage
    if (response.data.token) {
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('userId', response.data.userId);
      localStorage.setItem('role', response.data.role);
      localStorage.setItem('user', JSON.stringify({
        userId: response.data.userId,
        fullName: response.data.fullName,
        role: response.data.role,
        expiresAt: response.data.expiresAt,
      }));
    }
    
    return response.data;
  },

  /**
   * Logout user
   */
  logout: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('userId');
    localStorage.removeItem('role');
    localStorage.removeItem('user');
    window.location.href = '/login';
  },

  /**
   * Get current user from localStorage
   * @returns {Object|null} User object or null if not logged in
   */
  getCurrentUser: () => {
    const userStr = localStorage.getItem('user');
    if (userStr) {
      try {
        return JSON.parse(userStr);
      } catch (e) {
        return null;
      }
    }
    return null;
  },

  /**
   * Get current user's role
   * @returns {string|null} User role or null
   */
  getCurrentRole: () => {
    return localStorage.getItem('role');
  },

  /**
   * Check if user is authenticated
   * @returns {boolean} True if authenticated
   */
  isAuthenticated: () => {
    const token = localStorage.getItem('token');
    const user = authService.getCurrentUser();
    
    if (!token || !user) {
      return false;
    }
    
    // Check if token is expired
    if (user.expiresAt) {
      const expiryDate = new Date(user.expiresAt);
      if (expiryDate < new Date()) {
        authService.logout();
        return false;
      }
    }
    
    return true;
  },
};

export default authService;
