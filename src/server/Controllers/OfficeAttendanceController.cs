using System;
using System.Collections.Generic;
using Calender_WebApp.Models;
using Calender_WebApp.Services.Interfaces;
using Microsoft.AspNetCore.Mvc;

using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;



namespace Calender_WebApp.Controllers;


[ApiController]
[Route("api/office-attendance")]

public class OfficeAttendanceController : ControllerBase
{
    private readonly IOfficeAttendanceService _officeAttendanceService;
    private int GetCurrentUserId()
    {
        var userIdClaim =
            User.FindFirst(ClaimTypes.NameIdentifier) ??
            User.FindFirst("sub");

        if (userIdClaim == null)
            throw new UnauthorizedAccessException("User ID not found in token.");

        return int.Parse(userIdClaim.Value);
    }

    public OfficeAttendanceController(IOfficeAttendanceService officeAttendanceService)
    {
        _officeAttendanceService = officeAttendanceService ?? throw new ArgumentNullException(nameof(officeAttendanceService));
    }

    [HttpGet]
    public async Task<ActionResult<IEnumerable<OfficeAttendanceModel>>> GetAll()
    {
        var records = await _officeAttendanceService.Get().ConfigureAwait(false);
        return Ok(records);
    }

    [HttpGet("{id:int}")]
    public async Task<ActionResult<OfficeAttendanceModel>> GetById(int id)
    {
        try
        {
            var record = await _officeAttendanceService.GetById(id).ConfigureAwait(false);
            return Ok(record);
        }
        catch (InvalidOperationException)
        {
            return NotFound();
        }
    }
    [HttpGet("user/{userId}")]
    public async Task<ActionResult<IEnumerable<OfficeAttendanceModel>>> GetByUserId(int userId)
    {
        var records = await _officeAttendanceService.GetAttendancesByUserIdAsync(userId).ConfigureAwait(false);
        return Ok(records);
    }
    [HttpGet("user/{userId}/date/{date}")]
    public async Task<ActionResult<OfficeAttendanceModel>> GetByUserIdAndDate(int userId, DateTime date)
    {
        try
        {
            var record = await _officeAttendanceService.GetAttendanceByUserAndDateAsync(userId, date).ConfigureAwait(false);
            return Ok(record);
        }
        catch (InvalidOperationException)
        {
            return NotFound();
        }
    }
    [HttpGet("date/{date}")]
    public async Task<ActionResult<IEnumerable<OfficeAttendanceModel>>> GetByDate(DateTime date)
    {
        var records = await _officeAttendanceService.GetAttendancesByDateAsync(date).ConfigureAwait(false);
        return Ok(records);
    }
    [HttpPost]
    public async Task<ActionResult<OfficeAttendanceModel>> Create([FromBody] OfficeAttendanceModel
    attendance)
    {
        if (attendance == null)
        {
            return BadRequest("Attendance payload must be provided.");
        }

        if (!ModelState.IsValid)
        {
            return ValidationProblem(ModelState);
        }

        try
        {
            var createdRecord = await _officeAttendanceService.Post(attendance).ConfigureAwait(false);
            return CreatedAtAction(nameof(GetById), new { id = createdRecord.Id }, createdRecord);
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
    public async Task<ActionResult<OfficeAttendanceModel>> Update(int id, [FromBody] OfficeAttendanceModel
attendance)
    {
        if (attendance == null)
        {
            return BadRequest("Attendance payload must be provided.");
        }

        if (!ModelState.IsValid)
        {
            return ValidationProblem(ModelState);
        }

        try
        {
            var updatedRecord = await _officeAttendanceService.Put(id, attendance).ConfigureAwait(false);
            return Ok(updatedRecord);
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
            await _officeAttendanceService.Delete(id).ConfigureAwait(false);
            return NoContent();
        }
        catch (InvalidOperationException)
        {
            return NotFound();
        }
    }


    [HttpGet("me/today")]
    public async Task<ActionResult<OfficeAttendanceModel>> GetMyAttendanceToday()
    {
        try
        {
            var userId = GetCurrentUserId();
            var today = DateTime.Today;

            var record = await _officeAttendanceService
                .GetAttendanceByUserAndDateAsync(userId, today)
                .ConfigureAwait(false);

            return Ok(record);
        }
        catch (InvalidOperationException)
        {
            // Nog geen attendance gezet voor vandaag
            return NotFound();
        }
    }



    [HttpPut("me/today")]
    public async Task<ActionResult<OfficeAttendanceModel>> UpdateMyAttendanceToday(
        [FromBody] UpdateAttendanceRequest request)
    {
        if (!ModelState.IsValid)
            return ValidationProblem(ModelState);

        if (!Enum.TryParse<AttendanceStatus>(
            request.Status,
            ignoreCase: true,
            out var parsedStatus))
        {
            return BadRequest("Invalid attendance status.");
        }

        var userId = GetCurrentUserId();
        var today = DateTime.Today;

        var result = await _officeAttendanceService
            .UpsertAttendanceAsync(userId, today, parsedStatus)
            .ConfigureAwait(false);

        return Ok(result);
    }



    public class UpdateAttendanceRequest
    {
        public string Status { get; set; } = string.Empty;
    }


}