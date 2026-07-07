using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using RecruitmentPlatform.Application.DTOs.Admin;
using RecruitmentPlatform.Domain.Enums;
using RecruitmentPlatform.Domain.Interfaces;

namespace RecruitmentPlatform.API.Controllers;

[ApiController]
[Route("api/admin")]
[Authorize(Roles = "Admin")]
public class AdminController : ControllerBase
{
    private readonly IUnitOfWork _uow;
    private readonly ILogger<AdminController> _logger;

    public AdminController(IUnitOfWork uow, ILogger<AdminController> logger)
    {
        _uow = uow;
        _logger = logger;
    }

    // GET /api/admin/users
    [HttpGet("users")]
    public async Task<IActionResult> GetUsers(
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 20,
        [FromQuery] UserRole? role = null,
        [FromQuery] bool? isActive = null)
    {
        if (page < 1) page = 1;
        if (pageSize < 1 || pageSize > 100) pageSize = 20;

        // Get all users with optional filtering
        var allUsers = await _uow.Users.GetAllAsync();
        var filteredUsers = allUsers.AsEnumerable();

        if (role.HasValue)
            filteredUsers = filteredUsers.Where(u => u.Role == role.Value);

        if (isActive.HasValue)
            filteredUsers = filteredUsers.Where(u => u.IsActive == isActive.Value);

        var totalCount = filteredUsers.Count();
        var totalPages = (int)Math.Ceiling(totalCount / (double)pageSize);

        var pagedUsers = filteredUsers
            .OrderByDescending(u => u.CreatedAt)
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .Select(u => new UserListResponse
            {
                Id        = u.Id,
                FullName  = u.FullName,
                Email     = u.Email,
                Role      = u.Role,
                IsActive  = u.IsActive,
                CreatedAt = u.CreatedAt,
            })
            .ToList();

        var response = new PagedUserListResponse
        {
            Users      = pagedUsers,
            Page       = page,
            PageSize   = pageSize,
            TotalCount = totalCount,
            TotalPages = totalPages,
        };

        return Ok(response);
    }

    // PATCH /api/admin/users/{id}/role
    [HttpPatch("users/{id:guid}/role")]
    public async Task<IActionResult> UpdateUserRole(Guid id, [FromBody] UpdateUserRoleRequest request)
    {
        var user = await _uow.Users.GetByIdAsync(id);
        if (user == null)
            return NotFound(new { message = "User not found." });

        var oldRole = user.Role;
        user.Role = request.Role;
        
        await _uow.SaveChangesAsync();

        _logger.LogInformation(
            "Admin updated user {UserId} ({Email}) role from {OldRole} to {NewRole}",
            user.Id, user.Email, oldRole, request.Role);

        return Ok(new
        {
            id = user.Id,
            email = user.Email,
            oldRole = oldRole,
            newRole = user.Role,
            message = "User role updated successfully."
        });
    }

    // PATCH /api/admin/users/{id}/status
    [HttpPatch("users/{id:guid}/status")]
    public async Task<IActionResult> UpdateUserStatus(Guid id, [FromBody] UpdateUserStatusRequest request)
    {
        var user = await _uow.Users.GetByIdAsync(id);
        if (user == null)
            return NotFound(new { message = "User not found." });

        var oldStatus = user.IsActive;
        user.IsActive = request.IsActive;
        
        await _uow.SaveChangesAsync();

        var statusText = request.IsActive ? "activated" : "deactivated";
        _logger.LogInformation(
            "Admin {Status} user {UserId} ({Email})",
            statusText, user.Id, user.Email);

        return Ok(new
        {
            id = user.Id,
            email = user.Email,
            isActive = user.IsActive,
            message = $"User {statusText} successfully."
        });
    }

