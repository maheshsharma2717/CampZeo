using AutoMapper;
using MC.Basic.Application.Contracts.Infrasructure;
using MC.Basic.Application.Contracts.Persistance;
using MC.Basic.Application.Features.Organizations.Queries.GetOrganizationDetail;
using MC.Basic.Application.Models.Mail;
using MC.Basic.Application.Models.Message;
using MC.Basic.Domains.Entities;
using MediatR;
using Serilog;

namespace MC.Basic.Application.Features.Organizations.Commands.AddOrganization
{
    public class CreateOrganizationCommandHandler : IRequestHandler<CreateOrganisationCommand, CreateOrganizationCommandResponse>
    {
        private readonly IOrganizationRepository _organizationRepository;
        private readonly IMapper _mapper;
        private readonly IEmailService _emailService;
        private readonly ITwilioService _twilioService;


        public CreateOrganizationCommandHandler(IMapper mapper, IOrganizationRepository organizationRepository, IEmailService emailService, ITwilioService twilioService)
        {
            _mapper = mapper;
            _organizationRepository = organizationRepository;
            _emailService = emailService;
            _twilioService = twilioService;
        }

        public async Task<CreateOrganizationCommandResponse> Handle(CreateOrganisationCommand createOrganisationCommand, CancellationToken cancellationToken)
        {
            Log.Information("Handling CreateOrganizationCommand for organization: {Name}", createOrganisationCommand.Name);

            var org = new Organisation
            {
                Name = createOrganisationCommand.Name,
                Address = createOrganisationCommand.Address,
            };

            var response = new CreateOrganizationCommandResponse();
            Log.Information("Validating the CreateOrganizationCommand...");

            var validator = new CreateOrganizationCommandValidator(_organizationRepository);
            var validationResult = await validator.ValidateAsync(createOrganisationCommand);

            if(validationResult.Errors.Count > 0)
            {
                Log.Warning("Validation failed for organization creation: {@Errors}", validationResult.Errors);

                response.Success = false;
                response.Errors = validationResult.Errors.Select(e => e.ErrorMessage).ToList();
            }

            if(response.Success)
            {
                Log.Information("Validation successful. Creating the organization...");

                try
                {
                    org = await _organizationRepository.AddAsync(org);
                    response.organization = _mapper.Map<OrganizationDetailVm>(org);

                    Log.Information("Organization {Name} created successfully with ID: {Id}", org.Name, org.Id);
                }
                catch(Exception ex)
                {
                    Log.Error(ex, "Error occurred while creating the organization or sending the email");
                }
                try
                {

                    // Send email to admin
                    var email = new Email
                    {
                        To = "mahesh@mandavconsultancy.com",
                        Body = $"New organization has been created with name {org.Name}",
                        Subject = "New Organization Created"
                    };

                    Log.Information("Sending email notification to admin...");

                    await _emailService.SendEmail(email);

                    Log.Information("Email notification sent successfully.");
                }
                catch(Exception ex)
                {
                    Log.Error(ex, "Error occurred while sending the email");

                }
                try
                {
                    // Send message to admin
                    var message = new TwilioMessage
                    {
                        To = "+917018311201",
                        Body = $"New organization has been created with name {org.Name}",
                        Subject = "New Organization Created"
                    };

                    Log.Information("Sending email notification to admin...");

                    await _twilioService.SendMessage(message);

                    Log.Information("Email notification sent successfully.");
                }
                catch(Exception ex)
                {
                    Log.Error(ex, "Error occurred while creating the organization or sending the email");
                }
            }
            else
            {
                Log.Warning("Organization creation failed due to validation errors.");
            }

            Log.Information("CreateOrganizationCommandHandler execution completed.");
            return response;
        }
    }
}
