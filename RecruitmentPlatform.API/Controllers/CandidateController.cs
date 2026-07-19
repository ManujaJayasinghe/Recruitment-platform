using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.StaticFiles;
using RecruitmentPlatform.Application.DTOs.Candidate;
using RecruitmentPlatform.Domain.Interfaces;
using RecruitmentPlatform.Infrastructure.Services;

namespace RecruitmentPlatform.API.Controllers;

[ApiController]
[Route("api/candidates")]
[Authorize(Roles = "Candidate")]
public class CandidateController : ControllerBase
{
    private readonly IUnitOfWork _uow;
    private readonly IWebHostEnvironment _env;
    private readonly ResumeParsingService _resumeParser;
    private readonly ILogger<CandidateController> _logger;

    public CandidateController(
        IUnitOfWork uow,
        IWebHostEnvironment env,
        ResumeParsingService resumeParser,
        ILogger<CandidateController> logger)
    {
        _uow = uow;
        _env = env;
        _resumeParser = resumeParser;
        _logger = logger;
    }

    // GET /api/candidates/me
    [HttpGet("me")]
    public async Task<IActionResult> GetMyProfile()
    {
        var userId = GetUserId();
        if (userId == null) return Unauthorized();

        var profiles = await _uow.CandidateProfiles.FindAsync(p => p.UserId == userId.Value);
        var profile  = profiles.FirstOrDefault();
        if (profile == null) return NotFound(new { message = "Candidate profile not found." });

        var users = await _uow.Users.FindAsync(u => u.Id == userId.Value);
        var user  = users.FirstOrDefault();
        if (user == null) return NotFound(new { message = "User not found." });

        return Ok(MapToResponse(profile, user.FullName, user.Email));
    }

    // PUT /api/candidates/me
    [HttpPut("me")]
    public async Task<IActionResult> UpdateMyProfile([FromBody] UpdateCandidateProfileRequest request)
    {
        var userId = GetUserId();
        if (userId == null) return Unauthorized();

        var profiles = await _uow.CandidateProfiles.FindAsync(p => p.UserId == userId.Value);
        var profile  = profiles.FirstOrDefault();
        if (profile == null) return NotFound(new { message = "Candidate profile not found." });

        profile.Headline          = request.Headline;
        profile.Summary           = request.Summary;
        profile.Skills            = request.Skills;
        profile.YearsOfExperience = request.YearsOfExperience;

        _uow.CandidateProfiles.Update(profile);
        await _uow.SaveChangesAsync();

        var users = await _uow.Users.FindAsync(u => u.Id == userId.Value);
        var user  = users.FirstOrDefault();

        return Ok(MapToResponse(profile, user?.FullName ?? string.Empty, user?.Email ?? string.Empty));
    }

    // GET /api/candidates/{id}
    [HttpGet("{id:guid}")]
    [Authorize(Roles = "Candidate,Recruiter,HiringManager")]
    public async Task<IActionResult> GetProfileById(Guid id)
    {
        var profiles = await _uow.CandidateProfiles.FindAsync(p => p.Id == id);
        var profile  = profiles.FirstOrDefault();
        if (profile == null) return NotFound(new { message = "Candidate profile not found." });

        var users = await _uow.Users.FindAsync(u => u.Id == profile.UserId);
        var user  = users.FirstOrDefault();

        return Ok(MapToResponse(profile, user?.FullName ?? string.Empty, user?.Email ?? string.Empty));
    }

