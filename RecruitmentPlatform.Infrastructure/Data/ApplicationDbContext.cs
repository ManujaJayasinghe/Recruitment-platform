using Microsoft.EntityFrameworkCore;
using RecruitmentPlatform.Domain.Entities;

namespace RecruitmentPlatform.Infrastructure.Data;

using DomainApplication = RecruitmentPlatform.Domain.Entities.Application;

public class ApplicationDbContext : DbContext
{
    public ApplicationDbContext(DbContextOptions<ApplicationDbContext> options)
        : base(options)
    {
    }

    public DbSet<User> Users => Set<User>();
    public DbSet<CandidateProfile> CandidateProfiles => Set<CandidateProfile>();
    public DbSet<Organization> Organizations => Set<Organization>();
    public DbSet<Department> Departments => Set<Department>();
    public DbSet<JobPosting> JobPostings => Set<JobPosting>();
    public DbSet<DomainApplication> Applications => Set<DomainApplication>();
    public DbSet<Interview> Interviews => Set<Interview>();
    public DbSet<Evaluation> Evaluations => Set<Evaluation>();
    public DbSet<SkillAssessment> SkillAssessments => Set<SkillAssessment>();
    public DbSet<Message> Messages => Set<Message>();
    public DbSet<SmsLog>  SmsLogs  => Set<SmsLog>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        // User - unique email index
        modelBuilder.Entity<User>()
            .HasIndex(u => u.Email)
            .IsUnique();

        // User 1-to-1 CandidateProfile
        modelBuilder.Entity<User>()
            .HasOne(u => u.CandidateProfile)
            .WithOne(cp => cp.User)
            .HasForeignKey<CandidateProfile>(cp => cp.UserId)
            .OnDelete(DeleteBehavior.Restrict);

        // User (Recruiter) 1-to-many JobPosting
        modelBuilder.Entity<User>()
            .HasMany(u => u.JobPostings)
            .WithOne(jp => jp.PostedByUser)
            .HasForeignKey(jp => jp.PostedByUserId)
            .OnDelete(DeleteBehavior.Restrict);

        // User 1-to-many Evaluation (as evaluator)
        modelBuilder.Entity<User>()
            .HasMany(u => u.Evaluations)
            .WithOne(e => e.EvaluatorUser)
            .HasForeignKey(e => e.EvaluatorUserId)
            .OnDelete(DeleteBehavior.Restrict);

        // Organization 1-to-many Department
        modelBuilder.Entity<Organization>()
            .HasMany(o => o.Departments)
            .WithOne(d => d.Organization)
            .HasForeignKey(d => d.OrganizationId)
            .OnDelete(DeleteBehavior.Restrict);

        // Department 1-to-many JobPosting
        modelBuilder.Entity<Department>()
            .HasMany(d => d.JobPostings)
            .WithOne(jp => jp.Department)
            .HasForeignKey(jp => jp.DepartmentId)
            .OnDelete(DeleteBehavior.Restrict);

        // JobPosting 1-to-many Application
        modelBuilder.Entity<JobPosting>()
            .HasMany(jp => jp.Applications)
            .WithOne(a => a.JobPosting)
            .HasForeignKey(a => a.JobPostingId)
            .OnDelete(DeleteBehavior.Restrict);

        // CandidateProfile 1-to-many Application
        modelBuilder.Entity<CandidateProfile>()
            .HasMany(cp => cp.Applications)
            .WithOne(a => a.CandidateProfile)
            .HasForeignKey(a => a.CandidateProfileId)
            .OnDelete(DeleteBehavior.Restrict);

        // Application 1-to-1 Interview (nullable)
        modelBuilder.Entity<DomainApplication>()
            .HasOne(a => a.Interview)
            .WithOne(i => i.Application)
            .HasForeignKey<Interview>(i => i.ApplicationId)
            .IsRequired(false)
            .OnDelete(DeleteBehavior.Restrict);

        // Interview 1-to-many Evaluation
        modelBuilder.Entity<Interview>()
            .HasMany(i => i.Evaluations)
            .WithOne(e => e.Interview)
            .HasForeignKey(e => e.InterviewId)
            .OnDelete(DeleteBehavior.Restrict);

        // CandidateProfile 1-to-many SkillAssessment
        modelBuilder.Entity<CandidateProfile>()
            .HasMany(cp => cp.SkillAssessments)
            .WithOne(sa => sa.CandidateProfile)
            .HasForeignKey(sa => sa.CandidateProfileId)
            .OnDelete(DeleteBehavior.Restrict);

        // Application 1-to-many Message
        modelBuilder.Entity<DomainApplication>()
            .HasMany(a => a.Messages)
            .WithOne(m => m.Application)
            .HasForeignKey(m => m.ApplicationId)
            .OnDelete(DeleteBehavior.Restrict);

        // User 1-to-many Message (as sender)
        modelBuilder.Entity<User>()
            .HasMany(u => u.Messages)
            .WithOne(m => m.SenderUser)
            .HasForeignKey(m => m.SenderUserId)
            .OnDelete(DeleteBehavior.Restrict);

        // Store List<string> as comma-separated strings
        modelBuilder.Entity<CandidateProfile>()
            .Property(cp => cp.Skills)
            .HasConversion(
                v => string.Join(',', v),
                v => v.Split(',', StringSplitOptions.RemoveEmptyEntries).ToList());

        modelBuilder.Entity<JobPosting>()
            .Property(jp => jp.RequiredSkills)
            .HasConversion(
                v => string.Join(',', v),
                v => v.Split(',', StringSplitOptions.RemoveEmptyEntries).ToList());
    }
}
