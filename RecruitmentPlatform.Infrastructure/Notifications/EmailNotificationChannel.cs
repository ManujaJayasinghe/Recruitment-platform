using MailKit.Net.Smtp;
using MailKit.Security;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;
using MimeKit;
using RecruitmentPlatform.Application.Interfaces;

namespace RecruitmentPlatform.Infrastructure.Notifications;

public class EmailNotificationChannel : INotificationChannel
{
    private readonly IConfiguration _config;
    private readonly ILogger<EmailNotificationChannel> _logger;

    public EmailNotificationChannel(IConfiguration config, ILogger<EmailNotificationChannel> logger)
    {
        _config = config;
        _logger = logger;
    }

    public async Task SendAsync(string recipient, string subject, string body)
    {
        _logger.LogInformation("Preparing to send email. Recipient: {Recipient}, Subject: {Subject}", recipient, subject);
        
        var host      = _config["Mailtrap:Host"]      ?? "sandbox.smtp.mailtrap.io";
        var port      = int.Parse(_config["Mailtrap:Port"] ?? "587");
        var username  = _config["Mailtrap:Username"];
        var password  = _config["Mailtrap:Password"];
        var fromEmail = _config["Mailtrap:FromEmail"] ?? "noreply@recruitmentplatform.dev";
        var fromName  = _config["Mailtrap:FromName"]  ?? "Recruitment Platform";

        if (string.IsNullOrWhiteSpace(username) || string.IsNullOrWhiteSpace(password))
        {
            _logger.LogWarning(
                "Mailtrap credentials not configured. Email to {Recipient} was not sent. " +
                "Set Mailtrap:Username and Mailtrap:Password via user-secrets.",
                recipient);
            return;
        }

        try
        {
            var message = new MimeMessage();
            message.From.Add(new MailboxAddress(fromName, fromEmail));
            message.To.Add(MailboxAddress.Parse(recipient));
            message.Subject = subject;
            message.Body = new TextPart("html") { Text = body };

            using var client = new SmtpClient();
            await client.ConnectAsync(host, port, SecureSocketOptions.StartTls);
            await client.AuthenticateAsync(username, password);
            await client.SendAsync(message);
            await client.DisconnectAsync(true);

            _logger.LogInformation(
                "✅ Email sent successfully | To: {Recipient} | Subject: {Subject} | Via: {Host}",
                recipient, subject, host);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to send email to {Recipient} with subject '{Subject}'", recipient, subject);
            throw;
        }
    }
}
