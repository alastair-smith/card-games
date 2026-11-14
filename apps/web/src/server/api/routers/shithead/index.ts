import { createTRPCRouter } from '~/server/api/trpc';
import { shitheadStateSubscription } from './state';

export const shitheadRouter = createTRPCRouter({
  state: shitheadStateSubscription,
});
