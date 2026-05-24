import { OTLPLogExporter } from '@opentelemetry/exporter-logs-otlp-http';
import { OTLPTraceExporter } from '@opentelemetry/exporter-trace-otlp-http';
import { HttpInstrumentation } from '@opentelemetry/instrumentation-http';
import { IORedisInstrumentation } from '@opentelemetry/instrumentation-ioredis';
import { PinoInstrumentation } from '@opentelemetry/instrumentation-pino';
import { resourceFromAttributes } from '@opentelemetry/resources';
import { BatchLogRecordProcessor } from '@opentelemetry/sdk-logs';
import { NodeSDK } from '@opentelemetry/sdk-node';
import {
  ATTR_SERVICE_NAME,
  ATTR_SERVICE_VERSION,
} from '@opentelemetry/semantic-conventions';
import { ATTR_DEPLOYMENT_ENVIRONMENT_NAME } from '@opentelemetry/semantic-conventions/incubating';
import { env } from '~/env';

export function startTelemetry() {
  const endpoint = env.OTEL_EXPORTER_OTLP_ENDPOINT;
  if (!endpoint) return;

  const otlpUrl = new URL(endpoint);
  const otlpHostname = otlpUrl.hostname;
  const otlpPort =
    otlpUrl.port || (otlpUrl.protocol === 'https:' ? '443' : '80');

  const exporterHeaders: Record<string, string> = {};
  if (env.NEW_RELIC_LICENSE_KEY) {
    exporterHeaders['api-key'] = env.NEW_RELIC_LICENSE_KEY;
  }

  const exporter = new OTLPTraceExporter({
    url: `${endpoint}/v1/traces`,
    headers: exporterHeaders,
  });

  const logExporter = new OTLPLogExporter({
    url: `${endpoint}/v1/logs`,
    headers: exporterHeaders,
  });

  const sdk = new NodeSDK({
    resource: resourceFromAttributes({
      [ATTR_SERVICE_NAME]: 'card-games',
      [ATTR_SERVICE_VERSION]: env.NEXT_PUBLIC_GIT_COMMIT_HASH,
      [ATTR_DEPLOYMENT_ENVIRONMENT_NAME]: env.NODE_ENV,
    }),
    traceExporter: exporter,
    logRecordProcessor: new BatchLogRecordProcessor(logExporter),
    instrumentations: [
      new HttpInstrumentation({
        ignoreOutgoingRequestHook: (req) =>
          req.hostname === otlpHostname && String(req.port ?? '') === otlpPort,
      }),
      new IORedisInstrumentation(),
      new PinoInstrumentation(),
    ],
  });

  sdk.start();

  const shutdown = () => sdk.shutdown();
  process.once('SIGTERM', shutdown);
  process.once('SIGINT', shutdown);
}
