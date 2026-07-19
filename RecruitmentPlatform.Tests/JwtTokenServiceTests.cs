using Microsoft.Extensions.Configuration;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using RecruitmentPlatform.Infrastructure.Services;
using RecruitmentPlatform.Domain.Entities;
using RecruitmentPlatform.Domain.Enums;

namespace RecruitmentPlatform.Tests;

public class JwtTokenServiceTests
{
    private readonly JwtTokenService _tokenService;
    private readonly string _testSecret = "test-secret-key-that-is-long-enough-for-hmacsha256-algorithm";
    private readonly string _testIssuer = "TestIssuer";
    private readonly string _testAudience = "TestAudience";

    public JwtTokenServiceTests()
    {
        var configuration = new ConfigurationBuilder()
            .AddInMemoryCollection(new Dictionary<string, string?>
            {
                ["Jwt:Secret"] = _testSecret,
                ["Jwt:Issuer"] = _testIssuer,
                ["Jwt:Audience"] = _testAudience
            })
            .Build();

        _tokenService = new JwtTokenService(configuration);
    }

    [Fact]
    public void GenerateToken_ContainsCorrectRoleClaim()
    {
        // Arrange
        var user = new User
        {
            Id = Guid.NewGuid(),
            Email = "recruiter@example.com",
            FullName = "Test Recruiter",
            Role = UserRole.Recruiter,
            PasswordHash = "hash",
            IsActive = true,
            CreatedAt = DateTime.UtcNow
        };

        // Act
        var token = _tokenService.GenerateToken(user);

        // Assert
        var handler = new JwtSecurityTokenHandler();
        var jwtToken = handler.ReadJwtToken(token);
        
        var roleClaim = jwtToken.Claims.FirstOrDefault(c => c.Type == ClaimTypes.Role);
        Assert.NotNull(roleClaim);
        Assert.Equal("Recruiter", roleClaim.Value);
    }

    [Fact]
    public void GenerateToken_ContainsCorrectEmailClaim()
    {
        // Arrange
        var user = new User
        {
            Id = Guid.NewGuid(),
            Email = "candidate@example.com",
            FullName = "Test Candidate",
            Role = UserRole.Candidate,
            PasswordHash = "hash",
            IsActive = true,
            CreatedAt = DateTime.UtcNow
        };

        // Act
        var token = _tokenService.GenerateToken(user);

        // Assert
        var handler = new JwtSecurityTokenHandler();
        var jwtToken = handler.ReadJwtToken(token);
        
        var emailClaim = jwtToken.Claims.FirstOrDefault(c => c.Type == ClaimTypes.Email);
        Assert.NotNull(emailClaim);
        Assert.Equal("candidate@example.com", emailClaim.Value);
    }

    [Fact]
    public void GenerateToken_ContainsCorrectNameIdentifierClaim()
    {
        // Arrange
        var userId = Guid.NewGuid();
        var user = new User
        {
            Id = userId,
            Email = "admin@example.com",
            FullName = "Test Admin",
            Role = UserRole.Admin,
            PasswordHash = "hash",
            IsActive = true,
            CreatedAt = DateTime.UtcNow
        };

        // Act
        var token = _tokenService.GenerateToken(user);

        // Assert
        var handler = new JwtSecurityTokenHandler();
        var jwtToken = handler.ReadJwtToken(token);
        
        var nameIdentifierClaim = jwtToken.Claims.FirstOrDefault(c => c.Type == ClaimTypes.NameIdentifier);
        Assert.NotNull(nameIdentifierClaim);
        Assert.Equal(userId.ToString(), nameIdentifierClaim.Value);
    }

    [Fact]
    public void GenerateToken_ContainsCorrectIssuerAndAudience()
    {
        // Arrange
        var user = new User
        {
            Id = Guid.NewGuid(),
            Email = "user@example.com",
            FullName = "Test User",
            Role = UserRole.HiringManager,
            PasswordHash = "hash",
            IsActive = true,
            CreatedAt = DateTime.UtcNow
        };

        // Act
        var token = _tokenService.GenerateToken(user);

        // Assert
        var handler = new JwtSecurityTokenHandler();
        var jwtToken = handler.ReadJwtToken(token);
        
        Assert.Equal(_testIssuer, jwtToken.Issuer);
        Assert.Contains(_testAudience, jwtToken.Audiences);
    }

    [Fact]
    public void GenerateToken_HasExpirationSet()
    {
        // Arrange
        var user = new User
        {
            Id = Guid.NewGuid(),
            Email = "user@example.com",
            FullName = "Test User",
            Role = UserRole.Candidate,
            PasswordHash = "hash",
            IsActive = true,
            CreatedAt = DateTime.UtcNow
        };

        // Act
        var token = _tokenService.GenerateToken(user);

        // Assert
        var handler = new JwtSecurityTokenHandler();
        var jwtToken = handler.ReadJwtToken(token);
        
        Assert.NotNull(jwtToken.ValidTo);
        Assert.True(jwtToken.ValidTo > DateTime.UtcNow);
        Assert.True(jwtToken.ValidTo <= DateTime.UtcNow.AddHours(25)); // Should be around 24 hours
    }

    [Fact]
    public void GenerateToken_ReturnsValidJwtFormat()
    {
        // Arrange
        var user = new User
        {
            Id = Guid.NewGuid(),
            Email = "user@example.com",
            FullName = "Test User",
            Role = UserRole.Candidate,
            PasswordHash = "hash",
            IsActive = true,
            CreatedAt = DateTime.UtcNow
        };

        // Act
        var token = _tokenService.GenerateToken(user);

        // Assert
        Assert.NotNull(token);
        Assert.NotEmpty(token);
        
        // JWT format: header.payload.signature (3 parts separated by dots)
        var parts = token.Split('.');
        Assert.Equal(3, parts.Length);
        
        // Validate it can be read as JWT
        var handler = new JwtSecurityTokenHandler();
        Assert.True(handler.CanReadToken(token));
    }
}
