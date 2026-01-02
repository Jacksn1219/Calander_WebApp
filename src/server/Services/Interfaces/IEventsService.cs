using Calender_WebApp.Models;

namespace Calender_WebApp.Services.Interfaces
{
    public interface IEventsService : ICrudService<EventsModel>
    {
        Task<IEnumerable<EventsModel>> GetEventsByUserAsync(int userId);
        Task<IEnumerable<EventsModel>> GetUpcomingEventsAsync(DateTime fromDate);
    }
}