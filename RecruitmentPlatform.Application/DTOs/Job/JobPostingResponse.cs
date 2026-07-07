namespace RecruitmentPlatform.Application.DTOs.Job;

public class JobPostingResponse
{
    public Guid         Id             { get; set; }
    public string       Title          { get; set; } = string.Empty;
    public string       Description    { get; set; } = string.Empty;
    public List<string> RequiredSkills { get; set; } = new();
    public int          MinExperience  { get; set; }
    public string       Department     { get; set; } = string.Empty;
    public Guid         DepartmentId   { get; set; }
    public string       PostedBy       { get; set; } = string.Empty;
    public string       Status         { get; set; } = string.Empty;
    public DateTime     CreatedAt      { get; set; }
    public int?         MatchScore     { get; set; } // keyword overlap count, null when not personalised
}
