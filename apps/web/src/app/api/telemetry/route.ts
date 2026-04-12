import type { NextRequest } from 'next/server';
import { env } from '~/env';

export async function POST(req: NextRequest) {
  const endpoint = `${env.OTEL_EXPORTER_OTLP_ENDPOINT}/v1/traces`;

  const headers: Record<string, string> = {
    'Content-Type': req.headers.get('Content-Type') ?? 'application/json',
  };

  if (env.NEW_RELIC_LICENSE_KEY) {
    headers['api-key'] = env.NEW_RELIC_LICENSE_KEY;
  }

  const body = await req.arrayBuffer();

  const response = await fetch(endpoint, {
    method: 'POST',
    headers,
    body,
  });

  return new Response(null, { status: response.status });
}
