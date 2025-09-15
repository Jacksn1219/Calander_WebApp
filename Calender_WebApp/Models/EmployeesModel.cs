using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Calender_WebApp.Models.Interfaces;

namespace Calender_WebApp.Models
{
    /// <summary>
    /// Represents the roles available for employees.
    /// </summary>
    public enum UserRole
    {
        Admin,
        User
    }

    /// <summary>
    /// Represents an employee (user) in the system.
    /// </summary>
    [Table("employees")]
    public class EmployeesModel : IDbItem
    {
        /// <summary>
        /// Primary key for the GroupMembership entity.
        /// </summary>
        [Key]
        [Required]
        [Column("id", Order = 0)]
        public int? Id { get; set; }

        /// <summary>
        /// Unique identifier of the employee.
        /// </summary>
        [Required]
        [Column("user_id", Order = 1)]
        public int UserId { get; set; }

        /// <summary>
        /// Full name of the employee.
        /// </summary>
        [Required]
        [Column("name", Order = 2)]
        public string Name { get; set; } = string.Empty;

        /// <summary>
        /// Email address of the employee.
        /// </summary>
        [Required]
        [EmailAddress]
        [Column("email", Order = 3)]
        public string Email { get; set; } = string.Empty;

        /// <summary>
        /// Role of the employee (Admin | User).
        /// </summary>
        [Required]
        [Column("role", Order = 4)]
        public UserRole Role { get; set; }

        /// <summary>
        /// Password of the employee (hashed).
        /// </summary>
        [Required]
        [Column("password", Order = 5)]
        public string Password { get; set; } = string.Empty;

        /// <summary>
        /// Navigation property for admin records (if this user is an admin).
        /// </summary>
        public virtual ICollection<AdminsModel> Admins { get; set; } = new List<AdminsModel>();

        /// <summary>
        /// Navigation property for the employee's event participations.
        /// </summary>
        public virtual ICollection<EventParticipationModel> EventParticipations { get; set; } = new List<EventParticipationModel>();

        /// <summary>
        /// Navigation property for the employee's office attendance records.
        /// </summary>
        public virtual ICollection<OfficeAttendanceModel> OfficeAttendances { get; set; } = new List<OfficeAttendanceModel>();

        /// <summary>
        /// Navigation property for the employee's room bookings.
        /// </summary>
        public virtual ICollection<RoomBookingsModel> RoomBookings { get; set; } = new List<RoomBookingsModel>();

        /// <summary>
        /// Navigation property for the groups this employee belongs to.
        /// </summary>
        public virtual ICollection<GroupMembershipsModel> GroupMemberships { get; set; } = new List<GroupMembershipsModel>();

        /// <summary>
        /// Navigation property for the events created by this employee.
        /// </summary>
        public virtual ICollection<EventsModel> CreatedEvents { get; set; } = new List<EventsModel>();
    }
}
