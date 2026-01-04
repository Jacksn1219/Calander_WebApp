using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Microsoft.EntityFrameworkCore;                 // <-- add this
using Calender_WebApp.Models.Interfaces;
using System.Text.Json.Serialization;

namespace Calender_WebApp.Models
{
    /// <summary>
    /// Junction table linking employees to groups they belong to.
    /// Enables organizational grouping of employees for access control, communication, or reporting.
    /// 
    /// Business Rules:
    /// - Composite primary key ensures an employee can only be added to a group once
    /// - No additional metadata (role, join date) is tracked; pure many-to-many relationship
    /// 
    /// Primary Key: UserId + GroupId (composite key: user_id, group_id)
    /// 
    /// Foreign Keys:
    /// - UserId (user_id) → EmployeesModel.Id (employee in the group)
    /// - GroupId (group_id) → GroupsModel.Id (group the employee belongs to)
    /// 
    /// Bidirectional Relationships:
    /// - Employee ↔ EmployeesModel.GroupMemberships (all groups this employee is in)
    /// - Group ↔ GroupsModel.GroupMemberships (all members of this group)
    /// </summary>
    [Table("groupmemberships")]
    [PrimaryKey(nameof(UserId), nameof(GroupId))]
    public class GroupMembershipsModel : IDbItemJunction
    {
        [Column("user_id")]
        [ForeignKey(nameof(Employee))]
        public int UserId { get; set; }
        [JsonIgnore]
        public virtual EmployeesModel? Employee { get; set; }

        [Column("group_id")]
        [ForeignKey(nameof(Group))]
        public int GroupId { get; set; }
        [JsonIgnore]
        public virtual GroupsModel? Group { get; set; }
    }
}
