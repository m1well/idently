import { Request as OakRequest } from 'https://deno.land/x/oak@v17.1.4/request.ts';
import { getNumericDate } from 'https://deno.land/x/djwt@v2.9/mod.ts';
import type { User } from '@/models/user.ts';
import { readJson } from '@/utils/file.ts';
import { createJWT, verifyJWT } from '@/utils/jwt.ts';
import { Payload } from 'https://deno.land/x/djwt@v2.9/mod.ts';

export async function handleCreateToken(
  code: string,
  duration: number,
): Promise<Response> {
  const users = await readJson<User[]>(Deno.env.get('USERS_FILE')!);
  const user = users.find((u) => u.code === code);

  if (!user) {
    return new Response(JSON.stringify({ error: 'Invalid code' }), {
      status: 401,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  // deno-lint-ignore no-explicit-any
  const payload: any = {
    sub: `${user.firstName} ${user.lastName}`,
    role: user.systemRole,
    iss: 'idently',
    iat: getNumericDate(0),
    exp: getNumericDate(duration),
    specificRole: user.specificRole,
    id: user.id,
    budget: user.budget,
  };

  const jwt = await createJWT(payload as unknown as Payload);

  return new Response(JSON.stringify({ token: jwt }), {
    headers: { 'Content-Type': 'application/json' },
  });
}

export async function handleVerifyToken(req: OakRequest): Promise<Response> {
  const auth = req.headers.get('authorization') ?? '';
  const token = auth.replace('Bearer ', '');
  const payload = await verifyJWT(token);

  if (!payload) {
    return new Response(JSON.stringify({ valid: false }), {
      status: 401,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  return new Response(JSON.stringify({ valid: true, user: payload }), {
    headers: { 'Content-Type': 'application/json' },
  });
}
