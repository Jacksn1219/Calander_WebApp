using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Text.Json.Serialization;
using Calender_WebApp.Models.Interfaces;
using Calender_WebApp.Models;

namespace Calender_WebApp.Models
{
    /// <summary>
    /// Represents an event in the system.
    /// </summary>
    [Table("events")]
    public class EventsModel : IDbItem
    {
        /// <summary>
        /// Primary key for the Event entity.
        /// </summary>
        [Key]
        [JsonPropertyName("event_id")]
        [Column("event_id", Order = 0)]
        public int? Id { get; set; }

        /// <summary>
        /// Title of the event.
        /// </summary>
        [Required]
        [Column("title", Order = 1)]
        public string Title { get; set; } = string.Empty;

        /// <summary>
        /// Description of the event.
        /// </summary>
        [Column("description", Order = 2)]
        public string? Description { get; set; }

        /// <summary>
        /// Date and time when the event starts.
        /// </summary>
        [Required]
        [Column("event_date", Order = 3)]
        public DateTime EventDate { get; set; }

        /// <summary>
        /// Date and time when the event ends.
        /// </summary>
        [Required]
        [Column("end_time", Order = 4)]
        public DateTime EndTime { get; set; }

        /// <summary>
        /// Location of the event. Can be a free-text address or room name.
        /// </summary>
        [Column("location", Order = 5)]
        public string? Location { get; set; }

        /// <summary>
        /// ID of the room booking associated with this event (optional).
        /// </summary>
        [Column("booking_id", Order = 6)]
        [ForeignKey(nameof(Booking))]
        public int? BookingId { get; set; }
        [JsonIgnore]
        public virtual RoomBookingsModel? Booking { get; set; }

        /// <summary>
        /// ID of the user who created the event.
        /// </summary>
        [Required]
        [Column("created_by", Order = 7)]
        [ForeignKey(nameof(CreatedByUser))]
        public int CreatedBy { get; set; }

        /// <summary>
        /// Navigation property for the employee who created the event.
        /// </summary>
        [JsonIgnore]
        public virtual EmployeesModel? CreatedByUser { get; set; }

        /// <summary>
        /// Expected number of attendees for the event.
        /// </summary>
        [Column("expected_attendees", Order = 8)]
        public int? ExpectedAttendees { get; set; }
    }
}
