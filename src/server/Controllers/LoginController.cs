using Calender_WebApp.Models;
using Calender_WebApp.Services;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;
using Microsoft.EntityFrameworkCore;
using Calender_WebApp.Services.Interfaces;


namespace Calender_WebApp.Controllers
{
    /// <summary>
    /// Handles authentication operations including login and current user retrieval.
    /// </summary>
    [ApiController]
    [Route("api/auth")]
    public class LoginController : ControllerBase
    {
        private readonly AuthService _authService;

        public LoginController(AuthService authService)
        {
            _authService = authService;
        }

        [HttpPost("login")]
        public IActionResult Login([FromBody] LoginRequest request)
        {
            if (string.IsNullOrWhiteSpace(request.Email) || 
                string.IsNullOrWhiteSpace(request.Password))
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

        /// <summary>
        /// Retrieves current authenticated user information from the Authorization header token.
        /// </summary>
        [HttpGet("me")]
        public IActionResult Me()
        {
            var authHeader = Request.Headers["Authorization"].ToString();
            var userInfo = _authService.GetCurrentUser(authHeader);

            if (userInfo == null)
                return Unauthorized();

            return Ok(new
            {
                user = new
                {
                    userId = userInfo.Value.userId,
                    email = userInfo.Value.email,
                    role = userInfo.Value.role,
                    name = userInfo.Value.name
                }
            });
        }
    }

    /// <summary>
    /// Request model for user authentication. Contains credentials for login validation.
    /// </summary>
    public class LoginRequest
    {
        public string Email { get; set; } = string.Empty;
        public string Password { get; set; } = string.Empty;
    }

    /// <summary>
    /// Request model for user registration. Defaults to User role if not specified.
    /// </summary>
    public class RegisterRequest
    {
        public string Name { get; set; } = string.Empty;
        public string Email { get; set; } = string.Empty;
        public string Password { get; set; } = string.Empty;
        public UserRole Role { get; set; } = UserRole.User;
    }
}
