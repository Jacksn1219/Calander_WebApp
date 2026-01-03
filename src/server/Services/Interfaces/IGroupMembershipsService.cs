using Calender_WebApp.Models;

namespace Calender_WebApp.Services.Interfaces
{
    /// <summary>
    /// Contract for managing user memberships in groups using composite keys.
    /// Handles many-to-many relationship between employees and groups.
    /// 
    /// Key Operations:
    /// - Duplicate membership prevention
    /// - Composite key deletion (UserId + GroupId)
    /// - Bidirectional membership queries
    /// 
    /// Note: Update operations are disabled; use Post/Delete to manage memberships.
    /// </summary>
    public interface IGroupMembershipsService : ICrudService<GroupMembershipsModel>
    {
        Task<List<GroupMembershipsModel>> GetMembershipsByUserIdAsync(int userId);
        Task<List<GroupMembershipsModel>> GetMembershipsByGroupIdAsync(int groupId);
        Task<GroupMembershipsModel> Delete(GroupMembershipsModel entity);
    }
}