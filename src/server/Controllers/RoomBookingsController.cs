using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using Calender_WebApp.Models;
using Calender_WebApp.Services.Interfaces;
using Microsoft.AspNetCore.Mvc;

namespace Calender_WebApp.Controllers;

[ApiController]
[Route("api/room-bookings")]
public class RoomBookingsController : ControllerBase
{
	private readonly IRoomBookingsService _roomBookingsService;
	private readonly IRemindersService _remindersService;

	public RoomBookingsController(IRoomBookingsService roomBookingsService, IRemindersService remindersService)
	{
		_roomBookingsService = roomBookingsService ?? throw new ArgumentNullException(nameof(roomBookingsService));
		_remindersService = remindersService ?? throw new ArgumentNullException(nameof(remindersService));
	}

	// GET /api/room-bookings — Get all bookings
	[HttpGet]
	public async Task<ActionResult<IEnumerable<RoomBookingsModel>>> GetAll()
	{
		var bookings = await _roomBookingsService.Get().ConfigureAwait(false);
		return Ok(bookings);
	}

	// GET /api/room-bookings/{id} — Get booking by ID
	[HttpGet("{id:int}")]
	public async Task<ActionResult<RoomBookingsModel>> GetById(int id)
	{
		try
		{
			var booking = await _roomBookingsService.GetByIdAsync(id).ConfigureAwait(false);
			if (booking == null)
				return NotFound($"Booking with ID {id} not found.");
			
			return Ok(booking);
		}
		catch (Exception ex)
		{
			return StatusCode(500, $"Internal server error: {ex.Message}");
		}
	}

	// GET /api/room-bookings/room/{roomId} — Get bookings by room
	[HttpGet("room/{roomId:int}")]
	public async Task<ActionResult<IEnumerable<RoomBookingsModel>>> GetByRoom(int roomId)
	{
		var bookings = await _roomBookingsService.GetBookingsForRoomAsync(roomId).ConfigureAwait(false);
		return Ok(bookings);
	}

	// GET /api/room-bookings/user/{userId} — Get bookings by user
	[HttpGet("user/{userId:int}")]
	public async Task<ActionResult<IEnumerable<RoomBookingsModel>>> GetByUser(int userId)
	{
		var bookings = await _roomBookingsService.GetBookingsByUserIdAsync(userId).ConfigureAwait(false);
		return Ok(bookings);
	}

	// GET /api/room-bookings/available?start={start}&end={end} — Get available rooms for date range
	[HttpGet("available")]
	public async Task<ActionResult<IEnumerable<RoomsModel>>> GetAvailableRooms([FromQuery] DateTime start, [FromQuery] DateTime end)
	{
		var rooms = await _roomBookingsService.GetAvailableRoomsAsync(start, end).ConfigureAwait(false);
		return Ok(rooms);
	}

	// POST /api/room-bookings — Create new booking
	[HttpPost]
	public async Task<ActionResult<RoomBookingsModel>> Create([FromBody] RoomBookingsModel booking)
	{
		if (booking == null)
			return BadRequest("Booking payload must be provided.");

		if (!ModelState.IsValid)
			return ValidationProblem(ModelState);

		try
		{
			var created = await _roomBookingsService.Post(booking).ConfigureAwait(false);
			// There is no GetById for bookings; return created payload
			return Ok(created);
		}
		catch (ArgumentException ex)
		{
			return BadRequest(ex.Message);
		}
		catch (InvalidOperationException ex)
		{
			return Conflict(ex.Message);
		}
	}

	public class UpdateStartTimeRequest
	{
		public int RoomId { get; set; }
		public int UserId { get; set; }
		public DateTime BookingDate { get; set; }
		public TimeSpan StartTime { get; set; }
		public TimeSpan EndTime { get; set; }
		public TimeSpan NewStartTime { get; set; }
	}

