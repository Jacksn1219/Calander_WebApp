using Calender_WebApp.Models;

namespace Calender_WebApp.Services.Interfaces
{
    public interface IEmployeesService : ICrudService<EmployeesModel>
    {
        Task<EmployeesModel?> GetEmployeeByEmailAsync(string email);

        // Add any additional methods specific to Employees here if needed
    }
}