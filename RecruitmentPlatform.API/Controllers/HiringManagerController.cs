using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using RecruitmentPlatform.Application.DTOs.Evaluation;
using RecruitmentPlatform.Application.DTOs.HiringManager;
using RecruitmentPlatform.Application.Interfaces;
using RecruitmentPlatform.Domain.Enums;
using RecruitmentPlatform.Domain.Interfaces;

namespace RecruitmentPlatform.API.Controllers;

[ApiController]
[Route("api/hiring-manager")]
[Authorize(Roles = "HiringManager")]
public class HiringManagerController : ControllerBase
{
    private readonly IUnitOfWork _uow;
    private readonly INotificationFactory _notificationFactory;
    private readonly ILogger<HiringManagerController> _logger;

    public HiringManagerController(
        IUnitOfWork uow,
        INotificationFactory notificationFactory,
        ILogger<HiringManagerController> logger)
    {
        _uow = uow;
        _notificationFactory = notificationFactory;
        _logger = logger;
    }

    // GET /api/hiring-manager/shortlisted
    // Returns applications with Status = Shortlisted or InterviewScheduled
    // Scoped to all jobs across the organization (hiring managers typically oversee hiring org-wide)
    [HttpGet("shortlisted")]
    public async Task<IActionResult> GetShortlistedApplications()
    {
        var userId = GetUserId();
        if (userId == null) return Unauthorized();

        // Get all applications that are shortlisted or have interviews scheduled
        var applications = await _uow.Applications.FindAsync(a =>
            a.Status == ApplicationStatus.Shortlisted ||
            a.Status == ApplicationStatus.InterviewScheduled);

        var result = new List<ShortlistedApplicationResponse>();

        foreach (var app in applications.OrderByDescending(a => a.AppliedAt))
        {
            var job = await _uow.JobPostings.GetByIdAsync(app.JobPostingId);
            var dept = job != null ? await _uow.Departments.GetByIdAsync(job.DepartmentId) : null;
            var profile = await _uow.CandidateProfiles.GetByIdAsync(app.CandidateProfileId);
            var user = profile != null ? await _uow.Users.GetByIdAsync(profile.UserId) : null;

            DateTime? interviewScheduledAt = null;
            if (app.Interview != null)
            {
                interviewScheduledAt = app.Interview.ScheduledAt;
            }

            result.Add(new ShortlistedApplicationResponse
            {
                Id                   = app.Id,
                JobPostingId         = app.JobPostingId,
                JobTitle             = job?.Title ?? "Unknown",
                DepartmentName       = dept?.Name ?? "Unknown",
                CandidateProfileId   = app.CandidateProfileId,
                CandidateName        = user?.FullName ?? "Unknown",
                CandidateEmail       = user?.Email ?? "Unknown",
                Status               = app.Status,
                MatchScore           = app.MatchScore,
                AppliedAt            = app.AppliedAt,
                InterviewScheduledAt = interviewScheduledAt,
            });
        }

        return Ok(result);
    }

    // POST /api/hiring-manager/evaluations
    [HttpPost("evaluations")]
    public async Task<IActionResult> CreateEvaluation([FromBody] CreateEvaluationRequest request)
    {
        var userId = GetUserId();
        if (userId == null) return Unauthorized();

        if (request.Score < 1 || request.Score > 10)
            return BadRequest(new { message = "Score must be between 1 and 10." });

        if (string.IsNullOrWhiteSpace(request.Feedback))
            return BadRequest(new { message = "Feedback is required." });

        var interview = await _uow.Interviews.GetByIdAsync(request.InterviewId);
        if (interview == null)
            return NotFound(new { message = "Interview not found." });

        if (interview.Status != InterviewStatus.Completed)
            return BadRequest(new { message = "Can only evaluate completed interviews." });

        var evaluation = new Domain.Entities.Evaluation
        {
            Id              = Guid.NewGuid(),
            InterviewId     = request.InterviewId,
            EvaluatorUserId = userId.Value,
            Score           = request.Score,
            Feedback        = request.Feedback,
            Recommendation  = request.Recommendation,
            CreatedAt       = DateTime.UtcNow,
        };

        await _uow.Evaluations.AddAsync(evaluation);
        await _uow.SaveChangesAsync();

        return CreatedAtAction(nameof(GetEvaluationsByInterview),
            new { interviewId = evaluation.InterviewId },
            await MapToEvaluationResponse(evaluation));
    }

