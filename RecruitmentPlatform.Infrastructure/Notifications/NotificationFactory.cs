using Microsoft.Extensions.DependencyInjection;
using RecruitmentPlatform.Application.Interfaces;

namespace RecruitmentPlatform.Infrastructure.Notifications;

public class NotificationFactory : INotificationFactory
{
    private readonly IServiceProvider _serviceProvider;

    public NotificationFactory(IServiceProvider serviceProvider)
    {
        _serviceProvider = serviceProvider;
    }

    public INotificationChannel CreateNotification(NotificationType type) => type switch
    {
        NotificationType.Email => _serviceProvider.GetRequiredService<EmailNotificationChannel>(),
        NotificationType.Sms   => _serviceProvider.GetRequiredService<SmsNotificationChannel>(),
        _                      => throw new ArgumentOutOfRangeException(nameof(type), $"Unknown notification type: {type}")
    };
}
