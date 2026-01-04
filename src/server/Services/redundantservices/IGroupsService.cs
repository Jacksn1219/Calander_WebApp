// ====================================================================
// IGroupsService became obsolete and is no longer in use.
// The groups controller has been commented out as groups functionality is not used in the frontend
// ====================================================================
// using Calender_WebApp.Models;

// namespace Calender_WebApp.Services.Interfaces
// {
//     /// <summary>
//     /// Contract for managing groups with membership-based queries.
//     /// Provides standard CRUD operations for group entities and membership-aware retrieval.
//     /// 
//     /// Key Operations:
//     /// - User-based group filtering via membership relationships
//     /// </summary>
//     public interface IGroupsService : ICrudService<GroupsModel>
//     {
//         Task<List<GroupsModel>> GetGroupsByUserAsync(int userId);
//     }
// }