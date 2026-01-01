using Calender_WebApp.Models;

namespace Calender_WebApp.Services.Interfaces
{
    public interface IOfficeAttendanceService : ICrudService<OfficeAttendanceModel>
    {
        Task<OfficeAttendanceModel> GetAttendanceByUserAndDateAsync(int userId, DateTime date);
        Task<List<OfficeAttendanceModel>> GetAttendancesByDateAsync(DateTime date);
        Task<List<OfficeAttendanceModel>> GetAttendancesByUserIdAsync(int userId);

        // Add any additional methods specific to OfficeAttendance here if needed
        Task<OfficeAttendanceModel> UpsertAttendanceAsync(
            int userId,
            DateTime date,
            AttendanceStatus status
        );
    }
}