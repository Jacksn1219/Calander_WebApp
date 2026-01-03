using Calender_WebApp.Models;

namespace Calender_WebApp.Services.Interfaces
{
    /// <summary>
    /// Contract for managing admin records with username-based authentication operations.
    /// Handles admin entity CRUD operations inherited from ICrudService.
    /// 
    /// Key Operations:
    /// - Username-based admin lookup for authentication
    /// </summary>
    public interface IAdminsService : ICrudService<AdminsModel>
    {
        Task<AdminsModel> GetByUsername(string username);
    }
}