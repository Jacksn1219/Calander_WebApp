using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace Calender_WebApp.Models
{
    /// <summary>
    /// Represents the possible attendance statuses.
    /// </summary>
    public enum AttendanceStatus
    {
        Present,
        Absent,
        Remote
    }

    /// <summary>
    /// Represents an office attendance record for an employee.
    /// </summary>
    [Table("officeattendance")]
    public class OfficeAttendanceModel : IDbItem
    {
        /// <summary>
        /// Unique identifier for the attendance record.
        /// </summary>
        [Key]
        [Column("attendance_id", Order = 0)]
        public int AttendanceId { get; set; }

        /// <summary>
        /// ID of the employee associated with this attendance record.
        /// </summary>
        [Column("user_id", Order = 1)]
        [ForeignKey(nameof(Employee))]
        public int UserId { get; set; }

        /// <summary>
        /// Navigation property for the related employee.
        /// </summary>
        public virtual EmployeesModel Employee { get; set; } = null!;

        /// <summary>
        /// Date of the attendance.
        /// </summary>
        [Column("date", Order = 2)]
        [Required]
        public DateTime Date { get; set; }

        /// <summary>
        /// Attendance status (Present, Absent, Remote).
        /// </summary>
        [Column("status", Order = 3)]
        [Required]
        public AttendanceStatus Status { get; set; }
    }
}
