using RecruitmentPlatform.Domain.Enums;

namespace RecruitmentPlatform.Application.Interfaces;

/// <summary>
/// Factory Pattern — creates the appropriate INotificationChannel
/// based on the requested NotificationType without the caller
/// needing to know which concrete implementation is used.
/// </summary>
public interface INotificationFactory
{
    INotificationChannel CreateNotification(NotificationType type);
}
