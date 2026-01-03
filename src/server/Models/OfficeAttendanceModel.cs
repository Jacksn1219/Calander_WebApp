using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Text.Json.Serialization;
using Calender_WebApp.Models.Interfaces;

namespace Calender_WebApp.Models
{
    /// <summary>
    /// Tracks daily work location status for employees.
    /// 
    /// Values:
    /// - Present: Employee physically in the office (for in-person attendance tracking)
    /// - Absent: Employee not working (vacation, sick leave, or unplanned absence)
    /// - Remote: Employee working from home or remote location (for hybrid work policies)
    /// </summary>
    public enum AttendanceStatus
    {
        Present,
        Absent,
        Remote
    }

    /// <summary>
    /// Records daily office attendance status for employees.
    /// Used for hybrid work tracking, capacity planning, and attendance reporting.
    /// 
    /// Business Rules:
    /// - One record per employee per date (prevents duplicate entries for same day)
    /// - Date should be date-only (time component ignored)
    /// - Status can be updated throughout the day (e.g., planned Remote changed to Present)
    /// 
    /// Primary Key: Id (attendance_id)
    /// 
    /// Foreign Keys:
    /// - UserId (user_id) → EmployeesModel.Id (employee whose attendance is tracked)
    /// 
    /// Bidirectional Relationships:
    /// - Employee ↔ EmployeesModel.OfficeAttendances (all attendance records for this employee)
    /// </summary>
    [Table("officeattendance")]
    public class OfficeAttendanceModel : IDbItem
    {
        [Key]
        [JsonPropertyName("attendance_id")]
        [Column("attendance_id", Order = 0)]
        public int? Id { get; set; }

        [Column("user_id", Order = 1)]
        [ForeignKey(nameof(Employee))]
        public int UserId { get; set; }

        [JsonIgnore]
        public virtual EmployeesModel? Employee { get; set; }

        [Column("date", Order = 2)]
        [Required]
        public DateTime Date { get; set; }

        [Column("status", Order = 3)]
        [Required]
        public AttendanceStatus Status { get; set; }
    }
}
