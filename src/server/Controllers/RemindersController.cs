using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using Calender_WebApp.Models;
using Calender_WebApp.Services.Interfaces;
using Microsoft.AspNetCore.Mvc;

namespace Calender_WebApp.Controllers;

[ApiController]
[Route("api/reminders")]
public class RemindersController : ControllerBase
{
	private readonly IRemindersService _remindersService;

	public RemindersController(IRemindersService remindersService)
	{
		_remindersService = remindersService ?? throw new ArgumentNullException(nameof(remindersService));
	}

	// GET /api/reminders — Get all reminders
	[HttpGet]
	public async Task<ActionResult<IEnumerable<RemindersModel>>> GetAll()
	{
		var reminders = await _remindersService.Get().ConfigureAwait(false);
		return Ok(reminders);
	}

	// GET /api/reminders/user/{userId} — Get reminders by user
	[HttpGet("user/{userId:int}")]
	public async Task<ActionResult<IEnumerable<RemindersModel>>> GetByUser(int userId)
	{
		var reminders = await _remindersService.GetByUserId(userId).ConfigureAwait(false);
		return Ok(reminders);
	}

	// GET /api/reminders/next/{userId} — Get next reminders for user within time range
	[HttpGet("user/{userId:int}/bydate")]
	public async Task<ActionResult<IEnumerable<RemindersModel>>> GetNextRemindersByUser(int userId, [FromQuery] DateTime fromTime, [FromQuery] DateTime toTime)
	{
		var reminders = await _remindersService.GetNextRemindersAsync(userId, fromTime, toTime).ConfigureAwait(false);
		return Ok(reminders);
	}

	// GET /api/reminders/today/{userId} — Get today's reminders for user
	[HttpGet("today/{userId:int}")]
	public async Task<ActionResult<IEnumerable<RemindersModel>>> GetTodaysRemindersByUser(int userId)
	{
		var startOfDay = DateTime.Today;
		var endOfDay = startOfDay.AddDays(1).AddTicks(-1);

		var reminders = await _remindersService.GetNextRemindersAsync(userId, startOfDay, endOfDay).ConfigureAwait(false);
		return Ok(reminders);
	}

	// POST /api/reminders — Create new reminder
	[HttpPost]
	public async Task<ActionResult<RemindersModel>> Create([FromBody] RemindersModel reminder)
	{
		if (reminder == null)
			return BadRequest("Reminder payload must be provided.");

		if (!ModelState.IsValid)
			return ValidationProblem(ModelState);

		try
		{
			var created = await _remindersService.Post(reminder).ConfigureAwait(false);
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

	// Should go automatically with participation deletion //
	// DELETE /api/reminders — Delete reminder (body: reminder details)
	// [HttpDelete("{id:int}")]
	// public async Task<IActionResult> Delete([FromBody] int id)
	// {
	// 	if (id <= 0)
	// 		return BadRequest("Valid reminder ID must be provided.");

	// 	try
	// 	{
	// 		_ = await _remindersService.Delete(id).ConfigureAwait(false);

	// 		return NoContent();
	// 	}
	// 	catch (InvalidOperationException)
	// 	{
	// 		return NotFound();
	// 	}
	// }

	// PUT /api/reminders/mark-as-read/{reminderId} — Mark reminder as read
	[HttpPut("mark-as-read/{reminderId:int}")]
	public async Task<IActionResult> MarkAsRead(int reminderId)
	{
		try
		{
			var result = await _remindersService.MarkReminderAsReadAsync(reminderId).ConfigureAwait(false);
			if (!result)
			{
				return NotFound();
			}

			return NoContent();
		}
		catch (InvalidOperationException)
		{
			return NotFound();
		}
	}
}

