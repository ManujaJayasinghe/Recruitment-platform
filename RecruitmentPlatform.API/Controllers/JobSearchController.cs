using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using RecruitmentPlatform.Application.DTOs.Job;
using RecruitmentPlatform.Domain.Enums;
using RecruitmentPlatform.Domain.Interfaces;

namespace RecruitmentPlatform.API.Controllers;

[ApiController]
[Route("api/jobs")]
public class JobSearchController : ControllerBase
{
    private readonly IUnitOfWork _uow;

    public JobSearchController(IUnitOfWork uow) => _uow = uow;

    // GET /api/jobs?title=&department=&minExperience=
    [HttpGet]
    [Authorize]
    public async Task<IActionResult> GetJobs(
        [FromQuery] string? title,
        [FromQuery] string? department,
        [FromQuery] int?    minExperience)
    {
        var jobs = await _uow.JobPostings.FindAsync(j => j.Status == JobStatus.Open);

        if (!string.IsNullOrWhiteSpace(title))
            jobs = jobs.Where(j => j.Title.Contains(title, StringComparison.OrdinalIgnoreCase));

        if (!string.IsNullOrWhiteSpace(department))
            jobs = jobs.Where(j => j.DepartmentId.ToString() == department || true); // resolved below after dept lookup

        if (minExperience.HasValue)
            jobs = jobs.Where(j => j.MinExperience >= minExperience.Value);

        var departments = await _uow.Departments.GetAllAsync();
        var users       = await _uow.Users.GetAllAsync();

        // Department name filter (case-insensitive)
        if (!string.IsNullOrWhiteSpace(department))
        {
            var matchedDeptIds = departments
                .Where(d => d.Name.Contains(department, StringComparison.OrdinalIgnoreCase))
                .Select(d => d.Id)
                .ToHashSet();
            jobs = jobs.Where(j => matchedDeptIds.Contains(j.DepartmentId));
        }

        var deptMap = departments.ToDictionary(d => d.Id, d => d.Name);
        var userMap = users.ToDictionary(u => u.Id, u => u.FullName);

        return Ok(jobs.Select(j => MapToResponse(j, deptMap, userMap)).ToList());
    }

    // GET /api/jobs/{id}
    [HttpGet("{id:guid}")]
    [Authorize]
    public async Task<IActionResult> GetJobById(Guid id)
    {
        var job = await _uow.JobPostings.GetByIdAsync(id);
        if (job == null) return NotFound(new { message = "Job posting not found." });

        var departments = await _uow.Departments.GetAllAsync();
        var users       = await _uow.Users.GetAllAsync();
        var deptMap     = departments.ToDictionary(d => d.Id, d => d.Name);
        var userMap     = users.ToDictionary(u => u.Id, u => u.FullName);

        return Ok(MapToResponse(job, deptMap, userMap));
    }

    // GET /api/jobs/recommended
    [HttpGet("recommended")]
    [Authorize(Roles = "Candidate")]
    public async Task<IActionResult> GetRecommendedJobs()
    {
        var userId = GetUserId();
        if (userId == null) return Unauthorized();

        var profiles = await _uow.CandidateProfiles.FindAsync(p => p.UserId == userId.Value);
        var profile  = profiles.FirstOrDefault();
        if (profile == null) return NotFound(new { message = "Candidate profile not found." });

        var candidateSkills = profile.Skills
            .Select(s => s.ToLowerInvariant())
            .ToHashSet();

        var jobs        = await _uow.JobPostings.FindAsync(j => j.Status == JobStatus.Open);
        var departments = await _uow.Departments.GetAllAsync();
        var users       = await _uow.Users.GetAllAsync();
        var deptMap     = departments.ToDictionary(d => d.Id, d => d.Name);
        var userMap     = users.ToDictionary(u => u.Id, u => u.FullName);

        var ranked = jobs
            .Select(j => new
            {
                Job   = j,
                Score = j.RequiredSkills.Count(s => candidateSkills.Contains(s.ToLowerInvariant()))
            })
            .OrderByDescending(x => x.Score)
            .Select(x =>
            {
                var dto = MapToResponse(x.Job, deptMap, userMap);
                dto.MatchScore = x.Score;
                return dto;
            })
            .ToList();

        return Ok(ranked);
    }

    // ── Helpers ───────────────────────────────────────────────────────────────

    private Guid? GetUserId()
    {
        var claim = User.FindFirstValue(ClaimTypes.NameIdentifier);
        return Guid.TryParse(claim, out var id) ? id : null;
    }

    private static JobPostingResponse MapToResponse(
        Domain.Entities.JobPosting job,
        Dictionary<Guid, string> deptMap,
        Dictionary<Guid, string> userMap) => new()
    {
        Id             = job.Id,
        Title          = job.Title,
        Description    = job.Description,
        RequiredSkills = job.RequiredSkills,
        MinExperience  = job.MinExperience,
        DepartmentId   = job.DepartmentId,
        Department     = deptMap.GetValueOrDefault(job.DepartmentId, "Unknown"),
        PostedBy       = userMap.GetValueOrDefault(job.PostedByUserId, "Unknown"),
        Status         = job.Status.ToString(),
        CreatedAt      = job.CreatedAt,
    };
}
