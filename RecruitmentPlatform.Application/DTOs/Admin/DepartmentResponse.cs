namespace RecruitmentPlatform.Application.DTOs.Admin;

public class DepartmentResponse
{
    public Guid   Id               { get; set; }
    public string Name             { get; set; } = string.Empty;
    public Guid   OrganizationId   { get; set; }
    public string OrganizationName { get; set; } = string.Empty;
    public int    JobPostingCount  { get; set; }
}
