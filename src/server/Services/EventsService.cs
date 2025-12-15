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

    public EventsService(AppDbContext ctx, IEventParticipationService eventparticipationService, IRoomBookingsService roombookingsService) : base(ctx)
    {
        _eventparticipationService = eventparticipationService ?? throw new ArgumentNullException(nameof(eventparticipationService));
        _roombookingsService = roombookingsService ?? throw new ArgumentNullException(nameof(roombookingsService));
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
        
        var updatedEvent =  await base.Put(id, updatedEntity);

        // Update related reminders with old and new event data
        await _eventparticipationService.UpdateEventRemindersAsync(id, oldEvent, updatedEvent).ConfigureAwait(false);

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

    // Add additional services that are not related to CRUD here
}