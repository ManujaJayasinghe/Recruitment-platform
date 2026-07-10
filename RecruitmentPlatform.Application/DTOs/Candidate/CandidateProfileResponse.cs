namespace RecruitmentPlatform.Application.DTOs.Candidate;

public class CandidateProfileResponse
{
    public Guid         ProfileId         { get; set; }
    public Guid         UserId            { get; set; }
    public string       FullName          { get; set; } = string.Empty;
    public string       Email             { get; set; } = string.Empty;
    public string       Headline          { get; set; } = string.Empty;
    public string       Summary           { get; set; } = string.Empty;
    public List<string> Skills            { get; set; } = new();
    public int          YearsOfExperience { get; set; }
    public string?      ResumeFileUrl     { get; set; }
}
