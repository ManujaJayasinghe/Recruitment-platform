import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';
import { Search, Briefcase, Calendar, ChevronRight, Filter, Sparkles, Target } from 'lucide-react';
import LoadingSpinner from '../../components/LoadingSpinner';
import ErrorMessage from '../../components/ErrorMessage';
import EmptyState from '../../components/EmptyState';

const CandidateJobsPage = () => {
  const navigate = useNavigate();
  const [jobs, setJobs] = useState([]);
  const [recommendedJobs, setRecommendedJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [loadingRecommended, setLoadingRecommended] = useState(true);
  const [departments, setDepartments] = useState([]);
  const [filters, setFilters] = useState({
    keyword: '',
    department: '',
    minExperience: ''
  });
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const itemsPerPage = 12;

  useEffect(() => {
    loadDepartments();
    loadRecommendedJobs();
  }, []);

  useEffect(() => {
    loadJobs();
  }, [currentPage, filters]);

  const loadDepartments = async () => {
    try {
      const response = await api.get('/admin/departments');
      setDepartments(response.data || []);
    } catch (error) {
      console.error('Error loading departments:', error);
    }
  };

  const loadRecommendedJobs = async () => {
    try {
      setLoadingRecommended(true);
      const response = await api.get('/jobs/recommended');
      const recommended = Array.isArray(response.data) ? response.data : [];
      setRecommendedJobs(recommended.slice(0, 3));
    } catch (error) {
      console.error('Error loading recommended jobs:', error);
      setRecommendedJobs([]);
    } finally {
      setLoadingRecommended(false);
    }
  };

  const loadJobs = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const params = new URLSearchParams();
      if (filters.keyword) params.append('title', filters.keyword);
      if (filters.department) params.append('department', filters.department);
      if (filters.minExperience) params.append('minExperience', filters.minExperience);
      
      const response = await api.get(`/jobs?${params.toString()}`);
      const allJobs = Array.isArray(response.data) ? response.data : [];
      
      const total = Math.ceil(allJobs.length / itemsPerPage);
      setTotalPages(total);
      
      const start = (currentPage - 1) * itemsPerPage;
      const end = start + itemsPerPage;
      setJobs(allJobs.slice(start, end));
    } catch (error) {
      console.error('Error loading jobs:', error);
      setError('Failed to load job listings. Please try again.');
      setJobs([]);
      setTotalPages(1);
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (field, value) => {
    setFilters(prev => ({ ...prev, [field]: value }));
    setCurrentPage(1); // Reset to first page on filter change
  };

  const handleSearch = (e) => {
    e.preventDefault();
    setCurrentPage(1);
    loadJobs();
  };

  const handleClearFilters = () => {
    setFilters({ keyword: '', department: '', minExperience: '' });
    setCurrentPage(1);
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now - date);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays} days ago`;
    if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
    return date.toLocaleDateString();
  };

  const calculateMatchPercentage = (matchScore, totalSkills) => {
    if (!matchScore || !totalSkills || totalSkills === 0) return 0;
    return Math.round((matchScore / totalSkills) * 100);
  };

  return (
    <div className="w-full">
      <div className="mb-6 sm:mb-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Browse Jobs</h1>
        <p className="text-sm sm:text-base text-gray-600 mt-2">Find your next opportunity</p>
      </div>

      {/* Recommended Jobs Section */}
      {!loadingRecommended && recommendedJobs.length > 0 && (
        <div className="mb-6 sm:mb-8">
          <div className="flex items-center gap-3 mb-4">
            <div className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 sm:w-6 sm:h-6 text-indigo-600" />
              <h2 className="text-xl sm:text-2xl font-bold text-gray-900">Recommended for You</h2>
            </div>
          </div>
          <p className="text-xs sm:text-sm text-gray-600 mb-4 flex items-center gap-2">
            <Target className="w-4 h-4" />
            Recommended based on your profile skills
          </p>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 mb-6">
            {recommendedJobs.map((job) => {
              const matchPercentage = calculateMatchPercentage(
                job.matchScore,
                job.requiredSkills?.length || 1
              );
              
              return (
                <div
                  key={job.id}
                  className="bg-gradient-to-br from-indigo-50 to-purple-50 rounded-lg shadow-md hover:shadow-xl transition-all p-6 cursor-pointer border-2 border-indigo-200 hover:border-indigo-400 relative overflow-hidden"
                  onClick={() => navigate(`/candidate/jobs/${job.id}`)}
                >
                  {/* Match Badge */}
                  <div className="absolute top-4 right-4">
                    <div className="bg-indigo-600 text-white px-3 py-1.5 rounded-full text-xs font-bold shadow-lg flex items-center gap-1">
                      <Target className="w-3.5 h-3.5" />
                      {matchPercentage}% Match
                    </div>
                  </div>

                  {/* Job Header */}
                  <div className="mb-4 pr-20">
                    <h3 className="text-lg font-bold text-gray-900 mb-2 line-clamp-2">
                      {job.title}
                    </h3>
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Briefcase className="w-4 h-4" />
                      {job.department || 'N/A'}
                    </div>
                  </div>

                  {/* Required Skills */}
                  {job.requiredSkills && job.requiredSkills.length > 0 && (
                    <div className="mb-4">
                      <div className="flex flex-wrap gap-2">
                        {job.requiredSkills.slice(0, 3).map((skill, index) => (
                          <span
                            key={index}
                            className="px-2.5 py-1 bg-white text-indigo-700 rounded-full text-xs font-medium shadow-sm"
                          >
                            {skill}
                          </span>
                        ))}
                        {job.requiredSkills.length > 3 && (
                          <span className="px-2.5 py-1 bg-white text-gray-600 rounded-full text-xs font-medium shadow-sm">
                            +{job.requiredSkills.length - 3} more
                          </span>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Experience Required */}
                  <div className="mb-4 text-sm text-gray-600">
                    <span className="font-medium">Experience:</span> {job.minExperience}+ years
                  </div>

                  {/* Footer */}
                  <div className="flex items-center justify-between pt-4 border-t border-indigo-200">
                    <div className="flex items-center gap-1.5 text-xs text-gray-500">
                      <Calendar className="w-3.5 h-3.5" />
                      {formatDate(job.createdAt)}
                    </div>
                    <button
                      className="flex items-center gap-1 text-sm font-medium text-indigo-600 hover:text-indigo-800 transition"
                      onClick={(e) => {
                        e.stopPropagation();
                        navigate(`/candidate/jobs/${job.id}`);
                      }}
                    >
                      View Details
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
          
          <div className="border-t border-gray-200 pt-6"></div>
        </div>
      )}

      {/* Search and Filters */}
      <div className="bg-white rounded-lg shadow p-6 mb-8">
        <form onSubmit={handleSearch} className="space-y-4">
          {/* Search Bar */}
          <div className="flex gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  value={filters.keyword}
                  onChange={(e) => handleFilterChange('keyword', e.target.value)}
                  placeholder="Search by job title or keyword..."
                  className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none"
                />
              </div>
            </div>
            <button
              type="submit"
              className="px-6 py-2.5 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 transition"
            >
              Search
            </button>
          </div>

          {/* Filters */}
          <div className="flex gap-4 items-end flex-wrap">
            <div className="flex items-center gap-2 text-sm font-medium text-gray-700">
              <Filter className="w-4 h-4" />
              Filters:
            </div>
            
            <div className="flex-1 min-w-[200px]">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Department
              </label>
              <select
                value={filters.department}
                onChange={(e) => handleFilterChange('department', e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none bg-white"
              >
                <option value="">All Departments</option>
                {departments.map((dept) => (
                  <option key={dept.id || dept.Id} value={dept.name || dept.Name}>
                    {dept.name || dept.Name}
                  </option>
                ))}
              </select>
            </div>

            <div className="w-48">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Min Experience
              </label>
              <select
                value={filters.minExperience}
                onChange={(e) => handleFilterChange('minExperience', e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none bg-white"
              >
                <option value="">Any Experience</option>
                <option value="0">Entry Level (0+ years)</option>
                <option value="2">2+ years</option>
                <option value="3">3+ years</option>
                <option value="5">5+ years</option>
                <option value="7">7+ years</option>
                <option value="10">10+ years</option>
              </select>
            </div>

            {(filters.keyword || filters.department || filters.minExperience) && (
              <button
                type="button"
                onClick={handleClearFilters}
                className="px-4 py-2 text-sm text-gray-600 hover:text-gray-900 underline whitespace-nowrap"
              >
                Clear filters
              </button>
            )}
          </div>
        </form>
      </div>

      {/* Job Results */}
      <div className="mb-4">
        <h2 className="text-xl font-bold text-gray-900 mb-2">All Jobs</h2>
      </div>
      
      {loading ? (
        <LoadingSpinner size="lg" text="Loading job listings..." />
      ) : error ? (
        <ErrorMessage
          title="Unable to load jobs"
          message={error}
          onRetry={loadJobs}
        />
      ) : jobs.length === 0 ? (
        <EmptyState
          icon={Briefcase}
          title="No jobs found"
          message="Try adjusting your search filters or check back later for new opportunities."
        />
      ) : (
        <>
          <div className="mb-4 text-sm text-gray-600">
            Found {jobs.length} job{jobs.length !== 1 ? 's' : ''} on this page
            {totalPages > 1 && ` (Page ${currentPage} of ${totalPages})`}
          </div>

          {/* Job Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {jobs.map((job) => (
              <div
                key={job.id}
                className="bg-white rounded-lg shadow hover:shadow-lg transition-shadow p-6 cursor-pointer border border-gray-200 hover:border-indigo-300"
                onClick={() => navigate(`/candidate/jobs/${job.id}`)}
              >
                {/* Job Header */}
                <div className="mb-4">
                  <h3 className="text-lg font-bold text-gray-900 mb-2 line-clamp-2">
                    {job.title}
                  </h3>
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Briefcase className="w-4 h-4" />
                    {job.department || 'N/A'}
                  </div>
                </div>

                {/* Required Skills */}
                {job.requiredSkills && job.requiredSkills.length > 0 && (
                  <div className="mb-4">
                    <div className="flex flex-wrap gap-2">
                      {job.requiredSkills.slice(0, 4).map((skill, index) => (
                        <span
                          key={index}
                          className="px-2.5 py-1 bg-indigo-50 text-indigo-700 rounded-full text-xs font-medium"
                        >
                          {skill}
                        </span>
                      ))}
                      {job.requiredSkills.length > 4 && (
                        <span className="px-2.5 py-1 bg-gray-100 text-gray-600 rounded-full text-xs font-medium">
                          +{job.requiredSkills.length - 4} more
                        </span>
                      )}
                    </div>
                  </div>
                )}

                {/* Experience Required */}
                <div className="mb-4 text-sm text-gray-600">
                  <span className="font-medium">Experience:</span> {job.minExperience}+ years
                </div>

                {/* Footer */}
                <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                  <div className="flex items-center gap-1.5 text-xs text-gray-500">
                    <Calendar className="w-3.5 h-3.5" />
                    {formatDate(job.createdAt)}
                  </div>
                  <button
                    className="flex items-center gap-1 text-sm font-medium text-indigo-600 hover:text-indigo-700 transition"
                    onClick={(e) => {
                      e.stopPropagation();
                      navigate(`/candidate/jobs/${job.id}`);
                    }}
                  >
                    View Details
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="mt-8 flex justify-center items-center gap-2">
              <button
                onClick={() => setCurrentPage(1)}
                disabled={currentPage === 1}
                className="px-3 py-2 border border-gray-300 rounded-lg font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition text-sm"
              >
                First
              </button>
              <button
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="px-4 py-2 border border-gray-300 rounded-lg font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition"
              >
                Previous
              </button>
              
              <div className="flex gap-1">
                {[...Array(totalPages)].map((_, i) => {
                  const pageNum = i + 1;
                  // Show first, last, current, and pages around current
                  if (
                    pageNum === 1 ||
                    pageNum === totalPages ||
                    (pageNum >= currentPage - 1 && pageNum <= currentPage + 1)
                  ) {
                    return (
                      <button
                        key={pageNum}
                        onClick={() => setCurrentPage(pageNum)}
                        className={`px-4 py-2 rounded-lg font-medium transition ${
                          pageNum === currentPage
                            ? 'bg-indigo-600 text-white'
                            : 'border border-gray-300 text-gray-700 hover:bg-gray-50'
                        }`}
                      >
                        {pageNum}
                      </button>
                    );
                  } else if (pageNum === currentPage - 2 || pageNum === currentPage + 2) {
                    return <span key={pageNum} className="px-2 py-2 text-gray-500">...</span>;
                  }
                  return null;
                })}
              </div>

              <button
                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                className="px-4 py-2 border border-gray-300 rounded-lg font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition"
              >
                Next
              </button>
              <button
                onClick={() => setCurrentPage(totalPages)}
                disabled={currentPage === totalPages}
                className="px-3 py-2 border border-gray-300 rounded-lg font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition text-sm"
              >
                Last
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default CandidateJobsPage;
