using RecruitmentPlatform.Application.Interfaces;

namespace RecruitmentPlatform.Application.Services;

public class BCryptPasswordHasher : IPasswordHasher
{
    public string HashPassword(string password) =>
        BCrypt.Net.BCrypt.HashPassword(password);

    public bool VerifyPassword(string hash, string password) =>
        BCrypt.Net.BCrypt.Verify(password, hash);
}
