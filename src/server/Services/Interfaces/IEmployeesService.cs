using Calender_WebApp.Models;

namespace Calender_WebApp.Services.Interfaces
{
    /// <summary>
    /// Contract for managing employee data including authentication and profile operations.
    /// Handles user lifecycle from creation to deletion with password security.
    /// 
    /// Key Operations:
    /// - Email-based employee lookup for login
    /// - Password hashing and conditional updates
    /// - Email uniqueness enforcement
    /// </summary>
    public interface IEmployeesService : ICrudService<EmployeesModel>
    {
        new Task<EmployeesModel> Put(int id, EmployeesModel item);

        // ====================================================================
        // Methods below can be used if the front end needs them
        // ====================================================================

        //Task<List<EmployeesModel>> GetEmployeeByEmailAsync(string email);
    }
}