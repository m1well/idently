import { OakRequest } from '@/deps/main.ts';
import { verifyJWT } from '@/utils/jwt.ts';
import { jsonHeader } from '@/utils/header.ts';
import { readJsonFiles } from '../utils/files.ts';

export async function handleUsers(req: OakRequest): Promise<Response> {
  // deno-lint-ignore no-explicit-any
  const clients: { clientName: string; users: any[] }[] = await readJsonFiles(
    Deno.env.get('CLIENTS_FOLDER')!,
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

  if (clients.length == 0) {
    return new Response(JSON.stringify({ error: 'No clients found' }), {
      status: 404,
      headers: jsonHeader,
    });
  }

  return new Response(
    JSON.stringify(
      clients
        .filter((c) => c.clientName === payload?.aud)
        .map((c) => c.users),
    ),
    {
      headers: jsonHeader,
    },
  );
}
