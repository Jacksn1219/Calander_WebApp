namespace Calender_WebApp.Dtos;

/// <summary>
/// Request model for updating attendance status. Status is an integer representing AttendanceStatus enum.
/// </summary>
public class UpdateAttendanceRequest
{
	public int Status { get; set; }
}
