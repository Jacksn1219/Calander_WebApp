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
    [HttpGet("by-name/{name}")]
    public async Task<ActionResult<RoomsModel>> GetByName(string name)
    {
        try
        {
            var room = await _roomsService.GetRoomByNameAsync(name).ConfigureAwait(false);
            return Ok(room);
        }
        catch (KeyNotFoundException)
        {
            return NotFound();
        }
    }
    [HttpGet("{id}/availability")]
    public async Task<ActionResult<bool>> CheckAvailability(int id, [FromQuery] DateTime start, [FromQuery] DateTime end)
    {
        try
        {
            var isAvailable = await _roomsService.IsRoomAvailableAsync(id, start, end).ConfigureAwait(false);
            return Ok(isAvailable);
        }
        catch (KeyNotFoundException)
        {
            return NotFound();
        }
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
    }
}