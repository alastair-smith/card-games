import 'server-only';

import { createHydrationHelpers } from '@trpc/react-query/rsc';
import { cookies, headers } from 'next/headers';
import { cache } from 'react';
import { type AppRouter, createCaller } from '~/server/api/root';
import { createTRPCContext } from '~/server/api/trpc';
import { AUTH_COOKIE_NAME } from '~/server/auth';
import { createQueryClient } from './query-client';

/**
 * This wraps the `createTRPCContext` helper and provides the required context for the tRPC API when
 * handling a tRPC call from a React Server Component.
 */
const createContext = cache(async () => {
  const reqHeaders = new Headers(await headers());
  reqHeaders.set('x-trpc-source', 'rsc');

  const authCookie = (await cookies()).get(AUTH_COOKIE_NAME)?.value;

  return createTRPCContext({
    headers: reqHeaders,
    authCookie,
  });
});

const getQueryClient = cache(createQueryClient);
const caller = createCaller(createContext);

export const { trpc: api, HydrateClient } = createHydrationHelpers<AppRouter>(
  caller,
  getQueryClient,
);
