namespace Base.Core.Contracts;

using System;
using System.Collections.Generic;
using System.Linq;
using System.Linq.Expressions;
using System.Threading.Tasks;

using Microsoft.EntityFrameworkCore.ChangeTracking;

public interface IGenericRepository<TEntity> where TEntity : class, IEntityObject
{
    Task<IList<TEntity>> GetNoTrackingAsync(Expression<Func<TEntity, bool>>? filter  = null,
        Func<IQueryable<TEntity>, IOrderedQueryable<TEntity>>?               orderBy = null,
        params string[]                                                      includeProperties);

    Task<IList<TEntity>> GetAsync(Expression<Func<TEntity, bool>>? filter  = null,
        Func<IQueryable<TEntity>, IOrderedQueryable<TEntity>>?     orderBy = null,
        params string[]                                            includeProperties);

    Task<TEntity?> GetByIdAsync(int id, params string[] includeProperties);

    Task<int> CountAsync(Expression<Func<TEntity, bool>>? filter = null);
    Task<bool> ExistsAsync(int id);

    void Remove(TEntity entity);

    EntityEntry<TEntity> Attach(TEntity entity);

    Task<EntityEntry<TEntity>> AddAsync(TEntity entity);

    Task AddRangeAsync(IEnumerable<TEntity> entities);
}