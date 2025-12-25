using FamilyTask.Core.DTOs;
using System;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace FamilyTask.Core.Contracts.Services
{
    public interface ITaskService
    {
        Task<IEnumerable<TaskDto>> GetAllTaskItemsAsync();
        Task<IEnumerable<TaskDto>> GetTaskItemsByMemberIdAsync(Guid memberId);
        Task<TaskDto> GetTaskItemByIdAsync(Guid id);
        Task<TaskDto> CreateTaskItemAsync(CreateTaskDto taskDto);
        Task<TaskDto> CreateTaskItemForMemberAsync(Guid memberId, CreateTaskDto taskDto);
        Task UpdateTaskItemAsync(Guid id, UpdateTaskDto taskDto);
        Task DeleteTaskItemAsync(Guid id);
        Task AssignTaskItemToMemberAsync(Guid taskId, Guid memberId);
        Task CompleteTaskItemAsync(Guid taskId);
        Task CompleteTaskItemForMemberAsync(Guid taskId, Guid memberId);
    }
}