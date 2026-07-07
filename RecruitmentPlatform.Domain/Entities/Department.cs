namespace RecruitmentPlatform.Domain.Entities;

public class Department
{
    public Guid Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public Guid OrganizationId { get; set; }

    // Navigation properties
    public Organization Organization { get; set; } = null!;
    public ICollection<JobPosting> JobPostings { get; set; } = new List<JobPosting>();
}
