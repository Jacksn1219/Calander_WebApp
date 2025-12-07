using Calender_WebApp.Models;
using Calender_WebApp.Services;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using System.Security.Claims;



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

        [HttpPost("register")]
        public async Task<IActionResult> Register([FromBody] RegisterRequest request)
        {
            if (string.IsNullOrWhiteSpace(request.Email) ||
                string.IsNullOrWhiteSpace(request.Password) ||
                string.IsNullOrWhiteSpace(request.Name))
            {
                return BadRequest("Alle velden zijn verplicht.");
            }

            try
            {
                var newUser = new EmployeesModel
                {
                    Name = request.Name,
                    Email = request.Email,
                    Password = request.Password,
                    Role = Enum.Parse<UserRole>(request.Role)
                };

                var savedUser = await _authService.RegisterUser(newUser);
                var token = _authService.GenerateToken(savedUser);

                return Ok(new
                {
                    token,
                    user = new
                    {
                        userId = savedUser.Id,
                        name = savedUser.Name,
                        email = savedUser.Email,
                        role = savedUser.Role.ToString()
                    }
                });
            }
            catch (Exception ex)
            {
                return BadRequest(ex.Message);
            }
        }

        [Authorize]
        [HttpGet("me")]
        public IActionResult GetCurrentUser()
        {
            var identity = HttpContext.User.Identity as ClaimsIdentity;

            if (identity == null || !identity.Claims.Any())
                return Unauthorized();

            var id = identity.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            var email = identity.FindFirst(ClaimTypes.Email)?.Value;
            var role = identity.FindFirst(ClaimTypes.Role)?.Value;

            return Ok(new
            {
                user = new
                {
                    userId = id,
                    email,
                    role
                }
            });
        }


        public class RegisterRequest
        {
            public string Name { get; set; } = string.Empty;
            public string Email { get; set; } = string.Empty;
            public string Password { get; set; } = string.Empty;
            public string Role { get; set; } = "User";
        }
    }

    public class LoginRequest
    {
        public string Email { get; set; } = string.Empty;
        public string Password { get; set; } = string.Empty;
    }
}
