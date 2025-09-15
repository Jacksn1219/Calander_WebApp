using Calender_WebApp.Models;
using Calender_WebApp.Services.Interfaces;

namespace Calender_WebApp.Services;

/// <summary>
/// Service for managing Event entities.
/// </summary>
public class EventsService : CrudService<EventsModel>, IEventsService
{
    private readonly DatabaseContext _context;

    public EventsService(DatabaseContext ctx) : base(ctx)
    {
        _context = ctx;
    }

    /// <summary>
    /// Get all events for a specific user
    /// </summary>
    /// <param name="userId"></param>
    /// <returns></returns>
    public async Task<IEnumerable<EventsModel>> GetEventsByUserAsync(Guid userId)
    {
        return await _context.Events
            .Where(e => e.UserId == userId)
            .ToListAsync();
    }

    /// <summary>
    /// Get upcoming events from a specific date
    /// </summary>
    /// <param name="fromDate"></param>
    /// <returns></returns>
    public async Task<IEnumerable<EventsModel>> GetUpcomingEventsAsync(DateTime fromDate)
    {
        return await _context.Events
            .Where(e => e.EventDate >= fromDate)
            .OrderBy(e => e.EventDate)
            .ToListAsync();
    }

    // Add additional services that are not related to CRUD here
}