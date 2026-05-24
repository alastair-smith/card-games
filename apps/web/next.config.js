/**
 * Run `build` or `dev` with `SKIP_ENV_VALIDATION` to skip env validation. This is especially useful
 * for Docker builds.
 */
import './src/env.js';

/** @type {import("next").NextConfig} */
const config = {
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'X-Frame-Options',
            value: 'SAMEORIGIN',
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'Referrer-Policy',
            value: 'same-origin',
          },
          {
            key: 'Strict-Transport-Security',
            value: 'max-age=31536000; includeSubDomains',
          },
        ],
      },
    ];
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'placehold.co',
      },
    ],
  },
  output: process.env.NEXT_OUTPUT === 'standalone' ? 'standalone' : undefined,
  poweredByHeader: false,
  serverExternalPackages: [
    'sequelize',
    'pino',
    'pino-pretty',
    'ioredis',
    '@opentelemetry/api',
    '@opentelemetry/sdk-node',
    '@opentelemetry/sdk-trace-node',
    '@opentelemetry/exporter-trace-otlp-http',
    '@opentelemetry/instrumentation-ioredis',
    '@opentelemetry/instrumentation-http',
    '@opentelemetry/resources',
    '@opentelemetry/sdk-logs',
    '@opentelemetry/exporter-logs-otlp-http',
    '@opentelemetry/instrumentation-pino',
  ],
};

export default config;
