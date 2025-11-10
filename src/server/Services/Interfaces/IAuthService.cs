using Calender_WebApp.Models;

namespace Calender_WebApp.Services.Interfaces
{
    public interface IAuthService
    {
        EmployeesModel? ValidateUser(string email, string password);
        string GenerateToken(EmployeesModel user);
    }
}