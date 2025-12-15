using Calender_WebApp.Models;
using Calender_WebApp.Services;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;
using Microsoft.EntityFrameworkCore;
using Calender_WebApp.Services.Interfaces;


namespace Calender_WebApp.Controllers
{
    [ApiController]
    [Route("api/auth")]
    public class LoginController : ControllerBase
    {
        private readonly AuthService _authService;

        public LoginController(AuthService authService)
        {
            _authService = authService;
        }

        // POST /api/auth/login
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

        [HttpPost("/api/employees/register")]
        public async Task<IActionResult> Register(
            [FromBody] RegisterRequest request,
            [FromServices] IEmployeesService employeesService)
        {
            if (string.IsNullOrWhiteSpace(request.Name) ||
                string.IsNullOrWhiteSpace(request.Email) ||
                string.IsNullOrWhiteSpace(request.Password))
            {
                return BadRequest("Name, email, and password are required.");
            }

            // Create employee entity
            var employee = new EmployeesModel
            {
                Name = request.Name,
                Email = request.Email,
                Password = request.Password, // hashed in service
                Role = request.Role
            };

            try
            {
                // Persist user (hash + unique email enforced here)
                var createdUser = await employeesService.Post(employee);

                // Auto-login: generate JWT
                var token = _authService.GenerateToken(createdUser);

                return Ok(new
                {
                    token,
                    user = new
                    {
                        userId = createdUser.Id,
                        name = createdUser.Name,
                        email = createdUser.Email,
                        role = createdUser.Role.ToString()
                    }
                });
            }
            catch (InvalidOperationException ex)
            {
                return Conflict(ex.Message);
            }
        }


        // GET /api/auth/me
        [HttpGet("me")]
        public IActionResult Me()
        {
            var authHeader = Request.Headers["Authorization"].ToString();

            if (string.IsNullOrEmpty(authHeader) || !authHeader.StartsWith("Bearer "))
                return Unauthorized();

            var token = authHeader["Bearer ".Length..].Trim();
            var principal = _authService.ValidateToken(token);

            if (principal == null)
                return Unauthorized();

            var userId = principal.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            var email = principal.FindFirst(ClaimTypes.Email)?.Value;
            var role = principal.FindFirst(ClaimTypes.Role)?.Value;

            return Ok(new
            {
                user = new
                {
                    userId,
                    email,
                    role
                }
            });
        }
    }

    public class LoginRequest
    {
        public string Email { get; set; } = string.Empty;
        public string Password { get; set; } = string.Empty;
    }

    public class RegisterRequest
    {
        public string Name { get; set; } = string.Empty;
        public string Email { get; set; } = string.Empty;
        public string Password { get; set; } = string.Empty;
        public UserRole Role { get; set; } = UserRole.User;
    }
}
