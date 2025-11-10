using Calender_WebApp.Models;

namespace Calender_WebApp.Services.Interfaces
{
    public interface IEventParticipationService : ICrudService<EventParticipationModel>
    {
        Task<EventParticipationModel> Delete(EventParticipationModel entity);
        Task<EventParticipationModel> UpdateStatus(int userId, int eventId, string newStatus);
        Task<List<EventParticipationModel>> GetParticipantsByEventIdAsync(int eventId);
        Task<bool> IsUserParticipatingAsync(int eventId, int userId);
        Task<List<EventParticipationModel>> GetParticipantsByUserIdAsync(int userId);

        // Add any additional methods specific to EventParticipation here if needed
    }
}