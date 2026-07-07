using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using Microsoft.Extensions.Configuration;
using Microsoft.IdentityModel.Tokens;
using RecruitmentPlatform.Application.Interfaces;
using RecruitmentPlatform.Domain.Entities;

namespace RecruitmentPlatform.Infrastructure.Services;

public class JwtTokenService : ITokenService
{
    private readonly string _secret;
    private readonly string _issuer;
    private readonly string _audience;

    public JwtTokenService(IConfiguration config)
    {
        _secret   = config["Jwt:Secret"]   ?? throw new InvalidOperationException("Jwt:Secret is not configured.");
        _issuer   = config["Jwt:Issuer"]   ?? throw new InvalidOperationException("Jwt:Issuer is not configured.");
        _audience = config["Jwt:Audience"] ?? throw new InvalidOperationException("Jwt:Audience is not configured.");
    }

    public string GenerateToken(User user)
    {
        var key   = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(_secret));
        var creds = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);

        Console.WriteLine($"[JwtTokenService] Issuer: {_issuer}, Audience: {_audience}, SigningKey length: {_secret.Length} chars");

        var claims = new[]
        {
            new Claim(ClaimTypes.NameIdentifier, user.Id.ToString()),
            new Claim(ClaimTypes.Email,          user.Email),
            new Claim(ClaimTypes.Role,           user.Role.ToString()),
        };

        var token = new JwtSecurityToken(
            issuer:             _issuer,
            audience:           _audience,
            claims:             claims,
            expires:            DateTime.UtcNow.AddHours(24),
            signingCredentials: creds);

        return new JwtSecurityTokenHandler().WriteToken(token);
    }
}
