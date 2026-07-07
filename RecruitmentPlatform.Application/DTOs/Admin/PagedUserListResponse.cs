namespace RecruitmentPlatform.Application.DTOs.Admin;

public class PagedUserListResponse
{
    public List<UserListResponse> Users      { get; set; } = new();
    public int                    Page       { get; set; }
    public int                    PageSize   { get; set; }
    public int                    TotalCount { get; set; }
    public int                    TotalPages { get; set; }
}
