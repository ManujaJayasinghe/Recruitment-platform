using RecruitmentPlatform.Domain.Enums;

namespace RecruitmentPlatform.Application.DTOs.Interview;

public class InterviewResponse
{
    public Guid            Id              { get; set; }
    public Guid            ApplicationId   { get; set; }
    public DateTime        ScheduledAt     { get; set; }
    public int             DurationMinutes { get; set; }
    public string?         MeetingLink     { get; set; }
    public InterviewStatus Status          { get; set; }
    
    // Additional info
    public string CandidateName { get; set; } = string.Empty;
    public string JobTitle      { get; set; } = string.Empty;
    public string CompanyName   { get; set; } = string.Empty;
}
