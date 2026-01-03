using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Text.Json.Serialization;
using Calender_WebApp.Models.Interfaces;

namespace Calender_WebApp.Models
{
    /// <summary>
    /// Represents a physical meeting room or bookable space in the organization.
    /// Central entity for room reservation and capacity management.
    /// 
    /// Business Rules:
    /// - RoomName should be unique for identification (e.g., "Conference Room A")
    /// - Capacity is maximum number of people the room can accommodate
    /// - Location helps users find the room (e.g., "Building 1, Floor 3")
    /// - Used to validate event attendance against room capacity
    /// 
    /// Primary Key: Id (room_id)
    /// 
    /// Foreign Keys: None (root entity)
    /// 
    /// Bidirectional Relationships:
    /// - RoomBookings ↔ RoomBookingsModel.Room (all bookings for this room)
    /// </summary>
    [Table("rooms")]
    public class RoomsModel : IDbItem
    {
        [Key]
        [JsonPropertyName("room_id")]
        [Column("room_id", Order = 0)]
        public int? Id { get; set; }

        [Required]
        [Column("room_name", Order = 1)]
        public string RoomName { get; set; } = string.Empty;

        /// <summary>
        /// Maximum number of people the room can accommodate. Used for capacity validation in bookings.
        /// </summary>
        [Column("capacity", Order = 2)]
        public int Capacity { get; set; }

        [Required]
        [Column("location", Order = 3)]
        public string Location { get; set; } = string.Empty;

        [JsonIgnore]
        public virtual ICollection<RoomBookingsModel> RoomBookings { get; set; } = new List<RoomBookingsModel>();
    }
}
