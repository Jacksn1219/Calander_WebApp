using Calender_WebApp.Models;

namespace Calender_WebApp.Services.Interfaces
{
    /// <summary>
    /// Contract for managing groups with membership-based queries.
    /// Provides standard CRUD operations for group entities and membership-aware retrieval.
    /// 
    /// Key Operations:
    /// - User-based group filtering via membership relationships
    /// </summary>
    public interface IGroupsService : ICrudService<GroupsModel>
    {
        Task<List<GroupsModel>> GetGroupsByUserAsync(int userId);
    }
}