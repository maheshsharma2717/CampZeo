using FluentValidation;
using FluentValidation.Validators;
using MC.Basic.Application.Contracts.Persistance;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace MC.Basic.Application.Features.Organizations.Commands.AddOrganization {
    public class CreateOrganizationCommandValidator : AbstractValidator<CreateOrganisationCommand> {
        private readonly IOrganizationRepository _organizationRepository;
        public CreateOrganizationCommandValidator(IOrganizationRepository organizationRepository) {
            _organizationRepository = organizationRepository;

            RuleFor(propa => propa.Name)
                .NotEmpty().WithMessage("{PropertyName} is required")
                .NotNull()
                .MaximumLength(100).WithMessage("{PropertyName} must not exceed 100 chars");
        }


        private async Task<bool> EventNameAndDateUnique(CreateOrganisationCommand e, CancellationToken token) {
            return !(await _organizationRepository.IsOrganizationNameUnique(e.Name));
        }
    }
}
