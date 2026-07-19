import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';
import { 
  Briefcase, 
  Users, 
  Clock, 
  TrendingUp,
  Plus,
  Eye,
  Calendar,
  Loader,
  ArrowRight,
  CheckCircle,
  XCircle,
  FileText
} from 'lucide-react';

const RecruiterDashboardPage = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [jobs, setJobs] = useState([]);
  const [stats, setStats] = useState({
    openJobs: 0,
    totalApplicants: 0,
    awaitingReview: 0,
    closedJobs: 0
  });

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      const response = await api.get('/recruiter/jobs');
      const jobsData = response.data || [];
      setJobs(jobsData);

      // Calculate stats
      const openJobs = jobsData.filter(j => j.status === 'Open').length;
      const closedJobs = jobsData.filter(j => j.status === 'Closed').length;
      const totalApplicants = jobsData.reduce((sum, job) => sum + (job.applicationCount || 0), 0);
      
      // For awaiting review, we'd need application data, but we can estimate from open jobs
      setStats({
        openJobs,
        totalApplicants,
        awaitingReview: totalApplicants, // This would need actual application status data
        closedJobs
      });
    } catch (error) {
      console.error('Error loading dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      Open: 'bg-green-100 text-green-800 border-green-200',
      Draft: 'bg-gray-100 text-gray-800 border-gray-200',
      Closed: 'bg-red-100 text-red-800 border-red-200'
    };
    return colors[status] || 'bg-gray-100 text-gray-800 border-gray-200';
  };

  const getStatusIcon = (status) => {
    const icons = {
      Open: <CheckCircle className="w-4 h-4" />,
      Draft: <FileText className="w-4 h-4" />,
      Closed: <XCircle className="w-4 h-4" />
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

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader className="w-8 h-8 text-indigo-600 animate-spin" />
      </div>
    );
  }

  return (
    <div className="w-full">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6 sm:mb-8">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-sm sm:text-base text-gray-600 mt-1 sm:mt-2">Overview of your talent acquisition activities</p>
        </div>
        <button
          onClick={() => navigate('/recruiter/jobs/new')}
          className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-3 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 transition shadow-sm"
        >
          <Plus className="w-5 h-5" />
          Post New Job
        </button>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-6 sm:mb-8">
        {/* Open Jobs */}
        <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-green-500 hover:shadow-lg transition">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-green-100 rounded-lg">
              <Briefcase className="w-6 h-6 text-green-600" />
            </div>
            <TrendingUp className="w-5 h-5 text-green-500" />
          </div>
          <h3 className="text-gray-600 text-sm font-medium mb-1">Open Jobs</h3>
          <p className="text-3xl font-bold text-gray-900">{stats.openJobs}</p>
          <p className="text-xs text-gray-500 mt-2">Active job postings</p>
        </div>

        {/* Total Applicants */}
        <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-blue-500 hover:shadow-lg transition">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-blue-100 rounded-lg">
              <Users className="w-6 h-6 text-blue-600" />
            </div>
            <TrendingUp className="w-5 h-5 text-blue-500" />
          </div>
          <h3 className="text-gray-600 text-sm font-medium mb-1">Total Applicants</h3>
          <p className="text-3xl font-bold text-gray-900">{stats.totalApplicants}</p>
          <p className="text-xs text-gray-500 mt-2">Across all jobs</p>
        </div>

        {/* Awaiting Review */}
        <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-yellow-500 hover:shadow-lg transition">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-yellow-100 rounded-lg">
              <Clock className="w-6 h-6 text-yellow-600" />
            </div>
            <span className="px-2 py-1 bg-yellow-100 text-yellow-700 text-xs font-medium rounded-full">
              Needs Attention
            </span>
          </div>
          <h3 className="text-gray-600 text-sm font-medium mb-1">Awaiting Review</h3>
          <p className="text-3xl font-bold text-gray-900">{stats.awaitingReview}</p>
          <p className="text-xs text-gray-500 mt-2">Applications pending</p>
        </div>

        {/* Closed Jobs */}
        <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-gray-400 hover:shadow-lg transition">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-gray-100 rounded-lg">
              <FileText className="w-6 h-6 text-gray-600" />
            </div>
          </div>
          <h3 className="text-gray-600 text-sm font-medium mb-1">Closed Jobs</h3>
          <p className="text-3xl font-bold text-gray-900">{stats.closedJobs}</p>
          <p className="text-xs text-gray-500 mt-2">Completed postings</p>
        </div>
      </div>

      {/* Recent Job Postings */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-gray-900">Recent Job Postings</h2>
            <p className="text-sm text-gray-600 mt-1">Manage your job postings and view applicants</p>
          </div>
          <button
            onClick={() => navigate('/recruiter/jobs')}
            className="text-sm text-indigo-600 hover:text-indigo-700 font-medium flex items-center gap-1"
          >
            View All
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>

        {jobs.length === 0 ? (
          <div className="p-12 text-center">
            <Briefcase className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No job postings yet</h3>
            <p className="text-gray-600 mb-6">
              Create your first job posting to start receiving applications.
            </p>
            <button
              onClick={() => navigate('/recruiter/jobs/new')}
              className="px-6 py-2.5 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 transition"
            >
              Post Your First Job
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Job Title
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Department
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Applicants
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Posted
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {jobs.slice(0, 10).map((job) => (
                  <tr key={job.id} className="hover:bg-gray-50 transition">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div>
                          <div className="text-sm font-medium text-gray-900">{job.title}</div>
                          <div className="text-xs text-gray-500">
                            {job.minExperience}+ years • {job.requiredSkills?.length || 0} skills
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{job.department}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border ${getStatusColor(job.status)}`}>
                        {getStatusIcon(job.status)}
                        {job.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <Users className="w-4 h-4 text-gray-400" />
                        <span className="text-sm font-semibold text-gray-900">
                          {job.applicationCount || 0}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      <div className="flex items-center gap-1.5">
                        <Calendar className="w-4 h-4" />
                        {formatDate(job.createdAt)}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button
                        onClick={() => navigate(`/recruiter/jobs/${job.id}/applicants`)}
                        className="inline-flex items-center gap-1.5 text-indigo-600 hover:text-indigo-900 transition"
                      >
                        <Eye className="w-4 h-4" />
                        View Applicants
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default RecruiterDashboardPage;
