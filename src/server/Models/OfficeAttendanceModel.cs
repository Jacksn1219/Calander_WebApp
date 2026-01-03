using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Text.Json.Serialization;
using Calender_WebApp.Models.Interfaces;

namespace Calender_WebApp.Models
{
    /// <summary>
    /// Present: Employee is physically in the office.
    /// Absent: Employee is not working (vacation, sick leave, etc.).
    /// Remote: Employee is working from home or another remote location.
    /// </summary>
    public enum AttendanceStatus
    {
        Present,
        Absent,
        Remote
    }

    /// <summary>
    /// Tracks daily office attendance status for employees.
    /// One record per employee per date. Date is normalized to date-only (time component ignored).
    /// Used for workspace planning and remote work tracking.
    /// 
    /// Primary Key: Id (attendance_id)
    /// Foreign Keys:
    /// - UserId (user_id) → EmployeesModel.Id (employee this attendance record belongs to)
    /// Bidirectional Relationships:
    /// - Employee ↔ EmployeesModel.OfficeAttendances
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
