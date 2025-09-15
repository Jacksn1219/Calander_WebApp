using Calender_WebApp.Models;
using Calender_WebApp.Services.Interfaces;

namespace Calender_WebApp.Services;

/// <summary>
/// Service for managing groups, including CRUD and custom operations.
/// </summary>
public class GroupsService : CrudService<GroupsModel>, IGroupsService
{
    private readonly DatabaseContext _context;
    private readonly IGroupMembershipsService _groupMembershipsService;

    public GroupsService(DatabaseContext ctx, IGroupMembershipsService groupMembershipsService) : base(ctx)
    {
        _context = ctx ?? throw new ArgumentNullException(nameof(ctx));
        _groupMembershipsService = groupMembershipsService ?? throw new ArgumentNullException(nameof(groupMembershipsService));
    }

    /// <summary>
    /// Gets all groups for a specific user.
    /// </summary>
    /// <param name="userId">The user's ID.</param>
    /// <returns>List of groups.</returns>
    public async Task<List<GroupsModel>> GetGroupsByUserAsync(int userId)
    {
        var memberships = await _groupMembershipsService.GetMembershipsByUserIdAsync(userId);
        return memberships.Select(m => m.Group).ToList();
    }

    // Add additional services that are not related to CRUD here
}