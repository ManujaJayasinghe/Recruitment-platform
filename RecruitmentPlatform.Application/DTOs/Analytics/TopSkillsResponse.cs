namespace RecruitmentPlatform.Application.DTOs.Analytics;

public class TopSkillsResponse
{
    public List<SkillDemandDataPoint> Skills { get; set; } = new();
}

public class SkillDemandDataPoint
{
    public string SkillName { get; set; } = string.Empty;
    public int Count { get; set; }
}
