using Calender_WebApp.Models;
using Calender_WebApp.Models.Interfaces;
using Calender_WebApp.Services.Interfaces;
using Calender_WebApp.Utils;
using Microsoft.EntityFrameworkCore;

namespace Calender_WebApp.Services;

/// <summary>
/// Service for managing reminders, including CRUD and custom operations.
/// </summary>
public class ReminderPreferencesService : CrudService<ReminderPreferencesModel>, IReminderPreferencesService
{
    public ReminderPreferencesService(AppDbContext ctx) : base(ctx) { }

    /// <summary>
    /// Creates a new reminder preference. Overridden to preserve the manually set Id.
    /// </summary>
    public override async Task<ReminderPreferencesModel> Post(ReminderPreferencesModel model)
    {
        if (model == null) throw new ArgumentNullException(nameof(model));
        
        var validators = ModelWhitelistUtil.GetValidatorsForModel(typeof(ReminderPreferencesModel).Name);

        // Validate model using whitelist util (ignore properties without validators)
        var inputDict = typeof(ReminderPreferencesModel)
            .GetProperties()
            .Where(p => p.Name != nameof(IDbItem.Id))
            .Where(p => validators == null || validators.ContainsKey(p.Name))
            .ToDictionary(p => p.Name, p => p.GetValue(model) ?? (object)string.Empty);
        
        if (!ModelWhitelistUtil.ValidateModelInput(typeof(ReminderPreferencesModel).Name, inputDict, out var errors))
        {
            throw new ArgumentException($"Model validation failed: {string.Join(", ", errors)}");
        }

        if (!model.Id.HasValue)
            throw new ArgumentException("Id must be set for ReminderPreferencesModel");

        var entry = await _dbSet.AddAsync(model).ConfigureAwait(false);
        await _context.SaveChangesAsync().ConfigureAwait(false);
        return entry.Entity;
    }

    /// <summary>
    /// Retrieves all reminder preferences for a specific user.
    /// </summary>
    /// <param name="userId"> The ID of the user whose reminder preferences are to be retrieved. </param>
    /// <returns> An array of ReminderPreferencesModel objects for the specified user. </returns>
    public Task<ReminderPreferencesModel[]> GetByUserId(int userId)
    {
        return _dbSet
            .Where(rp => rp.Id == userId)
            .ToArrayAsync();
    }

    /// <summary>
    /// Toggles the event reminder preference for a specific user.
    /// </summary>
    /// <param name="userId"> The ID of the user whose event reminder preference is to be toggled. </param>
    /// <returns> The updated event reminder preference. </returns>
    public async Task<bool> ToggleEventReminders(int userId)
    {
        var preference = await _dbSet
            .FirstOrDefaultAsync(rp => rp.Id == userId);

        if (preference == null)
            return false;

        preference.EventReminder = !preference.EventReminder;

        await _context.SaveChangesAsync();
        return preference.EventReminder;
    }

    /// <summary>
    /// Toggles the booking reminder preference for a specific user.
    /// </summary>
    /// <param name="userId"> The ID of the user whose booking reminder preference is to be toggled. </param>
    /// <returns> The updated booking reminder preference. </returns>
    public async Task<bool> ToggleBookingReminders(int userId)
    {
        var preference = await _dbSet
            .FirstOrDefaultAsync(rp => rp.Id == userId);

        if (preference == null)
            return false;

        preference.BookingReminder = !preference.BookingReminder;

        await _context.SaveChangesAsync();
        return preference.BookingReminder;
    }

    // Add additional services that are not related to CRUD here
}
