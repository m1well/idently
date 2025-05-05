import { assertEquals } from '@/deps/main.ts';
import { omitCodeFromUsers } from '@/utils/omit.ts';

Deno.test("omitCodeFromUsers removes 'code' property", () => {
  const user = {
    code: 'geheim',
    firstName: 'Max',
    lastName: 'Mustermann',
    systemRole: 'user',
    availableSince: new Date(),
    assignedApps: ['abc', 'def'],
  };

  const userWithoutCode = omitCodeFromUsers([user]);

  assertEquals(userWithoutCode, [{
    firstName: 'Max',
    lastName: 'Mustermann',
    systemRole: 'user',
    availableSince: user.availableSince,
    assignedApps: ['abc', 'def'],
  }]);
});
