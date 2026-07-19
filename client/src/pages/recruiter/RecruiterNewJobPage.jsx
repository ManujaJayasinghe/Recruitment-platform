import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import api from '../../services/api';
import { 
  Save, 
  X, 
  Plus, 
  Loader, 
  ArrowLeft,
  Briefcase,
  FileText,
  Users,
  Award
} from 'lucide-react';

const RecruiterNewJobPage = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEditMode = !!id;

  const [loading, setLoading] = useState(isEditMode);
  const [submitting, setSubmitting] = useState(false);
  const [departments, setDepartments] = useState([]);
  const [skillInput, setSkillInput] = useState('');
  const [skills, setSkills] = useState([]);

  const { register, handleSubmit, formState: { errors }, setValue, watch } = useForm({
    defaultValues: {
      title: '',
      description: '',
      minExperience: 0,
      departmentId: '',
      status: 'Draft'
    }
  });

  useEffect(() => {
    loadDepartments();
    if (isEditMode) {
      loadJobData();
    }
  }, [id]);

  const loadDepartments = async () => {
    try {
      const response = await api.get('/admin/departments');
      setDepartments(response.data || []);
    } catch (error) {
      console.error('Error loading departments:', error);
    }
  };

  const loadJobData = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/recruiter/jobs/${id}`);
      const job = response.data;

      setValue('title', job.title);
      setValue('description', job.description || '');
      setValue('minExperience', job.minExperience || 0);
      setValue('departmentId', job.departmentId);
      setValue('status', job.status || 'Draft');
      setSkills(job.requiredSkills || []);
    } catch (error) {
      console.error('Error loading job:', error);
      alert('Failed to load job data');
      navigate('/recruiter/jobs');
    } finally {
      setLoading(false);
    }
  };

  const handleAddSkill = (e) => {
    e.preventDefault();
    const trimmed = skillInput.trim();
    if (trimmed && !skills.includes(trimmed)) {
      setSkills([...skills, trimmed]);
      setSkillInput('');
    }
  };

  const handleRemoveSkill = (skillToRemove) => {
    setSkills(skills.filter(s => s !== skillToRemove));
  };

  const onSubmit = async (data) => {
    if (skills.length === 0) {
      alert('Please add at least one required skill');
      return;
    }

    try {
      setSubmitting(true);

      const payload = {
        Title: data.title,
        Description: data.description,
        RequiredSkills: skills,
        MinExperience: parseInt(data.minExperience),
        DepartmentId: data.departmentId
      };

      let jobId = id;

      if (isEditMode) {
        await api.put(`/recruiter/jobs/${id}`, payload);
      } else {
        const response = await api.post('/recruiter/jobs', payload);
        jobId = response.data.id;
      }

      // Update status separately if it changed or if creating new
      if (data.status !== 'Draft' || !isEditMode) {
        await api.patch(`/recruiter/jobs/${jobId}/status`, {
          Status: data.status
        });
      }

      navigate('/recruiter/jobs');
    } catch (error) {
      console.error('Error saving job:', error);
      const message = error.response?.data?.message || 'Failed to save job. Please try again.';
      alert(message);
    } finally {
      setSubmitting(false);
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
    <div className="w-full">
      {/* Header */}
      <div className="mb-8">
        <button
          onClick={() => navigate('/recruiter/jobs')}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4 transition"
        >
          <ArrowLeft className="w-5 h-5" />
          Back to Jobs
        </button>
        <h1 className="text-3xl font-bold text-gray-900">
          {isEditMode ? 'Edit Job Posting' : 'Create New Job Posting'}
        </h1>
        <p className="text-gray-600 mt-2">
          {isEditMode ? 'Update the job posting details' : 'Fill in the details to post a new job opportunity'}
        </p>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit(onSubmit)} className="bg-white rounded-lg shadow-lg p-8 space-y-6">
        {/* Job Title */}
        <div>
          <label htmlFor="title" className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2">
            <Briefcase className="w-4 h-4" />
            Job Title
            <span className="text-red-500">*</span>
          </label>
          <input
            id="title"
            type="text"
            {...register('title', { 
              required: 'Job title is required',
              minLength: { value: 3, message: 'Title must be at least 3 characters' }
            })}
            placeholder="e.g., Senior Software Engineer"
            className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition ${
              errors.title ? 'border-red-500' : 'border-gray-300'
            }`}
          />
          {errors.title && (
            <p className="text-red-500 text-sm mt-1">{errors.title.message}</p>
          )}
        </div>

        {/* Department */}
        <div>
          <label htmlFor="departmentId" className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2">
            <Users className="w-4 h-4" />
            Department
            <span className="text-red-500">*</span>
          </label>
          <select
            id="departmentId"
            {...register('departmentId', { required: 'Department is required' })}
            className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none bg-white transition ${
              errors.departmentId ? 'border-red-500' : 'border-gray-300'
            }`}
          >
            <option value="">Select a department</option>
            {departments.map((dept) => (
              <option key={dept.id} value={dept.id}>
                {dept.organizationName ? `${dept.name} (${dept.organizationName})` : dept.name}
              </option>
            ))}
          </select>
          {errors.departmentId && (
            <p className="text-red-500 text-sm mt-1">{errors.departmentId.message}</p>
          )}
        </div>

        {/* Description */}
        <div>
          <label htmlFor="description" className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2">
            <FileText className="w-4 h-4" />
            Job Description
            <span className="text-red-500">*</span>
          </label>
          <textarea
            id="description"
            rows={8}
            {...register('description', { 
              required: 'Job description is required',
              minLength: { value: 50, message: 'Description must be at least 50 characters' }
            })}
            placeholder="Provide a detailed description of the role, responsibilities, and requirements..."
            className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition resize-y ${
              errors.description ? 'border-red-500' : 'border-gray-300'
            }`}
          />
          {errors.description && (
            <p className="text-red-500 text-sm mt-1">{errors.description.message}</p>
          )}
          <p className="text-xs text-gray-500 mt-1">
            {watch('description')?.length || 0} characters
          </p>
        </div>

        {/* Required Skills */}
        <div>
          <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2">
            <Award className="w-4 h-4" />
            Required Skills
            <span className="text-red-500">*</span>
          </label>
          <div className="space-y-3">
            <div className="flex gap-2">
              <input
                type="text"
                value={skillInput}
                onChange={(e) => setSkillInput(e.target.value)}
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    handleAddSkill(e);
                  }
                }}
                placeholder="Type a skill and press Enter or click Add"
                className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none"
              />
              <button
                type="button"
                onClick={handleAddSkill}
                className="px-4 py-3 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 transition flex items-center gap-2"
              >
                <Plus className="w-4 h-4" />
                Add
              </button>
            </div>

            {skills.length > 0 ? (
              <div className="flex flex-wrap gap-2 p-4 bg-gray-50 rounded-lg border border-gray-200">
                {skills.map((skill, index) => (
                  <span
                    key={index}
                    className="inline-flex items-center gap-2 px-3 py-1.5 bg-indigo-100 text-indigo-800 rounded-full text-sm font-medium"
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
            ) : (
              <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                <p className="text-sm text-yellow-800">
                  No skills added yet. Add at least one required skill.
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Minimum Experience */}
        <div>
          <label htmlFor="minExperience" className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2">
            Minimum Years of Experience
            <span className="text-red-500">*</span>
          </label>
          <select
            id="minExperience"
            {...register('minExperience', { required: 'Experience requirement is required' })}
            className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none bg-white transition ${
              errors.minExperience ? 'border-red-500' : 'border-gray-300'
            }`}
          >
            <option value="0">Entry Level (0+ years)</option>
            <option value="1">1+ years</option>
            <option value="2">2+ years</option>
            <option value="3">3+ years</option>
            <option value="5">5+ years</option>
            <option value="7">7+ years</option>
            <option value="10">10+ years</option>
          </select>
          {errors.minExperience && (
            <p className="text-red-500 text-sm mt-1">{errors.minExperience.message}</p>
          )}
        </div>

        {/* Status */}
        <div>
          <label htmlFor="status" className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2">
            Status
            <span className="text-red-500">*</span>
          </label>
          <select
            id="status"
            {...register('status', { required: 'Status is required' })}
            className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none bg-white transition ${
              errors.status ? 'border-red-500' : 'border-gray-300'
            }`}
          >
            <option value="Draft">Draft - Not visible to candidates</option>
            <option value="Open">Open - Accepting applications</option>
            <option value="Closed">Closed - No longer accepting applications</option>
          </select>
          {errors.status && (
            <p className="text-red-500 text-sm mt-1">{errors.status.message}</p>
          )}
          <p className="text-xs text-gray-500 mt-1">
            {watch('status') === 'Draft' && 'Save as draft to review before publishing'}
            {watch('status') === 'Open' && 'Job will be visible to candidates and accepting applications'}
            {watch('status') === 'Closed' && 'Job will not accept new applications'}
          </p>
        </div>

        {/* Form Actions */}
        <div className="flex items-center justify-end gap-4 pt-6 border-t border-gray-200">
          <button
            type="button"
            onClick={() => navigate('/recruiter/jobs')}
            className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 transition"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={submitting}
            className="px-6 py-3 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            {submitting ? (
              <>
                <Loader className="w-5 h-5 animate-spin" />
                {isEditMode ? 'Updating...' : 'Creating...'}
              </>
            ) : (
              <>
                <Save className="w-5 h-5" />
                {isEditMode ? 'Update Job' : 'Create Job'}
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default RecruiterNewJobPage;
