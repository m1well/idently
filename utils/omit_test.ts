import { assertEquals } from 'https://deno.land/std@0.218.2/assert/mod.ts';
import { omitCodeFromUsers } from '@/utils/omit.ts';

Deno.test("omitCodeFromUsers removes 'code' property", () => {
  const user = {
    code: 'geheim',
    firstName: 'Max',
    lastName: 'Mustermann',
    systemRole: 'user',
    availableSince: new Date(),
  };

  const userWithoutCode = omitCodeFromUsers([user]);

  assertEquals(userWithoutCode, [{
    firstName: 'Max',
    lastName: 'Mustermann',
    systemRole: 'user',
    availableSince: user.availableSince,
  }]);
});
