using Calender_WebApp.Models;

namespace Calender_WebApp.Services.Interfaces
{
    /// <summary>
    /// Contract for managing calendar events with room booking integration.
    /// Handles event lifecycle with automatic room booking synchronization and participant notifications.
    /// 
    /// Key Operations:
    /// - Event creation with optional room booking linkage
    /// - Time validation ensuring end time is after start time
    /// - Cascading deletion of linked room bookings and participant reminders
    /// - Event update notifications to all participants
    /// </summary>
    public interface IEventsService : ICrudService<EventsModel>
    {
        // ====================================================================
        // Methods below can be used if the front end needs them
        // ====================================================================

        //Task<IEnumerable<EventsModel>> GetEventsByUserAsync(int userId);
        //Task<IEnumerable<EventsModel>> GetUpcomingEventsAsync(DateTime fromDate);
    }
}