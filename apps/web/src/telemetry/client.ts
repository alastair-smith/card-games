import { ZoneContextManager } from '@opentelemetry/context-zone';
import { OTLPTraceExporter } from '@opentelemetry/exporter-trace-otlp-http';
import { FetchInstrumentation } from '@opentelemetry/instrumentation-fetch';
import { resourceFromAttributes } from '@opentelemetry/resources';
import {
  BatchSpanProcessor,
  WebTracerProvider,
} from '@opentelemetry/sdk-trace-web';
import { ATTR_SERVICE_NAME } from '@opentelemetry/semantic-conventions';
import {
  ATTR_BROWSER_BRANDS,
  ATTR_BROWSER_PLATFORM,
} from '@opentelemetry/semantic-conventions/incubating';

type UaDataBrand = { brand: string; version: string };
type NavigatorUaData = {
  brands?: UaDataBrand[];
  platform?: string;
};

type NavigatorWithUaData = Navigator & { userAgentData?: NavigatorUaData };

function getBrowserBrands(): string[] | undefined {
  const brands = (navigator as NavigatorWithUaData).userAgentData?.brands?.map(
    ({ brand, version }) => `${brand} ${version}`,
  );
  return brands?.length ? brands : undefined;
}

function getBrowserPlatform(): string | undefined {
  return (navigator as NavigatorWithUaData).userAgentData?.platform;
}

export function initClientTelemetry() {
  const exporter = new OTLPTraceExporter({
    url: '/api/telemetry',
  });

  const provider = new WebTracerProvider({
    resource: resourceFromAttributes({
      [ATTR_SERVICE_NAME]: 'card-games-web',
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
}
