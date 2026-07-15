import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Loader,
  User,
  Briefcase,
  Calendar,
  Award,
  TrendingUp,
  FileText,
  Building
} from 'lucide-react';
import hiringManagerService from '../../services/hiringManagerService';
import EvaluationFormModal from '../../components/EvaluationFormModal';

const HiringManagerShortlistPage = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [applications, setApplications] = useState([]);
  const [selectedApplication, setSelectedApplication] = useState(null);
  const [showEvaluationModal, setShowEvaluationModal] = useState(false);

  useEffect(() => {
    loadShortlisted();
  }, []);

  const loadShortlisted = async () => {
    try {
      setLoading(true);
      const data = await hiringManagerService.getShortlisted();
      setApplications(data);
    } catch (error) {
      console.error('Error loading shortlisted applications:', error);
      alert('Failed to load shortlisted candidates');
    } finally {
      setLoading(false);
    }
  };

  const handleReview = (application) => {
    if (application.interviewId) {
      // If there's an interview, open modal with full application data
      setSelectedApplication(application);
      setShowEvaluationModal(true);
    } else {
      alert('No interview scheduled for this application yet');
    }
  };

  const handleReviewPage = (application) => {
    if (application.interviewId) {
      // Navigate to dedicated evaluation page with applicationId
      navigate(`/hiring-manager/evaluate/${application.interviewId}`, { 
        state: { applicationId: application.id } 
      });
    } else {
      alert('No interview scheduled for this application yet');
    }
  };

  const handleEvaluationSuccess = () => {
    // Reload the list to show updated status
    loadShortlisted();
  };

  const getMatchScoreColor = (score) => {
    if (!score) return 'bg-gray-100 text-gray-700';
    if (score >= 80) return 'bg-green-100 text-green-800';
    if (score >= 60) return 'bg-yellow-100 text-yellow-800';
    return 'bg-red-100 text-red-800';
  };

  const getMatchScoreBarColor = (score) => {
    if (!score) return 'bg-gray-300';
    if (score >= 80) return 'bg-green-500';
    if (score >= 60) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  const getStatusColor = (status) => {
    const colors = {
      Shortlisted: 'bg-green-100 text-green-800',
      InterviewScheduled: 'bg-blue-100 text-blue-800',
      Interviewed: 'bg-indigo-100 text-indigo-800',
      Hired: 'bg-emerald-100 text-emerald-800',
      Rejected: 'bg-red-100 text-red-800'
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  const formatStatus = (status) => {
    const formatted = {
      Shortlisted: 'Shortlisted',
      InterviewScheduled: 'Interview Scheduled',
      Interviewed: 'Interviewed',
      Hired: 'Hired',
      Rejected: 'Rejected'
    };
    return formatted[status] || status;
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'Not scheduled';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader className="w-8 h-8 text-purple-600 animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Shortlisted Candidates</h1>
        <p className="text-gray-600 mt-2">
          Review and evaluate candidates who have been shortlisted for interviews
        </p>
      </div>

      {/* Stats Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-green-500">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-medium text-gray-600">Total Shortlisted</h3>
            <TrendingUp className="w-5 h-5 text-green-500" />
          </div>
          <p className="text-3xl font-bold text-gray-900">{applications.length}</p>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-blue-500">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-medium text-gray-600">Interviews Scheduled</h3>
            <Calendar className="w-5 h-5 text-blue-500" />
          </div>
          <p className="text-3xl font-bold text-gray-900">
            {applications.filter(a => a.interviewScheduledAt).length}
          </p>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-purple-500">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-medium text-gray-600">Awaiting Review</h3>
            <FileText className="w-5 h-5 text-purple-500" />
          </div>
          <p className="text-3xl font-bold text-gray-900">
            {applications.filter(a => a.status === 'Shortlisted').length}
          </p>
        </div>
      </div>

      {/* Applications Table */}
      <div className="bg-white rounded-lg shadow-lg overflow-hidden">
        <div className="px-6 py-4 bg-gray-50 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">
            Candidates ({applications.length})
          </h2>
        </div>

        {applications.length === 0 ? (
          <div className="text-center py-16">
            <User className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              No shortlisted candidates yet
            </h3>
            <p className="text-gray-600">
              Candidates will appear here once recruiters shortlist them
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Candidate
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Job Title
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Match Score
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Interview Date
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {applications.map((app) => (
                  <tr key={app.id} className="hover:bg-gray-50 transition">
                    {/* Candidate Info */}
                    <td className="px-6 py-4">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10 rounded-full bg-purple-100 flex items-center justify-center">
                          <User className="w-5 h-5 text-purple-600" />
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">
                            {app.candidateName}
                          </div>
                          <div className="text-sm text-gray-500">
                            {app.candidateEmail}
                          </div>
                        </div>
                      </div>
                    </td>

                    {/* Job Title */}
                    <td className="px-6 py-4">
                      <div className="flex items-start gap-2">
                        <Briefcase className="w-4 h-4 text-gray-400 flex-shrink-0 mt-0.5" />
                        <div>
                          <div className="text-sm font-medium text-gray-900">
                            {app.jobTitle}
                          </div>
                          <div className="text-xs text-gray-500 flex items-center gap-1 mt-1">
                            <Building className="w-3 h-3" />
                            {app.departmentName}
                          </div>
                        </div>
                      </div>
                    </td>

                    {/* Match Score */}
                    <td className="px-6 py-4">
                      {app.matchScore ? (
                        <div className="space-y-2">
                          {/* Progress Bar */}
                          <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
                            <div
                              className={`h-full ${getMatchScoreBarColor(app.matchScore)} transition-all duration-300`}
                              style={{ width: `${app.matchScore}%` }}
                            />
                          </div>
                          {/* Percentage Badge */}
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${getMatchScoreColor(app.matchScore)}`}>
                            <Award className="w-3 h-3 mr-1" />
                            {Math.round(app.matchScore)}%
                          </span>
                        </div>
                      ) : (
                        <span className="text-sm text-gray-400">N/A</span>
                      )}
                    </td>

                    {/* Status */}
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(app.status)}`}>
                        {formatStatus(app.status)}
                      </span>
                    </td>

                    {/* Interview Date */}
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-1.5 text-sm text-gray-600">
                        <Calendar className="w-4 h-4 flex-shrink-0" />
                        <span className="text-xs">
                          {formatDate(app.interviewScheduledAt)}
                        </span>
                      </div>
                    </td>

                    {/* Actions */}
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => handleReview(app)}
                          className="inline-flex items-center gap-1.5 px-3 py-2 bg-purple-600 text-white text-sm font-medium rounded-lg hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 transition"
                          title="Quick evaluation (modal)"
                        >
                          <FileText className="w-4 h-4" />
                          Quick
                        </button>
                        <button
                          onClick={() => handleReviewPage(app)}
                          className="inline-flex items-center gap-1.5 px-3 py-2 bg-gray-600 text-white text-sm font-medium rounded-lg hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 transition"
                          title="Full page evaluation"
                        >
                          <FileText className="w-4 h-4" />
                          Full
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Evaluation Modal */}
      <EvaluationFormModal
        isOpen={showEvaluationModal}
        onClose={() => setShowEvaluationModal(false)}
        interviewId={selectedApplication?.interviewId}
        applicationId={selectedApplication?.id}
        onSuccess={handleEvaluationSuccess}
      />
    </div>
  );
};

export default HiringManagerShortlistPage;
