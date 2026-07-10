using RecruitmentPlatform.Application.Interfaces;
using RecruitmentPlatform.Domain.Enums;

namespace RecruitmentPlatform.Infrastructure.Services;

/// <summary>
/// High-level notification service injected into controllers.
/// Delegates to the factory for channel selection, keeping controllers
/// decoupled from concrete Email/SMS implementations.
/// </summary>
public class NotificationService : INotificationService
{
    private readonly INotificationFactory _factory;

    public NotificationService(INotificationFactory factory)
    {
        _factory = factory;
    }

    public Task SendEmailAsync(string recipientEmail, string subject, string body)
    {
        var channel = _factory.CreateNotification(NotificationType.Email);
        return channel.SendAsync(recipientEmail, subject, body);
    }

    public Task SendSmsAsync(string phoneNumber, string message)
    {
        var channel = _factory.CreateNotification(NotificationType.Sms);
        return channel.SendAsync(phoneNumber, string.Empty, message);
    }
}
