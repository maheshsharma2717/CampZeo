using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace MC.Basic.Application {
    public class BaseResponse 
    {
        public bool Success {  get; set; }
        public string Message { get; set; }

        public List<string?> Errors { get; set; }
        public BaseResponse() {
            Success = true;
        }

        public BaseResponse(string message) {
            Success = true;
            Message = message;
        }

        public BaseResponse(string message, bool success) {
            Success = success;
            Message = message;
        }


    }
}
