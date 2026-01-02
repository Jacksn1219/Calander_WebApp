using Calender_WebApp.Models;

namespace Calender_WebApp.Services.Interfaces
{
    public interface IEventParticipationService : ICrudService<EventParticipationModel>
    {
        Task<EventParticipationModel> Delete(EventParticipationModel entity);
        Task<EventParticipationModel> Delete(EventParticipationModel entity, bool isEventCanceled);
        Task<EventParticipationModel> UpdateStatus(int userId, int eventId, string newStatus);
        Task<EventParticipationModel[]> GetParticipantsByEventIdAsync(int eventId);
        Task<bool> IsUserParticipatingAsync(int eventId, int userId);
        Task<EventParticipationModel[]> GetParticipantsByUserIdAsync(int userId);
        Task<DateTime> GetEventStartTimeAsync(int eventId);
        Task<EventParticipationModel[]> UpdateEventRemindersAsync(int eventId, EventsModel? oldEvent = null, EventsModel? newEvent = null);
    }
}