using Calender_WebApp.Models;
using Calender_WebApp.Models.Interfaces;
using Calender_WebApp.Services.Interfaces;
using Calender_WebApp.Utils;
using Microsoft.EntityFrameworkCore;

namespace Calender_WebApp.Services;

/// <summary>
/// Service for managing room bookings.
/// </summary>
public class RoomBookingsService : IRoomBookingsService
{
    private readonly AppDbContext _context;
    private readonly DbSet<RoomBookingsModel> _dbSet;
    private readonly IRemindersService _remindersService;

    public RoomBookingsService(AppDbContext ctx, IRemindersService remindersService)
    {
        _context = ctx ?? throw new ArgumentNullException(nameof(ctx));
        _dbSet = _context.Set<RoomBookingsModel>();
        _remindersService = remindersService ?? throw new ArgumentNullException(nameof(remindersService));
    }

    /// <summary>
    /// Deletes a room booking by its ID is not supported. Use the Delete method with the model instead.
    /// </summary>
    /// <param name="id"></param>
    /// <returns>This method is not supported.</returns>
    /// <exception cref="NotSupportedException">Thrown when attempting to delete a room booking by ID.</exception>
    public Task<RoomBookingsModel> Delete(int id)
        => throw new NotSupportedException("Direct deletion by ID is not supported for RoomBookings. Implement custom deletion logic if needed.");

    /// <summary>
    /// Deletes a room booking based on the provided model details.
    /// </summary>
    /// <param name="model">The room booking model containing details to identify the booking.</param>
    /// <returns>The deleted room booking.</returns>
    /// <exception cref="InvalidOperationException">Thrown when the booking is not found.</exception>
    public async Task<RoomBookingsModel> Delete(RoomBookingsModel model)
    {
        var normalizedDate = model.BookingDate.Date;
        var booking = await _dbSet
            .FirstOrDefaultAsync(rb => rb.RoomId == model.RoomId &&
                                       rb.UserId == model.UserId &&
                                       rb.EventId == model.EventId &&
                                       rb.BookingDate == normalizedDate &&
                                       rb.StartTime == model.StartTime &&
                                       rb.EndTime == model.EndTime
            );

        if (booking == null)
            throw new InvalidOperationException("Booking not found.");

        _dbSet.Remove(booking);
        await _context.SaveChangesAsync();
        return booking;
    }
    
    /// <summary>
    /// Gets all entities of type RoomBookingsModel.
    /// </summary>
    /// <returns>List of RoomBookingsModel</returns>
    public virtual async Task<RoomBookingsModel[]> Get()
        => await _dbSet.AsNoTracking().ToArrayAsync().ConfigureAwait(false);
    
    /// <summary>
    /// Getting a room booking by its ID is not supported. Use GetBookingsForRoomAsync instead.
    /// </summary>
    /// <param name="id"></param>
    /// <returns>This method is not supported.</returns>
    /// <exception cref="NotSupportedException">Thrown when attempting to get a room booking by ID.</exception>
    public Task<RoomBookingsModel> GetById(int id)
        => throw new NotSupportedException("Direct access by ID is not supported for RoomBookings. Use GetBookingsForRoomAsync instead.");

    /// <summary>
    /// Updating room bookings is not supported. Use UpdateStartTime, UpdateEndTime or Post methods instead.
    /// </summary>
    /// <param name="id"></param>
    /// <param name="entity"></param>
    /// <returns>This method is not supported.</returns>
    /// <exception cref="NotSupportedException">Thrown when attempting to update a room booking.</exception>
    public Task<RoomBookingsModel> Put(int id, RoomBookingsModel entity)
        => throw new NotSupportedException("Updating room bookings is not supported. Create a new booking instead.");

    /// <summary>
    /// Covers the Patch method from CrudService, but is not supported.
    /// </summary>
    /// <param name="userId"></param>
    /// <param name="newTEntity"></param>
    /// <returns>This method is not supported.</returns>
    /// <exception cref="NotSupportedException">Thrown when attempting to update a room booking.</exception>
    public Task<RoomBookingsModel> Patch(int userId, RoomBookingsModel newTEntity)
        => throw new NotSupportedException("Updating room bookings is not supported. Create a new booking instead.");

