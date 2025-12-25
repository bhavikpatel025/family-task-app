using FamilyTask.Core.Contracts.Services;
using FamilyTask.Core.DTOs;
using Microsoft.AspNetCore.Mvc;
using System;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace FamilyTask.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class TasksController : ControllerBase
    {
        private readonly ITaskService _taskService;

        public TasksController(ITaskService taskService)
        {
            _taskService = taskService;
        }

        [HttpGet]
        public async Task<ActionResult<IEnumerable<TaskDto>>> GetAllTasks()
        {
            var tasks = await _taskService.GetAllTaskItemsAsync();
            return Ok(tasks);
        }

        [HttpGet("member/{memberId}")]
        public async Task<ActionResult<IEnumerable<TaskDto>>> GetTasksByMemberId(Guid memberId)
        {
            var tasks = await _taskService.GetTaskItemsByMemberIdAsync(memberId);
            return Ok(tasks);
        }

        [HttpGet("{id}")]
        public async Task<ActionResult<TaskDto>> GetTaskById(Guid id)
        {
            var task = await _taskService.GetTaskItemByIdAsync(id);
            if (task == null)
                return NotFound();

            return Ok(task);
        }

        [HttpPost]
        public async Task<ActionResult<TaskDto>> CreateTask(CreateTaskDto taskDto)
        {
            var createdTask = await _taskService.CreateTaskItemAsync(taskDto);
            return CreatedAtAction(nameof(GetTaskById), new { id = createdTask.Id }, createdTask);
        }

        [HttpPost("member/{memberId}")]
        public async Task<ActionResult<TaskDto>> CreateTaskForMember(Guid memberId, CreateTaskDto taskDto)
        {
            var createdTask = await _taskService.CreateTaskItemForMemberAsync(memberId, taskDto);
            return CreatedAtAction(nameof(GetTaskById), new { id = createdTask.Id }, createdTask);
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateTask(Guid id, UpdateTaskDto taskDto)
        {
            try
            {
                await _taskService.UpdateTaskItemAsync(id, taskDto);
                return NoContent();
            }
            catch (KeyNotFoundException)
            {
                return NotFound();
            }
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteTask(Guid id)
        {
            await _taskService.DeleteTaskItemAsync(id);
            return NoContent();
        }

        [HttpPost("{taskId}/assign/{memberId}")]
        public async Task<IActionResult> AssignTaskToMember(Guid taskId, Guid memberId)
        {
            await _taskService.AssignTaskItemToMemberAsync(taskId, memberId);
            return NoContent();
        }

        [HttpPost("{taskId}/complete")]
        public async Task<IActionResult> CompleteTask(Guid taskId)
        {
            await _taskService.CompleteTaskItemAsync(taskId);
            return NoContent();
        }

        [HttpPost("{taskId}/member/{memberId}/complete")]
        public async Task<IActionResult> CompleteTaskForMember(Guid taskId, Guid memberId)
        {
            try
            {
                await _taskService.CompleteTaskItemForMemberAsync(taskId, memberId);
                return NoContent();
            }
            catch (InvalidOperationException ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }
    }
}