import { useState, useEffect, useRef } from 'react';
import { X, Calendar, Clock, Video, Loader, AlertCircle } from 'lucide-react';
import interviewService from '../services/interviewService';

const InterviewScheduleModal = ({ 
  isOpen, 
  onClose, 
  applicant, 
  jobTitle,
  onSuccess 
}) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const modalRef = useRef(null);
  const closeButtonRef = useRef(null);
  
  // Form state
  const [scheduledDate, setScheduledDate] = useState('');
  const [scheduledTime, setScheduledTime] = useState('');
  const [duration, setDuration] = useState(60);
  const [meetingLink, setMeetingLink] = useState('');
  const [calendarToken, setCalendarToken] = useState('');
  const [useCalendarIntegration, setUseCalendarIntegration] = useState(false);

  // Handle Escape key
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape' && isOpen && !loading) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      // Focus the close button when modal opens
      closeButtonRef.current?.focus();
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
    };
  }, [isOpen, loading, onClose]);

  // Trap focus within modal
  useEffect(() => {
    if (!isOpen) return;

    const modal = modalRef.current;
    if (!modal) return;

    const focusableElements = modal.querySelectorAll(
      'button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'
    );

    const firstElement = focusableElements[0];
    const lastElement = focusableElements[focusableElements.length - 1];

    const handleTabKey = (e) => {
      if (e.key !== 'Tab') return;

      if (e.shiftKey) {
        if (document.activeElement === firstElement) {
          e.preventDefault();
          lastElement.focus();
        }
      } else {
        if (document.activeElement === lastElement) {
          e.preventDefault();
          firstElement.focus();
        }
      }
    };

    modal.addEventListener('keydown', handleTabKey);
    return () => modal.removeEventListener('keydown', handleTabKey);
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    // Validation
    if (!scheduledDate || !scheduledTime) {
      setError('Please select both date and time');
      return;
    }

    if (!meetingLink && !useCalendarIntegration) {
      setError('Please provide a meeting link or enable calendar integration');
      return;
    }

    if (useCalendarIntegration && !calendarToken) {
      setError('Please provide a calendar token to use calendar integration');
      return;
    }

    try {
      setLoading(true);

      // Combine date and time into ISO string
      const scheduledDateTime = new Date(`${scheduledDate}T${scheduledTime}`).toISOString();

      const interviewData = {
        applicationId: applicant.applicationId,
        scheduledAt: scheduledDateTime,
        durationMinutes: parseInt(duration),
        meetingLink: useCalendarIntegration ? null : meetingLink,
        calendarToken: useCalendarIntegration ? calendarToken : null,
      };

      await interviewService.scheduleInterview(interviewData);

      // Call success callback to update the parent component
      if (onSuccess) {
        onSuccess(applicant.applicationId);
      }

      // Close modal
      onClose();
    } catch (err) {
      console.error('Error scheduling interview:', err);
      setError(err.response?.data?.message || 'Failed to schedule interview. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const getMinDateTime = () => {
    const now = new Date();
    now.setHours(now.getHours() + 1); // At least 1 hour in the future
    return now.toISOString().slice(0, 16);
  };

  const getMinDate = () => {
    return new Date().toISOString().split('T')[0];
  };

  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
    >
      <div 
        ref={modalRef}
        className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 sticky top-0 bg-white">
          <h3 id="modal-title" className="text-xl font-semibold text-gray-900">
            Schedule Interview
          </h3>
          <button
            ref={closeButtonRef}
            onClick={onClose}
            disabled={loading}
            aria-label="Close modal"
            className="text-gray-400 hover:text-gray-600 transition disabled:opacity-50"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Content */}
        <form onSubmit={handleSubmit} className="p-6">
          {/* Candidate Info */}
          <div className="mb-6 p-4 bg-gray-50 rounded-lg">
            <h4 className="text-sm font-semibold text-gray-700 mb-2">Candidate Information</h4>
            <p className="font-medium text-gray-900">{applicant.candidateName}</p>
            <p className="text-sm text-gray-600">{applicant.candidateEmail}</p>
            {jobTitle && (
              <p className="text-sm text-gray-600 mt-1">
                Position: <span className="font-medium">{jobTitle}</span>
              </p>
            )}
          </div>

          {/* Error Message */}
          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-red-800">{error}</p>
            </div>
          )}

          {/* Date and Time */}
          <div className="mb-6 grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="scheduledDate" className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2">
                <Calendar className="w-4 h-4" />
                Interview Date
                <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                id="scheduledDate"
                value={scheduledDate}
                onChange={(e) => setScheduledDate(e.target.value)}
                min={getMinDate()}
                required
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none"
              />
            </div>

            <div>
              <label htmlFor="scheduledTime" className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2">
                <Clock className="w-4 h-4" />
                Interview Time
                <span className="text-red-500">*</span>
              </label>
              <input
                type="time"
                id="scheduledTime"
                value={scheduledTime}
                onChange={(e) => setScheduledTime(e.target.value)}
                required
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none"
              />
            </div>
          </div>

          {/* Duration */}
          <div className="mb-6">
            <label htmlFor="duration" className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2">
              <Clock className="w-4 h-4" />
              Duration
              <span className="text-red-500">*</span>
            </label>
            <select
              id="duration"
              value={duration}
              onChange={(e) => setDuration(e.target.value)}
              required
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none bg-white"
            >
              <option value={15}>15 minutes</option>
              <option value={30}>30 minutes</option>
              <option value={45}>45 minutes</option>
              <option value={60}>1 hour</option>
              <option value={90}>1.5 hours</option>
              <option value={120}>2 hours</option>
            </select>
          </div>

          {/* Calendar Integration Toggle */}
          <div className="mb-6">
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={useCalendarIntegration}
                onChange={(e) => setUseCalendarIntegration(e.target.checked)}
                className="w-4 h-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
              />
              <span className="text-sm font-medium text-gray-700">
                Use Google Calendar Integration (auto-generate meeting link)
              </span>
            </label>
            <p className="text-xs text-gray-500 mt-1 ml-7">
              If enabled, a Google Meet link will be automatically created
            </p>
          </div>

          {/* Calendar Token (if integration enabled) */}
          {useCalendarIntegration && (
            <div className="mb-6">
              <label htmlFor="calendarToken" className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2">
                Google Calendar Token
                <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                id="calendarToken"
                value={calendarToken}
                onChange={(e) => setCalendarToken(e.target.value)}
                placeholder="Enter your Google Calendar OAuth token"
                required={useCalendarIntegration}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none"
              />
              <p className="text-xs text-gray-500 mt-1">
                Get your token from{' '}
                <a 
                  href="https://developers.google.com/oauthplayground" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-indigo-600 hover:text-indigo-700 underline"
                >
                  Google OAuth Playground
                </a>
                {' '}(scope: calendar.events)
              </p>
            </div>
          )}

          {/* Meeting Link (if not using calendar integration) */}
          {!useCalendarIntegration && (
            <div className="mb-6">
              <label htmlFor="meetingLink" className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2">
                <Video className="w-4 h-4" />
                Meeting Link
                <span className="text-red-500">*</span>
              </label>
              <input
                type="url"
                id="meetingLink"
                value={meetingLink}
                onChange={(e) => setMeetingLink(e.target.value)}
                placeholder="https://meet.google.com/... or https://zoom.us/..."
                required={!useCalendarIntegration}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none"
              />
              <p className="text-xs text-gray-500 mt-1">
                Enter the video conference link for this interview
              </p>
            </div>
          )}

          {/* Actions */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-200">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="px-6 py-2.5 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 transition disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2.5 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 transition disabled:opacity-50 flex items-center gap-2"
            >
              {loading ? (
                <>
                  <Loader className="w-5 h-5 animate-spin" />
                  Scheduling...
                </>
              ) : (
                <>
                  <Calendar className="w-5 h-5" />
                  Schedule Interview
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default InterviewScheduleModal;
