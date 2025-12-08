using Calender_WebApp.Models;
using Calender_WebApp.Services.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace Calender_WebApp.Services;

/// <summary>
/// Service for managing reminders, including CRUD and custom operations.
/// </summary>
public class RemindersService : CrudService<RemindersModel>, IRemindersService
{
    public RemindersService(AppDbContext ctx) : base(ctx) { }

    /// <summary>
    /// Retrieves all reminders for a specific user.
    /// </summary>
    /// <param name="userId">The ID of the user.</param>
    /// <returns>An array of reminders associated with the user.</returns>
    public Task<RemindersModel[]> GetByUserId(int userId)
    {
        return _dbSet
            .Where(r => r.UserId == userId)
            .ToArrayAsync();
    }

    /// <summary>
    /// Retrieves reminders scheduled between the specified time range.
    /// </summary>
    /// <param name="fromTime">The start time of the range.</param>
    /// <param name="toTime">The end time of the range.</param>
    /// <returns>An array of reminders within the specified time range.</returns>
    public Task<RemindersModel[]> GetNextRemindersAsync(int userId, DateTime fromTime, DateTime toTime)
    {
        return _dbSet
            .Where(r => r.UserId == userId && r.ReminderTime >= fromTime && r.ReminderTime <= toTime && !r.IsSent)
            .ToArrayAsync();
    }

    /// <summary>
    /// Retrieves reminders associated with a specific related entity.
    /// </summary>
    /// <param name="relatedEntityId">The ID of the related entity.</param>
    /// <returns>An array of reminders linked to the specified related entity.</returns>
    public Task<RemindersModel[]> GetRemindersByRelatedRoomAsync(int relatedUserId, int relatedRoomId, DateTime bookingDate, TimeSpan startTime)
    {
        return _dbSet
            .Where(r => r.UserId == relatedUserId && r.RelatedRoomId == relatedRoomId && r.ReminderTime.Date == bookingDate.Date && r.ReminderTime.TimeOfDay == startTime)
            .ToArrayAsync();
    }

    public Task<RemindersModel[]> GetRemindersByRelatedEventAsync(int relatedUserId, int relatedEventId)
    {
        return _dbSet
            .Where(r => r.UserId == relatedUserId && r.RelatedEventId == relatedEventId)
            .ToArrayAsync();
    }

    public async Task<RemindersModel> DeleteRoomBookingRemindersAsync(int relatedUserId, int relatedRoomId, DateTime bookingDate, TimeSpan startTime)
    {
        var reminders = await _dbSet
            .Where(r => r.UserId == relatedUserId && r.RelatedRoomId == relatedRoomId && r.ReminderTime.Date == bookingDate.Date && r.ReminderTime.TimeOfDay == startTime)
            .ToListAsync();

        if (reminders.Count == 0)
            return null!;

        _dbSet.RemoveRange(reminders);
        await _context.SaveChangesAsync();

        return reminders.First();
    }

    public async Task<RemindersModel> DeleteEventParticipationRemindersAsync(int relatedUserId, int relatedEventId)
    {
        var reminders = await _dbSet
            .Where(r => r.UserId == relatedUserId && r.RelatedEventId == relatedEventId)
            .ToListAsync();

        if (reminders.Count == 0)
            return null!;

        _dbSet.RemoveRange(reminders);
        await _context.SaveChangesAsync();

        return reminders.First();
    }

    // Add additional services that are not related to CRUD here
}
