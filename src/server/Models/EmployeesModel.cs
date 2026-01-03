using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Text.Json.Serialization;
using Calender_WebApp.Models.Interfaces;

namespace Calender_WebApp.Models
{
    /// <summary>
    /// User: Standard employee with basic access.
    /// Admin: Has additional permissions defined in AdminsModel.
    /// SuperAdmin: Full system access including admin management.
    /// </summary>
    public enum UserRole
    {
        Admin,
        User,
        SuperAdmin
    }

    /// <summary>
    /// Represents an employee (user) with authentication credentials and role-based access.
    /// Password is stored hashed (never plaintext).
    /// Role determines access level: User (basic), Admin (extended permissions via AdminsModel), SuperAdmin (full access).
    /// 
    /// Primary Key: Id (user_id)
    /// Foreign Keys: None (root entity)
    /// Bidirectional Relationships:
    /// - Admins ↔ AdminsModel.UserId (employee can have admin permission records)
    /// - ReminderPreferences ↔ RemindersPreferencesModel.Id (one-to-one: employee's notification preferences)
    /// - EventParticipations ↔ EventParticipationModel.UserId (employee participates in events)
    /// - OfficeAttendances ↔ OfficeAttendanceModel.UserId (employee has daily attendance records)
    /// - GroupMemberships ↔ GroupMembershipsModel.UserId (employee belongs to groups)
    /// - RoomBookings ↔ RoomBookingsModel.UserId (employee's room reservations)
    /// - Reminders ↔ RemindersModel.UserId (employee's notification reminders)
    /// - CreatedEvents ↔ EventsModel.CreatedBy (employee creates events)
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

        [Required]
        [Column("password", Order = 4)]
        public string Password { get; set; } = string.Empty;

        [JsonIgnore]
        [NotMapped]
        public virtual ICollection<AdminsModel> Admins { get; set; } = new List<AdminsModel>();

        [JsonIgnore]
        [NotMapped]
        public virtual ReminderPreferencesModel? ReminderPreferences { get; set; }

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
        public virtual ICollection<RoomBookingsModel> RoomBookings { get; set; } = new List<RoomBookingsModel>();

        [JsonIgnore]
        [NotMapped]
        public virtual ICollection<RemindersModel> Reminders { get; set; } = new List<RemindersModel>();

        [JsonIgnore]
        [NotMapped]
        public virtual ICollection<EventsModel> CreatedEvents { get; set; } = new List<EventsModel>();
    }
}