    // DELETE /api/admin/users/{id}
    // WARNING: Hard delete operation with cascading implications
    // This will trigger cascading deletes or restrictions based on foreign key constraints
    // Affected entities may include:
    // - CandidateProfile (if user is a candidate)
    // - JobPostings (if user is a recruiter)
    // - Applications (via CandidateProfile)
    // - Messages (sent by this user)
    // - Evaluations (created by this user)
    // Use sparingly and only when absolutely necessary. Consider soft delete (IsActive = false) instead.
    [HttpDelete("users/{id:guid}")]
    public async Task<IActionResult> DeleteUser(Guid id)
    {
        var user = await _uow.Users.GetByIdAsync(id);
        if (user == null)
            return NotFound(new { message = "User not found." });

        // Additional safety check: prevent deleting active admins accidentally
        if (user.Role == UserRole.Admin && user.IsActive)
        {
            return BadRequest(new
            {
                message = "Cannot delete an active admin user. Deactivate first or use extreme caution."
            });
        }

        try
        {
            _uow.Users.Delete(user);
            await _uow.SaveChangesAsync();

            _logger.LogWarning(
                "Admin HARD DELETED user {UserId} ({Email}, Role: {Role}). " +
                "This action may have cascading effects on related data.",
                user.Id, user.Email, user.Role);

            return Ok(new
            {
                message = "User permanently deleted.",
                deletedUserId = id,
                deletedEmail = user.Email
            });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex,
                "Failed to delete user {UserId} ({Email}). Possible foreign key constraint violation.",
                user.Id, user.Email);

            return Conflict(new
            {
                message = "Cannot delete user due to existing related data. " +
                         "Consider deactivating the user instead.",
                error = ex.Message
            });
        }
    }

    // ── Organization Management ───────────────────────────────────────────────

    // POST /api/admin/organizations
    [HttpPost("organizations")]
    public async Task<IActionResult> CreateOrganization([FromBody] CreateOrganizationRequest request)
    {
        if (string.IsNullOrWhiteSpace(request.Name))
            return BadRequest(new { message = "Organization name is required." });

        var organization = new Domain.Entities.Organization
        {
            Id        = Guid.NewGuid(),
            Name      = request.Name.Trim(),
            Industry  = request.Industry?.Trim() ?? string.Empty,
            CreatedAt = DateTime.UtcNow,
        };

        await _uow.Organizations.AddAsync(organization);
        await _uow.SaveChangesAsync();

        _logger.LogInformation(
            "Admin created organization {OrgId} ({OrgName})",
            organization.Id, organization.Name);

        return CreatedAtAction(nameof(GetOrganizations), new { id = organization.Id },
            new OrganizationResponse
            {
                Id              = organization.Id,
                Name            = organization.Name,
                Industry        = organization.Industry,
                CreatedAt       = organization.CreatedAt,
                DepartmentCount = 0,
            });
    }

    // GET /api/admin/organizations
    [HttpGet("organizations")]
    public async Task<IActionResult> GetOrganizations()
    {
        var organizations = await _uow.Organizations.GetAllAsync();

        var result = organizations.Select(o => new OrganizationResponse
        {
            Id              = o.Id,
            Name            = o.Name,
            Industry        = o.Industry,
            CreatedAt       = o.CreatedAt,
            DepartmentCount = o.Departments.Count,
        })
        .OrderBy(o => o.Name)
        .ToList();

        return Ok(result);
    }

    // PUT /api/admin/organizations/{id}
    [HttpPut("organizations/{id:guid}")]
    public async Task<IActionResult> UpdateOrganization(Guid id, [FromBody] UpdateOrganizationRequest request)
    {
        if (string.IsNullOrWhiteSpace(request.Name))
            return BadRequest(new { message = "Organization name is required." });

        var organization = await _uow.Organizations.GetByIdAsync(id);
        if (organization == null)
            return NotFound(new { message = "Organization not found." });

        organization.Name     = request.Name.Trim();
        organization.Industry = request.Industry?.Trim() ?? string.Empty;

        _uow.Organizations.Update(organization);
        await _uow.SaveChangesAsync();

        _logger.LogInformation(
            "Admin updated organization {OrgId} ({OrgName})",
            organization.Id, organization.Name);

        return Ok(new OrganizationResponse
        {
            Id              = organization.Id,
            Name            = organization.Name,
            Industry        = organization.Industry,
            CreatedAt       = organization.CreatedAt,
            DepartmentCount = organization.Departments.Count,
        });
    }

    // ── Department Management ─────────────────────────────────────────────────

    // POST /api/admin/departments
    [HttpPost("departments")]
    public async Task<IActionResult> CreateDepartment([FromBody] CreateDepartmentRequest request)
    {
        if (string.IsNullOrWhiteSpace(request.Name))
            return BadRequest(new { message = "Department name is required." });

        var organization = await _uow.Organizations.GetByIdAsync(request.OrganizationId);
        if (organization == null)
            return NotFound(new { message = "Organization not found." });

        var department = new Domain.Entities.Department
        {
            Id             = Guid.NewGuid(),
            Name           = request.Name.Trim(),
            OrganizationId = request.OrganizationId,
        };

        await _uow.Departments.AddAsync(department);
        await _uow.SaveChangesAsync();

        _logger.LogInformation(
            "Admin created department {DeptId} ({DeptName}) under organization {OrgId}",
            department.Id, department.Name, request.OrganizationId);

        return CreatedAtAction(nameof(GetDepartments), new { id = department.Id },
            new DepartmentResponse
            {
                Id               = department.Id,
                Name             = department.Name,
                OrganizationId   = department.OrganizationId,
                OrganizationName = organization.Name,
                JobPostingCount  = 0,
            });
    }

    // GET /api/admin/departments
    [HttpGet("departments")]
    public async Task<IActionResult> GetDepartments([FromQuery] Guid? organizationId = null)
    {
        var departments = organizationId.HasValue
            ? await _uow.Departments.FindAsync(d => d.OrganizationId == organizationId.Value)
            : await _uow.Departments.GetAllAsync();

        var organizations = await _uow.Organizations.GetAllAsync();
        var orgMap = organizations.ToDictionary(o => o.Id, o => o.Name);

        var result = departments.Select(d => new DepartmentResponse
        {
            Id               = d.Id,
            Name             = d.Name,
            OrganizationId   = d.OrganizationId,
            OrganizationName = orgMap.GetValueOrDefault(d.OrganizationId, "Unknown"),
            JobPostingCount  = d.JobPostings.Count,
        })
        .OrderBy(d => d.OrganizationName)
        .ThenBy(d => d.Name)
        .ToList();

        return Ok(result);
    }

    // PUT /api/admin/departments/{id}
    [HttpPut("departments/{id:guid}")]
    public async Task<IActionResult> UpdateDepartment(Guid id, [FromBody] UpdateDepartmentRequest request)
    {
        if (string.IsNullOrWhiteSpace(request.Name))
            return BadRequest(new { message = "Department name is required." });

        var department = await _uow.Departments.GetByIdAsync(id);
        if (department == null)
            return NotFound(new { message = "Department not found." });

        var organization = await _uow.Organizations.GetByIdAsync(request.OrganizationId);
        if (organization == null)
            return NotFound(new { message = "Organization not found." });

        department.Name           = request.Name.Trim();
        department.OrganizationId = request.OrganizationId;

        _uow.Departments.Update(department);
        await _uow.SaveChangesAsync();

        _logger.LogInformation(
            "Admin updated department {DeptId} ({DeptName})",
            department.Id, department.Name);

        return Ok(new DepartmentResponse
        {
            Id               = department.Id,
            Name             = department.Name,
            OrganizationId   = department.OrganizationId,
            OrganizationName = organization.Name,
            JobPostingCount  = department.JobPostings.Count,
        });
    }
}
