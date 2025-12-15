using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using Calender_WebApp.Models;
using Calender_WebApp.Services.Interfaces;
using Microsoft.AspNetCore.Mvc;

namespace Calender_WebApp.Controllers;

[ApiController]
[Route("api/reminderspreferences")]
public class ReminderPreferencesController : ControllerBase
{
	private readonly IReminderPreferencesService _reminderPreferencesService;

	public ReminderPreferencesController(IReminderPreferencesService reminderPreferencesService)
	{
		_reminderPreferencesService = reminderPreferencesService ?? throw new ArgumentNullException(nameof(reminderPreferencesService));
	}

	// GET /api/reminderspreferences — Get all reminder preferences
	[HttpGet]
	public async Task<ActionResult<IEnumerable<ReminderPreferencesModel>>> GetAll()
	{
		var reminders = await _reminderPreferencesService.Get().ConfigureAwait(false);
		return Ok(reminders);
	}

	// GET /api/reminderspreferences/room/{roomId} — Get reminder preferences by room
	[HttpGet("room/{roomId:int}")]
	public async Task<ActionResult<IEnumerable<ReminderPreferencesModel>>> GetByRoom(int roomId)
	{
		var reminders = await _reminderPreferencesService.GetById(roomId).ConfigureAwait(false);
		return Ok(reminders);
	}

	// GET /api/reminderspreferences/user/{userId} — Get reminder preferences by user
	[HttpGet("user/{userId:int}")]
	public async Task<ActionResult<IEnumerable<ReminderPreferencesModel>>> GetByUser(int userId)
	{
		var reminders = await _reminderPreferencesService.GetByUserId(userId).ConfigureAwait(false);
		return Ok(reminders);
	}

	// With the User creation it should automaticly create a basic ReminderPreference entry //
	// POST /api/reminderspreferences — Create new reminder preference
	// [HttpPost]
	// public async Task<ActionResult<ReminderPreferencesModel>> Create([FromBody] ReminderPreferencesModel reminderPreference)
	// {
	// 	if (reminderPreference == null)
	// 		return BadRequest("Reminder preference payload must be provided.");

	// 	if (!ModelState.IsValid)
	// 		return ValidationProblem(ModelState);

	// 	try
	// 	{
	// 		var created = await _reminderPreferencesService.Post(reminderPreference).ConfigureAwait(false);
	// 		// There is no GetById for bookings; return created payload
	// 		return Ok(created);
	// 	}
	// 	catch (ArgumentException ex)
	// 	{
	// 		return BadRequest(ex.Message);
	// 	}
	// 	catch (InvalidOperationException ex)
	// 	{
	// 		return Conflict(ex.Message);
	// 	}
	// }

	// Patch /api/reminderspreferences — Toggle reminder preference for a specific user
	[HttpPatch("{id:int}/toggle-eventreminder")]
	public async Task<ActionResult<bool>> ToggleEventReminder(int id)
	{
		try
		{
			var updated = await _reminderPreferencesService.ToggleEventReminders(id).ConfigureAwait(false);
			return Ok(updated);
		}
		catch (InvalidOperationException)
		{
			return NotFound();
		}
	}

	// Patch /api/reminderspreferences — Toggle reminder preference for a specific user
	[HttpPatch("{id:int}/toggle-bookingreminder")]
	public async Task<ActionResult<bool>> ToggleBookingReminder(int id)
	{
		try
		{
			var updated = await _reminderPreferencesService.ToggleBookingReminders(id).ConfigureAwait(false);
			return Ok(updated);
		}
		catch (InvalidOperationException)
		{
			return NotFound();
		}
	}

	// The ReminderPreferences should be deleted automatically when a user, event or roombooking is deleted //
	// DELETE /api/reminderspreferences — Delete reminderpreference (body: reminderpreferences details)
	// [HttpDelete("{id:int}")]
	// public async Task<IActionResult> Delete([FromBody] int id)
	// {
	// 	if (id <= 0)
	// 		return BadRequest("Valid reminder ID must be provided.");

	// 	try
	// 	{
	// 		_ = await _reminderPreferencesService.Delete(id).ConfigureAwait(false);

	// 		return NoContent();
	// 	}
	// 	catch (InvalidOperationException)
	// 	{
	// 		return NotFound();
	// 	}
	// }
}

