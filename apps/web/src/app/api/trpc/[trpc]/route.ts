import { fetchRequestHandler } from '@trpc/server/adapters/fetch';
import { getHTTPStatusCodeFromError } from '@trpc/server/http';
import type { NextRequest } from 'next/server';
import { appRouter } from '~/server/api/root';
import { createTRPCContext } from '~/server/api/trpc';
import { AUTH_COOKIE_NAME } from '~/server/auth';
import { logger } from '~/utils/logger';

/**
 * This wraps the `createTRPCContext` helper and provides the required context for the tRPC API when
 * handling a HTTP request (e.g. when you make requests from Client Components).
 */
const createContext = async (req: NextRequest) => {
  const authCookie = req.cookies.get(AUTH_COOKIE_NAME)?.value;

  return createTRPCContext({
    signal: req.signal,
    headers: req.headers,
    authCookie,
  });
};

const handler = (req: NextRequest) =>
  fetchRequestHandler({
    endpoint: '/api/trpc',
    req,
    router: appRouter,
    createContext: () => createContext(req),
    onError: ({ path, error, type }) => {
      const errorStatus = getHTTPStatusCodeFromError(error);

      const logType =
        errorStatus >= 400 && errorStatus < 500 ? 'warn' : 'error';

      logger[logType](
        new Error(`TRPC error - ${path} - ${type}`, { cause: error }),
      );
    },
  });

export { handler as GET, handler as POST };
