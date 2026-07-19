using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using RecruitmentPlatform.Application.DTOs.Application;
using RecruitmentPlatform.Application.DTOs.Candidate;
using RecruitmentPlatform.Application.DTOs.Job;
using RecruitmentPlatform.Application.Interfaces;
using RecruitmentPlatform.Domain.Entities;
using RecruitmentPlatform.Domain.Enums;
using RecruitmentPlatform.Domain.Interfaces;

namespace RecruitmentPlatform.API.Controllers;

[ApiController]
[Route("api/recruiter")]
[Authorize(Roles = "Recruiter")]
public class RecruiterController : ControllerBase
{
    private readonly IUnitOfWork           _uow;
    private readonly INotificationService  _notifications;

    public RecruiterController(IUnitOfWork uow, INotificationService notifications)
    {
        _uow           = uow;
        _notifications = notifications;
    }

    // POST /api/recruiter/jobs
    [HttpPost("jobs")]
    public async Task<IActionResult> CreateJob([FromBody] CreateJobPostingRequest request)
    {
        var userId = GetUserId();
        if (userId == null) return Unauthorized();

        if (string.IsNullOrWhiteSpace(request.Title))
            return BadRequest(new { message = "Title is required." });

        if (request.DepartmentId == Guid.Empty)
            return BadRequest(new { message = "DepartmentId is required." });

        var dept = await _uow.Departments.GetByIdAsync(request.DepartmentId);
        if (dept == null) return NotFound(new { message = "Department not found." });

        var job = new JobPosting
        {
            Id             = Guid.NewGuid(),
            Title          = request.Title,
            Description    = request.Description,
            RequiredSkills = request.RequiredSkills,
            MinExperience  = request.MinExperience,
            DepartmentId   = request.DepartmentId,
            PostedByUserId = userId.Value,
            Status         = JobStatus.Draft,
            CreatedAt      = DateTime.UtcNow,
        };

        await _uow.JobPostings.AddAsync(job);
        await _uow.SaveChangesAsync();

        return CreatedAtAction(nameof(GetMyJobs), new { }, MapToSummary(job, dept.Name, 0));
    }

    // PUT /api/recruiter/jobs/{id}
    [HttpPut("jobs/{id:guid}")]
    public async Task<IActionResult> UpdateJob(Guid id, [FromBody] UpdateJobPostingRequest request)
    {
        var userId = GetUserId();
        if (userId == null) return Unauthorized();

        var job = await _uow.JobPostings.GetByIdAsync(id);
        if (job == null) return NotFound(new { message = "Job posting not found." });
        if (job.PostedByUserId != userId.Value) return Forbid();

        if (request.DepartmentId != Guid.Empty)
        {
            var dept = await _uow.Departments.GetByIdAsync(request.DepartmentId);
            if (dept == null) return NotFound(new { message = "Department not found." });
            job.DepartmentId = request.DepartmentId;
        }

        job.Title          = request.Title;
        job.Description    = request.Description;
        job.RequiredSkills = request.RequiredSkills;
        job.MinExperience  = request.MinExperience;

        _uow.JobPostings.Update(job);
        await _uow.SaveChangesAsync();

        var depts    = await _uow.Departments.GetAllAsync();
        var deptName = depts.FirstOrDefault(d => d.Id == job.DepartmentId)?.Name ?? "Unknown";
        var appCount = (await _uow.Applications.FindAsync(a => a.JobPostingId == job.Id)).Count();

        return Ok(MapToSummary(job, deptName, appCount));
    }

    // PATCH /api/recruiter/jobs/{id}/status
    [HttpPatch("jobs/{id:guid}/status")]
    public async Task<IActionResult> PatchStatus(Guid id, [FromBody] PatchJobStatusRequest request)
    {
        var userId = GetUserId();
        if (userId == null) return Unauthorized();

        var job = await _uow.JobPostings.GetByIdAsync(id);
        if (job == null) return NotFound(new { message = "Job posting not found." });
        if (job.PostedByUserId != userId.Value) return Forbid();

        job.Status = request.Status;
        _uow.JobPostings.Update(job);
        await _uow.SaveChangesAsync();

        return Ok(new { id = job.Id, status = job.Status.ToString() });
    }

