namespace RecruitmentPlatform.Application.Interfaces;

public interface ICalendarService
{
    Task<string?> CreateEventAsync(
        string recruiterGoogleToken,
        string title,
        DateTime start,
        int durationMinutes,
        string attendeeEmail);
}
