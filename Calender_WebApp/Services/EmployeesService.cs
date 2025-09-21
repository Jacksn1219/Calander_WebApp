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
        private readonly DatabaseContext _context;

        public EmployeesService(DatabaseContext ctx) : base(ctx)
        {
            _context = ctx;
        }

        /// <summary>
        /// Gets an employee by their email address.
        /// </summary>
        /// <param name="email">The employee's email.</param>
        /// <returns>The employee if found; otherwise, null.</returns>
        public async Task<EmployeesModel> GetEmployeeByEmailAsync(string email)
        {
            return await _dbSet
                .AsNoTracking()
                .FirstOrDefaultAsync(e => e.Email == email)
                ?? throw new InvalidOperationException("Employee not found.");
        }

        // Add additional services that are not related to CRUD here
    }
}