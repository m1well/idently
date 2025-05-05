import { getNumericDate, OakRequest, Payload } from '@/deps/main.ts';
import type { User } from '@/models/user.ts';
import { readJson } from '@/utils/file.ts';
import { createJWT, verifyJWT } from '@/utils/jwt.ts';
import { jsonHeader } from '@/utils/header.ts';

export async function handleCreateToken(
  code: string,
  source: string,
  duration: number,
): Promise<Response> {
  const users = await readJson<User[]>(Deno.env.get('USERS_FILE')!);

  // search user by id and source in 'assignedApps'
  const user = users.find((u) =>
    u.code === code && u.assignedApps.includes(source)
  );
  if (!user) {
    return new Response(JSON.stringify({ error: 'Invalid code or source' }), {
      status: 401,
      headers: jsonHeader,
    });
  }

  // deno-lint-ignore no-explicit-any
  const payload: any = {
    sub: `${user.firstName} ${user.lastName}`,
    role: user.systemRole,
    iss: Deno.env.get('APP_NAME')!,
    aud: source,
    iat: getNumericDate(0),
    exp: getNumericDate(duration),
    specificRole: user.specificRole,
    id: user.id,
    budget: user.budget,
  };

  const jwt = await createJWT(payload as unknown as Payload);

  return new Response(JSON.stringify({ token: jwt, name: user.firstName }), {
    headers: { 'Content-Type': 'application/json' },
  });
}

export async function handleVerifyToken(
  req: OakRequest,
  source: string,
): Promise<Response> {
  const auth = req.headers.get('authorization') ?? '';
  const token = auth.replace('Bearer ', '');
  const payload = await verifyJWT(token);

  if (!payload || source != payload.aud!) {
    return new Response(
      JSON.stringify({ valid: false, error: 'Missing token or wrong source' }),
      {
        status: 401,
        headers: jsonHeader,
      },
    );
  }

  return new Response(JSON.stringify({ valid: true, payload: payload }), {
    headers: jsonHeader,
  });
}
