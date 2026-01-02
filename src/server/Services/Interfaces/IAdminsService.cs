using Calender_WebApp.Models;

namespace Calender_WebApp.Services.Interfaces
{
    public interface IAdminsService : ICrudService<AdminsModel>
    {
        Task<AdminsModel> GetByUsername(string username);
    }
}