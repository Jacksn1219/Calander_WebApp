using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Text.Json.Serialization;
using Calender_WebApp.Models.Interfaces;

namespace Calender_WebApp.Models
{
    /// <summary>
    /// Represents a bookable room/space in the office.
    /// Rooms can have multiple bookings and may be referenced in event reminders.
    /// Capacity indicates maximum number of people the room can accommodate.
    /// 
    /// Primary Key: Id (room_id)
    /// Foreign Keys: None (root entity)
    /// Bidirectional Relationships:
    /// - RoomBookings ↔ RoomBookingsModel.RoomId (bookings for this room)
    /// - Reminders ↔ RemindersModel.RelatedRoomId (reminders associated with this room)
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

        [Column("capacity", Order = 2)]
        public int Capacity { get; set; }

        [Required]
        [Column("location", Order = 3)]
        public string Location { get; set; } = string.Empty;

        [JsonIgnore]
        public virtual ICollection<RoomBookingsModel> RoomBookings { get; set; } = new List<RoomBookingsModel>();

        [JsonIgnore]
        [NotMapped]
        public virtual ICollection<RemindersModel> Reminders { get; set; } = new List<RemindersModel>();
    }
}
