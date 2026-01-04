// ====================================================================
// GroupMembershipsService became obsolete and is no longer in use.
// The group memberships controller has been commented out as groups functionality is not used in the frontend
// ====================================================================
// using Calender_WebApp.Models;
// using Calender_WebApp.Models.Interfaces;
// using Calender_WebApp.Services.Interfaces;
// using Calender_WebApp.Utils;
// using Microsoft.EntityFrameworkCore;

// namespace Calender_WebApp.Services;

// /// <summary>
// /// Manages user memberships in groups using composite keys (UserId + GroupId).
// /// 
// /// Business Logic:
// /// - Prevents duplicate memberships
// /// - Validates group existence before querying memberships
// /// - Uses composite key deletion instead of ID-based
// /// - Update operations disabled; use Post/Delete to manage memberships
// /// 
// /// Dependencies:
// /// - ModelWhitelistUtil for input validation
// /// </summary>
// public class GroupMembershipsService : IGroupMembershipsService
// {
//     private readonly AppDbContext _context;
//     private readonly DbSet<GroupMembershipsModel> _dbSet;

//     public GroupMembershipsService(AppDbContext ctx)
//     {
//         _context = ctx ?? throw new ArgumentNullException(nameof(ctx));
//         _dbSet = _context.Set<GroupMembershipsModel>();
//     }

//     public Task<GroupMembershipsModel> Delete(int id)
//         => throw new NotSupportedException("Use Delete(GroupMembershipsModel entity) to remove a user from a group.");

//     public async Task<GroupMembershipsModel> Delete(GroupMembershipsModel entity)
//     {
//         var membership = await _dbSet
//             .FirstOrDefaultAsync(gm => gm.UserId == entity.UserId && gm.GroupId == entity.GroupId);

//         if (membership == null)
//             throw new InvalidOperationException("Membership not found.");

//         _dbSet.Remove(membership);
//         await _context.SaveChangesAsync();
//         return membership;
//     }

//     public virtual async Task<GroupMembershipsModel[]> Get()
//     {
//         return await _dbSet.AsNoTracking().ToArrayAsync().ConfigureAwait(false);
//     }

//     public Task<GroupMembershipsModel> GetById(int id)
//         => throw new NotSupportedException("Direct access by ID is not supported for GroupMemberships. Use GetMembershipsByUserIdAsync instead.");

//     /// <summary>
//     /// Creates membership with duplicate prevention.
//     /// Validates input excluding navigation properties (Employee, Group).
//     /// </summary>
//     public async Task<GroupMembershipsModel> Post(GroupMembershipsModel entity)
//     {
//         var exists = await _dbSet
//             .AnyAsync(gm => gm.UserId == entity.UserId && gm.GroupId == entity.GroupId);

//         if (exists)
//             throw new InvalidOperationException("Membership already exists.");

//         var inputDict = typeof(GroupMembershipsModel)
//             .GetProperties()
//             .Where(p => p.Name != nameof(IDbItem.Id) && p.Name != "Employee" && p.Name != "Group")
//             .ToDictionary(p => p.Name, p => p.GetValue(entity) ?? string.Empty);

//         if (!ModelWhitelistUtil.ValidateModelInput(typeof(GroupMembershipsModel).Name, inputDict, out var errors)) {
//             throw new ArgumentException($"Model validation failed: {string.Join(", ", errors)}");
//         }

//         var entry = await _dbSet.AddAsync(entity).ConfigureAwait(false);
//         await _context.SaveChangesAsync();
//         return entry.Entity;
//     }

//     public Task<GroupMembershipsModel> Put(int id, GroupMembershipsModel entity)
//         => throw new NotSupportedException("Updating group memberships is not supported. Use Post/Delete to add/remove memberships.");

//     public async Task<List<GroupMembershipsModel>> GetMembershipsByUserIdAsync(int userId)
//     {
//         return await _dbSet
//             .AsNoTracking()
//             .Where(gm => gm.UserId == userId)
//             .ToListAsync();
//     }

//     /// <summary>
//     /// Validates group existence before retrieving memberships.
//     /// </summary>
//     public async Task<List<GroupMembershipsModel>> GetMembershipsByGroupIdAsync(int groupId)
//     {
//         var groupExists = await _context.Set<GroupsModel>().AnyAsync(g => g.Id == groupId);
//         if (!groupExists)
//             throw new ArgumentException($"Group with ID {groupId} does not exist.");

//         return await _dbSet
//             .AsNoTracking()
//             .Where(gm => gm.GroupId == groupId)
//             .ToListAsync();
//     }

//     public Task<GroupMembershipsModel> Patch(int userId, GroupMembershipsModel newTEntity)
//         => throw new NotSupportedException("Use Post/Delete to add/remove memberships.");
// }