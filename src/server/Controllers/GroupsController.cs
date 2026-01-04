using System;
using System.Collections.Generic;
using Calender_WebApp.Models;
using Calender_WebApp.Services.Interfaces;
using Microsoft.AspNetCore.Mvc;
namespace Calender_WebApp.Controllers;
[ApiController]
[Route("api/Groups")]
public class GroupsController : ControllerBase
{
    private readonly IGroupsService _groupsService;

    public GroupsController(IGroupsService groupsService)
    {
        _groupsService = groupsService ?? throw new ArgumentNullException(nameof(groupsService));
    }

    // ====================================================================
    // Endpoints below can be used if the front end needs them
    // ====================================================================

    //[HttpGet]
    //public async Task<ActionResult<IEnumerable<GroupsModel>>> GetAll()
    //{
    //    var groups = await _groupsService.Get().ConfigureAwait(false);
    //    return Ok(groups);
    //}

    //[HttpGet("{id:int}")]
    //public async Task<ActionResult<GroupsModel>> GetById(int id)
    //{
    //    try
    //    {
    //        var group = await _groupsService.GetById(id).ConfigureAwait(false);
    //        return Ok(group);
    //    }
    //    catch (InvalidOperationException)
    //    {
    //        return NotFound();
    //    }
    //}

    //[HttpGet("by-user/{userId:int}")]
    //public async Task<ActionResult<IEnumerable<GroupsModel>>> GetByUserId(int userId)
    //{
    //    var groups = await _groupsService.GetGroupsByUserAsync(userId).ConfigureAwait(false);
    //    return Ok(groups);
    //}

    //[HttpPost]
    //public async Task<ActionResult<GroupsModel>> Create([FromBody] GroupsModel group)
    //{
    //    if (group == null)
    //    {
    //        return BadRequest("Group payload must be provided.");
    //    }

    //    if (!ModelState.IsValid)
    //    {
    //        return ValidationProblem(ModelState);
    //    }

    //    try
    //    {
    //        var createdGroup = await _groupsService.Post(group).ConfigureAwait(false);
    //        return CreatedAtAction(nameof(GetById), new { id = createdGroup.Id }, createdGroup);
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

    //[HttpPut("{id:int}")]
    //public async Task<ActionResult<GroupsModel>> Update(int id, [FromBody] GroupsModel group)
    //{
    //    if (group == null)
    //    {
    //        return BadRequest("Group payload must be provided.");
    //    }

    //    if (!ModelState.IsValid)
    //    {
    //        return ValidationProblem(ModelState);
    //    }

    //    try
    //    {
    //        var updatedGroup = await _groupsService.Put(id, group).ConfigureAwait(false);
    //        return Ok(updatedGroup);
    //    }
    //    catch (InvalidOperationException)
    //    {
    //        return NotFound();
    //    }
    //    catch (ArgumentException ex)
    //    {
    //        return BadRequest(ex.Message);
    //    }
    //}

    //[HttpDelete("{id:int}")]
    //public async Task<IActionResult> Delete(int id)
    //{
    //    try
    //    {
    //        await _groupsService.Delete(id).ConfigureAwait(false);
    //        return NoContent();
    //    }
    //    catch (InvalidOperationException)
    //    {
    //        return NotFound();
    //    }
    //}
}