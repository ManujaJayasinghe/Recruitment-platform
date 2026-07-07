using RecruitmentPlatform.Domain.Enums;

namespace RecruitmentPlatform.Application.DTOs.Auth;

public class AuthResponse
{
    public string   Token     { get; set; } = string.Empty;
    public Guid     UserId    { get; set; }
    public string   FullName  { get; set; } = string.Empty;
    public UserRole Role      { get; set; }
    public DateTime ExpiresAt { get; set; }
}
