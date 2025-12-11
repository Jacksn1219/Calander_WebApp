using System.Collections.Generic;
using Calender_WebApp.Models;
using Calender_WebApp.Services.Interfaces;
using Microsoft.AspNetCore.Mvc;

namespace Calender_WebApp.Controllers;

[ApiController]
[Route("api/employees")]
public class EmployeesController : ControllerBase
{
	private readonly IEmployeesService _employeesService;
	private readonly IReminderPreferencesService _reminderPreferencesService;

	public EmployeesController(IEmployeesService employeesService, IReminderPreferencesService reminderPreferencesService)
	{
		_employeesService = employeesService ?? throw new ArgumentNullException(nameof(employeesService));
		_reminderPreferencesService = reminderPreferencesService ?? throw new ArgumentNullException(nameof(reminderPreferencesService));
	}

	[HttpGet]
	public async Task<ActionResult<IEnumerable<EmployeesModel>>> GetAll()
	{
		var employees = await _employeesService.Get().ConfigureAwait(false);
		return Ok(employees);
	}

	[HttpGet("{id:int}")]
	public async Task<ActionResult<EmployeesModel>> GetById(int id)
	{
		try
		{
			var employee = await _employeesService.GetById(id).ConfigureAwait(false);
			return Ok(employee);
		}
		catch (InvalidOperationException)
		{
			return NotFound();
		}
	}

	[HttpGet("by-email/{email}")]
	public async Task<ActionResult<EmployeesModel>> GetByEmail(string email)
	{
		if (string.IsNullOrWhiteSpace(email))
		{
			return BadRequest("Email must be provided.");
		}

		try
		{
			var employee = await _employeesService.GetEmployeeByEmailAsync(email).ConfigureAwait(false);
			return Ok(employee);
		}
		catch (InvalidOperationException)
		{
			return NotFound();
		}
	}

	[HttpPost]
	public async Task<ActionResult<EmployeesModel>> Create([FromBody] EmployeesModel employee)
	{
		if (employee == null)
		{
			return BadRequest("Employee payload must be provided.");
		}

		if (!ModelState.IsValid)
		{
			return ValidationProblem(ModelState);
		}

		try
		{
			var createdEmployee = await _employeesService.Post(employee).ConfigureAwait(false);
			
			if (!createdEmployee.Id.HasValue)
			{
				return StatusCode(500, "Failed to create employee: ID was not generated.");
			}

			var reminderPreferences = new ReminderPreferencesModel
			{
				Id = createdEmployee.Id.Value
			};
			Console.WriteLine("Creating default reminder preferences for new user.");
			Console.WriteLine($"User ID: {createdEmployee.Id}");
			await _reminderPreferencesService.Post(reminderPreferences).ConfigureAwait(false);

			return CreatedAtAction(nameof(GetById), new { id = createdEmployee.Id }, createdEmployee);
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

	[HttpPut("{id:int}")]
	public async Task<ActionResult<EmployeesModel>> Update(int id, [FromBody] EmployeesModel employee)
	{
		if (employee == null)
		{
			return BadRequest("Employee payload must be provided.");
		}

		if (!ModelState.IsValid)
		{
			return ValidationProblem(ModelState);
		}

		try
		{
			var updatedEmployee = await _employeesService.Put(id, employee).ConfigureAwait(false);
			return Ok(updatedEmployee);
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

	[HttpDelete("{id:int}")]
	public async Task<IActionResult> Delete(int id)
	{
		try
		{
			await _employeesService.Delete(id).ConfigureAwait(false);
			await _reminderPreferencesService.Delete(id).ConfigureAwait(false);
			return NoContent();
		}
		catch (InvalidOperationException)
		{
			return NotFound();
		}
	}
}
