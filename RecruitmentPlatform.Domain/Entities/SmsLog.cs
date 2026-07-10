namespace RecruitmentPlatform.Domain.Entities;

/// <summary>
/// Persisted record of an SMS notification.
/// SMS is mocked for the prototype — no real SMS gateway is called.
/// Messages are logged here instead of being dispatched to a carrier.
/// </summary>
public class SmsLog
{
    public Guid     Id          { get; set; }
    public string   PhoneNumber { get; set; } = string.Empty;
    public string   Message     { get; set; } = string.Empty;
    public DateTime SentAt      { get; set; }
}
