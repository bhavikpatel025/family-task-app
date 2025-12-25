import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { tap, catchError } from 'rxjs/operators';
import { of } from 'rxjs';
import { Task, CreateTask, UpdateTask } from '../models/task.model';
import { ApiService } from './api.service';

@Injectable({
  providedIn: 'root'
})
export class TaskManagerService {
  private tasksSubject = new BehaviorSubject<Task[]>([]);
  private selectedMemberIdSubject = new BehaviorSubject<string | null>(null);
  private loadingSubject = new BehaviorSubject<boolean>(false);
  private errorSubject = new BehaviorSubject<string | null>(null);
  
  tasks$: Observable<Task[]> = this.tasksSubject.asObservable();
  selectedMemberId$: Observable<string | null> = this.selectedMemberIdSubject.asObservable();
  loading$: Observable<boolean> = this.loadingSubject.asObservable();
  error$: Observable<string | null> = this.errorSubject.asObservable();

  constructor(private apiService: ApiService) {}

  loadTasks(): void {
    this.loadingSubject.next(true);
    this.errorSubject.next(null);
    
    this.apiService.getTasks()
      .pipe(
        tap(tasks => {
          this.tasksSubject.next(tasks);
          this.loadingSubject.next(false);
        }),
        catchError(error => {
          this.errorSubject.next(error.message);
          this.loadingSubject.next(false);
          return of([]);
        })
      )
      .subscribe();
  }

  loadTasksForMember(memberId: string): void {
    this.selectedMemberIdSubject.next(memberId);
    this.loadingSubject.next(true);
    this.errorSubject.next(null);
    
    this.apiService.getTasksByMember(memberId)
      .pipe(
        tap(tasks => {
          this.tasksSubject.next(tasks);
          this.loadingSubject.next(false);
        }),
        catchError(error => {
          this.errorSubject.next(error.message);
          this.loadingSubject.next(false);
          return of([]);
        })
      )
      .subscribe();
  }

  createTask(subject: string): void {
    if (!subject.trim()) return;
    
    this.loadingSubject.next(true);
    this.errorSubject.next(null);
    
    const task: CreateTask = { subject };

    this.apiService.createTask(task)
      .pipe(
        tap(newTask => {
          const currentTasks = this.tasksSubject.value;
          this.tasksSubject.next([...currentTasks, newTask]);
          this.loadingSubject.next(false);
        }),
        catchError(error => {
          this.errorSubject.next(error.message);
          this.loadingSubject.next(false);
          return of(null);
        })
      )
      .subscribe();
  }

  createTaskForMember(subject: string, memberId: string): void {
    if (!subject.trim() || !memberId) return;
    
    this.loadingSubject.next(true);
    this.errorSubject.next(null);
    
    this.apiService.createTaskForMember(memberId, { subject })
      .pipe(
        tap(newTask => {
          const currentTasks = this.tasksSubject.value;
          this.tasksSubject.next([...currentTasks, newTask]);
          this.loadingSubject.next(false);
        }),
        catchError(error => {
          this.errorSubject.next(error.message);
          this.loadingSubject.next(false);
          return of(null);
        })
      )
      .subscribe();
  }

  completeTask(taskId: string): void {
    this.loadingSubject.next(true);
    this.errorSubject.next(null);
    
    this.apiService.completeTask(taskId)
      .pipe(
        tap(() => {
          const currentTasks = this.tasksSubject.value;
          const updatedTasks = currentTasks.map(task => 
            task.id === taskId ? { ...task, isComplete: true } : task
          );
          this.tasksSubject.next(updatedTasks);
          this.loadingSubject.next(false);
        }),
        catchError(error => {
          this.errorSubject.next(error.message);
          this.loadingSubject.next(false);
          return of(null);
        })
      )
      .subscribe();
  }

  assignTaskToMember(taskId: string, memberId: string): void {
    if (!taskId || !memberId) return;
    
    this.loadingSubject.next(true);
    this.errorSubject.next(null);
    
    this.apiService.assignTaskToMember(taskId, memberId)
      .pipe(
        tap(() => {
          const currentTasks = this.tasksSubject.value;
          const updatedTasks = currentTasks.map(task => 
            task.id === taskId ? { ...task, assignedMemberId: memberId } : task
          );
          this.tasksSubject.next(updatedTasks);
          this.loadingSubject.next(false);
        }),
        catchError(error => {
          this.errorSubject.next(error.message);
          this.loadingSubject.next(false);
          return of(null);
        })
      )
      .subscribe();
  }

  updateTask(taskId: string, updateData: Partial<Task>): void {
    if (!taskId) return;
    
    this.loadingSubject.next(true);
    this.errorSubject.next(null);
    
    const currentTask = this.tasksSubject.value.find(task => task.id === taskId);
    if (!currentTask) return;
    
    const cleanData: UpdateTask = {
      subject: updateData.subject ?? currentTask.subject,
      isComplete: updateData.isComplete ?? currentTask.isComplete,
      assignedMemberId: updateData.assignedMemberId ?? currentTask.assignedMemberId
    };

    this.apiService.updateTask(taskId, cleanData)
      .pipe(
        tap(() => {
          const currentTasks = this.tasksSubject.value;
          const updatedTasks = currentTasks.map(task =>
            task.id === taskId ? { ...task, ...cleanData } : task
          );
          this.tasksSubject.next(updatedTasks);
          this.loadingSubject.next(false);
        }),
        catchError(error => {
          this.errorSubject.next(error.message);
          this.loadingSubject.next(false);
          return of(null);
        })
      )
      .subscribe();
  }
// ...existing code...
  deleteTask(taskId: string): void {
    if (!taskId) return;
    
    this.loadingSubject.next(true);
    this.errorSubject.next(null);
    
    this.apiService.deleteTask(taskId)
      .pipe(
        tap(() => {
          const currentTasks = this.tasksSubject.value;
          const updatedTasks = currentTasks.filter(task => task.id !== taskId);
          this.tasksSubject.next(updatedTasks);
          this.loadingSubject.next(false);
        }),
        catchError(error => {
          this.errorSubject.next(error.message);
          this.loadingSubject.next(false);
          return of(null);
        })
      )
      .subscribe();
  }

  getSelectedMemberId(): string | null {
    return this.selectedMemberIdSubject.value;
  }

  clearMemberSelection(): void {
    this.selectedMemberIdSubject.next(null);
    this.loadTasks();
  }
}