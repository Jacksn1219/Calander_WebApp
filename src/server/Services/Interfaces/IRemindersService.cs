using Calender_WebApp.Models;

namespace Calender_WebApp.Services.Interfaces
{
    /// <summary>
    /// Contract for managing reminders with preference-based timing and soft deletion.
    /// Handles notifications for events, room bookings, and status changes.
    /// 
    /// Key Operations:
    /// - Automatic reminder time adjustment based on user preferences
    /// - Preference-based soft deletion (marks as read when disabled)
    /// - Relationship-based queries for events and room bookings
    /// - Due reminder filtering (ReminderTime <= current time)
    /// 
    /// Note: Reminders are soft-deleted by marking IsRead=true instead of physical deletion.
    /// </summary>
    public interface IRemindersService : ICrudService<RemindersModel>
    {
        Task<RemindersModel[]> GetByUserId(int userId);
        Task<RemindersModel> DeleteRoomBookingRemindersAsync(int relatedUserId, int relatedRoomId, DateTime bookingDate, TimeSpan startTime);
        Task<RemindersModel> DeleteEventParticipationRemindersAsync(int relatedUserId, int relatedEventId);
        Task<bool> MarkReminderAsReadAsync(int reminderId);

        // ====================================================================
        // Methods below can be used if the front end needs them
        // ====================================================================

        //Task<RemindersModel[]> GetNextRemindersAsync(int userId, DateTime fromTime, DateTime toTime);
        // Task<RemindersModel[]> GetRemindersByRelatedEventAsync(int relatedUserId, int relatedEventId);
        // Task<RemindersModel[]> GetRemindersByRelatedRoomAsync(int relatedUserId, int relatedRoomId, DateTime bookingDate, TimeSpan startTime); // not used

    }
}