using Microsoft.AspNetCore.Mvc;
using RecruitmentPlatform.Application.Interfaces;

namespace RecruitmentPlatform.API.Controllers;

[ApiController]
[Route("api/test")]
public class TestController : ControllerBase
{
    private readonly INotificationService _notifications;
    private readonly ILogger<TestController> _logger;

    public TestController(INotificationService notifications, ILogger<TestController> logger)
    {
        _notifications = notifications;
        _logger = logger;
    }

    // GET /api/test/email-ping
    [HttpGet("email-ping")]
    public async Task<IActionResult> EmailPing()
    {
        try
        {
            _logger.LogInformation("Testing email notification to test@example.com");

            await _notifications.SendEmailAsync(
                "test@example.com",
                "Test Email",
                "Testing Mailtrap connection"
            );

            _logger.LogInformation("Test email sent successfully");

            return Ok(new
            {
                success = true,
                message = "Test email sent successfully to test@example.com via Mailtrap"
            });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to send test email");

            return StatusCode(500, new
            {
                success = false,
                message = "Failed to send test email",
                error = ex.Message,
                stackTrace = ex.StackTrace,
                innerException = ex.InnerException?.Message
            });
        }
    }
}
