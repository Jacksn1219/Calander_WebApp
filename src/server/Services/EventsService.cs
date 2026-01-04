using Calender_WebApp.Models;
using Calender_WebApp.Services.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace Calender_WebApp.Services;

/// <summary>
/// Manages calendar events with room booking integration and participant notification.
/// 
/// Business Logic:
/// - Validates event times ensuring end is after start
/// - Synchronizes with room bookings when BookingId is provided
/// - Automatically notifies participants when event details change
/// - Cascades deletions to room bookings and participant reminders
/// - Normalizes location strings by trimming whitespace
/// 
/// Dependencies:
/// - IEventParticipationService for participant notifications
/// - IRoomBookingsService for booking validation and synchronization
/// - IRemindersService for reminder management
/// </summary>
public class EventsService : CrudService<EventsModel>, IEventsService
{
    private readonly IEventParticipationService _eventparticipationService;
    private readonly IRoomBookingsService _roombookingsService;
    private readonly IRemindersService _remindersService;

    public EventsService(AppDbContext ctx, IEventParticipationService eventparticipationService, IRoomBookingsService roombookingsService, IRemindersService remindersService) : base(ctx)
    {
        _eventparticipationService = eventparticipationService ?? throw new ArgumentNullException(nameof(eventparticipationService));
        _roombookingsService = roombookingsService ?? throw new ArgumentNullException(nameof(roombookingsService));
        _remindersService = remindersService ?? throw new ArgumentNullException(nameof(remindersService));
    }

    /// <summary>
    /// Updates event with room booking validation and participant notifications.
    /// Validates booking times match event times if BookingId provided.
    /// </summary>
    public override async Task<EventsModel> Put(int id, EventsModel updatedEntity)
    {

        await ApplyBookingToEventAsync(updatedEntity).ConfigureAwait(false);
        NormalizeLocation(updatedEntity);
        ValidateEventTimes(updatedEntity.EventDate, updatedEntity.EndTime);

        var updatedEvent =  await base.Put(id, updatedEntity);
        var oldEvent = await _dbSet.AsNoTracking().FirstOrDefaultAsync(e => e.Id == id);
        try
        {
            await _eventparticipationService.UpdateEventRemindersAsync(id, oldEvent, updatedEvent).ConfigureAwait(false);
        }
        catch (Exception ex)
        {
        }

        await SyncRoomBookingAsync(updatedEvent, updatedEntity).ConfigureAwait(false);

        return updatedEvent;
    }
    /// <summary>
    /// Creates event with room booking validation and automatic synchronization.
    /// Ensures event times match linked booking if BookingId provided.
    /// </summary>
    public override async Task<EventsModel> Post(EventsModel newEntity)
    {
        await ApplyBookingToEventAsync(newEntity).ConfigureAwait(false);
        NormalizeLocation(newEntity);
        ValidateEventTimes(newEntity.EventDate, newEntity.EndTime);

        var createdEvent = await base.Post(newEntity);

        await SyncRoomBookingAsync(createdEvent, newEntity).ConfigureAwait(false);

        return createdEvent;
    }

    private static void NormalizeLocation(EventsModel entity)
    {
        if (entity.Location != null)
        {
            entity.Location = entity.Location.Trim();
        }
    }

    private static void ValidateEventTimes(DateTime start, DateTime end)
    {
        if (end <= start)
        {
            throw new ArgumentException("End time must be after start time.");
        }
    }

    private async Task<RoomBookingsModel?> ApplyBookingToEventAsync(EventsModel entity)
    {
        if (!entity.BookingId.HasValue)
        {
            return null;
        }

        var booking = await _roombookingsService.GetByIdAsync(entity.BookingId.Value).ConfigureAwait(false);
        if (booking == null)
        {
            throw new InvalidOperationException("Booking not found for the provided bookingId.");
        }

        var bookingStart = booking.BookingDate.Date.Add(booking.StartTime);
        var bookingEnd = booking.BookingDate.Date.Add(booking.EndTime);
        if (bookingStart != entity.EventDate || bookingEnd != entity.EndTime)
        {
            throw new InvalidOperationException("Event start/end must match the booking window. Update the booking first.");
        }

        return booking;
    }

    private async Task SyncRoomBookingAsync(EventsModel persistedEvent, EventsModel payload)
    {
        if (payload.BookingId.HasValue)
        {
            var booking = await _roombookingsService.GetByIdAsync(payload.BookingId.Value).ConfigureAwait(false);
            if (booking == null)
            {
                throw new InvalidOperationException("Booking not found for the provided bookingId.");
            }

            var bookingStart = booking.BookingDate.Date.Add(booking.StartTime);
            var bookingEnd = booking.BookingDate.Date.Add(booking.EndTime);
            if (bookingStart != payload.EventDate || bookingEnd != payload.EndTime)
            {
                throw new InvalidOperationException("Event start/end must match the booking window. Update the booking first.");
            }
        }
    }

    /// <summary>
    /// Deletes event with cascading operations:
    /// - Deletes linked room booking if exists
    /// - Notifies all participants with cancellation message (isEventCanceled=true)
    /// - Marks related reminders as read (soft delete)
    /// </summary>
    public override async Task<EventsModel> Delete(int id)
    {
        var eventToDelete = await _dbSet.FindAsync(id).ConfigureAwait(false);
        if (eventToDelete == null)
        {
            throw new InvalidOperationException("Event not found.");
        }

        if (eventToDelete.BookingId.HasValue)
        {
            var booking = await _roombookingsService.GetByIdAsync(eventToDelete.BookingId.Value).ConfigureAwait(false);
            if (booking != null)
            {
                await _roombookingsService.Delete(booking).ConfigureAwait(false);
            }
        }

        var relatedParticipations = await _context.Set<EventParticipationModel>()
            .Where(ep => ep.EventId == id)
            .ToListAsync()
            .ConfigureAwait(false);

        foreach (var participation in relatedParticipations)
        {
            await _eventparticipationService.Delete(participation, isEventCanceled: true).ConfigureAwait(false);
        }

        var relatedReminders = await _context.Set<RemindersModel>()
            .Where(r => r.RelatedEventId == id && 
                   r.ReminderType != reminderType.EventParticipationCanceled && 
                   r.ReminderType != reminderType.RoomBookingCanceled)
            .ToListAsync()
            .ConfigureAwait(false);
        
        foreach (var reminder in relatedReminders)
        {
            reminder.IsRead = true;
        }

        _dbSet.Remove(eventToDelete);
        await _context.SaveChangesAsync().ConfigureAwait(false);
        
        return eventToDelete;
    }
    // ====================================================================
    // Methods below can be used if the front end needs them
    // ====================================================================
    /// 
    // public async Task<IEnumerable<EventsModel>> GetEventsByUserAsync(int userId)
    // {
    //     return await _dbSet
    //         .Where(e => e.CreatedBy == userId)
    //         .ToListAsync();
    // }

    // public async Task<IEnumerable<EventsModel>> GetUpcomingEventsAsync(DateTime fromDate)
    // {
    //     return await _dbSet
    //         .Where(e => e.EventDate >= fromDate)
    //         .OrderBy(e => e.EventDate)
    //         .ToListAsync();
    // }
}