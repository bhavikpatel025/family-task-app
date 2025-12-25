
using System;
using System.Collections.Generic;

namespace FamilyTask.Core.DTOs
{
    public class MemberDto
    {
        public Guid Id { get; set; }
        public string FirstName { get; set; }
        public string LastName { get; set; }
        public string EmailAddress { get; set; }
        public string Roles { get; set; }
        public string Avatar { get; set; }
        public IEnumerable<TaskDtoSimplified> Tasks { get; set; }
    }

    public class CreateMemberDto
    {
        public string FirstName { get; set; }
        public string LastName { get; set; }
        public string EmailAddress { get; set; }
        public string Roles { get; set; }
        public string Avatar { get; set; }
    }

    public class UpdateMemberDto
    {
        public string FirstName { get; set; }
        public string LastName { get; set; }
        public string EmailAddress { get; set; }
        public string Roles { get; set; }
        public string Avatar { get; set; }
    }
}