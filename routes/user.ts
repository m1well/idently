import { Request as OakRequest } from 'https://deno.land/x/oak@v17.1.4/request.ts';
import type { User } from '@/models/user.ts';
import { readJson } from '@/utils/file.ts';
import { verifyJWT } from '@/utils/jwt.ts';
import { omitCodeFromUsers } from '@/utils/omit.ts';

export async function handleUsers(req: OakRequest): Promise<Response> {
  const users = omitCodeFromUsers(
    await readJson<User[]>(Deno.env.get('USERS_FILE')!),
  );

  const auth = req.headers.get('authorization') ?? '';
  const token = auth.replace('Bearer ', '');
  const payload = await verifyJWT(token);

  if (payload?.role !== 'admin') {
    return new Response(
      JSON.stringify({ error: 'Not allowed to see all users' }),
      {
        status: 403,
        headers: { 'Content-Type': 'application/json' },
      },
    );
  }

  if (users.length == 0) {
    return new Response(JSON.stringify({ error: 'No users found' }), {
      status: 404,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  return new Response(JSON.stringify(users), {
    headers: { 'Content-Type': 'application/json' },
  });
}
