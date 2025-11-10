using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Text.Json.Serialization;
using Calender_WebApp.Models.Interfaces;
using Microsoft.EntityFrameworkCore.Metadata.Internal;

namespace Calender_WebApp.Models
{
    /// <summary>
    /// Represents a reminder in the system.
    /// </summary>
    [Table("reminderpreferences")]
    public class ReminderPreferencesModel : IDbItem
    {
        /// <summary>
        /// Primary key for the Reminder entity.
        /// </summary>
        [Key]
        [JsonPropertyName("user_id")]
        [Column("user_id", Order = 0)]
        [ForeignKey(nameof(User))]
        public int? Id { get; set; }

        /// <summary>
        /// Type of the event.
        /// </summary>
        [Required]
        [Column("event_reminder", Order = 1)]
        public bool EventReminder { get; set; } = true;

        /// <summary>
        /// ID of the related entity (Event or RoomBooking).
        /// </summary>
        [Required]
        [Column("booking_reminder", Order = 2)]
        public bool BookingReminder { get; set; } = true;

        /// <summary>
        /// Time when the reminder should be sent.
        /// </summary>
        [Required]
        [Column("reminder_advance_minutes", Order = 3)]
        public TimeSpan ReminderAdvanceMinutes { get; set; }

        /// <summary>
        /// Navigation property for the employee who created the event.
        /// </summary>
        public virtual EmployeesModel User { get; set; } = null!;
    }
}
