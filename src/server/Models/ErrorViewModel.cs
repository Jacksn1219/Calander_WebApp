namespace Calender_WebApp.Models;

/// <summary>
/// View model for displaying error pages with optional request tracking information.
/// Used by error handling middleware to provide diagnostic information.
/// 
/// Primary Key: None (not a database entity)
/// 
/// Foreign Keys: None (view model only)
/// </summary>
public class ErrorViewModel
{
    public string? RequestId { get; set; }

    public bool ShowRequestId => !string.IsNullOrEmpty(RequestId);
}
