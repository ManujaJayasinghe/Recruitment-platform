# Google Calendar Integration Setup

## Overview
The Google Calendar integration allows recruiters to automatically create calendar events with Google Meet links when scheduling interviews.

## ⚠️ PROTOTYPE LIMITATION

This implementation uses a **simplified OAuth flow** for prototype purposes:
- Recruiters must provide a pre-obtained Google OAuth access token
- Tokens are passed in the API request body
- No token storage or refresh mechanism

**This is intentional for the prototype.** A full OAuth consent flow is a **stretch goal**, not required for this phase.

## How It Works

### Current Flow (Prototype)
1. Recruiter obtains a Google OAuth access token (see below)
2. Recruiter includes the token in the `POST /api/interviews` request body
3. System creates a Google Calendar event with:
   - Event title: "Interview: [Job Title]"
   - Candidate added as attendee
   - Google Meet link auto-generated
   - Email reminder 1 day before
   - Popup reminder 30 minutes before
4. The meeting link is saved to `Interview.MeetingLink`
5. Candidate receives the link via email notification

### Production Flow (Future)
For production, implement a full OAuth consent flow:
- Use `Google.Apis.Auth.AspNetCore` for ASP.NET Core OAuth
- Store refresh tokens per user in the database
- Implement automatic token refresh
- Add proper Google consent screens
- Store tokens securely (encrypted)

## Getting a Test Token

### Option 1: Google OAuth 2.0 Playground (Quick Testing)
1. Go to https://developers.google.com/oauthplayground
2. Click the gear icon (⚙️) on the top right
3. Check "Use your own OAuth credentials" if you have a project
4. In the left panel, find and select:
   - **Calendar API v3**
   - Check: `https://www.googleapis.com/auth/calendar`
5. Click "Authorize APIs"
6. Sign in with your Google account
7. Grant permissions
8. Click "Exchange authorization code for tokens"
9. Copy the **Access token** from the response

**Important Notes:**
- Playground tokens expire after 1 hour
- Cannot be refreshed
- Suitable for testing only
- The calendar events will be created in the Google account you authorized

### Option 2: Create a Google Cloud Project (More Permanent)
1. Go to https://console.cloud.google.com/
2. Create a new project or select existing
3. Enable the Google Calendar API:
   - Navigate to "APIs & Services" → "Library"
   - Search for "Google Calendar API"
   - Click "Enable"
4. Create OAuth 2.0 credentials:
   - Go to "APIs & Services" → "Credentials"
   - Click "Create Credentials" → "OAuth client ID"
   - Choose "Desktop app" or "Web application"
   - Note the Client ID and Client Secret
5. Use OAuth libraries to obtain tokens programmatically

## API Usage

### Request Example
```http
POST /api/interviews
Authorization: Bearer {your-jwt-token}
Content-Type: application/json

{
  "applicationId": "guid-of-application",
  "scheduledAt": "2026-07-20T14:00:00Z",
  "durationMinutes": 60,
  "meetingLink": null,
  "googleCalendarToken": "ya29.a0AfH6SMB..."
}
```

### With Google Calendar Token
- System creates calendar event automatically
- Google Meet link is generated
- `meetingLink` in response will be the Google Meet URL
- Candidate receives invite via Google Calendar

### Without Google Calendar Token
- Omit or set `googleCalendarToken` to `null`
- Manually provide `meetingLink` if desired
- Or leave both null and arrange meeting separately

### Response
```json
{
  "id": "interview-guid",
  "applicationId": "application-guid",
  "scheduledAt": "2026-07-20T14:00:00Z",
  "durationMinutes": 60,
  "meetingLink": "https://meet.google.com/abc-defg-hij",
  "status": "Scheduled",
  "candidateName": "John Doe",
  "jobTitle": "Senior Developer",
  "companyName": "TechCorp"
}
```

## What Gets Created in Google Calendar

When a token is provided, the system creates:

### Event Details
- **Title**: "Interview: [Job Title]"
- **Description**: "Interview scheduled via Recruitment Platform"
- **Duration**: As specified in request
- **Time Zone**: UTC
- **Visibility**: Default (visible to attendees)

### Attendees
- Candidate's email address is added
- Candidate receives Google Calendar invite
- Sends email notification to attendee

### Google Meet
- Automatically generates a Google Meet link
- Meet link included in calendar invite
- Accessible by all attendees

### Reminders
- Email reminder: 1 day before
- Popup reminder: 30 minutes before

## Error Handling

### Token Expired or Invalid
- Calendar creation fails gracefully
- Error logged but interview is still created
- Recruiter can manually add meeting link
- System continues normally

### No Token Provided
- Calendar creation is skipped
- No errors thrown
- Recruiter can provide manual meeting link
- Or arrange meeting separately

