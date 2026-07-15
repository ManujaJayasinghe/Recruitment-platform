import { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { Loader, ThumbsUp, ThumbsDown, RotateCcw, User, Calendar, Star, ArrowLeft, CheckCircle, AlertTriangle } from 'lucide-react';
import hiringManagerService from '../../services/hiringManagerService';

const HiringManagerEvaluatePage = () => {
  const { interviewId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const applicationId = location.state?.applicationId;
  
  const [loading, setLoading] = useState(false);
  const [loadingEvaluations, setLoadingEvaluations] = useState(true);
  const [existingEvaluations, setExistingEvaluations] = useState([]);
  const [submitted, setSubmitted] = useState(false);
  const [showDecisionConfirm, setShowDecisionConfirm] = useState(false);
  const [selectedDecision, setSelectedDecision] = useState(null);
  const [makingDecision, setMakingDecision] = useState(false);
  const [formData, setFormData] = useState({
    score: 5,
    feedback: '',
    recommendation: 'NeedsAnotherRound'
  });

  useEffect(() => {
    if (interviewId) {
      loadExistingEvaluations();
    }
  }, [interviewId]);

  const loadExistingEvaluations = async () => {
    try {
      setLoadingEvaluations(true);
      const data = await hiringManagerService.getEvaluationsByInterview(interviewId);
      setExistingEvaluations(data);
    } catch (error) {
      console.error('Error loading evaluations:', error);
      alert('Failed to load evaluations');
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
          alert('Evaluation saved, but could not update application status. Please navigate from the shortlist page.');
        } else {
          const decision = formData.recommendation === 'Hire' ? 'Hired' : 'Rejected';
          await hiringManagerService.makeDecision(applicationId, decision);
          
          // Navigate back to shortlist after making a final decision
          alert(`Candidate ${decision.toLowerCase()} successfully. They will be notified via email.`);
          navigate('/hiring-manager/shortlist');
          return;
        }
      }
      
      setSubmitted(true);
      
      // Reload evaluations to show the new one
      await loadExistingEvaluations();
      
      // Reset form
      setFormData({
        score: 5,
        feedback: '',
        recommendation: 'NeedsAnotherRound'
      });

      // Scroll to top to show success message
      window.scrollTo({ top: 0, behavior: 'smooth' });
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

  const handleDecisionClick = (decision) => {
    setSelectedDecision(decision);
    setShowDecisionConfirm(true);
  };

  const handleConfirmDecision = async () => {
    if (!applicationId) {
      alert('Application ID not found. Please navigate from the shortlist page.');
      return;
    }

    try {
      setMakingDecision(true);
      await hiringManagerService.makeDecision(applicationId, selectedDecision);
      
      // Show success and navigate back
      alert(`Candidate ${selectedDecision === 'Hired' ? 'hired' : 'rejected'} successfully. They will be notified via email.`);
      navigate('/hiring-manager/shortlist');
    } catch (error) {
      console.error('Error making decision:', error);
      alert('Failed to make decision: ' + (error.response?.data?.message || error.message));
    } finally {
      setMakingDecision(false);
      setShowDecisionConfirm(false);
    }
  };

  const handleCancelDecision = () => {
    setShowDecisionConfirm(false);
    setSelectedDecision(null);
  };

  return (
    <div className="max-w-4xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <button
          onClick={() => navigate('/hiring-manager/shortlist')}
          className="inline-flex items-center gap-2 text-purple-600 hover:text-purple-700 mb-4 transition"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Shortlist
        </button>
        <h1 className="text-3xl font-bold text-gray-900">Interview Evaluation</h1>
        <p className="text-gray-600 mt-2">
          Provide your assessment of the candidate's interview performance
        </p>
      </div>

      {/* Success Message */}
      {submitted && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6 flex items-center gap-3">
          <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0" />
          <div>
            <p className="font-medium text-green-900">Evaluation submitted successfully!</p>
            <p className="text-sm text-green-700">Your feedback has been recorded.</p>
          </div>
        </div>
      )}

      {/* Existing Evaluations */}
      {loadingEvaluations ? (
        <div className="flex items-center justify-center py-12 bg-white rounded-lg shadow-md mb-6">
          <Loader className="w-8 h-8 text-purple-600 animate-spin" />
        </div>
      ) : existingEvaluations.length > 0 && (
        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            Previous Evaluations ({existingEvaluations.length})
          </h2>
          <div className="space-y-4">
            {existingEvaluations.map((evaluation) => (
              <div
                key={evaluation.id}
                className="bg-gray-50 rounded-lg p-4 border border-gray-200"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center">
                      <User className="w-5 h-5 text-purple-600" />
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">{evaluation.evaluatorName}</p>
                      <p className="text-sm text-gray-500 flex items-center gap-1 mt-0.5">
                        <Calendar className="w-3 h-3" />
                        {formatDate(evaluation.createdAt)}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="flex items-center gap-1 bg-yellow-50 text-yellow-700 px-3 py-1.5 rounded-lg">
                      <Star className="w-4 h-4 fill-current" />
                      <span className="font-bold">{evaluation.score}/10</span>
                    </div>
                    <span className={`inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-sm font-semibold ${getRecommendationColor(evaluation.recommendation)}`}>
                      {getRecommendationIcon(evaluation.recommendation)}
                      {formatRecommendation(evaluation.recommendation)}
                    </span>
                  </div>
                </div>
                <div className="bg-white rounded p-4 text-sm text-gray-700">
                  <p className="font-medium text-gray-900 mb-2">Feedback:</p>
                  {evaluation.feedback}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Make Decision Section - Only show if evaluations exist */}
      {!loadingEvaluations && existingEvaluations.length > 0 && applicationId && (
        <div className="bg-white rounded-lg shadow-lg p-6 mb-6 border-l-4 border-purple-500">
          <div className="flex items-start gap-3 mb-4">
            <AlertTriangle className="w-6 h-6 text-purple-600 flex-shrink-0 mt-1" />
            <div>
              <h2 className="text-xl font-semibold text-gray-900 mb-1">
                Make Final Decision
              </h2>
              <p className="text-sm text-gray-600">
                Based on the evaluations above, you can now make a final hiring decision for this candidate.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-4 mt-6">
            <button
              onClick={() => handleDecisionClick('Hired')}
              disabled={makingDecision}
              className="flex-1 inline-flex items-center justify-center gap-2 px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition font-semibold"
            >
              <ThumbsUp className="w-5 h-5" />
              Hire Candidate
            </button>
            <button
              onClick={() => handleDecisionClick('Rejected')}
              disabled={makingDecision}
              className="flex-1 inline-flex items-center justify-center gap-2 px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition font-semibold"
            >
              <ThumbsDown className="w-5 h-5" />
              Reject Candidate
            </button>
          </div>
        </div>
      )}

      {/* Evaluation Form */}
      <div className="bg-white rounded-lg shadow-lg p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-6">
          Submit Your Evaluation
        </h2>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Score Slider */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Overall Score: <span className="text-purple-600 font-bold text-2xl ml-2">{formData.score}/10</span>
            </label>
            <div className="px-2">
              <input
                type="range"
                min="1"
                max="10"
                value={formData.score}
                onChange={(e) => setFormData({ ...formData, score: parseInt(e.target.value) })}
                className="w-full h-3 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-purple-600"
                style={{
                  background: `linear-gradient(to right, #9333ea 0%, #9333ea ${(formData.score - 1) * 11.11}%, #e5e7eb ${(formData.score - 1) * 11.11}%, #e5e7eb 100%)`
                }}
              />
              <div className="flex justify-between text-xs text-gray-500 mt-2 px-1">
                <span>1 (Poor)</span>
                <span>5 (Average)</span>
                <span>10 (Excellent)</span>
              </div>
            </div>
          </div>

          {/* Feedback Textarea */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Detailed Feedback <span className="text-red-500">*</span>
            </label>
            <textarea
              value={formData.feedback}
              onChange={(e) => setFormData({ ...formData, feedback: e.target.value })}
              rows="8"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none"
              placeholder="Provide detailed feedback about:&#10;• Technical skills and knowledge&#10;• Communication abilities&#10;• Problem-solving approach&#10;• Cultural fit&#10;• Strengths and areas for improvement"
              required
            />
            <div className="flex justify-between items-center mt-2">
              <p className="text-xs text-gray-500">
                Be specific and provide examples where possible
              </p>
              <p className="text-xs text-gray-500">
                {formData.feedback.length} characters
              </p>
            </div>
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
              <option value="Hire">✓ Hire - Candidate meets all requirements</option>
              <option value="Reject">✗ Reject - Not a good fit</option>
              <option value="NeedsAnotherRound">↻ Needs Another Round - Requires further evaluation</option>
            </select>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-200">
            <button
              type="button"
              onClick={() => navigate('/hiring-manager/shortlist')}
              className="px-6 py-2.5 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition font-medium"
              disabled={loading}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading || !formData.feedback.trim()}
              className="px-6 py-2.5 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition flex items-center gap-2 font-medium"
            >
              {loading && <Loader className="w-4 h-4 animate-spin" />}
              {loading ? 'Submitting...' : 'Submit Evaluation'}
            </button>
          </div>
        </form>
      </div>

      {/* Confirmation Dialog */}
      {showDecisionConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
            <div className="flex items-start gap-4 mb-4">
              <div className={`w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0 ${
                selectedDecision === 'Hired' ? 'bg-green-100' : 'bg-red-100'
              }`}>
                {selectedDecision === 'Hired' ? (
                  <ThumbsUp className={`w-6 h-6 text-green-600`} />
                ) : (
                  <ThumbsDown className={`w-6 h-6 text-red-600`} />
                )}
              </div>
              <div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">
                  Confirm {selectedDecision === 'Hired' ? 'Hire' : 'Rejection'}
                </h3>
                <p className="text-gray-600">
                  Are you sure you want to {selectedDecision === 'Hired' ? 'hire' : 'reject'} this candidate? 
                  <span className="font-semibold text-gray-900"> This action cannot be undone.</span>
                </p>
                <p className="text-sm text-gray-500 mt-2">
                  The candidate will be notified via email about your decision.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3 mt-6">
              <button
                onClick={handleCancelDecision}
                disabled={makingDecision}
                className="flex-1 px-4 py-2.5 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed transition font-medium"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmDecision}
                disabled={makingDecision}
                className={`flex-1 px-4 py-2.5 text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition font-semibold flex items-center justify-center gap-2 ${
                  selectedDecision === 'Hired' 
                    ? 'bg-green-600 hover:bg-green-700' 
                    : 'bg-red-600 hover:bg-red-700'
                }`}
              >
                {makingDecision && <Loader className="w-4 h-4 animate-spin" />}
                {makingDecision 
                  ? 'Processing...' 
                  : `Yes, ${selectedDecision === 'Hired' ? 'Hire' : 'Reject'}`
                }
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default HiringManagerEvaluatePage;
