using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Text.Json.Serialization;
using Calender_WebApp.Models.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace Calender_WebApp.Models
{
    /// <summary>
    /// Represents a room booking made by an employee for a specific room, date, and time period.
    /// Used to manage meeting room reservations and prevent double-booking conflicts.
    /// 
    /// Business Rules:
    /// - StartTime and EndTime are TimeSpan values representing time of day (not duration)
    /// - Bookings must have non-overlapping time slots for the same room on the same date
    /// - Each booking requires a purpose to track room usage
    /// 
    /// Primary Key: Id (booking_id)
    /// 
    /// Foreign Keys:
    /// - RoomId (room_id) → RoomsModel.Id (the room being booked)
    /// - UserId (user_id) → EmployeesModel.Id (the employee making the booking)
    /// 
    /// Bidirectional Relationships:
    /// - Room ↔ RoomsModel.RoomBookings (collection of all bookings for this room)
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
        /// Time of day when the booking starts (not a duration). Format: HH:mm:ss
        /// </summary>
        [Column("start_time", Order = 3)]
        [Required]
        public TimeSpan StartTime { get; set; }

        /// <summary>
        /// Time of day when the booking ends (not a duration). Format: HH:mm:ss
        /// </summary>
        [Column("end_time", Order = 4)]
        [Required]
        public TimeSpan EndTime { get; set; }

        [Column("purpose", Order = 5)]
        [Required]
        public string Purpose { get; set; } = string.Empty;
    }
}
