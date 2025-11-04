import type { Middleware } from './types';

const CSP_HEADER_NAME = 'Content-Security-Policy-Report-Only';

export const cspHeaderMiddleware: Middleware = {
  before: async (context, request) => {
    const isDev = process.env.NODE_ENV === 'development';

    const nonce = Buffer.from(crypto.randomUUID()).toString('base64');
    const cspHeader = `
      default-src 'none';
      script-src 'nonce-${nonce}' 'strict-dynamic' ${isDev ? "'unsafe-eval'" : ''};
      style-src 'self' ${isDev ? "'unsafe-inline'" : `'nonce-${nonce}'`};
      img-src 'self' data:;
      font-src 'self';
      base-uri 'self';
      connect-src 'self';
      form-action 'self';
      manifest-src 'self';
    `;
    // Replace newline characters and spaces
    const cspHeaderValue = cspHeader.replace(/\s{2,}/g, ' ').trim();

    const requestHeaders = new Headers(request.headers);

    // used internally
    requestHeaders.set('x-nonce', nonce);
    requestHeaders.set(CSP_HEADER_NAME, cspHeaderValue);

    return {
      ...context,
      requestHeaders,
      cspHeaderValue,
    };
  },
  after: async (context, _request, response) => {
    if (context.cspHeaderValue) {
      response.headers.set(CSP_HEADER_NAME, context.cspHeaderValue);
    }

    return context;
  },
};
