using Calender_WebApp.Utils;
using Calender_WebApp.Models.Interfaces;
using Calender_WebApp.Services.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace Calender_WebApp.Services;

/// <summary>
/// Generic base service providing standard CRUD operations with validation for all entity types.
/// 
/// Business Logic:
/// - Validates all inputs using ModelWhitelistUtil before database operations
/// - Automatically resets entity IDs on creation to prevent conflicts
/// - Uses AsNoTracking for read operations to improve performance
/// - Supports partial updates via Patch with null value preservation
/// 
/// Dependencies:
/// - ModelWhitelistUtil for input validation
/// - DbContext for database operations
/// </summary>
public abstract class CrudService<TEntity> : ICrudService<TEntity> where TEntity : class, IDbItem
{
    protected readonly DbContext _context;
    protected readonly DbSet<TEntity> _dbSet;

    public CrudService(DbContext context)
    {
        _context = context ?? throw new ArgumentNullException(nameof(context));
        _dbSet = _context.Set<TEntity>();
    }

    public virtual async Task<TEntity> Delete(int id)
    {
        var item = await _dbSet.FindAsync(id).ConfigureAwait(false);
        if (item == null) throw new InvalidOperationException("Entity not found.");

        _dbSet.Remove(item);
        await _context.SaveChangesAsync().ConfigureAwait(false);
        return item;
    }

    public virtual async Task<TEntity[]> Get()
    {
        return await _dbSet.AsNoTracking().ToArrayAsync().ConfigureAwait(false);
    }

    public virtual async Task<TEntity> GetById(int id)
    {
        var entity = await _dbSet.FindAsync(id).ConfigureAwait(false);
        return entity ?? throw new InvalidOperationException("Entity not found.");
    }

    public virtual async Task<TEntity> Post(TEntity model)
    {
        if (model == null) throw new ArgumentNullException(nameof(model));

        var validators = ModelWhitelistUtil.GetValidatorsForModel(typeof(TEntity).Name);

        var inputDict = typeof(TEntity)
            .GetProperties()
            .Where(p => p.Name != nameof(IDbItem.Id))
            .Where(p => validators == null || validators.ContainsKey(p.Name))
            .ToDictionary(p => p.Name, p => p.GetValue(model)!);

        if (!ModelWhitelistUtil.ValidateModelInput(typeof(TEntity).Name, inputDict, out var errors))
        {
            throw new ArgumentException($"Model validation failed: {string.Join(", ", errors)}");
        }

        model.Id = default;

        var entry = await _dbSet.AddAsync(model).ConfigureAwait(false);
        await _context.SaveChangesAsync().ConfigureAwait(false);
        return entry.Entity;
    }

    public virtual async Task<TEntity> Put(int id, TEntity newTEntity)
    {
        if (newTEntity == null) throw new ArgumentNullException(nameof(newTEntity));
        var dbTEntity = await _dbSet.FindAsync(id).ConfigureAwait(false);
        if (dbTEntity == null) throw new InvalidOperationException($"Entity with ID {id} not found.");

        var validators = ModelWhitelistUtil.GetValidatorsForModel(typeof(TEntity).Name);

        var inputDict = typeof(TEntity)
            .GetProperties()
            .Where(p => p.Name != nameof(IDbItem.Id))
            .Where(p => validators == null || validators.ContainsKey(p.Name))
            .ToDictionary(p => p.Name, p => p.GetValue(newTEntity)!);

        if (!ModelWhitelistUtil.ValidateModelInput(typeof(TEntity).Name, inputDict, out var errors)) {
            throw new ArgumentException($"Model validation failed: {string.Join(", ", errors)}");
        }

        newTEntity.Id = dbTEntity.Id; 
        _context.Entry(dbTEntity).CurrentValues.SetValues(newTEntity);
        await _context.SaveChangesAsync().ConfigureAwait(false);
        return dbTEntity;
    }

    /// <summary>
    /// Partially updates an entity, only modifying properties with non-null values.
    /// Preserves existing values for null properties in the input model.
    /// </summary>
    public virtual async Task<TEntity> Patch(int id, TEntity newTEntity)
    {
        if (newTEntity == null) throw new ArgumentNullException(nameof(newTEntity));
        var dbTEntity = await _dbSet.FindAsync(id).ConfigureAwait(false);
        if (dbTEntity == null) throw new InvalidOperationException("Entity not found.");
    
        var validators = ModelWhitelistUtil.GetValidatorsForModel(typeof(TEntity).Name);

        foreach (var property in typeof(TEntity).GetProperties())
        {
            if (property.Name == nameof(IDbItem.Id)) continue;
            if (validators != null && !validators.ContainsKey(property.Name)) continue; 
            var newValue = property.GetValue(newTEntity);
            if (newValue != null)
            {
                property.SetValue(dbTEntity, newValue);
            }
        }

        await _context.SaveChangesAsync().ConfigureAwait(false);
        return dbTEntity;
    }
}
