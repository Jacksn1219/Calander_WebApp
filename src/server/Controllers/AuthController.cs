using System.Security.Claims;
using System.Security.Cryptography;
using System.Text;
using Microsoft.AspNetCore.Authentication;
using Microsoft.AspNetCore.Authentication.Cookies;
using Microsoft.AspNetCore.Mvc;
using Calender_WebApp.Models;

namespace Calender_WebApp.Controllers
{
    [ApiController]
    [Route("auth")]
    public class AuthController : ControllerBase
    {
        private readonly AppDbContext _context;

        public AuthController(AppDbContext context)
        {
            _context = context;
        }

        // ✅ REGISTER ENDPOINT
        [HttpPost("register")]
        public IActionResult Register([FromBody] RegisterRequest request)
        {
            if (string.IsNullOrWhiteSpace(request.Email) ||
                string.IsNullOrWhiteSpace(request.Password) ||
                string.IsNullOrWhiteSpace(request.Name))
            {
                return BadRequest(new { message = "All fields are required." });
            }

            if (_context.Employees.Any(u => u.Email == request.Email))
            {
                return Conflict(new { message = "Email already exists." });
            }

            var hashedPassword = HashPassword(request.Password);

            // Create new employee
            var newUser = new EmployeesModel
            {
                Name = request.Name,
                Email = request.Email,
                Password = hashedPassword,
                Role = Enum.TryParse<UserRole>(request.Role, true, out var parsedRole) ? parsedRole : UserRole.User
            };

            _context.Employees.Add(newUser);
            _context.SaveChanges();

            return Ok(new
            {
                message = "Registration successful",
                user = new
                {
                    newUser.Id,
                    newUser.Name,
                    newUser.Email,
                    Role = newUser.Role.ToString()
                }
            });
        }

        // ✅ LOGIN ENDPOINT
        [HttpPost("login")]
        public async Task<IActionResult> Login([FromBody] LoginRequest request)
        {
            if (string.IsNullOrWhiteSpace(request.Email) || string.IsNullOrWhiteSpace(request.Password))
                return BadRequest(new { message = "Email and password are required." });

            var user = _context.Employees.FirstOrDefault(u => u.Email == request.Email);
            if (user == null || !VerifyPassword(request.Password, user.Password))
                return Unauthorized(new { message = "Invalid email or password." });

            var claims = new List<Claim>
            {
                new Claim(ClaimTypes.NameIdentifier, user.Id?.ToString() ?? string.Empty),
                new Claim(ClaimTypes.Name, user.Name),
                new Claim(ClaimTypes.Email, user.Email),
                new Claim(ClaimTypes.Role, user.Role.ToString())
            };

            var identity = new ClaimsIdentity(claims, CookieAuthenticationDefaults.AuthenticationScheme);
            var principal = new ClaimsPrincipal(identity);

            await HttpContext.SignInAsync(CookieAuthenticationDefaults.AuthenticationScheme, principal);

            return Ok(new
            {
                message = "Login successful",
                user = new
                {
                    user.Id,
                    user.Name,
                    user.Email,
                    Role = user.Role.ToString()
                }
            });
        }

        // ✅ LOGOUT ENDPOINT
        [HttpPost("logout")]
        public async Task<IActionResult> Logout()
        {
            await HttpContext.SignOutAsync(CookieAuthenticationDefaults.AuthenticationScheme);
            return Ok(new { message = "Logged out successfully" });
        }

        // 🧩 Password Hashing & Verification
        private static string HashPassword(string plainText)
        {
            using var sha = SHA256.Create();
            var bytes = sha.ComputeHash(Encoding.UTF8.GetBytes(plainText));
            return BitConverter.ToString(bytes).Replace("-", "").ToLower();
        }

        private static bool VerifyPassword(string plainText, string storedHash)
        {
            using var sha = SHA256.Create();
            var bytes = sha.ComputeHash(Encoding.UTF8.GetBytes(plainText));
            var hash = BitConverter.ToString(bytes).Replace("-", "").ToLower();
            return hash == storedHash.ToLower();
        }
    }

    // ✅ Request DTOs
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
        public string Role { get; set; } = "User"; // optional, defaults to User
    }
}
