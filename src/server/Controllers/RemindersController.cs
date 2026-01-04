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

	[HttpGet("user/{userId:int}")]
	public async Task<ActionResult<IEnumerable<RemindersModel>>> GetByUser(int userId)
	{
		var reminders = await _remindersService.GetByUserId(userId).ConfigureAwait(false);
		return Ok(reminders);
	}

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

	// ====================================================================
	// Endpoints below can be used if the front end needs them
	// ====================================================================

	//[HttpGet]
	//public async Task<ActionResult<IEnumerable<RemindersModel>>> GetAll()
	//{
	//	var reminders = await _remindersService.Get().ConfigureAwait(false);
	//	return Ok(reminders);
	//}

	//[HttpGet("user/{userId:int}/bydate")]
	//public async Task<ActionResult<IEnumerable<RemindersModel>>> GetNextRemindersByUser(int userId, [FromQuery] DateTime fromTime, [FromQuery] DateTime toTime)
	//{
	//	var reminders = await _remindersService.GetNextRemindersAsync(userId, fromTime, toTime).ConfigureAwait(false);
	//	return Ok(reminders);
	//}

	//[HttpGet("today/{userId:int}")]
	//public async Task<ActionResult<IEnumerable<RemindersModel>>> GetTodaysRemindersByUser(int userId)
	//{
	//	// MOVE TO SERVICE START
	//	var startOfDay = DateTime.Today;
	//	var endOfDay = startOfDay.AddDays(1).AddTicks(-1);
	//	// MOVE TO SERVICE END

	//	var reminders = await _remindersService.GetNextRemindersAsync(userId, startOfDay, endOfDay).ConfigureAwait(false);
	//	return Ok(reminders);
	//}

	//[HttpPost]
	//public async Task<ActionResult<RemindersModel>> Create([FromBody] RemindersModel reminder)
	//{
	//	if (reminder == null)
	//		return BadRequest("Reminder payload must be provided.");

	//	if (!ModelState.IsValid)
	//		return ValidationProblem(ModelState);

	//	try
	//	{
	//		var created = await _remindersService.Post(reminder).ConfigureAwait(false);
	//		return Ok(created);
	//	}
	//	catch (ArgumentException ex)
	//	{
	//		return BadRequest(ex.Message);
	//	}
	//	catch (InvalidOperationException ex)
	//	{
	//		return Conflict(ex.Message);
	//	}
	//}
}

