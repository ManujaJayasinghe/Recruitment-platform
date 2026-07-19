using Microsoft.Extensions.Logging;
using Moq;
using RecruitmentPlatform.Application.Services;
using RecruitmentPlatform.Domain.Entities;
using RecruitmentPlatform.Domain.Enums;

namespace RecruitmentPlatform.Tests;

public class KeywordMatchStrategyTests
{
    private readonly KeywordMatchStrategy _strategy;
    private readonly Mock<ILogger<KeywordMatchStrategy>> _mockLogger;

    public KeywordMatchStrategyTests()
    {
        _mockLogger = new Mock<ILogger<KeywordMatchStrategy>>();
        _strategy = new KeywordMatchStrategy(_mockLogger.Object);
    }

    [Fact]
    public async Task CalculateMatchScore_With3OutOf5Skills_Returns60Percent()
    {
        // Arrange
        var candidate = new CandidateProfile
        {
            Id = Guid.NewGuid(),
            UserId = Guid.NewGuid(),
            Skills = new List<string> { "C#", "ASP.NET Core", "SQL", "JavaScript", "React" },
            YearsOfExperience = 5,
            Headline = "Senior Developer",
            Summary = "Experienced developer"
        };

        var job = new JobPosting
        {
            Id = Guid.NewGuid(),
            Title = "Backend Developer",
            RequiredSkills = new List<string> { "C#", "ASP.NET Core", "SQL", "Docker", "Kubernetes" },
            MinExperience = 3,
            Status = JobStatus.Open,
            PostedByUserId = Guid.NewGuid(),
            DepartmentId = Guid.NewGuid(),
            CreatedAt = DateTime.UtcNow
        };

        // Act
        var score = await _strategy.CalculateMatchScore(candidate, job);

        // Assert
        Assert.Equal(60.0, score);
    }

    [Fact]
    public async Task CalculateMatchScore_WithAllSkillsMatching_Returns100Percent()
    {
        // Arrange
        var candidate = new CandidateProfile
        {
            Id = Guid.NewGuid(),
            UserId = Guid.NewGuid(),
            Skills = new List<string> { "Python", "Machine Learning", "SQL", "TensorFlow" },
            YearsOfExperience = 4,
            Headline = "ML Engineer",
            Summary = "AI specialist"
        };

        var job = new JobPosting
        {
            Id = Guid.NewGuid(),
            Title = "ML Engineer",
            RequiredSkills = new List<string> { "Python", "Machine Learning", "SQL" },
            MinExperience = 2,
            Status = JobStatus.Open,
            PostedByUserId = Guid.NewGuid(),
            DepartmentId = Guid.NewGuid(),
            CreatedAt = DateTime.UtcNow
        };

        // Act
        var score = await _strategy.CalculateMatchScore(candidate, job);

        // Assert
        Assert.Equal(100.0, score);
    }

    [Fact]
    public async Task CalculateMatchScore_WithNoMatchingSkills_Returns0Percent()
    {
        // Arrange
        var candidate = new CandidateProfile
        {
            Id = Guid.NewGuid(),
            UserId = Guid.NewGuid(),
            Skills = new List<string> { "Java", "Spring Boot", "MongoDB" },
            YearsOfExperience = 3,
            Headline = "Java Developer",
            Summary = "Backend developer"
        };

        var job = new JobPosting
        {
            Id = Guid.NewGuid(),
            Title = "Frontend Developer",
            RequiredSkills = new List<string> { "React", "TypeScript", "CSS" },
            MinExperience = 2,
            Status = JobStatus.Open,
            PostedByUserId = Guid.NewGuid(),
            DepartmentId = Guid.NewGuid(),
            CreatedAt = DateTime.UtcNow
        };

        // Act
        var score = await _strategy.CalculateMatchScore(candidate, job);

        // Assert
        Assert.Equal(0.0, score);
    }

    [Fact]
    public async Task CalculateMatchScore_IsCaseInsensitive()
    {
        // Arrange
        var candidate = new CandidateProfile
        {
            Id = Guid.NewGuid(),
            UserId = Guid.NewGuid(),
            Skills = new List<string> { "c#", "asp.net core", "sql" },
            YearsOfExperience = 5,
            Headline = "Developer",
            Summary = "Experienced"
        };

        var job = new JobPosting
        {
            Id = Guid.NewGuid(),
            Title = "Developer",
            RequiredSkills = new List<string> { "C#", "ASP.NET Core", "SQL" },
            MinExperience = 3,
            Status = JobStatus.Open,
            PostedByUserId = Guid.NewGuid(),
            DepartmentId = Guid.NewGuid(),
            CreatedAt = DateTime.UtcNow
        };

        // Act
        var score = await _strategy.CalculateMatchScore(candidate, job);

        // Assert
        Assert.Equal(100.0, score);
    }

    [Fact]
    public async Task CalculateMatchScore_WithJobHavingNoRequiredSkills_Returns0()
    {
        // Arrange
        var candidate = new CandidateProfile
        {
            Id = Guid.NewGuid(),
            UserId = Guid.NewGuid(),
            Skills = new List<string> { "C#", "ASP.NET Core" },
            YearsOfExperience = 5,
            Headline = "Developer",
            Summary = "Experienced"
        };

        var job = new JobPosting
        {
            Id = Guid.NewGuid(),
            Title = "Developer",
            RequiredSkills = new List<string>(),
            MinExperience = 3,
            Status = JobStatus.Open,
            PostedByUserId = Guid.NewGuid(),
            DepartmentId = Guid.NewGuid(),
            CreatedAt = DateTime.UtcNow
        };

        // Act
        var score = await _strategy.CalculateMatchScore(candidate, job);

        // Assert
        Assert.Equal(0.0, score);
    }

    [Fact]
    public async Task CalculateMatchScore_WithPartialMatch_ReturnsCorrectPercentage()
    {
        // Arrange
        var candidate = new CandidateProfile
        {
            Id = Guid.NewGuid(),
            UserId = Guid.NewGuid(),
            Skills = new List<string> { "React", "Node.js" },
            YearsOfExperience = 3,
            Headline = "Full Stack Developer",
            Summary = "JavaScript developer"
        };

        var job = new JobPosting
        {
            Id = Guid.NewGuid(),
            Title = "Full Stack Developer",
            RequiredSkills = new List<string> { "React", "Node.js", "MongoDB", "Express" },
            MinExperience = 2,
            Status = JobStatus.Open,
            PostedByUserId = Guid.NewGuid(),
            DepartmentId = Guid.NewGuid(),
            CreatedAt = DateTime.UtcNow
        };

        // Act
        var score = await _strategy.CalculateMatchScore(candidate, job);

        // Assert
        Assert.Equal(50.0, score); // 2 out of 4 = 50%
    }
}
