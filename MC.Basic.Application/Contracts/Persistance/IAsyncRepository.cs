using MC.Basic.Application.Models.DataModel;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Linq.Expressions;
using System.Text;
using System.Threading.Tasks;

namespace MC.Basic.Application.Contracts.Persistance {
    public interface IAsyncRepository<T> where T: class 
    {
        Task<IReadOnlyList<T>> ListAllAsync();
        Task<T> GetAsyncById(long id);
        Task<T> GetAsync(Expression<Func<T, bool>> filter);
        Task<T> AddAsync(T entity);
        Task<T> UpdateAsync(T entity);
        Task DeleteAsync(long id);
        Task<List<T>> GetListWithIncludes(Expression<Func<T, object>> Includes);
        Task<T> GetRecordWithIncludes(Expression<Func<T,object>> Includes, Expression<Func<T, bool>> filter);
        Task<List<T>> ToListWhereAsync(Expression<Func<T, bool>> filter);
        Task<ListResponse<List<T>>> GetPagedRecords(
           Expression<Func<T, bool>> filter,
           int pageSize = 10,
           int pageNumber = 1,
           string searchText = "",
           string sortBy = "",
           bool sortDesc = false);
    }
}

