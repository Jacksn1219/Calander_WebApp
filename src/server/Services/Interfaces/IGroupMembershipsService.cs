using Calender_WebApp.Models;

namespace Calender_WebApp.Services.Interfaces
{
    public interface IGroupMembershipsService : ICrudService<GroupMembershipsModel>
    {
        Task<List<GroupMembershipsModel>> GetMembershipsByUserIdAsync(int userId);
        Task<List<GroupMembershipsModel>> GetMembershipsByGroupIdAsync(int groupId);
        Task<GroupMembershipsModel> Delete(GroupMembershipsModel entity);
    }
}