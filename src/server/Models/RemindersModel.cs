using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Text.Json.Serialization;
using Calender_WebApp.Models.Interfaces;

namespace Calender_WebApp.Models
{
    public enum reminderType
    {
        Event,
        RoomBooking
    }

    /// <summary>
    /// Represents a reminder in the system.
    /// </summary>
    [Table("reminders")]
    public class RemindersModel : IDbItem
    {
        /// <summary>
        /// Primary key for the Reminder entity.
        /// </summary>
        [Key]
        [JsonPropertyName("reminder_id")]
        [Column("reminder_id", Order = 0)]
        public int? Id { get; set; }

        /// <summary>
        /// ID of the user who created the reminder.
        /// </summary>
        [Column("user_id", Order = 4)]
        [ForeignKey(nameof(User))]
        public int UserId { get; set; }

        /// <summary>
        /// Type of the event.
        /// </summary>
        [Required]
        [Column("reminder_type", Order = 1)]
        public reminderType ReminderType { get; set; }

        /// <summary>
        /// ID of the related entity (Event or RoomBooking).
        /// </summary>
        [Required]
        [Column("related_entity_id", Order = 2)]
        public int RelatedEntityId { get; set; }

        /// <summary>
        /// Time when the reminder should be sent.
        /// </summary>
        [Required]
        [Column("reminder_time", Order = 3)]
        public DateTime ReminderTime { get; set; }

        /// <summary>
        /// Indicates whether the reminder has been sent.
        /// </summary>
        [Required]
        [Column("is_sent", Order = 4)]
        public bool IsSent { get; set; } = false;

        /// <summary>
        /// Title of the reminder.
        /// </summary>
        [Required]
        [Column("title", Order = 5)]
        public string Title { get; set; } = string.Empty;

        /// <summary>
        /// Message of the reminder.
        /// </summary>
        [Required]
        [Column("message", Order = 6)]
        public string Message { get; set; } = string.Empty;

        /// <summary>
        /// Navigation property for the employee who created the event.
        /// </summary>
        public virtual EmployeesModel User { get; set; } = null!;
    }
}
