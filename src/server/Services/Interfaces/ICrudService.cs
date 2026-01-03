using Calender_WebApp.Models;

namespace Calender_WebApp.Services.Interfaces;

/// <summary>
/// Generic contract defining standard CRUD operations for all entity types.
/// Provides base operations inherited by domain-specific service interfaces.
/// 
/// Key Operations:
/// - Full CRUD lifecycle (Create, Read, Update, Delete)
/// - Partial updates via Patch
/// - Batch retrieval via Get
/// 
/// Note: Some services override or disable specific operations based on business rules.
/// </summary>
public interface ICrudService<TEntity> where TEntity : class
{
    public Task<TEntity> Delete(int id);
    public Task<TEntity> GetById(int id);
    public Task<TEntity[]> Get();
    public Task<TEntity> Put(int id, TEntity model);
    public Task<TEntity> Post(TEntity model);
    public Task<TEntity> Patch(int id, TEntity model);
}
