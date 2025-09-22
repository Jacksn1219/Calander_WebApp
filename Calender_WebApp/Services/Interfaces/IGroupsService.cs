using Calender_WebApp.Models;

namespace Calender_WebApp.Services.Interfaces
{
    public interface IGroupsService : ICrudService<GroupsModel>
    {
        Task<List<GroupsModel>> GetGroupsByUserAsync(int userId);

        // Add any additional methods specific to Groups here if needed
    }
}