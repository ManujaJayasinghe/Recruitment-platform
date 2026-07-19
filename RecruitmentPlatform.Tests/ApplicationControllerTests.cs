using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Moq;
using RecruitmentPlatform.API.Controllers;
using RecruitmentPlatform.Application.DTOs.Application;
using RecruitmentPlatform.Domain.Entities;
using RecruitmentPlatform.Domain.Enums;
using RecruitmentPlatform.Domain.Interfaces;
using System.Security.Claims;
using System.Linq.Expressions;

namespace RecruitmentPlatform.Tests;

public class ApplicationControllerTests
{
    private readonly Mock<IUnitOfWork> _mockUow;
    private readonly ApplicationController _controller;
    private readonly Guid _userId;
    private readonly Guid _profileId;

    public ApplicationControllerTests()
    {
        _mockUow = new Mock<IUnitOfWork>();
        _controller = new ApplicationController(_mockUow.Object);
        
        _userId = Guid.NewGuid();
        _profileId = Guid.NewGuid();

        // Setup controller context with authenticated user
        var claims = new List<Claim>
        {
            new Claim(ClaimTypes.NameIdentifier, _userId.ToString()),
            new Claim(ClaimTypes.Role, "Candidate")
        };
        var identity = new ClaimsIdentity(claims, "Test");
        var claimsPrincipal = new ClaimsPrincipal(identity);
        
        _controller.ControllerContext = new ControllerContext
        {
            HttpContext = new DefaultHttpContext { User = claimsPrincipal }
        };
    }

    [Fact]
    public async Task Apply_WithDuplicateApplication_ReturnsConflict()
    {
        // Arrange
        var jobId = Guid.NewGuid();
        var request = new CreateApplicationRequest
        {
            JobPostingId = jobId
        };

        var profile = new CandidateProfile
        {
            Id = _profileId,
            UserId = _userId,
            Skills = new List<string> { "C#" },
            YearsOfExperience = 5,
            Headline = "Developer",
            Summary = "Experienced"
        };

        var job = new JobPosting
        {
            Id = jobId,
            Title = "Developer",
            Status = JobStatus.Open,
            RequiredSkills = new List<string> { "C#" },
            MinExperience = 3,
            PostedByUserId = Guid.NewGuid(),
            DepartmentId = Guid.NewGuid(),
            CreatedAt = DateTime.UtcNow
        };

        var existingApplication = new Domain.Entities.Application
        {
            Id = Guid.NewGuid(),
            JobPostingId = jobId,
            CandidateProfileId = _profileId,
            Status = ApplicationStatus.Applied,
            AppliedAt = DateTime.UtcNow
        };

        _mockUow.Setup(u => u.CandidateProfiles.FindAsync(It.IsAny<Expression<Func<CandidateProfile, bool>>>()))
            .ReturnsAsync(new List<CandidateProfile> { profile });

        _mockUow.Setup(u => u.JobPostings.GetByIdAsync(jobId))
            .ReturnsAsync(job);

        _mockUow.Setup(u => u.Applications.FindAsync(It.IsAny<Expression<Func<Domain.Entities.Application, bool>>>()))
            .ReturnsAsync(new List<Domain.Entities.Application> { existingApplication });

        // Act
        var result = await _controller.Apply(request);

        // Assert
        var conflictResult = Assert.IsType<ConflictObjectResult>(result);
        Assert.NotNull(conflictResult.Value);
    }

