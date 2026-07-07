using RecruitmentPlatform.Domain.Enums;

namespace RecruitmentPlatform.Domain.Entities;

public class Interview
{
    public Guid Id { get; set; }
    public Guid ApplicationId { get; set; }
    public DateTime ScheduledAt { get; set; }
    public int DurationMinutes { get; set; }
    public string? MeetingLink { get; set; }
    public InterviewStatus Status { get; set; }

    // Navigation properties
    public Application Application { get; set; } = null!;
    public ICollection<Evaluation> Evaluations { get; set; } = new List<Evaluation>();
}
