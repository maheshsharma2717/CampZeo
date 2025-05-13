using MC.Basic.Application.Contracts.Persistance;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;


namespace MC.Basic.Persistance.Repositories {
    public class BaseRepository<T> : IAsyncRepository<T> where T : class {
        protected readonly BasicDbContext _dbContext;

        public BaseRepository(BasicDbContext dbContext) {
           _dbContext = dbContext;
        }

        public virtual async Task<T> GetAsyncById(int Id) 
        {
            return await _dbContext.Set<T>().FindAsync(Id);
        }

        public  async Task<IReadOnlyList<T>> ListAllAsync() 
        {
            return await _dbContext.Set<T>().ToListAsync();
        }

        public async Task<T> AddAsync(T entity) 
        { 
             
            await _dbContext.Set<T>().AddAsync(entity);
            await _dbContext.SaveChangesAsync();

            return entity;
        }

        public async Task UpdateAsync(T entity) 
        {
            _dbContext.Entry(entity).State = EntityState.Modified;
            await _dbContext.SaveChangesAsync();
        }

        public async Task DeleteAsync(int Id) 
        {
           var entityToDelete = await _dbContext.Set<T>().FindAsync(Id);
            _dbContext.Set<T>().Remove(entityToDelete);
            await _dbContext.SaveChangesAsync();
        }
    }
    
}
