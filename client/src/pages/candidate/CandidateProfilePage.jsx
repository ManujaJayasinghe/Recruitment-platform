import { useState, useEffect, useRef } from 'react';
import { useAuth } from '../../context/AuthContext';
import candidateService from '../../services/candidateService';
import { User, Briefcase, Award, Save, X, CheckCircle, AlertCircle, Upload, FileText, Sparkles } from 'lucide-react';

const CandidateProfilePage = () => {
  const { user } = useAuth();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState(null);
  
  const [formData, setFormData] = useState({
    headline: '',
    summary: '',
    yearsOfExperience: 0,
    skills: []
  });
  
  const [skillInput, setSkillInput] = useState('');
  
  // Resume upload state
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [dragActive, setDragActive] = useState(false);
  const [parsedData, setParsedData] = useState(null);
  const fileInputRef = useRef(null);

  // Load profile on mount
  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      setLoading(true);
      const data = await candidateService.getProfile();
      setProfile(data);
      
      // Handle both camelCase and PascalCase from API
      setFormData({
        headline: data.headline || data.Headline || '',
        summary: data.summary || data.Summary || '',
        yearsOfExperience: data.yearsOfExperience ?? data.YearsOfExperience ?? 0,
        skills: data.skills || data.Skills || []
      });
    } catch (error) {
      console.error('Error loading profile:', error);
      setMessage({
        type: 'error',
        text: 'Failed to load profile'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'yearsOfExperience' ? parseInt(value) || 0 : value
    }));
  };

  const handleSkillKeyDown = (e) => {
    if (e.key === 'Enter' && skillInput.trim()) {
      e.preventDefault();
      const newSkill = skillInput.trim();
      if (!formData.skills.includes(newSkill)) {
        setFormData(prev => ({
          ...prev,
          skills: [...prev.skills, newSkill]
        }));
      }
      setSkillInput('');
    }
  };

  const removeSkill = (skillToRemove) => {
    setFormData(prev => ({
      ...prev,
      skills: prev.skills.filter(skill => skill !== skillToRemove)
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setSaving(true);
      setMessage(null);
      
      // Convert to PascalCase for .NET API
      const updateData = {
        Headline: formData.headline,
        Summary: formData.summary,
        Skills: formData.skills,
        YearsOfExperience: formData.yearsOfExperience
      };
      
      await candidateService.updateProfile(updateData);
      
      setMessage({
        type: 'success',
        text: 'Profile updated successfully!'
      });
      
      // Reload to get fresh data
      await loadProfile();
      
      // Auto-hide success message after 3 seconds
      setTimeout(() => setMessage(null), 3000);
    } catch (error) {
      console.error('Error updating profile:', error);
      setMessage({
        type: 'error',
        text: error.response?.data?.message || 'Failed to update profile'
      });
    } finally {
      setSaving(false);
    }
  };

  // Get initials for avatar
  const getInitials = (name) => {
    if (!name) return '?';
    return name
      .split(' ')
      .map(word => word[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  // Resume upload handlers
  const handleFileSelect = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      uploadResumeFile(file);
    }
  };

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    const file = e.dataTransfer.files?.[0];
    if (file && file.type === 'application/pdf') {
      uploadResumeFile(file);
    } else {
      setMessage({
        type: 'error',
        text: 'Please upload a PDF file only'
      });
    }
  };

  const uploadResumeFile = async (file) => {
    if (file.size > 5 * 1024 * 1024) {
      setMessage({
        type: 'error',
        text: 'File size must be less than 5MB'
      });
      return;
    }

    try {
      setUploading(true);
      setUploadProgress(0);
      setParsedData(null);
      setMessage(null);

      const onUploadProgress = (progressEvent) => {
        const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
        setUploadProgress(percentCompleted);
      };

      const response = await candidateService.uploadResume(file, onUploadProgress);
      
      setMessage({
        type: 'success',
        text: 'Resume uploaded successfully!'
      });

      // Reload profile to get updated hasResume status
      await loadProfile();

      // Parse the parsedResumeJson if available
      if (response.parsedResumeJson || response.ParsedResumeJson) {
        const parsed = JSON.parse(response.parsedResumeJson || response.ParsedResumeJson);
        setParsedData(parsed);
        
        // Auto-fill skills from parsed data if available
        if (parsed.skills && Array.isArray(parsed.skills)) {
          const newSkills = [...new Set([...formData.skills, ...parsed.skills])];
          setFormData(prev => ({
            ...prev,
            skills: newSkills
          }));
        }
      }

      setTimeout(() => setMessage(null), 5000);
    } catch (error) {
      console.error('Error uploading resume:', error);
      setMessage({
        type: 'error',
        text: error.response?.data?.message || 'Failed to upload resume'
      });
    } finally {
      setUploading(false);
      setUploadProgress(0);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">My Profile</h1>
        <p className="text-gray-600 mt-2">Manage your professional information</p>
      </div>

      {/* Success/Error Message */}
      {message && (
        <div className={`mb-6 p-4 rounded-lg flex items-start gap-3 ${
          message.type === 'success' 
            ? 'bg-green-50 border border-green-200' 
            : 'bg-red-50 border border-red-200'
        }`}>
          {message.type === 'success' ? (
            <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
          ) : (
            <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
          )}
          <p className={`text-sm ${message.type === 'success' ? 'text-green-800' : 'text-red-800'}`}>
            {message.text}
          </p>
        </div>
      )}

      <div className="bg-white rounded-lg shadow-lg overflow-hidden">
        {/* Header with Avatar */}
        <div className="bg-gradient-to-r from-indigo-500 to-purple-600 h-32"></div>
        <div className="px-8 pb-8">
          <div className="flex items-end -mt-16 mb-6">
            <div className="w-32 h-32 rounded-full bg-white border-4 border-white shadow-lg flex items-center justify-center">
              <div className="w-28 h-28 rounded-full bg-indigo-600 flex items-center justify-center">
                <span className="text-3xl font-bold text-white">
                  {getInitials(profile?.fullName || user?.fullName)}
                </span>
              </div>
            </div>
            <div className="ml-6 mb-2">
              <h2 className="text-2xl font-bold text-gray-900">{profile?.fullName}</h2>
              <p className="text-gray-600">{profile?.email}</p>
            </div>
          </div>

          {/* Profile Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Headline */}
            <div>
              <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                <User className="w-4 h-4" />
                Professional Headline
              </label>
              <input
                type="text"
                name="headline"
                value={formData.headline}
                onChange={handleInputChange}
                placeholder="e.g., Senior Software Engineer | Full-Stack Developer"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition"
              />
            </div>

            {/* Years of Experience */}
            <div>
              <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                <Briefcase className="w-4 h-4" />
                Years of Experience
              </label>
              <input
                type="number"
                name="yearsOfExperience"
                value={formData.yearsOfExperience}
                onChange={handleInputChange}
                min="0"
                max="50"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition"
              />
            </div>

            {/* Summary */}
            <div>
              <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                <Award className="w-4 h-4" />
                Professional Summary
              </label>
              <textarea
                name="summary"
                value={formData.summary}
                onChange={handleInputChange}
                rows="5"
                placeholder="Tell us about your experience, achievements, and career goals..."
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition resize-none"
              />
            </div>

            {/* Skills with Tag Input */}
            <div>
              <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                <Award className="w-4 h-4" />
                Skills
              </label>
              
              {/* Skills Display */}
              <div className="flex flex-wrap gap-2 mb-3 min-h-[40px] p-3 border border-gray-300 rounded-lg bg-gray-50">
                {formData.skills.length === 0 && (
                  <span className="text-gray-400 text-sm">No skills added yet. Type below and press Enter.</span>
                )}
                {formData.skills.map((skill, index) => (
                  <span
                    key={index}
                    className="inline-flex items-center gap-1 px-3 py-1 bg-indigo-100 text-indigo-800 rounded-full text-sm font-medium"
                  >
                    {skill}
                    <button
                      type="button"
                      onClick={() => removeSkill(skill)}
                      className="hover:bg-indigo-200 rounded-full p-0.5 transition"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                ))}
              </div>

              {/* Skill Input */}
              <input
                type="text"
                value={skillInput}
                onChange={(e) => setSkillInput(e.target.value)}
                onKeyDown={handleSkillKeyDown}
                placeholder="Type a skill and press Enter (e.g., React, Node.js, Python)"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition"
              />
              <p className="mt-1 text-xs text-gray-500">
                Press Enter to add a skill. Click the × to remove.
              </p>
            </div>

            {/* Submit Button */}
            <div className="flex justify-end pt-4 border-t">
              <button
                type="submit"
                disabled={saving}
                className="flex items-center gap-2 px-6 py-2.5 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Save className="w-4 h-4" />
                {saving ? 'Saving...' : 'Save Profile'}
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* Resume Upload Section */}
      <div className="mt-8 bg-white rounded-lg shadow-lg overflow-hidden">
        <div className="px-8 py-6">
          <div className="flex items-center gap-2 mb-4">
            <FileText className="w-5 h-5 text-indigo-600" />
            <h2 className="text-xl font-bold text-gray-900">Resume Upload</h2>
          </div>

          {/* Drag and Drop Area */}
          <div
            className={`relative border-2 border-dashed rounded-lg p-8 text-center transition ${
              dragActive
                ? 'border-indigo-500 bg-indigo-50'
                : 'border-gray-300 hover:border-indigo-400'
            } ${uploading ? 'pointer-events-none opacity-50' : ''}`}
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept=".pdf"
              onChange={handleFileSelect}
              className="hidden"
            />

            {!uploading ? (
              <>
                <Upload className="w-12 h-12 mx-auto text-gray-400 mb-4" />
                <p className="text-lg font-medium text-gray-700 mb-2">
                  Drop your resume here or click to browse
                </p>
                <p className="text-sm text-gray-500 mb-4">
                  PDF only, max 5MB
                </p>
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="px-6 py-2.5 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 transition"
                >
                  Choose File
                </button>
                {profile?.hasResume && (
                  <p className="mt-4 text-sm text-green-600 flex items-center justify-center gap-2">
                    <CheckCircle className="w-4 h-4" />
                    Resume already uploaded
                  </p>
                )}
              </>
            ) : (
              <div className="space-y-4">
                <div className="animate-pulse">
                  <Upload className="w-12 h-12 mx-auto text-indigo-600 mb-4" />
                  <p className="text-lg font-medium text-gray-700">Uploading...</p>
                </div>
                {/* Progress Bar */}
                <div className="w-full bg-gray-200 rounded-full h-2.5">
                  <div
                    className="bg-indigo-600 h-2.5 rounded-full transition-all duration-300"
                    style={{ width: `${uploadProgress}%` }}
                  ></div>
                </div>
                <p className="text-sm text-gray-600">{uploadProgress}%</p>
              </div>
            )}
          </div>

          {/* Parsed Data Display */}
          {parsedData && (
            <div className="mt-6 p-6 bg-gradient-to-br from-purple-50 to-indigo-50 rounded-lg border border-indigo-200">
              <div className="flex items-start gap-3 mb-4">
                <Sparkles className="w-6 h-6 text-purple-600 flex-shrink-0 mt-1" />
                <div>
                  <h3 className="text-lg font-bold text-gray-900">
                    AI-Extracted Resume Data
                  </h3>
                  <p className="text-sm text-gray-600 mt-1">
                    We've automatically extracted the following information from your resume.
                    Review and edit the fields above as needed.
                  </p>
                </div>
              </div>

              <div className="space-y-4">
                {/* Extracted Skills */}
                {parsedData.skills && parsedData.skills.length > 0 && (
                  <div>
                    <p className="text-sm font-medium text-gray-700 mb-2">Extracted Skills:</p>
                    <div className="flex flex-wrap gap-2">
                      {parsedData.skills.map((skill, index) => (
                        <span
                          key={index}
                          className="px-3 py-1 bg-white border border-purple-200 text-purple-800 rounded-full text-sm"
                        >
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Extracted Experience */}
                {parsedData.yearsOfExperience !== undefined && (
                  <div>
                    <p className="text-sm font-medium text-gray-700 mb-1">Years of Experience:</p>
                    <p className="text-gray-900">{parsedData.yearsOfExperience} years</p>
                  </div>
                )}

                {/* Extracted Summary */}
                {parsedData.summary && (
                  <div>
                    <p className="text-sm font-medium text-gray-700 mb-1">Summary:</p>
                    <p className="text-gray-900 text-sm">{parsedData.summary}</p>
                  </div>
                )}

                <div className="mt-4 p-3 bg-white rounded border border-indigo-200">
                  <p className="text-xs text-gray-600">
                    <span className="font-medium">💡 Tip:</span> These skills have been automatically
                    added to your Skills field above. You can review, edit, or remove them before
                    saving your profile.
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CandidateProfilePage;
