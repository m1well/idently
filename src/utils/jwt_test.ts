import { assertEquals, assertExists, Payload } from '@/deps/main.ts';
import { createJWT, verifyJWT } from '@/utils/jwt.ts';

Deno.test('createJWT creates a valid JWT', async () => {
  const payload: Payload = {
    iss: 'test',
    sub: '1234567890',
    name: 'Test User',
  };

  const jwt = await createJWT(payload);

  assertExists(jwt);
  assertEquals(typeof jwt, 'string');

  // check 3 parts (header.payload.signature)
  const jwtParts = jwt.split('.');
  assertEquals(jwtParts.length, 3);
});

Deno.test('verifyJWT verifys a valid JWT', async () => {
  const payload: Payload = {
    iss: 'test',
    sub: '1234567890',
    name: 'Test User',
  };

  const jwt = await createJWT(payload);
  const verifiedPayload = await verifyJWT(jwt);

  assertExists(verifiedPayload);
  assertEquals(verifiedPayload!.iss, 'test');
  assertEquals(verifiedPayload!.sub, '1234567890');
  assertEquals(verifiedPayload!.name, 'Test User');
});

Deno.test('verifyJWT returns null for unvalid JWT', async () => {
  const invalidJWT = 'unvalid.jwt.format';
  const verifiedPayload = await verifyJWT(invalidJWT);

  assertEquals(verifiedPayload, null);
});

Deno.test('verifyJWT returns null for manipulated JWT', async () => {
  const payload: Payload = {
    iss: 'test',
    sub: '1234567890',
    name: 'Test User',
  };

  const jwt = await createJWT(payload);
  const manipulatedJWT = jwt.slice(0, -5) + 'xxxxx'; // manipulate signature
  const verifiedPayload = await verifyJWT(manipulatedJWT);

  assertEquals(verifiedPayload, null);
});
