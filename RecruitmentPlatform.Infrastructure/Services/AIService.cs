using Microsoft.Extensions.Logging;
using RecruitmentPlatform.Application.Interfaces;

namespace RecruitmentPlatform.Infrastructure.Services;

public class AIService : IAIService
{
    private readonly ILogger<AIService> _logger;

    public AIService(ILogger<AIService> logger)
    {
        _logger = logger;
    }

    public async Task<string> GenerateChatResponseAsync(
        string userMessage, 
        string systemPrompt, 
        string model = "gpt-4-mini")
    {
        // Simulate AI processing delay
        await Task.Delay(500);

        _logger.LogInformation(
            "Generating chat response using model {Model} for message: {Message}", 
            model, 
            userMessage);

        // Mock AI response based on common recruitment questions
        var lowerMessage = userMessage.ToLower();

        if (lowerMessage.Contains("apply") || lowerMessage.Contains("application"))
        {
            return "To apply for a job, browse available positions on the Jobs page and click 'Apply'. Make sure your profile is complete for the best results!";
        }
        else if (lowerMessage.Contains("profile") || lowerMessage.Contains("update"))
        {
            return "You can update your profile by going to the Profile page. Add your skills, experience, and upload your resume to improve your chances.";
        }
        else if (lowerMessage.Contains("status") || lowerMessage.Contains("application"))
        {
            return "Check your application status on the Applications page. You'll see updates when recruiters review or shortlist your application.";
        }
        else if (lowerMessage.Contains("interview") || lowerMessage.Contains("schedule"))
        {
            return "If selected for an interview, you'll receive a notification with date and location details. You can view scheduled interviews in your Applications section.";
        }
        else if (lowerMessage.Contains("hello") || lowerMessage.Contains("hi") || lowerMessage.Contains("hey"))
        {
            return "Hello! I'm here to help with your job search. Ask me about applying for jobs, updating your profile, or checking application status.";
        }
        else
        {
            return "I'm here to help with recruitment-related questions like applying for jobs, updating your profile, or checking application status. How can I assist you today?";
        }
    }

    public async Task<List<string>> GenerateInterviewQuestionsAsync(
        string jobTitle,
        string jobDescription,
        List<string> requiredSkills,
        string model = "gpt-4-mini")
    {
        // Simulate AI processing delay
        await Task.Delay(1000);

        _logger.LogInformation(
            "Generating interview questions using model {Model} for job: {JobTitle}",
            model,
            jobTitle);

        // Generate generic but relevant interview questions based on job info
        var questions = new List<string>
        {
            $"Can you describe your experience with {string.Join(", ", requiredSkills.Take(2))}?",
            $"What interests you most about the {jobTitle} position?",
            $"Tell me about a challenging project you've worked on. How did you overcome obstacles?",
            $"How do you stay updated with the latest trends and technologies in your field?",
            $"Where do you see yourself in the next 3-5 years, and how does this role fit into your career goals?"
        };

        return questions;
    }
}
