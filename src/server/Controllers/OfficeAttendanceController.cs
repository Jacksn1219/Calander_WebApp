using System;
using System.Collections.Generic;
using Calender_WebApp.Models;
using Calender_WebApp.Services.Interfaces;
using Microsoft.AspNetCore.Mvc;

namespace Calender_WebApp.Controllers;

[ApiController]
[Route("api/office-attendance")]
public class OfficeAttendanceController : ControllerBase
{
    private readonly IOfficeAttendanceService _officeAttendanceService;

    public OfficeAttendanceController(IOfficeAttendanceService officeAttendanceService)
    {
        _officeAttendanceService = officeAttendanceService ?? throw new ArgumentNullException(nameof(officeAttendanceService));
    }

    [HttpGet("today/{userId}")]
    public async Task<ActionResult<OfficeAttendanceModel>> GetToday(int userId)
    {
        try
        {
            // MOVE TO SERVICE START
            var today = DateTime.Today;
            // MOVE TO SERVICE END

            var record = await _officeAttendanceService
                .GetAttendanceByUserAndDateAsync(userId, today);

            return Ok(record);
        }
        catch (InvalidOperationException)
        {
            return NotFound();
        }
    }

    [HttpPut("today/{userId}")]
    public async Task<ActionResult<OfficeAttendanceModel>> Update(
        int userId,
        [FromBody] UpdateAttendanceRequest request)
    {
        if (!Enum.IsDefined(typeof(AttendanceStatus), request.Status))
            return BadRequest("Invalid attendance status.");

        var today = DateTime.Today;
        var status = (AttendanceStatus)request.Status;

        var result = await _officeAttendanceService
            .UpsertAttendanceAsync(userId, today, status);

        return Ok(result);
    }

    public class UpdateAttendanceRequest
    {
        public int Status { get; set; }
    }

    // ====================================================================
    // Endpoints below can be used if the front end needs them
    // ====================================================================

    //[HttpGet]
    //public async Task<ActionResult<IEnumerable<OfficeAttendanceModel>>> GetAll()
    //{
    //    var records = await _officeAttendanceService.Get().ConfigureAwait(false);
    //    return Ok(records);
    //}

    //[HttpGet("{id:int}")]
    //public async Task<ActionResult<OfficeAttendanceModel>> GetById(int id)
    //{
    //    try
    //    {
    //        var record = await _officeAttendanceService.GetById(id).ConfigureAwait(false);
    //        return Ok(record);
    //    }
    //    catch (InvalidOperationException)
    //    {
    //        return NotFound();
    //    }
    //}

    //[HttpGet("user/{userId}")]
    //public async Task<ActionResult<OfficeAttendanceModel>> GetByUserId(int userId)
    //{
    //    try
    //    {
    //        // MOVE TO SERVICE START
    //        var today = DateTime.Today;
    //        // MOVE TO SERVICE END

    //        var record = await _officeAttendanceService
    //            .GetAttendanceByUserAndDateAsync(userId, today)
    //            .ConfigureAwait(false);

    //        return Ok(record);
    //    }
    //    catch (InvalidOperationException)
    //    {
    //        return NotFound();
    //    }
    //}

    //[HttpGet("user/{userId}/date/{date}")]
    //public async Task<ActionResult<OfficeAttendanceModel>> GetByUserIdAndDate(int userId, DateTime date)
    //{
    //    try
    //    {
    //        var record = await _officeAttendanceService.GetAttendanceByUserAndDateAsync(userId, date).ConfigureAwait(false);
    //        return Ok(record);
    //    }
    //    catch (InvalidOperationException)
    //    {
    //        return NotFound();
    //    }
    //}

    //[HttpGet("date/{date}")]
    //public async Task<ActionResult<IEnumerable<OfficeAttendanceModel>>> GetByDate(DateTime date)
    //{
    //    var records = await _officeAttendanceService.GetAttendancesByDateAsync(date).ConfigureAwait(false);
    //    return Ok(records);
    //}

    //[HttpPost]
    //public async Task<ActionResult<OfficeAttendanceModel>> Create([FromBody] OfficeAttendanceModel
    //attendance)
    //{
    //    if (attendance == null)
    //    {
    //        return BadRequest("Attendance payload must be provided.");
    //    }

    //    if (!ModelState.IsValid)
    //    {
    //        return ValidationProblem(ModelState);
    //    }

    //    try
    //    {
    //        var createdRecord = await _officeAttendanceService.Post(attendance).ConfigureAwait(false);
    //        return CreatedAtAction(nameof(GetById), new { id = createdRecord.Id }, createdRecord);
    //    }
    //    catch (ArgumentException ex)
    //    {
    //        return BadRequest(ex.Message);
    //    }
    //    catch (InvalidOperationException ex)
    //    {
    //        return Conflict(ex.Message);
    //    }
    //}

    //[HttpDelete("{id:int}")]
    //public async Task<IActionResult> Delete(int id)
    //{
    //    try
    //    {
    //        await _officeAttendanceService.Delete(id).ConfigureAwait(false);
    //        return NoContent();
    //    }
    //    catch (InvalidOperationException)
    //    {
    //        return NotFound();
    //    }
    //}
}