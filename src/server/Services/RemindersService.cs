using Calender_WebApp.Models;
using Calender_WebApp.Services.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace Calender_WebApp.Services;

/// <summary>
/// Service for managing reminders, including CRUD and custom operations.
/// </summary>
public class RemindersService : CrudService<RemindersModel>, IRemindersService
{
    private readonly IReminderPreferencesService _reminderPreferencesService;

    public RemindersService(AppDbContext ctx, IReminderPreferencesService reminderPreferencesService) : base(ctx) 
    { 
        _reminderPreferencesService = reminderPreferencesService ?? throw new ArgumentNullException(nameof(reminderPreferencesService));
    }

    /// <summary>
    /// Creates a new reminder. Checks user preferences and sets isRead to true if the user has disabled that type of reminder.
    /// </summary>
    public override async Task<RemindersModel> Post(RemindersModel model)
    {
        if (model == null) throw new ArgumentNullException(nameof(model));

        // Check user preferences
        var userPreferences = await _reminderPreferencesService.GetByUserId(model.UserId).ConfigureAwait(false);
        var preference = userPreferences.FirstOrDefault();

        // If user has preferences and the specific reminder type is disabled, mark as read immediately
        if (preference != null)
        {
            bool shouldMarkAsRead = model.ReminderType switch
            {
                reminderType.EventParticipation => !preference.EventReminder,
                reminderType.RoomBooking => !preference.BookingReminder,
                _ => false
            };

            if (shouldMarkAsRead)
            {
                model.IsRead = true;
            }
        }

        return await base.Post(model).ConfigureAwait(false);
    }

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
            .Where(r => r.UserId == userId && r.ReminderTime >= fromTime && r.ReminderTime <= toTime && !r.IsRead)
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

    public async Task<bool> MarkReminderAsReadAsync(int reminderId)
    {
        var reminder = await _dbSet.FindAsync(reminderId);
        if (reminder == null)
            return false;

        reminder.IsRead = true;
        await _context.SaveChangesAsync();
        return true;
    }

    // Add additional services that are not related to CRUD here
}
