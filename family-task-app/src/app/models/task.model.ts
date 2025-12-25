export interface Task {
  id: string;
  subject: string;
  isComplete: boolean;
  assignedMemberId: string;
  assignedMember?: MemberSimplified;
}

export interface MemberSimplified {
  id: string;
  firstName: string;
  lastName: string;
  emailAddress: string;
  roles: string;
  avatar: string;
}

export interface CreateTask {
  subject: string;
  assignedMemberId?: string;
}

export interface UpdateTask {
  subject: string;
  isComplete: boolean;
  assignedMemberId?: string;
}
