using Microsoft.Extensions.Logging;
using RecruitmentPlatform.Application.Interfaces;
using RecruitmentPlatform.Domain.Interfaces;

namespace RecruitmentPlatform.Application.Services;

public class RankingService
{
    private readonly ICandidateRankingStrategy _rankingStrategy;
    private readonly IUnitOfWork _uow;
    private readonly ILogger<RankingService> _logger;

    public RankingService(
        ICandidateRankingStrategy rankingStrategy,
        IUnitOfWork uow,
        ILogger<RankingService> logger)
    {
        _rankingStrategy = rankingStrategy;
        _uow = uow;
        _logger = logger;
    }

    public async Task<List<RankedCandidateResult>> RankCandidatesForJobAsync(Guid jobId)
    {
        _logger.LogInformation("Ranking candidates for job {JobId}", jobId);

        // Get the job posting
        var job = await _uow.JobPostings.GetByIdAsync(jobId);
        if (job == null)
        {
            _logger.LogWarning("Job {JobId} not found", jobId);
            return new List<RankedCandidateResult>();
        }

        // Get all applications for this job
        var applications = await _uow.Applications.FindAsync(a => a.JobPostingId == jobId);
        if (!applications.Any())
        {
            _logger.LogInformation("No applications found for job {JobId}", jobId);
            return new List<RankedCandidateResult>();
        }

        var results = new List<RankedCandidateResult>();

        // Calculate match score for each candidate
        foreach (var application in applications)
        {
            var candidate = await _uow.CandidateProfiles.GetByIdAsync(application.CandidateProfileId);
            if (candidate == null)
            {
                _logger.LogWarning(
                    "Candidate profile {ProfileId} not found for application {AppId}",
                    application.CandidateProfileId, application.Id);
                continue;
            }

            var user = await _uow.Users.GetByIdAsync(candidate.UserId);
            if (user == null)
            {
                _logger.LogWarning("User {UserId} not found for candidate {ProfileId}",
                    candidate.UserId, candidate.Id);
                continue;
            }

            // Calculate match score using the injected strategy
            var matchScore = await _rankingStrategy.CalculateMatchScore(candidate, job);

            // Update the application's match score
            application.MatchScore = matchScore;
            _uow.Applications.Update(application);

            results.Add(new RankedCandidateResult
            {
                ApplicationId       = application.Id,
                CandidateProfileId  = candidate.Id,
                CandidateName       = user.FullName,
                CandidateEmail      = user.Email,
                Headline            = candidate.Headline,
                Skills              = candidate.Skills,
                YearsOfExperience   = candidate.YearsOfExperience,
                MatchScore          = matchScore,
                ApplicationStatus   = application.Status,
                AppliedAt           = application.AppliedAt,
            });
        }

        // Save all updated match scores
        await _uow.SaveChangesAsync();

        // Sort by match score descending
        var rankedResults = results.OrderByDescending(r => r.MatchScore).ToList();

        _logger.LogInformation(
            "Ranked {Count} candidates for job {JobId}",
            rankedResults.Count, jobId);

        return rankedResults;
    }
}

public class RankedCandidateResult
{
    public Guid                                     ApplicationId      { get; set; }
    public Guid                                     CandidateProfileId { get; set; }
    public string                                   CandidateName      { get; set; } = string.Empty;
    public string                                   CandidateEmail     { get; set; } = string.Empty;
    public string                                   Headline           { get; set; } = string.Empty;
    public List<string>                             Skills             { get; set; } = new();
    public int                                      YearsOfExperience  { get; set; }
    public double                                   MatchScore         { get; set; }
    public RecruitmentPlatform.Domain.Enums.ApplicationStatus ApplicationStatus { get; set; }
    public DateTime                                 AppliedAt          { get; set; }
}
