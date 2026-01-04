using Calender_WebApp.Models;
using Calender_WebApp.Models.Interfaces;
using Calender_WebApp.Services.Interfaces;
using Calender_WebApp.Utils;
using Microsoft.EntityFrameworkCore;

namespace Calender_WebApp.Services;

/// <summary>
/// Manages user reminder preferences with manual ID management for one-to-one relationship.
/// 
/// Business Logic:
/// - Requires manual ID setting to match UserId (one-to-one with Employee)
/// - Toggles event and booking reminder preferences independently
/// - Controls advance notification timing via ReminderAdvanceMinutes
/// - Used by RemindersService to determine reminder behavior
/// 
/// Dependencies:
/// - ModelWhitelistUtil for input validation
/// </summary>
public class ReminderPreferencesService : CrudService<ReminderPreferencesModel>, IReminderPreferencesService
{
    public ReminderPreferencesService(AppDbContext ctx) : base(ctx) { }

    /// <summary>
    /// Overrides base Post to preserve manually set Id (must match UserId).
    /// </summary>
    public override async Task<ReminderPreferencesModel> Post(ReminderPreferencesModel model)
    {
        if (model == null) throw new ArgumentNullException(nameof(model));
        
        var validators = ModelWhitelistUtil.GetValidatorsForModel(typeof(ReminderPreferencesModel).Name);

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

    public Task<ReminderPreferencesModel[]> GetByUserId(int userId)
    {
        return _dbSet
            .Where(rp => rp.Id == userId)
            .ToArrayAsync();
    }

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

    public async Task<ReminderPreferencesModel> UpdateAdvanceMinutes(int userId, TimeSpan advanceMinutes)
    {
        var preference = await _dbSet
            .FirstOrDefaultAsync(rp => rp.Id == userId);

        if (preference == null)
            throw new InvalidOperationException("User preferences not found.");

        preference.ReminderAdvanceMinutes = advanceMinutes;

        await _context.SaveChangesAsync();
        return preference;
    }
}
