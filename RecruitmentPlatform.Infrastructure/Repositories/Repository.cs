using System.Linq.Expressions;
using Microsoft.EntityFrameworkCore;
using RecruitmentPlatform.Domain.Interfaces;
using RecruitmentPlatform.Infrastructure.Data;

namespace RecruitmentPlatform.Infrastructure.Repositories;

public class Repository<T> : IRepository<T> where T : class
{
    protected readonly ApplicationDbContext _db;
    protected readonly DbSet<T> _set;

    public Repository(ApplicationDbContext db)
    {
        _db  = db;
        _set = db.Set<T>();
    }

    public async Task<T?> GetByIdAsync(Guid id) =>
        await _set.FindAsync(id);

    public async Task<IEnumerable<T>> GetAllAsync() =>
        await _set.ToListAsync();

    public async Task<IEnumerable<T>> FindAsync(Expression<Func<T, bool>> predicate) =>
        await _set.Where(predicate).ToListAsync();

    public async Task AddAsync(T entity) =>
        await _set.AddAsync(entity);

    public void Update(T entity) =>
        _set.Update(entity);

    public void Delete(T entity) =>
        _set.Remove(entity);
}
