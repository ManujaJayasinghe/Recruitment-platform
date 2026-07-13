using Microsoft.Extensions.Logging;
using RecruitmentPlatform.Application.Interfaces;
using RecruitmentPlatform.Domain.Entities;
using RecruitmentPlatform.Infrastructure.Data;

namespace RecruitmentPlatform.Infrastructure.Notifications;

/// <summary>
/// Prototype/mock SMS channel. Does NOT send real SMS.
/// Persists messages to the SmsLog table for auditability.
/// Replace this implementation with a real provider (e.g. Twilio) in production.
/// </summary>
public class SmsNotificationChannel : INotificationChannel
{
    private readonly ApplicationDbContext _db;
    private readonly ILogger<SmsNotificationChannel> _logger;

    public SmsNotificationChannel(ApplicationDbContext db, ILogger<SmsNotificationChannel> logger)
    {
        _db = db;
        _logger = logger;
    }

    public async Task SendAsync(string recipient, string subject, string body)
    {
        // recipient is treated as a phone number for SMS
        var smsLog = new SmsLog
        {
            Id          = Guid.NewGuid(),
            PhoneNumber = recipient,
            Message     = $"{subject}: {body}",
            SentAt      = DateTime.UtcNow,
        };

        await _db.SmsLogs.AddAsync(smsLog);
        await _db.SaveChangesAsync();

        _logger.LogInformation(
            "SMS to {PhoneNumber}: {Message}",
            recipient, smsLog.Message);
    }
}
