namespace Calender_WebApp.Services;

/// <summary>
/// Service for managing Admin entities.
/// </summary>
public class AdminsService : CrudService<AdminModel>, IAdminService
{
    private readonly DatabaseContext _context;

    public AdminsService(DatabaseContext ctx) : base(ctx)
    {
        _context = ctx;
    }

    /// <summary>
    /// Gets all admins asynchronously.
    /// </summary>
    public async Task<IEnumerable<AdminModel>> GetAllAdminsAsync()
    {
        return await _context.Admins.AsNoTracking().ToListAsync();
    }

    /// <summary>
    /// Finds an admin by email.
    /// </summary>
    public async Task<AdminModel?> GetAdminByEmailAsync(string email)
    {
        return await _context.Admins.AsNoTracking()
            .FirstOrDefaultAsync(a => a.Email == email);
    }

    /// <summary>
    /// Updates an admin's details.
    /// </summary>
    public async Task<bool> UpdateAdminAsync(AdminModel admin)
    {
        var existing = await _context.Admins.FindAsync(admin.Id);
        if (existing == null) return false;

        existing.Name = admin.Name;
        existing.Email = admin.Email;
        // Update other properties as needed

        await _context.SaveChangesAsync();
        return true;
    }

    /// <summary>
    /// Deletes an admin by id.
    /// </summary>
    public async Task<bool> DeleteAdminAsync(int id)
    {
        var admin = await _context.Admins.FindAsync(id);
        if (admin == null) return false;

        _context.Admins.Remove(admin);
        await _context.SaveChangesAsync();
        return true;
    }
}