using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Text.Json.Serialization;
using Calender_WebApp.Models.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace Calender_WebApp.Models
{
    /// <summary>
    /// Represents a room reservation with time-of-day slots.
    /// StartTime and EndTime are TimeSpan values (time of day, e.g., 09:00-17:00), NOT DateTime.
    /// BookingDate specifies the date. One booking = one date + time slot.
    /// Bookings can optionally be linked to an Event.
    /// 
    /// Primary Key: Id (booking_id)
    /// Foreign Keys:
    /// - RoomId (room_id) → RoomsModel.Id (room being booked)
    /// - UserId (user_id) → EmployeesModel.Id (user who made the booking)
    /// Bidirectional Relationships:
    /// - Room ↔ RoomsModel.RoomBookings
    /// - Employee ↔ EmployeesModel.RoomBookings
    /// - Events ↔ EventsModel.BookingId (events associated with this booking)
    /// </summary>
    [Table("roombookings")]
    public class RoomBookingsModel : IDbItemJunction
    {
        [Key]
        [JsonPropertyName("booking_id")]
        [Column("booking_id")]
        public int Id { get; set; }

        [Column("room_id", Order = 0)]
        [ForeignKey(nameof(Room))]
        public int RoomId { get; set; }

        [JsonIgnore]
        public virtual RoomsModel? Room { get; set; }

        [Column("user_id", Order = 1)]
        [ForeignKey(nameof(Employee))]
        public int UserId { get; set; }

        [JsonIgnore]
        public virtual EmployeesModel? Employee { get; set; }

        [Column("booking_date", Order = 2)]
        [Required]
        public DateTime BookingDate { get; set; }

        /// <summary>
        /// Time of day when booking starts (TimeSpan, e.g., 09:00). Not a full DateTime.
        /// </summary>
        [Column("start_time", Order = 3)]
        [Required]
        public TimeSpan StartTime { get; set; }

        /// <summary>
        /// Time of day when booking ends (TimeSpan, e.g., 17:00). Not a full DateTime.
        /// </summary>
        [Column("end_time", Order = 4)]
        [Required]
        public TimeSpan EndTime { get; set; }

        [Column("purpose", Order = 5)]
        [Required]
        public string Purpose { get; set; } = string.Empty;

        [JsonIgnore]
        [NotMapped]
        public virtual ICollection<EventsModel> Events { get; set; } = new List<EventsModel>();
    }
}
