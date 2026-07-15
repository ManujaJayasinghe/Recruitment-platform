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

    /// <summary>
    /// True if a resume has been uploaded. Use GET /api/candidates/me/resume to download.
    /// The raw storage path is intentionally not exposed here — resume access is gated
    /// exclusively through the authenticated API endpoint (security mechanism).
    /// </summary>
    public bool         HasResume         { get; set; }

    public string?      ParsedResumeJson  { get; set; }
}
