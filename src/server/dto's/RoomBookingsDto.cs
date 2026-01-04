using System;

namespace Calender_WebApp.Dtos;

/// <summary>
/// Request model for updating booking start time. Requires full composite key to identify existing booking.
/// </summary>
public class UpdateStartTimeRequest
{
	public int RoomId { get; set; }
	public int UserId { get; set; }
	public DateTime BookingDate { get; set; }
	public TimeSpan StartTime { get; set; }
	public TimeSpan EndTime { get; set; }
	public TimeSpan NewStartTime { get; set; }
}

/// <summary>
/// Request model for updating booking end time. Requires full composite key to identify existing booking.
/// </summary>
public class UpdateEndTimeRequest
{
	public int RoomId { get; set; }
	public int UserId { get; set; }
	public DateTime BookingDate { get; set; }
	public TimeSpan StartTime { get; set; }
	public TimeSpan EndTime { get; set; }
	public TimeSpan NewEndTime { get; set; }
}

/// <summary>
/// Request model for deleting room booking. Uses composite key instead of single booking ID.
/// </summary>
public class DeleteBookingRequest
{
	public int RoomId { get; set; }
	public int UserId { get; set; }
	public DateTime BookingDate { get; set; }
	public TimeSpan StartTime { get; set; }
	public TimeSpan EndTime { get; set; }
}
