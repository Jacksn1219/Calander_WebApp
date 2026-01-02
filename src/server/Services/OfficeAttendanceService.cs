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

    /// <summary>
    /// Get all attendance records for a specific user
    /// </summary>
    /// <param name="userId"></param>
    /// <returns>A list of attendance records for the specified user.</returns>
    public async Task<List<OfficeAttendanceModel>> GetAttendancesByUserIdAsync(int userId)
    {
        return await _dbSet
            .Where(a => a.UserId == userId)
            .OrderByDescending(a => a.Date)
            .ToListAsync();
    }

    // Add any additional methods specific to OfficeAttendance here if needed
    public async Task<OfficeAttendanceModel> UpsertAttendanceAsync(
    int userId,
    DateTime date,
    AttendanceStatus status)
    {
        // Normalize date (important)
        var normalizedDate = date.Date;

        // Probeer bestaande attendance te vinden
        var existing = await _dbSet
            .FirstOrDefaultAsync(a =>
                a.UserId == userId &&
                a.Date.Date == normalizedDate
            );

        if (existing != null)
        {
            // Update bestaande record
            existing.Status = status;

            _dbSet.Update(existing);
            await _context.SaveChangesAsync();

            return existing;
        }

        // Bestaat nog niet → nieuw record aanmaken
        var newAttendance = new OfficeAttendanceModel
        {
            UserId = userId,
            Date = normalizedDate,
            Status = status
        };

        _dbSet.Add(newAttendance);
        await _context.SaveChangesAsync();

        return newAttendance;
    }
}
