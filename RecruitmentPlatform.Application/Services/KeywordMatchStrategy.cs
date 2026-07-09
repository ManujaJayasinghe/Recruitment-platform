using Microsoft.Extensions.Logging;
using RecruitmentPlatform.Application.Interfaces;
using RecruitmentPlatform.Domain.Entities;

namespace RecruitmentPlatform.Application.Services;

public class KeywordMatchStrategy : ICandidateRankingStrategy
{
    private readonly ILogger<KeywordMatchStrategy> _logger;

    public KeywordMatchStrategy(ILogger<KeywordMatchStrategy> logger)
    {
        _logger = logger;
    }

    public Task<double> CalculateMatchScore(CandidateProfile candidate, JobPosting job)
    {
        if (job.RequiredSkills == null || job.RequiredSkills.Count == 0)
        {
            _logger.LogWarning("Job {JobId} has no required skills", job.Id);
            return Task.FromResult(0.0);
        }

        // Normalize skills to lowercase for case-insensitive comparison
        var candidateSkills = candidate.Skills
            .Select(s => s.Trim().ToLowerInvariant())
            .ToHashSet();

        var requiredSkills = job.RequiredSkills
            .Select(s => s.Trim().ToLowerInvariant())
            .ToHashSet();

        // Count matching skills
        var matchingSkills = requiredSkills.Intersect(candidateSkills).Count();

        // Calculate percentage
        var score = (matchingSkills / (double)requiredSkills.Count) * 100.0;

        _logger.LogDebug(
            "Keyword match for candidate {CandidateId} and job {JobId}: {Matching}/{Total} skills = {Score:F2}%",
            candidate.Id, job.Id, matchingSkills, requiredSkills.Count, score);

        return Task.FromResult(score);
    }
}
