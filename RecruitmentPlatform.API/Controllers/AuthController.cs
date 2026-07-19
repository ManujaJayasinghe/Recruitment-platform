using Microsoft.AspNetCore.Mvc;
using RecruitmentPlatform.Application.DTOs.Auth;
using RecruitmentPlatform.Application.Interfaces;
using RecruitmentPlatform.Domain.Entities;
using RecruitmentPlatform.Domain.Enums;
using RecruitmentPlatform.Domain.Interfaces;

namespace RecruitmentPlatform.API.Controllers;

[ApiController]
[Route("api/auth")]
public class AuthController : ControllerBase
{
    private readonly IUnitOfWork      _uow;
    private readonly IPasswordHasher  _hasher;
    private readonly ITokenService    _tokens;

    public AuthController(IUnitOfWork uow, IPasswordHasher hasher, ITokenService tokens)
    {
        _uow    = uow;
        _hasher = hasher;
        _tokens = tokens;
    }

    // POST /api/auth/register
    [HttpPost("register")]
    public async Task<IActionResult> Register([FromBody] RegisterRequest request)
    {
        if (string.IsNullOrWhiteSpace(request.FullName))
            return BadRequest(new { message = "FullName is required." });

        if (string.IsNullOrWhiteSpace(request.Email))
            return BadRequest(new { message = "Email is required." });

        if (string.IsNullOrWhiteSpace(request.Password) || request.Password.Length < 6)
            return BadRequest(new { message = "Password must be at least 6 characters." });

        // Validate role - only allow self-registration for Candidate and Recruiter
        if (request.Role != UserRole.Candidate && request.Role != UserRole.Recruiter)
        {
            return BadRequest(new 
            { 
                message = "This role cannot be self-registered. Contact an administrator." 
            });
        }

        var existing = await _uow.Users.FindAsync(u => u.Email == request.Email);
        if (existing.Any())
            return Conflict(new { message = "Email is already registered." });

        var user = new User
        {
            Id           = Guid.NewGuid(),
            FullName     = request.FullName,
            Email        = request.Email,
            PasswordHash = _hasher.HashPassword(request.Password),
            Role         = request.Role,
            CreatedAt    = DateTime.UtcNow,
            IsActive     = true,
        };

        await _uow.Users.AddAsync(user);

        // Create empty CandidateProfile for candidate-role users
        if (request.Role == UserRole.Candidate)
        {
            var profile = new CandidateProfile
            {
                Id                = Guid.NewGuid(),
                UserId            = user.Id,
                Headline          = string.Empty,
                Summary           = string.Empty,
                Skills            = new List<string>(),
                YearsOfExperience = 0,
            };
            await _uow.CandidateProfiles.AddAsync(profile);
        }

        await _uow.SaveChangesAsync();

        var expiresAt = DateTime.UtcNow.AddHours(24);
        return Ok(new AuthResponse
        {
            Token     = _tokens.GenerateToken(user),
            UserId    = user.Id,
            FullName  = user.FullName,
            Role      = user.Role,
            ExpiresAt = expiresAt,
        });
    }

    // POST /api/auth/login
    [HttpPost("login")]
    public async Task<IActionResult> Login([FromBody] LoginRequest request)
    {
        if (string.IsNullOrWhiteSpace(request.Email))
            return BadRequest(new { message = "Email is required." });

        if (string.IsNullOrWhiteSpace(request.Password))
            return BadRequest(new { message = "Password is required." });

        var users = await _uow.Users.FindAsync(u => u.Email == request.Email);
        var user  = users.FirstOrDefault();

        if (user is null || !_hasher.VerifyPassword(user.PasswordHash, request.Password))
            return Unauthorized(new { message = "Invalid email or password." });

        if (!user.IsActive)
            return Unauthorized(new { message = "Account is disabled." });

        var expiresAt = DateTime.UtcNow.AddHours(24);
        return Ok(new AuthResponse
        {
            Token     = _tokens.GenerateToken(user),
            UserId    = user.Id,
            FullName  = user.FullName,
            Role      = user.Role,
            ExpiresAt = expiresAt,
        });
    }
}
