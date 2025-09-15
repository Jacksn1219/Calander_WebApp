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
    private readonly DbContext _context;

    /// <summary>
    /// The DbSet representing the collection of TEntity in the database.
    /// </summary>
    private readonly DbSet<TEntity> _dbSet;

    public CrudService(DbContext context)
    {
        _context = context;
        _dbSet = _context.Set<TEntity>();
    }

    /// <summary>
    /// Deletes an entity by its ID after checking for existence.
    /// </summary>
    /// <param name="id"></param>
    /// <returns></returns>
    public virtual async Task<TEntity?> Delete(int id)
    {
        var item = await GetById(id);
        if (item == null) return null;
        _dbSet.Remove(item);
        await _context.SaveChangesAsync();
        return item;
    }

    /// <summary>
    /// Gets all entities of type TEntity.
    /// </summary>
    /// <returns></returns>
    public virtual async Task<TEntity[]> Get()
    {
        return await _dbSet.ToArrayAsync();
    }

    /// <summary>
    /// Gets an entity by its ID.
    /// </summary>
    /// <param name="id"></param>
    /// <returns></returns>
    public virtual async Task<TEntity?> GetById(int id)
    {
        return await _dbSet.SingleOrDefaultAsync(x => x.Id == id);
    }

    /// <summary>
    /// Creates a new entity in the database.
    /// </summary>
    /// <param name="model"></param>
    /// <returns></returns>
    public virtual async Task<TEntity> Post(TEntity model)
    {
        model.Id = default; // Set to 0 for int, null for nullable types
        var entry = await _dbSet.AddAsync(model);
        await _context.SaveChangesAsync();
        return entry.Entity;
    }

    /// <summary>
    /// Updates an existing entity in the database.
    /// </summary>
    /// <param name="id"></param>
    /// <param name="newTEntity"></param>
    /// <returns></returns>
    public virtual async Task<TEntity?> Put(int id, TEntity newTEntity)
    {
        var dbTEntity = await GetById(id);
        if (dbTEntity == null) return null;

        newTEntity.Id = dbTEntity.Id; // Ensure the ID is not changed
        _context.Entry(dbTEntity).CurrentValues.SetValues(newTEntity);
        await _context.SaveChangesAsync();
        return dbTEntity;
    }
}
