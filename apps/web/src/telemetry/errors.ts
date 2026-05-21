import { SpanStatusCode, trace } from '@opentelemetry/api';

export function recordClientError(error: unknown, spanName: string): void {
  const span = trace.getTracer('card-games-web').startSpan(spanName);
  const err = error instanceof Error ? error : new Error(String(error));
  span.recordException(err);
  span.setStatus({ code: SpanStatusCode.ERROR, message: err.message });
  span.end();
}
