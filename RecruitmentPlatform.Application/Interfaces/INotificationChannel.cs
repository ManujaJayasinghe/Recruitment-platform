namespace RecruitmentPlatform.Application.Interfaces;

/// <summary>
/// Represents a single delivery channel (Email or SMS).
/// Implementations are returned by INotificationFactory.
/// </summary>
public interface INotificationChannel
{
    /// <summary>
    /// Sends (or mocks sending) the notification.
    /// </summary>
    /// <param name="recipient">Email address or phone number, depending on channel.</param>
    /// <param name="subject">Subject line — used by email; ignored by SMS.</param>
    /// <param name="body">Message body.</param>
    Task SendAsync(string recipient, string subject, string body);
}
