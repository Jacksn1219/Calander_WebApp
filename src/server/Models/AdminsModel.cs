using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Text.Json.Serialization;
using Calender_WebApp.Models.Interfaces;


namespace Calender_WebApp.Models
{
    /// <summary>
    /// Bitwise permission flags for admin users. Can be combined using | operator.
    /// None: No special permissions.
    /// ReadEvents: Can view all events in the system.
    /// UpdateEvents: Can modify/delete events.
    /// ReadRoomBookings: Can view all room bookings.
    /// UpdateRoomBookings: Can modify/delete room bookings.
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
    /// Extends an employee with admin-specific permissions using bitwise flags.
    /// Multiple admins can reference the same employee with different permission sets.
    /// Permissions are combinable (e.g., ReadEvents | UpdateEvents).
    /// 
    /// Primary Key: Id (admin_id)
    /// Foreign Keys:
    /// - UserId (user_id) ↔ EmployeesModel.Admins (bidirectional: admin belongs to employee, employee has admin records)
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

        [Required]
        [Column("permissions", Order = 2)]
        public AdminPermission Permissions { get; set; }
    }
}
