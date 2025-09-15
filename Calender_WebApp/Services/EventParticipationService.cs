using Calender_WebApp.Models;
using Calender_WebApp.Services.Interfaces;

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
            .Where(ep => ep.Id == eventId)
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
            .AnyAsync(ep => ep.Id == eventId && ep.UserId == userId);
    }

    /// <summary>
    /// Add a participant to an event (with duplicate check)
    /// </summary>
    /// <param name="participation"></param>
    /// <returns></returns>
    public override async Task<EventParticipationModel> Post(EventParticipationModel participation)
    {
        if (await IsUserParticipatingAsync(participation.EventId, participation.UserId))
            return null!;

        _context.EventParticipations.Add(participation);
        await _context.SaveChangesAsync();
        return participation;
    }

    /// <summary>
    /// Remove a participant from an event
    /// </summary>
    /// <param name="Id"></param>
    /// <param name="userId"></param>
    /// <returns></returns>
    public override async Task<EventParticipationModel?> Delete(int Id)
    {
        var participation = await _context.EventParticipations
            .FirstOrDefaultAsync(ep => ep.Id == Id);

        if (participation == null)
            return null;

        _context.EventParticipations.Remove(participation);
        await _context.SaveChangesAsync();
        return participation;
    }
}