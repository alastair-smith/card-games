import { randomUUID } from 'node:crypto';
import { yanivDiscard } from '~/server/data/discard';
import { getYanivState, setYanivState } from '~/server/data/yaniv';
import { publishEmoji } from '~/server/events/emoji';
import { publishYanivState } from '~/server/events/yaniv';
import type { EmojiReactionId, UserId } from '~/types/entities';
import type { GameCode } from '~/types/game';
import { GameStage, GameStep, YANIV_CALL_THRESHOLD } from '~/types/games/yaniv';
import { sumYanivHand } from '~/utils/yaniv';
import { scoreYanivRound } from './score-yaniv-round';

export const callYaniv = async (code: GameCode, userId: UserId) => {
  const state = await getYanivState({ code });
  if (!state) throw new Error('Game not found');

  if (state.gameStage !== GameStage.IN_PROGRESS)
    throw new Error('Game is not in progress');
  if (state.gameStep !== GameStep.PROCEED)
    throw new Error('Not the proceed step');
  if (state.currentPlayerId !== userId) throw new Error('Not your turn');

  const caller = state.players.find((player) => player.id === userId);
  if (!caller) throw new Error('Player not found');
  if (sumYanivHand(caller.hand) > YANIV_CALL_THRESHOLD)
    throw new Error('Hand value is too high to call Yaniv');

  await yanivDiscard.pushDiscard(code, state.playedCards);
  publishEmoji(code, {
    emoji: '📢',
    targetPlayerId: userId,
    id: randomUUID() as EmojiReactionId,
  });

  const currentIndex = state.players.findIndex(({ id }) => id === userId);
  const nextIndex = (currentIndex + 1) % state.players.length;
  const nextPlayer = state.players[nextIndex];
  const nextPlayerId = nextPlayer?.id;

  if (!nextPlayerId) throw new Error('Next player not found');

  if (nextPlayer.isYanivCalled) {
    const updatedState = {
      ...state,
      players: state.players.map((player) => ({
        ...player,
        isYanivCalled: player.id === userId ? true : player.isYanivCalled,
      })),
    };
    await scoreYanivRound(code, updatedState);
  } else {
    const newState = {
      ...state,
      players: state.players.map((player) => ({
        ...player,
        isYanivCalled: player.id === userId ? true : player.isYanivCalled,
      })),
      playedCards: [],
      drawnCard: undefined,
      currentPlayerId: nextPlayerId,
      gameStep: GameStep.PLAY_CARDS,
    };

    await setYanivState({ code }, newState);
    await publishYanivState(code, newState);
  }
};
