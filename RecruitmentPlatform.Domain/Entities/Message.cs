namespace RecruitmentPlatform.Domain.Entities;

public class Message
{
    public Guid      Id            { get; set; }
    public Guid      ApplicationId { get; set; }
    public Guid      SenderUserId  { get; set; }
    public string    Body          { get; set; } = string.Empty;
    public DateTime  SentAt        { get; set; }
    public bool      IsRead        { get; set; }

    // Navigation properties
    public Application Application { get; set; } = null!;
    public User        SenderUser  { get; set; } = null!;
}
