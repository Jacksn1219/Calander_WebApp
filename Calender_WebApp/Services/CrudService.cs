using Calender_WebApp.Models.Interfaces;
using Calender_WebApp.Services.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace Calender_WebApp.Services;

/// <summary>
/// Generic CRUD service providing basic Create, Read, Update, Delete operations for entities.
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
    /// Deletes an entity by its ID after checking for existence.
    /// </summary>
    public virtual async Task<TEntity?> Delete(int id)
    {
        var item = await _dbSet.FindAsync(id).ConfigureAwait(false);
        if (item == null) return null;

        _dbSet.Remove(item);
        await _context.SaveChangesAsync().ConfigureAwait(false);
        return item;
    }

    /// <summary>
    /// Gets all entities of type TEntity.
    /// </summary>
    public virtual async Task<TEntity[]?> Get()
    {
        return await _dbSet.AsNoTracking().ToArrayAsync().ConfigureAwait(false);
    }

    /// <summary>
    /// Gets an entity by its ID.
    /// </summary>
    public virtual async Task<TEntity?> GetById(int id)
    {
        return await _dbSet.FindAsync(id).ConfigureAwait(false);
    }

    /// <summary>
    /// Creates a new entity in the database.
    /// </summary>
    public virtual async Task<TEntity> Post(TEntity model)
    {
        if (model == null) throw new ArgumentNullException(nameof(model));
        model.Id = default; // Set to 0 for int, null for nullable types
        var entry = await _dbSet.AddAsync(model).ConfigureAwait(false);
        await _context.SaveChangesAsync().ConfigureAwait(false);
        return entry.Entity;
    }

    /// <summary>
    /// Updates an existing entity in the database.
    /// </summary>
    public virtual async Task<TEntity?> Put(int id, TEntity newTEntity)
    {
        if (newTEntity == null) throw new ArgumentNullException(nameof(newTEntity));
        var dbTEntity = await _dbSet.FindAsync(id).ConfigureAwait(false);
        if (dbTEntity == null) return null;

        newTEntity.Id = dbTEntity.Id; // Ensure the ID is not changed
        _context.Entry(dbTEntity).CurrentValues.SetValues(newTEntity);
        await _context.SaveChangesAsync().ConfigureAwait(false);
        return dbTEntity;
    }

    /// <summary>
    /// Partially updates an entity in the database.
    /// </summary>
    public virtual async Task<TEntity?> Patch(int id, TEntity newTEntity)
    {
        if (newTEntity == null) throw new ArgumentNullException(nameof(newTEntity));
        var dbTEntity = await _dbSet.FindAsync(id).ConfigureAwait(false);
        if (dbTEntity == null) return null;

        foreach (var property in typeof(TEntity).GetProperties())
        {
            if (property.Name == nameof(IDbItem.Id)) continue; // Don't update Id
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
