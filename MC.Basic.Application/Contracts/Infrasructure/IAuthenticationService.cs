using MC.Basic.Application.Models.Authentication;
using MC.Basic.Application.Models.DataModel;
using MC.Basic.Domains.Entities;
using MediatR;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace MC.Basic.Application.Contracts.Infrasructure
{
    public interface IAuthenticationService
    {
        Task<ApiResponse<User>> AuthenticateUser(string Email, string Password);
        Task<User?> CreateAdminUser(string firstName, string lastName, string email, string password);
        Task<User?> GetUserByToken(string token);
        Task<ApiResponse<User>> ValidateToken(string token);
        Task<ApiResponse<User>> UpdateUserPassword(ApiRequest<UpdatePasswordRequest> request);
        Task<ApiResponse<User>> ForgotUserPassword(ApiRequest<ForgetPasswordRequest> request);
        Task<ApiResponse<User>> LogInAsOrgenisation(int Id);
        //Task ForgotUserPassword(ApiRequest<ForgotPasswordRequest> request);
        // TODO
        //Task <string> updateJwtToken(ApiRequest<long> request);
    }
}
