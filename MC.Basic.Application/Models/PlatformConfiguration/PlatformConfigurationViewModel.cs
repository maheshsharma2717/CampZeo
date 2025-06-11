using MC.Basic.Domain;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace MC.Basic.Application.Models.PlatformConfiguration
{
    public class PlatformConfigurationViewModel
    {
        public PlatformConfigurationViewModel()
        {
            Configurations = new List<PlatformConfigurationDto>();
        }
        public PlatformType Type { get; set; }
        public List<PlatformConfigurationDto>Configurations { get; set; }
    }
    public class PlatformConfigurationDto
    {
        public long Id { get; set; }
        public string? Key { get; set; }
        public string? Value { get; set; }
    }
}
