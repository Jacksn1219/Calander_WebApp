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
    public async Task<List<GroupMembershipdsModel>> GetMembershipsByUserIdAsync(int userId)
    {
        return await _context.GroupMembershipds
            .AsNoTracking()
            .Where(gm => gm.UserId == userId)
            .ToListAsync();
    }

    /// <summary>
    /// Add a user to a group (if not already a member)
    /// </summary>
    /// <param name="userId"></param>
    /// <param name="groupId"></param>
    /// <returns></returns>
    public async Task<bool> AddUserToGroupAsync(int userId, int groupId)
    {
        var exists = await _context.GroupMembershipds
            .AnyAsync(gm => gm.UserId == userId && gm.GroupId == groupId);

        if (exists)
            return false;

        var membership = new GroupMembershipdsModel
        {
            UserId = userId,
            GroupId = groupId
        };

        _context.GroupMembershipds.Add(membership);
        await _context.SaveChangesAsync();
        return true;
    }

    /// <summary>
    /// Removes a user from a group.
    /// </summary>
    /// <param name="userId"></param>
    /// <param name="groupId"></param>
    /// <returns></returns>
    public async Task<bool> RemoveUserFromGroupAsync(int userId, int groupId)
    {
        var membership = await _context.GroupMembershipds
            .FirstOrDefaultAsync(gm => gm.UserId == userId && gm.GroupId == groupId);

        if (membership == null)
            return false;

        _context.GroupMembershipds.Remove(membership);
        await _context.SaveChangesAsync();
        return true;
    }

    // Add additional services that are not related to CRUD here
}