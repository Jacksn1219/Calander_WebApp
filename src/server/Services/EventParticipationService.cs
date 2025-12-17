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
    private readonly IRemindersService _remindersService;

    public EventParticipationService(AppDbContext ctx, IRemindersService remindersService)
    {
        _context = ctx ?? throw new ArgumentNullException(nameof(ctx));
        _dbSet = _context.Set<EventParticipationModel>();
        _remindersService = remindersService ?? throw new ArgumentNullException(nameof(remindersService));
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
    
        // Get event details for the canceled reminder
        var eventModel = await _context.Set<EventsModel>()
            .AsNoTracking()
            .FirstOrDefaultAsync(e => e.Id == participation.EventId)
            .ConfigureAwait(false);

        // Send canceled reminder before deleting participation
        if (eventModel != null)
        {
            await _remindersService.Post(new RemindersModel
            {
                UserId = participation.UserId,
                ReminderType = reminderType.EventParticipationCanceled,
                RelatedEventId = participation.EventId,
                RelatedRoomId = eventModel.RoomId ?? 0,
                ReminderTime = DateTime.Now,
                Title = $"Event Canceled: {eventModel.Title}",
                Message = $"The event '{eventModel.Title}' scheduled for {eventModel.EventDate:yyyy-MM-dd HH:mm} has been canceled."
            }).ConfigureAwait(false);
        }

        // Delete related reminders
        await _remindersService.DeleteEventParticipationRemindersAsync(participation.UserId, participation.EventId);

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
        

        // Validate model using whitelist util (ignore navigation properties)
        var validators = ModelWhitelistUtil.GetValidatorsForModel(typeof(EventParticipationModel).Name);
        var inputDict = typeof(EventParticipationModel)
            .GetProperties()
            .Where(p => validators == null || validators.ContainsKey(p.Name))
            .Where(p => p.PropertyType.IsValueType || p.PropertyType == typeof(string))
            .ToDictionary(p => p.Name, p => p.GetValue(participation) ?? (object)string.Empty);

        if (!ModelWhitelistUtil.ValidateModelInput(typeof(EventParticipationModel).Name, inputDict, out var errors)) {
            throw new ArgumentException($"Model validation failed: {string.Join(", ", errors)}");
        }

        var entry = await _dbSet.AddAsync(participation).ConfigureAwait(false);
        
        // Create reminder for the event participation
        DateTime eventDetails = await GetEventStartTimeAsync(participation.EventId).ConfigureAwait(false);
        EventsModel? eventModel = await _context.Set<EventsModel>()
            .AsNoTracking()
            .FirstOrDefaultAsync(e => e.Id == participation.EventId)
            .ConfigureAwait(false);
        await _remindersService.Post(new RemindersModel
        {
            UserId = participation.UserId,
            ReminderType = reminderType.EventParticipation,
            RelatedEventId = participation.EventId,
            ReminderTime = eventDetails,
            Title = $"Event {eventModel?.Title ?? participation.EventId.ToString() ?? "Event"} participation",
            Message = $"You are participating in {eventModel?.Title ?? participation.EventId.ToString() ?? "Event"} starting at {eventDetails}." + (eventModel != null && eventModel.RoomId.HasValue ? $" in room {eventModel.RoomId}" : string.Empty),
        }).ConfigureAwait(false);
        
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
    /// Covers the Patch method from CrudService, but is not supported.
    /// </summary>
    /// <param name="userId"></param>
    /// <param name="newTEntity"></param>
    /// <returns>The updated participation record.</returns>
    /// <exception cref="NotSupportedException">Thrown when trying to update an event participation record.</exception>
    public Task<EventParticipationModel> Patch(int userId, EventParticipationModel newTEntity)
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
    public async Task<EventParticipationModel> UpdateStatus(int userId, int eventId, int newStatus)
    {
        // Validate newStatus
        if (!Enum.IsDefined(typeof(ParticipationStatus), newStatus))
            throw new ArgumentException("Invalid status value", nameof(newStatus));
        
        var status = (ParticipationStatus)newStatus;

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
    public async Task<EventParticipationModel[]> GetParticipantsByEventIdAsync(int eventId)
    {
        return await _dbSet
            .Where(ep => ep.EventId == eventId)
            .ToArrayAsync();
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
    
    /// <summary>
    /// Get all participants for a specific event
    /// </summary>
    /// <param name="userId"></param>
    /// <returns>The list of participants for the specified event.</returns>
    public async Task<EventParticipationModel[]> GetParticipantsByUserIdAsync(int userId)
    {
        return await _dbSet
            .Where(ep => ep.UserId == userId)
            .ToArrayAsync();
    }

    /// <summary>
    /// Retrieves the start time of an event based on its ID.
    /// </summary>
    /// <param name="eventId">The ID of the event.</param>
    /// <returns>The start time of the event.</returns>
    public async Task<DateTime> GetEventStartTimeAsync(int eventId)
    {
        var eventModel = await _context.Set<EventsModel>()
            .AsNoTracking()
            .FirstOrDefaultAsync(e => e.Id == eventId)
            .ConfigureAwait(false);

        if (eventModel == null)
            throw new InvalidOperationException("Event not found.");

        return eventModel.EventDate;
    }

    /// <summary>
    /// Updates reminders for all participants of a specific event.
    /// </summary>
    /// <param name="eventId">The ID of the event.</param>
    /// <param name="oldEvent">The old event data before changes.</param>
    /// <param name="newEvent">The new event data after changes.</param>
    /// <returns>An array of updated event participation records.</returns>
    /// <exception cref="InvalidOperationException">Thrown when no participants are found for the event.</exception>
    public async Task<EventParticipationModel[]> UpdateEventRemindersAsync(int eventId, EventsModel? oldEvent = null, EventsModel? newEvent = null)
    {
        var participants = await _dbSet
            .Where(ep => ep.EventId == eventId)
            .ToArrayAsync();

        if (participants.Length == 0)
            return Array.Empty<EventParticipationModel>();

        // Get current event if not provided
        if (newEvent == null)
        {
            newEvent = await _context.Set<EventsModel>()
                .AsNoTracking()
                .FirstOrDefaultAsync(e => e.Id == eventId)
                .ConfigureAwait(false);
                
            if (newEvent == null)
                throw new InvalidOperationException("Event not found.");
        }

        // Build change message
        var changes = new List<string>();
        
        if (oldEvent != null)
        {
            // Compare date/time
            if (oldEvent.EventDate != newEvent.EventDate)
            {
                changes.Add($"\nTime: {oldEvent.EventDate:yyyy-MM-dd HH:mm} → {newEvent.EventDate:yyyy-MM-dd HH:mm}");
            }
            
            // Compare duration
            if (oldEvent.DurationMinutes != newEvent.DurationMinutes)
            {
                changes.Add($"\nDuration: {oldEvent.DurationMinutes} min → {newEvent.DurationMinutes} min");
            }
            
            // Compare room
            if (oldEvent.RoomId != newEvent.RoomId)
            {
                var oldRoom = oldEvent.RoomId.HasValue ? $"Room {oldEvent.RoomId}" : "No room";
                var newRoom = newEvent.RoomId.HasValue ? $"Room {newEvent.RoomId}" : "No room";
                changes.Add($"\nLocation: {oldRoom} → {newRoom}");
            }
            
            // Compare title
            if (oldEvent.Title != newEvent.Title)
            {
                changes.Add($"\nTitle: '{oldEvent.Title}' → '{newEvent.Title}'");
            }
        }

        // Build message with event time info
        var eventTimeInfo = $"Event starts: {newEvent.EventDate:yyyy-MM-dd HH:mm}";
        var message = changes.Count > 0
            ? $"\nThe event you are participating in has been updated:\n{string.Join("\n", changes)}\n\n{eventTimeInfo}"
            : $"\nThe event you are participating in has been updated.\n{eventTimeInfo}";

        foreach (var participant in participants)
        {
            // Create a new "changed" reminder for each participant
            await _remindersService.Post(new RemindersModel
            {
                UserId = participant.UserId,
                ReminderType = reminderType.EventParticipationChanged,
                RelatedEventId = eventId,
                ReminderTime = newEvent.EventDate,
                Title = $"Event Updated: {newEvent.Title}",
                Message = message,
            }).ConfigureAwait(false);
        }

        await _context.SaveChangesAsync();
        return participants;
    }
    
    // Add additional services that are not related to CRUD here
}