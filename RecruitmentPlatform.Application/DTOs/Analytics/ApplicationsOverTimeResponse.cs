namespace RecruitmentPlatform.Application.DTOs.Analytics;

public class ApplicationsOverTimeResponse
{
    public List<TimeSeriesDataPoint> DataPoints { get; set; } = new();
}

public class TimeSeriesDataPoint
{
    public string PeriodLabel { get; set; } = string.Empty; // e.g., "2026-W01" or "2026-01"
    public DateTime PeriodStart { get; set; }
    public int Count { get; set; }
}
