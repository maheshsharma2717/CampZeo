using AutoMapper;
using MC.Basic.Application.Contracts.Persistance;
using MediatR;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Serilog;

namespace MC.Basic.Application.Features.Organizations.Commands.DeleteOrganization {
    public class DeleteOrganizationCommandHandler: IRequestHandler<DeleteOrganizationCommand> {
        private readonly IOrganizationRepository _organizationRepository;
        private readonly IMapper _mapper;

        public DeleteOrganizationCommandHandler(IMapper mapper, IOrganizationRepository organizationRepository) {
            _mapper = mapper;
            _organizationRepository = organizationRepository;
        }

        public async Task Handle(DeleteOrganizationCommand command, CancellationToken cancellationToken) 
        {
            Log.Information("Handling DeleteOrganizationCommand for organizationId: {Id}", command.Id);

            await _organizationRepository.DeleteAsync(command.Id);
        }
    }
}
