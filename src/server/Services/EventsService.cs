using Calender_WebApp.Models;
using Calender_WebApp.Services.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace Calender_WebApp.Services;

/// <summary>
/// Service for managing Event entities.
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

    // Put
    public override async Task<EventsModel> Put(int id, EventsModel updatedEntity)
    {

        await ApplyBookingToEventAsync(updatedEntity).ConfigureAwait(false);
        NormalizeLocation(updatedEntity);
        ValidateEventTimes(updatedEntity.EventDate, updatedEntity.EndTime);

        var updatedEvent =  await base.Put(id, updatedEntity);
        var oldEvent = await _dbSet.AsNoTracking().FirstOrDefaultAsync(e => e.Id == id);
        // Update related reminders
        try
        {
            // Update related reminders with old and new event data
            await _eventparticipationService.UpdateEventRemindersAsync(id, oldEvent, updatedEvent).ConfigureAwait(false);
        }
        catch (Exception ex)
        {
            // Log the exception or handle it as needed
            Console.WriteLine($"Failed to update event reminders: {ex.Message}");
        }

        await SyncRoomBookingAsync(updatedEvent, updatedEntity).ConfigureAwait(false);

        return updatedEvent;
    }
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
        // If no booking is provided, detach any existing booking linked to this event.
        if (!payload.BookingId.HasValue)
        {
            var existing = (await _roombookingsService.Get().ConfigureAwait(false))
                .FirstOrDefault(rb => rb.EventId == persistedEvent.Id);

            if (existing != null)
            {
                await _roombookingsService.Delete(existing).ConfigureAwait(false);
            }
            return;
        }

        var booking = await _roombookingsService.GetByIdAsync(payload.BookingId.Value).ConfigureAwait(false);
        if (booking == null)
        {
            throw new InvalidOperationException("Booking not found for the provided bookingId.");
        }

        if (booking.EventId.HasValue && booking.EventId != persistedEvent.Id)
        {
            throw new InvalidOperationException("The provided booking is already linked to another event.");
        }

        var bookingStart = booking.BookingDate.Date.Add(booking.StartTime);
        var bookingEnd = booking.BookingDate.Date.Add(booking.EndTime);
        if (bookingStart != payload.EventDate || bookingEnd != payload.EndTime)
        {
            throw new InvalidOperationException("Event start/end must match the booking window. Update the booking first.");
        }

        // Link booking to event
        booking.EventId = persistedEvent.Id;
        await _roombookingsService.Put(booking.Id, booking).ConfigureAwait(false);
    }

    // Delete
    public override async Task<EventsModel> Delete(int id)
    {
        // Get the event
        var eventToDelete = await _dbSet.FindAsync(id).ConfigureAwait(false);
        if (eventToDelete == null)
        {
            throw new InvalidOperationException("Event not found.");
        }

        // Delete related room bookings using the service (generates canceled notifications)
        var relatedBookings = await _context.Set<RoomBookingsModel>()
            .Where(rb => rb.EventId == id)
            .ToListAsync()
            .ConfigureAwait(false);

        foreach (var booking in relatedBookings)
        {
            await _roombookingsService.Delete(booking).ConfigureAwait(false);
        }

        // Delete related event participations using the service (generates "Event Canceled" notifications)
        var relatedParticipations = await _context.Set<EventParticipationModel>()
            .Where(ep => ep.EventId == id)
            .ToListAsync()
            .ConfigureAwait(false);

        foreach (var participation in relatedParticipations)
        {
            await _eventparticipationService.Delete(participation, isEventCanceled: true).ConfigureAwait(false);
        }

        // Mark all existing reminders for this event as read (except the canceled reminders that were just created)
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

        // Finally, delete the event itself
        _dbSet.Remove(eventToDelete);
        await _context.SaveChangesAsync().ConfigureAwait(false);
        
        return eventToDelete;
    }

    // Add additional services that are not related to CRUD here
}