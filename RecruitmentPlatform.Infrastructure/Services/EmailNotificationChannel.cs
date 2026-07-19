using MailKit.Net.Smtp;
using MailKit.Security;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;
using MimeKit;
using RecruitmentPlatform.Application.Interfaces;

namespace RecruitmentPlatform.Infrastructure.Services;

/// <summary>
/// Sends real emails via Mailtrap's sandbox SMTP.
/// Credentials are read from IConfiguration:
///   Mailtrap:Host, Mailtrap:Port, Mailtrap:Username, Mailtrap:Password, Mailtrap:SenderEmail, Mailtrap:SenderName
/// Sensitive values (Username/Password) should be stored in dotnet user-secrets, not appsettings.json.
/// </summary>
public class EmailNotificationChannel : INotificationChannel
{
    private readonly string _host;
    private readonly int    _port;
    private readonly string _username;
    private readonly string _password;
    private readonly string _senderEmail;
    private readonly string _senderName;
    private readonly ILogger<EmailNotificationChannel> _logger;

    public EmailNotificationChannel(
        IConfiguration                     config,
        ILogger<EmailNotificationChannel>  logger)
    {
        _host        = config["Mailtrap:Host"]        ?? throw new InvalidOperationException("Mailtrap:Host is not configured.");
        _port        = int.Parse(config["Mailtrap:Port"] ?? "587");
        _username    = config["Mailtrap:Username"]    ?? throw new InvalidOperationException("Mailtrap:Username is not configured.");
        _password    = config["Mailtrap:Password"]    ?? throw new InvalidOperationException("Mailtrap:Password is not configured.");
        _senderEmail = config["Mailtrap:SenderEmail"] ?? "noreply@recruitmentplatform.com";
        _senderName  = config["Mailtrap:SenderName"]  ?? "Recruitment Platform";
        _logger      = logger;
    }

    public async Task SendAsync(string recipient, string subject, string body)
    {
        var message = new MimeMessage();
        message.From.Add(new MailboxAddress(_senderName, _senderEmail));
        message.To.Add(new MailboxAddress(string.Empty, recipient));
        message.Subject = subject;

        message.Body = new TextPart("html") { Text = body };

        using var client = new SmtpClient();

        try
        {
            // Mailtrap uses STARTTLS on port 587
            await client.ConnectAsync(_host, _port, SecureSocketOptions.StartTls);
            await client.AuthenticateAsync(_username, _password);
            await client.SendAsync(message);
            await client.DisconnectAsync(true);

            _logger.LogInformation(
                "[EmailNotificationChannel] Email sent to {Recipient} | Subject: {Subject}",
                recipient, subject);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex,
                "[EmailNotificationChannel] Failed to send email to {Recipient} | Subject: {Subject}",
                recipient, subject);
            // Don't re-throw — notification failure should not block the main workflow
        }
    }
}
