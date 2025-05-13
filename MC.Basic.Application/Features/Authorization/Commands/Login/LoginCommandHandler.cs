using AutoMapper;
using MC.Basic.Application.Contracts.Infrasructure;
using MC.Basic.Application.Contracts.Persistance;
using MC.Basic.Application.Features.Organizations.Commands.AddOrganization;
using MC.Basic.Application.Features.Organizations.Queries.GetOrganizationDetail;
using MC.Basic.Application.Models.Mail;
using MC.Basic.Application.Models.Message;
using MC.Basic.Domains.Entities;
using MediatR;
using Serilog;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace MC.Basic.Application.Features.Authorization.Commands.Login
{
    public class LoginCommandHandler : IRequestHandler<LoginCommand, LoginCommandResponse>
    {
        private readonly ITokenService _tokenRepository;
        private readonly IMapper _mapper;



        public LoginCommandHandler(IMapper mapper, ITokenService tokenRepository)
        {
            _tokenRepository = tokenRepository;
        }

        public async Task<LoginCommandResponse> Handle(LoginCommand createOrganisationCommand, CancellationToken cancellationToken)
        {
            //TODO implement login functionality

            return await Task.FromResult(new LoginCommandResponse { Token = _tokenRepository.GenerateToken(createOrganisationCommand.Identity) });
        }
    }
}
