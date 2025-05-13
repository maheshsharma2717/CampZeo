using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace MC.Basic.Application.Features.Authorization.Commands.Login
{
    public class LoginCommandResponse: BaseResponse
    {
        public string Token {  get; set; }
    }
}
