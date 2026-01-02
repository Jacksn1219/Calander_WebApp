using Calender_WebApp.Models;

namespace Calender_WebApp.Services.Interfaces
{
    public interface IOfficeAttendanceService : ICrudService<OfficeAttendanceModel>
    {
        Task<OfficeAttendanceModel> GetAttendanceByUserAndDateAsync(int userId, DateTime date);
        Task<List<OfficeAttendanceModel>> GetAttendancesByDateAsync(DateTime date);
        Task<List<OfficeAttendanceModel>> GetAttendancesByUserIdAsync(int userId);
        Task<OfficeAttendanceModel> UpsertAttendanceAsync(
            int userId,
            DateTime date,
            AttendanceStatus status
        );
    }
}