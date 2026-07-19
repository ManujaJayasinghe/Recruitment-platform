using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using RecruitmentPlatform.Application.DTOs.Interview;
using RecruitmentPlatform.Application.Interfaces;
using RecruitmentPlatform.Domain.Enums;
using RecruitmentPlatform.Domain.Interfaces;

namespace RecruitmentPlatform.API.Controllers;

[ApiController]
[Route("api/interviews")]
[Authorize]
public class InterviewController : ControllerBase
{
    private readonly IUnitOfWork _uow;
    private readonly INotificationFactory _notificationFactory;
    private readonly ICalendarService _calendarService;
    private readonly ILogger<InterviewController> _logger;

    public InterviewController(
        IUnitOfWork uow,
        INotificationFactory notificationFactory,
        ICalendarService calendarService,
        ILogger<InterviewController> logger)
    {
        _uow = uow;
        _notificationFactory = notificationFactory;
        _calendarService = calendarService;
        _logger = logger;
    }

    // POST /api/interviews
    [HttpPost]
    [Authorize(Roles = "Recruiter")]
    public async Task<IActionResult> CreateInterview([FromBody] CreateInterviewRequest request)
    {
        var userId = GetUserId();
        if (userId == null) return Unauthorized();

        if (request.DurationMinutes <= 0)
            return BadRequest(new { message = "Duration must be positive." });

        if (request.ScheduledAt <= DateTime.UtcNow)
            return BadRequest(new { message = "Scheduled time must be in the future." });

        var application = await _uow.Applications.GetByIdAsync(request.ApplicationId);
        if (application == null) 
            return NotFound(new { message = "Application not found." });

        // Verify recruiter owns the job posting
        var job = await _uow.JobPostings.GetByIdAsync(application.JobPostingId);
        if (job == null || job.PostedByUserId != userId.Value)
            return Forbid();

        // Check if interview already exists
        if (application.Interview != null)
            return BadRequest(new { message = "Interview already scheduled for this application." });

        var interview = new Domain.Entities.Interview
        {
            Id              = Guid.NewGuid(),
            ApplicationId   = request.ApplicationId,
            ScheduledAt     = request.ScheduledAt,
            DurationMinutes = request.DurationMinutes,
            MeetingLink     = request.MeetingLink,
            Status          = InterviewStatus.Scheduled,
        };

        // If recruiter provided Google Calendar token, create calendar event
        if (!string.IsNullOrWhiteSpace(request.GoogleCalendarToken))
        {
            var profile = await _uow.CandidateProfiles.GetByIdAsync(application.CandidateProfileId);
            var candidate = profile != null ? await _uow.Users.GetByIdAsync(profile.UserId) : null;

            if (candidate != null)
            {
                var calendarLink = await _calendarService.CreateEventAsync(
                    request.GoogleCalendarToken,
                    $"Interview: {job.Title}",
                    request.ScheduledAt,
                    request.DurationMinutes,
                    candidate.Email);

                if (calendarLink != null)
                {
                    interview.MeetingLink = calendarLink;
                    _logger.LogInformation(
                        "Google Calendar event created for interview {InterviewId}: {MeetingLink}",
                        interview.Id, calendarLink);
                }
            }
        }

        await _uow.Interviews.AddAsync(interview);

        // Update application status
        application.Status = ApplicationStatus.InterviewScheduled;

        await _uow.SaveChangesAsync();

        // Notify candidate of interview schedule
        var candidateProfile = await _uow.CandidateProfiles.GetByIdAsync(application.CandidateProfileId);
        var candidateUser = candidateProfile != null ? await _uow.Users.GetByIdAsync(candidateProfile.UserId) : null;
        if (candidateUser != null)
        {
            var emailChannel = _notificationFactory.CreateNotification(NotificationType.Email);
            var meetingInfo = string.IsNullOrWhiteSpace(interview.MeetingLink)
                ? "Your interviewer will be in touch with meeting details."
                : $"Meeting link: {interview.MeetingLink}";

            await emailChannel.SendAsync(
                candidateUser.Email,
                $"Interview Scheduled — {job.Title}",
                $"<p>Hi {candidateUser.FullName},</p>" +
                $"<p>Your interview for <strong>{job.Title}</strong> has been scheduled.</p>" +
                $"<p><strong>Date & Time:</strong> {request.ScheduledAt:f} UTC<br/>" +
                $"<strong>Duration:</strong> {request.DurationMinutes} minutes<br/>" +
                $"{meetingInfo}</p>" +
                $"<p>Good luck!</p>");
        }

        return CreatedAtAction(nameof(CreateInterview), new { id = interview.Id },
            await MapToResponse(interview));
    }

