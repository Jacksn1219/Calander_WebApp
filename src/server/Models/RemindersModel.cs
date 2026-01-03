using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Text.Json.Serialization;
using Calender_WebApp.Models.Interfaces;

namespace Calender_WebApp.Models
{
    /// <summary>
    /// Categorizes reminder notifications by their triggering action.
    /// 
    /// Values:
    /// - EventParticipation: Initial event invitation reminder (sent before event starts)
    /// - RoomBooking: Room booking confirmation reminder (sent before booking starts)
    /// - EventParticipationChanged: Event details were modified (notify participants of changes)
    /// - RoomBookingChanged: Room booking details were modified (notify booker of changes)
    /// - EventParticipationCanceled: Event was canceled (notify all participants)
    /// - RoomBookingCanceled: Room booking was canceled (notify booker)
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
    /// Represents a notification reminder for events and room bookings.
    /// Generated based on user preferences to alert employees of upcoming or changed items.
    /// 
    /// Business Rules:
    /// - ReminderTime is calculated from event/booking time minus user's ReminderAdvanceMinutes preference
    /// - IsRead tracks whether user has acknowledged the reminder in the UI
    /// - RelatedRoomId and RelatedEventId link to the source event/booking
    /// - Title and Message are pre-formatted for display
    /// 
    /// Primary Key: Id (reminder_id)
    /// 
    /// Foreign Keys:
    /// - UserId (user_id) → EmployeesModel.Id (employee receiving the reminder)
    /// - RelatedRoomId (related_room_id) → RoomsModel.Id (room involved, if applicable)
    /// - RelatedEventId (related_event_id) → EventsModel.Id (event involved, if applicable)
    /// 
    /// Bidirectional Relationships:
    /// - User ↔ EmployeesModel (navigation property not shown in EmployeesModel)
    /// - RelatedRoom ↔ RoomsModel (navigation property not shown in RoomsModel)
    /// - RelatedEvent ↔ EventsModel (navigation property not shown in EventsModel)
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
        /// Scheduled time when reminder notification should be displayed or sent.
        /// Calculated as event/booking time minus user's preference advance time.
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
