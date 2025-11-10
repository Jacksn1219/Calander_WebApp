using Calender_WebApp.Models;
using Calender_WebApp.Services.Interfaces;

namespace Calender_WebApp.Services;

/// <summary>
/// Service for managing reminders, including CRUD and custom operations.
/// </summary>
public class RemindersService : CrudService<RemindersModel>, IRemindersService
{
    public RemindersService(AppDbContext ctx) : base(ctx) { }

    // Add additional services that are not related to CRUD here
}
