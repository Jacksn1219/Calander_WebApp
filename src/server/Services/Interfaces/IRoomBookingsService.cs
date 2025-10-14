using Calender_WebApp.Models;

namespace Calender_WebApp.Services.Interfaces
{
    public interface IRoomBookingsService : ICrudService<RoomBookingsModel>
    {
        public Task<RoomBookingsModel> Delete(RoomBookingsModel model);
        public Task<RoomBookingsModel> UpdateStartTime(RoomBookingsModel entity, TimeSpan newStartTime);
        public Task<RoomBookingsModel> UpdateEndTime(RoomBookingsModel entity, TimeSpan newEndTime);
        public Task<List<RoomBookingsModel>> GetBookingsForRoomAsync(int roomId);
        public Task<List<RoomsModel>> GetAvailableRoomsAsync(DateTime start, DateTime end);
        public Task<bool> IsRoomAvailableAsync(int roomId, DateTime start, DateTime end);

        // Add any additional methods specific to RoomBookings here if needed
    }
}