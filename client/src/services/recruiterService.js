import api from './api';

const recruiterService = {
  /**
   * Create a new job posting
   * @param {Object} data - Job posting data
   * @returns {Promise} Created job posting
   */
  createJob: async (data) => {
    const response = await api.post('/recruiter/jobs', data);
    return response.data;
  },

  /**
   * Update job posting
   * @param {string} id - Job posting ID
   * @param {Object} data - Updated job data
   * @returns {Promise} Updated job posting
   */
  updateJob: async (id, data) => {
    const response = await api.put(`/recruiter/jobs/${id}`, data);
    return response.data;
  },

  /**
   * Update job status
   * @param {string} id - Job posting ID
   * @param {string} status - New status (Draft, Open, Closed)
   * @returns {Promise} Updated job status
   */
  updateJobStatus: async (id, status) => {
    const response = await api.patch(`/recruiter/jobs/${id}/status`, { status });
    return response.data;
  },

  /**
   * Get my job postings
   * @returns {Promise} List of job postings
   */
  getMyJobs: async () => {
    const response = await api.get('/recruiter/jobs');
    return response.data;
  },

  /**
   * Get job posting by ID
   * @param {string} id - Job posting ID
   * @returns {Promise} Job posting details
   */
  getJobById: async (id) => {
    const response = await api.get(`/recruiter/jobs/${id}`);
    return response.data;
  },

  /**
   * Delete job posting
   * @param {string} id - Job posting ID
   * @returns {Promise} Success response
   */
  deleteJob: async (id) => {
    const response = await api.delete(`/recruiter/jobs/${id}`);
    return response.data;
  },

  /**
   * Get applications for a job
   * @param {string} jobId - Job posting ID
   * @returns {Promise} List of applications
   */
  getJobApplications: async (jobId) => {
    const response = await api.get(`/recruiter/jobs/${jobId}/applications`);
    return response.data;
  },

  /**
   * Get ranked candidates for a job
   * @param {string} jobId - Job posting ID
   * @returns {Promise} Ranked candidates
   */
  getRankedCandidates: async (jobId) => {
    const response = await api.get(`/recruiter/jobs/${jobId}/ranked-candidates`);
    return response.data;
  },

  /**
   * Generate interview questions for a job
   * @param {string} jobId - Job posting ID
   * @returns {Promise} Generated interview questions
   */
  generateInterviewQuestions: async (jobId) => {
    const response = await api.post(`/recruiter/jobs/${jobId}/generate-interview-questions`);
    return response.data;
  },

  /**
   * Update application status
   * @param {string} applicationId - Application ID
   * @param {string} status - New status
   * @returns {Promise} Updated application
   */
  updateApplicationStatus: async (applicationId, status) => {
    const response = await api.patch(`/recruiter/applications/${applicationId}/status`, { status });
    return response.data;
  },

  /**
   * Search candidates
   * @param {Object} filters - Search filters
   * @param {string} filters.skills - Comma-separated skills
   * @param {number} filters.minExperience - Minimum years of experience
   * @param {string} filters.keyword - Keyword search
   * @param {number} filters.page - Page number
   * @param {number} filters.pageSize - Page size
   * @returns {Promise} Paginated candidate list
   */
  searchCandidates: async (filters = {}) => {
    const params = new URLSearchParams();
    if (filters.skills) params.append('skills', filters.skills);
    if (filters.minExperience) params.append('minExperience', filters.minExperience);
    if (filters.keyword) params.append('keyword', filters.keyword);
    if (filters.page) params.append('page', filters.page);
    if (filters.pageSize) params.append('pageSize', filters.pageSize);

    const response = await api.get(`/recruiter/candidates?${params.toString()}`);
    return response.data;
  },
};

export default recruiterService;
