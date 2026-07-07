using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace RecruitmentPlatform.API.Controllers;

[ApiController]
[Route("api/echo")]
public class EchoController : ControllerBase
{
    [HttpGet("candidate")]
    [Authorize(Roles = "Candidate")]
    public IActionResult Candidate() => Ok(new { message = "Hello, Candidate! Role access confirmed." });

    [HttpGet("recruiter")]
    [Authorize(Roles = "Recruiter")]
    public IActionResult Recruiter() => Ok(new { message = "Hello, Recruiter! Role access confirmed." });

    [HttpGet("hiringmanager")]
    [Authorize(Roles = "HiringManager")]
    public IActionResult HiringManager() => Ok(new { message = "Hello, HiringManager! Role access confirmed." });

    [HttpGet("admin")]
    [Authorize(Roles = "Admin")]
    public IActionResult Admin() => Ok(new { message = "Hello, Admin! Role access confirmed." });
}
