using RecruitmentPlatform.Domain.Enums;

namespace RecruitmentPlatform.Application.DTOs.Job;

public class PatchJobStatusRequest
{
    public JobStatus Status { get; set; }
}
