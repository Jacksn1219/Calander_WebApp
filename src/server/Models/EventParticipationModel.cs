using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Microsoft.EntityFrameworkCore;              // <-- add this
using Calender_WebApp.Models.Interfaces;
using System.Text.Json.Serialization;

namespace Calender_WebApp.Models
{
    /// <summary>
    /// Tracks the response status of an employee invited to an event.
    /// 
    /// Values:
    /// - Pending: Invitation sent, awaiting employee response (initial state)
    /// - Accepted: Employee confirmed attendance
    /// - Declined: Employee declined invitation
    /// </summary>
    public enum ParticipationStatus { Pending, Accepted, Declined }

    /// <summary>
    /// Junction table linking employees to events they are invited to, tracking their participation status.
    /// Enables event organizers to manage attendee lists and track RSVPs.
    /// 
    /// Business Rules:
    /// - Composite primary key prevents duplicate invitations (one participation per employee per event)
    /// - Status defaults to Pending when invitation is created
    /// - Employee can update their own status (Accepted/Declined)
    /// 
    /// Primary Key: EventId + UserId (composite key: event_id, user_id)
    /// 
    /// Foreign Keys:
    /// - EventId (event_id) → EventsModel.Id (event the employee is invited to)
    /// - UserId (user_id) → EmployeesModel.Id (employee invited to the event)
    /// 
    /// Bidirectional Relationships:
    /// - Event ↔ EventsModel (navigation property not shown in EventsModel)
    /// - Employee ↔ EmployeesModel.EventParticipations (all events this employee is invited to)
    /// </summary>
    [Table("eventparticipation")]
    [PrimaryKey(nameof(EventId), nameof(UserId))]
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
