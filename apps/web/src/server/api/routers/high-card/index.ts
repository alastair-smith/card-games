import { createTRPCRouter } from '~/server/api/trpc';
import { pickupCard } from './pickup-card';
import { startGame } from './start-game';
import { state } from './state';

export const highCardRouter = createTRPCRouter({
  startGame,
  pickupCard,
  state,
});
