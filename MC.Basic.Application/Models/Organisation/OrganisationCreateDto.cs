﻿using MC.Basic.Application.Models.DataModel;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace MC.Basic.Application.Models.Organisation
{
    public class OrganisationCreateDto
    {
        public long Id { get; set; }=0;
        public string? Name { get; set; }
        public string? OwnerName { get; set; }
         public string? Phone { get; set; }
         public string? Email { get; set; }
         public string? Address { get; set; }
         public string? City { get; set; }
         public string? State { get; set; }
         public string? Country { get; set; }
         public string? PostalCode { get; set; }
         public List<OrganisationPlatformRequest>? OrganisationPlatform { get; set; }
    }
    public class AdminUserResponseDto
    {
        public string Email { get; set; }
        public string FullName => $"{FirstName} {LastName}";
        public string Role { get; set; }
        public bool IsApproved { get; set; }

        public string FirstName { get; set; }
        public string LastName { get; set; }
    }

    //public class OrganisationUpdateDto
    //{
    //    public long Id { get; set; }
    //    public string? Name { get; set; }
    //    public string? OwnerName { get; set; }
    //    public string? Phone { get; set; }
    //    public string? Email { get; set; }
    //    public string? Address { get; set; }
    //    public string? City { get; set; }
    //    public string? State { get; set; }
    //    public string? Country { get; set; }
    //    public string? PostalCode { get; set; }
    //    public List<OrganisationPlatformRequest>? OrganisationPlatform { get; set; }
    //}

    public class OrganisationEditDto
    {
        public long Id { get; set; }
        public string Name { get; set; }
        public string OwnerName { get; set; }
        public string Phone { get; set; }
        public string Email { get; set; }
        public string Address { get; set; }
        // add other properties if needed
    }
}
