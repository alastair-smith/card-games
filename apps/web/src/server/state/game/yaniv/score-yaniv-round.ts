import { setYanivState } from '~/server/data/yaniv';
import { publishYanivState } from '~/server/events/yaniv';
import type { GameCode } from '~/types/game';
import { GameStage, type GameState, GameStep } from '~/types/games/yaniv';
import { sumYanivHand } from '~/utils/cards';

type InProgressState = Extract<GameState, { gameStage: GameStage.IN_PROGRESS }>;

export const scoreYanivRound = async (
  code: GameCode,
  state: InProgressState,
) => {
  const yanivCaller = state.players.find((player) => player.isYanivCalled);
  if (!yanivCaller) throw new Error('Yaniv caller not found');

  const callerHandValue = sumYanivHand(state.hands[yanivCaller.id] ?? []);
  const isYanivCallBeaten = state.players.some(
    (player) =>
      player.id !== yanivCaller.id &&
      sumYanivHand(state.hands[player.id] ?? []) <= callerHandValue,
  );

  const scoredPlayers = state.players.map((player) => {
    const hand = state.hands[player.id] ?? [];
    const increment = player.isYanivCalled
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

    return { ...player, score, isFiftyScoreHalved, isHundredScoreHalved };
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
        currentPlayerId: yanivCaller.id,
        playedCards: [] as typeof state.playedCards,
        drawnCard: undefined,
      };

  await setYanivState({ code }, newState);
  await publishYanivState(code, newState);
};
