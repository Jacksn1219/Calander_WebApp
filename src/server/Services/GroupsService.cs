// ====================================================================
// GroupsService became obsolete and is no longer in use.
// The groups controller has been commented out as groups functionality is not used in the frontend
// ====================================================================
// using Calender_WebApp.Models;
// using Calender_WebApp.Services.Interfaces;

// namespace Calender_WebApp.Services;

// /// <summary>
// /// Manages groups with membership-based filtering capabilities.
// /// 
// /// Business Logic:
// /// - Retrieves groups through membership relationships
// /// - Standard CRUD operations inherited from base class
// /// 
// /// Dependencies:
// /// - IGroupMembershipsService for membership lookups
// /// </summary>
// public class GroupsService : CrudService<GroupsModel>, IGroupsService
// {
//     private readonly IGroupMembershipsService _groupMembershipsService;

//     public GroupsService(AppDbContext ctx, IGroupMembershipsService groupMembershipsService) : base(ctx)
//     {
//         _groupMembershipsService = groupMembershipsService;
//     }

//     public async Task<List<GroupsModel>> GetGroupsByUserAsync(int userId)
//     {
//         var memberships = await _groupMembershipsService.GetMembershipsByUserIdAsync(userId);
//         return memberships.Select(m => m.Group).Where(g => g != null).ToList()!;
//     }
// }