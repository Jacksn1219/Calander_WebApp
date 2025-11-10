using Calender_WebApp.Models;
using Calender_WebApp.Services.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace Calender_WebApp.Services
{
    /// <summary>
    /// Service for managing Employee entities.
    /// </summary>
    public class EmployeesService : CrudService<EmployeesModel>, IEmployeesService
    {
        public EmployeesService(AppDbContext ctx) : base(ctx) { }

        /// <summary>
        /// returns an list of employees with the same email address.
        /// </summary>
        /// <param name="email">The employee's email.</param>
        /// <returns>The employee if found; otherwise, null.</returns>

        public async Task<List<EmployeesModel>> GetEmployeeByEmailAsync(string email)
        {
            return await _dbSet
                .AsNoTracking()
                .Where(e => e.Email == email)
                .ToListAsync();
        }

        // Add additional services that are not related to CRUD here
    }
}