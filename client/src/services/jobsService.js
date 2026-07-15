import api from './api';

const jobsService = {
  /**
   * Search jobs (public endpoint)
   * @param {Object} filters - Search filters
   * @param {string} filters.skills - Comma-separated skills
   * @param {number} filters.minExperience - Minimum years of experience
   * @param {string} filters.keyword - Keyword search
   * @param {string} filters.status - Job status filter
   * @param {number} filters.page - Page number
   * @param {number} filters.pageSize - Page size
   * @returns {Promise} Paginated job list
   */
  searchJobs: async (filters = {}) => {
    const params = new URLSearchParams();
    if (filters.skills) params.append('skills', filters.skills);
    if (filters.minExperience) params.append('minExperience', filters.minExperience);
    if (filters.keyword) params.append('keyword', filters.keyword);
    if (filters.status) params.append('status', filters.status);
    if (filters.page) params.append('page', filters.page);
    if (filters.pageSize) params.append('pageSize', filters.pageSize);

    const response = await api.get(`/jobs/search?${params.toString()}`);
    return response.data;
  },

  /**
   * Get job by ID
   * @param {string} id - Job posting ID
   * @returns {Promise} Job details
   */
  getJobById: async (id) => {
    const response = await api.get(`/jobs/${id}`);
    return response.data;
  },

  /**
   * Get job recommendations for candidate
   * @returns {Promise} List of recommended jobs
   */
  getRecommendations: async () => {
    const response = await api.get('/jobs/recommendations');
    return response.data;
  },

  /**
   * Chat with AI about a job
   * @param {string} jobId - Job posting ID
   * @param {string} question - User's question
   * @returns {Promise} AI response
   */
  chatAboutJob: async (jobId, question) => {
    const response = await api.post('/chatbot/ask', {
      jobPostingId: jobId,
      question,
    });
    return response.data;
  },
};

export default jobsService;
