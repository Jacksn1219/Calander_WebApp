using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Text.Json.Serialization;
using Calender_WebApp.Models.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace Calender_WebApp.Models
{
    /// <summary>
    /// Represents a booking for a room.
    /// </summary>
    [Table("roombookings")]
    public class RoomBookingsModel : IDbItemJunction
    {
        [Key]
        [JsonPropertyName("booking_id")]
        [Column("booking_id")]
        public int Id { get; set; }
        /// <summary>
        /// ID of the booked room.
        /// </summary>
        [Column("room_id", Order = 0)]
        [ForeignKey(nameof(Room))]
        public int RoomId { get; set; }

        /// <summary>
        /// Navigation property for the related room.
        /// </summary>
        [JsonIgnore]
        public virtual RoomsModel? Room { get; set; }

        /// <summary>
        /// ID of the employee who booked the room.
        /// </summary>
        [Column("user_id", Order = 1)]
        [ForeignKey(nameof(Employee))]
        public int UserId { get; set; }

        /// <summary>
        /// Navigation property for the related employee.
        /// </summary>
        [JsonIgnore]
        public virtual EmployeesModel? Employee { get; set; }

        /// <summary>
        /// Date of the booking.
        /// </summary>
        [Column("booking_date", Order = 2)]
        [Required]
        public DateTime BookingDate { get; set; }

        /// <summary>
        /// Start time of the booking.
        /// </summary>
        [Column("start_time", Order = 3)]
        [Required]
        public TimeSpan StartTime { get; set; }

        /// <summary>
        /// End time of the booking.
        /// </summary>
        [Column("end_time", Order = 4)]
        [Required]
        public TimeSpan EndTime { get; set; }

        /// <summary>
        /// Purpose of the booking.
        /// </summary>
        [Column("purpose", Order = 5)]
        [Required]
        public string Purpose { get; set; } = string.Empty;
    }
}
