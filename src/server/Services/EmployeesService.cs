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
        public override async Task<EmployeesModel> Post(EmployeesModel entity)
        {
            if (entity == null)
                throw new ArgumentNullException(nameof(entity));

			// check for unique email
            var existingEmployee = await _dbSet
                .AsNoTracking()
                .FirstOrDefaultAsync(e => e.Email == entity.Email)
                .ConfigureAwait(false);
            if (existingEmployee != null)
                throw new InvalidOperationException("An employee with the same email already exists.");
            entity.Password = BCrypt.Net.BCrypt.HashPassword(entity.Password);
            return await base.Post(entity).ConfigureAwait(false);
        }
    }
}