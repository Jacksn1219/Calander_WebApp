using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Text.Json.Serialization;
using Calender_WebApp.Models.Interfaces;
using Calender_WebApp.Models;

namespace Calender_WebApp.Models
{
    /// <summary>
    /// Represents a calendar event with optional room booking integration.
    /// Central entity for scheduling meetings, appointments, and organizational activities.
    /// 
    /// Business Rules:
    /// - EndTime must be after EventDate
    /// - Location can be free-text or linked to a room via BookingId
    /// - If BookingId is set, event is tied to a physical room reservation
    /// - ExpectedAttendees helps with capacity planning for room bookings
    /// - CreatedBy tracks event ownership for permissions
    /// 
    /// Primary Key: Id (event_id)
    /// 
    /// Foreign Keys:
    /// - BookingId (booking_id) → RoomBookingsModel.Id (optional room reservation for this event)
    /// - CreatedBy (created_by) → EmployeesModel.Id (employee who created the event)
    /// 
    /// Bidirectional Relationships:
    /// - Booking ↔ RoomBookingsModel (one-to-one link to room reservation if booked)
    /// - CreatedByUser ↔ EmployeesModel.CreatedEvents (all events created by this employee)
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
        /// Free-text location (e.g., "Building A, 3rd Floor") or room name. Use BookingId for formal room reservations.
        /// </summary>
        [Column("location", Order = 5)]
        public string? Location { get; set; }

        /// <summary>
        /// Optional link to formal room booking. When set, event is associated with a reserved room.
        /// </summary>
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

        /// <summary>
        /// Expected attendee count for capacity planning. Used to validate against room capacity when BookingId is set.
        /// </summary>
        [Column("expected_attendees", Order = 8)]
        public int? ExpectedAttendees { get; set; }
    }
}
