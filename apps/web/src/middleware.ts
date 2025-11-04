import { type NextRequest, NextResponse } from 'next/server';
import { authMiddleware } from './middleware/auth';
import { cspHeaderMiddleware } from './middleware/csp-header';

export async function middleware(request: NextRequest) {
  const cspHeaderBeforeContext = await cspHeaderMiddleware.before({}, request);
  const authBeforeContext = await authMiddleware.before(
    cspHeaderBeforeContext,
    request,
  );

  const response = NextResponse.next({
    request: {
      headers: authBeforeContext.requestHeaders,
    },
  });

  const authAfterContext = await authMiddleware.after(
    authBeforeContext,
    request,
    response,
  );
  await cspHeaderMiddleware.after(authAfterContext, request, response);

  return response;
}
