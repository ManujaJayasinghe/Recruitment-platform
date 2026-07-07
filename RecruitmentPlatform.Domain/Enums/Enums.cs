namespace RecruitmentPlatform.Domain.Enums;

public enum UserRole
{
    Candidate,
    Recruiter,
    HiringManager,
    Admin
}

public enum JobStatus
{
    Draft,
    Open,
    Closed
}

public enum ApplicationStatus
{
    Applied,
    Screening,
    Shortlisted,
    InterviewScheduled,
    Rejected,
    Hired
}

public enum InterviewStatus
{
    Scheduled,
    Completed,
    Cancelled
}

public enum EvaluationRecommendation
{
    Hire,
    Reject,
    NeedsAnotherRound
}

public enum ProficiencyLevel
{
    Beginner,
    Intermediate,
    Advanced,
    Expert
}
