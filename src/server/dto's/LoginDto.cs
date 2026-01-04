using Calender_WebApp.Models;

namespace Calender_WebApp.Dtos;

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
