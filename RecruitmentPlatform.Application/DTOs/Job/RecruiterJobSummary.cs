namespace RecruitmentPlatform.Application.DTOs.Job;

public class RecruiterJobSummary
{
    public Guid         Id               { get; set; }
    public string       Title            { get; set; } = string.Empty;
    public string       Department       { get; set; } = string.Empty;
    public string       Status           { get; set; } = string.Empty;
    public List<string> RequiredSkills   { get; set; } = new();
    public int          MinExperience    { get; set; }
    public DateTime     CreatedAt        { get; set; }
    public int          ApplicationCount { get; set; }
}
