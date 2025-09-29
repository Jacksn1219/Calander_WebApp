using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Text.Json.Serialization;
using Calender_WebApp.Models.Interfaces;


namespace Calender_WebApp.Models
{
    /// <summary>
    /// Represents the permission flags available for an admin.
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
    /// Represents an admin user in the system with assigned permissions.
    /// </summary>
    [Table("admins")]
    public class AdminsModel : IDbItem
    {
        /// <summary>
        /// Primary key for the GroupMembership entity.
        /// </summary>
        [Key]
        [JsonPropertyName("admin_id")]
        [Column("admin_id", Order = 0)]
        public int? Id { get; set; }

        /// <summary>
        /// ID of the employee associated with this admin record.
        /// </summary>
        [Required]
        [Column("user_id", Order = 1)]
        [ForeignKey(nameof(Employee))]
        public int UserId { get; set; }

        /// <summary>
        /// Navigation property for the related employee.
        /// </summary>
        public virtual EmployeesModel Employee { get; set; } = null!;

        /// <summary>
        /// Permissions assigned to this admin.
        /// </summary>
        [Required]
        [Column("permissions", Order = 2)]
        public AdminPermission Permissions { get; set; }
    }
}
