using Calender_WebApp.Models;

namespace Calender_WebApp.Services.Interfaces
{
    public interface IGroupMembershipsService : ICrudService<GroupMembershipsModel>
    {
        Task<List<GroupMembershipsModel>> GetMembershipsByUserIdAsync(int userId);
        Task<GroupMembershipsModel?> Delete(GroupMembershipsModel entity);
        
        // Add any additional methods specific to GroupMemberships here if needed
    }
}