    // GET /api/recruiter/jobs
    [HttpGet("jobs")]
    public async Task<IActionResult> GetMyJobs()
    {
        var userId = GetUserId();
        if (userId == null) return Unauthorized();

        var jobs  = await _uow.JobPostings.FindAsync(j => j.PostedByUserId == userId.Value);
        var depts = await _uow.Departments.GetAllAsync();
        var apps  = await _uow.Applications.GetAllAsync();

        var deptMap     = depts.ToDictionary(d => d.Id, d => d.Name);
        var appCountMap = apps.GroupBy(a => a.JobPostingId).ToDictionary(g => g.Key, g => g.Count());

        return Ok(jobs
            .OrderByDescending(j => j.CreatedAt)
            .Select(j => MapToSummary(j, deptMap.GetValueOrDefault(j.DepartmentId, "Unknown"), appCountMap.GetValueOrDefault(j.Id, 0)))
            .ToList());
    }

    // GET /api/recruiter/jobs/{id}
    [HttpGet("jobs/{id:guid}")]
    public async Task<IActionResult> GetJobById(Guid id)
    {
        var userId = GetUserId();
        if (userId == null) return Unauthorized();

        var job = await _uow.JobPostings.GetByIdAsync(id);
        if (job == null) return NotFound(new { message = "Job posting not found." });
        if (job.PostedByUserId != userId.Value) return Forbid();

        var dept = await _uow.Departments.GetByIdAsync(job.DepartmentId);
        var apps = await _uow.Applications.FindAsync(a => a.JobPostingId == job.Id);

        return Ok(new
        {
            id = job.Id,
            title = job.Title,
            description = job.Description,
            requiredSkills = job.RequiredSkills,
            minExperience = job.MinExperience,
            departmentId = job.DepartmentId,
            department = dept?.Name ?? "Unknown",
            status = job.Status.ToString(),
            createdAt = job.CreatedAt,
            applicationCount = apps.Count()
        });
    }

    // DELETE /api/recruiter/jobs/{id}
    // Hard delete — blocks if applications exist; use PATCH status=Closed instead.
    [HttpDelete("jobs/{id:guid}")]
    public async Task<IActionResult> DeleteJob(Guid id)
    {
        var userId = GetUserId();
        if (userId == null) return Unauthorized();

        var job = await _uow.JobPostings.GetByIdAsync(id);
        if (job == null) return NotFound(new { message = "Job posting not found." });
        if (job.PostedByUserId != userId.Value) return Forbid();

        var apps = await _uow.Applications.FindAsync(a => a.JobPostingId == id);
        if (apps.Any())
            return BadRequest(new { message = "Cannot delete a job with existing applications. Close it instead." });

        _uow.JobPostings.Delete(job);
        await _uow.SaveChangesAsync();

        return NoContent();
    }

    // GET /api/recruiter/jobs/{jobId}/applications
    [HttpGet("jobs/{jobId:guid}/applications")]
    public async Task<IActionResult> GetJobApplications(Guid jobId)
    {
        var userId = GetUserId();
        if (userId == null) return Unauthorized();

        var job = await _uow.JobPostings.GetByIdAsync(jobId);
        if (job == null) return NotFound(new { message = "Job posting not found." });
        if (job.PostedByUserId != userId.Value) return Forbid();

        var applications = await _uow.Applications.FindAsync(a => a.JobPostingId == jobId);
        var profiles     = await _uow.CandidateProfiles.GetAllAsync();
        var users        = await _uow.Users.GetAllAsync();
        var profileMap   = profiles.ToDictionary(p => p.Id, p => p);
        var userMap      = users.ToDictionary(u => u.Id, u => u);

        return Ok(applications
            .OrderByDescending(a => a.MatchScore ?? 0)
            .Select(a =>
            {
                profileMap.TryGetValue(a.CandidateProfileId, out var profile);
                var user = profile != null && userMap.TryGetValue(profile.UserId, out var u) ? u : null;
                return new JobApplicationDetail
                {
                    ApplicationId      = a.Id,
                    CandidateProfileId = a.CandidateProfileId,
                    CandidateName      = user?.FullName             ?? string.Empty,
                    CandidateEmail     = user?.Email                ?? string.Empty,
                    Headline           = profile?.Headline          ?? string.Empty,
                    YearsOfExperience  = profile?.YearsOfExperience ?? 0,
                    TopSkills          = profile?.Skills.Take(5).ToList() ?? new(),
                    Status             = a.Status.ToString(),
                    MatchScore         = a.MatchScore,
                    AppliedAt          = a.AppliedAt,
                };
            })
            .ToList());
    }

