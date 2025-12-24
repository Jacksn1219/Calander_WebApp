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
        NormalizeLocation(updatedEntity);
        ValidateEventTimes(updatedEntity.EventDate, updatedEntity.EndTime);

        var updatedEvent =  await base.Put(id, updatedEntity);

        // Update related reminders
        try
        {
            await _eventparticipationService.UpdateEventRemindersAsync(id).ConfigureAwait(false);
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
        NormalizeLocation(newEntity);
        ValidateEventTimes(newEntity.EventDate, newEntity.EndTime);

        var createdEvent = await base.Post(newEntity);

        await SyncRoomBookingAsync(createdEvent, newEntity).ConfigureAwait(false);

        return createdEvent;
    }

    private static void NormalizeLocation(EventsModel entity)
    {
        if (entity.RoomId.HasValue && string.IsNullOrWhiteSpace(entity.Location))
        {
            entity.Location = $"Room {entity.RoomId.Value}";
        }
        else if (entity.Location != null)
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

    private async Task SyncRoomBookingAsync(EventsModel persistedEvent, EventsModel payload)
    {
        // Remove booking if no room selected
        if (!payload.RoomId.HasValue)
        {
            var existingBooking = (await _roombookingsService.Get().ConfigureAwait(false))
                .FirstOrDefault(rb => rb.EventId == persistedEvent.Id);

            if (existingBooking != null)
            {
                await _roombookingsService.Delete(existingBooking).ConfigureAwait(false);
            }
            return;
        }

        var roomId = payload.RoomId.Value;
        var start = payload.EventDate;
        var end = payload.EndTime;

        var bookingDate = start.Date;
        var startTime = start.TimeOfDay;
        var endTime = end.TimeOfDay;

        // Availability check ignoring the current event's booking
        var dayBookings = (await _roombookingsService.Get().ConfigureAwait(false))
            .Where(rb => rb.RoomId == roomId && rb.BookingDate == bookingDate && rb.EventId != persistedEvent.Id)
            .ToList();

        var hasOverlap = dayBookings.Any(rb => rb.StartTime < endTime && rb.EndTime > startTime);
        if (hasOverlap)
        {
            throw new InvalidOperationException("Room is not available for the selected time range.");
        }

        var existing = (await _roombookingsService.Get().ConfigureAwait(false))
            .FirstOrDefault(rb => rb.EventId == persistedEvent.Id);

        if (existing != null)
        {
            existing.RoomId = roomId;
            existing.BookingDate = bookingDate;
            existing.StartTime = startTime;
            existing.EndTime = endTime;

            await _roombookingsService.Put(existing.Id, existing).ConfigureAwait(false);
        }
        else
        {
            var newBooking = new RoomBookingsModel
            {
                RoomId = roomId,
                UserId = payload.CreatedBy,
                BookingDate = bookingDate,
                StartTime = startTime,
                EndTime = endTime,
                EventId = persistedEvent.Id,
                Purpose = $"Event Booking {persistedEvent.Title}"
            };

            await _roombookingsService.Post(newBooking).ConfigureAwait(false);
        }
    }

    // Add additional services that are not related to CRUD here
}