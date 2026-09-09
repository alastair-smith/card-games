import { createTRPCRouter } from '~/server/api/trpc';
import { callYanivMutation } from './call-yaniv';
import { endTurnMutation } from './end-turn';
import { pickupCardMutation } from './pickup-card';
import { playCardsMutation } from './play-cards';
import { startGameMutation } from './start-game';
import { startNewRoundMutation } from './start-new-round';
import { yanivStateSubscription } from './state';
import { triggerEmojiMutation } from './trigger-emoji';
import { updateSettingsMutation } from './update-settings';

export const yanivRouter = createTRPCRouter({
  state: yanivStateSubscription,
  startGame: startGameMutation,
  playCards: playCardsMutation,
  pickupCard: pickupCardMutation,
  callYaniv: callYanivMutation,
  startNewRound: startNewRoundMutation,
  endTurn: endTurnMutation,
  triggerEmoji: triggerEmojiMutation,
  updateSettings: updateSettingsMutation,
});
