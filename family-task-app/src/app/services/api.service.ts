import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { Member, CreateMember, UpdateMember } from '../models/member.model';
import { Task, CreateTask, UpdateTask } from '../models/task.model';

@Injectable({
  providedIn: 'root'
})
export class ApiService {
  private apiUrl = 'https://localhost:7059/api';

  constructor(private http: HttpClient) {}

  // Error handler
  private handleError(error: HttpErrorResponse) {
    let errorMessage = 'An error occurred';
    
    if (error.error instanceof ErrorEvent) {
      // Client-side error
      errorMessage = `Error: ${error.error.message}`;
    } else {
      // Server-side error
      errorMessage = `Error Code: ${error.status}\nMessage: ${error.message}`;
    }
    
    console.error(errorMessage);
    return throwError(() => new Error(errorMessage));
  }

  // MEMBER APIs 
  getMembers(): Observable<Member[]> {
    return this.http.get<Member[]>(`${this.apiUrl}/members`)
      .pipe(catchError(this.handleError));
  }

  getMember(id: string): Observable<Member> {
    return this.http.get<Member>(`${this.apiUrl}/members/${id}`)
      .pipe(catchError(this.handleError));
  }

  createMember(member: CreateMember): Observable<Member> {
    return this.http.post<Member>(`${this.apiUrl}/members`, member)
      .pipe(catchError(this.handleError));
  }

  updateMember(id: string, member: UpdateMember): Observable<void> {
    return this.http.put<void>(`${this.apiUrl}/members/${id}`, member)
      .pipe(catchError(this.handleError));
  }

  deleteMember(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/members/${id}`)
      .pipe(catchError(this.handleError));
  }

  // TASK APIs 
  getTasks(): Observable<Task[]> {
    return this.http.get<Task[]>(`${this.apiUrl}/tasks`)
      .pipe(catchError(this.handleError));
  }

  getTasksByMember(memberId: string): Observable<Task[]> {
    return this.http.get<Task[]>(`${this.apiUrl}/tasks/member/${memberId}`)
      .pipe(catchError(this.handleError));
  }

  getTask(id: string): Observable<Task> {
    return this.http.get<Task>(`${this.apiUrl}/tasks/${id}`)
      .pipe(catchError(this.handleError));
  }

  createTask(task: CreateTask): Observable<Task> {
    return this.http.post<Task>(`${this.apiUrl}/tasks`, task)
      .pipe(catchError(this.handleError));
  }

  createTaskForMember(memberId: string, task: CreateTask): Observable<Task> {
    return this.http.post<Task>(`${this.apiUrl}/tasks/member/${memberId}`, task)
      .pipe(catchError(this.handleError));
  }

  updateTask(id: string, task: UpdateTask): Observable<void> {
    return this.http.put<void>(`${this.apiUrl}/tasks/${id}`, task)
      .pipe(catchError(this.handleError));
  }

  deleteTask(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/tasks/${id}`)
      .pipe(catchError(this.handleError));
  }

  assignTaskToMember(taskId: string, memberId: string): Observable<void> {
    return this.http.post<void>(`${this.apiUrl}/tasks/${taskId}/assign/${memberId}`, {})
      .pipe(catchError(this.handleError));
  }

  completeTask(taskId: string): Observable<void> {
    return this.http.post<void>(`${this.apiUrl}/tasks/${taskId}/complete`, {})
      .pipe(catchError(this.handleError));
  }

  completeTaskForMember(taskId: string, memberId: string): Observable<void> {
    return this.http.post<void>(`${this.apiUrl}/tasks/${taskId}/member/${memberId}/complete`, {})
      .pipe(catchError(this.handleError));
  }
}