import { OTLPTraceExporter } from '@opentelemetry/exporter-trace-otlp-http';
import { HttpInstrumentation } from '@opentelemetry/instrumentation-http';
import { IORedisInstrumentation } from '@opentelemetry/instrumentation-ioredis';
import { resourceFromAttributes } from '@opentelemetry/resources';
import { NodeSDK } from '@opentelemetry/sdk-node';
import {
  ATTR_SERVICE_NAME,
  ATTR_SERVICE_VERSION,
} from '@opentelemetry/semantic-conventions';
import { ATTR_DEPLOYMENT_ENVIRONMENT_NAME } from '@opentelemetry/semantic-conventions/incubating';
import { env } from '~/env';

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
    [ATTR_SERVICE_VERSION]: env.NEXT_PUBLIC_GIT_COMMIT_HASH,
    [ATTR_DEPLOYMENT_ENVIRONMENT_NAME]: env.NODE_ENV,
  }),
  traceExporter: exporter,
  instrumentations: [new HttpInstrumentation(), new IORedisInstrumentation()],
});

sdk.start();
