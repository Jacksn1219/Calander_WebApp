using Calender_WebApp.Models;
using Calender_WebApp.Services.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace Calender_WebApp.Services;

/// <summary>
/// Service for managing Room entities.
/// </summary>
public class RoomsService : CrudService<RoomsModel>, IRoomsService
{
    private readonly IRoomBookingsService _roomBookingsService;

    public RoomsService(AppDbContext ctx, IRoomBookingsService rbs) : base(ctx)
    {
        _roomBookingsService = rbs;
    }

    /// <summary>
    /// Get a room by its name.
    /// </summary>
    /// <param name="name"></param>
    /// <returns>The room with the specified name.</returns>
    /// <exception cref="InvalidOperationException">Thrown when the room is not found.</exception>
    public async Task<RoomsModel> GetRoomByNameAsync(string name)
    {
        return await _dbSet.FirstOrDefaultAsync(r => r.RoomName == name)
            ?? throw new InvalidOperationException("Room not found.");
    }
        public async Task<List<RoomsModel>> GetAvailableRoomsByCapacityAsync(DateTime start, DateTime end, int capacity)
    {
        var startDay = start.Date;
        var endDay = end.Date;
        var startTime = start.TimeOfDay;
        var endTime = end.TimeOfDay;

        // Query RoomBookings for bookings in the date range
        var bookingsInRange = await _context.Set<RoomBookingsModel>()
            .Where(rb => rb.BookingDate >= startDay && rb.BookingDate <= endDay)
            .ToListAsync();

        var unavailableRoomIds = bookingsInRange
            .Where(rb => rb.StartTime < endTime && rb.EndTime > startTime)
            .Select(rb => rb.RoomId)
            .Distinct()
            .ToHashSet();

        // Query RoomsModel for available rooms
        return await _dbSet
            .Where(room => room.Id.HasValue && !unavailableRoomIds.Contains(room.Id.Value) && room.Capacity >= capacity)
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
        return await _roomBookingsService.IsRoomAvailableAsync(roomId, start, end);
    }

    // Add additional services that are not related to CRUD here
}