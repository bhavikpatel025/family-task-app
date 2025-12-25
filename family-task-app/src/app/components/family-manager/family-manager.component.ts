import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import {
  CdkDrag,
  CdkDragDrop,
  CdkDropList,
  CdkDropListGroup,
  DragDropModule,
  moveItemInArray,
  transferArrayItem,
} from '@angular/cdk/drag-drop';
import { MemberManagerService } from '../../services/member-manager.service';
import { TaskManagerService } from '../../services/task-manager.service';
import { Member } from '../../models/member.model';
import { Task } from '../../models/task.model';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

@Component({
  selector: 'app-family-manager',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    RouterModule,
    DragDropModule,
    CdkDrag,
    CdkDropList,
    CdkDropListGroup,
  ],
  template: `
    <div class="manager-container">
      <div class="manager-grid">
        <!-- Sidebar - Family Manager Pane -->
        <aside class="sidebar-panel">
          <div class="panel-header">
            <h3 class="panel-title">
              <i class="fa fa-users"></i> Family Members
            </h3>
          </div>

          <div class="panel-content">
            <!-- Add Member Button -->
            <button
              class="btn btn-add-member"
              (click)="startAddMember()"
              [disabled]="isLoading"
            >
              <i class="fa fa-plus-circle"></i>
              <span>Add Member</span>
            </button>

            <!-- Error Alert -->
            <div *ngIf="error" class="alert alert-error">
              <i class="fa fa-exclamation-circle"></i>
              <div>
                <strong>Error</strong>
                <p>{{ error }}</p>
              </div>
              <button class="alert-close" (click)="clearError()" type="button">
                <i class="fa fa-times"></i>
              </button>
            </div>

            <!-- Loading State -->
            <div
              *ngIf="isLoading && members.length === 0"
              class="loading-state"
            >
              <div class="spinner"></div>
              <p>Loading members...</p>
            </div>

            <!-- Members List -->
            <nav class="members-list" *ngIf="!isLoading || members.length > 0">
              <!-- All Tasks Button -->
              <button
                class="member-item all-tasks-item"
                [class.active]="!selectedMemberId"
                (click)="viewAllTasks()"
              >
                <div class="member-icon">
                  <i class="fa fa-th-large"></i>
                </div>
                <div class="member-info">
                  <span class="member-name">All Tasks</span>
                </div>
              </button>

              <!-- Individual Members -->
              <button
                *ngFor="let member of members"
                cdkDropList
                [id]="'member-' + member.id"
                [cdkDropListData]="getIncompleteTasks()"
                [cdkDropListConnectedTo]="['task-list']"
                (cdkDropListDropped)="onTaskDropped($event)"
                (cdkDropListEntered)="onDragEntered(member)"
                (cdkDropListExited)="onDragExited()"
                class="member-item"
                [class.active]="selectedMemberId === member.id"
                [class.drag-over]="dragOverMemberId === member.id"
                (click)="selectMember(member)"
              >
                <div
                  class="member-avatar"
                  [style.background-color]="member.avatar"
                >
                  {{ member.firstName.charAt(0) + member.lastName.charAt(0) }}
                </div>
                <div class="member-info">
                  <span class="member-name"
                    >{{ member.firstName }} {{ member.lastName }}</span
                  >
                </div>
              </button>
            </nav>
          </div>
        </aside>

        <!-- Main Content -->
        <main class="main-panel">
          <!-- Panel Header -->
          <div class="panel-header-main">
            <div class="header-content">
              <div>
                <h3 class="section-title">
                  <span *ngIf="selectedMember">
                    <i class="fa fa-user-circle"></i>
                    {{ selectedMember.firstName }}
                    {{ selectedMember.lastName }}'s Tasks
                  </span>
                  <span *ngIf="!selectedMember">
                    <i class="fa fa-tasks"></i> All Tasks
                  </span>
                </h3>
                <p class="section-subtitle">
                  {{
                    selectedMember
                      ? getTaskCountForMember(selectedMember.id)
                      : tasks.length
                  }}
                  total tasks
                </p>
              </div>
            </div>
          </div>

          <div class="panel-content">
            <!-- Create New Task Section -->
            <div class="create-task-section">
              <div class="input-wrapper">
                <i class="fa fa-plus input-icon"></i>
                <input
                  type="text"
                  class="task-input"
                  placeholder="Add a new task..."
                  [(ngModel)]="newTaskSubject"
                  (keyup.enter)="createTask()"
                  [disabled]="isLoading"
                />
                <button
                  class="btn btn-create-task"
                  (click)="createTask()"
                  [disabled]="isLoading || !newTaskSubject.trim()"
                >
                  <i class="fa fa-arrow-right"></i>
                </button>
              </div>
            </div>

            <!-- Tasks Display -->
            <div class="tasks-section">
              <!-- Incomplete Tasks -->
              <div cdkDropListGroup>
                <div
                  cdkDropList
                  id="task-list"
                  [cdkDropListData]="getIncompleteTasks()"
                  [cdkDropListConnectedTo]="getMemberDropListIds()"
                  (cdkDropListDropped)="onTaskDropped($event)"
                  class="tasks-list"
                >
                  <!-- No Tasks State -->
                  <div
                    *ngIf="getIncompleteTasks().length === 0"
                    class="empty-state"
                  >
                    <div class="empty-icon">
                      <i class="fa fa-check-circle"></i>
                    </div>
                    <h4>No Tasks Yet</h4>
                    <p>Create your first task to get started</p>
                  </div>

                  <!-- Task Items -->
                  <div
                    *ngFor="let task of getIncompleteTasks()"
                    cdkDrag
                    [cdkDragData]="task"
                    class="task-card"
                    [class.task-dragging]="task.isComplete"
                  >
                    <div class="task-drag-handle">
                      <i class="fa fa-grip-vertical"></i>
                    </div>

                    <div class="task-content">
                      <input
                        class="task-checkbox"
                        type="checkbox"
                        [checked]="task.isComplete"
                        (change)="completeTask(task.id)"
                        (click)="$event.stopPropagation()"
                      />
                      <span class="task-text">{{ task.subject }}</span>
                    </div>

                    <!-- Assigned Member Badge -->
                    <div *ngIf="task.assignedMember" class="task-assignee">
                      <div
                        class="assignee-avatar"
                        [style.background-color]="task.assignedMember.avatar"
                        [title]="
                          task.assignedMember.firstName +
                          ' ' +
                          task.assignedMember.lastName
                        "
                      >
                        {{
                          task.assignedMember.firstName.charAt(0) +
                            task.assignedMember.lastName.charAt(0)
                        }}
                      </div>
                      <span class="assignee-name">{{
                        task.assignedMember.firstName
                      }}</span>
                    </div>

                    <!-- Delete Button -->
                    <button
                      class="btn btn-task-delete"
                      (click)="deleteTask(task.id)"
                      [disabled]="isLoading"
                      title="Delete task"
                    >
                      <i class="fa fa-trash"></i>
                    </button>
                  </div>
                </div>
              </div>

              <!-- Completed Tasks Section -->
              <div
                *ngIf="getCompletedTasks().length > 0"
                class="completed-tasks-section"
              >
                <div class="completed-header">
                  <i class="fa fa-check"></i>
                  <span>Completed ({{ getCompletedTasks().length }})</span>
                </div>
                <div class="completed-list">
                  <div
                    *ngFor="let task of getCompletedTasks()"
                    class="task-card task-completed"
                  >
                    <div class="task-drag-handle disabled">
                      <i class="fa fa-lock"></i>
                    </div>
                    <div class="task-content">
                      <input
                        class="task-checkbox"
                        type="checkbox"
                        [checked]="true"
                        (change)="completeTask(task.id)"
                        (click)="$event.stopPropagation()"
                      />
                      <span class="task-text completed">{{
                        task.subject
                      }}</span>
                    </div>
                    <button
                      class="btn btn-task-delete"
                      (click)="deleteTask(task.id)"
                      [disabled]="isLoading"
                    >
                      <i class="fa fa-trash"></i>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>

      <!-- Add Member Modal -->
      <div
        class="modal-overlay"
        [class.active]="showAddMemberModal"
        (click)="cancelAddMember()"
      >
        <div class="modal-content" (click)="$event.stopPropagation()">
          <div class="modal-header">
            <h5 class="modal-title">Add Family Member</h5>
            <button
              class="modal-close"
              (click)="cancelAddMember()"
              type="button"
            >
              <i class="fa fa-times"></i>
            </button>
          </div>

          <div class="modal-body">
            <form #memberForm="ngForm">
              <!-- Name Fields -->
              <div class="form-row">
                <div class="form-group">
                  <label for="firstName" class="form-label">First Name</label>
                  <input
                    type="text"
                    id="firstName"
                    class="form-input"
                    [(ngModel)]="newMember.firstName"
                    name="firstName"
                    placeholder="John"
                    required
                  />
                </div>
                <div class="form-group">
                  <label for="lastName" class="form-label">Last Name</label>
                  <input
                    type="text"
                    id="lastName"
                    class="form-input"
                    [(ngModel)]="newMember.lastName"
                    name="lastName"
                    placeholder="Doe"
                    required
                  />
                </div>
              </div>

              <!-- Email Field -->
              <div class="form-group">
                <label for="email" class="form-label">Email Address</label>
                <input
                  type="email"
                  id="email"
                  class="form-input"
                  [(ngModel)]="newMember.emailAddress"
                  name="emailAddress"
                  placeholder="john@example.com"
                  required
                />
              </div>

              <!-- Roles Field -->
              <div class="form-group">
                <label for="roles" class="form-label">Role (Optional)</label>
                <input
                  type="text"
                  id="roles"
                  class="form-input"
                  [(ngModel)]="newMember.roles"
                  name="roles"
                  placeholder="e.g., Parent, Child"
                />
              </div>

              <!-- Avatar Color Selection -->
              <div class="form-group">
                <label class="form-label">Select Avatar Color</label>
                <div class="color-picker-horizontal">
                  <button
                    *ngFor="let color of avatarColors"
                    type="button"
                    class="color-option-circle"
                    [style.background-color]="color"
                    [class.selected]="newMember.avatar === color"
                    (click)="selectAvatarColor(color)"
                    [title]="color"
                  >
                    <i
                      *ngIf="newMember.avatar === color"
                      class="fa fa-check"
                    ></i>
                  </button>
                </div>
              </div>
            </form>
          </div>

          <div class="modal-footer">
            <button
              type="button"
              class="btn btn-secondary"
              (click)="cancelAddMember()"
              [disabled]="isLoading"
            >
              Cancel
            </button>
            <button
              type="button"
              class="btn btn-primary"
              (click)="saveNewMember()"
              [disabled]="
                !memberForm.form.valid || !newMember.avatar || isLoading
              "
            >
              <i class="fa fa-plus"></i> Add Member
            </button>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [
    `
      .manager-container {
        display: flex;
        flex-direction: column;
        height: 100%;
        background: #f8fafb;
      }

      .manager-grid {
        display: grid;
        grid-template-columns: 300px 1fr;
        gap: 0;
        flex: 1;
        height: 100%;
      }

      /* ============ SIDEBAR ============ */
      .sidebar-panel {
        background: white;
        border-right: 1px solid #e5e7eb;
        display: flex;
        flex-direction: column;
        height: 100%;
        box-shadow: 1px 0 3px rgba(0, 0, 0, 0.05);
      }

      .panel-header {
        padding: 24px 20px;
        border-bottom: 1px solid #e5e7eb;
        background: linear-gradient(135deg, #667eea15 0%, #764ba215 100%);
      }

      .panel-title {
        font-size: 16px;
        font-weight: 700;
        color: #1f2937;
        margin: 0;
        display: flex;
        align-items: center;
        gap: 8px;
      }

      .panel-title i {
        color: #667eea;
        font-size: 18px;
      }

      .panel-content {
        flex: 1;
        overflow-y: auto;
        padding: 16px;
        display: flex;
        flex-direction: column;
        gap: 16px;
      }
      /* Color Picker - Horizontal Circle Layout */
      .color-picker-horizontal {
        display: flex;
        gap: 12px;
        flex-wrap: wrap;
      }

      .color-option-circle {
        width: 40px;
        height: 40px;
        border-radius: 50%;
        border: 2px solid transparent;
        cursor: pointer;
        transition: all 0.2s ease;
        display: flex;
        align-items: center;
        justify-content: center;
        padding: 0;
        background-color: currentColor;
      }

      .color-option-circle:hover {
        transform: scale(1.1);
        border-color: #d1d5db;
      }

      .color-option-circle.selected {
        border-color: #1f2937;
        box-shadow: 0 0 0 2px white, 0 0 0 4px #1f2937;
        transform: scale(1.1);
      }

      .color-option-circle i {
        color: white;
        font-size: 16px;
        font-weight: bold;
        text-shadow: 0 1px 2px rgba(0, 0, 0, 0.3);
      }
      @media (max-width: 768px) {
        .color-picker-horizontal {
          gap: 8px;
        }

        .color-option-circle {
          width: 36px;
          height: 36px;
        }
      }

      /* Add Member Button */
      .btn-add-member {
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 8px;
        width: 100%;
        padding: 12px 16px;
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        color: white;
        border: none;
        border-radius: 8px;
        font-weight: 600;
        font-size: 14px;
        cursor: pointer;
        transition: all 0.3s ease;
        box-shadow: 0 4px 12px rgba(102, 126, 234, 0.3);
      }

      .btn-add-member:hover:not(:disabled) {
        transform: translateY(-2px);
        box-shadow: 0 6px 16px rgba(102, 126, 234, 0.4);
      }

      .btn-add-member:disabled {
        opacity: 0.6;
        cursor: not-allowed;
      }

      .btn-add-member i {
        font-size: 16px;
      }

      /* Error Alert */
      .alert-error {
        background: #fef2f2;
        border: 1px solid #fecaca;
        border-radius: 8px;
        padding: 12px;
        display: flex;
        gap: 10px;
        align-items: flex-start;
      }

      .alert-error i {
        color: #dc2626;
        font-size: 16px;
        margin-top: 2px;
        flex-shrink: 0;
      }

      .alert-error strong {
        color: #991b1b;
        font-size: 13px;
        display: block;
      }

      .alert-error p {
        color: #7f1d1d;
        font-size: 12px;
        margin: 4px 0 0 0;
      }

      .alert-close {
        background: none;
        border: none;
        color: #dc2626;
        cursor: pointer;
        padding: 0;
        font-size: 14px;
        margin-left: auto;
        flex-shrink: 0;
      }

      /* Loading State */
      .loading-state {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        gap: 12px;
        padding: 40px 20px;
        color: #6b7280;
      }

      .spinner {
        width: 32px;
        height: 32px;
        border: 3px solid #e5e7eb;
        border-top-color: #667eea;
        border-radius: 50%;
        animation: spin 0.8s linear infinite;
      }

      @keyframes spin {
        to {
          transform: rotate(360deg);
        }
      }

      /* Members List */
      .members-list {
        display: flex;
        flex-direction: column;
        gap: 8px;
      }

      .member-item {
        display: flex;
        align-items: center;
        gap: 12px;
        padding: 12px 14px;
        background: white;
        border: 1px solid #e5e7eb;
        border-radius: 8px;
        cursor: pointer;
        transition: all 0.2s ease;
        font-size: 14px;
        font-weight: 500;
        color: #374151;
        text-align: left;
      }

      .member-item:hover {
        background: #f9fafb;
        border-color: #d1d5db;
      }

      .member-item.active {
        background: linear-gradient(135deg, #667eea15 0%, #764ba215 100%);
        border-color: #667eea;
        color: #1f2937;
      }

      .member-item.drag-over {
        background: #dbeafe;
        border: 2px dashed #667eea;
        padding: 11px 13px;
      }

      .all-tasks-item .member-icon {
        width: 36px;
        height: 36px;
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        border-radius: 6px;
        display: flex;
        align-items: center;
        justify-content: center;
        color: white;
        font-size: 14px;
        flex-shrink: 0;
      }

      .member-avatar {
        width: 36px;
        height: 36px;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        color: white;
        font-weight: 600;
        font-size: 12px;
        flex-shrink: 0;
      }

      .member-info {
        display: flex;
        flex-direction: column;
        gap: 2px;
        min-width: 0;
      }

      .member-name {
        font-weight: 600;
        color: inherit;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
      }

      .member-tasks {
        font-size: 12px;
        color: #9ca3af;
        font-weight: 400;
      }

      /* ============ MAIN PANEL ============ */
      .main-panel {
        display: flex;
        flex-direction: column;
        height: 100%;
        background: #f8fafb;
      }

      .panel-header-main {
        background: white;
        border-bottom: 1px solid #e5e7eb;
        padding: 10px 32px;
        box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
      }

      .header-content {
        display: flex;
        justify-content: space-between;
        align-items: center;
      }

      .section-title {
        font-size: 20px;
        font-weight: 700;
        color: #1f2937;
        margin: 0;
        display: flex;
        align-items: center;
        gap: 10px;
      }

      .section-title i {
        color: #667eea;
        font-size: 22px;
      }

      .section-subtitle {
        font-size: 13px;
        color: #9ca3af;
        margin: 4px 0 0 28px;
      }

      .panel-content {
        flex: 1;
        overflow-y: auto;
        padding: 32px;
      }

      /* Create Task Section */
      .create-task-section {
        margin-bottom: 16px;
      }

      .input-wrapper {
        display: flex;
        align-items: center;
        gap: 0;
        background: white;
        border: 1px solid #e5e7eb;
        border-radius: 10px;
        padding: 0 16px;
        transition: all 0.3s ease;
        box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
      }

      .input-wrapper:focus-within {
        border-color: #667eea;
        box-shadow: 0 4px 12px rgba(102, 126, 234, 0.15);
      }

      .input-icon {
        color: #d1d5db;
        margin-right: 4px;
        font-size: 16px;
      }

      .task-input {
        flex: 1;
        border: none;
        padding: 14px 0;
        font-size: 15px;
        color: #1f2937;
        background: transparent;
        outline: none;
      }

      .task-input::placeholder {
        color: #9ca3af;
      }

      .btn-create-task {
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        color: white;
        border: none;
        padding: 10px 16px;
        border-radius: 6px;
        cursor: pointer;
        font-weight: 600;
        transition: all 0.3s ease;
        display: flex;
        align-items: center;
        justify-content: center;
      }

      .btn-create-task:hover:not(:disabled) {
        transform: translateX(2px);
        box-shadow: 0 4px 12px rgba(102, 126, 234, 0.3);
      }

      .btn-create-task:disabled {
        opacity: 0.5;
        cursor: not-allowed;
      }

      /* Tasks Section */
      .tasks-section {
        display: flex;
        flex-direction: column;
        gap: 12px;
      }

      .tasks-list {
        display: flex;
        flex-direction: column;
        gap: 12px;
        min-height: auto;
      }

      /* Empty State */
      .empty-state {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        padding: 60px 20px;
        text-align: center;
        color: #9ca3af;
      }

      .empty-icon {
        font-size: 48px;
        color: #d1d5db;
        margin-bottom: 16px;
      }

      .empty-state h4 {
        font-size: 18px;
        font-weight: 600;
        color: #6b7280;
        margin: 0 0 8px 0;
      }

      .empty-state p {
        font-size: 14px;
        margin: 0;
      }

      /* Task Cards */
      .task-card {
        display: flex;
        align-items: center;
        gap: 12px;
        padding: 14px 16px;
        background: white;
        border: 1px solid #e5e7eb;
        border-radius: 8px;
        transition: all 0.2s ease;
        cursor: move;
      }

      .task-card:hover {
        background: #f9fafb;
        border-color: #d1d5db;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
        transform: translateY(-1px);
      }

      .task-card.task-completed {
        background: #f9fafb;
        opacity: 0.7;
        cursor: default;
      }

      .task-card.task-completed:hover {
        transform: none;
        box-shadow: none;
      }

      .task-drag-handle {
        color: #d1d5db;
        cursor: grab;
        font-size: 14px;
        flex-shrink: 0;
        transition: color 0.2s ease;
      }

      .task-drag-handle.disabled {
        color: #9ca3af;
        cursor: not-allowed;
      }

      .task-card:hover .task-drag-handle {
        color: #9ca3af;
      }

      .task-content {
        display: flex;
        align-items: center;
        gap: 10px;
        flex: 1;
        min-width: 0;
      }

      .task-checkbox {
        width: 18px;
        height: 18px;
        cursor: pointer;
        accent-color: #667eea;
        flex-shrink: 0;
      }

      .task-text {
        font-size: 14px;
        color: #1f2937;
        font-weight: 500;
      }

      .task-text.completed {
        text-decoration: line-through;
        color: #9ca3af;
      }

      .task-assignee {
        display: flex;
        align-items: center;
        gap: 6px;
        padding: 4px 10px;
        background: #f3f4f6;
        border-radius: 6px;
        font-size: 12px;
        color: #6b7280;
      }

      .assignee-avatar {
        width: 24px;
        height: 24px;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        color: white;
        font-weight: 600;
        font-size: 10px;
      }

      .assignee-name {
        font-weight: 500;
      }

      .btn-task-delete {
        background: none;
        border: none;
        color: #9ca3af;
        cursor: pointer;
        padding: 4px 8px;
        border-radius: 4px;
        transition: all 0.2s ease;
        font-size: 14px;
        flex-shrink: 0;
      }

      .btn-task-delete:hover:not(:disabled) {
        background: #fee2e2;
        color: #dc2626;
      }

      .btn-task-delete:disabled {
        opacity: 0.5;
        cursor: not-allowed;
      }

      /* Completed Tasks Section */
      .completed-tasks-section {
        margin-top: 12px;
        padding-top: 12px;
        border-top: 1px solid #e5e7eb;
      }

      .completed-header {
        display: flex;
        align-items: center;
        gap: 8px;
        font-size: 13px;
        font-weight: 600;
        color: #9ca3af;
        margin-bottom: 12px;
        text-transform: uppercase;
        letter-spacing: 0.5px;
      }

      .completed-header i {
        color: #10b981;
      }

      .completed-list {
        display: flex;
        flex-direction: column;
        gap: 8px;
      }

      /* ============ MODAL ============ */
      .modal-overlay {
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: rgba(0, 0, 0, 0);
        display: flex;
        align-items: center;
        justify-content: center;
        opacity: 0;
        visibility: hidden;
        transition: all 0.3s ease;
        z-index: 1000;
      }

      .modal-overlay.active {
        background: rgba(0, 0, 0, 0.5);
        opacity: 1;
        visibility: visible;
      }

      .modal-content {
        background: white;
        border-radius: 12px;
        width: 90%;
        max-width: 500px;
        max-height: 90vh;
        overflow-y: auto;
        box-shadow: 0 20px 25px rgba(0, 0, 0, 0.15);
        transform: scale(0.95);
        transition: transform 0.3s ease;
      }

      .modal-overlay.active .modal-content {
        transform: scale(1);
      }

      .modal-header {
        padding: 24px;
        border-bottom: 1px solid #e5e7eb;
        display: flex;
        justify-content: space-between;
        align-items: center;
      }

      .modal-title {
        font-size: 18px;
        font-weight: 700;
        color: #1f2937;
        margin: 0;
      }

      .modal-close {
        background: none;
        border: none;
        color: #9ca3af;
        cursor: pointer;
        font-size: 16px;
        padding: 4px 8px;
        border-radius: 4px;
        transition: all 0.2s ease;
      }

      .modal-close:hover {
        background: #f3f4f6;
        color: #1f2937;
      }

      .modal-body {
        padding: 24px;
      }

      /* Form Styles */
      .form-row {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 16px;
      }

      .form-group {
        display: flex;
        flex-direction: column;
        gap: 8px;
        margin-bottom: 16px;
      }

      .form-group:last-child {
        margin-bottom: 0;
      }

      .form-label {
        font-size: 13px;
        font-weight: 600;
        color: #374151;
        text-transform: uppercase;
        letter-spacing: 0.5px;
      }

      .form-input {
        padding: 10px 12px;
        border: 1px solid #e5e7eb;
        border-radius: 6px;
        font-size: 14px;
        color: #1f2937;
        transition: all 0.2s ease;
        font-family: inherit;
      }

      .form-input:focus {
        outline: none;
        border-color: #667eea;
        box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
      }

      .form-input::placeholder {
        color: #d1d5db;
      }

      /* Color Picker */
      .color-picker {
        display: grid;
        grid-template-columns: repeat(4, 1fr);
        gap: 12px;
      }

      .color-option {
        width: 100%;
        aspect-ratio: 1;
        border-radius: 8px;
        border: 2px solid transparent;
        cursor: pointer;
        transition: all 0.2s ease;
        display: flex;
        align-items: center;
        justify-content: center;
        background-color: currentColor;
      }

      .color-option:hover {
        transform: scale(1.05);
        border-color: #d1d5db;
      }

      .color-option.selected {
        border-color: #1f2937;
        box-shadow: 0 0 0 2px white, 0 0 0 4px #1f2937;
        transform: scale(1.05);
      }

      .color-option i {
        color: white;
        font-size: 18px;
        font-weight: bold;
        text-shadow: 0 1px 2px rgba(0, 0, 0, 0.3);
      }

      /* Modal Footer */
      .modal-footer {
        padding: 16px 24px;
        background: #f9fafb;
        border-top: 1px solid #e5e7eb;
        display: flex;
        justify-content: flex-end;
        gap: 12px;
      }

      /* Buttons */
      .btn {
        padding: 10px 16px;
        border: none;
        border-radius: 6px;
        font-size: 14px;
        font-weight: 600;
        cursor: pointer;
        transition: all 0.3s ease;
        display: inline-flex;
        align-items: center;
        justify-content: center;
        gap: 6px;
      }

      .btn-primary {
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        color: white;
        box-shadow: 0 4px 12px rgba(102, 126, 234, 0.3);
      }

      .btn-primary:hover:not(:disabled) {
        transform: translateY(-2px);
        box-shadow: 0 6px 16px rgba(102, 126, 234, 0.4);
      }

      .btn-secondary {
        background: #e5e7eb;
        color: #374151;
      }

      .btn-secondary:hover:not(:disabled) {
        background: #d1d5db;
      }

      .btn:disabled {
        opacity: 0.5;
        cursor: not-allowed;
      }

      /* Drag and Drop Styles */
      .cdk-drag-preview {
        box-sizing: border-box;
        border-radius: 8px;
        box-shadow: 0 8px 16px rgba(102, 126, 234, 0.3);
        opacity: 0.95;
      }

      .cdk-drag-placeholder {
        opacity: 0.3;
        background-color: #e5e7eb;
        border-radius: 8px;
      }

      .cdk-drag-animating {
        transition: transform 250ms cubic-bezier(0.4, 0, 0.2, 1);
      }

      /* Responsive Design */
      @media (max-width: 1024px) {
        .manager-grid {
          grid-template-columns: 280px 1fr;
        }

        .panel-content {
          padding: 24px;
        }

        .panel-header-main {
          padding: 20px 24px;
        }
      }

      @media (max-width: 768px) {
        .manager-grid {
          grid-template-columns: 1fr;
        }

        .sidebar-panel {
          position: fixed;
          left: -300px;
          top: 70px;
          bottom: 0;
          width: 300px;
          z-index: 999;
          transition: left 0.3s ease;
          border-right: 1px solid #e5e7eb;
        }

        .sidebar-panel.mobile-open {
          left: 0;
        }

        .panel-content {
          padding: 16px;
        }

        .panel-header-main {
          padding: 16px 20px;
        }

        .section-title {
          font-size: 18px;
        }

        .form-row {
          grid-template-columns: 1fr;
        }

        .color-picker {
          grid-template-columns: repeat(4, 1fr);
        }
      }

      @media (max-width: 480px) {
        .panel-content {
          padding: 12px;
        }

        .panel-header-main {
          padding: 12px 16px;
        }

        .section-title {
          font-size: 16px;
        }

        .input-wrapper {
          flex-direction: column;
          align-items: stretch;
        }

        .task-input {
          padding: 12px;
        }

        .btn-create-task {
          width: 100%;
          margin-top: 8px;
        }

        .task-card {
          flex-wrap: wrap;
        }

        .task-assignee {
          order: -1;
          width: 100%;
        }

        .color-picker {
          grid-template-columns: repeat(4, 1fr);
        }

        .modal-content {
          width: 95%;
          border-radius: 16px;
        }
      }
    `,
  ],
})
export class FamilyManagerComponent implements OnInit, OnDestroy {
  members: Member[] = [];
  tasks: Task[] = [];
  selectedMember: Member | null = null;
  selectedMemberId: string | null = null;
  newTaskSubject = '';
  isLoading = false;
  error: string | null = null;
  dragOverMemberId: string | null = null;

  showAddMemberModal = false;
  newMember = this.initializeNewMember();

  avatarColors = [
    '#FF6B6B', // Red
    '#FFA500', // Orange
    '#FFD93D', // Yellow
    '#6BCB77', // Green
    '#4D96FF', // Blue
    '#9D84B7', // Purple
    '#FF9FF3', // Pink
    '#A8A8A8', // Gray
  ];

  private destroy$ = new Subject<void>();

  constructor(
    private memberService: MemberManagerService,
    private taskService: TaskManagerService
  ) {}

  ngOnInit(): void {
    this.loadData();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private initializeNewMember() {
    return {
      firstName: '',
      lastName: '',
      emailAddress: '',
      roles: '',
      avatar: '',
    };
  }

  loadData(): void {
    this.memberService.members$
      .pipe(takeUntil(this.destroy$))
      .subscribe((members) => {
        this.members = members;
      });

    this.taskService.tasks$
      .pipe(takeUntil(this.destroy$))
      .subscribe((tasks) => {
        this.tasks = tasks;
      });

    this.taskService.selectedMemberId$
      .pipe(takeUntil(this.destroy$))
      .subscribe((memberId) => {
        this.selectedMemberId = memberId;
        if (memberId) {
          this.selectedMember =
            this.members.find((m) => m.id === memberId) || null;
        } else {
          this.selectedMember = null;
        }
      });

    this.memberService.loading$
      .pipe(takeUntil(this.destroy$))
      .subscribe((loading: boolean) => {
        this.isLoading = loading;
      });

    this.memberService.error$
      .pipe(takeUntil(this.destroy$))
      .subscribe((error: string | null) => {
        this.error = error;
      });

    this.memberService.loadMembers();
    this.taskService.loadTasks();
  }

  selectMember(member: Member): void {
    this.memberService.selectMember(member);
    this.taskService.loadTasksForMember(member.id);
  }

  viewAllTasks(): void {
    this.memberService.clearSelection();
    this.taskService.clearMemberSelection();
  }

  createTask(): void {
    if (this.newTaskSubject.trim()) {
      if (this.selectedMemberId) {
        this.taskService.createTaskForMember(
          this.newTaskSubject,
          this.selectedMemberId
        );
      } else {
        this.taskService.createTask(this.newTaskSubject);
      }
      this.newTaskSubject = '';
    }
  }

  completeTask(taskId: string): void {
    this.taskService.completeTask(taskId);
  }

  deleteTask(taskId: string): void {
    if (!confirm('Are you sure you want to delete this task?')) {
      return;
    }
    this.taskService.deleteTask(taskId);
  }

  selectAvatarColor(color: string): void {
    this.newMember.avatar = color;
  }

  onDragEntered(member: Member): void {
    this.dragOverMemberId = member.id;
  }

  onDragExited(): void {
    this.dragOverMemberId = null;
  }

  onTaskDropped(event: CdkDragDrop<Task[]>): void {
    const task: Task = event.item.data;

    if (task.isComplete) {
      console.warn('Cannot move completed task');
      return;
    }

    if (event.previousContainer === event.container) {
      const incompleteTasks = this.getIncompleteTasks();
      moveItemInArray(incompleteTasks, event.previousIndex, event.currentIndex);
    } else {
      const memberId = event.container.id.replace('member-', '');

      if (task && memberId) {
        this.taskService.assignTaskToMember(task.id, memberId);
      }
    }
  }

  getMemberDropListIds(): string[] {
    return this.members.map((member) => `member-${member.id}`);
  }

  getIncompleteTasks(): Task[] {
    return this.tasks.filter((task) => !task.isComplete);
  }

  getCompletedTasks(): Task[] {
    return this.tasks.filter((task) => task.isComplete);
  }

  getTaskCountForMember(memberId: string): number {
    return this.tasks.filter(
      (task) => task.assignedMember?.id === memberId && !task.isComplete
    ).length;
  }

  startAddMember(): void {
    this.showAddMemberModal = true;
    this.newMember = this.initializeNewMember();
  }

  cancelAddMember(): void {
    this.showAddMemberModal = false;
  }

  saveNewMember(): void {
    if (
      this.newMember.firstName &&
      this.newMember.lastName &&
      this.newMember.emailAddress &&
      this.newMember.avatar
    ) {
      this.memberService.createMember(this.newMember);
      this.showAddMemberModal = false;
    }
  }

  clearError(): void {
    this.error = null;
  }
}
