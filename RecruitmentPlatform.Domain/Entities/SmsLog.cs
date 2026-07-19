namespace RecruitmentPlatform.Domain.Entities;

public class SmsLog
{
    public Guid     Id          { get; set; }
    public string   PhoneNumber { get; set; } = string.Empty;
    public string   Message     { get; set; } = string.Empty;
    public DateTime SentAt      { get; set; }
}
