using Calender_WebApp.Models;
using System.Security.Claims;

namespace Calender_WebApp.Services.Interfaces
{
    /// <summary>
    /// Contract for authentication operations including user validation and JWT token generation.
    /// Handles security operations for employee login and session management.
    /// 
    /// Key Operations:
    /// - Email and password validation with BCrypt verification
    /// - JWT token generation with user claims
    /// </summary>
    public interface IAuthService
    {
        EmployeesModel? ValidateUser(string email, string password);
        string GenerateToken(EmployeesModel user);
        ClaimsPrincipal? ValidateToken(string token);
        (string userId, string email, string role, string name)? GetCurrentUser(string authHeader);
    }
}