### Insufficient Permissions
- If token lacks calendar scope
- Error logged, interview created without link
- Recruiter receives response without meeting link

## Testing the Integration

### Scenario 1: With Valid Token
```bash
# Get token from OAuth Playground
TOKEN="ya29.your-access-token"

# Create interview with Google Calendar
curl -X POST http://localhost:5233/api/interviews \
  -H "Authorization: Bearer your-jwt-token" \
  -H "Content-Type: application/json" \
  -d '{
    "applicationId": "guid",
    "scheduledAt": "2026-07-20T14:00:00Z",
    "durationMinutes": 60,
    "googleCalendarToken": "'$TOKEN'"
  }'
```

Check your Google Calendar - the event should appear!

### Scenario 2: Without Token (Manual Meeting Link)
```bash
curl -X POST http://localhost:5233/api/interviews \
  -H "Authorization: Bearer your-jwt-token" \
  -H "Content-Type: application/json" \
  -d '{
    "applicationId": "guid",
    "scheduledAt": "2026-07-20T14:00:00Z",
    "durationMinutes": 60,
    "meetingLink": "https://zoom.us/j/123456789"
  }'
```

### Scenario 3: Without Token or Link
```bash
curl -X POST http://localhost:5233/api/interviews \
  -H "Authorization: Bearer your-jwt-token" \
  -H "Content-Type: application/json" \
  -d '{
    "applicationId": "guid",
    "scheduledAt": "2026-07-20T14:00:00Z",
    "durationMinutes": 60
  }'
```

## Swagger UI Testing

1. Open http://localhost:5233/swagger
2. Authorize with recruiter credentials
3. Expand `POST /api/interviews`
4. Click "Try it out"
5. Fill in the request body:
   - Get a token from OAuth Playground
   - Paste it in `googleCalendarToken`
6. Execute
7. Check your Google Calendar!

## Implementation Details

### Service Interface
```csharp
public interface ICalendarService
{
    Task<string?> CreateEventAsync(
        string recruiterGoogleToken,
        string title,
        DateTime start,
        int durationMinutes,
        string attendeeEmail);
}
```

### GoogleCalendarService
- Located: `RecruitmentPlatform.Infrastructure/Services/GoogleCalendarService.cs`
- Uses `Google.Apis.Calendar.v3` NuGet package
- Creates events with Google Meet links
- Returns meeting link or null on error

### Integration Point
- `InterviewController.CreateInterview` method
- Checks if `GoogleCalendarToken` is provided
- Calls `ICalendarService.CreateEventAsync`
- Saves returned link to `Interview.MeetingLink`
- Graceful failure if token is invalid

## Logging

All calendar operations are logged:

### Success
```
Google Calendar event created: {EventId} | Meeting link: {MeetingLink}
```

### No Token
```
No Google Calendar token provided. Skipping calendar event creation.
```

### API Error
```
Google Calendar API error: {Message}. Token may be expired or invalid. Status: {StatusCode}
```

### Unexpected Error
```
Unexpected error creating Google Calendar event
```

## Production Recommendations

### Security
- Never log full OAuth tokens
- Store refresh tokens encrypted
- Use Azure Key Vault or AWS Secrets Manager
- Implement token rotation
- Add rate limiting for API calls

### User Experience
- Add "Connect Google Calendar" button in UI
- Show connection status on recruiter dashboard
- Allow disconnect/reconnect
- Handle re-authorization when needed
- Show error messages in UI

### OAuth Flow
1. Implement OAuth consent screen
2. Store refresh tokens per user
3. Automatically refresh access tokens
4. Handle revoked access gracefully
5. Provide clear instructions to users

### Alternative Platforms
Consider adding support for:
- Microsoft Outlook Calendar
- Zoom integration
- Microsoft Teams
- WebEx

## Troubleshooting

### "Token may be expired or invalid"
- Playground tokens expire after 1 hour
- Get a new token from OAuth Playground
- Or implement proper OAuth flow with refresh tokens

### "No meeting link returned"
- Check Google Calendar API is enabled
- Verify token has calendar scope
- Check token hasn't been revoked
- Ensure internet connectivity

### Event created but no Google Meet link
- Ensure `ConferenceDataVersion = 1` in request
- Check Google Workspace settings allow Meet
- Personal Google accounts should support Meet

### Candidate not receiving invite
- Verify candidate email is correct
- Check `SendUpdates` parameter is set
- Look in candidate's spam folder
- Confirm Google Calendar can send emails

## Package Information
- **Package**: Google.Apis.Calendar.v3
- **Version**: 1.75.0.4200
- **Dependencies**: Google.Apis, Google.Apis.Auth, Google.Apis.Core
- **NuGet**: https://www.nuget.org/packages/Google.Apis.Calendar.v3/
