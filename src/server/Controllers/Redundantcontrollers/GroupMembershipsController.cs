// ====================================================================
// GroupMembershipsController became obsolete and is no longer in use.
// ====================================================================
// using System;
// using System.Collections.Generic;
// using Calender_WebApp.Models;
// using Calender_WebApp.Services.Interfaces;
// using Microsoft.AspNetCore.Mvc;
// namespace Calender_WebApp.Controllers;
// [ApiController]
// [Route("api/GroupsMemberships")]
// public class GroupMembershipsController : ControllerBase
// {
//     private readonly IGroupMembershipsService _groupMembershipsService;

//     public GroupMembershipsController(IGroupMembershipsService groupMembershipsService)
//     {
//         _groupMembershipsService = groupMembershipsService ?? throw new ArgumentNullException(nameof(groupMembershipsService));
//     }

//     [HttpGet]
//     public async Task<ActionResult<IEnumerable<GroupMembershipsModel>>> GetAll()
//     {
//        var memberships = await _groupMembershipsService.Get().ConfigureAwait(false);
//        return Ok(memberships);
//     }

//     [HttpGet("group/{groupId:int}")]
//     public async Task<ActionResult<IEnumerable<GroupMembershipsModel>>> GetByGroupId(int groupId)
//     {
//        var memberships = await _groupMembershipsService.GetMembershipsByGroupIdAsync(groupId).ConfigureAwait(false);
//        return Ok(memberships);
//     }

//     [HttpGet("user/{userId:int}")]
//     public async Task<ActionResult<IEnumerable<GroupMembershipsModel>>> GetByUserId(int userId)
//     {
//        var memberships = await _groupMembershipsService.GetMembershipsByUserIdAsync(userId).ConfigureAwait(false);
//        return Ok(memberships);
//     }

//     [HttpPost]
//     public async Task<ActionResult<GroupMembershipsModel>> Create([FromBody] GroupMembershipsModel membership)
//     {
//        if (membership == null)
//        {
//            return BadRequest("Membership payload must be provided.");
//        }

//        if (!ModelState.IsValid)
//        {
//            return ValidationProblem(ModelState);
//        }

//        try
//        {
//            var createdMembership = await _groupMembershipsService.Post(membership).ConfigureAwait(false);
//            return Ok(createdMembership);
//        }
//        catch (ArgumentException ex)
//        {
//            return BadRequest(ex.Message);
//        }
//        catch (InvalidOperationException ex)
//        {
//            return Conflict(ex.Message);
//        }
//     }

//     [HttpDelete]
//     public async Task<IActionResult> Delete([FromBody] GroupMembershipsModel membership)
//     {
//        if (membership == null)
//        {
//            return BadRequest("Membership payload must be provided.");
//        }

//        try
//        {
//            await _groupMembershipsService.Delete(membership).ConfigureAwait(false);
//            return NoContent();
//        }
//        catch (InvalidOperationException)
//        {
//            return NotFound();
//        }
//     }
// }
