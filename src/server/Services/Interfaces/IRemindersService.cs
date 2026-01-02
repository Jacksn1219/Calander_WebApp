using Calender_WebApp.Models;

namespace Calender_WebApp.Services.Interfaces
{
    public interface IRemindersService : ICrudService<RemindersModel>
    {
        Task<RemindersModel[]> GetByUserId(int userId);
        Task<RemindersModel[]> GetNextRemindersAsync(int userId, DateTime fromTime, DateTime toTime);
        Task<RemindersModel[]> GetRemindersByRelatedRoomAsync(int relatedUserId, int relatedRoomId, DateTime bookingDate, TimeSpan startTime);
        Task<RemindersModel> DeleteRoomBookingRemindersAsync(int relatedUserId, int relatedRoomId, DateTime bookingDate, TimeSpan startTime);
        Task<RemindersModel[]> GetRemindersByRelatedEventAsync(int relatedUserId, int relatedEventId);
        Task<RemindersModel> DeleteEventParticipationRemindersAsync(int relatedUserId, int relatedEventId);
        Task<bool> MarkReminderAsReadAsync(int reminderId);
    }
}