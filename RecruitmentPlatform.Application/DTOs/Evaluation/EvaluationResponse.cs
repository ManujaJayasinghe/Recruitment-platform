using RecruitmentPlatform.Domain.Enums;

namespace RecruitmentPlatform.Application.DTOs.Evaluation;

public class EvaluationResponse
{
    public Guid                     Id             { get; set; }
    public Guid                     InterviewId    { get; set; }
    public Guid                     EvaluatorUserId { get; set; }
    public string                   EvaluatorName  { get; set; } = string.Empty;
    public int                      Score          { get; set; }
    public string                   Feedback       { get; set; } = string.Empty;
    public EvaluationRecommendation Recommendation { get; set; }
    public DateTime                 CreatedAt      { get; set; }
}
