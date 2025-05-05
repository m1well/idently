import { User, UserWithoutCode } from '@/models/user.ts';

export function omitCodeFromUsers(users: User[]): UserWithoutCode[] {
  const usersWithoutCode: UserWithoutCode[] = users.map((user) => {
    // deno-lint-ignore no-unused-vars
    const { code, ...userWithoutCode } = user;
    return userWithoutCode;
  });

  return usersWithoutCode;
}
