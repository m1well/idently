import { OakRequest } from '@/deps/main.ts';
import type { User } from '@/models/user.ts';
import { readJson } from '@/utils/file.ts';
import { verifyJWT } from '@/utils/jwt.ts';
import { createUserDto } from '@/utils/mapping.ts';
import { jsonHeader } from '@/utils/header.ts';

export async function handleUsers(req: OakRequest): Promise<Response> {
  const users = createUserDto(
    await readJson<User[]>(Deno.env.get('USERS_FILE')!),
  );

  const auth = req.headers.get('authorization') ?? '';
  const token = auth.replace('Bearer ', '');
  const payload = await verifyJWT(token);

  if (payload?.role !== 'ADMIN') {
    return new Response(
      JSON.stringify({ error: 'Not allowed to see all users' }),
      {
        status: 403,
        headers: jsonHeader,
      },
    );
  }

  if (users.length == 0) {
    return new Response(JSON.stringify({ error: 'No users found' }), {
      status: 404,
      headers: jsonHeader,
    });
  }

  return new Response(JSON.stringify(users), {
    headers: jsonHeader,
  });
}
