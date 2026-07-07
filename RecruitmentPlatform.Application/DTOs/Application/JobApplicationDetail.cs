namespace RecruitmentPlatform.Application.DTOs.Application;

public class JobApplicationDetail
{
    public Guid         ApplicationId      { get; set; }
    public Guid         CandidateProfileId { get; set; }
    public string       CandidateName      { get; set; } = string.Empty;
    public string       CandidateEmail     { get; set; } = string.Empty;
    public string       Headline           { get; set; } = string.Empty;
    public int          YearsOfExperience  { get; set; }
    public List<string> TopSkills          { get; set; } = new();
    public string       Status             { get; set; } = string.Empty;
    public double?      MatchScore         { get; set; }
    public DateTime     AppliedAt          { get; set; }
}
