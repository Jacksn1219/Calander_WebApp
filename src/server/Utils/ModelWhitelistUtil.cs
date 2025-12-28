using System;
using System.Collections.Generic;
using Calender_WebApp.Models;

namespace Calender_WebApp.Utils;

public static class ModelWhitelistUtil
{
    // Validators for OfficeAttendanceModel
    public static readonly Dictionary<string, Func<object, bool>> OfficeAttendanceModelValidators = new()
    {
        { "UserId", v => v is int && (int)v > 0 },
        { "Date", v => v is DateTime  dt && dt.Year >= 2000 },
        { "Status", v => Enum.IsDefined(typeof(AttendanceStatus), v) }
    };

    // Validators for GroupMembershipsModel
    public static readonly Dictionary<string, Func<object, bool>> GroupMembershipsModelValidators = new()
    {
        { "UserId", v => v is int && (int)v > 0 },
        { "GroupId", v => v is int && (int)v > 0 }
    };

    // Validators for GroupsModel
    public static readonly Dictionary<string, Func<object, bool>> GroupsModelValidators = new()
    {
        { "GroupName", v => v is string s && !string.IsNullOrWhiteSpace(s) },
        { "Description", v => v == null || v is string }
    };

    // Validators for EventParticipationModel
    public static readonly Dictionary<string, Func<object, bool>> EventParticipationModelValidators = new()
    {
        { "EventId", v => v is int && (int)v > 0 },
        { "UserId", v => v is int && (int)v > 0 },
        { "Status", v => Enum.IsDefined(typeof(ParticipationStatus), v) }
    };

    // Validators for AdminsModel
    public static readonly Dictionary<string, Func<object, bool>> AdminsModelValidators = new()
    {
        { "UserId", v => v is int && (int)v > 0 },
        { "Permissions", v => Enum.IsDefined(typeof(AdminPermission), v) }
        // Employee is navigation, skip for input
    };

    // Validators for EmployeesModel
    public static readonly Dictionary<string, Func<object, bool>> EmployeesModelValidators = new()
    {
        { "Name", v => v is string s && !string.IsNullOrWhiteSpace(s) },
        { "Email", v => v is string s && s.Contains("@") },
        { "Role", v => Enum.IsDefined(typeof(UserRole), v) },
        { "Password", v => v is string s && s.Length >= 6 }
    };

    // Validators for EventsModel
    public static readonly Dictionary<string, Func<object, bool>> EventsModelValidators = new()
    {
        { "Title", v => v is string s && !string.IsNullOrWhiteSpace(s) },
        { "Description", v => v == null || v is string },
        { "EventDate", v => v is DateTime  dt && dt.Year >= 2000 },
        { "EndTime", v => v is DateTime dt && dt.Year >= 2000 },
        { "Location", v => v == null || v is string },
        { "BookingId", v => v == null || (v is int i && i > 0) },
        { "CreatedBy", v => v is int && (int)v > 0 },
        { "DurationMinutes", v => v is int i && i > 0 }
    };

    // Validators for RoomBookingsModel
    public static readonly Dictionary<string, Func<object, bool>> RoomBookingsModelValidators = new()
    {
        { "RoomId", v => v is int i && i > 0 },
        { "UserId", v => v is int i && i > 0 },
        { "BookingDate", v => v is DateTime dt && dt.Year >= 2000 },
        { "StartTime", v => v is TimeSpan ts && ts > TimeSpan.Zero },
        { "EndTime", v => v is TimeSpan ts && ts > TimeSpan.Zero },
        { "EventId", v => v == null || (v is int i && i >= 0) },
        { "Purpose", v => v is string s && !string.IsNullOrWhiteSpace(s) }
    };

    // Validators for RoomsModel
    public static readonly Dictionary<string, Func<object, bool>> RoomsModelValidators = new()
    {
        { "RoomName", v => v is string s && !string.IsNullOrWhiteSpace(s) },
        { "Capacity", v => v is int && (int)v > 0 },
        { "Location", v => v is string s && !string.IsNullOrWhiteSpace(s) }
    };

    // Validators for RemindersModel
    public static readonly Dictionary<string, Func<object, bool>> RemindersModelValidators = new()
    {
        { "UserId", v => v is int && (int)v > 0 },
        { "ReminderType", v => Enum.IsDefined(typeof(reminderType), v) },
        { "RelatedRoomId", v => v is int && (int)v >= 0 },
        { "RelatedEventId", v => v is int && (int)v >= 0 },
        { "ReminderTime", v => v is DateTime dt && dt.Year >= 2000 },
        { "IsSent", v => v is bool },
        { "Title", v => v is string s && !string.IsNullOrWhiteSpace(s) }
    };

