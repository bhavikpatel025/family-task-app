using AutoMapper;
using FamilyTask.Core.Contracts.Repositories;
using FamilyTask.Core.Contracts.Services;
using FamilyTask.Core.DTOs;
using FamilyTask.Core.Entities;
using System;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace FamilyTask.Core.Services
{
    public class TaskService : ITaskService
    {
        private readonly ITaskRepository _taskRepository;
        private readonly IMapper _mapper;

        public TaskService(ITaskRepository taskRepository, IMapper mapper)
        {
            _taskRepository = taskRepository;
            _mapper = mapper;
        }

        public async Task<IEnumerable<TaskDto>> GetAllTaskItemsAsync()
        {
            var taskItems = await _taskRepository.GetAllTaskItemsAsync();
            return _mapper.Map<IEnumerable<TaskDto>>(taskItems);
        }

        public async Task<IEnumerable<TaskDto>> GetTaskItemsByMemberIdAsync(Guid memberId)
        {
            var taskItems = await _taskRepository.GetTaskItemsByMemberIdAsync(memberId);
            return _mapper.Map<IEnumerable<TaskDto>>(taskItems);
        }

        public async Task<TaskDto> GetTaskItemByIdAsync(Guid id)
        {
            var taskItem = await _taskRepository.GetTaskItemByIdAsync(id);
            return _mapper.Map<TaskDto>(taskItem);
        }

        public async Task<TaskDto> CreateTaskItemAsync(CreateTaskDto taskDto)
        {
            var taskItem = _mapper.Map<TaskItem>(taskDto);
            var createdTask = await _taskRepository.AddTaskItemAsync(taskItem);
            return _mapper.Map<TaskDto>(createdTask);
        }

        public async Task<TaskDto> CreateTaskItemForMemberAsync(Guid memberId, CreateTaskDto taskDto)
        {
            var taskItem = _mapper.Map<TaskItem>(taskDto);
            taskItem.AssignedMemberId = memberId;
            var createdTask = await _taskRepository.AddTaskItemAsync(taskItem);
            return _mapper.Map<TaskDto>(createdTask);
        }

        public async Task UpdateTaskItemAsync(Guid id, UpdateTaskDto taskDto)
        {
            var existingTask = await _taskRepository.GetTaskItemByIdAsync(id);
            if (existingTask == null)
                throw new KeyNotFoundException($"Task with ID {id} not found.");

            _mapper.Map(taskDto, existingTask);
            await _taskRepository.UpdateTaskItemAsync(existingTask);
        }

        public async Task DeleteTaskItemAsync(Guid id)
        {
            await _taskRepository.DeleteTaskItemAsync(id);
        }

        public async Task AssignTaskItemToMemberAsync(Guid taskId, Guid memberId)
        {
            await _taskRepository.AssignTaskItemToMemberAsync(taskId, memberId);
        }

        public async Task CompleteTaskItemAsync(Guid taskId)
        {
            await _taskRepository.CompleteTaskItemAsync(taskId);
        }

        public async Task CompleteTaskItemForMemberAsync(Guid taskId, Guid memberId)
        {
            var taskItem = await _taskRepository.GetTaskItemByIdAsync(taskId);
            if (taskItem == null || taskItem.AssignedMemberId != memberId)
                throw new InvalidOperationException($"Task not found or not assigned to member {memberId}");

            taskItem.IsComplete = true;
            await _taskRepository.UpdateTaskItemAsync(taskItem);
        }
    }
}