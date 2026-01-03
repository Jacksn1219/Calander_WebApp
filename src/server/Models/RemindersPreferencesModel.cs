using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Text.Json.Serialization;
using Calender_WebApp.Models.Interfaces;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Internal;

namespace Calender_WebApp.Models
{
    /// <summary>
    /// User preferences for notification reminders (one-to-one with EmployeesModel).
    /// Controls whether user receives event/booking reminders and how far in advance.
    /// ReminderAdvanceMinutes is a TimeSpan (e.g., 15 minutes), NOT a DateTime.
    /// Default: both reminders enabled, 15 minutes advance notice.
    /// 
    /// Primary Key: Id (user_id) - also serves as FK to EmployeesModel (one-to-one)
    /// Foreign Keys:
    /// - Id (user_id) → EmployeesModel.Id (one-to-one: preferences belong to this employee)
    /// Bidirectional Relationships:
    /// - User ↔ EmployeesModel.ReminderPreferences (one-to-one)
    /// </summary>
    [Table("reminderpreferences")]
    public class ReminderPreferencesModel : IDbItem
    {
        [Key]
        [DatabaseGenerated(DatabaseGeneratedOption.None)]
        [JsonPropertyName("user_id")]
        [Column("user_id", Order = 0)]
        [ForeignKey(nameof(User))]
        public int? Id { get; set; }

        [Required]
        [Column("event_reminder", Order = 1)]
        public bool EventReminder { get; set; } = true;

        [Required]
        [Column("booking_reminder", Order = 2)]
        public bool BookingReminder { get; set; } = true;

        /// <summary>
        /// How far in advance to send reminders (TimeSpan, e.g., 15 minutes). Default: 15 minutes.
        /// </summary>
        [Required]
        [Column("reminder_advance_minutes", Order = 3)]
        public TimeSpan ReminderAdvanceMinutes { get; set; } = TimeSpan.FromMinutes(15);

        [JsonIgnore]
        [NotMapped]
        public virtual EmployeesModel? User { get; set; }
    }
}
