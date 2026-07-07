namespace RecruitmentPlatform.Application.DTOs.Message;

public class MessageResponse
{
    public Guid     Id            { get; set; }
    public Guid     ApplicationId { get; set; }
    public Guid     SenderUserId  { get; set; }
    public string   SenderName    { get; set; } = string.Empty;
    public string   Body          { get; set; } = string.Empty;
    public DateTime SentAt        { get; set; }
    public bool     IsRead        { get; set; }
}
