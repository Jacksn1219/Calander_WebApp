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
    /// Retrieves unread reminders that are due (ReminderTime has passed).
    /// Only returns reminders where ReminderTime is less than or equal to the current time.
    /// </summary>
    /// <param name="userId">The ID of the user.</param>
    /// <param name="fromTime">The start time of the range (typically DateTime.MinValue).</param>
    /// <param name="toTime">The end time of the range (typically DateTime.UtcNow).</param>
    /// <returns>An array of due reminders that haven't been read yet.</returns>
    public Task<RemindersModel[]> GetNextRemindersAsync(int userId, DateTime fromTime, DateTime toTime)
    {
        return _dbSet
            .Where(r => r.UserId == userId && r.ReminderTime >= fromTime && r.ReminderTime <= toTime && !r.IsRead)
            .ToArrayAsync();
    }

    /// <summary>
    /// Retrieves reminders associated with a specific room booking.
    /// Note: Since reminders are stored with advance time already subtracted, we search by related IDs and approximate time.
    /// </summary>
    /// <param name="relatedUserId">The ID of the user.</param>
    /// <param name="relatedRoomId">The ID of the room.</param>
    /// <param name="bookingDate">The date of the booking.</param>
    /// <param name="startTime">The start time of the booking.</param>
    /// <returns>An array of reminders linked to the specified room booking.</returns>
    public async Task<RemindersModel[]> GetRemindersByRelatedRoomAsync(int relatedUserId, int relatedRoomId, DateTime bookingDate, TimeSpan startTime)
    {
        // Get the user's advance time to calculate the expected reminder time range
        var preferences = await _reminderPreferencesService.GetByUserId(relatedUserId).ConfigureAwait(false);
        var advanceTime = preferences.FirstOrDefault()?.ReminderAdvanceMinutes ?? TimeSpan.Zero;
        
        // Calculate the expected reminder time (booking time - advance time)
        var expectedReminderTime = bookingDate.Add(startTime).Subtract(advanceTime);
        
        // Search with a small time window to account for potential timing differences
        var timeWindowStart = expectedReminderTime.AddMinutes(-5);
        var timeWindowEnd = expectedReminderTime.AddMinutes(5);
        
        return await _dbSet
            .Where(r => r.UserId == relatedUserId && 
                        r.RelatedRoomId == relatedRoomId && 
                        r.ReminderTime >= timeWindowStart && 
                        r.ReminderTime <= timeWindowEnd)
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
        // Get the user's advance time to calculate the expected reminder time range
        var preferences = await _reminderPreferencesService.GetByUserId(relatedUserId).ConfigureAwait(false);
        var advanceTime = preferences.FirstOrDefault()?.ReminderAdvanceMinutes ?? TimeSpan.Zero;
        
        // Calculate the expected reminder time (booking time - advance time)
        var expectedReminderTime = bookingDate.Add(startTime).Subtract(advanceTime);
        
        // Search with a small time window to account for potential timing differences
        var timeWindowStart = expectedReminderTime.AddMinutes(-5);
        var timeWindowEnd = expectedReminderTime.AddMinutes(5);
        
        var reminders = await _dbSet
            .Where(r => r.UserId == relatedUserId && 
                        r.RelatedRoomId == relatedRoomId && 
                        r.ReminderTime >= timeWindowStart && 
                        r.ReminderTime <= timeWindowEnd)
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
            // This is to be implemented when we start using the advance time in the RemindersModel for notification view. For now just have it be the event time.
            // model.ReminderTime = model.ReminderTime.Subtract(userPreference.ReminderAdvanceMinutes);

            // Check if the preference for this reminder type is enabled
            bool isPreferenceEnabled = model.ReminderType switch
            {
                reminderType.EventParticipation => userPreference.EventReminder,
                reminderType.RoomBooking => userPreference.BookingReminder,
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

    /// <summary>
    /// Updates an existing reminder, adjusting the ReminderTime based on user preferences.
    /// If the corresponding preference is disabled, the reminder is marked as read.
    /// </summary>
    public override async Task<RemindersModel> Put(int id, RemindersModel newModel)
    {
        if (newModel == null) throw new ArgumentNullException(nameof(newModel));

        // Get user's reminder preferences
        var preferences = await _reminderPreferencesService.GetByUserId(newModel.UserId).ConfigureAwait(false);
        var userPreference = preferences.FirstOrDefault();

        if (userPreference != null)
        {
            // Subtract the advance time from the reminder time
            newModel.ReminderTime = newModel.ReminderTime.Subtract(userPreference.ReminderAdvanceMinutes);

            // Check if the preference for this reminder type is enabled
            bool isPreferenceEnabled = newModel.ReminderType switch
            {
                reminderType.EventParticipation => userPreference.EventReminder,
                reminderType.RoomBooking => userPreference.BookingReminder,
                _ => true
            };

            // If preference is disabled, mark the reminder as already read
            if (!isPreferenceEnabled)
            {
                newModel.IsRead = true;
            }
        }

        // Call base Put method to handle validation and database update
        return await base.Put(id, newModel).ConfigureAwait(false);
    }

    /// <summary>
    /// Partially updates an existing reminder, adjusting the ReminderTime based on user preferences.
    /// If the corresponding preference is disabled, the reminder is marked as read.
    /// </summary>
    public override async Task<RemindersModel> Patch(int id, RemindersModel newModel)
    {
        if (newModel == null) throw new ArgumentNullException(nameof(newModel));

        // Get user's reminder preferences
        var preferences = await _reminderPreferencesService.GetByUserId(newModel.UserId).ConfigureAwait(false);
        var userPreference = preferences.FirstOrDefault();

        if (userPreference != null)
        {
            // Subtract the advance time from the reminder time
            newModel.ReminderTime = newModel.ReminderTime.Subtract(userPreference.ReminderAdvanceMinutes);

            // Check if the preference for this reminder type is enabled
            bool isPreferenceEnabled = newModel.ReminderType switch
            {
                reminderType.EventParticipation => userPreference.EventReminder,
                reminderType.RoomBooking => userPreference.BookingReminder,
                _ => true
            };

            // If preference is disabled, mark the reminder as already read
            if (!isPreferenceEnabled)
            {
                newModel.IsRead = true;
            }
        }

        // Call base Patch method to handle validation and database update
        return await base.Patch(id, newModel).ConfigureAwait(false);
    }

    // Add additional services that are not related to CRUD here
}
