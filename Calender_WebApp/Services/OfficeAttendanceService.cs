namespace Calender_WebApp.Services;

/// <summary>
/// Service for managing Office Attendance entities.
/// </summary>
public class OfficeAttendanceService : CrudService<OfficeAttendanceModel>, IOfficeAttendanceService
{
    private readonly DatabaseContext _context;

    public OfficeAttendanceService(DatabaseContext ctx) : base(ctx)
    {
        _context = ctx;
    }

    /// <summary>
    /// Get attendance for a specific user on a specific date
    /// </summary>
    /// <param name="userId"></param>
    /// <param name="date"></param>
    /// <returns></returns>
    public async Task<OfficeAttendanceModel?> GetAttendanceByUserAndDateAsync(int userId, DateTime date)
    {
        return await _context.OfficeAttendances
            .FirstOrDefaultAsync(a => a.UserId == userId && a.Date.Date == date.Date);
    }

    /// <summary>
    /// Get all attendances for a specific date
    /// </summary>
    /// <param name="date"></param>
    /// <returns></returns>
    public async Task<List<OfficeAttendanceModel>> GetAttendancesByDateAsync(DateTime date)
    {
        return await _context.OfficeAttendances
            .Where(a => a.Date.Date == date.Date)
            .ToListAsync();
    }

    /// <summary>
    /// Marks attendance for a user on a specific date
    /// </summary>
    /// <param name="userId"></param>
    /// <param name="date"></param>
    /// <returns></returns>
    public async Task<bool> MarkAttendanceAsync(int userId, DateTime date)
    {
        var existing = await GetAttendanceByUserAndDateAsync(userId, date);
        if (existing != null)
            return false; // Already marked

        var attendance = new OfficeAttendanceModel
        {
            UserId = userId,
            Date = date,
            // Set other properties as needed
        };

        _context.OfficeAttendances.Add(attendance);
        await _context.SaveChangesAsync();
        return true;
    }
}