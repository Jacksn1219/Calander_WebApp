using System.Collections.Generic;
using Calender_WebApp.Models;
using Calender_WebApp.Services.Interfaces;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;


namespace Calender_WebApp.Controllers
{
    [ApiController]
    [Route("api/events")]
    [Authorize]
    public class EventsController : ControllerBase
    {
        private readonly IEventsService _eventService;
        private readonly IEventParticipationService _eventparticipationService;

        public EventsController(IEventsService eventService, IEventParticipationService eventparticipationService)
        {
            _eventService = eventService;
            _eventparticipationService = eventparticipationService;
        }

        // GET /api/events
        [HttpGet]
        public async Task<ActionResult<IEnumerable<EventsModel>>> GetAll()
        {
            var events = await _eventService.Get().ConfigureAwait(false);
            return Ok(events);
        }

        // GET /api/events/{id}
        [HttpGet("{id}")]
        public async Task<ActionResult<EventsModel>> GetEventByEventId(int id)
        {
            try{
                var ev = await _eventService.GetById(id).ConfigureAwait(false);
                return Ok(ev);
            }
            catch (KeyNotFoundException)
            {
                return NotFound();
            }
        }

        // GET /api/events/by-user/{userId}
        [HttpGet("by-user/{userId}")]
        public async Task<ActionResult<IEnumerable<EventsModel>>> GetEventsByUser(int userId)
        {
            var events = await _eventService.GetEventsByUserAsync(userId);
            return Ok(events);
        }

        // GET /api/events/upcoming?fromDate={date}
        [HttpGet("upcoming")]
        public async Task<ActionResult<IEnumerable<EventsModel>>> GetUpcomingEvents([FromQuery] DateTime fromDate)
        {
            var events = await _eventService.GetUpcomingEventsAsync(fromDate);
            return Ok(events);
        }

        // POST /api/events
        [HttpPost]

        public async Task<ActionResult<EventsModel>> CreateEvent([FromBody] EventsModel newEvent)
        {
            if (newEvent == null)
            {
            return BadRequest("Event payload must be provided.");
            }

            if (!ModelState.IsValid)
            {
            return ValidationProblem(ModelState);
            }

            try
            {
            var createdEvent = await _eventService.Post(newEvent).ConfigureAwait(false);
            return CreatedAtAction(nameof(GetEventByEventId), new { id = createdEvent.Id }, createdEvent);
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

        // PUT /api/events/{id}
        [HttpPut("{id}")]
        [Authorize(Roles = "Admin , SuperAdmin")]
        public async Task<IActionResult> UpdateEvent(int id, [FromBody] EventsModel updatedEvent)
        {
            if (updatedEvent == null)
            {
                return BadRequest("Event payload must be provided.");
            }

            if (!ModelState.IsValid)
            {
                return ValidationProblem(ModelState);
            }

            try
            {
                var ev = await _eventService.Put(id, updatedEvent).ConfigureAwait(false);
                return Ok(ev);
            }
            catch (KeyNotFoundException)
            {
                return NotFound();
            }
            catch (ArgumentException ex)
            {
                return BadRequest(ex.Message);
            }
        }

        // DELETE /api/events/{id}
        [HttpDelete("{id}")]
        [Authorize(Roles = "Admin , SuperAdmin")]
        public async Task<IActionResult> DeleteEvent(int id)
        {
           try
            {
                await _eventService.Delete(id).ConfigureAwait(false);
                return NoContent();
            }
            catch (KeyNotFoundException)
            {
                return NotFound();
            }
        }
    }
}