using Calender_WebApp.Models;
using Calender_WebApp.Models.Interfaces;
using Calender_WebApp.Services.Interfaces;
using Calender_WebApp.Utils;
using Microsoft.EntityFrameworkCore;

namespace Calender_WebApp.Services;

/// <summary>
/// Service for managing Event Participation entities.
/// </summary>
public class EventParticipationService : IEventParticipationService
{
    private readonly AppDbContext _context;
    private readonly DbSet<EventParticipationModel> _dbSet;

    public EventParticipationService(AppDbContext ctx)
    {
        _context = ctx ?? throw new ArgumentNullException(nameof(ctx));
        _dbSet = _context.Set<EventParticipationModel>();
    }

    /// <summary>
    /// Covers the Delete method from CrudService, but is not supported.
    /// </summary>
    /// <param name="id"></param>
    /// <returns>This function is not supported.</returns>
    /// <exception cref="NotSupportedException">Thrown when trying to delete by ID.</exception>
    public Task<EventParticipationModel> Delete(int id)
        => throw new NotSupportedException("Use Delete(EventParticipationModel entity) to remove a user's participation from an event.");

    /// <summary>
    /// Removes a user's participation from an event based on the provided entity details.
    /// </summary>
    /// <param name="entity"></param>
    /// <returns>The deleted participation record.</returns>
    /// <exception cref="InvalidOperationException">Thrown when the participation record is not found.</exception>
    public async Task<EventParticipationModel> Delete(EventParticipationModel entity)
    {
        var participation = await _dbSet
            .FirstOrDefaultAsync(ep => ep.UserId == entity.UserId && ep.EventId == entity.EventId);

        if (participation == null)
            throw new InvalidOperationException("Participation record not found.");

        _dbSet.Remove(participation);
        await _context.SaveChangesAsync();
        return participation;
    }

    /// <summary>
    /// Gets all entities of type EventParticipationModel.
    /// </summary>
    /// <returns>List of EventParticipationModel</returns>
    public virtual async Task<EventParticipationModel[]> Get()
    {
        return await _dbSet.AsNoTracking().ToArrayAsync().ConfigureAwait(false);
    }

    /// <summary>
    /// Covers the GetById method from CrudService, but is not supported.
    /// </summary>
    /// <param name="id"></param>
    /// <returns>This function is not supported.</returns>
    /// <exception cref="NotSupportedException">Thrown when trying to access by ID.</exception>
    public Task<EventParticipationModel> GetById(int id)
        => throw new NotSupportedException("Direct access by ID is not supported for EventParticipation.Use IsUserParticipatingAsync instead.");

    /// <summary>
    /// Creates a new event participation record if the user is not already participating in the event.
    /// </summary>
    /// <param name="participation"></param>
    /// <returns>The created participation record.</returns>
    /// <exception cref="ArgumentNullException">Thrown when the participation model is null.</exception>
    /// <exception cref="InvalidOperationException">Thrown when the user is already participating in the event.</exception>
    /// <exception cref="ArgumentException">Thrown when the status is invalid.</exception>
    public async Task<EventParticipationModel> Post(EventParticipationModel participation)
    {
        if (participation == null) throw new ArgumentNullException(nameof(participation));
        if (await IsUserParticipatingAsync(participation.EventId, participation.UserId))
            throw new InvalidOperationException("User is already participating in this event.");

        // check if status is valid
        if (!Enum.TryParse<ParticipationStatus>(participation.Status.ToString(), true, out var status))
            throw new ArgumentException("Invalid status value", nameof(participation.Status));
        
        // Validate model using whitelist util
        var inputDict = typeof(EventParticipationModel)
            .GetProperties()
            .Where(p => p.Name != nameof(IDbItem.Id))
            .ToDictionary(p => p.Name, p => p.GetValue(participation) ?? (object)string.Empty);

        if (!ModelWhitelistUtil.ValidateModelInput(typeof(EventParticipationModel).Name, inputDict, out var errors)) {
            throw new ArgumentException($"Model validation failed: {string.Join(", ", errors)}");
        }

        var entry = await _dbSet.AddAsync(participation).ConfigureAwait(false);
        await _context.SaveChangesAsync().ConfigureAwait(false);
        return entry.Entity;
    }

    /// <summary>
    /// Covers the Put method from CrudService, but is not supported.
    /// </summary>
    /// <param name="userId"></param>
    /// <param name="newTEntity"></param>
    /// <returns>The updated participation record.</returns>
    /// <exception cref="NotSupportedException">Thrown when trying to update an event participation record.</exception>
    public Task<EventParticipationModel> Put(int userId, EventParticipationModel newTEntity)
        => throw new NotSupportedException("Use UpdateStatus(int userId, int eventId, string newStatus) to update the status of an event participation.");

    /// <summary>
    /// Updates the participation status for a user in a specific event.
    /// </summary>
    /// <param name="userId"></param>
    /// <param name="eventId"></param>
    /// <param name="newStatus"></param>
    /// <returns>The updated participation record.</returns>
    /// <exception cref="ArgumentException">Thrown when the new status is invalid.</exception>
    /// <exception cref="InvalidOperationException">Thrown when the participation record is not found.</exception>
    public async Task<EventParticipationModel> UpdateStatus(int userId, int eventId, string newStatus)
    {
        // Validate newStatus
        if (!Enum.TryParse<ParticipationStatus>(newStatus, true, out var status))
            throw new ArgumentException("Invalid status value", nameof(newStatus));

        // Find the participation record
        var participation = await _dbSet.FirstOrDefaultAsync(ep => ep.UserId == userId && ep.EventId == eventId).ConfigureAwait(false);
        if (participation == null)
            throw new InvalidOperationException("Participation record not found.");

        participation.Status = status;
        await _context.SaveChangesAsync();
        return participation;
    }

    /// <summary>
    /// Get all participants for a specific event
    /// </summary>
    /// <param name="eventId"></param>
    /// <returns>The list of participants for the specified event.</returns>
    public async Task<List<EventParticipationModel>> GetParticipantsByEventIdAsync(int eventId)
    {
        return await _dbSet
            .Where(ep => ep.EventId == eventId)
            .ToListAsync();
    }

    /// <summary>
    /// Checks if a user is participating in a specific event
    /// </summary>
    /// <param name="eventId"></param>
    /// <param name="userId"></param>
    /// <returns>True if the user is participating, otherwise false.</returns>
    public async Task<bool> IsUserParticipatingAsync(int eventId, int userId)
    {
        return await _dbSet
            .AnyAsync(ep => ep.EventId == eventId && ep.UserId == userId);
    }
    
    // Add additional services that are not related to CRUD here
}