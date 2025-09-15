using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Calender_WebApp.Models.Interfaces;

namespace Calender_WebApp.Models
{
    /// <summary>
    /// Represents a membership relation between an employee and a group.
    /// </summary>
    [Table("groupmemberships")]
    public class GroupMembershipsModel : IDbItem
    {
        /// <summary>
        /// Primary key for the GroupMembership entity.
        /// </summary>
        [Key]
        [Required]
        [Column("id", Order = 0)]
        public int? Id { get; set; }

        /// <summary>
        /// ID of the employee in this membership.
        /// </summary>
        [Column("user_id", Order = 1)]
        [ForeignKey(nameof(Employee))]
        public int UserId { get; set; }

        /// <summary>
        /// Navigation property for the related employee.
        /// </summary>
        public virtual EmployeesModel Employee { get; set; } = null!;

        /// <summary>
        /// ID of the group in this membership.
        /// </summary>
        [Key]
        [Column("group_id", Order = 2)]
        [ForeignKey(nameof(Group))]
        public int GroupId { get; set; }

        /// <summary>
        /// Navigation property for the related group.
        /// </summary>
        public virtual GroupsModel Group { get; set; } = null!;
    }
}
