using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Text.Json.Serialization;
using Calender_WebApp.Models.Interfaces;

namespace Calender_WebApp.Models
{
    /// <summary>
    /// Represents a room entity in the system.
    /// </summary>
    [Table("rooms")]
    public class RoomsModel : IDbItem
    {
        /// <summary>
        /// Primary key for the GroupMembership entity.
        /// </summary>
        [Key]
        [JsonPropertyName("room_id")]
        [Column("room_id", Order = 0)]
        public int? Id { get; set; }

        /// <summary>
        /// Name of the room.
        /// </summary>
        [Required]
        [Column("room_name", Order = 1)]
        public string RoomName { get; set; } = string.Empty;

        /// <summary>
        /// Capacity of the room.
        /// </summary>
        [Column("capacity", Order = 2)]
        public int Capacity { get; set; }

        /// <summary>
        /// Location of the room.
        /// </summary>
        [Required]
        [Column("location", Order = 3)]
        public string Location { get; set; } = string.Empty;

        /// <summary>
        /// Collection of bookings associated with this room.
        /// </summary>
        [JsonIgnore]
        [NotMapped]
        public virtual ICollection<RoomBookingsModel> RoomBookings { get; set; } = new List<RoomBookingsModel>();
    }
}
