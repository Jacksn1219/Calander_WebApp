using Calender_WebApp.Models;
using Calender_WebApp.Services.Interfaces;
using Microsoft.IdentityModel.Tokens;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;

namespace Calender_WebApp.Services
{
    /// <summary>
    /// Manages authentication operations including user validation and JWT token generation.
    /// 
    /// Business Logic:
    /// - Validates user credentials using BCrypt password verification
    /// - Generates JWT tokens with user claims for session management
    /// - Includes token validation for security verification
    /// 
    /// Dependencies:
    /// - IConfiguration for JWT settings (key, issuer, audience, expiration)
    /// - AppDbContext for employee data access
    /// </summary>
    public class AuthService : IAuthService
    {

        private readonly AppDbContext _db;
        private readonly IConfiguration _config;

        public AuthService(AppDbContext db, IConfiguration config)
        {
            _db = db;
            _config = config;
        }

        public EmployeesModel? ValidateUser(string email, string password)
        {
            var user = _db.Employees.FirstOrDefault(u => u.Email == email);
            if (user == null)
                return null;

            bool verified = BCrypt.Net.BCrypt.Verify(password, user.Password);
            return verified ? user : null;
        }

        public static string HashPassword(string password)
        {
            return BCrypt.Net.BCrypt.HashPassword(password);
        }

        public string GenerateToken(EmployeesModel user)
        {
            var claims = new[]
            {
                new Claim(ClaimTypes.NameIdentifier, user.Id.ToString()!),
                new Claim(ClaimTypes.Name, user.Name),
                new Claim(ClaimTypes.Email, user.Email),
                new Claim(ClaimTypes.Role, user.Role.ToString())
            };

            var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(_config["Jwt:Key"]!));
            var creds = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);

            var token = new JwtSecurityToken(
                issuer: _config["Jwt:Issuer"],
                audience: _config["Jwt:Audience"],
                claims: claims,
                expires: DateTime.Now.AddMinutes(Convert.ToDouble(_config["Jwt:ExpireMinutes"])),
                signingCredentials: creds);

            return new JwtSecurityTokenHandler().WriteToken(token);
        }

        public ClaimsPrincipal? ValidateToken(string token)
        {
            var tokenHandler = new JwtSecurityTokenHandler();
            var key = Encoding.UTF8.GetBytes(_config["Jwt:Key"]!);

            try
            {
                var principal = tokenHandler.ValidateToken(token, new TokenValidationParameters
                {
                    ValidateIssuer = true,
                    ValidIssuer = _config["Jwt:Issuer"],
                    ValidateAudience = true,
                    ValidAudience = _config["Jwt:Audience"],
                    ValidateLifetime = true,
                    IssuerSigningKey = new SymmetricSecurityKey(key),
                    ValidateIssuerSigningKey = true,
                    ClockSkew = TimeSpan.Zero
                }, out _);

                return principal;
            }
            catch
            {
                return null;
            }
        }

        /// <summary>
        /// Extracts current user information from Authorization header.
        /// </summary>
        public (string userId, string email, string role, string name)? GetCurrentUser(string authHeader)
        {
            if (string.IsNullOrEmpty(authHeader) || !authHeader.StartsWith("Bearer "))
                return null;

            var token = authHeader["Bearer ".Length..].Trim();
            var principal = ValidateToken(token);

            if (principal == null)
                return null;

            var userId = principal.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            var email = principal.FindFirst(ClaimTypes.Email)?.Value;
            var role = principal.FindFirst(ClaimTypes.Role)?.Value;
            var name = principal.FindFirst(ClaimTypes.Name)?.Value;

            if (userId == null || email == null || role == null || name == null)
                return null;

            return (userId, email, role, name);
        }
    }
}
