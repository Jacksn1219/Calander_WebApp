using Calender_WebApp.Models;
using Calender_WebApp.Services.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace Calender_WebApp.Services;

/// <summary>
/// Manages office attendance records with date normalization and upsert capability.
/// 
/// Business Logic:
/// - Normalizes all dates to midnight (Date.Date) for consistent querying
/// - Implements upsert pattern to prevent duplicate records per user per day
/// - Updates existing record status if found, creates new if not
/// 
/// Dependencies:
/// - Inherits standard CRUD from CrudService base class
/// </summary>
public class OfficeAttendanceService : CrudService<OfficeAttendanceModel>, IOfficeAttendanceService
{
    public OfficeAttendanceService(AppDbContext ctx) : base(ctx) { }

    public async Task<OfficeAttendanceModel> GetAttendanceByUserAndDateAsync(int userId, DateTime date)
    {
        return await _dbSet
            .FirstOrDefaultAsync(a => a.UserId == userId && a.Date.Date == date.Date)
            ?? throw new InvalidOperationException("Attendance not found.");
    }

    public async Task<List<OfficeAttendanceModel>> GetAttendancesByDateAsync(DateTime date)
    {
        return await _dbSet
            .Where(a => a.Date.Date == date.Date)
            .ToListAsync();
    }

    public async Task<List<OfficeAttendanceModel>> GetAttendancesByUserIdAsync(int userId)
    {
        return await _dbSet
            .Where(a => a.UserId == userId)
            .OrderByDescending(a => a.Date)
            .ToListAsync();
    }

    /// <summary>
    /// Creates or updates attendance record for user on specified date.
    /// Updates existing record status if found, creates new record if not.
    /// Prevents duplicate attendance entries per user per day.
    /// </summary>
    public async Task<OfficeAttendanceModel> UpsertAttendanceAsync(
    int userId,
    DateTime date,
    AttendanceStatus status)
    {
        var normalizedDate = date.Date;

        var existing = await _dbSet
            .FirstOrDefaultAsync(a =>
                a.UserId == userId &&
                a.Date.Date == normalizedDate
            );

        if (existing != null)
        {
            existing.Status = status;

            _dbSet.Update(existing);
            await _context.SaveChangesAsync();

            return existing;
        }

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
