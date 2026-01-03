using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Microsoft.EntityFrameworkCore;             
using Calender_WebApp.Models.Interfaces;
using System.Text.Json.Serialization;

namespace Calender_WebApp.Models
{
    /// <summary>
    /// Pending: User invited to event but hasn't responded yet.
    /// Accepted: User confirmed they will attend the event.
    /// Declined: User declined the event invitation.
    /// </summary>
    public enum ParticipationStatus { Pending, Accepted, Declined }

    /// <summary>
    /// Junction table linking employees to events they're participating in.
    /// Tracks invitation status (pending/accepted/declined) for each employee-event pair.
    /// Composite primary key: (EventId, UserId) - one record per employee per event.
    /// 
    /// Primary Key: Composite (EventId + UserId)
    /// Foreign Keys:
    /// - EventId (event_id) → EventsModel.Id (event being participated in)
    /// - UserId (user_id) → EmployeesModel.Id (employee participating)
    /// Bidirectional Relationships:
    /// - Event ↔ EventsModel.EventParticipations
    /// - Employee ↔ EmployeesModel.EventParticipations
    /// </summary>
    [Table("eventparticipation")]
    [PrimaryKey(nameof(EventId), nameof(UserId))]  // <-- define composite key here
    public class EventParticipationModel : IDbItemJunction
    {
        [Column("event_id")]
        [ForeignKey(nameof(Event))]
        public int EventId { get; set; }

        [Column("user_id")]
        [ForeignKey(nameof(Employee))]
        public int UserId { get; set; }

        [JsonIgnore]
        public virtual EventsModel? Event { get; set; } 
        
        [JsonIgnore]
        public virtual EmployeesModel? Employee { get; set; } 

        [Required]
        [Column("status")]
        public ParticipationStatus Status { get; set; }
    }
}
