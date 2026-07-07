using RecruitmentPlatform.Domain.Enums;

namespace RecruitmentPlatform.Application.DTOs.Admin;

public class UserListResponse
{
    public Guid     Id        { get; set; }
    public string   FullName  { get; set; } = string.Empty;
    public string   Email     { get; set; } = string.Empty;
    public UserRole Role      { get; set; }
    public bool     IsActive  { get; set; }
    public DateTime CreatedAt { get; set; }
}
