namespace Calender_WebApp.Services;

/// <summary>
/// Service for managing Event entities.
/// </summary>
public class EventsService : CrudService<EventModel>, IEventService
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
    public async Task<IEnumerable<EventModel>> GetEventsByUserAsync(Guid userId)
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
    public async Task<IEnumerable<EventModel>> GetUpcomingEventsAsync(DateTime fromDate)
    {
        return await _context.Events
            .Where(e => e.StartDate >= fromDate)
            .OrderBy(e => e.StartDate)
            .ToListAsync();
    }

    /// <summary>
    /// Deletes an event by its ID after checking for existence
    /// </summary>
    /// <param name="id"></param>
    /// <returns></returns>
    public override async Task<bool> DeleteAsync(Guid id)
    {
        var entity = await _context.Events.FindAsync(id);
        if (entity == null)
            return false;

        _context.Events.Remove(entity);
        await _context.SaveChangesAsync();
        return true;
    }

    // Add additional services that are not related to CRUD here
}