using System;

namespace FamilyTask.Core.Entities
{
    public class TaskItem
    {
        public Guid Id { get; set; }
        public string Subject { get; set; }
        public bool IsComplete { get; set; }
        public Guid? AssignedMemberId { get; set; }
        public Member AssignedMember { get; set; }
    }
}