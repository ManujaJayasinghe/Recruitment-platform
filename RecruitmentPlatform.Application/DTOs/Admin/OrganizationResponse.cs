namespace RecruitmentPlatform.Application.DTOs.Admin;

public class OrganizationResponse
{
    public Guid     Id           { get; set; }
    public string   Name         { get; set; } = string.Empty;
    public string   Industry     { get; set; } = string.Empty;
    public DateTime CreatedAt    { get; set; }
    public int      DepartmentCount { get; set; }
}
