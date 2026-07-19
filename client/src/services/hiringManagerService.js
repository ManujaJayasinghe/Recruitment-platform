import api from './api';

const hiringManagerService = {
  /**
   * Get my jobs
   * @returns {Promise} List of jobs
   */
  getMyJobs: async () => {
    const response = await api.get('/hiring-manager/my-jobs');
    return response.data;
  },

  /**
   * Get shortlisted applications
   * @returns {Promise} List of shortlisted applications
   */
  getShortlisted: async () => {
    const response = await api.get('/hiring-manager/shortlisted');
    return response.data;
  },

  /**
   * Schedule interview
   * @param {string} applicationId - Application ID
   * @param {Object} data - Interview data
   * @param {string} data.interviewDate - Interview date/time
   * @param {string} data.location - Interview location
   * @param {string} data.type - Interview type
   * @returns {Promise} Created interview
   */
  scheduleInterview: async (applicationId, data) => {
    const response = await api.post(`/hiring-manager/applications/${applicationId}/schedule-interview`, data);
    return response.data;
  },

  /**
   * Get my interviews
   * @returns {Promise} List of interviews
   */
  getMyInterviews: async () => {
    const response = await api.get('/interview');
    return response.data;
  },

  /**
   * Update interview
   * @param {string} id - Interview ID
   * @param {Object} data - Updated interview data
   * @returns {Promise} Updated interview
   */
  updateInterview: async (id, data) => {
    const response = await api.put(`/interview/${id}`, data);
    return response.data;
  },

  /**
   * Cancel interview
   * @param {string} id - Interview ID
   * @returns {Promise} Success response
   */
  cancelInterview: async (id) => {
    const response = await api.delete(`/interview/${id}`);
    return response.data;
  },

  /**
   * Submit interview feedback
   * @param {string} id - Interview ID
   * @param {Object} data - Feedback data
   * @returns {Promise} Updated interview
   */
  submitFeedback: async (id, data) => {
    const response = await api.patch(`/interview/${id}/feedback`, data);
    return response.data;
  },

  /**
   * Create evaluation for an interview
   * @param {Object} data - Evaluation data
   * @param {string} data.interviewId - Interview ID
   * @param {number} data.score - Score (1-10)
   * @param {string} data.feedback - Feedback text
   * @param {string} data.recommendation - Recommendation (Hire/Reject/NeedsAnotherRound)
   * @returns {Promise} Created evaluation
   */
  createEvaluation: async (data) => {
    const response = await api.post('/hiring-manager/evaluations', {
      InterviewId: data.interviewId,
      Score: data.score,
      Feedback: data.feedback,
      Recommendation: data.recommendation,
    });
    return response.data;
  },

  /**
   * Get evaluations for an interview
   * @param {string} interviewId - Interview ID
   * @returns {Promise} List of evaluations
   */
  getEvaluationsByInterview: async (interviewId) => {
    const response = await api.get(`/hiring-manager/evaluations/${interviewId}`);
    return response.data;
  },

  /**
   * Make a hiring decision for an application
   * @param {string} applicationId - Application ID
   * @param {string} decision - Decision ('Hired' or 'Rejected')
   * @returns {Promise} Decision response
   */
  makeDecision: async (applicationId, decision) => {
    const response = await api.patch(`/hiring-manager/applications/${applicationId}/decision`, {
      decision: decision
    });
    return response.data;
  },
};

export default hiringManagerService;
