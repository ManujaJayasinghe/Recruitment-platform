import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';
import { 
  Briefcase, 
  Calendar, 
  ChevronDown, 
  ChevronUp, 
  MessageSquare,
  Loader,
  FileText,
  Send,
  CheckCircle,
  Clock,
  Users,
  AlertCircle
} from 'lucide-react';
import LoadingSpinner from '../../components/LoadingSpinner';
import ErrorMessage from '../../components/ErrorMessage';
import EmptyState from '../../components/EmptyState';

const CandidateApplicationsPage = () => {
  const navigate = useNavigate();
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [expandedId, setExpandedId] = useState(null);
  const [messages, setMessages] = useState({});
  const [loadingMessages, setLoadingMessages] = useState({});
  const [newMessage, setNewMessage] = useState({});
  const [sendingMessage, setSendingMessage] = useState({});

  useEffect(() => {
    loadApplications();
  }, []);

  const loadApplications = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await api.get('/applications/me');
      setApplications(response.data || []);
    } catch (error) {
      console.error('Error loading applications:', error);
      setError('Failed to load your applications. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const loadMessages = async (applicationId) => {
    if (messages[applicationId]) return; // Already loaded

    try {
      setLoadingMessages(prev => ({ ...prev, [applicationId]: true }));
      const response = await api.get(`/messages/application/${applicationId}`);
      setMessages(prev => ({ ...prev, [applicationId]: response.data || [] }));
    } catch (error) {
      console.error('Error loading messages:', error);
      setMessages(prev => ({ ...prev, [applicationId]: [] }));
    } finally {
      setLoadingMessages(prev => ({ ...prev, [applicationId]: false }));
    }
  };

  const handleExpandToggle = (applicationId) => {
    if (expandedId === applicationId) {
      setExpandedId(null);
    } else {
      setExpandedId(applicationId);
      loadMessages(applicationId);
    }
  };

  const handleSendMessage = async (applicationId) => {
    const messageBody = newMessage[applicationId]?.trim();
    if (!messageBody) return;

    try {
      setSendingMessage(prev => ({ ...prev, [applicationId]: true }));
      await api.post('/messages', {
        ApplicationId: applicationId,
        Body: messageBody
      });
      
      // Reload messages
      setMessages(prev => ({ ...prev, [applicationId]: null }));
      await loadMessages(applicationId);
      
      // Clear input
      setNewMessage(prev => ({ ...prev, [applicationId]: '' }));
    } catch (error) {
      console.error('Error sending message:', error);
      alert('Failed to send message. Please try again.');
    } finally {
      setSendingMessage(prev => ({ ...prev, [applicationId]: false }));
    }
  };

  const getStatusColor = (status) => {
    const statusColors = {
      Applied: 'bg-blue-100 text-blue-800 border-blue-200',
      Screening: 'bg-yellow-100 text-yellow-800 border-yellow-200',
      Shortlisted: 'bg-purple-100 text-purple-800 border-purple-200',
      Interview: 'bg-indigo-100 text-indigo-800 border-indigo-200',
      Offered: 'bg-green-100 text-green-800 border-green-200',
      Rejected: 'bg-red-100 text-red-800 border-red-200',
      Withdrawn: 'bg-gray-100 text-gray-800 border-gray-200'
    };
    return statusColors[status] || 'bg-gray-100 text-gray-800 border-gray-200';
  };

  const getStatusIcon = (status) => {
    const icons = {
      Applied: <FileText className="w-4 h-4" />,
      Screening: <Clock className="w-4 h-4" />,
      Shortlisted: <CheckCircle className="w-4 h-4" />,
      Interview: <Users className="w-4 h-4" />,
      Offered: <CheckCircle className="w-4 h-4" />,
      Rejected: <AlertCircle className="w-4 h-4" />,
      Withdrawn: <AlertCircle className="w-4 h-4" />
    };
    return icons[status] || <FileText className="w-4 h-4" />;
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const formatMessageTime = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor((now - date) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return 'Just now';
    if (diffInHours < 24) return `${diffInHours}h ago`;
    if (diffInHours < 48) return 'Yesterday';
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  const renderStatusPipeline = (currentStatus) => {
    const stages = [
      { name: 'Applied', key: 'Applied' },
      { name: 'Screening', key: 'Screening' },
      { name: 'Shortlisted', key: 'Shortlisted' },
      { name: 'Interview', key: 'Interview' },
      { name: 'Decision', key: ['Offered', 'Rejected', 'Withdrawn'] }
    ];

    const currentIndex = stages.findIndex(stage => 
      Array.isArray(stage.key) ? stage.key.includes(currentStatus) : stage.key === currentStatus
    );

    return (
      <div className="flex items-center justify-between mb-6 px-4">
        {stages.map((stage, index) => {
          const isActive = index === currentIndex;
          const isPast = index < currentIndex;
          const isFuture = index > currentIndex;
          
          return (
            <div key={stage.name} className="flex items-center flex-1">
              {/* Stage Circle */}
              <div className="flex flex-col items-center flex-1">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold text-sm border-2 transition-all ${
                  isActive 
                    ? 'bg-indigo-600 text-white border-indigo-600 scale-110' 
                    : isPast
                    ? 'bg-green-500 text-white border-green-500'
                    : 'bg-gray-200 text-gray-500 border-gray-300'
                }`}>
                  {isPast ? '✓' : index + 1}
                </div>
                <span className={`text-xs mt-2 font-medium ${
                  isActive ? 'text-indigo-600' : isPast ? 'text-green-600' : 'text-gray-500'
                }`}>
                  {stage.name}
                </span>
              </div>
              
              {/* Connector Line */}
              {index < stages.length - 1 && (
                <div className={`h-0.5 flex-1 mx-2 ${
                  isPast ? 'bg-green-500' : 'bg-gray-300'
                }`} />
              )}
            </div>
          );
        })}
      </div>
    );
  };

  if (loading) {
    return <LoadingSpinner size="lg" text="Loading your applications..." />;
  }

  if (error) {
    return (
      <ErrorMessage
        title="Unable to load applications"
        message={error}
        onRetry={loadApplications}
      />
    );
  }

  return (
    <div className="max-w-6xl mx-auto">
      <div className="mb-6 sm:mb-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">My Applications</h1>
        <p className="text-sm sm:text-base text-gray-600 mt-2">Track the status of your job applications</p>
      </div>

      {applications.length === 0 ? (
        <EmptyState
          icon={Briefcase}
          title="No applications yet"
          message="Start applying to jobs to track your applications here. Browse available positions and submit your application today!"
          actionLabel="Browse Jobs"
          onAction={() => navigate('/candidate/jobs')}
        />
      ) : (
        <div className="space-y-4">
          {applications.map((app) => {
            const isExpanded = expandedId === app.id;
            const appMessages = messages[app.id] || [];
            const isLoadingMessages = loadingMessages[app.id];
            const isSending = sendingMessage[app.id];

            return (
              <div
                key={app.id}
                className="bg-white rounded-lg shadow border border-gray-200 overflow-hidden transition-all"
              >
                {/* Application Row */}
                <div
                  className="p-4 sm:p-6 cursor-pointer hover:bg-gray-50 transition"
                  onClick={() => handleExpandToggle(app.id)}
                >
                  <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-col gap-3">
                        <div className="flex-1">
                          <h3 className="text-base sm:text-lg font-bold text-gray-900 mb-1">
                            {app.jobTitle}
                          </h3>
                          <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 text-xs sm:text-sm text-gray-600">
                            {app.department && (
                              <div className="flex items-center gap-1.5">
                                <Briefcase className="w-4 h-4 flex-shrink-0" />
                                <span className="truncate">{app.department}</span>
                              </div>
                            )}
                            <div className="flex items-center gap-1.5">
                              <Calendar className="w-4 h-4 flex-shrink-0" />
                              Applied {formatDate(app.appliedAt)}
                            </div>
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-3">
                          <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs sm:text-sm font-medium border ${getStatusColor(app.status)}`}>
                            {getStatusIcon(app.status)}
                            {app.status}
                          </span>
                          
                          {isExpanded ? (
                            <ChevronUp className="w-5 h-5 text-gray-400" />
                          ) : (
                            <ChevronDown className="w-5 h-5 text-gray-400" />
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Expanded Content */}
                {isExpanded && (
                  <div className="border-t border-gray-200 bg-gray-50 p-4 sm:p-6">
                    {/* Status Pipeline */}
                    <div className="bg-white rounded-lg p-4 sm:p-6 mb-4 sm:mb-6 shadow-sm">
                      <h4 className="text-xs sm:text-sm font-semibold text-gray-700 mb-4">Application Progress</h4>
                      <div className="overflow-x-auto -mx-4 sm:mx-0">
                        <div className="min-w-[500px]">
                          {renderStatusPipeline(app.status)}
                        </div>
                      </div>
                    </div>

                    {/* Messages Section */}
                    <div className="bg-white rounded-lg p-4 sm:p-6 shadow-sm">
                      <div className="flex items-center gap-2 mb-4">
                        <MessageSquare className="w-5 h-5 text-gray-700" />
                        <h4 className="text-sm font-semibold text-gray-700">Messages</h4>
                      </div>

                      {isLoadingMessages ? (
                        <div className="flex justify-center py-8">
                          <Loader className="w-6 h-6 text-indigo-600 animate-spin" />
                        </div>
                      ) : appMessages.length === 0 ? (
                        <p className="text-sm text-gray-500 text-center py-8">
                          No messages yet. Start a conversation with the recruiter.
                        </p>
                      ) : (
                        <div className="space-y-3 mb-4 max-h-64 overflow-y-auto">
                          {appMessages.map((msg) => (
                            <div
                              key={msg.id}
                              className="flex gap-3 text-sm"
                            >
                              <div className="flex-1 bg-gray-50 rounded-lg p-3">
                                <div className="flex items-baseline justify-between mb-1">
                                  <span className="font-medium text-gray-900">
                                    {msg.senderName}
                                  </span>
                                  <span className="text-xs text-gray-500">
                                    {formatMessageTime(msg.sentAt)}
                                  </span>
                                </div>
                                <p className="text-gray-700">{msg.body}</p>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}

                      {/* Send Message */}
                      <div className="flex gap-2">
                        <input
                          type="text"
                          value={newMessage[app.id] || ''}
                          onChange={(e) => setNewMessage(prev => ({ ...prev, [app.id]: e.target.value }))}
                          onKeyPress={(e) => {
                            if (e.key === 'Enter' && !isSending) {
                              handleSendMessage(app.id);
                            }
                          }}
                          placeholder="Type a message to the recruiter..."
                          className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none text-sm"
                          disabled={isSending}
                        />
                        <button
                          onClick={() => handleSendMessage(app.id)}
                          disabled={isSending || !newMessage[app.id]?.trim()}
                          className="px-4 py-2 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                        >
                          {isSending ? (
                            <Loader className="w-4 h-4 animate-spin" />
                          ) : (
                            <Send className="w-4 h-4" />
                          )}
                          Send
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default CandidateApplicationsPage;