    // Validators for ReminderPreferencesModel
    public static readonly Dictionary<string, Func<object, bool>> ReminderPreferencesModelValidators = new()
    {
        { "UserId", v => v is int && (int)v > 0 },
        { "PreferenceType", v => v is string s && !string.IsNullOrWhiteSpace(s) },
        { "TimeBeforeEvent", v => v is TimeSpan ts && ts >= TimeSpan.Zero },
        { "IsEnabled", v => v is bool }
    };

    // Add similar validators for other models as needed

    // Generic: get validator dictionary by model name
    public static Dictionary<string, Func<object, bool>>? GetValidatorsForModel(string modelName)
    {
        return modelName switch
        {
            nameof(AdminsModel) => AdminsModelValidators,
            nameof(EmployeesModel) => EmployeesModelValidators,
            nameof(EventsModel) => EventsModelValidators,
            nameof(RoomBookingsModel) => RoomBookingsModelValidators,
            nameof(RoomsModel) => RoomsModelValidators,
            nameof(OfficeAttendanceModel) => OfficeAttendanceModelValidators,
            nameof(GroupMembershipsModel) => GroupMembershipsModelValidators,
            nameof(GroupsModel) => GroupsModelValidators,
            nameof(EventParticipationModel) => EventParticipationModelValidators,
            nameof(RemindersModel) => RemindersModelValidators,
            nameof(ReminderPreferencesModel) => ReminderPreferencesModelValidators,
            _ => null
        };
    }
    
    /// <summary>
    /// Validates input for a model, return bool and errors (does not create object)
    /// </summary>
    /// <param name="modelName"></param>
    /// <param name="input"></param>
    /// <returns>True if input is valid, false otherwise with errors populated</returns>
    /// <exception cref="ArgumentNullException">Thrown when the input dictionary is null.</exception>
    /// <exception cref="InvalidOperationException">Thrown when the model creation fails.</exception>
    public static bool ValidateModelInput(string modelName, IDictionary<string, object> input, out List<string> errors)
    {
        errors = new List<string>();
        var validators = GetValidatorsForModel(modelName);
        if (validators == null)
        {
            errors.Add($"No validators defined for model {modelName}.");
            return false;
        }
        foreach (var kvp in input)
        {
            if (!validators.TryGetValue(kvp.Key, out var validator))
            {
                errors.Add($"Property '{kvp.Key}' is not allowed for model {modelName}.");
                continue;
            }
            if (!validator(kvp.Value))
            {
                errors.Add($"Property '{kvp.Key}' has invalid value or format.");
            }
        }
        return errors.Count == 0;
    }

    /// <summary>
    /// Validates input for a model and creates the model if valid.
    /// </summary>
    /// <typeparam name="TEntity"></typeparam>
    /// <param name="input"></param>
    /// <returns>The created model if valid, null otherwise with errors populated</returns>
    /// <exception cref="ArgumentNullException">Thrown when the input dictionary is null.</exception>
    /// <exception cref="InvalidOperationException">Thrown when the model creation fails.</exception>
    public static TEntity? CreateValidatedModel<TEntity>(IDictionary<string, object> input, out List<string> errors) where TEntity : new()
    {
        errors = new List<string>();
        var modelName = typeof(TEntity).Name;
        var validators = GetValidatorsForModel(modelName);
        if (validators == null)
        {
            errors.Add($"No validators defined for model {modelName}.");
            return default;
        }

        var entity = new TEntity();
        var type = typeof(TEntity);
        foreach (var kvp in input)
        {
            if (!validators.TryGetValue(kvp.Key, out var validator))
            {
                errors.Add($"Property '{kvp.Key}' is not allowed for model {modelName}.");
                continue;
            }
            if (!validator(kvp.Value))
            {
                errors.Add($"Property '{kvp.Key}' has invalid value or format.");
                continue;
            }
            var prop = type.GetProperty(kvp.Key);
            if (prop != null && prop.CanWrite)
            {
                try
                {
                    prop.SetValue(entity, kvp.Value);
                }
                catch
                {
                    errors.Add($"Failed to set property '{kvp.Key}'.");
                }
            }
        }
        return errors.Count == 0 ? entity : default;
    }
}