    /// <summary>
    /// Updates the start time of an existing room booking.
    /// </summary>
    /// <param name="entity"></param>
    /// <param name="newStartTime"></param>
    /// <returns>The updated room booking.</returns>
    /// <exception cref="InvalidOperationException">Thrown when the booking is not found.</exception>
    public async Task<RoomBookingsModel> UpdateStartTime(RoomBookingsModel entity, TimeSpan newStartTime)
    {
        var day = entity.BookingDate.Date;
        var booking = await _dbSet.FirstOrDefaultAsync(b =>
            b.RoomId == entity.RoomId &&
            b.EventId == entity.EventId &&
            b.BookingDate == day &&
            b.StartTime == entity.StartTime);
        if (booking == null) throw new InvalidOperationException("Booking not found.");

        booking.StartTime = newStartTime;

        // Create a new "changed" reminder instead of updating the existing one
        await _remindersService.Post(new RemindersModel
        {
            UserId = entity.UserId,
            ReminderType = reminderType.RoomBookingChanged,
            RelatedRoomId = entity.RoomId,
            RelatedEventId = entity.EventId ?? 0,
            ReminderTime = booking.BookingDate.Add(newStartTime),
            Title = $"Room {entity.RoomId} Booking Changed",
            Message = $"Your room booking for Room {entity.RoomId} has been changed. New start time: {booking.BookingDate.Add(newStartTime):yyyy-MM-dd HH:mm}.",
        }).ConfigureAwait(false);

        await _context.SaveChangesAsync();
        return booking;
    }

    /// <summary>
    /// Updates the end time of an existing room booking.
    /// </summary>
    /// <param name="entity"></param>
    /// <param name="newEndTime"></param>
    /// <returns>The updated room booking.</returns>
    /// <exception cref="InvalidOperationException">Thrown when the booking is not found.</exception>
    public async Task<RoomBookingsModel> UpdateEndTime(RoomBookingsModel entity, TimeSpan newEndTime)
    {
        var day = entity.BookingDate.Date;
        var booking = await _dbSet.FirstOrDefaultAsync(b =>
            b.RoomId == entity.RoomId &&
            b.EventId == entity.EventId &&
            b.BookingDate == day &&
            b.StartTime == entity.StartTime);
        if (booking == null) throw new InvalidOperationException("Booking not found.");

        booking.EndTime = newEndTime;
        await _context.SaveChangesAsync();
        return booking;
    }

    /// <summary>
    /// Creates a new room booking.
    /// </summary>
    /// <param name="model"></param>
    /// <returns>The created room booking.</returns>
    /// <exception cref="ArgumentNullException">Thrown when the model is null.</exception>
    /// <exception cref="InvalidOperationException">Thrown when the booking already exists.</exception>
    /// <exception cref="ArgumentException">Thrown when the model validation fails.</exception>
    public async Task<RoomBookingsModel> Post(RoomBookingsModel model)
    {
        if (model == null) throw new ArgumentNullException(nameof(model));

        // Normalize date to date-only and times to minute precision (zero seconds)
        model.BookingDate = model.BookingDate.Date;
        model.StartTime = new TimeSpan(model.StartTime.Hours, model.StartTime.Minutes, 0);
        model.EndTime = new TimeSpan(model.EndTime.Hours, model.EndTime.Minutes, 0);

        if (model.EndTime <= model.StartTime)
            throw new ArgumentException("EndTime must be greater than StartTime.");

        // Load bookings for same room & date; SQLite may not translate TimeSpan comparisons
        var dayBookings = await _dbSet
            .Where(rb => rb.RoomId == model.RoomId && rb.BookingDate == model.BookingDate)
            .ToListAsync();

        // Check exact duplicate of slot (including EventId)
        var exactExists = dayBookings.Any(rb => rb.StartTime == model.StartTime && rb.EventId == model.EventId);
        if (exactExists)
            throw new InvalidOperationException("An identical booking slot already exists.");

        // Overlap check in-memory for same room & date
        var overlaps = dayBookings.Any(rb => rb.StartTime < model.EndTime && rb.EndTime > model.StartTime);
        if (overlaps)
            throw new InvalidOperationException("Room is not available for the requested time window.");

        // Validate model using whitelist util
        // Build validation input excluding navigation properties and internal IDs
        var inputDict = typeof(RoomBookingsModel)
            .GetProperties()
            .Where(p => p.Name != nameof(IDbItem.Id)
                        && p.Name != nameof(RoomBookingsModel.Room)
                        && p.Name != nameof(RoomBookingsModel.Employee)
                        && p.Name != nameof(RoomBookingsModel.Event))
            .ToDictionary(p => p.Name, p => p.GetValue(model) ?? (object)string.Empty);

        if (!ModelWhitelistUtil.ValidateModelInput(typeof(RoomBookingsModel).Name, inputDict, out var errors)) {
            throw new ArgumentException($"Model validation failed: {string.Join(", ", errors)}");
        }

        var entry = await _dbSet.AddAsync(model).ConfigureAwait(false);

        await _remindersService.Post(new RemindersModel
        {
            UserId = model.UserId,
            ReminderType = reminderType.RoomBooking,
            RelatedRoomId = model.RoomId,
            RelatedEventId = model.EventId ?? 0,
            ReminderTime = model.BookingDate.Add(model.StartTime),
            Title = $"Room {model.RoomId} Booking",
            Message = $"You have a room booking for Room {model.RoomId} starting at {model.BookingDate.Add(model.StartTime):yyyy-MM-dd HH:mm}.",
        }).ConfigureAwait(false);

        await _context.SaveChangesAsync().ConfigureAwait(false);
        return entry.Entity;
    }

