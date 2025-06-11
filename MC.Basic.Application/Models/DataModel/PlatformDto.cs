using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using MC.Basic.Domains;

namespace MC.Basic.Application.Models.DataModel
{
    public class PlatformDto
    {
        private PlatformType _id;

        public PlatformType Id
        {
            get => _id;
            set
            {
                _id = value;
                Name = value.ToString();  // Automatically update Name when Id is set
            }
        }

        public string Name { get; private set; } // readonly for outside, settable only within the class

        public PlatformDto() { }

        public PlatformDto(PlatformType id)
        {
            Id = id; // This will automatically set Name via the setter
        }
    }

}
