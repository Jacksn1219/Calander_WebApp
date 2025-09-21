using Calender_WebApp.Models;

namespace Calender_WebApp.Services.Interfaces
{
    public interface IOfficeAttendanceService : ICrudService<OfficeAttendanceModel>
    {
        Task<OfficeAttendanceModel> GetAttendanceByUserAndDateAsync(int userId, DateTime date);
        Task<List<OfficeAttendanceModel>> GetAttendancesByDateAsync(DateTime date);

        // Add any additional methods specific to OfficeAttendance here if needed
    }
}