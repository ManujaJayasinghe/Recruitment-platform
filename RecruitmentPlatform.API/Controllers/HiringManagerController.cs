using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using RecruitmentPlatform.Application.DTOs.Evaluation;
using RecruitmentPlatform.Application.DTOs.HiringManager;
<<<<<<< HEAD
=======
using RecruitmentPlatform.Application.Interfaces;
>>>>>>> dc5eb2e (Initial frontend commit)
using RecruitmentPlatform.Domain.Enums;
using RecruitmentPlatform.Domain.Interfaces;

namespace RecruitmentPlatform.API.Controllers;

[ApiController]
[Route("api/hiring-manager")]
[Authorize(Roles = "HiringManager")]
public class HiringManagerController : ControllerBase
{
<<<<<<< HEAD
    private readonly IUnitOfWork _uow;
    private readonly ILogger<HiringManagerController> _logger;

    public HiringManagerController(IUnitOfWork uow, ILogger<HiringManagerController> logger)
    {
        _uow = uow;
        _logger = logger;
=======
    private readonly IUnitOfWork                       _uow;
    private readonly INotificationService              _notifications;
    private readonly ILogger<HiringManagerController>  _logger;

    public HiringManagerController(
        IUnitOfWork                       uow,
        INotificationService              notifications,
        ILogger<HiringManagerController>  logger)
    {
        _uow           = uow;
        _notifications = notifications;
        _logger        = logger;
>>>>>>> dc5eb2e (Initial frontend commit)
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

<<<<<<< HEAD
        // Get candidate info for notification stub
        var profile = await _uow.CandidateProfiles.GetByIdAsync(application.CandidateProfileId);
        var user = profile != null ? await _uow.Users.GetByIdAsync(profile.UserId) : null;
        var job = await _uow.JobPostings.GetByIdAsync(application.JobPostingId);

        // Stub notification - will be implemented in Part 8
        var decisionText = request.Decision == ApplicationStatus.Hired ? "hired" : "rejected";
        _logger.LogInformation(
            "Notification would be sent to candidate {CandidateName} ({Email}): You have been {Decision} for position {JobTitle}",
            user?.FullName ?? "Unknown",
            user?.Email ?? "Unknown",
            decisionText,
            job?.Title ?? "Unknown");
=======
        // Get candidate info for notification
        var profile = await _uow.CandidateProfiles.GetByIdAsync(application.CandidateProfileId);
        var user    = profile != null ? await _uow.Users.GetByIdAsync(profile.UserId) : null;
        var job     = await _uow.JobPostings.GetByIdAsync(application.JobPostingId);

        // Send email notification to candidate (replaces Part 5.3 log stub)
        if (user != null && job != null)
        {
            var decisionText  = request.Decision == ApplicationStatus.Hired ? "Congratulations, you have been hired" : "Unfortunately, your application has been unsuccessful";
            var emailSubject  = request.Decision == ApplicationStatus.Hired
                ? $"Job Offer — {job.Title}"
                : $"Application Update — {job.Title}";
            var emailBody     = $"""
                <p>Dear {user.FullName},</p>
                <p>{decisionText} for the position of <strong>{job.Title}</strong>.</p>
                <p>Thank you for your interest in joining our team.</p>
                <p>Best regards,<br/>Recruitment Platform</p>
                """;

            await _notifications.SendEmailAsync(user.Email, emailSubject, emailBody);
        }
        else
        {
            _logger.LogWarning(
                "[HiringManagerController] Could not send notification for application {ApplicationId} — candidate or job data missing.",
                id);
        }
>>>>>>> dc5eb2e (Initial frontend commit)

        return Ok(new
        {
            id = application.Id,
            status = application.Status,
<<<<<<< HEAD
            message = $"Application status updated to {request.Decision}. Notification logged for candidate."
=======
            message = $"Application status updated to {request.Decision}. Notification sent to candidate."
>>>>>>> dc5eb2e (Initial frontend commit)
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
