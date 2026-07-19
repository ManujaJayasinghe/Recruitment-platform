import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Loader,
  ArrowLeft,
  User,
  Mail,
  Briefcase,
  Award,
  Calendar,
  CheckCircle,
  XCircle,
  Clock,
  MessageCircle
} from 'lucide-react';
import recruiterService from '../../services/recruiterService';
import InterviewScheduleModal from '../../components/InterviewScheduleModal';
import MessageThreadPanel from '../../components/MessageThreadPanel';

const RecruiterJobApplicantsPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [jobInfo, setJobInfo] = useState(null);
  const [applicants, setApplicants] = useState([]);
  const [showInterviewModal, setShowInterviewModal] = useState(false);
  const [showMessagePanel, setShowMessagePanel] = useState(false);
  const [selectedApplicant, setSelectedApplicant] = useState(null);

  useEffect(() => {
    loadData();
  }, [id]);

  const loadData = async () => {
    try {
      setLoading(true);
      const [jobData, applicantsData] = await Promise.all([
        recruiterService.getJobById(id),
        recruiterService.getJobApplications(id)
      ]);

      setJobInfo(jobData);
      setApplicants(applicantsData);
    } catch (error) {
      console.error('Error loading data:', error);
      alert('Failed to load applicants data');
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (applicationId, newStatus) => {
    try {
      await recruiterService.updateApplicationStatus(applicationId, newStatus);
      // Reload applicants to reflect the change
      const applicantsData = await recruiterService.getJobApplications(id);
      setApplicants(applicantsData);
    } catch (error) {
      console.error('Error updating status:', error);
      alert('Failed to update application status');
    }
  };

  const handleScheduleInterview = (applicant) => {
    setSelectedApplicant(applicant);
    setShowInterviewModal(true);
  };

  const handleInterviewSuccess = async () => {
    // Reload applicants to reflect the status change
    const applicantsData = await recruiterService.getJobApplications(id);
    setApplicants(applicantsData);
  };

  const handleOpenMessages = (applicant) => {
    setSelectedApplicant(applicant);
    setShowMessagePanel(true);
  };

  const getMatchScoreColor = (score) => {
    if (!score) return 'bg-gray-200 text-gray-700';
    if (score >= 80) return 'bg-green-500';
    if (score >= 60) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  const getMatchScoreBadgeColor = (score) => {
    if (!score) return 'bg-gray-100 text-gray-700';
    if (score >= 80) return 'bg-green-100 text-green-800';
    if (score >= 60) return 'bg-yellow-100 text-yellow-800';
    return 'bg-red-100 text-red-800';
  };

  const getStatusBadgeColor = (status) => {
    switch (status) {
      case 'Submitted':
        return 'bg-blue-100 text-blue-800';
      case 'UnderReview':
        return 'bg-purple-100 text-purple-800';
      case 'Shortlisted':
        return 'bg-green-100 text-green-800';
      case 'Rejected':
        return 'bg-red-100 text-red-800';
      case 'InterviewScheduled':
        return 'bg-indigo-100 text-indigo-800';
      case 'Interviewed':
        return 'bg-indigo-100 text-indigo-800';
      case 'Offered':
        return 'bg-emerald-100 text-emerald-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const formatStatus = (status) => {
    switch (status) {
      case 'UnderReview':
        return 'Under Review';
      case 'InterviewScheduled':
        return 'Interview Scheduled';
      default:
        return status;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader className="w-8 h-8 text-indigo-600 animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <button
          onClick={() => navigate('/recruiter/jobs')}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4 transition"
        >
          <ArrowLeft className="w-5 h-5" />
          Back to Jobs
        </button>
        
        {jobInfo && (
          <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              {jobInfo.title}
            </h1>
            <p className="text-gray-600 mb-4">{jobInfo.department}</p>
            <div className="flex items-center gap-4 text-sm text-gray-600">
              <span className="flex items-center gap-1">
                <User className="w-4 h-4" />
                {applicants.length} applicants
              </span>
              <span className="flex items-center gap-1">
                <Award className="w-4 h-4" />
                {jobInfo.minExperience}+ years required
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Applicants List */}
      <div className="bg-white rounded-lg shadow-lg overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 bg-gray-50 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">
            Applicants ({applicants.length})
          </h2>
        </div>

        {/* Empty State */}
        {applicants.length === 0 && (
          <div className="text-center py-16">
            <User className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              No applicants yet
            </h3>
            <p className="text-gray-600">
              Applications will appear here once candidates apply to this job
            </p>
          </div>
        )}

        {/* Applicants Table */}
        {applicants.length > 0 && (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Candidate
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Match Score
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Experience
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Applied
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {applicants.map((applicant) => (
                  <tr key={applicant.applicationId} className="hover:bg-gray-50 transition">
                    {/* Candidate Info */}
                    <td className="px-6 py-4">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10 rounded-full bg-indigo-100 flex items-center justify-center">
                          <User className="w-5 h-5 text-indigo-600" />
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">
                            {applicant.candidateName}
                          </div>
                          <div className="text-sm text-gray-500 flex items-center gap-1">
                            <Mail className="w-3 h-3" />
                            {applicant.candidateEmail}
                          </div>
                          {applicant.headline && (
                            <div className="text-xs text-gray-500 flex items-center gap-1 mt-1">
                              <Briefcase className="w-3 h-3" />
                              {applicant.headline}
                            </div>
                          )}
                        </div>
                      </div>
                    </td>

                    {/* Match Score */}
                    <td className="px-6 py-4">
                      {applicant.matchScore ? (
                        <div className="space-y-2">
                          {/* Progress Bar */}
                          <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
                            <div
                              className={`h-full ${getMatchScoreColor(applicant.matchScore)} transition-all duration-300`}
                              style={{ width: `${applicant.matchScore}%` }}
                            />
                          </div>
                          {/* Percentage Badge */}
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${getMatchScoreBadgeColor(applicant.matchScore)}`}>
                            {Math.round(applicant.matchScore)}%
                          </span>
                        </div>
                      ) : (
                        <span className="text-sm text-gray-400">N/A</span>
                      )}
                    </td>

                    {/* Experience */}
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <Award className="w-4 h-4 text-gray-400" />
                        <span className="text-sm text-gray-900">
                          {applicant.yearsOfExperience} {applicant.yearsOfExperience === 1 ? 'year' : 'years'}
                        </span>
                      </div>
                      {applicant.topSkills && applicant.topSkills.length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-2">
                          {applicant.topSkills.slice(0, 3).map((skill, idx) => (
                            <span
                              key={idx}
                              className="inline-block px-2 py-0.5 bg-blue-50 text-blue-700 text-xs rounded"
                            >
                              {skill}
                            </span>
                          ))}
                          {applicant.topSkills.length > 3 && (
                            <span className="inline-block px-2 py-0.5 bg-gray-100 text-gray-600 text-xs rounded">
                              +{applicant.topSkills.length - 3}
                            </span>
                          )}
                        </div>
                      )}
                    </td>

                    {/* Status */}
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${getStatusBadgeColor(applicant.status)}`}>
                        {formatStatus(applicant.status)}
                      </span>
                    </td>

                    {/* Applied Date */}
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-1 text-sm text-gray-600">
                        <Clock className="w-4 h-4" />
                        {new Date(applicant.appliedAt).toLocaleDateString()}
                      </div>
                    </td>

                    {/* Actions */}
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2 flex-wrap">
                        <button
                          onClick={() => handleOpenMessages(applicant)}
                          className="inline-flex items-center gap-1 px-3 py-1.5 bg-blue-600 text-white text-xs font-medium rounded hover:bg-blue-700 transition"
                          title="Send Message"
                        >
                          <MessageCircle className="w-3.5 h-3.5" />
                          Message
                        </button>
                        {applicant.status !== 'Shortlisted' && applicant.status !== 'Rejected' && (
                          <button
                            onClick={() => handleStatusChange(applicant.applicationId, 'Shortlisted')}
                            className="inline-flex items-center gap-1 px-3 py-1.5 bg-green-600 text-white text-xs font-medium rounded hover:bg-green-700 transition"
                            title="Shortlist"
                          >
                            <CheckCircle className="w-3.5 h-3.5" />
                            Shortlist
                          </button>
                        )}
                        {applicant.status !== 'Rejected' && (
                          <button
                            onClick={() => handleStatusChange(applicant.applicationId, 'Rejected')}
                            className="inline-flex items-center gap-1 px-3 py-1.5 bg-red-600 text-white text-xs font-medium rounded hover:bg-red-700 transition"
                            title="Reject"
                          >
                            <XCircle className="w-3.5 h-3.5" />
                            Reject
                          </button>
                        )}
                        <button
                          onClick={() => handleScheduleInterview(applicant)}
                          className="inline-flex items-center gap-1 px-3 py-1.5 bg-indigo-600 text-white text-xs font-medium rounded hover:bg-indigo-700 transition"
                          title="Schedule Interview"
                        >
                          <Calendar className="w-3.5 h-3.5" />
                          Interview
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

      {/* Interview Modal */}
      <InterviewScheduleModal
        isOpen={showInterviewModal}
        onClose={() => {
          setShowInterviewModal(false);
          setSelectedApplicant(null);
        }}
        applicant={selectedApplicant}
        jobTitle={jobInfo?.title}
        onSuccess={handleInterviewSuccess}
      />

      {/* Message Thread Panel */}
      <MessageThreadPanel
        isOpen={showMessagePanel}
        onClose={() => {
          setShowMessagePanel(false);
          setSelectedApplicant(null);
        }}
        applicationId={selectedApplicant?.applicationId}
        candidateName={selectedApplicant?.candidateName}
      />
    </div>
  );
};

export default RecruiterJobApplicantsPage;
