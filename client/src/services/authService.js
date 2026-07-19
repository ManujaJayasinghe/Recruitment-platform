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
    
    // Handle both camelCase and PascalCase from API
    const userData = {
      token: response.data.token || response.data.Token,
      userId: response.data.userId || response.data.UserId,
      fullName: response.data.fullName || response.data.FullName,
      role: response.data.role || response.data.Role,
      expiresAt: response.data.expiresAt || response.data.ExpiresAt
    };
    
    // Store token and user info in localStorage
    if (userData.token) {
      localStorage.setItem('token', userData.token);
      localStorage.setItem('userId', userData.userId);
      localStorage.setItem('role', userData.role);
      localStorage.setItem('user', JSON.stringify({
        userId: userData.userId,
        fullName: userData.fullName,
        role: userData.role,
        expiresAt: userData.expiresAt,
      }));
    }
    
    return userData;
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
    
    // Handle both camelCase and PascalCase from API
    const userData = {
      token: response.data.token || response.data.Token,
      userId: response.data.userId || response.data.UserId,
      fullName: response.data.fullName || response.data.FullName,
      role: response.data.role || response.data.Role,
      expiresAt: response.data.expiresAt || response.data.ExpiresAt
    };
    
    // Store token and user info in localStorage
    if (userData.token) {
      localStorage.setItem('token', userData.token);
      localStorage.setItem('userId', userData.userId);
      localStorage.setItem('role', userData.role);
      localStorage.setItem('user', JSON.stringify({
        userId: userData.userId,
        fullName: userData.fullName,
        role: userData.role,
        expiresAt: userData.expiresAt,
      }));
    }
    
    return userData;
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
