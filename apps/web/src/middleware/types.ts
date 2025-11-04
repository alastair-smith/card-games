import type { MaybePromise } from '@trpc/server/unstable-core-do-not-import';
import type { NextRequest, NextResponse } from 'next/server';

export type MiddlewareContext = {
  nonce?: string;
  authCookie?: { signedJWT: string; expiry: number };
  requestHeaders?: Headers;
  cspHeaderValue?: string;
};

export type Middleware = {
  before: (
    context: MiddlewareContext,
    request: NextRequest,
  ) => MaybePromise<MiddlewareContext>;
  after: (
    context: MiddlewareContext,
    request: NextRequest,
    response: NextResponse,
  ) => MaybePromise<MiddlewareContext>;
};
