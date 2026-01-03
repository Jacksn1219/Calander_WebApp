using Calender_WebApp.Models;

namespace Calender_WebApp.Services.Interfaces
{
    /// <summary>
    /// Contract for managing office attendance records with upsert capability.
    /// Tracks employee presence status (Present, Absent, Remote, Leave) by date.
    /// 
    /// Key Operations:
    /// - Date-based attendance tracking with normalized dates
    /// - Upsert pattern to prevent duplicate records per user per day
    /// - Attendance status updates without creating duplicates
    /// </summary>
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