namespace RecruitmentPlatform.Application.DTOs.Application;

public class ApplicationResponse
{
    public Guid     Id                 { get; set; }
    public Guid     JobPostingId       { get; set; }
    public string   JobTitle           { get; set; } = string.Empty;
    public string   Department         { get; set; } = string.Empty;
    public Guid     CandidateProfileId { get; set; }
    public string   Status             { get; set; } = string.Empty;
    public double?  MatchScore         { get; set; }
    public DateTime AppliedAt          { get; set; }
}
