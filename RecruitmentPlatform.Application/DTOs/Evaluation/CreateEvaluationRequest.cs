using RecruitmentPlatform.Domain.Enums;

namespace RecruitmentPlatform.Application.DTOs.Evaluation;

public class CreateEvaluationRequest
{
    public Guid                     InterviewId    { get; set; }
    public int                      Score          { get; set; } // 1-10
    public string                   Feedback       { get; set; } = string.Empty;
    public EvaluationRecommendation Recommendation { get; set; }
}
