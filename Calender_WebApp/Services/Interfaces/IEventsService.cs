using Calender_WebApp.Models;

namespace Calender_WebApp.Services.Interfaces
{
    public interface IEventsService : ICrudService<EventsModel>
    {
        Task<IEnumerable<EventsModel>> GetEventsByUserAsync(Guid userId);
        Task<IEnumerable<EventsModel>> GetUpcomingEventsAsync(DateTime fromDate);

        // Add any additional methods specific to Events here if needed
    }
}