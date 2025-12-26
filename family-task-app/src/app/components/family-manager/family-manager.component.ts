import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, NgForm } from '@angular/forms';
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

// Import PrimeNG modules for confirmation dialog and toast
import { ConfirmationService, MessageService } from 'primeng/api';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { ToastModule } from 'primeng/toast';

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
    // Import PrimeNG UI modules
    ConfirmDialogModule,
    ToastModule,
  ],
  // Add PrimeNG service providers
  providers: [ConfirmationService, MessageService],
  template: `
    <!-- PrimeNG Toast Container -->
    <p-toast position="top-right"></p-toast>
    <!-- PrimeNG Confirmation Dialog -->
    <p-confirmDialog
      [style]="{ width: '450px' }"
      header="Confirmation"
      icon="pi pi-exclamation-triangle"
    ></p-confirmDialog>

    <div class="manager-container" cdkDropListGroup>
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

            <!-- Members List - NOW DRAGGABLE -->
            <div
              class="members-list"
              *ngIf="!isLoading || members.length > 0"
              cdkDropList
              id="members-list"
              [cdkDropListData]="members"
              [cdkDropListConnectedTo]="getTaskDropListIds()"
            >
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

              <!-- Individual Members - DRAGGABLE -->
              <div
                *ngFor="let member of members"
                class="member-item-wrapper"
                cdkDrag
                [cdkDragData]="member"
              >
                <div
                  class="member-item"
                  [class.active]="selectedMemberId === member.id"
                >
                  <div class="member-drag-handle">
                    <i class="fa fa-grip-vertical"></i>
                  </div>
                  <div
                    class="member-avatar"
                    [style.background-color]="member.avatar"
                  >
                    {{ member.firstName.charAt(0) + member.lastName.charAt(0) }}
                  </div>
                  <div class="member-info" (click)="selectMember(member)">
                    <span class="member-name"
                      >{{ member.firstName }} {{ member.lastName }}</span
                    >
                  </div>
                </div>
              </div>
            </div>
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
              <!-- Incomplete Tasks - NOW DROP ZONES -->
              <div class="tasks-list">
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

                <!-- Task Items - DROP ZONES FOR MEMBERS -->
                <div
                  *ngFor="let task of getIncompleteTasks()"
                  cdkDropList
                  [id]="'task-' + task.id"
                  [cdkDropListData]="[task]"
                  (cdkDropListDropped)="onMemberDroppedOnTask($event, task)"
                  (cdkDropListEntered)="onDragEntered(task)"
                  (cdkDropListExited)="onDragExited()"
                  class="task-card"
                  [class.drag-over]="dragOverTaskId === task.id"
                >
                  <div class="task-status-icon">
                    <i class="fa fa-bars"></i>
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
                    <!-- <button
                      class="btn btn-unassign"
                      (click)="unassignTask(task.id); $event.stopPropagation()"
                      title="Unassign member"
                    >
                      <i class="fa fa-times"></i>
                    </button> -->
                  </div>

                  <!-- Unassigned placeholder -->
                  <div
                    *ngIf="!task.assignedMember"
                    class="task-assignee unassigned"
                  >
                    <i class="fa fa-user-plus"></i>
                    <span>Drag member here</span>
                  </div>

                  <!-- Delete Button -->
                  <button
                    class="btn btn-task-delete"
                    (click)="confirmDeleteTask(task)"
                    [disabled]="isLoading"
                    title="Delete task"
                  >
                    <i class="fa fa-trash"></i>
                  </button>
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
                    <div class="task-status-icon disabled">
                      <i class="fa fa-lock"></i>
                    </div>
                    <div class="task-content">
                      <!-- <input
                        class="task-checkbox"
                        type="checkbox"
                        [checked]="true"
                        (change)="completeTask(task.id)"
                        (click)="$event.stopPropagation()"
                      /> -->
                      <span class="task-text completed">{{
                        task.subject
                      }}</span>
                    </div>
                    <div *ngIf="task.assignedMember" class="task-assignee">
                      <div
                        class="assignee-avatar"
                        [style.background-color]="task.assignedMember.avatar"
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
                    <button
                      class="btn btn-task-delete"
                      (click)="confirmDeleteTask(task)"
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
                  (change)="validateEmail()"
                  required
                />
                <span *ngIf="emailError" class="email-error-message">
                  {{ emailError }}
                </span>
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
                !memberForm.form.valid ||
                !newMember.avatar ||
                isLoading ||
                !isEmailValid
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
        background: #f0f9ff;
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
        background: #f0fdfb;
      }

      .panel-title {
        font-size: 18px;
        font-weight: 800;
        color: #1f2937;
        margin: 0;
        display: flex;
        align-items: center;
        gap: 8px;
        font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
        letter-spacing: 0.4px;
      }

      .panel-title i {
        color: #06b6d4;
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
        gap: 10px;
        width: 100%;
        padding: 14px 20px;
        background: #06b6d4;
        color: white;
        border: none;
        border-radius: 8px;
        font-weight: 700;
        font-size: 15px;
        cursor: pointer;
        transition: all 0.3s ease;
        box-shadow: 0 4px 12px rgba(6, 182, 212, 0.3);
        font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
        letter-spacing: 0.3px;
      }

      .btn-add-member:hover:not(:disabled) {
        transform: translateY(-2px);
        box-shadow: 0 6px 16px rgba(6, 182, 212, 0.4);
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
        border-top-color: #0891b2;
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

      /* Member Item Wrapper for Drag */
      .member-item-wrapper {
        cursor: grab;
        user-select: none;
        touch-action: none;
      }

      .member-item-wrapper:active {
        cursor: grabbing;
      }

      .member-item {
        display: flex;
        align-items: center;
        gap: 14px;
        padding: 16px 18px;
        background: white;
        border: 1px solid #e5e7eb;
        border-radius: 8px;
        transition: all 0.2s ease;
        font-size: 15px;
        font-weight: 500;
        color: #374151;
        text-align: left;
        width: 100%;
        pointer-events: auto;
      }

      .member-item:hover {
        background: #f0f9ff;
        border-color: #d1d5db;
      }

      .member-item.active {
        background: #f0fdfb;
        border-color: #06b6d4;
        color: #1f2937;
      }

      .all-tasks-item {
        width: 100%;
      }

      .all-tasks-item .member-icon {
        width: 36px;
        height: 36px;
        background: #06b6d4;
        border-radius: 6px;
        display: flex;
        align-items: center;
        justify-content: center;
        color: white;
        font-size: 14px;
        flex-shrink: 0;
      }

      .member-drag-handle {
        color: #9ca3af;
        font-size: 14px;
        flex-shrink: 0;
        transition: color 0.2s ease;
        padding: 4px;
        pointer-events: none;
      }

      .member-item-wrapper:hover .member-drag-handle {
        color: #06b6d4;
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
        flex: 1;
      }

      .member-name {
        font-weight: 600;
        color: inherit;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
      }

      /* ============ MAIN PANEL ============ */
      .main-panel {
        display: flex;
        flex-direction: column;
        height: 100%;
        background: #f0f9ff;
      }

      .panel-header-main {
        background: white;
        border-bottom: 1px solid #e5e7eb;
        padding: 24px 40px;
        box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
      }

      .header-content {
        display: flex;
        justify-content: space-between;
        align-items: center;
      }

      .section-title {
        font-size: 22px;
        font-weight: 800;
        color: #1f2937;
        margin: 0;
        display: flex;
        align-items: center;
        gap: 10px;
        font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
        letter-spacing: 0.4px;
      }

      .section-title i {
        color: #06b6d4;
        font-size: 22px;
      }

      .section-subtitle {
        font-size: 13px;
        color: #9ca3af;
        margin: 6px 0 0 32px;
      }

      .panel-content {
        flex: 1;
        overflow-y: auto;
        padding: 40px;
      }

      /* Create Task Section */
      .create-task-section {
        margin-bottom: 28px;
      }

      .input-wrapper {
        display: flex;
        align-items: center;
        gap: 0;
        background: white;
        border: 1px solid #e5e7eb;
        border-radius: 10px;
        padding: 0 18px;
        transition: all 0.3s ease;
        box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
      }

      .input-wrapper:focus-within {
        border-color: #06b6d4;
        box-shadow: 0 4px 12px rgba(6, 182, 212, 0.15);
      }

      .input-icon {
        color: #d1d5db;
        margin-right: 8px;
        font-size: 16px;
      }

      .task-input {
        flex: 1;
        border: none;
        padding: 16px 0;
        font-size: 16px;
        color: #1f2937;
        background: transparent;
        outline: none;
        font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
        font-weight: 500;
      }

      .task-input::placeholder {
        color: #9ca3af;
      }

      .btn-create-task {
        background: #06b6d4;
        color: white;
        border: none;
        padding: 12px 20px;
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
        box-shadow: 0 4px 12px rgba(6, 182, 212, 0.3);
      }

      .btn-create-task:disabled {
        opacity: 0.5;
        cursor: not-allowed;
      }

      /* Tasks Section */
      .tasks-section {
        display: flex;
        flex-direction: column;
        gap: 20px;
      }

      .tasks-list {
        display: flex;
        flex-direction: column;
        gap: 16px;
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
        font-size: 20px;
        font-weight: 800;
        color: #6b7280;
        margin: 0 0 8px 0;
        font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
        letter-spacing: 0.3px;
      }

      .empty-state p {
        font-size: 15px;
        margin: 0;
        font-weight: 500;
        color: #9ca3af;
      }

      /* Task Cards - NOW DROP ZONES */
      .task-card {
        display: flex;
        align-items: center;
        gap: 16px;
        padding: 18px 20px;
        background: white;
        border: 1px solid #e5e7eb;
        border-radius: 8px;
        transition: all 0.2s ease;
        min-height: 70px;
      }

      .task-card:hover {
        background: #f9fafb;
        border-color: #d1d5db;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
      }

      .task-card.drag-over {
        background: #cffafe;
        border: 2px dashed #06b6d4;
        box-shadow: 0 4px 16px rgba(6, 182, 212, 0.2);
        transform: scale(1.02);
      }

      .task-card.task-completed {
        background: #f9fafb;
        opacity: 0.7;
      }

      .task-card.task-completed:hover {
        transform: none;
        box-shadow: none;
      }

      .task-status-icon {
        color: #d1d5db;
        font-size: 14px;
        flex-shrink: 0;
        transition: color 0.2s ease;
      }

      .task-status-icon.disabled {
        color: #9ca3af;
      }

      .task-card:hover .task-status-icon {
        color: #9ca3af;
      }

      .task-content {
        display: flex;
        align-items: center;
        gap: 12px;
        flex: 1;
        min-width: 0;
      }

      .task-checkbox {
        width: 20px;
        height: 20px;
        cursor: pointer;
        accent-color: #06b6d4;
        flex-shrink: 0;
      }

      .task-text {
        font-size: 15px;
        color: #1f2937;
        font-weight: 600;
      }

      .task-text.completed {
        text-decoration: line-through;
        color: #9ca3af;
      }

      .task-assignee {
        display: flex;
        align-items: center;
        gap: 8px;
        padding: 6px 14px;
        background: #f3f4f6;
        border-radius: 6px;
        font-size: 13px;
        color: #6b7280;
      }

      .task-assignee.unassigned {
        background: #fef3c7;
        color: #92400e;
        border: 1px dashed #fbbf24;
      }

      .task-assignee.unassigned i {
        color: #f59e0b;
      }

      .assignee-avatar {
        width: 28px;
        height: 28px;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        color: white;
        font-weight: 600;
        font-size: 11px;
      }

      .assignee-name {
        font-weight: 500;
      }

      .btn-unassign {
        background: none;
        border: none;
        color: #9ca3af;
        cursor: pointer;
        padding: 2px 6px;
        border-radius: 4px;
        transition: all 0.2s ease;
        font-size: 12px;
        margin-left: 4px;
      }

      .btn-unassign:hover {
        background: #fee2e2;
        color: #dc2626;
      }

      .btn-task-delete {
        background: none;
        border: none;
        color: #9ca3af;
        cursor: pointer;
        padding: 6px 10px;
        border-radius: 4px;
        transition: all 0.2s ease;
        font-size: 15px;
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
        margin-top: 20px;
        padding-top: 20px;
        border-top: 1px solid #e5e7eb;
      }

      .completed-header {
        display: flex;
        align-items: center;
        gap: 10px;
        font-size: 14px;
        font-weight: 600;
        color: #9ca3af;
        margin-bottom: 16px;
        text-transform: uppercase;
        letter-spacing: 0.5px;
      }

      .completed-header i {
        color: #10b981;
      }

      .completed-list {
        display: flex;
        flex-direction: column;
        gap: 12px;
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
        font-size: 20px;
        font-weight: 800;
        color: #1f2937;
        margin: 0;
        font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
        letter-spacing: 0.3px;
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
        gap: 20px;
      }

      .form-group {
        display: flex;
        flex-direction: column;
        gap: 10px;
        margin-bottom: 20px;
      }

      .form-group:last-child {
        margin-bottom: 0;
      }

      .form-label {
        font-size: 13px;
        font-weight: 700;
        color: #374151;
        text-transform: uppercase;
        letter-spacing: 0.6px;
        font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
      }

      .form-input {
        padding: 12px 14px;
        border: 1px solid #e5e7eb;
        border-radius: 6px;
        font-size: 15px;
        color: #1f2937;
        transition: all 0.2s ease;
        font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
        font-weight: 500;
      }

      .form-input:focus {
        outline: none;
        border-color: #06b6d4;
        box-shadow: 0 0 0 3px rgba(6, 182, 212, 0.1);
      }

      .form-input::placeholder {
        color: #d1d5db;
      }

      /* Email Error Message */
      .email-error-message {
        font-size: 13px;
        color: #dc2626;
        margin-top: -8px;
        font-weight: 500;
      }

      /* Modal Footer */
      .modal-footer {
        padding: 20px 32px;
        background: #f9fafb;
        border-top: 1px solid #e5e7eb;
        display: flex;
        justify-content: flex-end;
        gap: 16px;
      }

      /* Buttons */
      .btn {
        padding: 10px 16px;
        border: none;
        border-radius: 6px;
        font-size: 15px;
        font-weight: 700;
        cursor: pointer;
        transition: all 0.3s ease;
        display: inline-flex;
        align-items: center;
        justify-content: center;
        gap: 6px;
        font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
        letter-spacing: 0.3px;
      }

      .btn-primary {
        background: linear-gradient(135deg, #06b6d4 0%, #0891b2 100%);
        color: white;
        box-shadow: 0 4px 12px rgba(6, 182, 212, 0.3);
      }

      .btn-primary:hover:not(:disabled) {
        transform: translateY(-2px);
        box-shadow: 0 6px 16px rgba(6, 182, 212, 0.4);
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
        box-shadow: 0 8px 16px rgba(6, 182, 212, 0.3);
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
  dragOverTaskId: string | null = null;

  showAddMemberModal = false;
  newMember = this.initializeNewMember();
  emailError: string | null = null;
  isEmailValid = false;

  avatarColors = [
    '#FF6B6B',
    '#FFA500',
    '#FFD93D',
    '#6BCB77',
    '#4D96FF',
    '#9D84B7',
    '#FF9FF3',
    '#A8A8A8',
  ];

  private destroy$ = new Subject<void>();

  constructor(
    private memberService: MemberManagerService,
    private taskService: TaskManagerService,
    private confirmationService: ConfirmationService,
    private messageService: MessageService
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
      this.showToast(
        'success',
        'Task Created',
        'New task has been created successfully'
      );
      this.newTaskSubject = '';
    }
  }

  completeTask(taskId: string): void {
    this.taskService.completeTask(taskId);
    this.showToast(
      'success',
      'Task Updated',
      'Task status has been updated successfully'
    );
  }

  unassignTask(taskId: string): void {
    this.taskService.assignTaskToMember(taskId, '');
    this.showToast(
      'info',
      'Task Unassigned',
      'Task has been unassigned from member'
    );
  }

  confirmDeleteTask(task: Task): void {
    this.confirmationService.confirm({
      message: `Are you sure you want to delete the task "${task.subject}"?`,
      header: 'Delete Task Confirmation',
      icon: 'pi pi-exclamation-triangle',
      acceptLabel: 'Yes, Delete',
      rejectLabel: 'Cancel',
      acceptButtonStyleClass: 'p-button-danger',
      rejectButtonStyleClass: 'p-button-text',
      accept: () => {
        this.deleteTask(task.id);
      },
    });
  }

  deleteTask(taskId: string): void {
    this.taskService.deleteTask(taskId);
    this.showToast(
      'success',
      'Task Deleted',
      'Task has been deleted successfully'
    );
  }

  selectAvatarColor(color: string): void {
    this.newMember.avatar = color;
  }

  onDragEntered(task: Task): void {
    this.dragOverTaskId = task.id;
  }

  onDragExited(): void {
    this.dragOverTaskId = null;
  }

  onMemberDroppedOnTask(event: CdkDragDrop<Task[]>, task: Task): void {
  if (task.isComplete) {
    this.showToast(
      'warn',
      'Cannot Assign',
      'Cannot assign members to completed tasks'
    );
    this.dragOverTaskId = null;
    return;
  }

  const member: Member = event.item.data;
  if (!member) return;

  task.assignedMember = member;

  this.tasks = [...this.tasks];

  this.taskService.assignTaskToMember(task.id, member.id);

  this.showToast(
    'success',
    'Member Assigned',
    `${member.firstName} ${member.lastName} assigned to "${task.subject}"`
  );

  this.dragOverTaskId = null;
}


  getTaskDropListIds(): string[] {
    return this.getIncompleteTasks().map((task) => `task-${task.id}`);
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

  validateEmail(): void {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const email = this.newMember.emailAddress.trim();

    if (!email) {
      this.emailError = 'Email address is required';
      this.isEmailValid = false;
    } else if (!emailRegex.test(email)) {
      this.emailError = 'Please enter a valid email address';
      this.isEmailValid = false;
    } else {
      this.emailError = null;
      this.isEmailValid = true;
    }
  }

  startAddMember(): void {
    this.showAddMemberModal = true;
    this.newMember = this.initializeNewMember();
    this.emailError = null;
    this.isEmailValid = false;
  }

  cancelAddMember(): void {
    this.showAddMemberModal = false;
    this.emailError = null;
    this.isEmailValid = false;
  }

  saveNewMember(): void {
    if (
      this.newMember.firstName &&
      this.newMember.lastName &&
      this.newMember.emailAddress &&
      this.newMember.avatar &&
      this.isEmailValid
    ) {
      this.memberService.createMember(this.newMember);
      this.showToast(
        'success',
        'Member Added',
        'Family member has been added successfully'
      );
      this.showAddMemberModal = false;
      this.emailError = null;
      this.isEmailValid = false;
    }
  }

  clearError(): void {
    this.error = null;
  }

  private showToast(
    severity: 'success' | 'info' | 'warn' | 'error',
    summary: string,
    detail: string
  ): void {
    this.messageService.add({
      severity,
      summary,
      detail,
      life: 3000,
    });
  }
}
