using RecruitmentPlatform.Domain.Enums;

namespace RecruitmentPlatform.Domain.Entities;

public class Evaluation
{
    public Guid Id { get; set; }
    public Guid InterviewId { get; set; }
    public Guid EvaluatorUserId { get; set; }
    public int Score { get; set; } // 1-10
    public string Feedback { get; set; } = string.Empty;
    public EvaluationRecommendation Recommendation { get; set; }
    public DateTime CreatedAt { get; set; }

    // Navigation properties
    public Interview Interview { get; set; } = null!;
    public User EvaluatorUser { get; set; } = null!;
}
