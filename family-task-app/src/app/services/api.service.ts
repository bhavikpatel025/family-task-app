import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Member, CreateMember, UpdateMember } from '../models/member.model';
import { Task, CreateTask, UpdateTask } from '../models/task.model';

@Injectable({
  providedIn: 'root'
})
export class ApiService {
  private apiUrl = 'https://localhost:7059/api';

  constructor(private http: HttpClient) {}

  // Member APIs
  getMembers(): Observable<Member[]> {
    return this.http.get<Member[]>(`${this.apiUrl}/members`);
  }

  getMember(id: string): Observable<Member> {
    return this.http.get<Member>(`${this.apiUrl}/members/${id}`);
  }

  createMember(member: CreateMember): Observable<Member> {
    return this.http.post<Member>(`${this.apiUrl}/members`, member);
  }

  updateMember(id: string, member: UpdateMember): Observable<void> {
    return this.http.put<void>(`${this.apiUrl}/members/${id}`, member);
  }

  deleteMember(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/members/${id}`);
  }

  // Task APIs
  getTasks(): Observable<Task[]> {
    return this.http.get<Task[]>(`${this.apiUrl}/tasks`);
  }

  getTasksByMember(memberId: string): Observable<Task[]> {
    return this.http.get<Task[]>(`${this.apiUrl}/tasks/member/${memberId}`);
  }

  getTask(id: string): Observable<Task> {
    return this.http.get<Task>(`${this.apiUrl}/tasks/${id}`);
  }

  createTask(task: CreateTask): Observable<Task> {
    return this.http.post<Task>(`${this.apiUrl}/tasks`, task);
  }

  createTaskForMember(memberId: string, task: CreateTask): Observable<Task> {
    return this.http.post<Task>(`${this.apiUrl}/tasks/member/${memberId}`, task);
  }

  updateTask(id: string, task: UpdateTask): Observable<void> {
    return this.http.put<void>(`${this.apiUrl}/tasks/${id}`, task);
  }

  deleteTask(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/tasks/${id}`);
  }

  assignTaskToMember(taskId: string, memberId: string): Observable<void> {
    return this.http.post<void>(`${this.apiUrl}/tasks/${taskId}/assign/${memberId}`, {});
  }

  completeTask(taskId: string): Observable<void> {
    return this.http.post<void>(`${this.apiUrl}/tasks/${taskId}/complete`, {});
  }

  completeTaskForMember(taskId: string, memberId: string): Observable<void> {
    return this.http.post<void>(`${this.apiUrl}/tasks/${taskId}/member/${memberId}/complete`, {});
  }
}