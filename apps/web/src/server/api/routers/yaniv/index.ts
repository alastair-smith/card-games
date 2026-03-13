import { createTRPCRouter } from '~/server/api/trpc';
import { callYanivMutation } from './call-yaniv';
import { pickupCardMutation } from './pickup-card';
import { playCardsMutation } from './play-cards';
import { startGameMutation } from './start-game';
import { startNewRoundMutation } from './start-new-round';
import { yanivStateSubscription } from './state';
import { triggerEmojiMutation } from './trigger-emoji';

export const yanivRouter = createTRPCRouter({
  state: yanivStateSubscription,
  startGame: startGameMutation,
  playCards: playCardsMutation,
  pickupCard: pickupCardMutation,
  callYaniv: callYanivMutation,
  startNewRound: startNewRoundMutation,
  triggerEmoji: triggerEmojiMutation,
});
