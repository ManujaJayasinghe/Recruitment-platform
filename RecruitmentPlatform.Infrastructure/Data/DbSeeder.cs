using RecruitmentPlatform.Domain.Entities;
using RecruitmentPlatform.Domain.Enums;

namespace RecruitmentPlatform.Infrastructure.Data;

// Default password for all seeded users: Password123!
public static class DbSeeder
{
    public static async Task SeedAsync(ApplicationDbContext db)
    {
        if (db.Users.Any()) return;

        // ── Users ────────────────────────────────────────────────────────────
        var passwordHash = BCrypt.Net.BCrypt.HashPassword("Password123!");

        var admin = MakeUser("Manuja Jayasinghe", "manuja.jayasinghe@example.com", UserRole.Admin, passwordHash);

        var recruiters = new[]
        {
            MakeUser("Kethmi Warnasooriya",    "kethmi.warnasooriya@example.com",    UserRole.Recruiter, passwordHash),
            MakeUser("Nonimi Dineth",          "nonimi.dineth@example.com",          UserRole.Recruiter, passwordHash),
            MakeUser("Chathuranga Sandaruwan", "chathuranga.sandaruwan@example.com", UserRole.Recruiter, passwordHash),
        };

        var hiringManagers = new[]
        {
            MakeUser("Yathindu Jayawardena", "yathindu.jayawardena@example.com", UserRole.HiringManager, passwordHash),
            MakeUser("Dulaj Serasinghe",     "dulaj.serasinghe@example.com",     UserRole.HiringManager, passwordHash),
        };

        var candidateUsers = new[]
        {
            MakeUser("Naveen Darshana",    "naveen.darshana@example.com",    UserRole.Candidate, passwordHash),
            MakeUser("Heshan Jayakodi",    "heshan.jayakodi@example.com",    UserRole.Candidate, passwordHash),
            MakeUser("Thilina Weerasinghe","thilina.weerasinghe@example.com", UserRole.Candidate, passwordHash),
            MakeUser("Ishara Gunawardena", "ishara.gunawardena@example.com",  UserRole.Candidate, passwordHash),
            MakeUser("Sachini Perera",     "sachini.perera@example.com",      UserRole.Candidate, passwordHash),
            MakeUser("Ravindu Fernando",   "ravindu.fernando@example.com",    UserRole.Candidate, passwordHash),
            MakeUser("Tharushi Abeysekara","tharushi.abeysekara@example.com", UserRole.Candidate, passwordHash),
            MakeUser("Nipun Rathnayake",   "nipun.rathnayake@example.com",    UserRole.Candidate, passwordHash),
        };

        await db.Users.AddRangeAsync(new[] { admin }.Concat(recruiters).Concat(hiringManagers).Concat(candidateUsers));

        // ── Organizations & Departments ──────────────────────────────────────
        var orgTech = new Organization { Id = NewId(), Name = "TechCorp", Industry = "Software", CreatedAt = Now() };
        var orgFinance = new Organization { Id = NewId(), Name = "FinanceHub", Industry = "Finance", CreatedAt = Now() };

        var deptEngineering  = new Department { Id = NewId(), Name = "Engineering",       OrganizationId = orgTech.Id };
        var deptProduct      = new Department { Id = NewId(), Name = "Product",           OrganizationId = orgTech.Id };
        var deptRisk         = new Department { Id = NewId(), Name = "Risk & Compliance", OrganizationId = orgFinance.Id };
        var deptDataAnalysis = new Department { Id = NewId(), Name = "Data Analysis",     OrganizationId = orgFinance.Id };

        await db.Organizations.AddRangeAsync(orgTech, orgFinance);
        await db.Departments.AddRangeAsync(deptEngineering, deptProduct, deptRisk, deptDataAnalysis);

        // ── Candidate Profiles ───────────────────────────────────────────────
        var profiles = new[]
        {
            MakeProfile(candidateUsers[0], new[] { "C#", "ASP.NET Core", "SQL" },           5),
            MakeProfile(candidateUsers[1], new[] { "React", "JavaScript", "CSS" },          3),
            MakeProfile(candidateUsers[2], new[] { "Python", "Machine Learning", "SQL" },   4),
            MakeProfile(candidateUsers[3], new[] { "C#", "Azure", "Docker" },               7),
            MakeProfile(candidateUsers[4], new[] { "Project Management", "Agile", "Jira" }, 6),
            MakeProfile(candidateUsers[5], new[] { "React", "Node.js", "MongoDB" },         2),
            MakeProfile(candidateUsers[6], new[] { "SQL", "Power BI", "Excel" },            4),
            MakeProfile(candidateUsers[7], new[] { "Python", "SQL", "Tableau" },            3),
        };

        await db.CandidateProfiles.AddRangeAsync(profiles);

        // ── Job Postings ─────────────────────────────────────────────────────
        var job1 = MakeJob("Senior C# Developer",      new[] { "C#", "ASP.NET Core", "SQL" },           3, deptEngineering.Id,  recruiters[0].Id);
        var job2 = MakeJob("Frontend React Developer", new[] { "React", "JavaScript", "CSS" },          2, deptEngineering.Id,  recruiters[0].Id);
        var job3 = MakeJob("Product Manager",          new[] { "Project Management", "Agile", "Jira" }, 4, deptProduct.Id,      recruiters[1].Id);
        var job4 = MakeJob("Data Analyst",             new[] { "SQL", "Power BI", "Excel" },            2, deptDataAnalysis.Id, recruiters[2].Id);
        var job5 = MakeJob("Python ML Engineer",       new[] { "Python", "Machine Learning", "SQL" },   3, deptDataAnalysis.Id, recruiters[2].Id);
        var job6 = MakeJob("Risk Analyst",             new[] { "SQL", "Excel", "Risk Management" },     2, deptRisk.Id,         recruiters[1].Id);

        await db.JobPostings.AddRangeAsync(job1, job2, job3, job4, job5, job6);

        // ── Applications ─────────────────────────────────────────────────────
        await db.Applications.AddRangeAsync(
            MakeApplication(job1.Id, profiles[0].Id, ApplicationStatus.Shortlisted,         0.91),
            MakeApplication(job1.Id, profiles[3].Id, ApplicationStatus.InterviewScheduled,  0.85),
            MakeApplication(job2.Id, profiles[1].Id, ApplicationStatus.Screening,           0.88),
            MakeApplication(job2.Id, profiles[5].Id, ApplicationStatus.Applied,             0.72),
            MakeApplication(job3.Id, profiles[4].Id, ApplicationStatus.Shortlisted,         0.94),
            MakeApplication(job4.Id, profiles[6].Id, ApplicationStatus.Hired,               0.96),
            MakeApplication(job5.Id, profiles[2].Id, ApplicationStatus.Screening,           0.83),
            MakeApplication(job5.Id, profiles[7].Id, ApplicationStatus.Rejected,            0.55),
            MakeApplication(job6.Id, profiles[6].Id, ApplicationStatus.Applied,             0.70),
            MakeApplication(job6.Id, profiles[2].Id, ApplicationStatus.Applied,             0.65)
        );

        await db.SaveChangesAsync();
    }

