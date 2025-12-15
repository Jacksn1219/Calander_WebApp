using Calender_WebApp.Models;
using Calender_WebApp.Services.Interfaces;

namespace Calender_WebApp.Services;

/// <summary>
/// Service for managing groups, including CRUD and custom operations.
/// </summary>
public class GroupsService : CrudService<GroupsModel>, IGroupsService
{
    private readonly IGroupMembershipsService _groupMembershipsService;

    public GroupsService(AppDbContext ctx, IGroupMembershipsService groupMembershipsService) : base(ctx)
    {
        _groupMembershipsService = groupMembershipsService;
    }

    /// <summary>
    /// Get all groups a user is a member of
    /// </summary>
    /// <param name="userId"></param>
    /// <returns>A list of groups the user is a member of.</returns>
    public async Task<List<GroupsModel>> GetGroupsByUserAsync(int userId)
    {
        var memberships = await _groupMembershipsService.GetMembershipsByUserIdAsync(userId);
        return memberships.Select(m => m.Group).Where(g => g != null).ToList()!;
    }

    // Add additional services that are not related to CRUD here
}