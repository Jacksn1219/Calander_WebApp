using Calender_WebApp.Models;

namespace Calender_WebApp.Services.Interfaces
{
    /// <summary>
    /// Contract for managing user reminder preferences including notification settings and timing.
    /// Controls when and how users receive event and booking reminders.
    /// 
    /// Key Operations:
    /// - Toggle event and booking reminder preferences
    /// - Configure advance notification timing
    /// - User-specific preference retrieval
    /// 
    /// Note: ID is manually set to match UserId for one-to-one relationship.
    /// </summary>
    public interface IReminderPreferencesService : ICrudService<ReminderPreferencesModel>
    {
        Task<ReminderPreferencesModel[]> GetByUserId(int userId);
        Task<bool> ToggleEventReminders(int userId);
        Task<bool> ToggleBookingReminders(int userId);
        Task<ReminderPreferencesModel> UpdateAdvanceMinutes(int userId, TimeSpan advanceMinutes);
    }
}