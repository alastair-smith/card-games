import { randomUUID } from 'node:crypto';
import { yanivDiscard } from '~/server/data/discard';
import { getYanivState, setYanivState } from '~/server/data/yaniv';
import { publishEmoji } from '~/server/events/emoji';
import { publishYanivState } from '~/server/events/yaniv';
import { withLock } from '~/server/state/lib/locks';
import type { EmojiReactionId, UserId } from '~/types/entities';
import type { GameCode } from '~/types/game';
import { GameStage, GameStep, YANIV_CALL_THRESHOLD } from '~/types/games/yaniv';
import { sumYanivHand } from '~/utils/yaniv';
import { getPlayerAfter } from './lib/get-player-after';
import { scoreYanivRound } from './lib/score-yaniv-round';

export const callYaniv = async (code: GameCode, userId: UserId) =>
  withLock('yaniv', code, async () => {
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

    const nextPlayer = getPlayerAfter(state.players, userId);

    const stateWithCall = {
      ...state,
      yanivCallerIds: [...state.yanivCallerIds, userId],
      players: state.players.map((player) => ({
        ...player,
        isYanivCalled: player.id === userId ? true : player.isYanivCalled,
      })),
    };

    if (nextPlayer.isYanivCalled) {
      await scoreYanivRound(code, stateWithCall);
    } else {
      const newState = {
        ...stateWithCall,
        playedCards: [],
        drawnCard: undefined,
        drawnFrom: null,
        currentPlayerId: nextPlayer.id,
        gameStep: GameStep.PLAY_CARDS,
      };

      await setYanivState({ code }, newState);
      await publishYanivState(code, newState);
    }
  });
