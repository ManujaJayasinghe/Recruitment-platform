using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using RecruitmentPlatform.Application.DTOs.Chatbot;
using RecruitmentPlatform.Application.Interfaces;

namespace RecruitmentPlatform.API.Controllers;

[ApiController]
[Route("api/chatbot")]
[Authorize(Roles = "Candidate")]
public class ChatbotController : ControllerBase
{
    private readonly IAIService _aiService;
    private readonly ILogger<ChatbotController> _logger;

    public ChatbotController(IAIService aiService, ILogger<ChatbotController> logger)
    {
        _aiService = aiService;
        _logger = logger;
    }

    // POST /api/chatbot/ask
    [HttpPost("ask")]
    public async Task<IActionResult> Ask([FromBody] ChatbotRequest request)
    {
        if (string.IsNullOrWhiteSpace(request.Message))
            return BadRequest(new { message = "Message is required." });

        try
        {
            const string systemPrompt = @"You are a helpful assistant for a job recruitment platform. 
Answer questions about how to apply for jobs, update a profile, or check application status. 
Keep answers under 3 sentences. 
If asked something unrelated to recruitment, politely redirect.";

            var aiResponse = await _aiService.GenerateChatResponseAsync(
                request.Message,
                systemPrompt,
                "gpt-4-mini"
            );

            return Ok(new ChatbotResponse { Response = aiResponse });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error generating chatbot response for message: {Message}", request.Message);
            return StatusCode(500, new { message = "Failed to generate response. Please try again." });
        }
    }
}
