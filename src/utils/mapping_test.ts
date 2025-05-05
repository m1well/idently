import { assertEquals } from '@/deps/main.ts';
import { createUserDto } from './mapping.ts';

Deno.test("createUserDto removes 'code' and 'assignedApps' property", () => {
  const user = {
    code: 'geheim',
    firstName: 'Max',
    lastName: 'Mustermann',
    systemRole: 'user',
    availableSince: new Date(),
    assignedApps: ['abc', 'def'],
  };

  const dto = createUserDto([user]);

  assertEquals(dto, [{
    firstName: 'Max',
    lastName: 'Mustermann',
    systemRole: 'user',
    availableSince: user.availableSince,
  }]);
});
