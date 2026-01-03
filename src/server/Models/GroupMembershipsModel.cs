using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Microsoft.EntityFrameworkCore;                 // <-- add this
using Calender_WebApp.Models.Interfaces;
using System.Text.Json.Serialization;

namespace Calender_WebApp.Models
{
    /// <summary>
    /// Junction table linking employees to groups they belong to.
    /// Represents many-to-many relationship between employees and groups.
    /// Composite primary key: (UserId, GroupId) - one record per employee per group.
    /// 
    /// Primary Key: Composite (UserId + GroupId)
    /// Foreign Keys:
    /// - UserId (user_id) → EmployeesModel.Id (employee in the group)
    /// - GroupId (group_id) → GroupsModel.Id (group the employee belongs to)
    /// Bidirectional Relationships:
    /// - Employee ↔ EmployeesModel.GroupMemberships
    /// - Group ↔ GroupsModel.GroupMemberships
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
