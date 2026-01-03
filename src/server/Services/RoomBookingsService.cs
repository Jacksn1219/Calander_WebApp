using Calender_WebApp.Models;
using Calender_WebApp.Models.Interfaces;
using Calender_WebApp.Services.Interfaces;
using Calender_WebApp.Utils;
using Microsoft.EntityFrameworkCore;

namespace Calender_WebApp.Services;

/// <summary>
/// Manages room bookings with overlap detection and automatic reminder generation.
/// 
/// Business Logic:
/// - Normalizes dates to midnight and times to hour:minute precision
/// - Validates EndTime > StartTime
/// - Prevents overlapping bookings for same room on same day
/// - Prevents exact duplicate bookings
/// - Creates automatic reminders on booking creation
/// - Sends change notifications when booking times updated
/// - Uses composite key deletion (RoomId + UserId + Date + Times)
/// 
/// Dependencies:
/// - IRemindersService for automatic reminder creation and change notifications
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

    public Task<RoomBookingsModel> Delete(int id)
        => throw new NotSupportedException("Direct deletion by ID is not supported for RoomBookings. Implement custom deletion logic if needed.");

    /// <summary>
    /// Deletes booking using composite key and sends cancellation notification.
    /// Soft-deletes related reminders by marking as read.
    /// </summary>
    public async Task<RoomBookingsModel> Delete(RoomBookingsModel model)
    {
        var normalizedDate = model.BookingDate.Date;
        var booking = await _dbSet
            .FirstOrDefaultAsync(rb => rb.RoomId == model.RoomId &&
                                       rb.UserId == model.UserId &&
                                       rb.BookingDate == normalizedDate &&
                                       rb.StartTime == model.StartTime &&
                                       rb.EndTime == model.EndTime
            );

        if (booking == null)
            throw new InvalidOperationException("Booking not found.");

        var bookingDateTime = booking.BookingDate.Add(booking.StartTime);

        var relatedEvent = await _context.Events
            .FirstOrDefaultAsync(e => e.BookingId == booking.Id &&
                         e.EventDate == booking.BookingDate.Add(booking.StartTime) &&
                         e.EndTime.TimeOfDay == booking.EndTime)
            .ConfigureAwait(false);
        
        var relatedEventId = relatedEvent?.Id ?? 0;

        await _remindersService.Post(new RemindersModel
        {
            UserId = booking.UserId,
            ReminderType = reminderType.RoomBookingCanceled,
            RelatedRoomId = booking.RoomId,
            RelatedEventId = relatedEventId,
            ReminderTime = DateTime.Now,
            Title = $"Room {booking.RoomId} Booking Canceled",
            Message = $"Your room booking for Room {booking.RoomId} scheduled for {bookingDateTime:yyyy-MM-dd HH:mm} has been canceled."
        }).ConfigureAwait(false);

        await _remindersService.DeleteRoomBookingRemindersAsync(booking.UserId, booking.RoomId, booking.BookingDate, booking.StartTime);

        _dbSet.Remove(booking);
        await _context.SaveChangesAsync();
        return booking;
    }
    
    public virtual async Task<RoomBookingsModel[]> Get()
        => await _dbSet.AsNoTracking().ToArrayAsync().ConfigureAwait(false);
    
    public async Task<RoomBookingsModel> GetById(int id)
    {
        var booking = await _dbSet.AsNoTracking().FirstOrDefaultAsync(rb => rb.Id == id).ConfigureAwait(false);
        return booking ?? throw new InvalidOperationException("Booking not found.");
    }

    public async Task<RoomBookingsModel?> GetByIdAsync(int id)
    {
        return await _dbSet.AsNoTracking().FirstOrDefaultAsync(rb => rb.Id == id).ConfigureAwait(false);
    }

    /// <summary>
    /// Updates booking with time normalization, overlap detection, and duplicate prevention.
    /// Validates EndTime > StartTime and checks for conflicting bookings on same day.
    /// </summary>
    public async Task<RoomBookingsModel> Put(int id, RoomBookingsModel newNewRoombooking)
    {
        if (newNewRoombooking == null) throw new ArgumentNullException(nameof(newNewRoombooking));
        var dbNewRoombooking = await _dbSet.FindAsync(id).ConfigureAwait(false);
        if (dbNewRoombooking == null) throw new InvalidOperationException("Entity not found.");

        newNewRoombooking.BookingDate = newNewRoombooking.BookingDate.Date;
        newNewRoombooking.StartTime = new TimeSpan(newNewRoombooking.StartTime.Hours, newNewRoombooking.StartTime.Minutes, 0);
        newNewRoombooking.EndTime = new TimeSpan(newNewRoombooking.EndTime.Hours, newNewRoombooking.EndTime.Minutes, 0);

        if (newNewRoombooking.EndTime <= newNewRoombooking.StartTime)
            throw new ArgumentException("EndTime must be greater than StartTime.");

        var dayBookings = await _dbSet
            .Where(rb => rb.RoomId == newNewRoombooking.RoomId 
                      && rb.BookingDate == newNewRoombooking.BookingDate
                      && rb.Id != id)
            .ToListAsync();

        var exactExists = dayBookings.Any(rb => rb.StartTime == newNewRoombooking.StartTime && rb.EndTime == newNewRoombooking.EndTime);
        if (exactExists)
            throw new InvalidOperationException("An identical booking slot already exists.");

        var overlaps = dayBookings.Any(rb => rb.StartTime < newNewRoombooking.EndTime && rb.EndTime > newNewRoombooking.StartTime);
        if (overlaps)
            throw new InvalidOperationException("Room is not available for the requested time window.");

        var validators = ModelWhitelistUtil.GetValidatorsForModel(typeof(RoomBookingsModel).Name);

        var inputDict = typeof(RoomBookingsModel)
            .GetProperties()
            .Where(p => p.Name != nameof(IDbItem.Id))
            .Where(p => validators == null || validators.ContainsKey(p.Name))
            .ToDictionary(p => p.Name, p => p.GetValue(newNewRoombooking));

        if (!ModelWhitelistUtil.ValidateModelInput(typeof(RoomBookingsModel).Name, inputDict, out var errors)) {
            throw new ArgumentException($"Model validation failed: {string.Join(", ", errors)}");
        }

        newNewRoombooking.Id = dbNewRoombooking.Id;
        _context.Entry(dbNewRoombooking).CurrentValues.SetValues(newNewRoombooking);
        await _context.SaveChangesAsync().ConfigureAwait(false);
        return dbNewRoombooking;
    }
    public Task<RoomBookingsModel> Patch(int userId, RoomBookingsModel newNewRoombooking)
        => throw new NotSupportedException("Updating room bookings is not supported. Create a new booking instead.");

    /// <summary>
    /// Updates booking start time and sends detailed change notification.
    /// Notification includes old/new times and linked event information.
    /// </summary>
    public async Task<RoomBookingsModel> UpdateStartTime(RoomBookingsModel entity, TimeSpan newStartTime)
    {
        var day = entity.BookingDate.Date;
        var booking = await _dbSet.FirstOrDefaultAsync(b =>
            b.RoomId == entity.RoomId &&
            b.BookingDate == day &&
            b.StartTime == entity.StartTime);
        if (booking == null) throw new InvalidOperationException("Booking not found.");

        var oldStartTime = booking.StartTime;
        var oldEndTime = booking.EndTime;
        booking.StartTime = newStartTime;

        var bookingDateTime = booking.BookingDate.Add(newStartTime);

        var relatedEvent = await _context.Events
            .FirstOrDefaultAsync(e => e.BookingId == booking.Id &&
                         e.EventDate == booking.BookingDate.Add(booking.StartTime) &&
                         e.EndTime.TimeOfDay == booking.EndTime)
            .ConfigureAwait(false);
        
        var relatedEventId = relatedEvent?.Id ?? 0;

        await _remindersService.Post(new RemindersModel
        {
            UserId = entity.UserId,
            ReminderType = reminderType.RoomBookingChanged,
            RelatedRoomId = entity.RoomId,
            RelatedEventId = relatedEventId,
            ReminderTime = bookingDateTime,
            Title = $"Room {entity.RoomId} Booking Changed",
            Message = $"Your room booking for Room {entity.RoomId} has been changed:\nStart time: {oldStartTime:hh\\:mm} → {newStartTime:hh\\:mm}\nEnd time: {oldEndTime:hh\\:mm} (unchanged)\n\nBooking starts: {bookingDateTime:yyyy-MM-dd HH:mm}",
        }).ConfigureAwait(false);

        await _context.SaveChangesAsync();
        return booking;
    }

    /// <summary>
    /// Updates booking end time and sends detailed change notification.
    /// Notification includes old/new times and linked event information.
    /// </summary>
    public async Task<RoomBookingsModel> UpdateEndTime(RoomBookingsModel entity, TimeSpan newEndTime)
    {
        var day = entity.BookingDate.Date;
        var booking = await _dbSet.FirstOrDefaultAsync(b =>
            b.RoomId == entity.RoomId &&
            b.BookingDate == day &&
            b.StartTime == entity.StartTime);
        if (booking == null) throw new InvalidOperationException("Booking not found.");

        var oldEndTime = booking.EndTime;
        booking.EndTime = newEndTime;
        
        var bookingDateTime = booking.BookingDate.Add(booking.StartTime);

        var relatedEvent = await _context.Events
            .FirstOrDefaultAsync(e => e.BookingId == booking.Id &&
                         e.EventDate == booking.BookingDate.Add(booking.StartTime) &&
                         e.EndTime.TimeOfDay == booking.EndTime)
            .ConfigureAwait(false);
        
        var relatedEventId = relatedEvent?.Id ?? 0;

        await _remindersService.Post(new RemindersModel
        {
            UserId = entity.UserId,
            ReminderType = reminderType.RoomBookingChanged,
            RelatedRoomId = entity.RoomId,
            RelatedEventId = relatedEventId,
            ReminderTime = bookingDateTime,
            Title = $"Room {entity.RoomId} Booking Changed",
            Message = $"Your room booking for Room {entity.RoomId} has been changed:\nStart time: {booking.StartTime:hh\\:mm} (unchanged)\nEnd time: {oldEndTime:hh\\:mm} → {newEndTime:hh\\:mm}\n\nBooking starts: {bookingDateTime:yyyy-MM-dd HH:mm}",
        }).ConfigureAwait(false);
        
        await _context.SaveChangesAsync();
        return booking;
    }

    /// <summary>
    /// Creates booking with overlap detection, duplicate prevention, and automatic reminder generation.
    /// Validates times, checks for conflicts, and creates reminder with room details.
    /// </summary>
    public async Task<RoomBookingsModel> Post(RoomBookingsModel model)
    {
        if (model == null) throw new ArgumentNullException(nameof(model));

        model.BookingDate = model.BookingDate.Date;
        model.StartTime = new TimeSpan(model.StartTime.Hours, model.StartTime.Minutes, 0);
        model.EndTime = new TimeSpan(model.EndTime.Hours, model.EndTime.Minutes, 0);

        if (model.EndTime <= model.StartTime)
            throw new ArgumentException("EndTime must be greater than StartTime.");

        var dayBookings = await _dbSet
            .Where(rb => rb.RoomId == model.RoomId && rb.BookingDate == model.BookingDate)
            .ToListAsync();

        var exactExists = dayBookings.Any(rb => rb.StartTime == model.StartTime && rb.EndTime == model.EndTime);
        if (exactExists)
            throw new InvalidOperationException("An identical booking slot already exists.");

        var overlaps = dayBookings.Any(rb => rb.StartTime < model.EndTime && rb.EndTime > model.StartTime);
        if (overlaps)
            throw new InvalidOperationException("Room is not available for the requested time window.");

        var inputDict = typeof(RoomBookingsModel)
            .GetProperties()
            .Where(p => p.Name != nameof(IDbItem.Id)
                        && p.Name != nameof(RoomBookingsModel.Room)
                        && p.Name != nameof(RoomBookingsModel.Employee))
            .ToDictionary(p => p.Name, p => p.GetValue(model));

        if (!ModelWhitelistUtil.ValidateModelInput(typeof(RoomBookingsModel).Name, inputDict, out var errors)) {
            throw new ArgumentException($"Model validation failed: {string.Join(", ", errors)}");
        }

        if (model.Room == null) {
            model.Room = await _context.Rooms.FindAsync(model.RoomId).ConfigureAwait(false);
        }

        var entry = await _dbSet.AddAsync(model).ConfigureAwait(false);

        var relatedEvent = await _context.Events
            .FirstOrDefaultAsync(e => e.BookingId == model.Id &&
                         e.EventDate == model.BookingDate.Add(model.StartTime) &&
                         e.EndTime.TimeOfDay == model.EndTime)
            .ConfigureAwait(false);
        
        var relatedEventId = relatedEvent?.Id ?? 0;

        await _remindersService.Post(new RemindersModel
        {
            UserId = model.UserId,
            ReminderType = reminderType.RoomBooking,
            RelatedRoomId = model.RoomId,
            RelatedEventId = relatedEventId,
            ReminderTime = model.BookingDate.Add(model.StartTime),
            Title = $"Room {model.RoomId} Booking",
            Message = $"You have a room booking for Room {model.Room!.RoomName} located at {model.Room!.Location} starting at {model.BookingDate.ToString("dd MMM", new System.Globalization.CultureInfo("nl-NL"))} {model.BookingDate.Add(model.StartTime).ToString("HH:mm", new System.Globalization.CultureInfo("nl-NL"))}.",
        }).ConfigureAwait(false);

        await _context.SaveChangesAsync().ConfigureAwait(false);
        return entry.Entity;
    }

    public async Task<List<RoomBookingsModel>> GetBookingsForRoomAsync(int roomId)
    {
        return await _dbSet
            .Where(rb => rb.RoomId == roomId)
            .ToListAsync();
    }

    public async Task<List<RoomBookingsModel>> GetBookingsByUserIdAsync(int userId)
    {
        return await _dbSet
            .Where(rb => rb.UserId == userId)
            .OrderByDescending(rb => rb.BookingDate)
            .ToListAsync();
    }

    public async Task<List<RoomsModel>> GetAvailableRoomsAsync(DateTime start, DateTime end)
    {
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

    public async Task<bool> IsRoomAvailableAsync(int roomId, DateTime start, DateTime end)
    {
        var day = start.Date;
        var startTime = start.TimeOfDay;
        var endTime = end.TimeOfDay;

        var dayBookings = await _dbSet
            .Where(rb => rb.RoomId == roomId && rb.BookingDate == day)
            .ToListAsync();

        var hasOverlap = dayBookings.Any(rb => rb.StartTime < endTime && rb.EndTime > startTime);
        return !hasOverlap;
    }
}