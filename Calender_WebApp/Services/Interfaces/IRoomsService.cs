using Calender_WebApp.Models;

namespace Calender_WebApp.Services.Interfaces
{
    public interface IRoomsService : ICrudService<RoomsModel>
    {
        public Task<RoomsModel> GetRoomByNameAsync(string name);
        public Task<List<RoomsModel>> GetAvailableRoomsAsync(DateTime start, DateTime end);
        public Task<bool> IsRoomAvailableAsync(int roomId, DateTime start, DateTime end);

        // Add any additional methods specific to Rooms here if needed
    }
}