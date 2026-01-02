using Calender_WebApp.Models;
using Calender_WebApp.Services.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace Calender_WebApp.Services;

/// <summary>
/// Service for managing Admin entities.
/// </summary>
public class AdminsService : CrudService<AdminsModel>, IAdminsService
{
    public AdminsService(AppDbContext ctx) : base(ctx) { }

    /// <summary>
    /// Get an admin by their username
    /// </summary>
    /// <param name="username"></param>
    /// <returns>The admin with the specified username.</returns>
    /// <exception cref="InvalidOperationException">Thrown when the admin is not found.</exception>
    public async Task<AdminsModel> GetByUsername(string username)
    {
        return await _dbSet.FirstOrDefaultAsync(a => a.Employee != null && a.Employee.Name == username).ConfigureAwait(false)
              ?? throw new InvalidOperationException("Admin not found.");
    }
}