# Notification System Setup

## Overview
The notification system has been fully implemented with a factory pattern supporting Email and SMS channels.

## Architecture

### Interfaces
- **INotificationService** - Simple service interface with `SendAsync(email, subject, body)`
- **INotificationFactory** - Factory interface with `CreateNotification(NotificationType)`
- **INotificationChannel** - Channel interface with `SendAsync(recipient, subject, body)`
- **NotificationType** - Enum with `Email` and `Sms` options

### Implementations

#### EmailNotificationChannel
- Uses **MailKit** library for email sending
- Configured for **Mailtrap sandbox SMTP**
- Sends HTML-formatted emails
- Configuration:
  - Host: `sandbox.smtp.mailtrap.io`
  - Port: `587`
  - Credentials: Stored in user secrets (see below)

#### SmsNotificationChannel
- **Mock implementation for prototype**
- Does NOT send real SMS messages
- Logs all SMS attempts to `SmsLog` database table
- Includes: Id, PhoneNumber, Message, SentAt
- Replace with real SMS provider (e.g., Twilio) in production

#### NotificationFactory
- Returns appropriate channel based on `NotificationType`
- Uses DI to resolve channel instances
- Registered as scoped service

## Configuration

### appsettings.json
Already configured with Mailtrap settings:
```json
"Mailtrap": {
  "Host": "sandbox.smtp.mailtrap.io",
  "Port": 587,
  "FromEmail": "noreply@recruitmentplatform.dev",
  "FromName": "Recruitment Platform"
}
```

### User Secrets (Mailtrap Credentials)
Run these commands to configure Mailtrap credentials:

```bash
# Navigate to API project
cd RecruitmentPlatform.API

# Initialize user secrets (if not already done)
dotnet user-secrets init

# Set Mailtrap username (get this from mailtrap.io)
dotnet user-secrets set "Mailtrap:Username" "your-mailtrap-username"

# Set Mailtrap password (get this from mailtrap.io)
dotnet user-secrets set "Mailtrap:Password" "your-mailtrap-password"
```

### Getting Mailtrap Credentials
1. Sign up for free at https://mailtrap.io
2. Go to Email Testing → Inboxes
3. Select your inbox
4. Copy the SMTP credentials (username and password)
5. Use the commands above to store them in user secrets

### Verify Configuration
```bash
dotnet user-secrets list
```

## Integration Points

The notification factory has been wired into three key areas:

### 1. Application Status Updates (Part 4.3)
**Location**: `RecruiterController.PatchApplicationStatus`
- Notifies candidate when recruiter updates application status
- Sends email with current status

### 2. Interview Scheduling (Part 5.1)
**Location**: `InterviewController.CreateInterview` and `CancelInterview`
- **Schedule**: Notifies candidate with interview details (date, time, meeting link)
- **Cancel**: Notifies candidate of cancellation

### 3. Hiring Decisions (Part 5.3)
**Location**: `HiringManagerController.MakeDecision`
- Sends **congratulatory email** for hired candidates
- Sends **polite rejection email** for rejected candidates
- Professional, empathetic messaging for both outcomes

## Email Templates

### Interview Scheduled
```
Subject: Interview Scheduled — [Job Title]

Hi [Candidate Name],

Your interview for [Job Title] has been scheduled.

Date & Time: [Date] UTC
Duration: [Duration] minutes
[Meeting Link if provided]

Good luck!
```

### Interview Cancelled
```
Subject: Interview Cancelled — [Job Title]

Hi [Candidate Name],

Unfortunately, your interview for [Job Title] scheduled for 
[Date] UTC has been cancelled.

Our team will be in touch to reschedule. Apologies for the inconvenience.
```

### Application Status Update
```
Subject: Application Update — [Job Title]

Hi [Candidate Name],

Your application for [Job Title] has been updated to: [Status].

Log in to your account to view more details.
```

### Hired Decision
```
Subject: Congratulations! You've been hired — [Job Title]

Hi [Candidate Name],

Congratulations! We are thrilled to inform you that you have been hired 
for the position of [Job Title].

Our team will reach out shortly with onboarding details. Welcome aboard!
```

### Rejected Decision
```
Subject: Application Update — [Job Title]

Hi [Candidate Name],

Thank you for your interest in [Job Title]. After careful consideration, 
we have decided to move forward with other candidates.

We encourage you to apply for future openings. Best of luck in your search!
```

## Database Migration

The `SmsLog` table has been created with the following structure:
```sql
CREATE TABLE [SmsLogs] (
    [Id] uniqueidentifier NOT NULL PRIMARY KEY,
    [PhoneNumber] nvarchar(max) NOT NULL,
    [Message] nvarchar(max) NOT NULL,
    [SentAt] datetime2 NOT NULL
);
```

Migration applied: `20260713144435_AddSmsLog`

## Dependency Injection

Registered in `Program.cs`:
```csharp
builder.Services.AddScoped<EmailNotificationChannel>();
builder.Services.AddScoped<SmsNotificationChannel>();
builder.Services.AddScoped<INotificationFactory, NotificationFactory>();
```

## Testing Without Mailtrap

If Mailtrap credentials are not configured:
- Email channel logs a warning and skips sending
- Application continues to work normally
- SMS channel always logs to database (no external dependency)

## Production Considerations

### Email
- Replace Mailtrap with production SMTP (SendGrid, AWS SES, etc.)
- Update appsettings.json with production SMTP settings
- Store credentials in Azure Key Vault, AWS Secrets Manager, etc.

### SMS
- Replace `SmsNotificationChannel` with real SMS provider:
  - Twilio
  - AWS SNS
  - Azure Communication Services
- Keep `SmsLog` table for audit trail
- Update factory to use production SMS channel

## Security Notes
✅ Credentials stored in user secrets (development)
✅ Credentials never committed to source control
✅ Configuration separated from sensitive data
✅ Clear warning when credentials are missing
✅ SMS audit trail in database for compliance
