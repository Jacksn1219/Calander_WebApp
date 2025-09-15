using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace Calender_WebApp.Models
{
    /// <summary>
    /// Represents a membership relation between an employee and a group.
    /// </summary>
    [Table("groupmemberships")]
    public class GroupMembershipsModel : IDbItem
    {
        /// <summary>
        /// ID of the employee in this membership.
        /// </summary>
        [Key]
        [Column("user_id", Order = 0)]
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
        [Column("group_id", Order = 1)]
        [ForeignKey(nameof(Group))]
        public int GroupId { get; set; }

        /// <summary>
        /// Navigation property for the related group.
        /// </summary>
        public virtual GroupsModel Group { get; set; } = null!;
    }
}
