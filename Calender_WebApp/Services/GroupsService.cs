namespace Calender_WebApp.Services;

/// <summary>
/// Service for managing groups, including CRUD and custom operations.
/// </summary>
public class GroupsService : CrudService<GroupModel>, IGroupService
{
    private readonly DatabaseContext _context;

    public GroupsService(DatabaseContext ctx) : base(ctx)
    {
        _context = ctx ?? throw new ArgumentNullException(nameof(ctx));
    }

    /// <summary>
    /// Gets all groups for a specific user.
    /// </summary>
    /// <param name="userId">The user's ID.</param>
    /// <returns>List of groups.</returns>
    public async Task<List<GroupModel>> GetGroupsByUserAsync(Guid userId)
    {
        if (userId == Guid.Empty)
            throw new ArgumentException("User ID cannot be empty.", nameof(userId));

        return await _context.Groups
            .Where(g => g.Users.Any(u => u.Id == userId))
            .ToListAsync();
    }

    // Add additional services that are not related to CRUD here
}