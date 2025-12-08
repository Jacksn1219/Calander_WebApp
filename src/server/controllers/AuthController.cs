using Calender_WebApp.Models;
using Calender_WebApp.Services;
using Microsoft.AspNetCore.Mvc;

namespace Calender_WebApp.Controllers
{
    [ApiController]
    [Route("api/auth")]
    public class AuthController : ControllerBase
    {
        private readonly AuthService _authService;

        public AuthController(AuthService authService)
        {
            _authService = authService;
        }

        [HttpPost("login")]
        public IActionResult Login([FromBody] LoginRequest request)
        {
            if (string.IsNullOrWhiteSpace(request.Email) || string.IsNullOrWhiteSpace(request.Password))
            {
                return BadRequest("Email and password are required.");
            }

            var user = _authService.ValidateUser(request.Email, request.Password);
            if (user == null)
                return Unauthorized("Invalid email or password");

            var token = _authService.GenerateToken(user);

            return Ok(new
            {
                token,
                user = new
                {
                    userId = user.Id,
                    name = user.Name,
                    email = user.Email,
                    role = user.Role.ToString()
                }
            });
        }
    }

    public class LoginRequest
    {
        public string Email { get; set; } = string.Empty;
        public string Password { get; set; } = string.Empty;
    }
}
