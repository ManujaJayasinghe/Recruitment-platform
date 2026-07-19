import { useState, useEffect } from 'react';
import { 
  Search, 
  X, 
  Plus, 
  Loader, 
  User, 
  Briefcase, 
  Award,
  ChevronRight,
  Users
} from 'lucide-react';
import recruiterService from '../../services/recruiterService';

const RecruiterCandidatesPage = () => {
  const [loading, setLoading] = useState(false);
  const [candidates, setCandidates] = useState([]);
  const [pagination, setPagination] = useState({
    page: 1,
    pageSize: 20,
    totalCount: 0
  });

  // Filter states
  const [keyword, setKeyword] = useState('');
  const [skillInput, setSkillInput] = useState('');
  const [selectedSkills, setSelectedSkills] = useState([]);
  const [minExperience, setMinExperience] = useState(0);

  useEffect(() => {
    searchCandidates();
  }, [pagination.page]);

  const searchCandidates = async (resetPage = false) => {
    try {
      setLoading(true);
      
      const filters = {
        keyword: keyword.trim() || undefined,
        skills: selectedSkills.length > 0 ? selectedSkills.join(',') : undefined,
        minExperience: minExperience > 0 ? minExperience : undefined,
        page: resetPage ? 1 : pagination.page,
        pageSize: pagination.pageSize
      };

      const response = await recruiterService.searchCandidates(filters);
      
      setCandidates(response.items || []);
      setPagination({
        page: response.page,
        pageSize: response.pageSize,
        totalCount: response.totalCount
      });

      if (resetPage && response.page !== pagination.page) {
        setPagination(prev => ({ ...prev, page: response.page }));
      }
    } catch (error) {
      console.error('Error searching candidates:', error);
      alert('Failed to search candidates. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = () => {
    searchCandidates(true);
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  const handleAddSkill = () => {
    const trimmed = skillInput.trim();
    if (trimmed && !selectedSkills.includes(trimmed)) {
      setSelectedSkills([...selectedSkills, trimmed]);
      setSkillInput('');
    }
  };

  const handleRemoveSkill = (skillToRemove) => {
    setSelectedSkills(selectedSkills.filter(s => s !== skillToRemove));
  };

  const handleSkillKeyPress = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAddSkill();
    }
  };

  const totalPages = Math.ceil(pagination.totalCount / pagination.pageSize);

  const handlePreviousPage = () => {
    if (pagination.page > 1) {
      setPagination(prev => ({ ...prev, page: prev.page - 1 }));
    }
  };

  const handleNextPage = () => {
    if (pagination.page < totalPages) {
      setPagination(prev => ({ ...prev, page: prev.page + 1 }));
    }
  };

  const clearFilters = () => {
    setKeyword('');
    setSelectedSkills([]);
    setMinExperience(0);
    setSkillInput('');
  };

  const hasActiveFilters = keyword || selectedSkills.length > 0 || minExperience > 0;

  return (
    <div className="w-full">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Search Candidates</h1>
        <p className="text-gray-600 mt-2">
          Find and review qualified candidates for your open positions
        </p>
      </div>

      {/* Search and Filters */}
      <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
        {/* Keyword Search */}
        <div className="mb-4">
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Search by Keyword
          </label>
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                value={keyword}
                onChange={(e) => setKeyword(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Search by headline, summary, or keywords..."
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none"
              />
            </div>
            <button
              onClick={handleSearch}
              className="px-6 py-3 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 transition"
            >
              Search
            </button>
          </div>
        </div>

        {/* Skills Filter */}
        <div className="mb-4">
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Filter by Skills
          </label>
          <div className="flex gap-2 mb-3">
            <input
              type="text"
              value={skillInput}
              onChange={(e) => setSkillInput(e.target.value)}
              onKeyPress={handleSkillKeyPress}
              placeholder="Type a skill and press Enter or click Add"
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none"
            />
            <button
              type="button"
              onClick={handleAddSkill}
              className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg font-medium hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-500 transition flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              Add
            </button>
          </div>

          {selectedSkills.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {selectedSkills.map((skill, index) => (
                <span
                  key={index}
                  className="inline-flex items-center gap-2 px-3 py-1 bg-indigo-100 text-indigo-800 rounded-full text-sm font-medium"
                >
                  {skill}
                  <button
                    type="button"
                    onClick={() => handleRemoveSkill(skill)}
                    className="hover:text-indigo-900 transition"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Experience Slider */}
        <div className="mb-4">
          <label className="flex items-center justify-between text-sm font-semibold text-gray-700 mb-2">
            <span>Minimum Years of Experience</span>
            <span className="text-indigo-600 font-bold">{minExperience}+ years</span>
          </label>
          <input
            type="range"
            min="0"
            max="15"
            step="1"
            value={minExperience}
            onChange={(e) => setMinExperience(parseInt(e.target.value))}
            className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-indigo-600"
          />
          <div className="flex justify-between text-xs text-gray-500 mt-1">
            <span>0</span>
            <span>5</span>
            <span>10</span>
            <span>15+</span>
          </div>
        </div>

        {/* Filter Actions */}
        <div className="flex items-center justify-between pt-4 border-t border-gray-200">
          <div className="text-sm text-gray-600">
            {hasActiveFilters ? (
              <span className="font-medium text-indigo-600">Filters active</span>
            ) : (
              <span>No filters applied</span>
            )}
          </div>
          <div className="flex gap-3">
            {hasActiveFilters && (
              <button
                onClick={clearFilters}
                className="px-4 py-2 text-gray-600 hover:text-gray-900 font-medium transition"
              >
                Clear Filters
              </button>
            )}
            <button
              onClick={handleSearch}
              disabled={loading}
              className="px-6 py-2 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 transition disabled:opacity-50"
            >
              Apply Filters
            </button>
          </div>
        </div>
      </div>

      {/* Results */}
      <div className="bg-white rounded-lg shadow-lg overflow-hidden">
        {/* Results Header */}
        <div className="px-6 py-4 bg-gray-50 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Users className="w-5 h-5 text-gray-600" />
              <h2 className="text-lg font-semibold text-gray-900">
                Candidate Results
              </h2>
            </div>
            <span className="text-sm text-gray-600">
              {loading ? 'Searching...' : `${pagination.totalCount} candidates found`}
            </span>
          </div>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="flex items-center justify-center py-16">
            <Loader className="w-8 h-8 text-indigo-600 animate-spin" />
          </div>
        )}

        {/* No Results */}
        {!loading && candidates.length === 0 && (
          <div className="text-center py-16">
            <User className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              No candidates found
            </h3>
            <p className="text-gray-600">
              Try adjusting your search criteria or filters
            </p>
          </div>
        )}

        {/* Results List */}
        {!loading && candidates.length > 0 && (
          <div className="divide-y divide-gray-200">
            {candidates.map((candidate) => (
              <div
                key={candidate.profileId}
                className="p-6 hover:bg-gray-50 transition"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    {/* Name and Headline */}
                    <div className="mb-3">
                      <h3 className="text-lg font-semibold text-gray-900 mb-1">
                        {candidate.fullName}
                      </h3>
                      <p className="text-gray-600 flex items-center gap-2">
                        <Briefcase className="w-4 h-4 flex-shrink-0" />
                        {candidate.headline || 'No headline provided'}
                      </p>
                    </div>

                    {/* Experience */}
                    <div className="mb-3">
                      <span className="inline-flex items-center gap-1 text-sm text-gray-700 bg-gray-100 px-3 py-1 rounded-full">
                        <Award className="w-4 h-4" />
                        {candidate.yearsOfExperience} {candidate.yearsOfExperience === 1 ? 'year' : 'years'} of experience
                      </span>
                    </div>

                    {/* Top Skills */}
                    {candidate.topSkills && candidate.topSkills.length > 0 && (
                      <div>
                        <div className="flex flex-wrap gap-2">
                          {candidate.topSkills.map((skill, index) => (
                            <span
                              key={index}
                              className="inline-block px-2 py-1 bg-blue-50 text-blue-700 text-xs font-medium rounded"
                            >
                              {skill}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Action Button */}
                  <div className="flex-shrink-0">
                    <a
                      href={`mailto:${candidate.email}`}
                      className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 transition"
                    >
                      Contact
                      <ChevronRight className="w-4 h-4" />
                    </a>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Pagination */}
        {!loading && candidates.length > 0 && totalPages > 1 && (
          <div className="px-6 py-4 bg-gray-50 border-t border-gray-200">
            <div className="flex items-center justify-between">
              <div className="text-sm text-gray-600">
                Page {pagination.page} of {totalPages}
              </div>
              <div className="flex gap-2">
                <button
                  onClick={handlePreviousPage}
                  disabled={pagination.page === 1}
                  className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed transition"
                >
                  Previous
                </button>
                <button
                  onClick={handleNextPage}
                  disabled={pagination.page === totalPages}
                  className="px-4 py-2 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed transition"
                >
                  Next
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default RecruiterCandidatesPage;
