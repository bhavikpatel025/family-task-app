import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { TaskManagerService } from '../../services/task-manager.service';
import { MemberManagerService } from '../../services/member-manager.service';
import { Task } from '../../models/task.model';
import { Member } from '../../models/member.model';

// Import PrimeNG modules
import { ConfirmationService, MessageService } from 'primeng/api';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { ToastModule } from 'primeng/toast';

import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

@Component({
  selector: 'app-task-manager',
  standalone: true,
  imports: [
    CommonModule, 
    FormsModule, 
    RouterModule,
    ConfirmDialogModule,
    ToastModule,
  ],
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

    <div class="task-manager-container">
      <!-- Header -->
      <div class="manager-header">
        <div class="header-content">
          <div>
            <nav class="breadcrumb-nav">
              <a routerLink="/" class="breadcrumb-link">
                <i class="fa fa-home"></i> Family Manager
              </a>
              <span class="breadcrumb-separator">
                <i class="fa fa-chevron-right"></i>
              </span>
              <span class="breadcrumb-current">Task Manager</span>
            </nav>
            
            <p class="page-subtitle">Manage and track all family tasks in one place</p>
          </div>
        </div>
      </div>

      <div class="manager-content">
        <!-- Statistics Cards -->
        <div class="stats-grid">
          <div class="stat-card stat-total">
            <div class="stat-icon">
              <i class="fa fa-list-check"></i>
            </div>
            <div class="stat-info">
              <p class="stat-label">Total Tasks</p>
              <h3 class="stat-value">{{ totalTasks }}</h3>
            </div>
          </div>

          <div class="stat-card stat-completed">
            <div class="stat-icon">
              <i class="fa fa-check-circle"></i>
            </div>
            <div class="stat-info">
              <p class="stat-label">Completed</p>
              <h3 class="stat-value">{{ completedTasks }}</h3>
            </div>
          </div>

          <div class="stat-card stat-pending">
            <div class="stat-icon">
              <i class="fa fa-clock-o"></i>
            </div>
            <div class="stat-info">
              <p class="stat-label">Pending</p>
              <h3 class="stat-value">{{ pendingTasks }}</h3>
            </div>
          </div>

          <div class="stat-card stat-unassigned">
            <div class="stat-icon">
              <i class="fa fa-user-slash"></i>
            </div>
            <div class="stat-info">
              <p class="stat-label">Unassigned</p>
              <h3 class="stat-value">{{ unassignedTasks }}</h3>
            </div>
          </div>
        </div>

        <!-- Filters Section -->
        <div class="filters-panel">
          <div class="filters-header">
            <h3 class="filters-title">
              <i class="fa fa-filter"></i> Filters
            </h3>
            <button class="btn-filter-toggle" 
                    (click)="toggleFilterCompleted()"
                    [class.active]="filterCompleted">
              <i class="fa" [class.fa-eye]="!filterCompleted" [class.fa-eye-slash]="filterCompleted"></i>
              {{ filterCompleted ? 'Show All Tasks' : 'Show Completed Only' }}
            </button>
          </div>

          <div class="filters-content">
            <div class="filter-group">
              <label for="searchInput" class="filter-label">Search Tasks</label>
              <div class="filter-input-wrapper">
                <i class="fa fa-search filter-input-icon"></i>
                <input type="text" 
                       id="searchInput"
                       class="filter-input" 
                       placeholder="Search by task name..." 
                       [(ngModel)]="filterText"
                       (input)="applyFilter()">
                <button *ngIf="filterText" 
                        class="filter-clear" 
                        (click)="filterText = ''; applyFilter()"
                        type="button">
                  <i class="fa fa-times"></i>
                </button>
              </div>
            </div>

            <div class="filter-group">
              <label for="memberSelect" class="filter-label">Assigned Member</label>
              <div class="filter-select-wrapper">
                <select id="memberSelect" 
                        class="filter-select" 
                        [(ngModel)]="filterMemberId" 
                        (change)="applyFilter()">
                  <option value="">All Members</option>
                  <option *ngFor="let member of members" [value]="member.id">
                    {{ member.firstName }} {{ member.lastName }}
                  </option>
                </select>
                <i class="fa fa-chevron-down filter-select-icon"></i>
              </div>
            </div>

            <button class="btn-refresh" (click)="loadAllTasks()">
              <i class="fa fa-refresh"></i>
              <span>Refresh</span>
            </button>
          </div>
        </div>

        <!-- Tasks Table -->
        <div class="tasks-panel">
          <div class="table-wrapper">
            <!-- Empty State -->
            <div *ngIf="filteredTasks.length === 0" class="empty-state">
              <div class="empty-icon">
                <i class="fa fa-inbox"></i>
              </div>
              <h4>No Tasks Found</h4>
              <p>{{ filterText || filterMemberId || filterCompleted ? 'Try adjusting your filters.' : 'Create your first task in Family Manager.' }}</p>
            </div>

            <!-- Tasks Table -->
            <table *ngIf="filteredTasks.length > 0" class="tasks-table">
              <thead>
                <tr>
                  <th class="col-checkbox"></th>
                  <th class="col-task">Task</th>
                  <th class="col-assignee">Assigned To</th>
                  <th class="col-status">Status</th>
                  <th class="col-actions">Actions</th>
                </tr>
              </thead>
              <tbody>
                <tr *ngFor="let task of filteredTasks" 
                    class="task-row"
                    [class.task-row-completed]="task.isComplete">
                  <td class="col-checkbox">
                    <input type="checkbox" 
                           class="task-checkbox" 
                           [checked]="task.isComplete"
                           (change)="toggleTaskComplete(task)">
                  </td>
                  <td class="col-task">
                    <span class="task-name" [class.text-completed]="task.isComplete">
                      {{ task.subject }}
                    </span>
                  </td>
                  <td class="col-assignee">
                    <div *ngIf="task.assignedMember; else unassignedBadge" class="assignee-badge">
                      <div class="assignee-avatar"
                           [style.background-color]="task.assignedMember.avatar">
                        {{ task.assignedMember.firstName.charAt(0) + task.assignedMember.lastName.charAt(0) }}
                      </div>
                      <span class="assignee-name">
                        {{ task.assignedMember.firstName }} {{ task.assignedMember.lastName }}
                      </span>
                    </div>
                    <ng-template #unassignedBadge>
                      <span class="badge-unassigned">Unassigned</span>
                    </ng-template>
                  </td>
                  <td class="col-status">
                    <span class="status-badge" [class.status-completed]="task.isComplete" [class.status-pending]="!task.isComplete">
                      <i class="fa" [class.fa-check]="task.isComplete" [class.fa-hourglass-o]="!task.isComplete"></i>
                      {{ task.isComplete ? 'Completed' : 'Pending' }}
                    </span>
                  </td>
                  <td class="col-actions">
                    <div class="action-buttons">
                      <!-- <button class="action-btn action-toggle" 
                              (click)="toggleTaskComplete(task)"
                              [title]="task.isComplete ? 'Mark as Incomplete' : 'Mark as Complete'"
                              type="button">
                        <i class="fa" [class.fa-check-square]="!task.isComplete" [class.fa-square]="task.isComplete"></i>
                      </button> -->
                      <button class="action-btn action-delete" 
                              (click)="confirmDeleteTask(task)"
                              [title]="task.isComplete ? 'Cannot delete completed task' : 'Delete task'"
                              type="button">
                        <i class="fa fa-trash"></i>
                      </button>
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .task-manager-container {
      min-height: 100%;
      background: #f0f9ff;
    }

    /* ============ HEADER ============ */
    .manager-header {
      background: #06b6d4;
      color: white;
      padding: 48px 40px;
      box-shadow: 0 4px 20px rgba(6, 182, 212, 0.15);
    }

    .header-content {
      max-width: 1400px;
      margin: 0 auto;
    }

    .breadcrumb-nav {
      display: flex;
      align-items: center;
      gap: 16px;
      margin-bottom: 20px;
      font-size: 14px;
      font-weight: 500;
    }

    .breadcrumb-link {
      color: rgba(255, 255, 255, 0.85);
      text-decoration: none;
      display: flex;
      align-items: center;
      gap: 6px;
      transition: color 0.2s ease;
      font-weight: 600;
      font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
    }

    .breadcrumb-link:hover {
      color: white;
    }

    .breadcrumb-separator {
      color: rgba(255, 255, 255, 0.5);
      font-size: 12px;
    }

    .breadcrumb-current {
      color: rgba(255, 255, 255, 0.9);
    }

    .page-title {
      font-size: 28px;
      font-weight: 700;
      margin: 0 0 8px 0;
      display: flex;
      align-items: center;
      gap: 12px;
    }

    .page-subtitle {
      font-size: 17px;
      color: rgba(255, 255, 255, 0.85);
      margin: 0;
      font-weight: 600;
      font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
      letter-spacing: 0.3px;
    }

    /* ============ CONTENT ============ */
    .manager-content {
      max-width: 1400px;
      margin: 0 auto;
      padding: 40px;
    }

    /* Statistics Grid */
    .stats-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));
      gap: 28px;
      margin-bottom: 40px;
    }

    .stat-card {
      background: white;
      border-radius: 12px;
      padding: 28px;
      display: flex;
      align-items: center;
      gap: 20px;
      box-shadow: 0 1px 3px rgba(0, 0, 0, 0.08);
      border: 1px solid #e5e7eb;
      transition: all 0.3s ease;
    }

    .stat-card:hover {
      transform: translateY(-4px);
      box-shadow: 0 8px 16px rgba(0, 0, 0, 0.1);
    }

    .stat-icon {
      width: 56px;
      height: 56px;
      border-radius: 10px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 24px;
      color: white;
      flex-shrink: 0;
    }

    .stat-total .stat-icon {
      background: #06b6d4;
    }

    .stat-completed .stat-icon {
      background: linear-gradient(135deg, #10b981 0%, #059669 100%);
    }

    .stat-pending .stat-icon {
      background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%);
    }

    .stat-unassigned .stat-icon {
      background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%);
    }

    .stat-info {
      flex: 1;
    }

    .stat-label {
      font-size: 12px;
      font-weight: 700;
      color: #9ca3af;
      text-transform: uppercase;
      letter-spacing: 0.6px;
      margin: 0;
      font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
    }

    .stat-value {
      font-size: 32px;
      font-weight: 800;
      color: #1f2937;
      margin: 4px 0 0 0;
      font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
      letter-spacing: -0.5px;
    }

    /* Filters Panel */
    .filters-panel {
      background: white;
      border-radius: 12px;
      margin-bottom: 32px;
      box-shadow: 0 1px 3px rgba(0, 0, 0, 0.08);
      border: 1px solid #e5e7eb;
    }

    .filters-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 28px 32px;
      border-bottom: 1px solid #e5e7eb;
    }

    .filters-title {
      font-size: 16px;
      font-weight: 800;
      color: #1f2937;
      margin: 0;
      display: flex;
      align-items: center;
      gap: 8px;
      font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
      letter-spacing: 0.3px;
    }

    .filters-title i {
      color: #06b6d4;
    }

    .btn-filter-toggle {
      background: none;
      border: 1px solid #e5e7eb;
      color: #6b7280;
      padding: 8px 14px;
      border-radius: 6px;
      font-size: 14px;
      font-weight: 700;
      cursor: pointer;
      transition: all 0.2s ease;
      display: flex;
      align-items: center;
      gap: 6px;
      font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
      letter-spacing: 0.2px;
    }

    .btn-filter-toggle:hover {
      background: #f9fafb;
      border-color: #d1d5db;
    }

    .btn-filter-toggle.active {
      background: #06b6d4;
      color: white;
      border-color: transparent;
    }

    .filters-content {
      padding: 28px 32px;
      display: flex;
      gap: 20px;
      flex-wrap: wrap;
      align-items: flex-end;
    }

    .filter-group {
      flex: 1;
      min-width: 220px;
    }

    .filter-label {
      display: block;
      font-size: 13px;
      font-weight: 700;
      color: #374151;
      margin-bottom: 10px;
      text-transform: uppercase;
      letter-spacing: 0.6px;
      font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
    }

    /* Filter Input */
    .filter-input-wrapper {
      position: relative;
      display: flex;
      align-items: center;
    }

    .filter-input-icon {
      position: absolute;
      left: 14px;
      color: #d1d5db;
      font-size: 14px;
      pointer-events: none;
    }

    .filter-input {
      width: 100%;
      padding: 12px 40px 12px 40px;
      border: 1px solid #e5e7eb;
      border-radius: 6px;
      font-size: 15px;
      color: #1f2937;
      transition: all 0.2s ease;
      font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
      font-weight: 500;
    }

    .filter-input:focus {
      outline: none;
      border-color: #06b6d4;
      box-shadow: 0 0 0 3px rgba(6, 182, 212, 0.1);
    }

    .filter-input::placeholder {
      color: #d1d5db;
    }

    .filter-clear {
      position: absolute;
      right: 12px;
      background: none;
      border: none;
      color: #9ca3af;
      cursor: pointer;
      font-size: 14px;
      padding: 0;
      transition: color 0.2s ease;
    }

    .filter-clear:hover {
      color: #6b7280;
    }

    /* Filter Select */
    .filter-select-wrapper {
      position: relative;
      display: flex;
    }

    .filter-select {
      width: 100%;
      padding: 12px 40px 12px 14px;
      border: 1px solid #e5e7eb;
      border-radius: 6px;
      font-size: 15px;
      color: #1f2937;
      background: white;
      cursor: pointer;
      transition: all 0.2s ease;
      appearance: none;
      font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
      font-weight: 500;
    }

    .filter-select:focus {
      outline: none;
      border-color: #06b6d4;
      box-shadow: 0 0 0 3px rgba(6, 182, 212, 0.1);
    }

    .filter-select-icon {
      position: absolute;
      right: 12px;
      top: 50%;
      transform: translateY(-50%);
      color: #d1d5db;
      font-size: 12px;
      pointer-events: none;
    }

    .btn-refresh {
      background: #06b6d4;
      color: white;
      border: none;
      padding: 10px 16px;
      border-radius: 6px;
      font-size: 14px;
      font-weight: 700;
      cursor: pointer;
      transition: all 0.3s ease;
      display: flex;
      align-items: center;
      gap: 6px;
      height: 40px;
      font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
      letter-spacing: 0.3px;
    }

    .btn-refresh:hover {
      transform: translateY(-2px);
      box-shadow: 0 4px 12px rgba(6, 182, 212, 0.3);
    }

    /* Tasks Panel */
    .tasks-panel {
      background: white;
      border-radius: 12px;
      box-shadow: 0 1px 3px rgba(0, 0, 0, 0.08);
      border: 1px solid #e5e7eb;
      overflow: hidden;
    }

    .table-wrapper {
      overflow-x: auto;
    }

    /* Empty State */
    .empty-state {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 100px 50px;
      text-align: center;
      color: #9ca3af;
    }

    .empty-icon {
      font-size: 72px;
      color: #d1d5db;
      margin-bottom: 28px;
    }

    .empty-state h4 {
      font-size: 22px;
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

    /* Tasks Table */
    .tasks-table {
      width: 100%;
      border-collapse: collapse;
    }

    .tasks-table thead {
      background: #f9fafb;
      border-bottom: 2px solid #e5e7eb;
    }

    .tasks-table thead th {
      padding: 18px 20px;
      text-align: left;
      font-size: 12px;
      font-weight: 700;
      color: #6b7280;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }

    .col-checkbox {
      width: 60px;
    }

    .col-task {
      width: auto;
    }

    .col-assignee {
      width: 220px;
    }

    .col-status {
      width: 160px;
    }

    .col-actions {
      width: 140px;
      text-align: center;
    }

    /* Table Rows */
    .task-row {
      border-bottom: 1px solid #e5e7eb;
      transition: background-color 0.2s ease;
    }

    .task-row:hover {
      background-color: #f9fafb;
    }

    .task-row-completed {
      opacity: 0.7;
    }

    .task-row td {
      padding: 16px 20px;
      font-size: 15px;
      color: #1f2937;
    }

    .task-checkbox {
      width: 20px;
      height: 20px;
      cursor: pointer;
      accent-color: #06b6d4;
    }

    .task-name {
      font-weight: 600;
    }

    .task-name.text-completed {
      text-decoration: line-through;
      color: #9ca3af;
      font-weight: 500;
    }

    /* Assignee Badge */
    .assignee-badge {
      display: flex;
      align-items: center;
      gap: 10px;
    }

    .assignee-avatar {
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

    .assignee-name {
      font-weight: 700;
      font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
    }

    .badge-unassigned {
      display: inline-block;
      background: #e5e7eb;
      color: #6b7280;
      padding: 8px 14px;
      border-radius: 6px;
      font-size: 13px;
      font-weight: 700;
      font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
      letter-spacing: 0.2px;
    }

    /* Status Badge */
    .status-badge {
      display: inline-flex;
      align-items: center;
      gap: 8px;
      padding: 8px 14px;
      border-radius: 6px;
      font-size: 13px;
      font-weight: 700;
      font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
      letter-spacing: 0.2px;
    }

    .status-badge i {
      font-size: 12px;
    }

    .status-completed {
      background: #d1fae5;
      color: #065f46;
    }

    .status-pending {
      background: #fef3c7;
      color: #92400e;
    }

    /* Action Buttons */
    .action-buttons {
      display: flex;
      justify-content: center;
      gap: 12px;
    }

    .action-btn {
      background: none;
      border: 1px solid #e5e7eb;
      color: #6b7280;
      padding: 8px 12px;
      border-radius: 6px;
      cursor: pointer;
      font-size: 15px;
      transition: all 0.2s ease;
      display: inline-flex;
      align-items: center;
      justify-content: center;
    }

    .action-btn:hover:not(:disabled) {
      border-color: #d1d5db;
      background: #f9fafb;
    }

    .action-toggle:hover:not(:disabled) {
      color: #06b6d4;
      border-color: #06b6d4;
    }

    .action-delete:hover:not(:disabled) {
      color: #dc2626;
      border-color: #dc2626;
      background: #fef2f2;
    }

    .action-btn:disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }

    /* Responsive Design */
    @media (max-width: 1024px) {
      .manager-content {
        padding: 24px;
      }

      .stats-grid {
        grid-template-columns: repeat(2, 1fr);
      }

      .filters-content {
        flex-direction: column;
        align-items: stretch;
      }

      .filter-group {
        width: 100%;
      }

      .btn-refresh {
        width: 100%;
      }
    }

    @media (max-width: 768px) {
      .manager-header {
        padding: 24px 20px;
      }

      .manager-content {
        padding: 16px;
      }

      .stats-grid {
        grid-template-columns: repeat(2, 1fr);
        gap: 12px;
      }

      .stat-card {
        padding: 16px;
      }

      .stat-icon {
        width: 48px;
        height: 48px;
        font-size: 20px;
      }

      .stat-value {
        font-size: 24px;
      }

      .page-title {
        font-size: 22px;
      }

      .col-assignee,
      .col-status,
      .col-actions {
        width: auto;
        min-width: 0;
      }

      .task-row td {
        padding: 12px 8px;
        font-size: 13px;
      }

      .tasks-table thead th {
        padding: 12px 8px;
        font-size: 11px;
      }
    }

    @media (max-width: 480px) {
      .manager-header {
        padding: 16px 12px;
      }

      .page-title {
        font-size: 18px;
        gap: 6px;
      }

      .breadcrumb-nav {
        display: none;
      }

      .manager-content {
        padding: 12px;
      }

      .stats-grid {
        grid-template-columns: 1fr;
        gap: 10px;
      }

      .stat-card {
        padding: 12px;
        gap: 12px;
      }

      .stat-icon {
        width: 44px;
        height: 44px;
        font-size: 18px;
      }

      .stat-label {
        font-size: 11px;
      }

      .stat-value {
        font-size: 20px;
      }

      .filters-header {
        flex-direction: column;
        align-items: flex-start;
        gap: 12px;
      }

      .btn-filter-toggle {
        width: 100%;
        justify-content: center;
      }

      .filters-content {
        flex-direction: column;
      }

      .col-checkbox {
        width: 40px;
      }

      .col-assignee,
      .col-status {
        display: none;
      }

      .task-row td {
        padding: 10px 6px;
        font-size: 12px;
      }

      .action-buttons {
        gap: 4px;
      }

      .action-btn {
        padding: 4px 6px;
        font-size: 12px;
      }

      .table-wrapper {
        overflow-x: auto;
        -webkit-overflow-scrolling: touch;
      }
    }
  `]
})
export class TaskManagerComponent implements OnInit, OnDestroy {
  tasks: Task[] = [];
  filteredTasks: Task[] = [];
  members: Member[] = [];
  
  filterText = '';
  filterMemberId = '';
  filterCompleted = false;

  private destroy$ = new Subject<void>();
  
  get totalTasks(): number {
    return this.tasks.length;
  }
  
  get completedTasks(): number {
    return this.tasks.filter(t => t.isComplete).length;
  }
  
  get pendingTasks(): number {
    return this.tasks.filter(t => !t.isComplete).length;
  }
  
  get unassignedTasks(): number {
    return this.tasks.filter(t => !t.assignedMemberId || t.assignedMemberId === '').length;
  }

  constructor(
    private taskService: TaskManagerService,
    private memberService: MemberManagerService,
    private confirmationService: ConfirmationService,
    private messageService: MessageService
  ) {}

  ngOnInit(): void {
    this.loadAllTasks();
    this.memberService.members$
      .pipe(takeUntil(this.destroy$))
      .subscribe(members => {
        this.members = members;
      });
    this.memberService.loadMembers();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  loadAllTasks(): void {
    this.taskService.loadTasks();
    this.taskService.tasks$
      .pipe(takeUntil(this.destroy$))
      .subscribe(tasks => {
        this.tasks = tasks;
        this.applyFilter();
      });
  }

  toggleFilterCompleted(): void {
    this.filterCompleted = !this.filterCompleted;
    this.applyFilter();
  }

  applyFilter(): void {
    this.filteredTasks = this.tasks.filter(task => {
      if (this.filterText && !task.subject.toLowerCase().includes(this.filterText.toLowerCase())) {
        return false;
      }
      
      if (this.filterMemberId && task.assignedMemberId !== this.filterMemberId) {
        return false;
      }
      
      if (this.filterCompleted && !task.isComplete) {
        return false;
      }
      
      return true;
    });
  }

  toggleTaskComplete(task: Task): void {
    if (task.isComplete) {
      this.taskService.updateTask(task.id, { isComplete: false });
      this.showToast('success', 'Task Updated', 'Task has been marked as incomplete');
    } else {
      this.taskService.completeTask(task.id);
      this.showToast('success', 'Task Updated', 'Task has been marked as complete');
    }
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
      // reject: () => {
      //   this.showToast('info', 'Cancelled', 'Task deletion was cancelled');
      // },
    });
  }

  deleteTask(taskId: string): void {
    this.taskService.deleteTask(taskId);
    this.showToast('success', 'Task Deleted', 'Task has been deleted successfully');
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