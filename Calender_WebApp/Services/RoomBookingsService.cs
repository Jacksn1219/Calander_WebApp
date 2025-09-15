namespace Calender_WebApp.Services;

/// <summary>
/// Service for managing room bookings.
/// </summary>
public class RoomBookingsService : CrudService<RoomBookingModel>, IRoomBookingsService
{
    private readonly DatabaseContext _context;

    public RoomBookingsService(DatabaseContext ctx) : base(ctx)
    {
        _context = ctx;
    }

    /// <summary>
    /// Gets all bookings for a specific room.
    /// </summary>
    public async Task<List<RoomBookingModel>> GetBookingsForRoomAsync(int roomId)
    {
        return await _context.RoomBookings
            .Where(rb => rb.RoomId == roomId)
            .ToListAsync();
    }

    /// <summary>
    /// Checks if a room is available for the given time range.
    /// </summary>
    public async Task<bool> IsRoomAvailableAsync(int roomId, DateTime start, DateTime end)
    {
        return !await _context.RoomBookings
            .AnyAsync(rb => rb.RoomId == roomId &&
                            rb.StartTime < end &&
                            rb.EndTime > start);
    }

    // Add additional services that are not related to CRUD here
}