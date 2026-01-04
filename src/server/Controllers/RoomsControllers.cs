using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using Calender_WebApp.Models;
using Calender_WebApp.Services.Interfaces;
using Microsoft.AspNetCore.Mvc;
namespace Calender_WebApp.Controllers;
[ApiController]
[Route("api/Rooms")]
public class RoomsController : ControllerBase
{
    private readonly IRoomsService _roomsService;

    public RoomsController(IRoomsService roomsService)
    {
        _roomsService = roomsService ?? throw new ArgumentNullException(nameof(roomsService));
    }

    [HttpGet]
    public async Task<ActionResult<IEnumerable<RoomsModel>>> GetAll()
    {
        var rooms = await _roomsService.Get().ConfigureAwait(false);
        return Ok(rooms);
    }

    [HttpGet("{id:int}")]
    public async Task<ActionResult<RoomsModel>> GetById(int id)
    {
        try
        {
            var room = await _roomsService.GetById(id).ConfigureAwait(false);
            return Ok(room);
        }
        catch (KeyNotFoundException)
        {
            return NotFound();
        }
    }

    [HttpGet("available-by-capacity")]
	public async Task<ActionResult<IEnumerable<RoomsModel>>> GetAvailableRoomsByCapacity([FromQuery] DateTime start, [FromQuery] DateTime end, [FromQuery] int capacity)
	{
		var rooms = await _roomsService.GetAvailableRoomsByCapacityAsync(start, end, capacity).ConfigureAwait(false);
		return Ok(rooms);
	}

    [HttpPost]
    public async Task<ActionResult<RoomsModel>> Create([FromBody] RoomsModel room)
    {
        if (room == null)
        {
            return BadRequest("Room payload must be provided.");
        }
        if (!ModelState.IsValid)
        {
            return ValidationProblem(ModelState);
        }

        var isNameAvailable = await _roomsService.ValidateRoomNameForCreate(room.RoomName).ConfigureAwait(false);
        if (!isNameAvailable)
        {
            return Conflict("Room with the same name already exists.");
        }

        try
        {
            var createdRoom = await _roomsService.Post(room).ConfigureAwait(false);
            return Ok(createdRoom);
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
    public async Task<ActionResult<RoomsModel>> Update(int id, [FromBody] RoomsModel room)
    {
        if (room == null)
        {
            return BadRequest("Room payload must be provided.");
        }

        if (!ModelState.IsValid)
        {
            return ValidationProblem(ModelState);
        }
        
        var isNameAvailable = await _roomsService.ValidateRoomNameForUpdate(id, room.RoomName).ConfigureAwait(false);
        if (!isNameAvailable)
        {
            return Conflict("Room with the same name already exists.");
        }
        
        try
        {
            var updatedRoom = await _roomsService.Put(id, room).ConfigureAwait(false);
            return Ok(updatedRoom);
        }
        catch (KeyNotFoundException)
        {
            return NotFound();
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

    [HttpDelete("{id:int}")]
    public async Task<IActionResult> Delete(int id)
    {
        try
        {
            await _roomsService.Delete(id).ConfigureAwait(false);
            return NoContent();
        }
        catch (KeyNotFoundException)
        {
            return NotFound();
        }
        catch (Microsoft.EntityFrameworkCore.DbUpdateException ex)
        {
            // Database-agnostic foreign key constraint check
            var errorMessage = ex.InnerException?.Message ?? ex.Message;
            if (errorMessage.Contains("foreign key", StringComparison.OrdinalIgnoreCase) ||
                errorMessage.Contains("constraint", StringComparison.OrdinalIgnoreCase) ||
                errorMessage.Contains("reference", StringComparison.OrdinalIgnoreCase))
            {
                return Conflict("Cannot delete room because it has existing bookings. Delete all bookings for this room first.");
            }
            
            throw; // Re-throw if it's not a foreign key constraint issue
        }
    }

    // ====================================================================
    // Endpoints below can be used if the front end needs them
    // ====================================================================

    //[HttpGet("by-name/{name}")]
    //public async Task<ActionResult<RoomsModel>> GetByName(string name)
    //{
    //    try
    //    {
    //        var room = await _roomsService.GetRoomByNameAsync(name).ConfigureAwait(false);
    //        return Ok(room);
    //    }
    //    catch (KeyNotFoundException)
    //    {
    //        return NotFound();
    //    }
    //}

    //[HttpGet("{id}/availability")]
    //public async Task<ActionResult<bool>> CheckAvailability(int id, [FromQuery] DateTime start, [FromQuery] DateTime end)
    //{
    //    if (start == default || end == default)
    //    {
    //        return BadRequest("Invalid time range: start and end must be valid date-time values.");
    //    }

    //    if (end <= start)
    //    {
    //        return BadRequest("Invalid time range: end must be after start.");
    //    }

    //    try
    //    {
    //        await _roomsService.GetById(id).ConfigureAwait(false);

    //        var isAvailable = await _roomsService.IsRoomAvailableAsync(id, start, end).ConfigureAwait(false);
    //        return Ok(isAvailable);
    //    }
    //    catch (InvalidOperationException)
    //    {
    //        return NotFound();
    //    }
    //}
}