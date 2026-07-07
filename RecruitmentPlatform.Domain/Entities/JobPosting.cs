using RecruitmentPlatform.Domain.Enums;

namespace RecruitmentPlatform.Domain.Entities;

public class JobPosting
{
    public Guid Id { get; set; }
    public string Title { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public List<string> RequiredSkills { get; set; } = new List<string>();
    public int MinExperience { get; set; }
    public Guid DepartmentId { get; set; }
    public Guid PostedByUserId { get; set; }
    public JobStatus Status { get; set; }
    public DateTime CreatedAt { get; set; }

    // Navigation properties
    public Department Department { get; set; } = null!;
    public User PostedByUser { get; set; } = null!;
    public ICollection<Application> Applications { get; set; } = new List<Application>();
}
