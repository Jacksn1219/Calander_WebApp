using Calender_WebApp.Models;

namespace Calender_WebApp.Services.Interfaces
{
    public interface IEmployeesService : ICrudService<EmployeesModel>
    {
        Task<List<EmployeesModel>> GetEmployeeByEmailAsync(string email);
        new Task<EmployeesModel> Put(int id, EmployeesModel item);
    }
}