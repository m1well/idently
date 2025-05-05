import { create, Header, Payload, verify } from '@/deps/main.ts';

const JWT_SECRET = Deno.env.get('JWT_SECRET') ?? 'supersecret';

async function getKey(): Promise<CryptoKey> {
  return await crypto.subtle.importKey(
    'raw',
    new TextEncoder().encode(JWT_SECRET),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign', 'verify'],
  );
}

export async function createJWT(payload: Payload): Promise<string> {
  const header: Header = { alg: 'HS256', typ: 'JWT' };
  const key = await getKey();
  return await create(header, payload, key);
}

export async function verifyJWT(token: string): Promise<Payload | null> {
  try {
    const key = await getKey();
    return await verify(token, key);
  } catch (_) {
    return null;
  }
}
