using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using RecruitmentPlatform.Application.DTOs.Message;
using RecruitmentPlatform.Domain.Interfaces;

namespace RecruitmentPlatform.API.Controllers;

[ApiController]
[Route("api/messages")]
[Authorize]
public class MessageController : ControllerBase
{
    private readonly IUnitOfWork _uow;

    public MessageController(IUnitOfWork uow) => _uow = uow;

    // POST /api/messages
    [HttpPost]
    public async Task<IActionResult> SendMessage([FromBody] SendMessageRequest request)
    {
        var userId = GetUserId();
        if (userId == null) return Unauthorized();

        if (string.IsNullOrWhiteSpace(request.Body))
            return BadRequest(new { message = "Message body cannot be empty." });

        var application = await _uow.Applications.GetByIdAsync(request.ApplicationId);
        if (application == null) return NotFound(new { message = "Application not found." });

        // Verify sender is the candidate or the recruiter on this application
        if (!await IsAuthorizedParty(userId.Value, application))
            return Forbid();

        var message = new Domain.Entities.Message
        {
            Id            = Guid.NewGuid(),
            ApplicationId = request.ApplicationId,
            SenderUserId  = userId.Value,
            Body          = request.Body,
            SentAt        = DateTime.UtcNow,
            IsRead        = false,
        };

        await _uow.Messages.AddAsync(message);
        await _uow.SaveChangesAsync();

        var sender = await _uow.Users.GetByIdAsync(userId.Value);
        return CreatedAtAction(nameof(GetThread), new { applicationId = message.ApplicationId },
            MapToResponse(message, sender?.FullName ?? string.Empty));
    }

    // GET /api/messages/application/{applicationId}
    [HttpGet("application/{applicationId:guid}")]
    public async Task<IActionResult> GetThread(Guid applicationId)
    {
        var userId = GetUserId();
        if (userId == null) return Unauthorized();

        var application = await _uow.Applications.GetByIdAsync(applicationId);
        if (application == null) return NotFound(new { message = "Application not found." });

        if (!await IsAuthorizedParty(userId.Value, application))
            return Forbid();

        var messages = await _uow.Messages.FindAsync(m => m.ApplicationId == applicationId);
        var users    = await _uow.Users.GetAllAsync();
        var userMap  = users.ToDictionary(u => u.Id, u => u.FullName);

        var result = messages
            .OrderBy(m => m.SentAt)
            .Select(m => MapToResponse(m, userMap.GetValueOrDefault(m.SenderUserId, "Unknown")))
            .ToList();

        return Ok(result);
    }

    // ── Helpers ───────────────────────────────────────────────────────────────

    private Guid? GetUserId()
    {
        var claim = User.FindFirstValue(ClaimTypes.NameIdentifier);
        return Guid.TryParse(claim, out var id) ? id : null;
    }

    // Authorized parties: the candidate who applied, or the recruiter who posted the job
    private async Task<bool> IsAuthorizedParty(Guid userId, Domain.Entities.Application application)
    {
        // Check if candidate
        var profiles = await _uow.CandidateProfiles.FindAsync(p => p.UserId == userId);
        var profile  = profiles.FirstOrDefault();
        if (profile != null && profile.Id == application.CandidateProfileId)
            return true;

        // Check if recruiter who owns the job
        var job = await _uow.JobPostings.GetByIdAsync(application.JobPostingId);
        if (job != null && job.PostedByUserId == userId)
            return true;

        return false;
    }

    private static MessageResponse MapToResponse(Domain.Entities.Message m, string senderName) => new()
    {
        Id            = m.Id,
        ApplicationId = m.ApplicationId,
        SenderUserId  = m.SenderUserId,
        SenderName    = senderName,
        Body          = m.Body,
        SentAt        = m.SentAt,
        IsRead        = m.IsRead,
    };
}
