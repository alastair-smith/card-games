import { ZoneContextManager } from '@opentelemetry/context-zone';
import { OTLPTraceExporter } from '@opentelemetry/exporter-trace-otlp-http';
import { FetchInstrumentation } from '@opentelemetry/instrumentation-fetch';
import { resourceFromAttributes } from '@opentelemetry/resources';
import {
  BatchSpanProcessor,
  WebTracerProvider,
} from '@opentelemetry/sdk-trace-web';
import {
  ATTR_SERVICE_NAME,
  ATTR_SERVICE_VERSION,
} from '@opentelemetry/semantic-conventions';
import {
  ATTR_BROWSER_BRANDS,
  ATTR_BROWSER_PLATFORM,
} from '@opentelemetry/semantic-conventions/incubating';
import { env } from '~/env';
import { recordClientError } from './errors';

/** Chrome only */
type NavigatorUaData = {
  brands?: { brand: string; version: string }[];
  platform?: string;
};

type NavigatorWithUaData = Navigator & { userAgentData?: NavigatorUaData };

function getBrowserBrands(): string[] | undefined {
  const brands = (navigator as NavigatorWithUaData).userAgentData?.brands?.map(
    ({ brand, version }) => `${brand} ${version}`,
  );
  if (brands?.length) return brands;

  const ua = navigator.userAgent;
  const match =
    ua.match(/Firefox\/(\d+)/) ??
    ua.match(/Edg\/(\d+)/) ??
    ua.match(/Chrome\/(\d+)/) ??
    (ua.includes('Safari/') ? ua.match(/Version\/(\d+)/) : null);
  if (!match) return undefined;

  if (ua.includes('Firefox/')) return [`Firefox ${match[1]}`];
  if (ua.includes('Edg/')) return [`Edge ${match[1]}`];
  if (ua.includes('Chrome/')) return [`Chrome ${match[1]}`];
  return [`Safari ${match[1]}`];
}

function getBrowserPlatform(): string | undefined {
  if ((navigator as NavigatorWithUaData).userAgentData?.platform) {
    return (navigator as NavigatorWithUaData).userAgentData?.platform;
  }

  const ua = navigator.userAgent;
  if (ua.includes('iPhone') || ua.includes('iPad')) return 'iOS';
  if (ua.includes('Android')) return 'Android';
  if (ua.includes('Windows')) return 'Windows';
  if (ua.includes('Mac OS X')) return 'macOS';
  if (ua.includes('Linux')) return 'Linux';
  return undefined;
}

export function initClientTelemetry() {
  const exporter = new OTLPTraceExporter({
    url: '/api/telemetry',
  });

  const provider = new WebTracerProvider({
    resource: resourceFromAttributes({
      [ATTR_SERVICE_NAME]: 'card-games-web',
      [ATTR_SERVICE_VERSION]: env.NEXT_PUBLIC_GIT_COMMIT_HASH,
      [ATTR_BROWSER_BRANDS]: getBrowserBrands(),
      [ATTR_BROWSER_PLATFORM]: getBrowserPlatform(),
      'device.screen.width': window.screen.width,
      'device.screen.height': window.screen.height,
      'browser.viewport.width': window.innerWidth,
      'browser.viewport.height': window.innerHeight,
    }),
    spanProcessors: [new BatchSpanProcessor(exporter)],
  });

  provider.register({
    contextManager: new ZoneContextManager(),
  });

  new FetchInstrumentation({
    propagateTraceHeaderCorsUrls: [window.location.origin],
  }).enable();

  window.addEventListener('error', ({ error }) => {
    if (error instanceof Error) {
      recordClientError(error, 'global.error');
    }
  });

  window.addEventListener('unhandledrejection', ({ reason }) => {
    recordClientError(reason, 'global.unhandledRejection');
  });
}
