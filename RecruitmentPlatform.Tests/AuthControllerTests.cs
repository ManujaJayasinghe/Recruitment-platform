using Microsoft.AspNetCore.Mvc;
using Moq;
using RecruitmentPlatform.API.Controllers;
using RecruitmentPlatform.Application.DTOs.Auth;
using RecruitmentPlatform.Application.Interfaces;
using RecruitmentPlatform.Domain.Entities;
using RecruitmentPlatform.Domain.Enums;
using RecruitmentPlatform.Domain.Interfaces;
using System.Linq.Expressions;

namespace RecruitmentPlatform.Tests;

public class AuthControllerTests
{
    private readonly Mock<IUnitOfWork> _mockUow;
    private readonly Mock<IPasswordHasher> _mockHasher;
    private readonly Mock<ITokenService> _mockTokenService;
    private readonly AuthController _controller;

    public AuthControllerTests()
    {
        _mockUow = new Mock<IUnitOfWork>();
        _mockHasher = new Mock<IPasswordHasher>();
        _mockTokenService = new Mock<ITokenService>();
        _controller = new AuthController(_mockUow.Object, _mockHasher.Object, _mockTokenService.Object);
    }

    [Fact]
    public async Task Register_WithDuplicateEmail_ReturnsConflict()
    {
        // Arrange
        var request = new RegisterRequest
        {
            FullName = "Test User",
            Email = "test@example.com",
            Password = "Password123!",
            Role = UserRole.Candidate
        };

        var existingUser = new User
        {
            Id = Guid.NewGuid(),
            Email = "test@example.com",
            FullName = "Existing User",
            Role = UserRole.Candidate,
            PasswordHash = "hash"
        };

        _mockUow.Setup(u => u.Users.FindAsync(It.IsAny<Expression<Func<User, bool>>>()))
            .ReturnsAsync(new List<User> { existingUser });

        // Act
        var result = await _controller.Register(request);

        // Assert
        var conflictResult = Assert.IsType<ConflictObjectResult>(result);
        Assert.NotNull(conflictResult.Value);
    }

    [Fact]
    public async Task Register_WithValidData_ReturnsOkWithToken()
    {
        // Arrange
        var request = new RegisterRequest
        {
            FullName = "New User",
            Email = "new@example.com",
            Password = "Password123!",
            Role = UserRole.Candidate
        };

        _mockUow.Setup(u => u.Users.FindAsync(It.IsAny<Expression<Func<User, bool>>>()))
            .ReturnsAsync(new List<User>());

        _mockHasher.Setup(h => h.HashPassword(It.IsAny<string>()))
            .Returns("hashed_password");

        _mockTokenService.Setup(t => t.GenerateToken(It.IsAny<User>()))
            .Returns("mock_jwt_token");

        _mockUow.Setup(u => u.Users.AddAsync(It.IsAny<User>()))
            .Returns(Task.CompletedTask);

        _mockUow.Setup(u => u.CandidateProfiles.AddAsync(It.IsAny<CandidateProfile>()))
            .Returns(Task.CompletedTask);

        _mockUow.Setup(u => u.SaveChangesAsync())
            .ReturnsAsync(1);

        // Act
        var result = await _controller.Register(request);

        // Assert
        var okResult = Assert.IsType<OkObjectResult>(result);
        var response = Assert.IsType<AuthResponse>(okResult.Value);
        Assert.Equal("mock_jwt_token", response.Token);
        Assert.Equal("New User", response.FullName);
        Assert.Equal(UserRole.Candidate, response.Role);
    }

    [Fact]
    public async Task Login_WithWrongPassword_ReturnsUnauthorized()
    {
        // Arrange
        var request = new LoginRequest
        {
            Email = "user@example.com",
            Password = "WrongPassword"
        };

        var user = new User
        {
            Id = Guid.NewGuid(),
            Email = "user@example.com",
            FullName = "Test User",
            PasswordHash = "correct_hash",
            Role = UserRole.Candidate,
            IsActive = true
        };

        _mockUow.Setup(u => u.Users.FindAsync(It.IsAny<Expression<Func<User, bool>>>()))
            .ReturnsAsync(new List<User> { user });

        _mockHasher.Setup(h => h.VerifyPassword(user.PasswordHash, request.Password))
            .Returns(false);

        // Act
        var result = await _controller.Login(request);

        // Assert
        var unauthorizedResult = Assert.IsType<UnauthorizedObjectResult>(result);
        Assert.NotNull(unauthorizedResult.Value);
    }

    [Fact]
    public async Task Login_WithCorrectCredentials_ReturnsOkWithToken()
    {
        // Arrange
        var request = new LoginRequest
        {
            Email = "user@example.com",
            Password = "CorrectPassword"
        };

        var user = new User
        {
            Id = Guid.NewGuid(),
            Email = "user@example.com",
            FullName = "Test User",
            PasswordHash = "correct_hash",
            Role = UserRole.Recruiter,
            IsActive = true,
            CreatedAt = DateTime.UtcNow
        };

        _mockUow.Setup(u => u.Users.FindAsync(It.IsAny<Expression<Func<User, bool>>>()))
            .ReturnsAsync(new List<User> { user });

        _mockHasher.Setup(h => h.VerifyPassword(user.PasswordHash, request.Password))
            .Returns(true);

        _mockTokenService.Setup(t => t.GenerateToken(It.IsAny<User>()))
            .Returns("valid_jwt_token");

        // Act
        var result = await _controller.Login(request);

        // Assert
        var okResult = Assert.IsType<OkObjectResult>(result);
        var response = Assert.IsType<AuthResponse>(okResult.Value);
        Assert.Equal("valid_jwt_token", response.Token);
        Assert.Equal(user.Id, response.UserId);
        Assert.Equal(UserRole.Recruiter, response.Role);
    }

    [Fact]
    public async Task Login_WithInactiveAccount_ReturnsUnauthorized()
    {
        // Arrange
        var request = new LoginRequest
        {
            Email = "inactive@example.com",
            Password = "Password123!"
        };

        var user = new User
        {
            Id = Guid.NewGuid(),
            Email = "inactive@example.com",
            FullName = "Inactive User",
            PasswordHash = "hash",
            Role = UserRole.Candidate,
            IsActive = false,
            CreatedAt = DateTime.UtcNow
        };

        _mockUow.Setup(u => u.Users.FindAsync(It.IsAny<Expression<Func<User, bool>>>()))
            .ReturnsAsync(new List<User> { user });

        _mockHasher.Setup(h => h.VerifyPassword(user.PasswordHash, request.Password))
            .Returns(true);

        // Act
        var result = await _controller.Login(request);

        // Assert
        var unauthorizedResult = Assert.IsType<UnauthorizedObjectResult>(result);
        Assert.NotNull(unauthorizedResult.Value);
    }
}