    [Fact]
    public async Task Apply_WithValidData_ReturnsCreatedAtAction()
    {
        // Arrange
        var jobId = Guid.NewGuid();
        var request = new CreateApplicationRequest
        {
            JobPostingId = jobId
        };

        var profile = new CandidateProfile
        {
            Id = _profileId,
            UserId = _userId,
            Skills = new List<string> { "C#", "ASP.NET" },
            YearsOfExperience = 5,
            Headline = "Senior Developer",
            Summary = "Experienced developer"
        };

        var job = new JobPosting
        {
            Id = jobId,
            Title = "Senior Developer",
            Status = JobStatus.Open,
            RequiredSkills = new List<string> { "C#", "ASP.NET" },
            MinExperience = 3,
            PostedByUserId = Guid.NewGuid(),
            DepartmentId = Guid.NewGuid(),
            CreatedAt = DateTime.UtcNow
        };

        _mockUow.Setup(u => u.CandidateProfiles.FindAsync(It.IsAny<Expression<Func<CandidateProfile, bool>>>()))
            .ReturnsAsync(new List<CandidateProfile> { profile });

        _mockUow.Setup(u => u.JobPostings.GetByIdAsync(jobId))
            .ReturnsAsync(job);

        _mockUow.Setup(u => u.Applications.FindAsync(It.IsAny<Expression<Func<Domain.Entities.Application, bool>>>()))
            .ReturnsAsync(new List<Domain.Entities.Application>());

        _mockUow.Setup(u => u.Applications.AddAsync(It.IsAny<Domain.Entities.Application>()))
            .Returns(Task.CompletedTask);

        _mockUow.Setup(u => u.SaveChangesAsync())
            .ReturnsAsync(1);

        // Act
        var result = await _controller.Apply(request);

        // Assert
        var createdResult = Assert.IsType<CreatedAtActionResult>(result);
        var response = Assert.IsType<ApplicationResponse>(createdResult.Value);
        Assert.Equal(jobId, response.JobPostingId);
        Assert.Equal("Senior Developer", response.JobTitle);
        Assert.Equal(_profileId, response.CandidateProfileId);
    }

    [Fact]
    public async Task Apply_WithClosedJob_ReturnsBadRequest()
    {
        // Arrange
        var jobId = Guid.NewGuid();
        var request = new CreateApplicationRequest
        {
            JobPostingId = jobId
        };

        var profile = new CandidateProfile
        {
            Id = _profileId,
            UserId = _userId,
            Skills = new List<string> { "C#" },
            YearsOfExperience = 5,
            Headline = "Developer",
            Summary = "Experienced"
        };

        var job = new JobPosting
        {
            Id = jobId,
            Title = "Developer",
            Status = JobStatus.Closed, // Job is closed
            RequiredSkills = new List<string> { "C#" },
            MinExperience = 3,
            PostedByUserId = Guid.NewGuid(),
            DepartmentId = Guid.NewGuid(),
            CreatedAt = DateTime.UtcNow
        };

        _mockUow.Setup(u => u.CandidateProfiles.FindAsync(It.IsAny<Expression<Func<CandidateProfile, bool>>>()))
            .ReturnsAsync(new List<CandidateProfile> { profile });

        _mockUow.Setup(u => u.JobPostings.GetByIdAsync(jobId))
            .ReturnsAsync(job);

        // Act
        var result = await _controller.Apply(request);

        // Assert
        var badRequestResult = Assert.IsType<BadRequestObjectResult>(result);
        Assert.NotNull(badRequestResult.Value);
    }

    [Fact]
    public async Task Apply_WithNonExistentJob_ReturnsNotFound()
    {
        // Arrange
        var jobId = Guid.NewGuid();
        var request = new CreateApplicationRequest
        {
            JobPostingId = jobId
        };

        var profile = new CandidateProfile
        {
            Id = _profileId,
            UserId = _userId,
            Skills = new List<string> { "C#" },
            YearsOfExperience = 5,
            Headline = "Developer",
            Summary = "Experienced"
        };

        _mockUow.Setup(u => u.CandidateProfiles.FindAsync(It.IsAny<Expression<Func<CandidateProfile, bool>>>()))
            .ReturnsAsync(new List<CandidateProfile> { profile });

        _mockUow.Setup(u => u.JobPostings.GetByIdAsync(jobId))
            .ReturnsAsync((JobPosting?)null);

        // Act
        var result = await _controller.Apply(request);

        // Assert
        var notFoundResult = Assert.IsType<NotFoundObjectResult>(result);
        Assert.NotNull(notFoundResult.Value);
    }
}
