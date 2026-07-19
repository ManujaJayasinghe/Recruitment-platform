using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using RecruitmentPlatform.Domain.Interfaces;

namespace RecruitmentPlatform.API.Controllers;

[ApiController]
[Route("api/org")]
[Authorize]
public class OrganizationController : ControllerBase
{
    private readonly IUnitOfWork _uow;

    public OrganizationController(IUnitOfWork uow)
    {
        _uow = uow;
    }

    // GET /api/org/departments
    [HttpGet("departments")]
    public async Task<IActionResult> GetDepartments()
    {
        var departments = await _uow.Departments.GetAllAsync();

        var result = departments
            .OrderBy(d => d.Name)
            .Select(d => new
            {
                id = d.Id,
                name = d.Name,
                organizationId = d.OrganizationId
            })
            .ToList();

        return Ok(result);
    }
}
