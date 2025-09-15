using Calender_WebApp.Models;
using Calender_WebApp.Services.Interfaces;

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

    // Add any additional methods specific to OfficeAttendance here if needed
}