    // POST /api/candidates/me/resume
    [HttpPost("me/resume")]
    [RequestSizeLimit(5 * 1024 * 1024)] // 5 MB
    public async Task<IActionResult> UploadResume(IFormFile file)
    {
        var userId = GetUserId();
        if (userId == null) return Unauthorized();

        // Validate file presence
        if (file == null || file.Length == 0)
            return BadRequest(new { message = "No file provided." });

        // Validate size
        if (file.Length > 5 * 1024 * 1024)
            return BadRequest(new { message = "File exceeds 5 MB limit." });

        // Validate content type and extension
        var ext = Path.GetExtension(file.FileName).ToLowerInvariant();
        if (ext != ".pdf" || file.ContentType != "application/pdf")
            return BadRequest(new { message = "Only PDF files are allowed." });

        var profiles = await _uow.CandidateProfiles.FindAsync(p => p.UserId == userId.Value);
        var profile  = profiles.FirstOrDefault();
        if (profile == null) return NotFound(new { message = "Candidate profile not found." });

        // Build storage path: wwwroot/uploads/resumes/{profileId}/{guid}-{originalname}.pdf
        var uploadsDir = Path.Combine(_env.WebRootPath, "uploads", "resumes", profile.Id.ToString());
        Directory.CreateDirectory(uploadsDir);

        var safeFileName = $"{Guid.NewGuid()}-{Path.GetFileNameWithoutExtension(file.FileName)}.pdf";
        var fullPath     = Path.Combine(uploadsDir, safeFileName);

        await using (var stream = new FileStream(fullPath, FileMode.Create))
            await file.CopyToAsync(stream);

        // Store relative URL
        profile.ResumeFileUrl = $"/uploads/resumes/{profile.Id}/{safeFileName}";
        _uow.CandidateProfiles.Update(profile);
        await _uow.SaveChangesAsync();

        // Parse resume using AI (synchronous - response includes parsed data immediately)
        // If parsing fails, the upload still succeeds but without AI-extracted data
        var parsingResult = await _resumeParser.ParseAndSaveAsync(profile.Id, fullPath);

        if (parsingResult.Success)
        {
            _logger.LogInformation(
                "Resume uploaded and parsed successfully for candidate {ProfileId}",
                profile.Id);

            return Ok(new
            {
                resumeUrl = profile.ResumeFileUrl,
                parsed = new
                {
                    success = true,
                    skills = parsingResult.ParsedData?.Skills ?? new List<string>(),
                    yearsOfExperience = parsingResult.ParsedData?.YearsOfExperience ?? 0,
                    education = parsingResult.ParsedData?.Education ?? new List<string>(),
                    summary = parsingResult.ParsedData?.Summary ?? string.Empty
                }
            });
        }
        else
        {
            _logger.LogWarning(
                "Resume uploaded but parsing failed for candidate {ProfileId}: {Error}",
                profile.Id, parsingResult.ErrorMessage);

            return Ok(new
            {
                resumeUrl = profile.ResumeFileUrl,
                parsed = new
                {
                    success = false,
                    error = parsingResult.ErrorMessage,
                    message = "Resume uploaded successfully but AI parsing encountered an error. " +
                             "You can still manually update your profile."
                }
            });
        }
    }

    // GET /api/candidates/me/resume
    [HttpGet("me/resume")]
    public async Task<IActionResult> DownloadResume()
    {
        var userId = GetUserId();
        if (userId == null) return Unauthorized();

        var profiles = await _uow.CandidateProfiles.FindAsync(p => p.UserId == userId.Value);
        var profile  = profiles.FirstOrDefault();
        if (profile == null) return NotFound(new { message = "Candidate profile not found." });

        if (string.IsNullOrEmpty(profile.ResumeFileUrl))
            return NotFound(new { message = "No resume uploaded yet." });

        // ResumeFileUrl is a relative path like /uploads/resumes/{id}/file.pdf
        var fullPath = Path.Combine(_env.WebRootPath, profile.ResumeFileUrl.TrimStart('/').Replace('/', Path.DirectorySeparatorChar));
        if (!System.IO.File.Exists(fullPath))
            return NotFound(new { message = "Resume file not found on server." });

        new FileExtensionContentTypeProvider().TryGetContentType(fullPath, out var contentType);
        contentType ??= "application/octet-stream";

        var stream   = new FileStream(fullPath, FileMode.Open, FileAccess.Read);
        var fileName = Path.GetFileName(fullPath);
        return File(stream, contentType, fileName);
    }

    // ── Helpers ───────────────────────────────────────────────────────────────

    private Guid? GetUserId()
    {
        var claim = User.FindFirstValue(ClaimTypes.NameIdentifier);
        return Guid.TryParse(claim, out var id) ? id : null;
    }

    private static CandidateProfileResponse MapToResponse(
        Domain.Entities.CandidateProfile profile, string fullName, string email) => new()
    {
        ProfileId         = profile.Id,
        UserId            = profile.UserId,
        FullName          = fullName,
        Email             = email,
        Headline          = profile.Headline,
        Summary           = profile.Summary,
        Skills            = profile.Skills,
        YearsOfExperience = profile.YearsOfExperience,
        ResumeFileUrl     = profile.ResumeFileUrl,
    };
}
