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

    public RoomsService(DatabaseContext ctx, IRoomBookingsService rbs) : base(ctx)
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

    /// <summary>
    /// Gets all available rooms for the given date range.
    /// </summary>
    /// <param name="start"></param>
    /// <param name="end"></param>
    /// <returns>A list of available rooms for the specified date range.</returns>
    public async Task<List<RoomsModel>> GetAvailableRoomsAsync(DateTime start, DateTime end)
    {
        var bookedRoomIds = await _context.RoomBookings
            .Where(rb => rb.StartTime < end && rb.EndTime > start)
            .Select(rb => rb.RoomId)
            .Distinct()
            .ToListAsync();

        return await _dbSet
            .Where(r => !bookedRoomIds.Contains(r.Id))
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