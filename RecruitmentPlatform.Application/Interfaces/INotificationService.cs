namespace RecruitmentPlatform.Application.Interfaces;

public interface INotificationService
{
    Task SendAsync(string recipientEmail, string subject, string body);
}
