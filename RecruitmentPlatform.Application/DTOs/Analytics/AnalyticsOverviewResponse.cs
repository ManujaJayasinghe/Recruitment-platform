namespace RecruitmentPlatform.Application.DTOs.Analytics;

public class AnalyticsOverviewResponse
{
    public int    TotalCandidates           { get; set; }
    public int    TotalOpenJobs             { get; set; }
    public int    ApplicationsThisMonth     { get; set; }
    public double HireRate                  { get; set; } // Percentage
    public double AverageTimeToHireInDays   { get; set; }
}
