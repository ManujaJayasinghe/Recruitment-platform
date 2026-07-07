using RecruitmentPlatform.Domain.Entities;
using RecruitmentPlatform.Domain.Interfaces;
using RecruitmentPlatform.Infrastructure.Data;
using DomainApplication = RecruitmentPlatform.Domain.Entities.Application;

namespace RecruitmentPlatform.Infrastructure.Repositories;

public class UnitOfWork : IUnitOfWork
{
    private readonly ApplicationDbContext _db;

    public IRepository<User>             Users             { get; }
    public IRepository<CandidateProfile> CandidateProfiles { get; }
    public IRepository<JobPosting>       JobPostings       { get; }
    public IRepository<DomainApplication> Applications     { get; }
    public IRepository<Interview>        Interviews        { get; }
    public IRepository<Evaluation>       Evaluations       { get; }
    public IRepository<Organization>     Organizations     { get; }
    public IRepository<Department>       Departments       { get; }
    public IRepository<SkillAssessment>  SkillAssessments  { get; }
    public IRepository<Message>          Messages          { get; }

    public UnitOfWork(ApplicationDbContext db)
    {
        _db               = db;
        Users             = new Repository<User>(db);
        CandidateProfiles = new Repository<CandidateProfile>(db);
        JobPostings       = new Repository<JobPosting>(db);
        Applications      = new Repository<DomainApplication>(db);
        Interviews        = new Repository<Interview>(db);
        Evaluations       = new Repository<Evaluation>(db);
        Organizations     = new Repository<Organization>(db);
        Departments       = new Repository<Department>(db);
        SkillAssessments  = new Repository<SkillAssessment>(db);
        Messages          = new Repository<Message>(db);
    }

    public Task<int> SaveChangesAsync() => _db.SaveChangesAsync();

    public void Dispose() => _db.Dispose();
}
