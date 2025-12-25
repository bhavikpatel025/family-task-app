using FamilyTask.Core.Contracts.Repositories;
using FamilyTask.Core.Entities;
using FamilyTask.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace FamilyTask.Infrastructure.Repositories
{
    public class TaskRepository : ITaskRepository
    {
        private readonly ApplicationDbContext _context;

        public TaskRepository(ApplicationDbContext context)
        {
            _context = context;
        }

        public async Task<IEnumerable<TaskItem>> GetAllTaskItemsAsync()
        {
            return await _context.TaskItems
                .Include(t => t.AssignedMember)
                .ToListAsync();
        }

        public async Task<IEnumerable<TaskItem>> GetTaskItemsByMemberIdAsync(Guid memberId)
        {
            return await _context.TaskItems
                .Where(t => t.AssignedMemberId == memberId)
                .Include(t => t.AssignedMember)
                .ToListAsync();
        }

        public async Task<TaskItem> GetTaskItemByIdAsync(Guid id)
        {
            return await _context.TaskItems
                .Include(t => t.AssignedMember)
                .FirstOrDefaultAsync(t => t.Id == id);
        }

        public async Task<TaskItem> AddTaskItemAsync(TaskItem taskItem)
        {
            taskItem.Id = Guid.NewGuid();
            _context.TaskItems.Add(taskItem);
            await _context.SaveChangesAsync();
            return taskItem;
        }

        public async Task UpdateTaskItemAsync(TaskItem taskItem)
        {
            _context.TaskItems.Update(taskItem);
            await _context.SaveChangesAsync();
        }

        public async Task DeleteTaskItemAsync(Guid id)
        {
            var taskItem = await _context.TaskItems.FindAsync(id);
            if (taskItem != null)
            {
                _context.TaskItems.Remove(taskItem);
                await _context.SaveChangesAsync();
            }
        }

        public async Task AssignTaskItemToMemberAsync(Guid taskId, Guid memberId)
        {
            var taskItem = await _context.TaskItems.FindAsync(taskId);
            if (taskItem != null)
            {
                taskItem.AssignedMemberId = memberId;
                await _context.SaveChangesAsync();
            }
        }

        public async Task CompleteTaskItemAsync(Guid taskId)
        {
            var taskItem = await _context.TaskItems.FindAsync(taskId);
            if (taskItem != null)
            {
                taskItem.IsComplete = true;
                await _context.SaveChangesAsync();
            }
        }
    }
}