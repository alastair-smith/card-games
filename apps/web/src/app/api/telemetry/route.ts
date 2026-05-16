import type { NextRequest } from 'next/server';
import { env } from '~/env';
import { createCircuitBreaker } from '~/utils/circuit-breaker';

const circuit = createCircuitBreaker({
  name: 'Telemetry',
  failureThreshold: 5,
  resetTimeoutMs: 60_000,
});

export async function POST(req: NextRequest) {
  if (!env.OTEL_EXPORTER_OTLP_ENDPOINT) {
    return new Response(null, { status: 204 });
  }

  if (circuit.isOpen()) {
    return new Response(null, { status: 204 });
  }

  const endpoint = `${env.OTEL_EXPORTER_OTLP_ENDPOINT}/v1/traces`;

  const headers: Record<string, string> = {
    'Content-Type': req.headers.get('Content-Type') ?? 'application/json',
  };

  if (env.NEW_RELIC_LICENSE_KEY) {
    headers['api-key'] = env.NEW_RELIC_LICENSE_KEY;
  }

  const body = await req.arrayBuffer();

  try {
    const response = await fetch(endpoint, {
      method: 'POST',
      headers,
      body,
    });

    if (response.ok) {
      circuit.onSuccess();
    } else {
      circuit.onFailure();
    }

    return new Response(null, { status: response.status });
  } catch {
    circuit.onFailure();
    return new Response(null, { status: 204 });
  }
}
