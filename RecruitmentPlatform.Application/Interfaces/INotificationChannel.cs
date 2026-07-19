namespace RecruitmentPlatform.Application.Interfaces;

public interface INotificationChannel
{
    Task SendAsync(string recipient, string subject, string body);
}
