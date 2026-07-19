namespace RecruitmentPlatform.Application.Interfaces;

public interface IAIService
{
    /// <summary>
    /// Generate a chat response using AI
    /// </summary>
    /// <param name="userMessage">The user's message</param>
    /// <param name="systemPrompt">The system prompt to guide AI behavior</param>
    /// <param name="model">The AI model to use (e.g., "gpt-4-mini")</param>
    /// <returns>AI-generated response</returns>
    Task<string> GenerateChatResponseAsync(string userMessage, string systemPrompt, string model = "gpt-4-mini");

    /// <summary>
    /// Generate interview questions for a job
    /// </summary>
    /// <param name="jobTitle">Job title</param>
    /// <param name="jobDescription">Job description</param>
    /// <param name="requiredSkills">List of required skills</param>
    /// <param name="model">The AI model to use</param>
    /// <returns>List of interview questions</returns>
    Task<List<string>> GenerateInterviewQuestionsAsync(
        string jobTitle, 
        string jobDescription, 
        List<string> requiredSkills, 
        string model = "gpt-4-mini");
}
