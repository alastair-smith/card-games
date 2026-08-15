import { OTLPLogExporter } from '@opentelemetry/exporter-logs-otlp-http';
import {
  AggregationTemporalityPreference,
  OTLPMetricExporter,
} from '@opentelemetry/exporter-metrics-otlp-http';
import { OTLPTraceExporter } from '@opentelemetry/exporter-trace-otlp-http';
import { HttpInstrumentation } from '@opentelemetry/instrumentation-http';
import { IORedisInstrumentation } from '@opentelemetry/instrumentation-ioredis';
import { PinoInstrumentation } from '@opentelemetry/instrumentation-pino';
import { resourceFromAttributes } from '@opentelemetry/resources';
import { BatchLogRecordProcessor } from '@opentelemetry/sdk-logs';
import { PeriodicExportingMetricReader } from '@opentelemetry/sdk-metrics';
import { NodeSDK } from '@opentelemetry/sdk-node';
import {
  ATTR_SERVICE_NAME,
  ATTR_SERVICE_VERSION,
} from '@opentelemetry/semantic-conventions';
import { ATTR_DEPLOYMENT_ENVIRONMENT_NAME } from '@opentelemetry/semantic-conventions/incubating';
import { env } from '~/env';
import { registerEventListenerGauge } from './metrics';

/** The uptime pinger hits this constantly to keep the instance warm. */
const HEALTHCHECK_PATH = '/api/healthcheck';

export async function startTelemetry() {
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

  const metricExporter = new OTLPMetricExporter({
    url: `${endpoint}/v1/metrics`,
    headers: exporterHeaders,
    // New Relic's preferred temporality for OTLP metrics.
    temporalityPreference: AggregationTemporalityPreference.DELTA,
  });

  const sdk = new NodeSDK({
    resource: resourceFromAttributes({
      [ATTR_SERVICE_NAME]: 'card-games',
      [ATTR_SERVICE_VERSION]: env.NEXT_PUBLIC_GIT_COMMIT_HASH,
      [ATTR_DEPLOYMENT_ENVIRONMENT_NAME]: env.NODE_ENV,
    }),
    traceExporter: exporter,
    logRecordProcessor: new BatchLogRecordProcessor(logExporter),
    metricReader: new PeriodicExportingMetricReader({
      exporter: metricExporter,
    }),
    instrumentations: [
      new HttpInstrumentation({
        ignoreOutgoingRequestHook: (req) =>
          req.hostname === otlpHostname && String(req.port ?? '') === otlpPort,
        ignoreIncomingRequestHook: (req) =>
          (req.url ?? '').startsWith(HEALTHCHECK_PATH),
      }),
      new IORedisInstrumentation(),
      new PinoInstrumentation(),
    ],
  });

  sdk.start();

  // Imported after start so the emitter's pino logger is loaded with the
  // instrumentation already in place.
  const { default: monitoredEmitter } = await import('~/server/events/emitter');
  registerEventListenerGauge(() => monitoredEmitter.getListenerCounts());

  const shutdown = () => sdk.shutdown();
  process.once('SIGTERM', shutdown);
  process.once('SIGINT', shutdown);
}
