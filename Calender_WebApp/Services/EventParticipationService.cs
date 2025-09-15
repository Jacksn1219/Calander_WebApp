namespace Calender_WebApp.Services;

/// <summary>
/// Service for managing Event Participation entities.
/// </summary>
public class EventParticipationService : CrudService<EventParticipationModel>, IEventParticipationService
{
    private readonly DatabaseContext _context;

    public EventParticipationService(DatabaseContext ctx) : base(ctx)
    {
        _context = ctx;
    }

    /// <summary>
    /// Get all participants for a specific event
    /// </summary>
    /// <param name="eventId"></param>
    /// <returns></returns>
    public async Task<List<EventParticipationModel>> GetParticipantsByEventIdAsync(int eventId)
    {
        return await _context.EventParticipations
            .Where(ep => ep.EventId == eventId)
            .ToListAsync();
    }

    /// <summary>
    /// Checks if a user is participating in a specific event
    /// </summary>
    /// <param name="eventId"></param>
    /// <param name="userId"></param>
    /// <returns></returns>
    public async Task<bool> IsUserParticipatingAsync(int eventId, int userId)
    {
        return await _context.EventParticipations
            .AnyAsync(ep => ep.EventId == eventId && ep.UserId == userId);
    }

    /// <summary>
    /// Add a participant to an event (with duplicate check)
    /// </summary>
    /// <param name="participation"></param>
    /// <returns></returns>
    public async Task<bool> AddParticipantAsync(EventParticipationModel participation)
    {
        if (await IsUserParticipatingAsync(participation.EventId, participation.UserId))
            return false;

        _context.EventParticipations.Add(participation);
        await _context.SaveChangesAsync();
        return true;
    }

    /// <summary>
    /// Remove a participant from an event
    /// </summary>
    /// <param name="eventId"></param>
    /// <param name="userId"></param>
    /// <returns></returns>
    public async Task<bool> RemoveParticipantAsync(int eventId, int userId)
    {
        var participation = await _context.EventParticipations
            .FirstOrDefaultAsync(ep => ep.EventId == eventId && ep.UserId == userId);

        if (participation == null)
            return false;

        _context.EventParticipations.Remove(participation);
        await _context.SaveChangesAsync();
        return true;
    }
}