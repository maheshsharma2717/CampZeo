using AutoMapper;
using MC.Basic.Application.Contracts.Persistance;
using MC.Basic.Domains.Entities;
using MediatR;
using Serilog;

namespace MC.Basic.Application.Features.Organizations.Commands.UpdateOrganization
{
    public class UpdateOrganizationCommandHandler : IRequestHandler<UpdateOrganisationCommand>
    {
        private readonly IOrganizationRepository _organizationRepository;
        private readonly IMapper _mapper;

        public UpdateOrganizationCommandHandler(IMapper mapper, IOrganizationRepository organizationRepository)
        {
            _mapper = mapper;
            _organizationRepository = organizationRepository;
        }

        public async Task Handle(UpdateOrganisationCommand updateOrganisationCommand, CancellationToken cancellationToken)
        {

            // Fetch the organization to update
            var organizationToUpdate = await _organizationRepository.GetAsyncById(updateOrganisationCommand.Id);

            if(organizationToUpdate == null)
            {
                Log.Warning("Organization with ID {OrganizationId} not found", updateOrganisationCommand.Id);
                throw new KeyNotFoundException($"Organization with ID {updateOrganisationCommand.Id} not found");
            }

            // Map the updated values from command to the organization entity
            _mapper.Map(updateOrganisationCommand, organizationToUpdate, typeof(UpdateOrganisationCommand), typeof(Organization));

            // Save the updated entity to the repository
            await _organizationRepository.UpdateAsync(organizationToUpdate);

            Log.Information("Organization with ID {OrganizationId} updated successfully", updateOrganisationCommand.Id);
        }

    }
}
