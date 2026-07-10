namespace RecruitmentPlatform.Application.Interfaces;

/// <summary>
/// Abstraction over Google Calendar (or any future calendar provider).
/// The recruiter supplies a short-lived OAuth 2.0 access token obtained
/// from https://developers.google.com/oauthplayground — the platform never
/// handles the OAuth consent flow directly (documented prototype limitation;
/// full OAuth PKCE/server-side flow is noted as a stretch goal in the report).
/// </summary>
public interface ICalendarService
{
    /// <summary>
    /// Creates a Google Calendar event and returns the event's HTML link
    /// (meet.google.com link if a Meet conference is auto-created, otherwise
    /// the calendar event URL).
    /// </summary>
    /// <param name="recruiterGoogleToken">
    /// A valid Google OAuth 2.0 access token with scope
    /// https://www.googleapis.com/auth/calendar.events
    /// Obtain one from https://developers.google.com/oauthplayground for testing.
    /// </param>
    /// <param name="title">Event title shown in Google Calendar.</param>
    /// <param name="start">Start time in UTC.</param>
    /// <param name="durationMinutes">Duration of the event in minutes.</param>
    /// <param name="attendeeEmail">Candidate's email — added as a guest.</param>
    /// <returns>
    /// The Google Meet link or calendar event HTML link on success;
    /// null if the token is missing or the API call fails gracefully.
    /// </returns>
    Task<string?> CreateEventAsync(
        string   recruiterGoogleToken,
        string   title,
        DateTime start,
        int      durationMinutes,
        string   attendeeEmail);
}
