import api from './api';

const candidateService = {
  /**
   * Get candidate profile
   * @returns {Promise} Candidate profile data
   */
  getProfile: async () => {
    const response = await api.get('/candidates/me');
    return response.data;
  },

  /**
   * Update candidate profile
   * @param {Object} data - Profile update data
   * @returns {Promise} Updated profile
   */
  updateProfile: async (data) => {
    const response = await api.put('/candidates/me', data);
    return response.data;
  },

  /**
   * Upload resume
   * @param {File} file - Resume file
   * @param {Function} onUploadProgress - Progress callback
   * @returns {Promise} Upload result
   */
  uploadResume: async (file, onUploadProgress) => {
    const formData = new FormData();
    formData.append('file', file);
    
    const response = await api.post('/candidates/me/resume', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
      onUploadProgress: onUploadProgress,
    });
    return response.data;
  },

  /**
   * Get candidate's applications
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

  /**
   * Apply for a job
   * @param {string} jobPostingId - Job posting ID
   * @returns {Promise} Application result
   */
  applyForJob: async (jobPostingId) => {
    const response = await api.post('/applications', { jobPostingId });
    return response.data;
  },

  /**
   * Send message
   * @param {Object} data - Message data
   * @param {string} data.receiverId - Receiver user ID
   * @param {string} data.content - Message content
   * @returns {Promise} Sent message
   */
  sendMessage: async (data) => {
    const response = await api.post('/messages', data);
    return response.data;
  },

  /**
   * Get messages
   * @returns {Promise} List of messages
   */
  getMessages: async () => {
    const response = await api.get('/messages');
    return response.data;
  },

  /**
   * Get conversation with user
   * @param {string} userId - Other user ID
   * @returns {Promise} Conversation messages
   */
  getConversation: async (userId) => {
    const response = await api.get(`/messages/conversation/${userId}`);
    return response.data;
  },

  /**
   * Mark messages as read
   * @param {string} senderId - Sender user ID
   * @returns {Promise} Success response
   */
  markMessagesAsRead: async (senderId) => {
    const response = await api.patch(`/messages/mark-read/${senderId}`);
    return response.data;
  },

  /**
   * Send message to AI chatbot
   * @param {string} message - User message
   * @returns {Promise} Chatbot response
   */
  askChatbot: async (message) => {
    const response = await api.post('/chatbot/ask', { message });
    return response.data;
  },
};

export default candidateService;
