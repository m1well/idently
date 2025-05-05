import {
  Application,
  Context,
  Middleware,
  Router,
  RouterContext,
} from '@/deps/main.ts';
import { handleUsers } from '@/routes/user.ts';
import { handleCreateToken, handleVerifyToken } from '@/routes/token.ts';
import log from '@/logger/main.ts';

const PORT = 8000;
const REQUIRED_CODE_HEADER = 'Secret-Code';
const REQUIRED_SOURCE_HEADER = 'Source';

const router = new Router();

/**
 * additional security - the caller must know your additional header
 */
const checkHeader: Middleware = async (ctx: Context, next) => {
  if (ctx.request.url.pathname.startsWith('/actuator')) {
    await next();
    return;
  }

  if (!ctx.request.headers.has(Deno.env.get('REQUIRED_HEADER')!)) {
    ctx.response.status = 400;
    ctx.response.body = { error: 'Missing required header' };
    ctx.response.type = 'json';
    return;
  }
  const headerValue = ctx.request.headers.get(Deno.env.get('REQUIRED_HEADER')!);
  if (headerValue !== Deno.env.get('EXPECTED_HEADER_VALUE')) {
    ctx.response.status = 403;
    ctx.response.body = {
      error: 'Invalid header value',
    };
    ctx.response.type = 'json';
    return;
  }

  await next();
};

/**
 * health endpoint - could be used e.g. for kubernetes
 */
router.get('/actuator/health', (ctx: Context) => {
  ctx.response.status = 200;
  ctx.response.body = 'OK';
});

/**
 * ready endpoint - could be used e.g. for kubernetes
 */
router.get('/actuator/ready', (ctx: Context) => {
  try {
    Deno.env.get('REQUIRED_HEADER')!;
    Deno.env.get('EXPECTED_HEADER_VALUE')!;
    Deno.env.get('USERS_FILE')!;
    ctx.response.status = 200;
    ctx.response.body = 'Ready';
  } catch (error) {
    log.critical('Readiness check failed:', error);
    ctx.response.status = 503;
    ctx.response.body = 'Not Ready';
  }
});

/**
 * get all users - but only for admins
 */
// deno-lint-ignore no-explicit-any
router.get('/users', async (ctx: RouterContext<any>) => {
  const response = await handleUsers(ctx.request);
  ctx.response.status = response.status;
  try {
    ctx.response.body = await response.json();
  } catch (_e) {
    ctx.response.body = await response.text();
  }
});

// deno-lint-ignore no-explicit-any
async function token(ctx: RouterContext<any>, duration: number) {
  const code = ctx.request.headers.get(REQUIRED_CODE_HEADER);
  const source = ctx.request.headers.get(REQUIRED_SOURCE_HEADER);

  if (!code || !source) {
    ctx.response.status = 400;
    ctx.response.body = { error: 'Missing required header' };
    ctx.response.type = 'json';
    return;
  }

  if (typeof code !== 'string' || code.length === 0) {
    ctx.response.status = 400;
    ctx.response.body = { error: 'Invalid header value' };
    ctx.response.type = 'json';
    return;
  }

  const response = await handleCreateToken(code, source, +duration);
  ctx.response.status = response.status;
  try {
    ctx.response.body = await response.json();
  } catch (_e) {
    ctx.response.body = await response.text();
  }
}

/**
 * send code and source in header and get long valid jwt token (if code is found)
 */
// deno-lint-ignore no-explicit-any
router.get('/token/short', async (ctx: RouterContext<any>) => {
  const duration = Deno.env.get('TOKEN_SHORT_EXPIRES_IN_S')!;
  await token(ctx, +duration);
});

/**
 * send code and source in header and get long valid jwt token (if code is found)
 */
// deno-lint-ignore no-explicit-any
router.get('/token/long', async (ctx: RouterContext<any>) => {
  const duration = Deno.env.get('TOKEN_LONG_EXPIRES_IN_S')!;
  await token(ctx, +duration);
});

/**
 * send jwt as bearer token and verify if it is correct
 */
// deno-lint-ignore no-explicit-any
router.get('/token/verify', async (ctx: RouterContext<any>) => {
  const source = ctx.request.headers.get(REQUIRED_SOURCE_HEADER);

  if (!source) {
    ctx.response.status = 400;
    ctx.response.body = { error: 'Missing required header' };
    ctx.response.type = 'json';
    return;
  }

  const response = await handleVerifyToken(ctx.request, source);
  ctx.response.status = response.status;
  try {
    ctx.response.body = await response.json();
  } catch (_e) {
    ctx.response.body = await response.text();
  }
});

const app = new Application();

/**
 * request logging
 */
app.use(async (ctx, next) => {
  await next();

  const url = ctx.request.url.pathname;
  if (url.startsWith('/actuator/') && ctx.response.status === 200) {
    return; // do not log successfull kubernetes probes
  }

  const rt = ctx.response.headers.get('Response-Time');
  log.debug(`${ctx.request.method} ${ctx.request.url} - ${rt}`);
});

/**
 * timing for request logging
 */
app.use(async (ctx, next) => {
  const start = Date.now();
  await next();
  const ms = Date.now() - start;
  ctx.response.headers.set('Response-Time', `${ms}ms`);
});

app.use(checkHeader);
app.use(router.routes());
app.use(router.allowedMethods());

log.info(`## Server running on port ${PORT} ##`);
await app.listen({ port: PORT });
