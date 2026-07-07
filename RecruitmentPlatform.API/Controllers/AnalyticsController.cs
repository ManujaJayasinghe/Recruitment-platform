using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using RecruitmentPlatform.Application.DTOs.Analytics;
using RecruitmentPlatform.Domain.Enums;
using RecruitmentPlatform.Domain.Interfaces;
using System.Globalization;

namespace RecruitmentPlatform.API.Controllers;

[ApiController]
[Route("api/analytics")]
[Authorize(Roles = "Admin,HiringManager")]
public class AnalyticsController : ControllerBase
{
    private readonly IUnitOfWork _uow;
    private readonly ILogger<AnalyticsController> _logger;

    public AnalyticsController(IUnitOfWork uow, ILogger<AnalyticsController> logger)
    {
        _uow = uow;
        _logger = logger;
    }

    // GET /api/analytics/overview
    [HttpGet("overview")]
    public async Task<IActionResult> GetOverview()
    {
        var candidates = await _uow.CandidateProfiles.GetAllAsync();
        var jobs = await _uow.JobPostings.GetAllAsync();
        var applications = await _uow.Applications.GetAllAsync();

        var totalCandidates = candidates.Count();
        var totalOpenJobs = jobs.Count(j => j.Status == JobStatus.Open);

        // Applications this month
        var now = DateTime.UtcNow;
        var startOfMonth = new DateTime(now.Year, now.Month, 1);
        var applicationsThisMonth = applications.Count(a => a.AppliedAt >= startOfMonth);

        // Hire rate
        var totalApplications = applications.Count();
        var hiredApplications = applications.Count(a => a.Status == ApplicationStatus.Hired);
        var hireRate = totalApplications > 0 ? (hiredApplications * 100.0 / totalApplications) : 0;

        // Average time to hire (from AppliedAt to when status changed to Hired)
        // Since we don't track status change dates, we'll use a simplified calculation
        var hiredApps = applications.Where(a => a.Status == ApplicationStatus.Hired).ToList();
        var averageTimeToHire = 0.0;
        if (hiredApps.Any())
        {
            // Simplified: assume hired apps took the time from AppliedAt to now
            // In a real system, you'd track the hire decision date
            var totalDays = hiredApps.Sum(a => (now - a.AppliedAt).TotalDays);
            averageTimeToHire = totalDays / hiredApps.Count;
        }

        var response = new AnalyticsOverviewResponse
        {
            TotalCandidates         = totalCandidates,
            TotalOpenJobs           = totalOpenJobs,
            ApplicationsThisMonth   = applicationsThisMonth,
            HireRate                = Math.Round(hireRate, 2),
            AverageTimeToHireInDays = Math.Round(averageTimeToHire, 1),
        };

        return Ok(response);
    }

    // GET /api/analytics/applications-over-time
    [HttpGet("applications-over-time")]
    public async Task<IActionResult> GetApplicationsOverTime([FromQuery] string groupBy = "month")
    {
        var applications = await _uow.Applications.GetAllAsync();

        var sixMonthsAgo = DateTime.UtcNow.AddMonths(-6);
        var filteredApps = applications.Where(a => a.AppliedAt >= sixMonthsAgo).ToList();

        List<TimeSeriesDataPoint> dataPoints;

        if (groupBy.ToLower() == "week")
        {
            // Group by week
            var grouped = filteredApps
                .GroupBy(a => GetWeekKey(a.AppliedAt))
                .Select(g => new TimeSeriesDataPoint
                {
                    PeriodLabel = g.Key,
                    PeriodStart = GetWeekStart(g.First().AppliedAt),
                    Count = g.Count(),
                })
                .OrderBy(dp => dp.PeriodStart)
                .ToList();

            dataPoints = grouped;
        }
        else // default to month
        {
            // Group by month
            var grouped = filteredApps
                .GroupBy(a => new { a.AppliedAt.Year, a.AppliedAt.Month })
                .Select(g => new TimeSeriesDataPoint
                {
                    PeriodLabel = $"{g.Key.Year}-{g.Key.Month:D2}",
                    PeriodStart = new DateTime(g.Key.Year, g.Key.Month, 1),
                    Count = g.Count(),
                })
                .OrderBy(dp => dp.PeriodStart)
                .ToList();

            dataPoints = grouped;
        }

        return Ok(new ApplicationsOverTimeResponse { DataPoints = dataPoints });
    }

    // GET /api/analytics/applications-by-status
    [HttpGet("applications-by-status")]
    public async Task<IActionResult> GetApplicationsByStatus()
    {
        var applications = await _uow.Applications.GetAllAsync();
        var totalCount = applications.Count();

        var grouped = applications
            .GroupBy(a => a.Status)
            .Select(g => new StatusCountDataPoint
            {
                Status = g.Key,
                StatusName = g.Key.ToString(),
                Count = g.Count(),
                Percentage = totalCount > 0 ? Math.Round((g.Count() * 100.0 / totalCount), 2) : 0,
            })
            .OrderByDescending(d => d.Count)
            .ToList();

        return Ok(new ApplicationsByStatusResponse { DataPoints = grouped });
    }

    // GET /api/analytics/top-skills-demanded
    [HttpGet("top-skills-demanded")]
    public async Task<IActionResult> GetTopSkillsDemanded([FromQuery] int top = 10)
    {
        var jobs = await _uow.JobPostings.GetAllAsync();
        var openJobs = jobs.Where(j => j.Status == JobStatus.Open).ToList();

        // Flatten all required skills from open jobs
        var allSkills = openJobs
            .SelectMany(j => j.RequiredSkills)
            .Where(s => !string.IsNullOrWhiteSpace(s))
            .ToList();

        // Group and count
        var topSkills = allSkills
            .GroupBy(s => s.Trim(), StringComparer.OrdinalIgnoreCase)
            .Select(g => new SkillDemandDataPoint
            {
                SkillName = g.Key,
                Count = g.Count(),
            })
            .OrderByDescending(s => s.Count)
            .Take(top)
            .ToList();

        return Ok(new TopSkillsResponse { Skills = topSkills });
    }

    // ── Helpers ───────────────────────────────────────────────────────────────

    private static string GetWeekKey(DateTime date)
    {
        var calendar = CultureInfo.CurrentCulture.Calendar;
        var weekOfYear = calendar.GetWeekOfYear(date, CalendarWeekRule.FirstDay, DayOfWeek.Monday);
        return $"{date.Year}-W{weekOfYear:D2}";
    }

    private static DateTime GetWeekStart(DateTime date)
    {
        var diff = (7 + (date.DayOfWeek - DayOfWeek.Monday)) % 7;
        return date.AddDays(-diff).Date;
    }
}
