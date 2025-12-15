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
        _reminderPreferencesService = reminderPreferencesService;
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

    /// <summary>
    /// Creates a new reminder, adjusting the ReminderTime based on user preferences.
    /// If the corresponding preference is disabled, the reminder is marked as read.
    /// </summary>
    public override async Task<RemindersModel> Post(RemindersModel model)
    {
        if (model == null) throw new ArgumentNullException(nameof(model));

        // Get user's reminder preferences
        var preferences = await _reminderPreferencesService.GetByUserId(model.UserId).ConfigureAwait(false);
        var userPreference = preferences.FirstOrDefault();

        if (userPreference != null)
        {
            // Subtract the advance time from the reminder time
            model.ReminderTime = model.ReminderTime.Subtract(userPreference.ReminderAdvanceMinutes);

            // Check if the preference for this reminder type is enabled
            bool isPreferenceEnabled = model.ReminderType switch
            {
                reminderType.EventParticipation => userPreference.EventReminder,
                reminderType.RoomBooking => userPreference.BookingReminder,
                reminderType.EventParticipationChanged => userPreference.EventReminder,
                reminderType.RoomBookingChanged => userPreference.BookingReminder,
                _ => true
            };

            // If preference is disabled, mark the reminder as already read
            if (!isPreferenceEnabled)
            {
                model.IsRead = true;
            }
        }

        // Call base Post method to handle validation and database insertion
        return await base.Post(model).ConfigureAwait(false);
    }

    // Add additional services that are not related to CRUD here
}
