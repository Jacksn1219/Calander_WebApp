using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Calender_WebApp.Controllers
{
    [ApiController]
    [Route("api/test")]
    public class TestController : ControllerBase
    {
        // 👇 Deze endpoint is beveiligd met JWT
        [HttpGet("secure")]
        [Authorize]
        public IActionResult SecureEndpoint()
        {
            return Ok("✅ Je bent geauthenticeerd! JWT werkt correct.");
        }

        // 👇 Deze endpoint is openbaar
        [HttpGet("public")]
        public IActionResult PublicEndpoint()
        {
            return Ok("🌍 Dit is een openbare endpoint. Geen login nodig.");
        }
    }
}
