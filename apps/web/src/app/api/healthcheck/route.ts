import { redis } from '~/server/data/redis';

export async function GET() {
  try {
    await redis.ping();
  } catch {
    const body = { status: 'error', redis: 'unreachable' };
    return new Response(JSON.stringify(body), {
      status: 503,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  const body = { status: 'ok', redis: 'ok' };
  return new Response(JSON.stringify(body), {
    status: 200,
    headers: { 'Content-Type': 'application/json' },
  });
}
