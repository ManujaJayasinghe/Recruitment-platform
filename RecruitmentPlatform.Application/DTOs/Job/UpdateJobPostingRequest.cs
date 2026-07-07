namespace RecruitmentPlatform.Application.DTOs.Job;

public class UpdateJobPostingRequest
{
    public string       Title          { get; set; } = string.Empty;
    public string       Description    { get; set; } = string.Empty;
    public List<string> RequiredSkills { get; set; } = new();
    public int          MinExperience  { get; set; }
    public Guid         DepartmentId   { get; set; }
}
