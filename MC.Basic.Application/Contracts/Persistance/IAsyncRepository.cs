using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace MC.Basic.Application.Contracts.Persistance {
    public interface IAsyncRepository<T> where T: class 
    {
        Task<IReadOnlyList<T>> ListAllAsync();
        Task<T> GetAsyncById(int id);
        Task<T> AddAsync(T entity);
        Task UpdateAsync(T entity);
        Task DeleteAsync(int id);

    }
}
