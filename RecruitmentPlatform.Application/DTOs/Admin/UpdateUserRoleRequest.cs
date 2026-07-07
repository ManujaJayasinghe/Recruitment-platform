using RecruitmentPlatform.Domain.Enums;

namespace RecruitmentPlatform.Application.DTOs.Admin;

public class UpdateUserRoleRequest
{
    public UserRole Role { get; set; }
}
