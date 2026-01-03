using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Text.Json.Serialization;
using Calender_WebApp.Models.Interfaces;
using Calender_WebApp.Models;

namespace Calender_WebApp.Models
{
    /// <summary>
    /// Represents a calendar event with optional room booking association.
    /// Location can be either a free-text address OR linked to a room booking via BookingId.
    /// When BookingId is set, the event is tied to a specific room reservation.
    /// 
    /// Primary Key: Id (event_id)
    /// Foreign Keys:
    /// - BookingId (booking_id) → RoomBookingsModel.Id (optional: links event to room booking)
    /// - CreatedBy (created_by) → EmployeesModel.Id (user who created this event)
    /// Bidirectional Relationships:
    /// - EventParticipations ↔ EventParticipationModel.EventId (users participating in this event)
    /// - Reminders ↔ RemindersModel.RelatedEventId (notifications for this event)
    /// </summary>
    [Table("events")]
    public class EventsModel : IDbItem
    {
        [Key]
        [JsonPropertyName("event_id")]
        [Column("event_id", Order = 0)]
        public int? Id { get; set; }

        [Required]
        [Column("title", Order = 1)]
        public string Title { get; set; } = string.Empty;

        [Column("description", Order = 2)]
        public string? Description { get; set; }

        [Required]
        [Column("event_date", Order = 3)]
        public DateTime EventDate { get; set; }

        [Required]
        [Column("end_time", Order = 4)]
        public DateTime EndTime { get; set; }

        /// <summary>
        /// Can be a free-text address or room name. If BookingId is set, this may be overridden by the room's location.
        /// </summary>
        [Column("location", Order = 5)]
        public string? Location { get; set; }

        [Column("booking_id", Order = 6)]
        [ForeignKey(nameof(Booking))]
        public int? BookingId { get; set; }

        [JsonIgnore]
        public virtual RoomBookingsModel? Booking { get; set; }

        [Required]
        [Column("created_by", Order = 7)]
        [ForeignKey(nameof(CreatedByUser))]
        public int CreatedBy { get; set; }

        [JsonIgnore]
        public virtual EmployeesModel? CreatedByUser { get; set; }

        [Column("expected_attendees", Order = 8)]
        public int? ExpectedAttendees { get; set; }

        [JsonIgnore]
        [NotMapped]
        public virtual ICollection<EventParticipationModel> EventParticipations { get; set; } = new List<EventParticipationModel>();

        [JsonIgnore]
        [NotMapped]
        public virtual ICollection<RemindersModel> Reminders { get; set; } = new List<RemindersModel>();
    }
}
