namespace RecruitmentPlatform.Application.Interfaces;

public enum NotificationType
{
    Email,
    Sms
}

public interface INotificationFactory
{
    INotificationChannel CreateNotification(NotificationType type);
}
