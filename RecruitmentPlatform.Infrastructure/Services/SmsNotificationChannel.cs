using Microsoft.Extensions.Logging;
using RecruitmentPlatform.Application.Interfaces;
using RecruitmentPlatform.Domain.Entities;
using RecruitmentPlatform.Infrastructure.Data;

namespace RecruitmentPlatform.Infrastructure.Services;

/// <summary>
/// MOCK SMS channel — no real SMS gateway is called.
/// Messages are persisted to the SmsLogs table and logged to the application log.
/// This is a documented prototype assumption; a real implementation would use
/// Twilio or a similar provider behind this same interface.
/// </summary>
public class SmsNotificationChannel : INotificationChannel
{
    private readonly ApplicationDbContext               _db;
    private readonly ILogger<SmsNotificationChannel>   _logger;

    public SmsNotificationChannel(
        ApplicationDbContext              db,
        ILogger<SmsNotificationChannel>  logger)
    {
        _db     = db;
        _logger = logger;
    }

    public async Task SendAsync(string recipient, string subject, string body)
    {
        // Combine subject + body into a single SMS-style message
        var smsText = string.IsNullOrWhiteSpace(subject)
            ? body
            : $"{subject}: {body}";

        var log = new SmsLog
        {
            Id          = Guid.NewGuid(),
            PhoneNumber = recipient,
            Message     = smsText,
            SentAt      = DateTime.UtcNow,
        };

        _db.SmsLogs.Add(log);
        await _db.SaveChangesAsync();

        // Documented mock — log instead of dispatching
        _logger.LogInformation(
            "[SmsNotificationChannel] SMS to {PhoneNumber}: {Message}",
            recipient, smsText);
    }
}
