using Calender_WebApp.Models;
using Calender_WebApp.Services.Interfaces;
using Microsoft.EntityFrameworkCore;
// new 
namespace Calender_WebApp.Services;

/// <summary>
/// Service for managing Group Membership entities.
/// </summary>
public class GroupMembershipsService : IGroupMembershipsService
{
    private readonly AppDbContext _context;
    private readonly DbSet<GroupMembershipsModel> _dbSet;

    public GroupMembershipsService(AppDbContext ctx)
    {
        _context = ctx ?? throw new ArgumentNullException(nameof(ctx));
        _dbSet = _context.Set<GroupMembershipsModel>();
    }

    /// <summary>
    /// Covers the Delete method from CrudService, but is not supported.
    /// </summary>
    /// <param name="id"></param>
    /// <returns>This method is not supported.</returns>
    /// <exception cref="NotSupportedException">Direct access by ID is not supported for GroupMemberships. Use GetMembershipsByUserIdAsync instead.</exception>
    public Task<GroupMembershipsModel> Delete(int id)
        => throw new NotSupportedException("Use Delete(GroupMembershipsModel entity) to remove a user from a group.");

    /// <summary>
    /// Removes a user from a group based on the provided entity details.
    /// </summary>
    /// <param name="entity"></param>
    /// <returns>The deleted group membership entity.</returns>
    /// <exception cref="InvalidOperationException">Thrown when the membership is not found.</exception>
    public async Task<GroupMembershipsModel> Delete(GroupMembershipsModel entity)
    {
        var membership = await _dbSet
            .FirstOrDefaultAsync(gm => gm.UserId == entity.UserId && gm.GroupId == entity.GroupId);

        if (membership == null)
            throw new InvalidOperationException("Membership not found.");

        _dbSet.Remove(membership);
        await _context.SaveChangesAsync();
        return membership;
    }

    /// <summary>
    /// Gets all entities of type GroupMembershipsModel.
    /// </summary>
    /// <returns>List of GroupMembershipsModel</returns>
    public virtual async Task<GroupMembershipsModel[]> Get()
    {
        return await _dbSet.AsNoTracking().ToArrayAsync().ConfigureAwait(false);
    }

    /// <summary>
    /// Covers the GetById method from CrudService, but is not supported.
    /// </summary>
    /// <param name="id"></param>
    /// <returns>This method is not supported.</returns>
    /// <exception cref="NotSupportedException">Direct access by ID is not supported for GroupMemberships. Use GetMembershipsByUserIdAsync instead.</exception>
    public Task<GroupMembershipsModel> GetById(int id)
        => throw new NotSupportedException("Direct access by ID is not supported for GroupMemberships. Use GetMembershipsByUserIdAsync instead.");

    /// <summary>
    /// Adds a new group membership if the user is not already a member of the group.
    /// </summary>
    /// <param name="entity">The group membership entity to add.</param>
    /// <returns>The added group membership entity, or null if the membership already exists.</returns>
    /// <exception cref="InvalidOperationException">Thrown when the membership already exists.</exception>
    public async Task<GroupMembershipsModel> Post(GroupMembershipsModel entity)
    {
        var exists = await _dbSet
            .AnyAsync(gm => gm.UserId == entity.UserId && gm.GroupId == entity.GroupId);

        if (exists)
            throw new InvalidOperationException("Membership already exists.");

        var entry = await _dbSet.AddAsync(entity).ConfigureAwait(false);
        await _context.SaveChangesAsync();
        return entry.Entity;
    }

    /// <summary>
    /// Covers the Put method from CrudService, but is not supported.
    /// </summary>
    /// <param name="entity"></param>
    /// <returns>This method is not supported.</returns>
    /// <exception cref="NotSupportedException">Updating group memberships is not supported.</exception>
    public Task<GroupMembershipsModel> Put(int id, GroupMembershipsModel entity)
        => throw new NotSupportedException("Updating group memberships is not supported. Use Post/Delete to add/remove memberships.");

    /// <summary>
    /// Get all group memberships for a specific user.
    /// </summary>
    /// <param name="userId"></param>
    /// <returns>A list of group memberships for the specified user.</returns>
    public async Task<List<GroupMembershipsModel>> GetMembershipsByUserIdAsync(int userId)
    {
        return await _dbSet
            .AsNoTracking()
            .Where(gm => gm.UserId == userId)
            .ToListAsync();
    }

    // Add additional services that are not related to CRUD here
}