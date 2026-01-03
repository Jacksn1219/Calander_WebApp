namespace Calender_WebApp.Models;

/// <summary>
/// View model for displaying error information to users.
/// Not a database entity - used for error page rendering in MVC.
/// ShowRequestId computed property shows the request ID only when it exists.
/// </summary>
public class ErrorViewModel
{
    public string? RequestId { get; set; }

    public bool ShowRequestId => !string.IsNullOrEmpty(RequestId);
}
