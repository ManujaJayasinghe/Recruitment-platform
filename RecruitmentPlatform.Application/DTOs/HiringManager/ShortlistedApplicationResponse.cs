using RecruitmentPlatform.Domain.Enums;

namespace RecruitmentPlatform.Application.DTOs.HiringManager;

public class ShortlistedApplicationResponse
{
    public Guid              Id                 { get; set; }
    public Guid              JobPostingId       { get; set; }
    public string            JobTitle           { get; set; } = string.Empty;
    public string            DepartmentName     { get; set; } = string.Empty;
    public Guid              CandidateProfileId { get; set; }
    public string            CandidateName      { get; set; } = string.Empty;
    public string            CandidateEmail     { get; set; } = string.Empty;
    public ApplicationStatus Status             { get; set; }
    public double?           MatchScore         { get; set; }
    public DateTime          AppliedAt          { get; set; }
    public DateTime?         InterviewScheduledAt { get; set; }
}
