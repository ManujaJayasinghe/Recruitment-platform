namespace RecruitmentPlatform.Application.DTOs.Interview;

public class CreateInterviewRequest
{
    public Guid     ApplicationId   { get; set; }
    public DateTime ScheduledAt     { get; set; }
    public int      DurationMinutes { get; set; }
    public string?  MeetingLink     { get; set; }
}
