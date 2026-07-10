namespace RecruitmentPlatform.Domain.Enums;

/// <summary>
/// Channel types supported by the Notification Factory.
/// SMS is mocked (logged to DB only) for the prototype — documented assumption.
/// </summary>
public enum NotificationType
{
    Email,
    Sms
}
