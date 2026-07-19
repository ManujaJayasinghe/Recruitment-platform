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

    private const string SystemPrompt = @"You are a helpful assistant for a job recruitment platform. 
Answer questions about how to apply for jobs, update a profile, or check application status. 
Keep answers under 3 sentences. 
If asked something unrelated to recruitment, politely redirect the user to recruitment-related topics.";

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
        {
            return BadRequest(new { message = "Message cannot be empty." });
        }

        if (request.Message.Length > 500)
        {
            return BadRequest(new { message = "Message is too long. Please keep it under 500 characters." });
        }

        try
        {
            _logger.LogInformation(
                "Chatbot request received: {Message}",
                request.Message);

            var response = await _aiService.GenerateChatResponseAsync(SystemPrompt, request.Message);

            _logger.LogDebug(
                "Chatbot response generated: {Response}",
                response);

            return Ok(new ChatbotResponse
            {
                Response = response,
                Timestamp = DateTime.UtcNow
            });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error generating chatbot response");
            
            return StatusCode(500, new
            {
                message = "Sorry, I'm having trouble processing your request right now. Please try again later.",
                error = "An error occurred while generating the response."
            });
        }
    }
}
