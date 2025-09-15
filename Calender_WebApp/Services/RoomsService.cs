namespace Calender_WebApp.Services;

/// <summary>
/// Service for managing Room entities.
/// </summary>
public class RoomsService : CrudService<RoomModel>, IRoomService
{
    private readonly DatabaseContext _context;

    public RoomsService(DatabaseContext ctx) : base(ctx)
    {
        _context = ctx;
    }

    /// <summary>
    /// Gets a room by its name.
    /// </summary>
    public async Task<RoomModel?> GetRoomByNameAsync(string name)
    {
        return await _context.Rooms.FirstOrDefaultAsync(r => r.Name == name);
    }

    /// <summary>
    /// Gets all available rooms.
    /// </summary>
    public async Task<List<RoomModel>> GetAvailableRoomsAsync()
    {
        return await _context.Rooms.Where(r => r.IsAvailable).ToListAsync();
    }

    /// <summary>
    /// Checks if a room is available.
    /// </summary>
    public async Task<bool> IsRoomAvailableAsync(int roomId)
    {
        var room = await _context.Rooms.FindAsync(roomId);
        return room != null && room.IsAvailable;
    }

    // Add additional services that are not related to CRUD here
}