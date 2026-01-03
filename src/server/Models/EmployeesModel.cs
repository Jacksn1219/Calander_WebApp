using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Text.Json.Serialization;
using Calender_WebApp.Models.Interfaces;

namespace Calender_WebApp.Models
{
    /// <summary>
    /// Defines role-based access levels for employees in the system.
    /// 
    /// Values:
    /// - User: Standard employee with basic access (create events, book rooms, view own data)
    /// - Admin: Elevated user with management capabilities (defined by AdminPermission flags)
    /// - SuperAdmin: Highest privilege level with unrestricted access to all system features
    /// </summary>
    public enum UserRole
    {
        Admin,
        User,
        SuperAdmin
    }

    /// <summary>
    /// Represents an employee (user) in the system. Central entity for authentication and authorization.
    /// All users must have an employee record to interact with the system.
    /// 
    /// Business Rules:
    /// - Password is stored hashed (never store plaintext)
    /// - Email must be unique (used for login)
    /// - Role determines base access level; admins get additional granular permissions via AdminsModel
    /// 
    /// Primary Key: Id (user_id)
    /// 
    /// Foreign Keys: None (root entity)
    /// 
    /// Bidirectional Relationships:
    /// - Admins ↔ AdminsModel.Employee (admin privileges if role is Admin/SuperAdmin)
    /// - EventParticipations ↔ EventParticipationModel.Employee (events this employee is invited to)
    /// - OfficeAttendances ↔ OfficeAttendanceModel.Employee (daily attendance records)
    /// - GroupMemberships ↔ GroupMembershipsModel.Employee (groups this employee belongs to)
    /// - CreatedEvents ↔ EventsModel.CreatedByUser (events created by this employee)
    /// </summary>
    [Table("employees")]
    public class EmployeesModel : IDbItem
    {
        [Key]
        [JsonPropertyName("user_id")]
        [Column("user_id", Order = 0)]
        public int? Id { get; set; }

        [Required]
        [Column("name", Order = 1)]
        public string Name { get; set; } = string.Empty;

        [Required]
        [EmailAddress]
        [Column("email", Order = 2)]
        public string Email { get; set; } = string.Empty;

        [Required]
        [Column("role", Order = 3)]
        [JsonConverter(typeof(JsonStringEnumConverter))]
        public UserRole Role { get; set; }

        /// <summary>
        /// Password hash (not plaintext). Must be hashed before storage using secure algorithm.
        /// </summary>
        [Required]
        [Column("password", Order = 4)]
        public string Password { get; set; } = string.Empty;

        [JsonIgnore]
        [NotMapped]
        public virtual ICollection<AdminsModel> Admins { get; set; } = new List<AdminsModel>();

        [JsonIgnore]
        [NotMapped]
        public virtual ICollection<EventParticipationModel> EventParticipations { get; set; } = new List<EventParticipationModel>();

        [JsonIgnore]
        [NotMapped]
        public virtual ICollection<OfficeAttendanceModel> OfficeAttendances { get; set; } = new List<OfficeAttendanceModel>();

        [JsonIgnore]    
        [NotMapped]
        public virtual ICollection<GroupMembershipsModel> GroupMemberships { get; set; } = new List<GroupMembershipsModel>();

        [JsonIgnore]
        [NotMapped]
        public virtual ICollection<EventsModel> CreatedEvents { get; set; } = new List<EventsModel>();
    }
}
