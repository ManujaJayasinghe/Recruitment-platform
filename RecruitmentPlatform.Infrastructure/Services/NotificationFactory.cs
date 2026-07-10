using RecruitmentPlatform.Application.Interfaces;
using RecruitmentPlatform.Domain.Enums;

namespace RecruitmentPlatform.Infrastructure.Services;

/// <summary>
/// Factory Pattern implementation.
/// Returns the correct INotificationChannel based on the requested NotificationType.
/// Adding a new channel (e.g. Push, Slack) only requires a new implementation
/// and a new case here — no changes to callers.
/// </summary>
public class NotificationFactory : INotificationFactory
{
    private readonly EmailNotificationChannel  _email;
    private readonly SmsNotificationChannel    _sms;

    public NotificationFactory(
        EmailNotificationChannel  email,
        SmsNotificationChannel    sms)
    {
        _email = email;
        _sms   = sms;
    }

    public INotificationChannel CreateNotification(NotificationType type) => type switch
    {
        NotificationType.Email => _email,
        NotificationType.Sms   => _sms,
        _ => throw new ArgumentOutOfRangeException(nameof(type), $"Unsupported notification type: {type}")
    };
}
