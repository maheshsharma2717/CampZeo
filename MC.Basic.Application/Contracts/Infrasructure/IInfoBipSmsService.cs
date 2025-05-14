using MC.Basic.Application.Models.DataModel;
using RestSharp;

namespace MC.Basic.Application.Contracts.Infrasructure
{
    public interface IInfobipSmsService
    {
        Task<RestResponse> SendTextMessageAsync(InfobipMessageParams messageParams);
        Task<RestResponse> SendMediaMessageAsync(InfobipMessageParams messageParams);
    }
}

