using Google.Apis.Auth.OAuth2;
using Google.Apis.Calendar.v3;
using Google.Apis.Calendar.v3.Data;
using Google.Apis.Services;
using Microsoft.Extensions.Logging;
using RecruitmentPlatform.Application.Interfaces;

namespace RecruitmentPlatform.Infrastructure.Services;

/// <summary>
/// Google Calendar integration — creates calendar events on behalf of a recruiter.
///
/// PROTOTYPE LIMITATION (documented assumption for the report):
/// This implementation accepts a short-lived OAuth 2.0 access token that the
/// recruiter obtains manually from https://developers.google.com/oauthplayground
/// using scope: https://www.googleapis.com/auth/calendar.events
///
/// A production implementation would replace this with a full server-side
/// OAuth 2.0 Authorization Code flow (PKCE), storing the refresh token
/// securely and exchanging it for access tokens automatically.
/// That consent-screen flow is out of scope for this prototype and is noted
/// as a future enhancement in the report's Assumptions and Constraints section.
///
/// How to get a test token for the demo:
/// 1. Go to https://developers.google.com/oauthplayground
/// 2. In settings (⚙) enable "Use your own OAuth credentials" and enter your
///    Google Cloud Console Client ID + Secret for a Desktop app.
/// 3. In Step 1, select "Calendar API v3 → .../auth/calendar.events", click Authorize.
/// 4. In Step 2, click "Exchange authorization code for tokens".
/// 5. Copy the "Access token" — it is valid for ~1 hour.
/// 6. Pass it in the CalendarToken field when calling POST /api/interviews.
/// </summary>
public class GoogleCalendarService : ICalendarService
{
    private readonly ILogger<GoogleCalendarService> _logger;

    public GoogleCalendarService(ILogger<GoogleCalendarService> logger)
    {
        _logger = logger;
    }

    public async Task<string?> CreateEventAsync(
        string   recruiterGoogleToken,
        string   title,
        DateTime start,
        int      durationMinutes,
        string   attendeeEmail)
    {
        if (string.IsNullOrWhiteSpace(recruiterGoogleToken))
            return null;

        try
        {
            // Build a credential from the supplied bearer token (no refresh — prototype scope)
            var credential = GoogleCredential
                .FromAccessToken(recruiterGoogleToken)
                .CreateScoped(CalendarService.Scope.CalendarEvents);

            var calendarService = new CalendarService(new BaseClientService.Initializer
            {
                HttpClientInitializer = credential,
                ApplicationName       = "Recruitment Platform",
            });

            var end = start.AddMinutes(durationMinutes);

            var calEvent = new Event
            {
                Summary     = title,
                Description = "Scheduled via the Recruitment Platform.",
                Start       = new EventDateTime
                {
                    DateTimeDateTimeOffset = new DateTimeOffset(start, TimeSpan.Zero),
                    TimeZone              = "UTC",
                },
                End = new EventDateTime
                {
                    DateTimeDateTimeOffset = new DateTimeOffset(end, TimeSpan.Zero),
                    TimeZone              = "UTC",
                },
                Attendees = new List<EventAttendee>
                {
                    new EventAttendee { Email = attendeeEmail },
                },
                // Request Google Meet conference link automatically
                ConferenceData = new ConferenceData
                {
                    CreateRequest = new CreateConferenceRequest
                    {
                        RequestId         = Guid.NewGuid().ToString(),
                        ConferenceSolutionKey = new ConferenceSolutionKey
                        {
                            Type = "hangoutsMeet",
                        },
                    },
                },
            };

            var insertRequest = calendarService.Events.Insert(calEvent, "primary");
            insertRequest.ConferenceDataVersion = 1; // required to trigger Meet link creation
            insertRequest.SendUpdates           = EventsResource.InsertRequest.SendUpdatesEnum.All;

            var createdEvent = await insertRequest.ExecuteAsync();

            // Prefer the Google Meet link; fall back to the calendar event HTML link
            var meetLink = createdEvent.ConferenceData?.EntryPoints
                ?.FirstOrDefault(ep => ep.EntryPointType == "video")
                ?.Uri;

            var link = meetLink ?? createdEvent.HtmlLink;

            _logger.LogInformation(
                "[GoogleCalendarService] Event created: '{Title}' on {Start} UTC | Link: {Link}",
                title, start, link);

            return link;
        }
        catch (Exception ex)
        {
            // Don't crash the interview-scheduling endpoint if Calendar fails.
            // The interview is still saved; the recruiter can add the link manually.
            _logger.LogWarning(ex,
                "[GoogleCalendarService] Failed to create calendar event for '{Title}'. " +
                "Interview will be saved without a meeting link. " +
                "Common causes: expired token, missing calendar.events scope, or API not enabled in GCP.",
                title);
            return null;
        }
    }
}