    // GET /api/interviews/me
    [HttpGet("me")]
    [Authorize(Roles = "Candidate")]
    public async Task<IActionResult> GetMyInterviews()
    {
        var userId = GetUserId();
        if (userId == null) return Unauthorized();

        var profiles = await _uow.CandidateProfiles.FindAsync(p => p.UserId == userId.Value);
        var profile = profiles.FirstOrDefault();
        if (profile == null)
            return NotFound(new { message = "Candidate profile not found." });

        var applications = await _uow.Applications.FindAsync(a => a.CandidateProfileId == profile.Id);
        var applicationIds = applications.Select(a => a.Id).ToHashSet();

        var interviews = await _uow.Interviews.FindAsync(i => applicationIds.Contains(i.ApplicationId));

        var result = new List<InterviewResponse>();
        foreach (var interview in interviews.OrderByDescending(i => i.ScheduledAt))
        {
            result.Add(await MapToResponse(interview));
        }

        return Ok(result);
    }

    // GET /api/interviews/upcoming
    [HttpGet("upcoming")]
    [Authorize(Roles = "Recruiter,HiringManager")]
    public async Task<IActionResult> GetUpcomingInterviews()
    {
        var userId = GetUserId();
        if (userId == null) return Unauthorized();

        // Get all jobs posted by this recruiter
        var jobs = await _uow.JobPostings.FindAsync(j => j.PostedByUserId == userId.Value);
        var jobIds = jobs.Select(j => j.Id).ToHashSet();

        // Get applications for those jobs
        var applications = await _uow.Applications.FindAsync(a => jobIds.Contains(a.JobPostingId));
        var applicationIds = applications.Select(a => a.Id).ToHashSet();

        // Get interviews for those applications (scheduled or upcoming)
        var now = DateTime.UtcNow;
        var interviews = await _uow.Interviews.FindAsync(i => 
            applicationIds.Contains(i.ApplicationId) && 
            i.Status == InterviewStatus.Scheduled &&
            i.ScheduledAt >= now);

        var result = new List<InterviewResponse>();
        foreach (var interview in interviews.OrderBy(i => i.ScheduledAt))
        {
            result.Add(await MapToResponse(interview));
        }

        return Ok(result);
    }

    // PATCH /api/interviews/{id}/cancel
    [HttpPatch("{id:guid}/cancel")]
    [Authorize(Roles = "Recruiter")]
    public async Task<IActionResult> CancelInterview(Guid id)
    {
        var userId = GetUserId();
        if (userId == null) return Unauthorized();

        var interview = await _uow.Interviews.GetByIdAsync(id);
        if (interview == null)
            return NotFound(new { message = "Interview not found." });

        var application = await _uow.Applications.GetByIdAsync(interview.ApplicationId);
        if (application == null)
            return NotFound(new { message = "Application not found." });

        // Verify recruiter owns the job
        var job = await _uow.JobPostings.GetByIdAsync(application.JobPostingId);
        if (job == null || job.PostedByUserId != userId.Value)
            return Forbid();

        if (interview.Status == InterviewStatus.Cancelled)
            return BadRequest(new { message = "Interview is already cancelled." });

        interview.Status = InterviewStatus.Cancelled;
        await _uow.SaveChangesAsync();

        // Notify candidate of cancellation
        var profile = await _uow.CandidateProfiles.GetByIdAsync(application.CandidateProfileId);
        var candidate = profile != null ? await _uow.Users.GetByIdAsync(profile.UserId) : null;
        if (candidate != null)
        {
            var emailChannel = _notificationFactory.CreateNotification(NotificationType.Email);
            await emailChannel.SendAsync(
                candidate.Email,
                $"Interview Cancelled — {job.Title}",
                $"<p>Hi {candidate.FullName},</p>" +
                $"<p>Unfortunately, your interview for <strong>{job.Title}</strong> scheduled for " +
                $"{interview.ScheduledAt:f} UTC has been cancelled.</p>" +
                $"<p>Our team will be in touch to reschedule. Apologies for the inconvenience.</p>");
        }

        return Ok(await MapToResponse(interview));
    }

    // ── Helpers ───────────────────────────────────────────────────────────────

    private Guid? GetUserId()
    {
        var claim = User.FindFirstValue(ClaimTypes.NameIdentifier);
        return Guid.TryParse(claim, out var id) ? id : null;
    }

    private async Task<InterviewResponse> MapToResponse(Domain.Entities.Interview interview)
    {
        var application = await _uow.Applications.GetByIdAsync(interview.ApplicationId);
        var job = application != null ? await _uow.JobPostings.GetByIdAsync(application.JobPostingId) : null;
        var profile = application != null ? await _uow.CandidateProfiles.GetByIdAsync(application.CandidateProfileId) : null;
        var user = profile != null ? await _uow.Users.GetByIdAsync(profile.UserId) : null;
        var dept = job != null ? await _uow.Departments.GetByIdAsync(job.DepartmentId) : null;
        var org = dept != null ? await _uow.Organizations.GetByIdAsync(dept.OrganizationId) : null;

        return new InterviewResponse
        {
            Id              = interview.Id,
            ApplicationId   = interview.ApplicationId,
            ScheduledAt     = interview.ScheduledAt,
            DurationMinutes = interview.DurationMinutes,
            MeetingLink     = interview.MeetingLink,
            Status          = interview.Status,
            CandidateName   = user?.FullName ?? "Unknown",
            JobTitle        = job?.Title ?? "Unknown",
            CompanyName     = org?.Name ?? "Unknown",
        };
    }
}
