public class TaskDto
{
    public Guid Id { get; set; }
    public string Subject { get; set; }
    public bool IsComplete { get; set; }
    public Guid? AssignedMemberId { get; set; }
    public MemberDtoSimplified AssignedMember { get; set; }
}

public class TaskDtoSimplified
{
    public Guid Id { get; set; }
    public string Subject { get; set; }
    public bool IsComplete { get; set; }
    public Guid? AssignedMemberId { get; set; }
}

public class CreateTaskDto
{
    public string Subject { get; set; }
    public Guid? AssignedMemberId { get; set; }
}

public class UpdateTaskDto
{
    public string Subject { get; set; }
    public bool IsComplete { get; set; }
    public Guid? AssignedMemberId { get; set; }
}

public class AssignTaskDto
{
    public Guid MemberId { get; set; }
}

public class CompleteTaskDto
{
    public bool IsComplete { get; set; }
}

public class MemberDtoSimplified
{
    public Guid Id { get; set; }
    public string FirstName { get; set; }
    public string LastName { get; set; }
    public string EmailAddress { get; set; }
    public string Roles { get; set; }
    public string Avatar { get; set; }
}
