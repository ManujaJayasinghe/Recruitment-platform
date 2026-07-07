using RecruitmentPlatform.Domain.Enums;

namespace RecruitmentPlatform.Application.DTOs.Application;

public class PatchApplicationStatusRequest
{
    public ApplicationStatus Status { get; set; }
}
