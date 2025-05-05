export type User = {
  code: string;
  firstName: string;
  lastName: string;
  systemRole: string;
  availableSince: Date;
  assignedApps: string[];
  specificRole?: string;
  id?: number;
  budget?: number;
};

export type UserDto = Omit<User, 'code' | 'assignedApps'>;
