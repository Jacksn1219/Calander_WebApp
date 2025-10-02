using Calender_WebApp.Models;

namespace Calender_WebApp.Services.Interfaces
{
    public interface IEventParticipationService : ICrudService<EventParticipationModel>
    {
        Task<List<EventParticipationModel>> GetParticipantsByEventIdAsync(int eventId);
        Task<bool> IsUserParticipatingAsync(int eventId, int userId);

        // Add any additional methods specific to EventParticipation here if needed
    }
}