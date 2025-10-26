using Calender_WebApp.Utils;
using Calender_WebApp.Models.Interfaces;
using Calender_WebApp.Services.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace Calender_WebApp.Services;

/// <summary>
/// Generic CRUD service providing basic Create, Read, Update, Delete operations for IDbItem entities.
/// </summary>
/// <typeparam name="TEntity">The type of the Model entity.</typeparam>
public abstract class CrudService<TEntity> : ICrudService<TEntity> where TEntity : class, IDbItem
{
    /// <summary>
    /// The DbContext used for database operations.
    /// </summary>
    protected readonly DbContext _context;

    /// <summary>
    /// The DbSet representing the collection of TEntity in the database.
    /// </summary>
    protected readonly DbSet<TEntity> _dbSet;

    public CrudService(DbContext context)
    {
        _context = context ?? throw new ArgumentNullException(nameof(context));
        _dbSet = _context.Set<TEntity>();
    }

    /// <summary>
    /// Deletes an entity by its ID.
    /// </summary>
    /// <param name="id"></param>
    /// <returns>The deleted entity.</returns>
    /// <exception cref="InvalidOperationException">Thrown when the entity is not found.</exception>
    public virtual async Task<TEntity> Delete(int id)
    {
        var item = await _dbSet.FindAsync(id).ConfigureAwait(false);
        if (item == null) throw new InvalidOperationException("Entity not found.");

        _dbSet.Remove(item);
        await _context.SaveChangesAsync().ConfigureAwait(false);
        return item;
    }

    /// <summary>
    /// Gets all entities of type TEntity.
    /// </summary>
    /// <returns>List of TEntity</returns>
    public virtual async Task<TEntity[]> Get()
    {
        return await _dbSet.AsNoTracking().ToArrayAsync().ConfigureAwait(false);
    }

    /// <summary>
    /// Gets an entity by its ID.
    /// </summary>
    /// <param name="id"></param>
    /// <returns>The entity with the specified ID.</returns>
    /// <exception cref="InvalidOperationException">Thrown when the entity is not found.</exception
    public virtual async Task<TEntity> GetById(int id)
    {
        var entity = await _dbSet.FindAsync(id).ConfigureAwait(false);
        return entity ?? throw new InvalidOperationException("Entity not found.");
    }

    /// <summary>
    /// Creates a new entity in the database.
    /// </summary>
    /// <param name="model"></param>
    /// <returns>The created entity.</returns>
    /// <exception cref="ArgumentNullException">Thrown when the model is null.</exception>
    /// <exception cref="ArgumentException">Thrown when the model validation fails.</exception>
    /// <exception cref="InvalidOperationException">Thrown when the entity creation fails.</exception>
    public virtual async Task<TEntity> Post(TEntity model)
    {
        if (model == null) throw new ArgumentNullException(nameof(model));

        var validators = ModelWhitelistUtil.GetValidatorsForModel(typeof(TEntity).Name);

        // Validate model using whitelist util (ignore properties without validators)
        var inputDict = typeof(TEntity)
            .GetProperties()
            .Where(p => p.Name != nameof(IDbItem.Id))
            .Where(p => validators == null || validators.ContainsKey(p.Name))
            .ToDictionary(p => p.Name, p => p.GetValue(model) ?? (object)string.Empty);

        if (!ModelWhitelistUtil.ValidateModelInput(typeof(TEntity).Name, inputDict, out var errors))
        {
            throw new ArgumentException($"Model validation failed: {string.Join(", ", errors)}");
        }

        // Set to 0 for int, null for nullable types
        model.Id = default;

        var entry = await _dbSet.AddAsync(model).ConfigureAwait(false);
        await _context.SaveChangesAsync().ConfigureAwait(false);
        return entry.Entity;
    }

    /// <summary>
    /// Updates an existing entity in the database.
    /// </summary>
    /// <param name="id"></param>
    /// <param name="newTEntity"></param>
    /// <returns>The updated entity.</returns>
    /// <exception cref="ArgumentNullException">Thrown when the new entity is null.</exception>
    /// <exception cref="InvalidOperationException">Thrown when the entity is not found.</exception>
    /// <exception cref="ArgumentException">Thrown when the model validation fails.</exception>
    public virtual async Task<TEntity> Put(int id, TEntity newTEntity)
    {
        if (newTEntity == null) throw new ArgumentNullException(nameof(newTEntity));
        var dbTEntity = await _dbSet.FindAsync(id).ConfigureAwait(false);
        if (dbTEntity == null) throw new InvalidOperationException("Entity not found.");

        var validators = ModelWhitelistUtil.GetValidatorsForModel(typeof(TEntity).Name);

        // Validate model using whitelist util (ignore properties without validators)
        var inputDict = typeof(TEntity)
            .GetProperties()
            .Where(p => p.Name != nameof(IDbItem.Id))
            .Where(p => validators == null || validators.ContainsKey(p.Name))
            .ToDictionary(p => p.Name, p => p.GetValue(newTEntity) ?? (object)string.Empty);

        if (!ModelWhitelistUtil.ValidateModelInput(typeof(TEntity).Name, inputDict, out var errors)) {
            throw new ArgumentException($"Model validation failed: {string.Join(", ", errors)}");
        }

        newTEntity.Id = dbTEntity.Id; // Ensure the ID is not changed
        _context.Entry(dbTEntity).CurrentValues.SetValues(newTEntity);
        await _context.SaveChangesAsync().ConfigureAwait(false);
        return dbTEntity;
    }

    /// <summary>
    /// Partially updates an entity in the database.
    /// </summary>
    /// <param name="id"></param>
    /// <param name="newTEntity"></param>
    /// <returns>The updated entity.</returns>
    /// <exception cref="ArgumentNullException">Thrown when the new entity is null.</exception
    public virtual async Task<TEntity> Patch(int id, TEntity newTEntity)
    {
        if (newTEntity == null) throw new ArgumentNullException(nameof(newTEntity));
        var dbTEntity = await _dbSet.FindAsync(id).ConfigureAwait(false);
        if (dbTEntity == null) throw new InvalidOperationException("Entity not found.");

        var validators = ModelWhitelistUtil.GetValidatorsForModel(typeof(TEntity).Name);

        foreach (var property in typeof(TEntity).GetProperties())
        {
            if (property.Name == nameof(IDbItem.Id)) continue; // Don't update Id
            if (validators != null && !validators.ContainsKey(property.Name)) continue; // Skip non-whitelisted properties
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
