using RecruitmentPlatform.Domain.Entities;

namespace RecruitmentPlatform.Application.Interfaces;

public interface ICandidateRankingStrategy
{
    Task<double> CalculateMatchScore(CandidateProfile candidate, JobPosting job);
}
