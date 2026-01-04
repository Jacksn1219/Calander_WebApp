using Calender_WebApp.Models;

namespace Calender_WebApp.Services.Interfaces
{
    /// <summary>
    /// Contract for managing room bookings with conflict detection and availability checking.
    /// Handles room reservations with time slot validation and automatic reminder generation.
    /// 
    /// Key Operations:
    /// - Overlap detection preventing double bookings
    /// - Time normalization to date + separate time spans
    /// - Composite key deletion (RoomId + UserId + Date + Times)
    /// - Change notifications when booking times are updated
    /// - Available room queries with conflict checking
    /// 
    /// Note: Patch operations disabled; use UpdateStartTime/UpdateEndTime for modifications.
    /// </summary>
    public interface IRoomBookingsService : ICrudService<RoomBookingsModel>
    {
        public Task<RoomBookingsModel> Delete(RoomBookingsModel model); 
        public Task<List<RoomBookingsModel>> GetBookingsByUserIdAsync(int userId);
        public Task<RoomBookingsModel?> GetByIdAsync(int id);
        // ====================================================================
        // Methods below can be used if the front end needs them
        // ====================================================================
        // public Task<RoomBookingsModel> UpdateStartTime(RoomBookingsModel entity, TimeSpan newStartTime);
        // public Task<RoomBookingsModel> UpdateEndTime(RoomBookingsModel entity, TimeSpan newEndTime);
        // public Task<bool> IsRoomAvailableAsync(int roomId, DateTime start, DateTime end);
        // public Task<List<RoomBookingsModel>> GetBookingsForRoomAsync(int roomId); 
        // public Task<List<RoomsModel>> GetAvailableRoomsAsync(DateTime start, DateTime end); 

    }
}