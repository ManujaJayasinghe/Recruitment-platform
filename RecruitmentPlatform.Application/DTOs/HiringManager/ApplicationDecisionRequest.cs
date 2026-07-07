using RecruitmentPlatform.Domain.Enums;

namespace RecruitmentPlatform.Application.DTOs.HiringManager;

public class ApplicationDecisionRequest
{
    public ApplicationStatus Decision { get; set; } // Must be Hired or Rejected
}
