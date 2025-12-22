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
        // Get the old event before updating
        var oldEvent = await _dbSet.AsNoTracking().FirstOrDefaultAsync(e => e.Id == id);
        
        if (!updatedEntity.RoomId.HasValue || updatedEntity.RoomId == 0) {
            updatedEntity.RoomId = null;
        } else {
            // Validate that the room exists if a RoomId is provided
            var roomExists = await _context.Set<RoomsModel>()
                .AnyAsync(r => r.Id == updatedEntity.RoomId.Value);
            
            if (!roomExists)
            {
                throw new InvalidOperationException($"Room with ID {updatedEntity.RoomId.Value} does not exist.");
            }
        }

        var updatedEvent =  await base.Put(id, updatedEntity);

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

        // Update related roombookings
        if (updatedEntity.RoomId.HasValue)
        {
            var existingBooking = (await _roombookingsService.Get().ConfigureAwait(false))
                .FirstOrDefault(rb => rb.EventId == id);

            if (existingBooking != null)
            {
                existingBooking.RoomId = updatedEntity.RoomId.Value;
                existingBooking.BookingDate = updatedEntity.EventDate.Date;
                existingBooking.StartTime = updatedEntity.EventDate.TimeOfDay;
                existingBooking.EndTime = updatedEntity.EventDate.AddMinutes(updatedEntity.DurationMinutes).TimeOfDay;

                await _roombookingsService.Put(existingBooking.Id, existingBooking).ConfigureAwait(false);
            }
            else
            {
                var newBooking = new RoomBookingsModel
                {
                    RoomId = updatedEntity.RoomId.Value,
                    UserId = updatedEntity.CreatedBy,
                    BookingDate = updatedEntity.EventDate.Date,
                    StartTime = updatedEntity.EventDate.TimeOfDay,
                    EndTime = updatedEntity.EventDate.AddMinutes(updatedEntity.DurationMinutes).TimeOfDay,
                    EventId = updatedEvent.Id,
                    Purpose = $"Event Booking {updatedEvent.Title}"
                };

                await _roombookingsService.Post(newBooking).ConfigureAwait(false);
            }
        }
        else
        {
            // If RoomId is null, remove existing booking if any
            var existingBooking = (await _roombookingsService.Get().ConfigureAwait(false))
                .FirstOrDefault(rb => rb.EventId == id);

            if (existingBooking != null) {
                await _roombookingsService.Delete(existingBooking).ConfigureAwait(false);
            }
        }

        return updatedEvent;
    }

    public override async Task<EventsModel> Post(EventsModel newEntity)
    {
        // Validate that the room exists if a RoomId is provided
        if (newEntity.RoomId.HasValue)
        {
            var roomExists = await _context.Set<RoomsModel>()
                .AnyAsync(r => r.Id == newEntity.RoomId.Value);
            
            if (!roomExists)
            {
                throw new InvalidOperationException($"Room with ID {newEntity.RoomId.Value} does not exist.");
            }
        }

        var createdEvent = await base.Post(newEntity);

        // Create related roombookings
        if (newEntity.RoomId.HasValue)
        {
            var roomBooking = new RoomBookingsModel
            {
                RoomId = newEntity.RoomId.Value,
                UserId = newEntity.CreatedBy,
                BookingDate = newEntity.EventDate.Date,
                StartTime = newEntity.EventDate.TimeOfDay,
                EndTime = newEntity.EventDate.AddMinutes(newEntity.DurationMinutes).TimeOfDay,
                EventId = createdEvent.Id,
                Purpose = "Event Booking " + createdEvent.Title
            };

            await _roombookingsService.Post(roomBooking).ConfigureAwait(false);
        }

        return createdEvent;
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

        // Delete related event participations using the service (generates canceled notifications)
        var relatedParticipations = await _context.Set<EventParticipationModel>()
            .Where(ep => ep.EventId == id)
            .ToListAsync()
            .ConfigureAwait(false);

        foreach (var participation in relatedParticipations)
        {
            await _eventparticipationService.Delete(participation).ConfigureAwait(false);
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