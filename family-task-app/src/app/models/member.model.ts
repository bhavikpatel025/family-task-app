export interface Member {
  id: string;
  firstName: string;
  lastName: string;
  emailAddress: string;
  roles: string;
  avatar: string;
  tasks?: TaskSimplified[];
}

export interface TaskSimplified {
  id: string;
  subject: string;
  isComplete: boolean;
  assignedMemberId: string;
}

export interface CreateMember {
  firstName: string;
  lastName: string;
  emailAddress: string;
  roles: string;
  avatar: string;
}

export interface UpdateMember {
  firstName?: string;
  lastName?: string;
  emailAddress?: string;
  roles?: string;
  avatar?: string;
}