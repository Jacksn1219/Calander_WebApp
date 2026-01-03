using Calender_WebApp.Models;
using Calender_WebApp.Services.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace Calender_WebApp.Services
{
    /// <summary>
    /// Manages employee CRUD operations with email uniqueness and password security enforcement.
    /// 
    /// Business Logic:
    /// - Validates email uniqueness before creation and updates
    /// - Hashes passwords using BCrypt before storage
    /// - Conditionally updates passwords only when new value provided and different
    /// - Prevents duplicate email addresses across all employees
    /// 
    /// Dependencies:
    /// - BCrypt.Net for password hashing and verification
    /// </summary>
    public class EmployeesService : CrudService<EmployeesModel>, IEmployeesService
    {
        public EmployeesService(AppDbContext ctx) : base(ctx) { }

        public async Task<List<EmployeesModel>> GetEmployeeByEmailAsync(string email)
        {
            return await _dbSet
                .AsNoTracking()
                .Where(e => e.Email == email)
                .ToListAsync();
        }

        /// <summary>
        /// Updates employee data with email uniqueness validation and conditional password hashing.
        /// Only updates password if new value is provided and differs from existing hash.
        /// </summary>
        public override async Task<EmployeesModel> Put(int id, EmployeesModel item)
        {
            if (item == null)
                throw new ArgumentNullException(nameof(item));
            
            var existingEmployee = await _dbSet
                .FirstOrDefaultAsync(e => e.Id == id)
                .ConfigureAwait(false);
            if (existingEmployee == null)
                throw new InvalidOperationException("Employee not found.");

            var emailOwner = await _dbSet
                .AsNoTracking()
                .FirstOrDefaultAsync(e => e.Email == item.Email && e.Id != id)
                .ConfigureAwait(false);
            if (emailOwner != null)
                throw new InvalidOperationException("An employee with the same email already exists.");

            existingEmployee.Name = item.Name;
            existingEmployee.Email = item.Email;
            existingEmployee.Role = item.Role;

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

        /// <summary>
        /// Creates new employee with email uniqueness validation and automatic password hashing.
        /// </summary>
        public override async Task<EmployeesModel> Post(EmployeesModel entity)
        {
            if (entity == null)
                throw new ArgumentNullException(nameof(entity));

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