namespace RecruitmentPlatform.Application.Interfaces;

/// <summary>
/// High-level notification service.
/// Controllers inject this and call SendAsync without knowing which channel is used.
/// Channel selection is delegated to INotificationFactory.
/// </summary>
public interface INotificationService
{
    /// <summary>Sends an email notification.</summary>
    Task SendEmailAsync(string recipientEmail, string subject, string body);

    /// <summary>
    /// Sends an SMS notification (mocked for prototype — logged to SmsLogs table).
    /// </summary>
    Task SendSmsAsync(string phoneNumber, string message);
}
