import api from './api';

const messageService = {
  /**
   * Get message thread for an application
   * @param {string} applicationId - Application ID
   * @returns {Promise} List of messages
   */
  getThread: async (applicationId) => {
    const response = await api.get(`/messages/application/${applicationId}`);
    return response.data;
  },

  /**
   * Send a message in an application thread
   * @param {Object} data - Message data
   * @param {string} data.applicationId - Application ID
   * @param {string} data.body - Message body
   * @returns {Promise} Sent message
   */
  sendMessage: async (data) => {
    const response = await api.post('/messages', {
      ApplicationId: data.applicationId,
      Body: data.body,
    });
    return response.data;
  },
};

export default messageService;
