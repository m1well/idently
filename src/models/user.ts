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

export type UserWithoutCode = Omit<User, 'code'>;
