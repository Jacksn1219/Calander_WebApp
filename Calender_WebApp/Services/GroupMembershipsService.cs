using Calender_WebApp.Models;
using Calender_WebApp.Services.Interfaces;

namespace Calender_WebApp.Services;

/// <summary>
/// Service for managing Group Membership entities.
/// </summary>
public class GroupMembershipsService : CrudService<GroupMembershipsModel>, IGroupMembershipsService
{
    private readonly DatabaseContext _context;

    public GroupMembershipsService(DatabaseContext ctx) : base(ctx)
    {
        _context = ctx;
    }

    /// <summary>
    /// Get all group memberships for a specific user
    /// </summary>
    /// <param name="userId"></param>
    /// <returns></returns>
    public async Task<List<GroupMembershipsModel>> GetMembershipsByUserIdAsync(int userId)
    {
        return await _context.GroupMemberships
            .AsNoTracking()
            .Where(gm => gm.UserId == userId)
            .ToListAsync();
    }

    /// <summary>
    /// Adds a new group membership if the user is not already a member of the group.
    /// </summary>
    /// <param name="entity">The group membership entity to add.</param>
    /// <returns>The added group membership entity, or null if the membership already exists.</returns>
    public override async Task<GroupMembershipsModel> Post(GroupMembershipsModel entity)
    {
        var exists = await _context.GroupMemberships
            .AnyAsync(gm => gm.UserId == entity.UserId && gm.GroupId == entity.GroupId);

        if (exists)
            return null!;

        _context.GroupMemberships.Add(entity);
        await _context.SaveChangesAsync();
        return entity;
    }

    /// <summary>
    /// Removes a user from a group.
    /// Use Delete(int id) to delete entire Group.
    /// </summary>
    /// <param name="userId"></param>
    /// <param name="groupId"></param>
    /// <returns></returns>
    public async Task<GroupMembershipsModel?> Delete(GroupMembershipsModel entity)
    {
        var membership = await _context.GroupMemberships
            .FirstOrDefaultAsync(gm => gm.UserId == entity.UserId && gm.GroupId == entity.GroupId);

        if (membership == null)
            return null;

        _context.GroupMemberships.Remove(membership);
        await _context.SaveChangesAsync();
        return membership;
    }

    // Add additional services that are not related to CRUD here
}