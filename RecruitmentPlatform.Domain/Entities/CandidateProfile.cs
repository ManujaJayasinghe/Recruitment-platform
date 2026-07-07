namespace RecruitmentPlatform.Domain.Entities;

public class CandidateProfile
{
    public Guid Id { get; set; }
    public Guid UserId { get; set; }
    public string Headline { get; set; } = string.Empty;
    public string Summary { get; set; } = string.Empty;
    public List<string> Skills { get; set; } = new List<string>();
    public int YearsOfExperience { get; set; }
    public string? ResumeFileUrl { get; set; }
    public string? ParsedResumeJson { get; set; }

    // Navigation properties
    public User User { get; set; } = null!;
    public ICollection<SkillAssessment> SkillAssessments { get; set; } = new List<SkillAssessment>();
    public ICollection<Application> Applications { get; set; } = new List<Application>();
}