    /// <summary>
    /// Gets all bookings for a specific room.
    /// </summary>
    /// <param name="roomId">The ID of the room.</param>
    /// <returns>A list of room bookings for the specified room.</returns>
    public async Task<List<RoomBookingsModel>> GetBookingsForRoomAsync(int roomId)
    {
        return await _dbSet
            .Where(rb => rb.RoomId == roomId)
            .ToListAsync();
    }

    /// <summary>
    /// Gets all bookings for a specific user.
    /// </summary>
    /// <param name="userId">The ID of the user.</param>
    /// <returns>A list of room bookings for the specified user.</returns>
    public async Task<List<RoomBookingsModel>> GetBookingsByUserIdAsync(int userId)
    {
        return await _dbSet
            .Where(rb => rb.UserId == userId)
            .OrderByDescending(rb => rb.BookingDate)
            .ToListAsync();
    }

    /// <summary>
    /// Gets all available rooms for the given date range.
    /// </summary>
    /// <param name="start"></param>
    /// <param name="end"></param>
    /// <returns>A list of available rooms for the specified date range.</returns>
    public async Task<List<RoomsModel>> GetAvailableRoomsAsync(DateTime start, DateTime end)
    {
        // Improvement: consider time overlap, not only date.
        // - Fetch bookings in the date range
        // - For each room, exclude only if any booking overlaps the requested time window
        // - Overlap rule: booking.StartTime < end.TimeOfDay && booking.EndTime > start.TimeOfDay
        // Note: Evaluate TimeSpan comparisons in-memory to avoid EF/SQLite translation issues.

        var startDay = start.Date;
        var endDay = end.Date;
        var startTime = start.TimeOfDay;
        var endTime = end.TimeOfDay;

        var bookingsInRange = await _dbSet
            .Where(rb => rb.BookingDate >= startDay && rb.BookingDate <= endDay)
            .ToListAsync();

        var unavailableRoomIds = bookingsInRange
            .Where(rb => rb.StartTime < endTime && rb.EndTime > startTime)
            .Select(rb => rb.RoomId)
            .Distinct()
            .ToHashSet();

        return await _context.Rooms
            .Where(room => room.Id.HasValue && !unavailableRoomIds.Contains(room.Id.Value))
            .ToListAsync();
    }

    /// <summary>
    /// Checks if a room is available for the given date and time range.
    /// </summary>
    /// <param name="roomId"></param>
    /// <param name="start"></param>
    /// <param name="end"></param>
    /// <returns>The availability status of the room.</returns>
    public async Task<bool> IsRoomAvailableAsync(int roomId, DateTime start, DateTime end)
    {
        var day = start.Date;
        var startTime = start.TimeOfDay;
        var endTime = end.TimeOfDay;

        // SQLite provider struggles to translate TimeSpan comparisons; evaluate overlaps in-memory
        var dayBookings = await _dbSet
            .Where(rb => rb.RoomId == roomId && rb.BookingDate == day)
            .ToListAsync();

        var hasOverlap = dayBookings.Any(rb => rb.StartTime < endTime && rb.EndTime > startTime);
        return !hasOverlap;
    }


    // Add additional services that are not related to CRUD here
}