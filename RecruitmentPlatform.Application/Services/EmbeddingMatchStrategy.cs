using Microsoft.Extensions.Logging;
using RecruitmentPlatform.Application.Interfaces;
using RecruitmentPlatform.Domain.Entities;

namespace RecruitmentPlatform.Application.Services;

public class EmbeddingMatchStrategy : ICandidateRankingStrategy
{
    private readonly IAIService _aiService;
    private readonly ILogger<EmbeddingMatchStrategy> _logger;

    public EmbeddingMatchStrategy(IAIService aiService, ILogger<EmbeddingMatchStrategy> logger)
    {
        _aiService = aiService;
        _logger = logger;
    }

    public async Task<double> CalculateMatchScore(CandidateProfile candidate, JobPosting job)
    {
        try
        {
            // Combine candidate's skills and summary
            var candidateText = $"{string.Join(", ", candidate.Skills)}. {candidate.Summary}".Trim();
            if (string.IsNullOrWhiteSpace(candidateText))
            {
                _logger.LogWarning("Candidate {CandidateId} has no skills or summary", candidate.Id);
                return 0.0;
            }

            // Combine job's description and required skills
            var jobText = $"{job.Description}. Required skills: {string.Join(", ", job.RequiredSkills)}".Trim();
            if (string.IsNullOrWhiteSpace(jobText))
            {
                _logger.LogWarning("Job {JobId} has no description or required skills", job.Id);
                return 0.0;
            }

            _logger.LogDebug(
                "Generating embeddings for candidate {CandidateId} and job {JobId}",
                candidate.Id, job.Id);

            // Generate embeddings
            var candidateEmbedding = await _aiService.GetEmbeddingAsync(candidateText);
            var jobEmbedding = await _aiService.GetEmbeddingAsync(jobText);

            // Calculate cosine similarity
            var similarity = CosineSimilarity(candidateEmbedding, jobEmbedding);

            // Scale to 0-100
            var score = (similarity + 1.0) / 2.0 * 100.0; // Cosine similarity is -1 to 1, scale to 0-100

            _logger.LogDebug(
                "Embedding match for candidate {CandidateId} and job {JobId}: cosine similarity = {Similarity:F4}, score = {Score:F2}%",
                candidate.Id, job.Id, similarity, score);

            return score;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex,
                "Error calculating embedding match score for candidate {CandidateId} and job {JobId}",
                candidate.Id, job.Id);
            
            // Fallback to 0 on error
            return 0.0;
        }
    }

    private static double CosineSimilarity(float[] vectorA, float[] vectorB)
    {
        if (vectorA.Length != vectorB.Length)
        {
            throw new ArgumentException("Vectors must have the same length");
        }

        double dotProduct = 0.0;
        double magnitudeA = 0.0;
        double magnitudeB = 0.0;

        for (int i = 0; i < vectorA.Length; i++)
        {
            dotProduct += vectorA[i] * vectorB[i];
            magnitudeA += vectorA[i] * vectorA[i];
            magnitudeB += vectorB[i] * vectorB[i];
        }

        magnitudeA = Math.Sqrt(magnitudeA);
        magnitudeB = Math.Sqrt(magnitudeB);

        if (magnitudeA == 0.0 || magnitudeB == 0.0)
        {
            return 0.0;
        }

        return dotProduct / (magnitudeA * magnitudeB);
    }
}
