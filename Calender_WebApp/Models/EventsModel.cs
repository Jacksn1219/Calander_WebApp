using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Calender_WebApp.Models.Interfaces;

namespace Calender_WebApp.Models
{
    /// <summary>
    /// Represents an event in the system.
    /// </summary>
    [Table("events")]
    public class EventsModel : IDbItem
    {
        /// <summary>
        /// Primary key for the Event entity.
        /// </summary>
        [Key]
        [Required]
        [Column("id", Order = 0)]
        public int? Id { get; set; }

        /// <summary>
        /// Unique identifier for the event.
        /// </summary>
        [Required]
        [Column("event_id", Order = 1)]
        public int EventId { get; set; }

        /// <summary>
        /// Title of the event.
        /// </summary>
        [Required]
        [Column("title", Order = 2)]
        public string Title { get; set; } = string.Empty;

        /// <summary>
        /// Description of the event.
        /// </summary>
        [Column("description", Order = 3)]
        public string? Description { get; set; }

        /// <summary>
        /// Date and time when the event occurs.
        /// </summary>
        [Required]
        [Column("event_date", Order = 4)]
        public DateTime EventDate { get; set; }

        /// <summary>
        /// ID of the user who created the event.
        /// </summary>
        [Column("created_by", Order = 5)]
        [ForeignKey(nameof(CreatedByUser))]
        public int CreatedBy { get; set; }

        /// <summary>
        /// Navigation property for the employee who created the event.
        /// </summary>
        public virtual EmployeesModel CreatedByUser { get; set; } = null!;
    }
}
