using System.Text.Json.Serialization;
using Calender_WebApp.Models;

namespace Calender_WebApp.Dtos;

/// <summary>
/// DTO for updating employee information.
/// Password is optional - if null or empty, existing password is not changed.
/// </summary>
public class EmployeesModelForUpdate
{
	public int User_id { get; set; } = 0;
	public string Name { get; set; } = string.Empty;
	public string Email { get; set; } = string.Empty;
	[JsonConverter(typeof(JsonStringEnumConverter))]
	public UserRole Role { get; set; } = UserRole.User;
	public string? Password { get; set; } = string.Empty;
}
