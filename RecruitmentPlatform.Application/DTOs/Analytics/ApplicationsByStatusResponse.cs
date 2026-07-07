using RecruitmentPlatform.Domain.Enums;

namespace RecruitmentPlatform.Application.DTOs.Analytics;

public class ApplicationsByStatusResponse
{
    public List<StatusCountDataPoint> DataPoints { get; set; } = new();
}

public class StatusCountDataPoint
{
    public ApplicationStatus Status { get; set; }
    public string StatusName { get; set; } = string.Empty;
    public int Count { get; set; }
    public double Percentage { get; set; }
}
