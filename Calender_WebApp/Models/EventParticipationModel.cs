using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Microsoft.EntityFrameworkCore;              // <-- add this
using Calender_WebApp.Models.Interfaces;

namespace Calender_WebApp.Models
{
    public enum ParticipationStatus { Pending, Accepted, Declined }

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

        public virtual EventsModel Event { get; set; } = null!;
        public virtual EmployeesModel Employee { get; set; } = null!;

        [Required]
        [Column("status")]
        public ParticipationStatus Status { get; set; }
    }
}
