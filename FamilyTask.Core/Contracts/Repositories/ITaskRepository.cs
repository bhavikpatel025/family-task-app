using FamilyTask.Core.Entities;
using System;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace FamilyTask.Core.Contracts.Repositories
{
    public interface ITaskRepository
    {
        Task<IEnumerable<TaskItem>> GetAllTaskItemsAsync();
        Task<IEnumerable<TaskItem>> GetTaskItemsByMemberIdAsync(Guid memberId);
        Task<TaskItem> GetTaskItemByIdAsync(Guid id);
        Task<TaskItem> AddTaskItemAsync(TaskItem taskItem);
        Task UpdateTaskItemAsync(TaskItem taskItem);
        Task DeleteTaskItemAsync(Guid id);
        Task AssignTaskItemToMemberAsync(Guid taskId, Guid memberId);
        Task CompleteTaskItemAsync(Guid taskId);
    }
}