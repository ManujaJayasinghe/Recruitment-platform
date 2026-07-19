using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;
using OpenAI.Chat;
using OpenAI.Embeddings;
using RecruitmentPlatform.Application.Interfaces;

namespace RecruitmentPlatform.Infrastructure.Services;

public class OpenAIService : IAIService
{
    private readonly ChatClient _chatClient;
    private readonly EmbeddingClient _embeddingClient;
    private readonly string _chatModel;
    private readonly string _embeddingModel;
    private readonly ILogger<OpenAIService> _logger;

    public OpenAIService(IConfiguration configuration, ILogger<OpenAIService> logger)
    {
        _logger = logger;

        // Read API key from configuration (user secrets in dev, environment variables in production)
        var apiKey = configuration["OpenAI:ApiKey"];
        if (string.IsNullOrWhiteSpace(apiKey))
        {
            throw new InvalidOperationException(
                "OpenAI API key is not configured. " +
                "Set it using: dotnet user-secrets set \"OpenAI:ApiKey\" \"your-key-here\"");
        }

        // Read model names from configuration
        _chatModel = configuration["OpenAI:ChatModel"] ?? "gpt-4o-mini";
        _embeddingModel = configuration["OpenAI:EmbeddingModel"] ?? "text-embedding-3-small";

        _logger.LogInformation(
            "Initializing OpenAI service with chat model: {ChatModel}, embedding model: {EmbeddingModel}",
            _chatModel, _embeddingModel);

        // Initialize clients
        _chatClient = new ChatClient(_chatModel, apiKey);
        _embeddingClient = new EmbeddingClient(_embeddingModel, apiKey);
    }

    public async Task<string> ParseResumeAsync(string resumeText)
    {
        try
        {
            var systemPrompt = @"You are a resume parsing assistant. Extract information from the resume and return ONLY valid JSON with no additional text or explanation.

The JSON must have this exact structure:
{
  ""skills"": [""skill1"", ""skill2"", ""skill3""],
  ""yearsOfExperience"": 5,
  ""education"": [""degree or institution""],
  ""summary"": ""brief one paragraph summary""
}

Rules:
- Return ONLY the JSON object, no markdown code blocks, no explanations
- Extract all technical and professional skills mentioned
- Calculate yearsOfExperience from dates or experience descriptions (use best estimate)
- Include all educational qualifications
- Write a concise summary highlighting key qualifications";

            var response = await GenerateChatResponseAsync(systemPrompt, resumeText);
            return response;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error parsing resume with OpenAI");
            throw;
        }
    }

    public async Task<float[]> GetEmbeddingAsync(string text)
    {
        try
        {
            if (string.IsNullOrWhiteSpace(text))
            {
                throw new ArgumentException("Text cannot be empty", nameof(text));
            }

            var response = await _embeddingClient.GenerateEmbeddingAsync(text);
            var embedding = response.Value.ToFloats().ToArray();

            _logger.LogDebug("Generated embedding with {Dimensions} dimensions", embedding.Length);
            return embedding;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error generating embedding with OpenAI");
            throw;
        }
    }

    public async Task<string> GenerateChatResponseAsync(string systemPrompt, string userMessage)
    {
        try
        {
            if (string.IsNullOrWhiteSpace(userMessage))
            {
                throw new ArgumentException("User message cannot be empty", nameof(userMessage));
            }

            var messages = new List<ChatMessage>
            {
                new SystemChatMessage(systemPrompt),
                new UserChatMessage(userMessage)
            };

            var response = await _chatClient.CompleteChatAsync(messages);
            var content = response.Value.Content[0].Text;

            _logger.LogDebug("Generated chat response with {Length} characters", content.Length);
            return content;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error generating chat response with OpenAI");
            throw;
        }
    }
}
