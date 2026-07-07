using RecruitmentPlatform.Domain.Enums;

namespace RecruitmentPlatform.Domain.Entities;

public class SkillAssessment
{
    public Guid Id { get; set; }
    public Guid CandidateProfileId { get; set; }
    public string SkillName { get; set; } = string.Empty;
    public ProficiencyLevel ProficiencyLevel { get; set; }

    // Navigation properties
    public CandidateProfile CandidateProfile { get; set; } = null!;
}
