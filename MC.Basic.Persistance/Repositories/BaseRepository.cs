using MC.Basic.Application.Contracts.Persistance;
using MC.Basic.Application.Models.DataModel;
using MC.Basic.Domains.Common;
using Microsoft.EntityFrameworkCore;
using System.Linq.Expressions;
using System.Reflection;


namespace MC.Basic.Persistance.Repositories
{
    public class BaseRepository<T> : IAsyncRepository<T> where T : AuditableEntity
    {
        protected readonly BasicDbContext _dbContext;

        public BaseRepository(BasicDbContext dbContext)
        {
            _dbContext = dbContext;
        }

        public virtual async Task<T> GetAsyncById(long Id)
        {
            return await _dbContext.Set<T>().FindAsync(Id);
        }
        //public virtual async Task<T> GetAsync(Expression<Func<T, bool>> filter)
        //{
        //    return await _dbContext.Set<T>().FindAsync(filter);
        //}
        public virtual async Task<T> GetAsync(Expression<Func<T, bool>> filter)
        {
            return await _dbContext.Set<T>().FirstOrDefaultAsync(filter);
        }

        public async Task<IReadOnlyList<T>> ListAllAsync()
        {
            return await _dbContext.Set<T>().ToListAsync();
        }

        public async Task<T> AddAsync(T entity)
        {

            await _dbContext.Set<T>().AddAsync(entity);
            await _dbContext.SaveChangesAsync();

            return entity;
        }

        public async Task<T> UpdateAsync(T entity)
        {
            _dbContext.Entry(entity).State = EntityState.Modified;
            await _dbContext.SaveChangesAsync();
            return entity;
        }

        public async Task DeleteAsync(long Id)
        {
            var entityToDelete = await _dbContext.Set<T>().FindAsync(Id);
            _dbContext.Set<T>().Remove(entityToDelete);
            await _dbContext.SaveChangesAsync();
        }
        public async Task<List<T>> GetListWithIncludes(Expression<Func<T, object>> Includes)
        {
            return await _dbContext.Set<T>().Include(Includes).ToListAsync();
        }
        public async Task<T> GetRecordWithIncludes(Expression<Func<T, object>> Includes, Expression<Func<T, bool>> filter)
        {
            return await _dbContext.Set<T>().Include(Includes).SingleOrDefaultAsync(filter);
        }
        public async Task<List<T>> ToListWhereAsync(Expression<Func<T, bool>> filter)
        {
            try
            {
                return await _dbContext.Set<T>().Where(filter).ToListAsync();
            }
            catch(Exception ex)
            {
                throw;
            }
        }
        public async Task<ListResponse<List<T>>> GetPagedRecords(
            Expression<Func<T, bool>> filter,
            int pageSize = 10,
            int pageNumber = 1,
            string searchText = "",
            string sortBy = "",
            bool sortDesc = false)
        {
            try
            {
                IQueryable<T> query = _dbContext.Set<T>().Where(filter);

                // Filtering by searchText
                if(!string.IsNullOrWhiteSpace(searchText))
                {
                    var parameter = Expression.Parameter(typeof(T), "x");
                    var searchExpressions = new List<Expression>();

                    foreach(var prop in typeof(T).GetProperties().Where(p => p.PropertyType == typeof(string)))
                    {
                        var propertyAccess = Expression.Property(parameter, prop);
                        var nullCheck = Expression.NotEqual(propertyAccess, Expression.Constant(null, typeof(string)));

                        var toLowerCall = Expression.Call(propertyAccess, nameof(string.ToLower), null);
                        var containsCall = Expression.Call(toLowerCall,
                            nameof(string.Contains),
                            null,
                            Expression.Constant(searchText.ToLower()));

                        var fullExpression = Expression.AndAlso(nullCheck, containsCall);
                        searchExpressions.Add(fullExpression);
                    }

                    if(searchExpressions.Any())
                    {
                        var finalExpression = searchExpressions.Aggregate((acc, next) => Expression.OrElse(acc, next));
                        var lambda = Expression.Lambda<Func<T, bool>>(finalExpression, parameter);
                        query = query.Where(lambda);
                    }
                }

                // Sorting
                if(!string.IsNullOrWhiteSpace(sortBy))
                {
                    var property = typeof(T).GetProperty(sortBy, BindingFlags.IgnoreCase | BindingFlags.Public | BindingFlags.Instance);
                    if(property != null)
                    {
                        var parameter = Expression.Parameter(typeof(T), "x");
                        var propertyAccess = Expression.MakeMemberAccess(parameter, property);
                        var orderByExp = Expression.Lambda(propertyAccess, parameter);

                        string methodName = sortDesc ? "OrderByDescending" : "OrderBy";

                        var resultExp = Expression.Call(typeof(Queryable), methodName,
                            new Type[] { typeof(T), property.PropertyType },
                            query.Expression, Expression.Quote(orderByExp));

                        query = query.Provider.CreateQuery<T>(resultExp);
                    }
                }

                var count = await query.CountAsync();
                var records = await query
                    .Skip((pageNumber - 1) * pageSize)
                .Take(pageSize)
                    .ToListAsync();

                return new ListResponse<List<T>>(records, count);
            }
            catch(Exception ex)
            {
                throw;
            }
        }
        public IQueryable<T> GetQuariable()
        {
            return _dbContext.Set<T>();
        }
        public async Task<T> GetById(long id)
        {
            return await _dbContext.Set<T>().SingleOrDefaultAsync(x => x.Id == id);
        }
        public async Task<T> CreateAsync(T entity)
        {
            await _dbContext.AddAsync(entity);
            await _dbContext.SaveChangesAsync();
            return entity;
        }
    }

}
