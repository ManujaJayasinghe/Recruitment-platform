using RecruitmentPlatform.Domain.Enums;

namespace RecruitmentPlatform.Domain.Entities;

public class User
{
    public Guid Id { get; set; }
    public string FullName { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public string PasswordHash { get; set; } = string.Empty;
    public UserRole Role { get; set; }
    public DateTime CreatedAt { get; set; }
    public bool IsActive { get; set; }

    // Navigation properties
    public CandidateProfile? CandidateProfile { get; set; }
    public ICollection<JobPosting> JobPostings { get; set; } = new List<JobPosting>();
    public ICollection<Evaluation> Evaluations { get; set; } = new List<Evaluation>();
    public ICollection<Message> Messages { get; set; } = new List<Message>();
}
