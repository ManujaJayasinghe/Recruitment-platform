import { useState, useEffect } from 'react';
import { X, Loader, ThumbsUp, ThumbsDown, RotateCcw, User, Calendar, Star } from 'lucide-react';
import hiringManagerService from '../services/hiringManagerService';

const EvaluationFormModal = ({ isOpen, onClose, interviewId, applicationId, onSuccess }) => {
  const [loading, setLoading] = useState(false);
  const [loadingEvaluations, setLoadingEvaluations] = useState(true);
  const [existingEvaluations, setExistingEvaluations] = useState([]);
  const [formData, setFormData] = useState({
    score: 5,
    feedback: '',
    recommendation: 'NeedsAnotherRound'
  });

  useEffect(() => {
    if (isOpen && interviewId) {
      loadExistingEvaluations();
    }
  }, [isOpen, interviewId]);

  const loadExistingEvaluations = async () => {
    try {
      setLoadingEvaluations(true);
      const data = await hiringManagerService.getEvaluationsByInterview(interviewId);
      setExistingEvaluations(data);
    } catch (error) {
      console.error('Error loading evaluations:', error);
    } finally {
      setLoadingEvaluations(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.feedback.trim()) {
      alert('Please provide feedback');
      return;
    }

    try {
      setLoading(true);
      
      // Step 1: Create the evaluation
      await hiringManagerService.createEvaluation({
        interviewId,
        score: formData.score,
        feedback: formData.feedback,
        recommendation: formData.recommendation
      });
      
      // Step 2: If recommendation is Hire or Reject, make the decision
      if (formData.recommendation === 'Hire' || formData.recommendation === 'Reject') {
        if (!applicationId) {
          console.error('Application ID not available for decision');
          alert('Evaluation saved, but could not update application status. Please contact support.');
        } else {
          const decision = formData.recommendation === 'Hire' ? 'Hired' : 'Rejected';
          await hiringManagerService.makeDecision(applicationId, decision);
        }
      }
      
      if (onSuccess) {
        onSuccess();
      }
      
      // Reload evaluations to show the new one
      await loadExistingEvaluations();
      
      // Reset form
      setFormData({
        score: 5,
        feedback: '',
        recommendation: 'NeedsAnotherRound'
      });
      
      // Close modal on success
      onClose();
    } catch (error) {
      console.error('Error submitting evaluation:', error);
      alert('Failed to submit evaluation: ' + (error.response?.data?.message || error.message));
    } finally {
      setLoading(false);
    }
  };

  const getRecommendationIcon = (recommendation) => {
    switch (recommendation) {
      case 'Hire': return <ThumbsUp className="w-4 h-4" />;
      case 'Reject': return <ThumbsDown className="w-4 h-4" />;
      case 'NeedsAnotherRound': return <RotateCcw className="w-4 h-4" />;
      default: return null;
    }
  };

  const getRecommendationColor = (recommendation) => {
    switch (recommendation) {
      case 'Hire': return 'bg-green-100 text-green-800';
      case 'Reject': return 'bg-red-100 text-red-800';
      case 'NeedsAnotherRound': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const formatRecommendation = (recommendation) => {
    switch (recommendation) {
      case 'Hire': return 'Hire';
      case 'Reject': return 'Reject';
      case 'NeedsAnotherRound': return 'Needs Another Round';
      default: return recommendation;
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between z-10">
          <h2 className="text-2xl font-bold text-gray-900">Interview Evaluation</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Existing Evaluations */}
          {loadingEvaluations ? (
            <div className="flex items-center justify-center py-8">
              <Loader className="w-6 h-6 text-purple-600 animate-spin" />
            </div>
          ) : existingEvaluations.length > 0 && (
            <div className="bg-gray-50 rounded-lg p-4">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Previous Evaluations ({existingEvaluations.length})
              </h3>
              <div className="space-y-4">
                {existingEvaluations.map((evaluation) => (
                  <div
                    key={evaluation.id}
                    className="bg-white rounded-lg p-4 border border-gray-200"
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-full bg-purple-100 flex items-center justify-center">
                          <User className="w-4 h-4 text-purple-600" />
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">{evaluation.evaluatorName}</p>
                          <p className="text-xs text-gray-500 flex items-center gap-1">
                            <Calendar className="w-3 h-3" />
                            {formatDate(evaluation.createdAt)}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="flex items-center gap-1 bg-yellow-50 text-yellow-700 px-2 py-1 rounded-lg">
                          <Star className="w-4 h-4" />
                          <span className="font-semibold">{evaluation.score}/10</span>
                        </div>
                        <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-semibold ${getRecommendationColor(evaluation.recommendation)}`}>
                          {getRecommendationIcon(evaluation.recommendation)}
                          {formatRecommendation(evaluation.recommendation)}
                        </span>
                      </div>
                    </div>
                    <div className="text-sm text-gray-700 bg-gray-50 rounded p-3">
                      {evaluation.feedback}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Evaluation Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="bg-purple-50 rounded-lg p-4 border border-purple-200">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Submit Your Evaluation
              </h3>

              {/* Score Slider */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Score: <span className="text-purple-600 font-bold text-lg">{formData.score}/10</span>
                </label>
                <input
                  type="range"
                  min="1"
                  max="10"
                  value={formData.score}
                  onChange={(e) => setFormData({ ...formData, score: parseInt(e.target.value) })}
                  className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-purple-600"
                />
                <div className="flex justify-between text-xs text-gray-500 mt-1">
                  <span>1 (Poor)</span>
                  <span>10 (Excellent)</span>
                </div>
              </div>

              {/* Feedback Textarea */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Feedback <span className="text-red-500">*</span>
                </label>
                <textarea
                  value={formData.feedback}
                  onChange={(e) => setFormData({ ...formData, feedback: e.target.value })}
                  rows="6"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none"
                  placeholder="Provide detailed feedback about the candidate's performance during the interview..."
                  required
                />
                <p className="text-xs text-gray-500 mt-1">
                  {formData.feedback.length} characters
                </p>
              </div>

              {/* Recommendation Dropdown */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Recommendation <span className="text-red-500">*</span>
                </label>
                <select
                  value={formData.recommendation}
                  onChange={(e) => setFormData({ ...formData, recommendation: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  required
                >
                  <option value="Hire">Hire</option>
                  <option value="Reject">Reject</option>
                  <option value="NeedsAnotherRound">Needs Another Round</option>
                </select>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={onClose}
                className="px-6 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition"
                disabled={loading}
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition flex items-center gap-2"
              >
                {loading && <Loader className="w-4 h-4 animate-spin" />}
                {loading ? 'Submitting...' : 'Submit Evaluation'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default EvaluationFormModal;
