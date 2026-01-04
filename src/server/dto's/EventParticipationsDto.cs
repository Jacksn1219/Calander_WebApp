namespace Calender_WebApp.Dtos;

/// <summary>
/// Request model for updating a participant's status. Status is represented as an integer enum value.
/// </summary>
public class UpdateStatusRequest
{
	public int Status { get; set; } = 0;
}

/// <summary>
/// Request model for deleting event participation. Uses composite key (EventId, UserId) instead of entity model.
/// </summary>
public class DeleteParticipationRequest
{
	public int EventId { get; set; }
	public int UserId { get; set; }
}
