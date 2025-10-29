import { createTRPCRouter } from '~/server/api/trpc';
import { pickupCard } from './pickup-card';
import { startGameMutation as startGame } from './start-game';
import { state } from './state';
import { triggerEmoji } from './trigger-emoji';

export const highCardRouter = createTRPCRouter({
  startGame,
  pickupCard,
  state,
  triggerEmoji,
});
