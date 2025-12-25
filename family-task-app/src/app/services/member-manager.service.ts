import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { tap, catchError } from 'rxjs/operators';
import { of } from 'rxjs';
import { Member, CreateMember } from '../models/member.model';
import { ApiService } from './api.service';

@Injectable({
  providedIn: 'root'
})
export class MemberManagerService {
  private membersSubject = new BehaviorSubject<Member[]>([]);
  private selectedMemberSubject = new BehaviorSubject<Member | null>(null);
  private loadingSubject = new BehaviorSubject<boolean>(false);
  private errorSubject = new BehaviorSubject<string | null>(null);
  
  members$: Observable<Member[]> = this.membersSubject.asObservable();
  selectedMember$: Observable<Member | null> = this.selectedMemberSubject.asObservable();
  loading$: Observable<boolean> = this.loadingSubject.asObservable();
  error$: Observable<string | null> = this.errorSubject.asObservable();

  constructor(private apiService: ApiService) {}

  loadMembers(): void {
    this.loadingSubject.next(true);
    this.errorSubject.next(null);
    
    this.apiService.getMembers()
      .pipe(
        tap(members => {
          this.membersSubject.next(members);
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

  selectMember(member: Member): void {
    this.selectedMemberSubject.next(member);
  }

  clearSelection(): void {
    this.selectedMemberSubject.next(null);
  }

  createMember(memberData: CreateMember): void {
    this.loadingSubject.next(true);
    this.errorSubject.next(null);
    
    this.apiService.createMember(memberData)
      .pipe(
        tap(newMember => {
          const currentMembers = this.membersSubject.value;
          this.membersSubject.next([...currentMembers, newMember]);
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

  updateMember(id: string, memberData: Partial<CreateMember>): void {
    this.loadingSubject.next(true);
    this.errorSubject.next(null);
    
    this.apiService.updateMember(id, memberData)
      .pipe(
        tap(() => {
          const currentMembers = this.membersSubject.value;
          const updatedMembers = currentMembers.map(member => 
            member.id === id ? { ...member, ...memberData } : member
          );
          this.membersSubject.next(updatedMembers);
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

  deleteMember(id: string): void {
    this.loadingSubject.next(true);
    this.errorSubject.next(null);
    
    this.apiService.deleteMember(id)
      .pipe(
        tap(() => {
          const currentMembers = this.membersSubject.value;
          const updatedMembers = currentMembers.filter(member => member.id !== id);
          this.membersSubject.next(updatedMembers);
          this.clearSelection();
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

  getSelectedMember(): Member | null {
    return this.selectedMemberSubject.value;
  }
}