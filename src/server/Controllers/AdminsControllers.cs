using System.Collections.Generic;
using Calender_WebApp.Models;
using Calender_WebApp.Services.Interfaces;
using Microsoft.AspNetCore.Mvc;

namespace Calender_WebApp.Controllers;

[ApiController]
[Route("api/admins")]
public class AdminsController : ControllerBase
{
	private readonly IAdminsService _adminsService;

	public AdminsController(IAdminsService adminsService)
	{
		_adminsService = adminsService ?? throw new ArgumentNullException(nameof(adminsService));
	}

	// ====================================================================
	// Endpoints below can be used if the front end needs them
	// ====================================================================

	//[HttpGet("all-admins")]
	//public async Task<ActionResult<IEnumerable<AdminsModel>>> GetAll()
	//{
	//	var admins = await _adminsService.Get().ConfigureAwait(false);
	//	return Ok(admins);
	//}

	//[HttpGet("{id:int}")]
	//public async Task<ActionResult<AdminsModel>> GetById(int id)
	//{
	//	try
	//	{
	//		var admin = await _adminsService.GetById(id).ConfigureAwait(false);
	//		return Ok(admin);
	//	}
	//	catch (InvalidOperationException)
	//	{
	//		return NotFound();
	//	}
	//}

	//[HttpGet("by-username/{username}")]
	//public async Task<ActionResult<AdminsModel>> GetByUsername(string username)
	//{
	//	if (string.IsNullOrWhiteSpace(username))
	//	{
	//		return BadRequest("Username must be provided.");
	//	}

	//	try
	//	{
	//		var admin = await _adminsService.GetByUsername(username).ConfigureAwait(false);
	//		return Ok(admin);
	//	}
	//	catch (InvalidOperationException)
	//	{
	//		return NotFound();
	//	}
	//}

	//[HttpPost("create-admin")]
	//public async Task<ActionResult<AdminsModel>> Create([FromBody] AdminsModel admin)
	//{
	//	if (admin == null)
	//	{
	//		return BadRequest("Admin payload must be provided.");
	//	}

	//	if (!ModelState.IsValid)
	//	{
	//		return ValidationProblem(ModelState);
	//	}

	//	try
	//	{
	//		var createdAdmin = await _adminsService.Post(admin).ConfigureAwait(false);
	//		return CreatedAtAction(nameof(GetById), new { id = createdAdmin.Id }, createdAdmin);
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

	//[HttpPut("{id:int}")]
	//public async Task<ActionResult<AdminsModel>> Update(int id, [FromBody] AdminsModel admin)
	//{
	//	if (admin == null)
	//	{
	//		return BadRequest("Admin payload must be provided.");
	//	}

	//	if (!ModelState.IsValid)
	//	{
	//		return ValidationProblem(ModelState);
	//	}

	//	try
	//	{
	//		var updatedAdmin = await _adminsService.Put(id, admin).ConfigureAwait(false);
	//		return Ok(updatedAdmin);
	//	}
	//	catch (InvalidOperationException)
	//	{
	//		return NotFound();
	//	}
	//	catch (ArgumentException ex)
	//	{
	//		return BadRequest(ex.Message);
	//	}
	//}

	//[HttpDelete("{id:int}")]
	//public async Task<IActionResult> Delete(int id)
	//{
	//	try
	//	{
	//		await _adminsService.Delete(id).ConfigureAwait(false);
	//		return NoContent();
	//	}
	//	catch (InvalidOperationException)
	//	{
	//		return NotFound();
	//	}
	//}
}
