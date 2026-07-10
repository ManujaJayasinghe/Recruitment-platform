namespace RecruitmentPlatform.Application.DTOs.Interview;

public class CreateInterviewRequest
{
    public Guid     ApplicationId   { get; set; }
    public DateTime ScheduledAt     { get; set; }
    public int      DurationMinutes { get; set; }
<<<<<<< HEAD
    public string?  MeetingLink     { get; set; }
=======

    /// <summary>
    /// Optional: manually supplied meeting link.
    /// If CalendarToken is also provided, this field is ignored and the
    /// Google Calendar-generated link is used instead.
    /// </summary>
    public string?  MeetingLink     { get; set; }

    /// <summary>
    /// Optional: Google OAuth 2.0 access token with calendar.events scope.
    /// When provided, a Google Calendar event + Meet link is created automatically.
    /// Obtain a test token from https://developers.google.com/oauthplayground
    /// (scope: https://www.googleapis.com/auth/calendar.events).
    /// This field is NOT persisted — it is used only during the request lifecycle.
    /// </summary>
    public string?  CalendarToken   { get; set; }
>>>>>>> dc5eb2e (Initial frontend commit)
}
