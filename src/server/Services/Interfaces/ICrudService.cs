using Calender_WebApp.Models;

namespace Calender_WebApp.Services.Interfaces;

public interface ICrudService<TEntity> where TEntity : class
{
    public Task<TEntity> Delete(int id);
    public Task<TEntity> GetById(int id);
    public Task<TEntity[]> Get();
    public Task<TEntity> Put(int id, TEntity model);
    public Task<TEntity> Post(TEntity model);
    public Task<TEntity> Patch(int id, TEntity model);
}
