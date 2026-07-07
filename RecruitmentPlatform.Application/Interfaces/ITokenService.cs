using RecruitmentPlatform.Domain.Entities;

namespace RecruitmentPlatform.Application.Interfaces;

public interface ITokenService
{
    string GenerateToken(User user);
}
