using Calender_WebApp.Models;
using Calender_WebApp.Services.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace Calender_WebApp.Services;

/// <summary>
/// Manages reminders with preference-based timing and soft deletion via IsRead flag.
/// 
/// Business Logic:
/// - Automatically adjusts ReminderTime based on user advance minutes preference
/// - Soft deletes reminders by marking IsRead=true instead of physical deletion
/// - Marks reminders as read when corresponding preference is disabled
/// - Uses time windows (±5 minutes) for reminder lookups to handle timing variations
/// - Filters due reminders where ReminderTime <= current time
/// 
/// Dependencies:
/// - IReminderPreferencesService for user notification preferences and timing
/// </summary>
public class RemindersService : CrudService<RemindersModel>, IRemindersService
{
    private readonly IReminderPreferencesService _reminderPreferencesService;

    public RemindersService(AppDbContext ctx, IReminderPreferencesService reminderPreferencesService) : base(ctx) 
    { 
        _reminderPreferencesService = reminderPreferencesService ?? throw new ArgumentNullException(nameof(reminderPreferencesService));
    }

    

    public Task<RemindersModel[]> GetByUserId(int userId)
    {
        return _dbSet
            .Where(r => r.UserId == userId)
            .ToArrayAsync();
    }



    
    /// <summary>
    /// Soft deletes room booking reminders by marking as read (preserves cancellation notifications).
    /// Uses time window (±5 minutes) to find reminders.
    /// </summary>
    public async Task<RemindersModel> DeleteRoomBookingRemindersAsync(int relatedUserId, int relatedRoomId, DateTime bookingDate, TimeSpan startTime)
    {
        var preferences = await _reminderPreferencesService.GetByUserId(relatedUserId).ConfigureAwait(false);
        var advanceTime = preferences.FirstOrDefault()?.ReminderAdvanceMinutes ?? TimeSpan.Zero;
        
        var expectedReminderTime = bookingDate.Add(startTime).Subtract(advanceTime);
        
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

        
        foreach (var reminder in reminders)
        {
            if (reminder.ReminderType != reminderType.EventParticipationCanceled)
            {
            reminder.IsRead = true;
            }
        }
        await _context.SaveChangesAsync();

        return reminders.First();
    }

