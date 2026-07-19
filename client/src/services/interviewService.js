import api from './api';

const interviewService = {
  /**
   * Schedule an interview for an application
   * @param {Object} data - Interview data
   * @param {string} data.applicationId - Application ID
   * @param {string} data.scheduledAt - ISO datetime string
   * @param {number} data.durationMinutes - Interview duration in minutes
   * @param {string} data.meetingLink - Meeting link (optional)
   * @param {string} data.calendarToken - Google Calendar token (optional)
   * @returns {Promise} Created interview
   */
  scheduleInterview: async (data) => {
    const response = await api.post('/interviews', {
      ApplicationId: data.applicationId,
      ScheduledAt: data.scheduledAt,
      DurationMinutes: data.durationMinutes,
      MeetingLink: data.meetingLink || null,
      CalendarToken: data.calendarToken || null,
    });
    return response.data;
  },

  /**
   * Get my interviews (for candidates)
   * @returns {Promise} List of my interviews
   */
  getMyInterviews: async () => {
    const response = await api.get('/interviews/me');
    return response.data;
  },

  /**
   * Get upcoming interviews (for recruiters/hiring managers)
   * @returns {Promise} List of upcoming interviews
   */
  getUpcomingInterviews: async () => {
    const response = await api.get('/interviews/upcoming');
    return response.data;
  },

  /**
   * Cancel an interview
   * @param {string} id - Interview ID
   * @returns {Promise} Cancelled interview
   */
  cancelInterview: async (id) => {
    const response = await api.patch(`/interviews/${id}/cancel`);
    return response.data;
  },
};

export default interviewService;
