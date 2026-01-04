using Calender_WebApp.Models;

namespace Calender_WebApp.Services.Interfaces
{
    /// <summary>
    /// Contract for managing user participation in events with notification and reminder handling.
    /// Uses composite keys (UserId + EventId) instead of standard ID-based operations.
    /// 
    /// Key Operations:
    /// - Participation status management (Accepted, Declined, Pending)
    /// - Automatic reminder creation and cancellation
    /// - Participation change notifications
    /// - Bulk reminder updates when events are modified
    /// 
    /// Note: Standard CRUD operations by ID are disabled; uses composite key methods instead.
    /// </summary>
    public interface IEventParticipationService : ICrudService<EventParticipationModel>
    {
        Task<EventParticipationModel> Delete(EventParticipationModel entity);
        Task<EventParticipationModel> Delete(EventParticipationModel entity, bool isEventCanceled);
        Task<EventParticipationModel[]> GetParticipantsByEventIdAsync(int eventId);
        Task<bool> IsUserParticipatingAsync(int eventId, int userId);
        Task<DateTime> GetEventStartTimeAsync(int eventId);
        Task<EventParticipationModel[]> UpdateEventRemindersAsync(int eventId, EventsModel? oldEvent = null, EventsModel? newEvent = null);
        // ====================================================================
        // Methods below can be used if the front end needs them
        // ====================================================================
        // Task<EventParticipationModel> UpdateStatus(int userId, int eventId, string newStatus);
        // Task<EventParticipationModel[]> GetParticipantsByUserIdAsync(int userId); 


    }
}