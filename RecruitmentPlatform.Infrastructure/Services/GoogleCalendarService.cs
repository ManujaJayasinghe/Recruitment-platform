using Google.Apis.Auth.OAuth2;
using Google.Apis.Calendar.v3;
using Google.Apis.Calendar.v3.Data;
using Google.Apis.Services;
using Microsoft.Extensions.Logging;
using RecruitmentPlatform.Application.Interfaces;

namespace RecruitmentPlatform.Infrastructure.Services;

/// <summary>
/// Google Calendar integration for interview scheduling.
/// 
/// PROTOTYPE LIMITATION:
/// This service uses a simplified OAuth flow where the recruiter provides
/// a pre-obtained Google OAuth access token (e.g., from OAuth Playground).
/// 
/// For production, implement a full OAuth consent flow:
/// - Use Google.Apis.Auth.AspNetCore for ASP.NET Core OAuth
/// - Store refresh tokens per user in the database
/// - Handle token refresh automatically
/// - Implement proper consent screens
/// 
/// Testing:
/// 1. Go to https://developers.google.com/oauthplayground
/// 2. Select "Calendar API v3" → "https://www.googleapis.com/auth/calendar"
/// 3. Click "Authorize APIs" and sign in with your Google account
/// 4. Exchange authorization code for tokens
/// 5. Use the "Access token" in API requests
/// 
/// Note: Playground tokens expire after 1 hour and cannot be refreshed.
/// </summary>
public class GoogleCalendarService : ICalendarService
{
    private readonly ILogger<GoogleCalendarService> _logger;

    public GoogleCalendarService(ILogger<GoogleCalendarService> logger)
    {
        _logger = logger;
    }

    public async Task<string?> CreateEventAsync(
        string recruiterGoogleToken,
        string title,
        DateTime start,
        int durationMinutes,
        string attendeeEmail)
    {
        if (string.IsNullOrWhiteSpace(recruiterGoogleToken))
        {
            _logger.LogWarning("No Google Calendar token provided. Skipping calendar event creation.");
            return null;
        }

        try
        {
            // Create credential from the provided access token
            var credential = GoogleCredential.FromAccessToken(recruiterGoogleToken);

            var service = new CalendarService(new BaseClientService.Initializer
            {
                HttpClientInitializer = credential,
                ApplicationName = "Recruitment Platform",
            });

            var endTime = start.AddMinutes(durationMinutes);

            var calendarEvent = new Event
            {
                Summary = title,
                Description = $"Interview scheduled via Recruitment Platform",
                Start = new EventDateTime
                {
                    DateTime = start,
                    TimeZone = "UTC",
                },
                End = new EventDateTime
                {
                    DateTime = endTime,
                    TimeZone = "UTC",
                },
                Attendees = new List<EventAttendee>
                {
                    new EventAttendee { Email = attendeeEmail }
                },
                ConferenceData = new ConferenceData
                {
                    CreateRequest = new CreateConferenceRequest
                    {
                        RequestId = Guid.NewGuid().ToString(),
                        ConferenceSolutionKey = new ConferenceSolutionKey
                        {
                            Type = "hangoutsMeet" // Google Meet
                        }
                    }
                },
                Reminders = new Event.RemindersData
                {
                    UseDefault = false,
                    Overrides = new List<EventReminder>
                    {
                        new EventReminder { Method = "email", Minutes = 24 * 60 }, // 1 day before
                        new EventReminder { Method = "popup", Minutes = 30 },      // 30 mins before
                    }
                }
            };

            var request = service.Events.Insert(calendarEvent, "primary");
            request.ConferenceDataVersion = 1; // Required for Google Meet link generation
            request.SendUpdates = EventsResource.InsertRequest.SendUpdatesEnum.All;

            var createdEvent = await request.ExecuteAsync();

            var meetingLink = createdEvent.HangoutLink ?? createdEvent.HtmlLink;

            _logger.LogInformation(
                "Google Calendar event created: {EventId} | Meeting link: {MeetingLink}",
                createdEvent.Id, meetingLink);

            return meetingLink;
        }
        catch (Google.GoogleApiException ex)
        {
            _logger.LogError(ex,
                "Google Calendar API error: {Message}. " +
                "Token may be expired or invalid. Status: {StatusCode}",
                ex.Message, ex.HttpStatusCode);
            return null;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Unexpected error creating Google Calendar event");
            return null;
        }
    }
}
