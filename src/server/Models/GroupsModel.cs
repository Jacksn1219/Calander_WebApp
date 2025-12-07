using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Text.Json.Serialization;
using Calender_WebApp.Models.Interfaces;

namespace Calender_WebApp.Models
{
    /// <summary>
    /// Represents a group in the system.
    /// </summary>
    [Table("groups")]
    public class GroupsModel : IDbItem
    {
        /// <summary>
        /// Primary key for the GroupMembership entity.
        /// </summary>
        [Key]
        [JsonPropertyName("group_id")]
        [Column("group_id", Order = 0)]
        public int? Id { get; set; }

        /// <summary>
        /// Name of the group.
        /// </summary>
        [Required]
        [Column("group_name", Order = 1)]
        public string GroupName { get; set; } = string.Empty;

        /// <summary>
        /// Description of the group.
        /// </summary>
        [Column("description", Order = 2)]
        public string? Description { get; set; }

        /// <summary>
        /// Collection of memberships associated with this group.
        /// </summary>
        [JsonIgnore]
        public virtual ICollection<GroupMembershipsModel> GroupMemberships { get; set; } = new List<GroupMembershipsModel>();
    }
}
