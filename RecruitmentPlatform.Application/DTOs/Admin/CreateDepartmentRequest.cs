namespace RecruitmentPlatform.Application.DTOs.Admin;

public class CreateDepartmentRequest
{
    public string Name           { get; set; } = string.Empty;
    public Guid   OrganizationId { get; set; }
}
