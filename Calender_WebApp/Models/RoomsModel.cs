using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
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
        [Required]
        [Column("id", Order = 0)]
        public int? Id { get; set; }

        /// <summary>
        /// Unique identifier of the room.
        /// </summary>
        [Required]
        [Column("room_id", Order = 1)]
        public int RoomId { get; set; }

        /// <summary>
        /// Name of the room.
        /// </summary>
        [Required]
        [Column("room_name", Order = 2)]
        public string RoomName { get; set; } = string.Empty;

        /// <summary>
        /// Capacity of the room.
        /// </summary>
        [Column("capacity", Order = 3)]
        public int Capacity { get; set; }

        /// <summary>
        /// Location of the room.
        /// </summary>
        [Required]
        [Column("location", Order = 4)]
        public string Location { get; set; } = string.Empty;

        /// <summary>
        /// Collection of bookings associated with this room.
        /// </summary>
        public virtual ICollection<RoomBookingsModel> RoomBookings { get; set; } = new List<RoomBookingsModel>();

        /// <summary>
        /// Indicates whether the room is currently available.
        /// Not mapped to the database.
        /// </summary>
        [NotMapped]
        public bool IsAvailable { get; set; } = false;
    }
}
