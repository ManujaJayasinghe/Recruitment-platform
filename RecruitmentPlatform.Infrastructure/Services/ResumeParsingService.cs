using System.Text.Json;
using Microsoft.Extensions.Logging;
using RecruitmentPlatform.Application.Interfaces;
using RecruitmentPlatform.Domain.Interfaces;
using UglyToad.PdfPig;

namespace RecruitmentPlatform.Infrastructure.Services;

public class ResumeParsingService
{
    private readonly IAIService _aiService;
    private readonly IUnitOfWork _uow;
    private readonly ILogger<ResumeParsingService> _logger;

    public ResumeParsingService(
        IAIService aiService,
        IUnitOfWork uow,
        ILogger<ResumeParsingService> logger)
    {
        _aiService = aiService;
        _uow = uow;
        _logger = logger;
    }

    public async Task<ParsedResumeResult> ParseAndSaveAsync(Guid candidateProfileId, string pdfFilePath)
    {
        try
        {
            _logger.LogInformation(
                "Starting resume parsing for candidate profile {ProfileId}, file: {FilePath}",
                candidateProfileId, pdfFilePath);

            // Step 1: Extract text from PDF
            var resumeText = ExtractTextFromPdf(pdfFilePath);
            if (string.IsNullOrWhiteSpace(resumeText))
            {
                _logger.LogWarning("No text extracted from PDF: {FilePath}", pdfFilePath);
                return new ParsedResumeResult
                {
                    Success = false,
                    ErrorMessage = "Could not extract text from PDF"
                };
            }

            _logger.LogDebug("Extracted {Length} characters from PDF", resumeText.Length);

            // Step 2: Send to AI for parsing
            var aiResponse = await _aiService.ParseResumeAsync(resumeText);
            
            // Step 3: Parse JSON response
            ParsedResumeData? parsedData;
            try
            {
                // Clean up response in case AI added markdown code blocks
                var cleanedResponse = aiResponse.Trim();
                if (cleanedResponse.StartsWith("```json"))
                {
                    cleanedResponse = cleanedResponse.Substring(7);
                }
                if (cleanedResponse.StartsWith("```"))
                {
                    cleanedResponse = cleanedResponse.Substring(3);
                }
                if (cleanedResponse.EndsWith("```"))
                {
                    cleanedResponse = cleanedResponse.Substring(0, cleanedResponse.Length - 3);
                }
                cleanedResponse = cleanedResponse.Trim();

                parsedData = JsonSerializer.Deserialize<ParsedResumeData>(
                    cleanedResponse,
                    new JsonSerializerOptions { PropertyNameCaseInsensitive = true });

                if (parsedData == null)
                {
                    throw new JsonException("Deserialized to null");
                }
            }
            catch (JsonException ex)
            {
                _logger.LogError(ex,
                    "AI response was not valid JSON. Raw response: {Response}",
                    aiResponse);
                
                return new ParsedResumeResult
                {
                    Success = false,
                    ErrorMessage = "AI returned invalid JSON format",
                    RawAIResponse = aiResponse
                };
            }

            // Step 4: Update CandidateProfile
            var profile = await _uow.CandidateProfiles.GetByIdAsync(candidateProfileId);
            if (profile == null)
            {
                _logger.LogWarning("Candidate profile {ProfileId} not found", candidateProfileId);
                return new ParsedResumeResult
                {
                    Success = false,
                    ErrorMessage = "Candidate profile not found"
                };
            }

            profile.Skills = parsedData.Skills ?? new List<string>();
            profile.YearsOfExperience = parsedData.YearsOfExperience;
            profile.ParsedResumeJson = aiResponse;

            // Optionally update summary if it's empty or if parsed summary is better
            if (string.IsNullOrWhiteSpace(profile.Summary) && !string.IsNullOrWhiteSpace(parsedData.Summary))
            {
                profile.Summary = parsedData.Summary;
            }

            _uow.CandidateProfiles.Update(profile);
            await _uow.SaveChangesAsync();

            _logger.LogInformation(
                "Successfully parsed resume for candidate {ProfileId}. " +
                "Extracted {SkillCount} skills, {YearsExp} years experience",
                candidateProfileId, parsedData.Skills?.Count ?? 0, parsedData.YearsOfExperience);

            return new ParsedResumeResult
            {
                Success = true,
                ParsedData = parsedData,
                RawAIResponse = aiResponse
            };
        }
        catch (Exception ex)
        {
            _logger.LogError(ex,
                "Unexpected error parsing resume for candidate {ProfileId}",
                candidateProfileId);
            
            return new ParsedResumeResult
            {
                Success = false,
                ErrorMessage = $"Unexpected error: {ex.Message}"
            };
        }
    }

    private string ExtractTextFromPdf(string pdfFilePath)
    {
        try
        {
            if (!File.Exists(pdfFilePath))
            {
                _logger.LogWarning("PDF file not found: {FilePath}", pdfFilePath);
                return string.Empty;
            }

            using var document = PdfDocument.Open(pdfFilePath);
            var text = string.Join("\n", document.GetPages().Select(p => p.Text));
            return text;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error extracting text from PDF: {FilePath}", pdfFilePath);
            return string.Empty;
        }
    }
}

// DTOs for parsing
public class ParsedResumeData
{
    public List<string>? Skills { get; set; }
    public int YearsOfExperience { get; set; }
    public List<string>? Education { get; set; }
    public string? Summary { get; set; }
}

public class ParsedResumeResult
{
    public bool Success { get; set; }
    public string? ErrorMessage { get; set; }
    public ParsedResumeData? ParsedData { get; set; }
    public string? RawAIResponse { get; set; }
}
