import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../../services/api';
import { 
  ArrowLeft, 
  Briefcase, 
  Calendar, 
  Clock, 
  Users,
  CheckCircle2,
  Loader,
  Send
} from 'lucide-react';
import LoadingSpinner from '../../components/LoadingSpinner';
import ErrorMessage from '../../components/ErrorMessage';

const CandidateJobDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [job, setJob] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [applying, setApplying] = useState(false);
  const [applied, setApplied] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  useEffect(() => {
    loadData();
  }, [id]);

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);
      await Promise.all([loadJobDetails(), checkApplicationStatus()]);
    } catch (error) {
      console.error('Error loading data:', error);
      setError('Failed to load job details. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const loadJobDetails = async () => {
    const response = await api.get(`/jobs/${id}`);
    setJob(response.data);
  };

  const checkApplicationStatus = async () => {
    try {
      const response = await api.get('/applications/me');
      const applications = response.data || [];
      const hasApplied = applications.some(app => 
        (app.jobPostingId || app.JobPostingId) === id
      );
      setApplied(hasApplied);
    } catch (error) {
      console.error('Error checking application status:', error);
    }
  };

  const handleApply = async () => {
    try {
      setApplying(true);
      await api.post('/applications', { JobPostingId: id });
      setApplied(true);
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 5000);
    } catch (error) {
      console.error('Error applying to job:', error);
      const message = error.response?.data?.message || 'Failed to submit application. Please try again.';
      alert(message);
    } finally {
      setApplying(false);
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  if (loading) {
    return <LoadingSpinner size="lg" text="Loading job details..." />;
  }

  if (error) {
    return (
      <ErrorMessage
        title="Unable to load job"
        message={error}
        onRetry={loadData}
      />
    );
  }

  if (!job) {
    return (
      <div className="max-w-4xl mx-auto">
        <ErrorMessage
          title="Job not found"
          message="The job you're looking for doesn't exist or has been removed."
          actionLabel="Back to Jobs"
          onRetry={() => navigate('/candidate/jobs')}
        />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      {/* Success Toast */}
      {showSuccess && (
        <div className="fixed top-4 right-4 left-4 sm:left-auto z-50 animate-slide-in">
          <div className="bg-green-50 border border-green-200 rounded-lg shadow-lg p-4 flex items-start gap-3 max-w-md mx-auto sm:mx-0">
            <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
            <div>
              <h4 className="font-semibold text-green-900 mb-1">Application Submitted!</h4>
              <p className="text-sm text-green-700">
                Your application has been successfully submitted. The recruiter will review it shortly.
              </p>
            </div>
            <button
              onClick={() => setShowSuccess(false)}
              className="text-green-600 hover:text-green-800 ml-auto"
            >
              ✕
            </button>
          </div>
        </div>
      )}

      {/* Back Button */}
      <button
        onClick={() => navigate('/candidate/jobs')}
        className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6 transition"
      >
        <ArrowLeft className="w-5 h-5" />
        Back to all jobs
      </button>

      {/* Job Header Card */}
      <div className="bg-white rounded-lg shadow-lg p-4 sm:p-8 mb-6">
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-4 mb-6">
          <div className="flex-1">
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-3">{job.title}</h1>
            <div className="flex flex-wrap gap-3 sm:gap-4 text-sm sm:text-base text-gray-600">
              <div className="flex items-center gap-2">
                <Briefcase className="w-5 h-5" />
                <span>{job.department}</span>
              </div>
              <div className="flex items-center gap-2">
                <Calendar className="w-5 h-5" />
                <span>Posted {formatDate(job.createdAt)}</span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="w-5 h-5" />
                <span>{job.minExperience}+ years experience</span>
              </div>
            </div>
          </div>

          {/* Apply Button */}
          {applied ? (
            <button
              disabled
              className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-3 bg-green-100 text-green-700 rounded-lg font-medium cursor-not-allowed"
            >
              <CheckCircle2 className="w-5 h-5" />
              Applied
            </button>
          ) : (
            <button
              onClick={handleApply}
              disabled={applying}
              className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-3 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {applying ? (
                <>
                  <Loader className="w-5 h-5 animate-spin" />
                  Applying...
                </>
              ) : (
                <>
                  <Send className="w-5 h-5" />
                  Apply Now
                </>
              )}
            </button>
          )}
        </div>

        {/* Status Badge */}
        <div className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">
          {job.status}
        </div>
      </div>

      {/* Job Description */}
      <div className="bg-white rounded-lg shadow p-4 sm:p-8 mb-6">
        <h2 className="text-lg sm:text-xl font-bold text-gray-900 mb-4">Job Description</h2>
        <div className="text-sm sm:text-base text-gray-700 whitespace-pre-wrap leading-relaxed">
          {job.description}
        </div>
      </div>

      {/* Required Skills */}
      {job.requiredSkills && job.requiredSkills.length > 0 && (
        <div className="bg-white rounded-lg shadow p-4 sm:p-8 mb-6">
          <h2 className="text-lg sm:text-xl font-bold text-gray-900 mb-4">Required Skills</h2>
          <div className="flex flex-wrap gap-2 sm:gap-3">
            {job.requiredSkills.map((skill, index) => (
              <span
                key={index}
                className="px-4 py-2 bg-indigo-50 text-indigo-700 rounded-lg text-sm font-medium"
              >
                {skill}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Additional Info */}
      <div className="bg-white rounded-lg shadow p-4 sm:p-8">
        <h2 className="text-lg sm:text-xl font-bold text-gray-900 mb-4">Additional Information</h2>
        <div className="space-y-3 text-sm sm:text-base text-gray-700">
          <div className="flex items-start gap-3">
            <Users className="w-5 h-5 text-gray-400 mt-0.5" />
            <div>
              <span className="font-medium">Posted by:</span>{' '}
              {job.postedBy}
            </div>
          </div>
          <div className="flex items-start gap-3">
            <Briefcase className="w-5 h-5 text-gray-400 mt-0.5" />
            <div>
              <span className="font-medium">Department:</span>{' '}
              {job.department}
            </div>
          </div>
          <div className="flex items-start gap-3">
            <Clock className="w-5 h-5 text-gray-400 mt-0.5" />
            <div>
              <span className="font-medium">Minimum Experience:</span>{' '}
              {job.minExperience} years
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CandidateJobDetailPage;
