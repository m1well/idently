import { User, UserDto } from '@/models/user.ts';

export function createUserDto(users: User[]): UserDto[] {
  const dto: UserDto[] = users.map((user) => {
    // deno-lint-ignore no-unused-vars
    const { code, assignedApps, ...dto } = user;
    return dto;
  });

  return dto;
}
