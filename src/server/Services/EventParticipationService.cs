using Calender_WebApp.Models;
using Calender_WebApp.Models.Interfaces;
using Calender_WebApp.Services.Interfaces;
using Calender_WebApp.Utils;
using Microsoft.EntityFrameworkCore;

namespace Calender_WebApp.Services;

/// <summary>
/// Manages user participation in events with automatic reminder and notification handling.
/// 
/// Business Logic:
/// - Uses composite keys (UserId + EventId) instead of single ID
/// - Automatically creates reminders when users join events
/// - Sends differentiated notifications (cancellation vs. withdrawal)
/// - Marks cancellation reminders as read when users rejoin
/// - Updates all participant reminders when event details change
/// - Prevents duplicate participations
/// 
/// Dependencies:
/// - IRemindersService for automatic reminder creation and management
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

    public Task<EventParticipationModel> Delete(int id)
        => throw new NotSupportedException("Use Delete(EventParticipationModel entity) to remove a user's participation from an event.");

    public async Task<EventParticipationModel> Delete(EventParticipationModel entity)
    {
        return await Delete(entity, isEventCanceled: false);
    }

    /// <summary>
    /// Removes participation and creates differentiated notification based on cancellation reason.
    /// Sends "Event Canceled" notification if isEventCanceled=true, otherwise "You are no longer participating".
    /// Soft-deletes related reminders by marking as read.
    /// </summary>
    public async Task<EventParticipationModel> Delete(EventParticipationModel entity, bool isEventCanceled)
    {
        var participation = await _dbSet
            .FirstOrDefaultAsync(ep => ep.UserId == entity.UserId && ep.EventId == entity.EventId);

        if (participation == null)
            throw new InvalidOperationException("Participation record not found.");
    
        var eventModel = await _context.Set<EventsModel>()
            .AsNoTracking()
            .FirstOrDefaultAsync(e => e.Id == participation.EventId)
            .ConfigureAwait(false);

        if (eventModel != null)
        {
            string title, message;
            
            if (isEventCanceled)
            {
                title = $"Event Canceled: {eventModel.Title}";
                message = $"The event '{eventModel.Title}' scheduled for {eventModel.EventDate:yyyy-MM-dd HH:mm} has been canceled.";
            }
            else
            {
                title = $"You are no longer participating: {eventModel.Title}";
                message = $"You have canceled your participation for the event '{eventModel.Title}' scheduled for {eventModel.EventDate:yyyy-MM-dd HH:mm}.";
            }

            await _remindersService.Post(new RemindersModel
            {
                UserId = participation.UserId,
                ReminderType = reminderType.EventParticipationCanceled,
                RelatedEventId = participation.EventId,
                ReminderTime = DateTime.Now,
                Title = title,
                Message = message
            }).ConfigureAwait(false);
        }

        await _remindersService.DeleteEventParticipationRemindersAsync(participation.UserId, participation.EventId);

        _dbSet.Remove(participation);
        await _context.SaveChangesAsync();
        return participation;
    }

    public virtual async Task<EventParticipationModel[]> Get()
    {
        return await _dbSet.AsNoTracking().ToArrayAsync().ConfigureAwait(false);
    }

    public Task<EventParticipationModel> GetById(int id)
        => throw new NotSupportedException("Direct access by ID is not supported for EventParticipation.Use IsUserParticipatingAsync instead.");

    /// <summary>
    /// Creates participation with duplicate prevention and automatic reminder generation.
    /// Marks existing cancellation reminders as read when user rejoins event.
    /// </summary>
    public async Task<EventParticipationModel> Post(EventParticipationModel participation)
    {
        if (participation == null) throw new ArgumentNullException(nameof(participation));

        if (await IsUserParticipatingAsync(participation.EventId, participation.UserId))
            throw new InvalidOperationException("User is already participating in this event.");

        if (!Enum.TryParse<ParticipationStatus>(participation.Status.ToString(), true, out var status))
            throw new ArgumentException("Invalid status value", nameof(participation.Status));
        

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
        
        var canceledReminders = await _context.Set<RemindersModel>()
            .Where(r => r.UserId == participation.UserId && 
                       r.RelatedEventId == participation.EventId && 
                       r.ReminderType == reminderType.EventParticipationCanceled &&
                       !r.IsRead)
            .ToListAsync()
            .ConfigureAwait(false);
        
        foreach (var reminder in canceledReminders)
        {
            reminder.IsRead = true;
        }
        
        await _context.SaveChangesAsync().ConfigureAwait(false);
        
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
            Message = $"You are participating in {eventModel?.Title ?? participation.EventId.ToString() ?? "Event"} starting at {eventDetails}." + (eventModel != null ? string.Empty : string.Empty),
        }).ConfigureAwait(false);
        
        await _context.SaveChangesAsync().ConfigureAwait(false);
        return entry.Entity;
    }

    public Task<EventParticipationModel> Put(int userId, EventParticipationModel newTEntity)
        => throw new NotSupportedException("Use UpdateStatus(int userId, int eventId, string newStatus) to update the status of an event participation.");

    public Task<EventParticipationModel> Patch(int userId, EventParticipationModel newTEntity)
        => throw new NotSupportedException("Use UpdateStatus(int userId, int eventId, string newStatus) to update the status of an event participation.");

    public async Task<EventParticipationModel[]> GetParticipantsByEventIdAsync(int eventId)
    {
        return await _dbSet
            .Where(ep => ep.EventId == eventId)
            .ToArrayAsync();
    }

    public async Task<bool> IsUserParticipatingAsync(int eventId, int userId)
    {
        return await _dbSet
            .AnyAsync(ep => ep.EventId == eventId && ep.UserId == userId);
    }
    
    

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
    /// Notifies all participants and event creator when event details change.
    /// Generates detailed change summary comparing old and new event data.
    /// Sends notifications for title, time, location, and description changes.
    /// </summary>
    public async Task<EventParticipationModel[]> UpdateEventRemindersAsync(int eventId, EventsModel? oldEvent = null, EventsModel? newEvent = null)
    {
        var participants = await _dbSet
            .Where(ep => ep.EventId == eventId)
            .ToArrayAsync();

        if (newEvent == null)
        {
            newEvent = await _context.Set<EventsModel>()
                .AsNoTracking()
                .FirstOrDefaultAsync(e => e.Id == eventId)
                .ConfigureAwait(false);
                
            if (newEvent == null)
                throw new InvalidOperationException("Event not found.");
        }

        var changes = new List<string>();
        
        if (oldEvent != null)
        {
            if (oldEvent.Title != newEvent.Title)
            {
                changes.Add($"\nTitle: '{oldEvent.Title}' → '{newEvent.Title}'");
            }

            if (oldEvent.EventDate != newEvent.EventDate)
            {
                changes.Add($"\nTime: {oldEvent.EventDate:yyyy-MM-dd HH:mm} → {newEvent.EventDate:yyyy-MM-dd HH:mm}");
            }

            if (oldEvent.EndTime != newEvent.EndTime)
            {
                changes.Add($"\nEnd Time: {oldEvent.EndTime:yyyy-MM-dd HH:mm} → {newEvent.EndTime:yyyy-MM-dd HH:mm}");
            }

            if (oldEvent.Location != newEvent.Location)
            {
                changes.Add($"\nLocation: '{oldEvent.Location}' → '{newEvent.Location}'");
            }

            if (oldEvent.Description != newEvent.Description)
            {
                changes.Add($"\nDescription changed.");
            }
        }

        var eventTimeInfo = $"Event starts: {newEvent.EventDate:yyyy-MM-dd HH:mm}";
        var message = changes.Count > 0
            ? $"\nThe event has been updated:\n{string.Join("\n", changes)}\n\n{eventTimeInfo}"
            : $"\nThe event has been updated.\n{eventTimeInfo}";

        var userIdsToNotify = new HashSet<int>(participants.Select(p => p.UserId));
        userIdsToNotify.Add(newEvent.CreatedBy);

        foreach (var userId in userIdsToNotify)
        {
            await _remindersService.Post(new RemindersModel
            {
                UserId = userId,
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
    /// ====================================================================
    /// Methods below can be used if the front end needs them
    /// ==================================================================
    // public async Task<EventParticipationModel> UpdateStatus(int userId, int eventId, string newStatus)
    // {
    //     if (!Enum.TryParse<ParticipationStatus>(newStatus, true, out var status))
    //         throw new ArgumentException("Invalid status value", nameof(newStatus));

    //     var participation = await _dbSet.FirstOrDefaultAsync(ep => ep.UserId == userId && ep.EventId == eventId).ConfigureAwait(false);
    //     if (participation == null)
    //         throw new InvalidOperationException("Participation record not found.");

    //     participation.Status = status;
    //     await _context.SaveChangesAsync();
    //     return participation;
    // }
    // public async Task<EventParticipationModel[]> GetParticipantsByUserIdAsync(int userId)
    // {
    //     return await _dbSet
    //         .Where(ep => ep.UserId == userId)
    //         .ToArrayAsync();
    // }

}