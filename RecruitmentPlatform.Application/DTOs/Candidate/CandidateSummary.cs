namespace RecruitmentPlatform.Application.DTOs.Candidate;

public class CandidateSummary
{
    public Guid         ProfileId         { get; set; }
    public string       FullName          { get; set; } = string.Empty;
    public string       Email             { get; set; } = string.Empty;
    public string       Headline          { get; set; } = string.Empty;
    public int          YearsOfExperience { get; set; }
    public List<string> TopSkills         { get; set; } = new();
}

public class PagedResult<T>
{
    public int       Page       { get; set; }
    public int       PageSize   { get; set; }
    public int       TotalCount { get; set; }
    public int       TotalPages => (int)Math.Ceiling((double)TotalCount / PageSize);
    public List<T>   Items      { get; set; } = new();
}
