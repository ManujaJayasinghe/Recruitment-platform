namespace RecruitmentPlatform.Application.Interfaces;

public interface IAIService
{
    Task<string> ParseResumeAsync(string resumeText);
    Task<float[]> GetEmbeddingAsync(string text);
    Task<string> GenerateChatResponseAsync(string systemPrompt, string userMessage);
}