    // PATCH /api/recruiter/applications/{id}/status
    [HttpPatch("applications/{id:guid}/status")]
    public async Task<IActionResult> PatchApplicationStatus(Guid id, [FromBody] PatchApplicationStatusRequest request)
    {
        var userId = GetUserId();
        if (userId == null) return Unauthorized();

        var application = await _uow.Applications.GetByIdAsync(id);
        if (application == null) return NotFound(new { message = "Application not found." });

        var job = await _uow.JobPostings.GetByIdAsync(application.JobPostingId);
        if (job == null) return NotFound(new { message = "Parent job not found." });
        if (job.PostedByUserId != userId.Value) return Forbid();

        application.Status = request.Status;
        _uow.Applications.Update(application);
        await _uow.SaveChangesAsync();

        // Notify the candidate when their application status changes
        var profile       = await _uow.CandidateProfiles.GetByIdAsync(application.CandidateProfileId);
        var candidateUser = profile != null ? await _uow.Users.GetByIdAsync(profile.UserId) : null;
        if (candidateUser != null)
        {
            var statusLabel  = request.Status.ToString();
            var emailSubject = $"Application Update — {job.Title}";
            var emailBody    = $"""
                <p>Dear {candidateUser.FullName},</p>
                <p>Your application for <strong>{job.Title}</strong> has been updated to: <strong>{statusLabel}</strong>.</p>
                <p>Log in to the Recruitment Platform to view your application details.</p>
                <p>Best regards,<br/>Recruitment Platform</p>
                """;

            await _notifications.SendEmailAsync(candidateUser.Email, emailSubject, emailBody);
        }

        return Ok(new { id = application.Id, status = application.Status.ToString() });
    }

    // GET /api/recruiter/candidates
    [HttpGet("candidates")]
    public async Task<IActionResult> SearchCandidates(
        [FromQuery] string? skills,
        [FromQuery] int?    minExperience,
        [FromQuery] string? keyword,
        [FromQuery] int     page     = 1,
        [FromQuery] int     pageSize = 10)
    {
        if (page < 1)       page     = 1;
        if (pageSize < 1)   pageSize = 10;
        if (pageSize > 100) pageSize = 100;

        var filterSkills = skills?
            .Split(',', StringSplitOptions.RemoveEmptyEntries | StringSplitOptions.TrimEntries)
            .Select(s => s.ToLowerInvariant())
            .ToHashSet();

        var profiles = await _uow.CandidateProfiles.GetAllAsync();
        var users    = await _uow.Users.GetAllAsync();
        var userMap  = users.ToDictionary(u => u.Id, u => u);

        var filtered = profiles.Where(p =>
        {
            if (filterSkills is { Count: > 0 })
            {
                var cs = p.Skills.Select(s => s.ToLowerInvariant()).ToHashSet();
                if (!filterSkills.Any(s => cs.Contains(s))) return false;
            }
            if (minExperience.HasValue && p.YearsOfExperience < minExperience.Value) return false;
            if (!string.IsNullOrWhiteSpace(keyword))
            {
                var kw = keyword.ToLowerInvariant();
                if (!p.Headline.ToLowerInvariant().Contains(kw) && !p.Summary.ToLowerInvariant().Contains(kw))
                    return false;
            }
            return true;
        }).ToList();

        var items = filtered
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .Select(p =>
            {
                userMap.TryGetValue(p.UserId, out var user);
                return new CandidateSummary
                {
                    ProfileId         = p.Id,
                    FullName          = user?.FullName ?? string.Empty,
                    Email             = user?.Email    ?? string.Empty,
                    Headline          = p.Headline,
                    YearsOfExperience = p.YearsOfExperience,
                    TopSkills         = p.Skills.Take(5).ToList(),
                };
            })
            .ToList();

        return Ok(new PagedResult<CandidateSummary>
        {
            Page       = page,
            PageSize   = pageSize,
            TotalCount = filtered.Count,
            Items      = items,
        });
    }

    // ── Helpers ───────────────────────────────────────────────────────────────

    private Guid? GetUserId()
    {
        var claim = User.FindFirstValue(ClaimTypes.NameIdentifier);
        return Guid.TryParse(claim, out var id) ? id : null;
    }

    private static RecruiterJobSummary MapToSummary(JobPosting job, string deptName, int appCount) => new()
    {
        Id               = job.Id,
        Title            = job.Title,
        Department       = deptName,
        Status           = job.Status.ToString(),
        RequiredSkills   = job.RequiredSkills,
        MinExperience    = job.MinExperience,
        CreatedAt        = job.CreatedAt,
        ApplicationCount = appCount,
    };
}
