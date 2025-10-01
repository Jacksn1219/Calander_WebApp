using Calender_WebApp.Models;
using Calender_WebApp.Services.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace Calender_WebApp.Services;

/// <summary>
/// Service for managing Office Attendance entities.
/// </summary>
public class OfficeAttendanceService : CrudService<OfficeAttendanceModel>, IOfficeAttendanceService
{
    public OfficeAttendanceService(AppDbContext ctx) : base(ctx) { }

    /// <summary>
    /// Get attendance for a specific user on a specific date
    /// </summary>
    /// <param name="userId"></param>
    /// <param name="date"></param>
    /// <returns>The attendance record for the specified user and date.</returns>
    /// <exception cref="InvalidOperationException">Thrown when the attendance record is not found.</exception>
    public async Task<OfficeAttendanceModel> GetAttendanceByUserAndDateAsync(int userId, DateTime date)
    {
        return await _dbSet
            .FirstOrDefaultAsync(a => a.UserId == userId && a.Date.Date == date.Date)
            ?? throw new InvalidOperationException("Attendance not found.");
    }

    /// <summary>
    /// Get all attendance records for a specific date
    /// </summary>
    /// <param name="date"></param>
    /// <returns>A list of attendance records for the specified date.</returns>
    public async Task<List<OfficeAttendanceModel>> GetAttendancesByDateAsync(DateTime date)
    {
        return await _dbSet
            .Where(a => a.Date.Date == date.Date)
            .ToListAsync();
    }

    // Add any additional methods specific to OfficeAttendance here if needed
}