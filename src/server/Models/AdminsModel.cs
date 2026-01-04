using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Text.Json.Serialization;
using Calender_WebApp.Models.Interfaces;


namespace Calender_WebApp.Models
{
    /// <summary>
    /// Defines granular permissions for admin users to control access to system features.
    /// Multiple permissions can be combined using the | operator (e.g., ReadEvents | UpdateEvents).
    /// 
    /// Values:
    /// - None: No permissions granted (default/revoked state)
    /// - ReadEvents: View event details and listings (for monitoring purposes)
    /// - UpdateEvents: Modify, create, or delete events (for event management)
    /// - ReadRoomBookings: View room booking details (for scheduling oversight)
    /// - UpdateRoomBookings: Modify, create, or cancel room bookings (for resource management)
    /// </summary>
    [Flags]
    public enum AdminPermission
    {
        None = 0,
        ReadEvents = 1,
        UpdateEvents = 2,
        ReadRoomBookings = 4,
        UpdateRoomBookings = 8
    }

    /// <summary>
    /// Represents an admin user with granular permission settings for system management.
    /// Extends an employee record with specific administrative capabilities.
    /// 
    /// Business Rules:
    /// - One admin record per employee (1:1 relationship with EmployeesModel)
    /// - Permissions are stored as bitwise flags allowing flexible combinations
    /// - Employee must exist before admin record can be created
    /// 
    /// Primary Key: Id (admin_id)
    /// 
    /// Foreign Keys:
    /// - UserId (user_id) → EmployeesModel.Id (employee granted admin privileges)
    /// 
    /// Bidirectional Relationships:
    /// - Employee ↔ EmployeesModel.Admins (employee's admin record)
    /// </summary>
    [Table("admins")]
    public class AdminsModel : IDbItem
    {
        [Key]
        [JsonPropertyName("admin_id")]
        [Column("admin_id", Order = 0)]
        public int? Id { get; set; }

        [Required]
        [Column("user_id", Order = 1)]
        [ForeignKey(nameof(Employee))]
        public int UserId { get; set; }

        [JsonIgnore]
        public virtual EmployeesModel? Employee { get; set; }

        /// <summary>
        /// Bitwise flag combination of AdminPermission values. Use | operator to combine multiple permissions.
        /// </summary>
        [Required]
        [Column("permissions", Order = 2)]
        public AdminPermission Permissions { get; set; }
    }
}
