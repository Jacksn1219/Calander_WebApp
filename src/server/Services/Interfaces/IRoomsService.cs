using Calender_WebApp.Models;

namespace Calender_WebApp.Services.Interfaces
{
    /// <summary>
    /// Contract for managing room entities with availability and capacity filtering.
    /// Provides room lookup and availability checking through booking service integration.
    /// 
    /// Key Operations:
    /// - Name-based room lookup
    /// - Availability checking via booking service delegation
    /// - Capacity-based room filtering with availability validation
    /// </summary>
    public interface IRoomsService : ICrudService<RoomsModel>
    {
        public Task<RoomsModel> GetRoomByNameAsync(string name);
        public Task<bool> IsRoomAvailableAsync(int roomId, DateTime start, DateTime end);
        public Task<List<RoomsModel>> GetAvailableRoomsByCapacityAsync(DateTime start, DateTime end, int capacity);
        public Task<bool> ValidateRoomNameForCreate(string roomName);
        public Task<bool> ValidateRoomNameForUpdate(int roomId, string roomName);
    }
}