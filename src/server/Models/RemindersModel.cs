using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Text.Json.Serialization;
using Calender_WebApp.Models.Interfaces;

namespace Calender_WebApp.Models
{
    /// <summary>
    /// EventParticipation: Reminder for an upcoming event the user is attending.
    /// RoomBooking: Reminder for an upcoming room reservation.
    /// EventParticipationChanged: Notification that event details were modified.
    /// RoomBookingChanged: Notification that booking details were modified.
    /// EventParticipationCanceled: Notification that an event was canceled.
    /// RoomBookingCanceled: Notification that a room booking was canceled.
    /// </summary>
    public enum reminderType
    {
        EventParticipation,
        RoomBooking,
        EventParticipationChanged,
        RoomBookingChanged,
        EventParticipationCanceled,
        RoomBookingCanceled
    }

    /// <summary>
    /// Notification reminders for events and room bookings.
    /// ReminderTime already has the user's preference advance time subtracted (ready to display).
    /// Each reminder is tied to both a room and an event, even if only one is relevant (due to schema design).
    /// 
    /// Primary Key: Id (reminder_id)
    /// Foreign Keys:
    /// - UserId (user_id) → EmployeesModel.Id (user receiving this reminder)
    /// - RelatedRoomId (related_room_id) → RoomsModel.Id (associated room)
    /// - RelatedEventId (related_event_id) → EventsModel.Id (associated event)
    /// Bidirectional Relationships:
    /// - User ↔ EmployeesModel.Reminders
    /// - RelatedRoom ↔ RoomsModel.Reminders
    /// - RelatedEvent ↔ EventsModel.Reminders
    /// </summary>
    [Table("reminders")]
    public class RemindersModel : IDbItem
    {
        [Key]
        [JsonPropertyName("reminder_id")]
        [Column("reminder_id", Order = 0)]
        public int? Id { get; set; }

        [Column("user_id", Order = 1)]
        [ForeignKey(nameof(User))]
        public int UserId { get; set; }

        [Required]
        [Column("reminder_type", Order = 2)]
        public reminderType ReminderType { get; set; }

        [Required]
        [Column("related_room_id", Order = 4)]
        [ForeignKey(nameof(RelatedRoom))]
        public int RelatedRoomId { get; set; }

        [Required]
        [Column("related_event_id", Order = 5)]
        [ForeignKey(nameof(RelatedEvent))]
        public int RelatedEventId { get; set; }
        
        /// <summary>
        /// Time when the reminder should be sent. User's preference advance time already subtracted.
        /// </summary>
        [Required]
        [Column("reminder_time", Order = 6)]
        public DateTime ReminderTime { get; set; }

        [Required]
        [Column("is_read", Order = 7)]
        public bool IsRead { get; set; } = false;

        [Required]
        [Column("title", Order = 8)]
        public string Title { get; set; } = string.Empty;

        [Required]
        [Column("message", Order = 9)]
        public string Message { get; set; } = string.Empty;

        [JsonIgnore]
        [NotMapped]
        public virtual EmployeesModel? User { get; set; }

        [JsonIgnore]
        [NotMapped]
        public virtual RoomsModel? RelatedRoom { get; set; }

        [JsonIgnore]
        [NotMapped]
        public virtual EventsModel? RelatedEvent { get; set; }
    }
}
