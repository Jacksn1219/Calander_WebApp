using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Calender_WebApp.Models.Interfaces;

namespace Calender_WebApp.Models
{
    /// <summary>
    /// Represents the status of a user's participation in an event.
    /// </summary>
    public enum ParticipationStatus
    {
        Pending,
        Accepted,
        Declined
    }

    /// <summary>
    /// Represents the participation of a user in an event.
    /// </summary>
    [Table("eventparticipation")]
    public class EventParticipationModel : IDbItemJunction
    {
    /// <summary>
    /// ID of the related event (part of composite primary key).
    /// </summary>
    [Key, Column("event_id", Order = 0)]
    [ForeignKey(nameof(Event))]
    public int EventId { get; set; }

    /// <summary>
    /// ID of the user participating in the event (part of composite primary key).
    /// </summary>
    [Key, Column("user_id", Order = 1)]
    [ForeignKey(nameof(Employee))]
    public int UserId { get; set; }

    /// <summary>
    /// Navigation property for the related event.
    /// </summary>
    public virtual EventsModel Event { get; set; } = null!;

    /// <summary>
    /// Navigation property for the related employee.
    /// </summary>
    public virtual EmployeesModel Employee { get; set; } = null!;

    /// <summary>
    /// Status of the user's participation (Pending, Accepted, Declined).
    /// </summary>
    [Required]
    [Column("status", Order = 2)]
    public ParticipationStatus Status { get; set; }
    }
}
