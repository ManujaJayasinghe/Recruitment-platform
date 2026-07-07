using RecruitmentPlatform.Domain.Entities;

namespace RecruitmentPlatform.Domain.Interfaces;

public interface IUnitOfWork : IDisposable
{
    IRepository<User>             Users             { get; }
    IRepository<CandidateProfile> CandidateProfiles { get; }
    IRepository<JobPosting>       JobPostings       { get; }
    IRepository<Application>      Applications      { get; }
    IRepository<Interview>        Interviews        { get; }
    IRepository<Evaluation>       Evaluations       { get; }
    IRepository<Organization>     Organizations     { get; }
    IRepository<Department>       Departments       { get; }
    IRepository<SkillAssessment>  SkillAssessments  { get; }
    IRepository<Message>          Messages          { get; }

    Task<int> SaveChangesAsync();
}
