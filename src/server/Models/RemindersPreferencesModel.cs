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
    /// Stores per-user notification preferences for events and room bookings.
    /// One record per employee defining when and how they receive reminder notifications.
    /// 
    /// Business Rules:
    /// - Primary key is the UserId (one preference record per employee)
    /// - ReminderAdvanceMinutes is a TimeSpan representing duration before event/booking (not time of day)
    /// - Defaults: EventReminder=true, BookingReminder=true, ReminderAdvanceMinutes=15 minutes
    /// - If EventReminder is false, no event reminders are generated for this user
    /// - If BookingReminder is false, no room booking reminders are generated for this user
    /// 
    /// Primary Key: Id (user_id) - foreign key used as primary key
    /// 
    /// Foreign Keys:
    /// - Id (user_id) → EmployeesModel.Id (employee whose preferences are stored)
    /// 
    /// Bidirectional Relationships:
    /// - User ↔ EmployeesModel (navigation property not shown in EmployeesModel)
    /// </summary>
    [Table("reminderpreferences")]
    public class ReminderPreferencesModel : IDbItem
    {
        /// <summary>
        /// Primary key and foreign key. DatabaseGeneratedOption.None means value is manually set (not auto-incremented).
        /// </summary>
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
        /// Duration before event/booking to send reminder (not time of day). Example: 15 minutes = reminder 15 min before start.
        /// </summary>
        [Required]
        [Column("reminder_advance_minutes", Order = 3)]
        public TimeSpan ReminderAdvanceMinutes { get; set; } = TimeSpan.FromMinutes(15);

        [JsonIgnore]
        [NotMapped]
        public virtual EmployeesModel? User { get; set; }
    }
}
