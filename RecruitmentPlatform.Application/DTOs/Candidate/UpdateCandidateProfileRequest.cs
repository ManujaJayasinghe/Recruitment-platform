namespace RecruitmentPlatform.Application.DTOs.Candidate;

public class UpdateCandidateProfileRequest
{
    public string       Headline          { get; set; } = string.Empty;
    public string       Summary           { get; set; } = string.Empty;
    public List<string> Skills            { get; set; } = new();
    public int          YearsOfExperience { get; set; }
}
