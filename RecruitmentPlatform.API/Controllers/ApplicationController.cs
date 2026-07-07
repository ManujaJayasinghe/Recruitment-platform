using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using RecruitmentPlatform.Application.DTOs.Application;
using RecruitmentPlatform.Domain.Enums;
using RecruitmentPlatform.Domain.Interfaces;

namespace RecruitmentPlatform.API.Controllers;

[ApiController]
[Route("api/applications")]
[Authorize(Roles = "Candidate")]
public class ApplicationController : ControllerBase
{
    private readonly IUnitOfWork _uow;

    public ApplicationController(IUnitOfWork uow) => _uow = uow;

    // POST /api/applications
    [HttpPost]
    public async Task<IActionResult> Apply([FromBody] CreateApplicationRequest request)
    {
        var userId = GetUserId();
        if (userId == null) return Unauthorized();

        // Resolve candidate profile
        var profiles = await _uow.CandidateProfiles.FindAsync(p => p.UserId == userId.Value);
        var profile  = profiles.FirstOrDefault();
        if (profile == null) return NotFound(new { message = "Candidate profile not found." });

        // Verify job exists and is open
        var job = await _uow.JobPostings.GetByIdAsync(request.JobPostingId);
        if (job == null) return NotFound(new { message = "Job posting not found." });
        if (job.Status != JobStatus.Open)
            return BadRequest(new { message = "This job posting is no longer open." });

        // Prevent duplicate applications
        var existing = await _uow.Applications.FindAsync(
            a => a.JobPostingId == request.JobPostingId && a.CandidateProfileId == profile.Id);
        if (existing.Any())
            return Conflict(new { message = "You have already applied for this job." });

        var application = new Domain.Entities.Application
        {
            Id                 = Guid.NewGuid(),
            JobPostingId       = request.JobPostingId,
            CandidateProfileId = profile.Id,
            Status             = ApplicationStatus.Applied,
            AppliedAt          = DateTime.UtcNow,
        };

        await _uow.Applications.AddAsync(application);
        await _uow.SaveChangesAsync();

        return CreatedAtAction(nameof(GetApplicationById), new { id = application.Id },
            MapToResponse(application, job.Title));
    }

    // GET /api/applications/me
    [HttpGet("me")]
    public async Task<IActionResult> GetMyApplications()
    {
        var userId = GetUserId();
        if (userId == null) return Unauthorized();

        var profiles = await _uow.CandidateProfiles.FindAsync(p => p.UserId == userId.Value);
        var profile  = profiles.FirstOrDefault();
        if (profile == null) return NotFound(new { message = "Candidate profile not found." });

        var applications = await _uow.Applications.FindAsync(a => a.CandidateProfileId == profile.Id);
        var jobs         = await _uow.JobPostings.GetAllAsync();
        var jobMap       = jobs.ToDictionary(j => j.Id, j => j.Title);

        var result = applications
            .OrderByDescending(a => a.AppliedAt)
            .Select(a => MapToResponse(a, jobMap.GetValueOrDefault(a.JobPostingId, "Unknown")))
            .ToList();

        return Ok(result);
    }

    // GET /api/applications/{id}
    [HttpGet("{id:guid}")]
    public async Task<IActionResult> GetApplicationById(Guid id)
    {
        var userId = GetUserId();
        if (userId == null) return Unauthorized();

        var profiles = await _uow.CandidateProfiles.FindAsync(p => p.UserId == userId.Value);
        var profile  = profiles.FirstOrDefault();
        if (profile == null) return NotFound(new { message = "Candidate profile not found." });

        var application = await _uow.Applications.GetByIdAsync(id);
        if (application == null) return NotFound(new { message = "Application not found." });

        // Ensure the application belongs to this candidate
        if (application.CandidateProfileId != profile.Id)
            return Forbid();

        var job = await _uow.JobPostings.GetByIdAsync(application.JobPostingId);

        return Ok(MapToResponse(application, job?.Title ?? "Unknown"));
    }

    // ── Helpers ───────────────────────────────────────────────────────────────

    private Guid? GetUserId()
    {
        var claim = User.FindFirstValue(ClaimTypes.NameIdentifier);
        return Guid.TryParse(claim, out var id) ? id : null;
    }

    private static ApplicationResponse MapToResponse(Domain.Entities.Application app, string jobTitle) => new()
    {
        Id                 = app.Id,
        JobPostingId       = app.JobPostingId,
        JobTitle           = jobTitle,
        CandidateProfileId = app.CandidateProfileId,
        Status             = app.Status.ToString(),
        MatchScore         = app.MatchScore,
        AppliedAt          = app.AppliedAt,
    };
}
