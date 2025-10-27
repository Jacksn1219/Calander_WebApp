using System.Collections.Generic;
using Calender_WebApp.Models;
using Calender_WebApp.Services.Interfaces;
using Microsoft.AspNetCore.Mvc;

namespace Calender_WebApp.Controllers;

[ApiController]
[Route("api/event-participation")]
public class EventParticipationController : ControllerBase
{
	private readonly IEventParticipationService _eventParticipationService;

	public EventParticipationController(IEventParticipationService eventParticipationService)
	{
		_eventParticipationService = eventParticipationService ?? throw new ArgumentNullException(nameof(eventParticipationService));
	}

	// GET /api/event-participation
	[HttpGet]
	public async Task<ActionResult<IEnumerable<EventParticipationModel>>> GetAll()
	{
		var participations = await _eventParticipationService.Get().ConfigureAwait(false);
		return Ok(participations);
	}

	// GET /api/event-participation/event/{eventId}
	[HttpGet("event/{eventId:int}")]
	public async Task<ActionResult<IEnumerable<EventParticipationModel>>> GetByEvent(int eventId)
	{
		var participations = await _eventParticipationService.GetParticipantsByEventIdAsync(eventId).ConfigureAwait(false);
		return Ok(participations);
	}

	// GET /api/event-participation/user/{userId}
	[HttpGet("user/{userId:int}")]
	public async Task<ActionResult<IEnumerable<EventParticipationModel>>> GetByUser(int userId)
	{
		// You need to implement GetByUser in your service if needed, or remove this endpoint.
		return BadRequest("GetByUser is not implemented in the service.");
	}

	// GET /api/event-participation/event/{eventId}/user/{userId}
	[HttpGet("event/{eventId:int}/user/{userId:int}")]
	public async Task<ActionResult<EventParticipationModel>> CheckParticipation(int eventId, int userId)
	{
		var isParticipating = await _eventParticipationService.IsUserParticipatingAsync(eventId, userId).ConfigureAwait(false);
		if (!isParticipating)
			return NotFound();
		// Optionally, you can return the participation record if you add a method for that in your service.
		return Ok(new { EventId = eventId, UserId = userId, IsParticipating = true });
	}

	// POST /api/event-participation
	[HttpPost]
	public async Task<ActionResult<EventParticipationModel>> Create([FromBody] EventParticipationModel participation)
	{
		if (participation == null)
			return BadRequest("Participation payload must be provided.");

		if (!ModelState.IsValid)
			return ValidationProblem(ModelState);

		try
		{
			var created = await _eventParticipationService.Post(participation).ConfigureAwait(false);
			return CreatedAtAction(nameof(CheckParticipation), new { eventId = created.EventId, userId = created.UserId }, created);
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

	public class UpdateStatusRequest
	{
		public string Status { get; set; } = string.Empty;
	}
	

	[HttpPut("event/{eventId:int}/user/{userId:int}/status")]
	public async Task<ActionResult<EventParticipationModel>> UpdateStatus(int eventId, int userId, [FromBody] UpdateStatusRequest request)
	{
		if (request == null || string.IsNullOrWhiteSpace(request.Status))
			return BadRequest("Status must be provided.");

		try
		{
			var updated = await _eventParticipationService.UpdateStatus(eventId, userId, request.Status).ConfigureAwait(false);
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

	// DELETE /api/event-participation
	public class DeleteParticipationRequest
	{
		public int EventId { get; set; }
		public int UserId { get; set; }
	}

	[HttpDelete]
	public async Task<IActionResult> Delete([FromBody] DeleteParticipationRequest request)
	{
		if (request == null)
			return BadRequest("Payload must be provided.");

		try
		{
			var deleted = await _eventParticipationService.Delete(new EventParticipationModel { EventId = request.EventId, UserId = request.UserId }).ConfigureAwait(false);
			return NoContent();
		}
		catch (InvalidOperationException)
		{
			return NotFound();
		}
	}
}

