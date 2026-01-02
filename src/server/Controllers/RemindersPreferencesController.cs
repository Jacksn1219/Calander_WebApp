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

	[HttpGet]
	public async Task<ActionResult<IEnumerable<ReminderPreferencesModel>>> GetAll()
	{
		var reminders = await _reminderPreferencesService.Get().ConfigureAwait(false);
		return Ok(reminders);
	}

	[HttpGet("room/{roomId:int}")]
	public async Task<ActionResult<IEnumerable<ReminderPreferencesModel>>> GetByRoom(int roomId)
	{
		var reminders = await _reminderPreferencesService.GetById(roomId).ConfigureAwait(false);
		return Ok(reminders);
	}

	[HttpGet("user/{userId:int}")]
	public async Task<ActionResult<IEnumerable<ReminderPreferencesModel>>> GetByUser(int userId)
	{
		var reminders = await _reminderPreferencesService.GetByUserId(userId).ConfigureAwait(false);
		return Ok(reminders);
	}

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

	[HttpPatch("{id:int}/advance-minutes")]
	public async Task<ActionResult<ReminderPreferencesModel>> UpdateAdvanceMinutes(int id, [FromBody] string advanceMinutes)
	{
		try
		{
			if (!TimeSpan.TryParse(advanceMinutes, out var timeSpan))
			{
				return BadRequest("Invalid time format");
			}
			
			var updated = await _reminderPreferencesService.UpdateAdvanceMinutes(id, timeSpan).ConfigureAwait(false);
			return Ok(updated);
		}
		catch (InvalidOperationException)
		{
			return NotFound();
		}
	}
}

