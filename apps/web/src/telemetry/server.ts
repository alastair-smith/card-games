import { OTLPTraceExporter } from '@opentelemetry/exporter-trace-otlp-http';
import { HttpInstrumentation } from '@opentelemetry/instrumentation-http';
import { IORedisInstrumentation } from '@opentelemetry/instrumentation-ioredis';
import { resourceFromAttributes } from '@opentelemetry/resources';
import { NodeSDK } from '@opentelemetry/sdk-node';
import {
  ATTR_SERVICE_NAME,
  ATTR_SERVICE_VERSION,
  SEMRESATTRS_DEPLOYMENT_ENVIRONMENT,
} from '@opentelemetry/semantic-conventions';

const endpoint =
  process.env.OTEL_EXPORTER_OTLP_ENDPOINT ?? 'http://localhost:4318';
const newRelicLicenseKey = process.env.NEW_RELIC_LICENSE_KEY;

const exporterHeaders: Record<string, string> = {};
if (newRelicLicenseKey) {
  exporterHeaders['api-key'] = newRelicLicenseKey;
}

const exporter = new OTLPTraceExporter({
  url: `${endpoint}/v1/traces`,
  headers: exporterHeaders,
});

const sdk = new NodeSDK({
  resource: resourceFromAttributes({
    [ATTR_SERVICE_NAME]: 'card-games',
    [ATTR_SERVICE_VERSION]: process.env.GIT_COMMIT_HASH ?? 'unknown',
    [SEMRESATTRS_DEPLOYMENT_ENVIRONMENT]: process.env.NODE_ENV ?? 'development',
  }),
  traceExporter: exporter,
  instrumentations: [new HttpInstrumentation(), new IORedisInstrumentation()],
});

sdk.start();