    // GET /api/hiring-manager/evaluations/{interviewId}
    [HttpGet("evaluations/{interviewId:guid}")]
    public async Task<IActionResult> GetEvaluationsByInterview(Guid interviewId)
    {
        var interview = await _uow.Interviews.GetByIdAsync(interviewId);
        if (interview == null)
            return NotFound(new { message = "Interview not found." });

        var evaluations = await _uow.Evaluations.FindAsync(e => e.InterviewId == interviewId);

        var result = new List<EvaluationResponse>();
        foreach (var evaluation in evaluations.OrderByDescending(e => e.CreatedAt))
        {
            result.Add(await MapToEvaluationResponse(evaluation));
        }

        return Ok(result);
    }

    // PATCH /api/hiring-manager/applications/{id}/decision
    [HttpPatch("applications/{id:guid}/decision")]
    public async Task<IActionResult> MakeDecision(Guid id, [FromBody] ApplicationDecisionRequest request)
    {
        var userId = GetUserId();
        if (userId == null) return Unauthorized();

        // Validate decision is either Hired or Rejected
        if (request.Decision != ApplicationStatus.Hired && request.Decision != ApplicationStatus.Rejected)
            return BadRequest(new { message = "Decision must be either Hired or Rejected." });

        var application = await _uow.Applications.GetByIdAsync(id);
        if (application == null)
            return NotFound(new { message = "Application not found." });

        // Update application status
        application.Status = request.Decision;
        await _uow.SaveChangesAsync();

        // Get candidate info and notify via email
        var profile = await _uow.CandidateProfiles.GetByIdAsync(application.CandidateProfileId);
        var user = profile != null ? await _uow.Users.GetByIdAsync(profile.UserId) : null;
        var job = await _uow.JobPostings.GetByIdAsync(application.JobPostingId);

        if (user != null)
        {
            var emailChannel = _notificationFactory.CreateNotification(NotificationType.Email);
            var decisionText = request.Decision == ApplicationStatus.Hired ? "hired" : "rejected";

            var subject = request.Decision == ApplicationStatus.Hired
                ? $"Congratulations! You've been hired — {job?.Title}"
                : $"Application Update — {job?.Title}";

            var body = request.Decision == ApplicationStatus.Hired
                ? $"<p>Hi {user.FullName},</p>" +
                  $"<p>Congratulations! We are thrilled to inform you that you have been <strong>hired</strong> " +
                  $"for the position of <strong>{job?.Title ?? "the role"}</strong>.</p>" +
                  $"<p>Our team will reach out shortly with onboarding details. Welcome aboard!</p>"
                : $"<p>Hi {user.FullName},</p>" +
                  $"<p>Thank you for your interest in <strong>{job?.Title ?? "the role"}</strong>. " +
                  $"After careful consideration, we have decided to move forward with other candidates.</p>" +
                  $"<p>We encourage you to apply for future openings. Best of luck in your search!</p>";

            await emailChannel.SendAsync(user.Email, subject, body);

            _logger.LogInformation(
                "Decision notification sent to {CandidateName} ({Email}): {Decision} for {JobTitle}",
                user.FullName, user.Email, decisionText, job?.Title ?? "Unknown");
        }

        return Ok(new
        {
            id = application.Id,
            status = application.Status,
            message = $"Application status updated to {request.Decision}. Candidate notified by email."
        });
    }

    // ── Helpers ───────────────────────────────────────────────────────────────

    private Guid? GetUserId()
    {
        var claim = User.FindFirstValue(ClaimTypes.NameIdentifier);
        return Guid.TryParse(claim, out var id) ? id : null;
    }

    private async Task<EvaluationResponse> MapToEvaluationResponse(Domain.Entities.Evaluation evaluation)
    {
        var evaluator = await _uow.Users.GetByIdAsync(evaluation.EvaluatorUserId);

        return new EvaluationResponse
        {
            Id              = evaluation.Id,
            InterviewId     = evaluation.InterviewId,
            EvaluatorUserId = evaluation.EvaluatorUserId,
            EvaluatorName   = evaluator?.FullName ?? "Unknown",
            Score           = evaluation.Score,
            Feedback        = evaluation.Feedback,
            Recommendation  = evaluation.Recommendation,
            CreatedAt       = evaluation.CreatedAt,
        };
    }
}
