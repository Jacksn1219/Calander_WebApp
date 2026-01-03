using Calender_WebApp.Models;
using Calender_WebApp.Services.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace Calender_WebApp.Services;

/// <summary>
/// Manages room entities with availability checking and capacity filtering.
/// 
/// Business Logic:
/// - Provides name-based room lookup
/// - Delegates availability checks to RoomBookingsService
/// - Filters rooms by capacity with availability validation
/// - Checks bookings across date ranges for availability queries
/// 
/// Dependencies:
/// - IRoomBookingsService for availability checking logic
/// </summary>
public class RoomsService : CrudService<RoomsModel>, IRoomsService
{
    private readonly IRoomBookingsService _roomBookingsService;

    public RoomsService(AppDbContext ctx, IRoomBookingsService rbs) : base(ctx)
    {
        _roomBookingsService = rbs;
    }

    public async Task<RoomsModel> GetRoomByNameAsync(string name)
    {
        return await _dbSet.FirstOrDefaultAsync(r => r.RoomName == name)
            ?? throw new InvalidOperationException("Room not found.");
    }
        
    /// <summary>
    /// Filters available rooms by capacity using overlap detection.
    /// Excludes rooms with overlapping bookings in specified time range.
    /// </summary>
    public async Task<List<RoomsModel>> GetAvailableRoomsByCapacityAsync(DateTime start, DateTime end, int capacity)
    {
        var startDay = start.Date;
        var endDay = end.Date;
        var startTime = start.TimeOfDay;
        var endTime = end.TimeOfDay;

        var bookingsInRange = await _context.Set<RoomBookingsModel>()
            .Where(rb => rb.BookingDate >= startDay && rb.BookingDate <= endDay)
            .ToListAsync();

        var unavailableRoomIds = bookingsInRange
            .Where(rb => rb.StartTime < endTime && rb.EndTime > startTime)
            .Select(rb => rb.RoomId)
            .Distinct()
            .ToHashSet();

        return await _dbSet
            .Where(room => room.Id.HasValue && !unavailableRoomIds.Contains(room.Id.Value) && room.Capacity >= capacity)
            .ToListAsync();
    }

    public async Task<bool> IsRoomAvailableAsync(int roomId, DateTime start, DateTime end)
    {
        return await _roomBookingsService.IsRoomAvailableAsync(roomId, start, end);
    }

    /// <summary>
    /// Validates that a room name doesn't already exist for creation.
    /// Returns true if name is available (doesn't exist), false if name already exists.
    /// </summary>
    public async Task<bool> ValidateRoomNameForCreate(string roomName)
    {
        try
        {
            var existingRoom = await GetRoomByNameAsync(roomName).ConfigureAwait(false);
            if (existingRoom != null)
            {
                return false; // Name already exists
            }
        }
        catch (InvalidOperationException)
        {
            // Room not found, name is available
        }
        return true;
    }

    /// <summary>
    /// Validates that a room name doesn't conflict with another room for update.
    /// Returns true if name is available (doesn't exist or belongs to the same room), false if name belongs to another room.
    /// </summary>
    public async Task<bool> ValidateRoomNameForUpdate(int roomId, string roomName)
    {
        try
        {
            var existingRoom = await GetRoomByNameAsync(roomName).ConfigureAwait(false);
            if (existingRoom != null && existingRoom.Id != roomId)
            {
                return false; // Name belongs to another room
            }
        }
        catch (InvalidOperationException)
        {
            // Room not found, name is available
        }
        return true;
    }
}