    /// <summary>
    /// Soft deletes event participation reminders by marking as read (preserves cancellation notifications).
    /// </summary>
    public async Task<RemindersModel> DeleteEventParticipationRemindersAsync(int relatedUserId, int relatedEventId)
    {
        var reminders = await _dbSet
            .Where(r => r.UserId == relatedUserId && r.RelatedEventId == relatedEventId)
            .ToListAsync();

        if (reminders.Count == 0)
            return null!;

        foreach (var reminder in reminders)
        {
            if (reminder.ReminderType != reminderType.EventParticipationCanceled)
            {
            reminder.IsRead = true;
            }
        }
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
    /// Creates reminder with preference-based soft deletion.
    /// Marks reminder as read immediately if corresponding user preference is disabled.
    /// Cancellation notifications always created regardless of preferences.
    /// </summary>
    public override async Task<RemindersModel> Post(RemindersModel model)
    {
        if (model == null) throw new ArgumentNullException(nameof(model));

        var preferences = await _reminderPreferencesService.GetByUserId(model.UserId).ConfigureAwait(false);
        var userPreference = preferences.FirstOrDefault();

        if (userPreference != null)
        {
            if (model.ReminderType != reminderType.EventParticipationCanceled && 
                model.ReminderType != reminderType.RoomBookingCanceled) {
            }

            bool isPreferenceEnabled = model.ReminderType switch
            {
                reminderType.EventParticipation => userPreference.EventReminder,
                reminderType.RoomBooking => userPreference.BookingReminder,
                reminderType.EventParticipationChanged => userPreference.EventReminder,
                reminderType.RoomBookingChanged => userPreference.BookingReminder,
                reminderType.EventParticipationCanceled => userPreference.EventReminder,
                reminderType.RoomBookingCanceled => userPreference.BookingReminder,
                _ => true
            };

            if (!isPreferenceEnabled)
            {
                model.IsRead = true;
            }
        }

        return await base.Post(model).ConfigureAwait(false);
    }

    /// <summary>
    /// Updates reminder with preference-based soft deletion.
    /// Marks as read if corresponding preference is disabled.
    /// </summary>
    public override async Task<RemindersModel> Put(int id, RemindersModel newModel)
    {
        if (newModel == null) throw new ArgumentNullException(nameof(newModel));

        var preferences = await _reminderPreferencesService.GetByUserId(newModel.UserId).ConfigureAwait(false);
        var userPreference = preferences.FirstOrDefault();

        if (userPreference != null)
        {
            newModel.ReminderTime = newModel.ReminderTime.Subtract(userPreference.ReminderAdvanceMinutes);

            bool isPreferenceEnabled = newModel.ReminderType switch
            {
                reminderType.EventParticipation => userPreference.EventReminder,
                reminderType.RoomBooking => userPreference.BookingReminder,
                _ => true
            };

            if (!isPreferenceEnabled)
            {
                newModel.IsRead = true;
            }
        }

        return await base.Put(id, newModel).ConfigureAwait(false);
    }

    /// <summary>
    /// Partially updates reminder with preference-based soft deletion.
    /// Marks as read if corresponding preference is disabled.
    /// </summary>
    public override async Task<RemindersModel> Patch(int id, RemindersModel newModel)
    {
        if (newModel == null) throw new ArgumentNullException(nameof(newModel));

        var preferences = await _reminderPreferencesService.GetByUserId(newModel.UserId).ConfigureAwait(false);
        var userPreference = preferences.FirstOrDefault();

        if (userPreference != null)
        {
            newModel.ReminderTime = newModel.ReminderTime.Subtract(userPreference.ReminderAdvanceMinutes);

            bool isPreferenceEnabled = newModel.ReminderType switch
            {
                reminderType.EventParticipation => userPreference.EventReminder,
                reminderType.RoomBooking => userPreference.BookingReminder,
                _ => true
            };

            if (!isPreferenceEnabled)
            {
                newModel.IsRead = true;
            }
        }

        return await base.Patch(id, newModel).ConfigureAwait(false);
    }
    // ====================================================================
    // Methods below can be used if the front end needs them
    // ====================================================================
    // /// <summary>
    // /// Retrieves unread reminders that are due (ReminderTime has passed).
    // /// Used to fetch reminders that should be displayed now.
    // /// </summary>
    // public Task<RemindersModel[]> GetNextRemindersAsync(int userId, DateTime fromTime, DateTime toTime)
    // {
    //     return _dbSet
    //         .Where(r => r.UserId == userId && r.ReminderTime >= fromTime && r.ReminderTime <= toTime && !r.IsRead)
    //         .ToArrayAsync();
    // }
    // public Task<RemindersModel[]> GetRemindersByRelatedEventAsync(int relatedUserId, int relatedEventId)
    // {
    //     return _dbSet
    //         .Where(r => r.UserId == relatedUserId && r.RelatedEventId == relatedEventId)
    //         .ToArrayAsync();
    // }
    // /// <summary>
    // /// Retrieves reminders for room booking using time window matching (±5 minutes).
    // /// Calculates expected reminder time by subtracting user's advance minutes from booking time.
    // /// </summary>
    // public async Task<RemindersModel[]> GetRemindersByRelatedRoomAsync(int relatedUserId, int relatedRoomId, DateTime bookingDate, TimeSpan startTime)
    // {
    //     var preferences = await _reminderPreferencesService.GetByUserId(relatedUserId).ConfigureAwait(false);
    //     var advanceTime = preferences.FirstOrDefault()?.ReminderAdvanceMinutes ?? TimeSpan.Zero;
        
    //     var expectedReminderTime = bookingDate.Add(startTime).Subtract(advanceTime);
        
    //     var timeWindowStart = expectedReminderTime.AddMinutes(-5);
    //     var timeWindowEnd = expectedReminderTime.AddMinutes(5);
        
    //     return await _dbSet
    //         .Where(r => r.UserId == relatedUserId && 
    //                     r.RelatedRoomId == relatedRoomId && 
    //                     r.ReminderTime >= timeWindowStart && 
    //                     r.ReminderTime <= timeWindowEnd)
    //         .ToArrayAsync();
    // }
}
