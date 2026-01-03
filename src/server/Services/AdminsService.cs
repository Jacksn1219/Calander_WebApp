using Calender_WebApp.Models;
using Calender_WebApp.Services.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace Calender_WebApp.Services;

/// <summary>
/// Manages admin records with username-based authentication operations.
/// 
/// Business Logic:
/// - Validates admin existence by username through related Employee entity
/// - Throws exceptions when admin not found for authentication scenarios
/// 
/// Dependencies:
/// - Inherits standard CRUD from CrudService base class
/// </summary>
public class AdminsService : CrudService<AdminsModel>, IAdminsService
{
    public AdminsService(AppDbContext ctx) : base(ctx) { }

    public async Task<AdminsModel> GetByUsername(string username)
    {
        return await _dbSet.FirstOrDefaultAsync(a => a.Employee != null && a.Employee.Name == username).ConfigureAwait(false)
              ?? throw new InvalidOperationException("Admin not found.");
    }
}