    // ── Helpers ───────────────────────────────────────────────────────────────

    private static User MakeUser(string name, string email, UserRole role, string hash) => new()
    {
        Id           = NewId(),
        FullName     = name,
        Email        = email,
        PasswordHash = hash,
        Role         = role,
        CreatedAt    = Now(),
        IsActive     = true,
    };

    private static CandidateProfile MakeProfile(User user, string[] skills, int years) => new()
    {
        Id                = NewId(),
        UserId            = user.Id,
        Headline          = $"{skills[0]} specialist with {years} years of experience",
        Summary           = $"Experienced professional with a background in {string.Join(", ", skills)}.",
        Skills            = skills.ToList(),
        YearsOfExperience = years,
    };

    private static JobPosting MakeJob(string title, string[] skills, int minExp, Guid deptId, Guid postedBy) => new()
    {
        Id             = NewId(),
        Title          = title,
        Description    = $"We are looking for a {title} to join our team.",
        RequiredSkills = skills.ToList(),
        MinExperience  = minExp,
        DepartmentId   = deptId,
        PostedByUserId = postedBy,
        Status         = JobStatus.Open,
        CreatedAt      = Now(),
    };

    private static Domain.Entities.Application MakeApplication(Guid jobId, Guid profileId, ApplicationStatus status, double score) => new()
    {
        Id                 = NewId(),
        JobPostingId       = jobId,
        CandidateProfileId = profileId,
        Status             = status,
        MatchScore         = score,
        AppliedAt          = Now(),
    };

    private static Guid NewId() => Guid.NewGuid();
    private static DateTime Now() => DateTime.UtcNow;
}
