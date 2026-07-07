using RecruitmentPlatform.Domain.Enums;

namespace RecruitmentPlatform.Domain.Entities;

public class Application
{
    public Guid Id { get; set; }
    public Guid JobPostingId { get; set; }
    public Guid CandidateProfileId { get; set; }
    public ApplicationStatus Status { get; set; }
    public double? MatchScore { get; set; }
    public DateTime AppliedAt { get; set; }

    // Navigation properties
    public JobPosting JobPosting { get; set; } = null!;
    public CandidateProfile CandidateProfile { get; set; } = null!;
    public Interview? Interview { get; set; }
    public ICollection<Message> Messages { get; set; } = new List<Message>();
}
