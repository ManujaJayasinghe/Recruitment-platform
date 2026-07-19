import api from './api';

const adminService = {
  /**
   * Get all users
   * @returns {Promise} List of users
   */
  getUsers: async () => {
    const response = await api.get('/admin/users');
    return response.data;
  },

  /**
   * Update user role
   * @param {string} userId - User ID
   * @param {string} role - New role
   * @returns {Promise} Updated user
   */
  updateUserRole: async (userId, role) => {
    const response = await api.patch(`/admin/users/${userId}/role`, { role });
    return response.data;
  },

  /**
   * Toggle user active status
   * @param {string} userId - User ID
   * @param {boolean} isActive - Active status
   * @returns {Promise} Updated user
   */
  toggleUserStatus: async (userId, isActive) => {
    const response = await api.patch(`/admin/users/${userId}/status`, { isActive });
    return response.data;
  },

  /**
   * Get all organizations
   * @returns {Promise} List of organizations
   */
  getOrganizations: async () => {
    const response = await api.get('/admin/organizations');
    return response.data;
  },

  /**
   * Create organization
   * @param {Object} data - Organization data
   * @returns {Promise} Created organization
   */
  createOrganization: async (data) => {
    const response = await api.post('/admin/organizations', data);
    return response.data;
  },

  /**
   * Create department
   * @param {Object} data - Department data
   * @returns {Promise} Created department
   */
  createDepartment: async (data) => {
    const response = await api.post('/admin/departments', data);
    return response.data;
  },

  /**
   * Get analytics data
   * @returns {Promise} Analytics data
   */
  getAnalytics: async () => {
    const response = await api.get('/analytics');
    return response.data;
  },

  /**
   * Get job analytics
   * @returns {Promise} Job analytics data
   */
  getJobAnalytics: async () => {
    const response = await api.get('/analytics/jobs');
    return response.data;
  },

  /**
   * Get application analytics
   * @returns {Promise} Application analytics data
   */
  getApplicationAnalytics: async () => {
    const response = await api.get('/analytics/applications');
    return response.data;
  },

  /**
   * Get user growth analytics
   * @returns {Promise} User growth data
   */
  getUserGrowth: async () => {
    const response = await api.get('/analytics/user-growth');
    return response.data;
  },
};

export default adminService;