	// PUT /api/room-bookings/{booking_id} — Update booking (entire booking)
	[HttpPut("{bookingid}")]
	public async Task<ActionResult<RoomBookingsModel>> Update(int bookingid, [FromBody] RoomBookingsModel booking)
	{
		if (booking == null)
			return BadRequest("Booking payload must be provided.");

		if (!ModelState.IsValid)
			return ValidationProblem(ModelState);

		try
		{
			var updated = await _roomBookingsService.Put(bookingid, booking).ConfigureAwait(false);
			return Ok(updated);
		}
		catch (InvalidOperationException ex)
		{
			// Check if it's a "not found" error or a conflict error
			if (ex.Message.Contains("Entity not found"))
				return NotFound(ex.Message);
			else
				return Conflict(ex.Message);
		}
		catch (ArgumentException ex)
		{
			return BadRequest(ex.Message);
		}
	}
	// PATCH /api/room-bookings/update-start-time — Update booking start time
	[HttpPatch("update-start-time")]
	public async Task<ActionResult<RoomBookingsModel>> UpdateStartTime([FromBody] UpdateStartTimeRequest request)
	{
		if (request == null)
			return BadRequest("Payload must be provided.");

		try
		{
			var updated = await _roomBookingsService.UpdateStartTime(
				new RoomBookingsModel
				{
					RoomId = request.RoomId,
					UserId = request.UserId,
					BookingDate = request.BookingDate,
					StartTime = request.StartTime,
					EndTime = request.EndTime,
					Purpose = string.Empty
				},
				request.NewStartTime
			).ConfigureAwait(false);

			return Ok(updated);
		}
		catch (InvalidOperationException)
		{
			return NotFound();
		}
		catch (ArgumentException ex)
		{
			return BadRequest(ex.Message);
		}
	}

	public class UpdateEndTimeRequest
	{
		public int RoomId { get; set; }
		public int UserId { get; set; }
		public DateTime BookingDate { get; set; }
		public TimeSpan StartTime { get; set; }
		public TimeSpan EndTime { get; set; }
		public TimeSpan NewEndTime { get; set; }
	}

	// PATCH /api/room-bookings/update-end-time — Update booking end time
	[HttpPatch("update-end-time")]
	public async Task<ActionResult<RoomBookingsModel>> UpdateEndTime([FromBody] UpdateEndTimeRequest request)
	{
		if (request == null)
			return BadRequest("Payload must be provided.");

		try
		{
			var updated = await _roomBookingsService.UpdateEndTime(
				new RoomBookingsModel
				{
					RoomId = request.RoomId,
					UserId = request.UserId,
					BookingDate = request.BookingDate,
					StartTime = request.StartTime,
					EndTime = request.EndTime,
					Purpose = string.Empty
				},
				request.NewEndTime
			).ConfigureAwait(false);

			return Ok(updated);
		}
		catch (InvalidOperationException)
		{
			return NotFound();
		}
		catch (ArgumentException ex)
		{
			return BadRequest(ex.Message);
		}
	}

	public class DeleteBookingRequest
	{
		public int RoomId { get; set; }
		public int UserId { get; set; }
		public DateTime BookingDate { get; set; }
		public TimeSpan StartTime { get; set; }
		public TimeSpan EndTime { get; set; }
	}

	// DELETE /api/room-bookings — Delete booking (body: booking details)
	[HttpDelete]
	public async Task<IActionResult> Delete([FromBody] DeleteBookingRequest request)
	{
		if (request == null)
			return BadRequest("Payload must be provided.");

		try
		{
			_ = await _roomBookingsService.Delete(new RoomBookingsModel
			{
				RoomId = request.RoomId,
				UserId = request.UserId,
				BookingDate = request.BookingDate,
				StartTime = request.StartTime,
				EndTime = request.EndTime,
				Purpose = string.Empty
			}).ConfigureAwait(false);

			await _remindersService.DeleteRoomBookingRemindersAsync(request.UserId, request.RoomId, request.BookingDate, request.StartTime).ConfigureAwait(false);

			return NoContent();
		}
		catch (InvalidOperationException)
		{
			return NotFound();
		}
	}
}

