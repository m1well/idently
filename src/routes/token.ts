import { getNumericDate, OakRequest, Payload } from '@/deps/main.ts';
import { createJWT, verifyJWT } from '@/utils/jwt.ts';
import { jsonHeader } from '@/utils/header.ts';
import { readJsonFiles } from '../utils/files.ts';
import { User } from '../models/user.ts';

export async function handleCreateToken(
  code: string,
  source: string,
  duration: number,
): Promise<Response> {
  const clients: { clientName: string; users: User[] }[] = await readJsonFiles(
    Deno.env.get('CLIENTS_FOLDER')!,
  );
  const client = clients.filter((c) => c.clientName === source).pop();

  if (!client) {
    return new Response(JSON.stringify({ error: 'Invalid source' }), {
      status: 401,
      headers: jsonHeader,
    });
  }

  // search user by id and source in 'assignedApps'
  const user = client.users.find((u) => u.code === code);
  if (!user) {
    return new Response(JSON.stringify({ error: 'Invalid code or source' }), {
      status: 401,
      headers: jsonHeader,
    });
  }

  // deno-lint-ignore no-explicit-any
  const payload: any = {
    sub: `${user.claims.firstName} ${user.claims.lastName}`,
    role: user.systemRole,
    iss: Deno.env.get('APP_NAME')!,
    aud: source,
    iat: getNumericDate(0),
    exp: getNumericDate(duration),
    ...user.claims,
  };

  const jwt = await createJWT(payload as unknown as Payload);

  return new Response(
    JSON.stringify({ token: jwt, name: user.claims.firstName }),
    {
      headers: { 'Content-Type': 'application/json' },
    },
  );
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
