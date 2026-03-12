import { yanivDiscard } from '~/server/data/discard';
import { getYanivState, setYanivState } from '~/server/data/yaniv';
import { publishYanivState } from '~/server/events/yaniv';
import type { UserId } from '~/types/entities';
import type { GameCode } from '~/types/game';
import { GameStage, GameStep } from '~/types/games/yaniv';
import { sumYanivHand } from '~/utils/cards';

export const callYaniv = async (code: GameCode, userId: UserId) => {
  const state = await getYanivState({ code });
  if (!state) throw new Error('Game not found');

  if (state.gameStage !== GameStage.IN_PROGRESS)
    throw new Error('Game is not in progress');
  if (state.gameStep !== GameStep.PROCEED)
    throw new Error('Not the proceed step');
  if (state.currentPlayerId !== userId) throw new Error('Not your turn');

  const callerHand = state.hands[userId] ?? [];
  if (sumYanivHand(callerHand) > 7)
    throw new Error('Hand value is too high to call Yaniv');

  await yanivDiscard.pushDiscard(code, state.playedCards);

  const callerHandValue = sumYanivHand(callerHand);
  const isYanivCallBeaten = state.players.some(
    (player) =>
      player.id !== userId &&
      sumYanivHand(state.hands[player.id] ?? []) <= callerHandValue,
  );

  const scoredPlayers = state.players.map((player) => {
    const isYanivCalled = player.id === userId;
    const hand = state.hands[player.id] ?? [];
    const increment = isYanivCalled
      ? isYanivCallBeaten
        ? 25
        : 0
      : sumYanivHand(hand);
    const newScore = player.score + increment;

    let score = newScore;
    let isFiftyScoreHalved = player.isFiftyScoreHalved;
    let isHundredScoreHalved = player.isHundredScoreHalved;

    if (newScore === 50 && !player.isFiftyScoreHalved) {
      score = 25;
      isFiftyScoreHalved = true;
    } else if (newScore === 100 && !player.isHundredScoreHalved) {
      score = 50;
      isHundredScoreHalved = true;
    }

    return {
      ...player,
      score,
      isFiftyScoreHalved,
      isHundredScoreHalved,
      isYanivCalled,
    };
  });

  const isGameOver = scoredPlayers.some((player) => player.score > 200);

  const newState = isGameOver
    ? {
        gameStage: GameStage.FINISHED as const,
        players: scoredPlayers,
        winners: scoredPlayers
          .filter(
            (player) =>
              player.score === Math.min(...scoredPlayers.map((p) => p.score)),
          )
          .map((player) => player.id),
        hands: state.hands,
      }
    : {
        ...state,
        players: scoredPlayers,
        gameStep: GameStep.REDEAL,
        currentPlayerId: userId,
        playedCards: [] as typeof state.playedCards,
        drawnCard: undefined,
      };

  await setYanivState({ code }, newState);
  await publishYanivState(code, newState);
};
