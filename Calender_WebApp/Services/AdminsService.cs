using Calender_WebApp.Models;
using Calender_WebApp.Services.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace Calender_WebApp.Services;

/// <summary>
/// Service for managing Admin entities.
/// </summary>
public class AdminsService : CrudService<AdminsModel>, IAdminsService
{
    private readonly DatabaseContext _context;

    public AdminsService(DatabaseContext ctx) : base(ctx)
    {
        _context = ctx;
    }

    /// <summary>
    /// Get an admin by their username
    /// </summary>
    /// <param name="username"></param>
    /// <returns>The admin with the specified username.</returns>
    /// <exception cref="InvalidOperationException">Thrown when the admin is not found.</exception>
    public async Task<AdminsModel> GetByUsername(string username)
    {
        return await _context.Admins.FirstOrDefaultAsync(a => a.Username == username).ConfigureAwait(false)
               ?? throw new InvalidOperationException("Admin not found.");
    }

    //Any additional methods specific to Admins can be added here
}