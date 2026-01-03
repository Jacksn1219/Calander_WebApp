using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Text.Json.Serialization;
using Calender_WebApp.Models.Interfaces;

namespace Calender_WebApp.Models
{
    /// <summary>
    /// Represents a user group for organizing employees.
    /// Groups can contain multiple employees and are used for permission management or team organization.
    /// 
    /// Primary Key: Id (group_id)
    /// Foreign Keys: None (root entity)
    /// Bidirectional Relationships:
    /// - GroupMemberships ↔ GroupMembershipsModel.GroupId (employees belonging to this group)
    /// </summary>
    [Table("groups")]
    public class GroupsModel : IDbItem
    {
        [Key]
        [JsonPropertyName("group_id")]
        [Column("group_id", Order = 0)]
        public int? Id { get; set; }

        [Required]
        [Column("group_name", Order = 1)]
        public string GroupName { get; set; } = string.Empty;

        [Column("description", Order = 2)]
        public string? Description { get; set; }

        [JsonIgnore]
        public virtual ICollection<GroupMembershipsModel> GroupMemberships { get; set; } = new List<GroupMembershipsModel>();
    }
}
