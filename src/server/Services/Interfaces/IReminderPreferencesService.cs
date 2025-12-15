using Calender_WebApp.Models;

namespace Calender_WebApp.Services.Interfaces
{
    public interface IReminderPreferencesService : ICrudService<ReminderPreferencesModel>
    {
        Task<ReminderPreferencesModel[]> GetByUserId(int userId);
        Task<bool> ToggleEventReminders(int userId);
        Task<bool> ToggleBookingReminders(int userId);

        // Add any additional methods specific to Reminder Preferences here if needed
    }
}