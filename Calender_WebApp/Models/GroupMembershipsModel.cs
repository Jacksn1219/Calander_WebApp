using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Microsoft.EntityFrameworkCore;                 // <-- add this
using Calender_WebApp.Models.Interfaces;

namespace Calender_WebApp.Models
{
    [Table("groupmemberships")]
    [PrimaryKey(nameof(UserId), nameof(GroupId))]     // <-- define composite key here
    public class GroupMembershipsModel : IDbItemJunction
    {
        [Column("user_id")]
        [ForeignKey(nameof(Employee))]
        public int UserId { get; set; }
        public virtual EmployeesModel Employee { get; set; } = null!;

        [Column("group_id")]
        [ForeignKey(nameof(Group))]
        public int GroupId { get; set; }
        public virtual GroupsModel Group { get; set; } = null!;
    }
}
