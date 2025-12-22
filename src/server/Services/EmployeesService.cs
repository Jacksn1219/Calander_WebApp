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

        public override async Task<EmployeesModel> Put(int id, EmployeesModel item)
        {
            if (item == null)
                throw new ArgumentNullException(nameof(item));
            
            var existingEmployee = await _dbSet
                .FirstOrDefaultAsync(e => e.Id == id)
                .ConfigureAwait(false);
            if (existingEmployee == null)
                throw new InvalidOperationException("Employee not found.");

            // Check for unique email
            var emailOwner = await _dbSet
                .AsNoTracking()
                .FirstOrDefaultAsync(e => e.Email == item.Email && e.Id != id)
                .ConfigureAwait(false);
            if (emailOwner != null)
                throw new InvalidOperationException("An employee with the same email already exists.");

            // Update fields
            existingEmployee.Name = item.Name;
            existingEmployee.Email = item.Email;
            existingEmployee.Role = item.Role;

            // Update password only if a non-empty new password is provided and it's different
            if (!string.IsNullOrWhiteSpace(item.Password))
            {

                if (!BCrypt.Net.BCrypt.Verify(item.Password, existingEmployee.Password))
                {
                    existingEmployee.Password = BCrypt.Net.BCrypt.HashPassword(item.Password);
                }
            }
            
            _dbSet.Update(existingEmployee);
            await _context.SaveChangesAsync().ConfigureAwait(false);
            return existingEmployee;
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