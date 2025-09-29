using Calender_WebApp.Models;
using Calender_WebApp.Services.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace Calender_WebApp.Services;

/// <summary>
/// Service for managing Event entities.
/// </summary>
public class EventsService : CrudService<EventsModel>, IEventsService
{
    public EventsService(AppDbContext ctx) : base(ctx) { }

    /// <summary>
    /// Get all events created by a specific user
    /// </summary>
    /// <param name="userId"></param>
    /// <returns>The list of events created by the user.</returns>
    public async Task<IEnumerable<EventsModel>> GetEventsByUserAsync(int userId)
    {
        return await _dbSet
            .Where(e => e.CreatedBy == userId)
            .ToListAsync();
    }

    /// <summary>
    /// Get upcoming events from a specific date
    /// </summary>
    /// <param name="fromDate"></param>
    /// <returns>The list of upcoming events.</returns>
    public async Task<IEnumerable<EventsModel>> GetUpcomingEventsAsync(DateTime fromDate)
    {
        return await _dbSet
            .Where(e => e.EventDate >= fromDate)
            .OrderBy(e => e.EventDate)
            .ToListAsync();
    }

    // Add additional services that are not related to CRUD here
}