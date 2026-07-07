namespace RecruitmentPlatform.Application.DTOs.Message;

public class SendMessageRequest
{
    public Guid   ApplicationId { get; set; }
    public string Body          { get; set; } = string.Empty;
}
