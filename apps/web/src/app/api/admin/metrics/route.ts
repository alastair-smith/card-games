import { Buffer } from 'node:buffer';
import { env } from '~/env';
import monitoredEmitter from '~/server/events/emitter';

export function GET(request: Request) {
  /** Auth */
  const authHeader = request.headers.get('Authorization');

  if (!env.ADMIN_USERNAME || !env.ADMIN_PASSWORD) {
    console.error(
      'Admin username or password not set in environment variables.',
    );
    return new Response(
      JSON.stringify({
        status: 'error',
        error: 'Admin credentials not configured.',
      }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      },
    );
  }

  if (!authHeader) {
    return new Response(
      JSON.stringify({ status: 'error', error: 'Authentication required' }),
      {
        status: 401,
        headers: {
          'WWW-Authenticate': 'Basic realm="Admin"',
          'Content-Type': 'application/json',
        },
      },
    );
  }

  const [scheme, encoded] = authHeader.split(' ');

  if (scheme !== 'Basic' || !encoded) {
    return new Response(
      JSON.stringify({
        status: 'error',
        error: 'Invalid authentication scheme',
      }),
      {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      },
    );
  }

  const decoded = Buffer.from(encoded, 'base64').toString();
  const [username, password] = decoded.split(':');

  if (username !== env.ADMIN_USERNAME || password !== env.ADMIN_PASSWORD) {
    return new Response(
      JSON.stringify({ status: 'error', error: 'Invalid credentials' }),
      {
        status: 401,
        headers: {
          'WWW-Authenticate': 'Basic realm="Admin"',
          'Content-Type': 'application/json',
        },
      },
    );
  }

  /** Metrics */

  const listenerCount = monitoredEmitter.totalListenerCount();

  const response = new Response(
    JSON.stringify({
      status: 'ok',
      metrics: {
        totalEventListeners: listenerCount,
      },
    }),
    {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    },
  );

  return response;
}
