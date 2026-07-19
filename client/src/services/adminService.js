import api from './api';

const adminService = {
  /**
   * Get all users with pagination and filtering
   * @param {Object} params - Query parameters
   * @param {number} params.page - Page number
   * @param {number} params.pageSize - Page size
   * @param {string} params.role - Filter by role
   * @param {boolean} params.isActive - Filter by active status
   * @returns {Promise} Paginated list of users
   */
  getUsers: async (params = {}) => {
    const response = await api.get('/admin/users', { params });
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
   * Delete user
   * @param {string} userId - User ID
   * @returns {Promise} Deletion response
   */
  deleteUser: async (userId) => {
    const response = await api.delete(`/admin/users/${userId}`);
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
   * Update organization
   * @param {string} orgId - Organization ID
   * @param {Object} data - Organization data
   * @returns {Promise} Updated organization
   */
  updateOrganization: async (orgId, data) => {
    const response = await api.put(`/admin/organizations/${orgId}`, data);
    return response.data;
  },

  /**
   * Get all departments
   * @param {string} organizationId - Optional organization ID to filter
   * @returns {Promise} List of departments
   */
  getDepartments: async (organizationId = null) => {
    const params = organizationId ? { organizationId } : {};
    const response = await api.get('/admin/departments', { params });
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
   * Update department
   * @param {string} deptId - Department ID
   * @param {Object} data - Department data
   * @returns {Promise} Updated department
   */
  updateDepartment: async (deptId, data) => {
    const response = await api.put(`/admin/departments/${deptId}`, data);
    return response.data;
  },

  /**
   * Get analytics overview
   * @returns {Promise} Overview analytics data
   */
  getAnalyticsOverview: async () => {
    const response = await api.get('/analytics/overview');
    return response.data;
  },

  /**
   * Get applications over time
   * @param {string} groupBy - Group by 'month' or 'week'
   * @returns {Promise} Time series data
   */
  getApplicationsOverTime: async (groupBy = 'month') => {
    const response = await api.get('/analytics/applications-over-time', { params: { groupBy } });
    return response.data;
  },

  /**
   * Get applications by status
   * @returns {Promise} Status distribution data
   */
  getApplicationsByStatus: async () => {
    const response = await api.get('/analytics/applications-by-status');
    return response.data;
  },

  /**
   * Get top skills demanded
   * @param {number} top - Number of top skills to return
   * @returns {Promise} Top skills data
   */
  getTopSkillsDemanded: async (top = 10) => {
    const response = await api.get('/analytics/top-skills-demanded', { params: { top } });
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
