using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace MC.Basic.Application.Models.DataModel
{
    public class ListResponse<T>
    {
        public ListResponse(T data, int count)
        {
            List = data;
            TotalCount = count;
        }
        public T List { get; set; }
        public int TotalCount { get; set; }
    }

}
