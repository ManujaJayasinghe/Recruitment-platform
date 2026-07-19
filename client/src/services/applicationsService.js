import api from './api';

const applicationsService = {
  /**
   * Create application (candidate applies for job)
   * @param {string} jobPostingId - Job posting ID
   * @returns {Promise} Created application
   */
  createApplication: async (jobPostingId) => {
    const response = await api.post('/applications', { jobPostingId });
    return response.data;
  },

  /**
   * Get my applications (candidate)
   * @returns {Promise} List of applications
   */
  getMyApplications: async () => {
    const response = await api.get('/applications/me');
    return response.data;
  },

  /**
   * Get application by ID
   * @param {string} id - Application ID
   * @returns {Promise} Application details
   */
  getApplicationById: async (id) => {
    const response = await api.get(`/applications/${id}`);
    return response.data;
  },
};

export default applicationsService;
