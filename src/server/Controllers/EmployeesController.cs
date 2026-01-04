using System.Collections.Generic;
using Calender_WebApp.Models;
using Calender_WebApp.Services.Interfaces;
using Calender_WebApp.Dtos;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;


namespace Calender_WebApp.Controllers;

/// <summary>
/// Manages employee (user) CRUD operations. Most endpoints require authentication.
/// </summary>
[ApiController]
[Route("api/employees")]
[Authorize] 

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

	/// <summary>
	/// Creates a new employee and automatically creates default reminder preferences.
	/// </summary>
	[HttpPost]
	[Authorize(Roles = "Admin , SuperAdmin")]
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
	[Authorize(Roles = "Admin , SuperAdmin")]
	public async Task<ActionResult<EmployeesModel>> Update(int id, [FromBody] EmployeesModelForUpdate employee)
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
			var updatedEmployee = await _employeesService.Put(id,
			new EmployeesModel
			{
				Id = employee.User_id,
				Name = employee.Name,
				Email = employee.Email,
				Role = employee.Role,
				Password = employee.Password ?? string.Empty
			}).ConfigureAwait(false);
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

	/// <summary>
	/// Deletes an employee and their associated reminder preferences.
	/// </summary>
	[HttpDelete("{id:int}")]
	[Authorize(Roles = "Admin , SuperAdmin")]
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

	// ====================================================================
	// Endpoints below can be used if the front end needs them
	// ====================================================================

	//[HttpGet("by-email/{email}")]
	//public async Task<ActionResult<IEnumerable<EmployeesModel>>> GetByEmail(string email)
	//{
	//	if (string.IsNullOrWhiteSpace(email))
	//	{
	//		return BadRequest("Email must be provided.");
	//	}

	//	try
	//	{
	//		var employees = await _employeesService.GetEmployeeByEmailAsync(email).ConfigureAwait(false);
	//		return Ok(employees);
	//	}
	//	catch (InvalidOperationException)
	//	{
	//		return NotFound();
	//	}
	//}
}
