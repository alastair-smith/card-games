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
  const yanivCallers = state.players.filter((player) => player.isYanivCalled);
  if (yanivCallers.length === 0) throw new Error('Yaniv caller not found');

  const minCallerScore = Math.min(
    ...yanivCallers.map((player) => player.score),
  );

  const scoredPlayers = state.players.map((player) => {
    const hand = state.hands[player.id];
    if (!hand) throw new Error(`Hand not found for player ${player.id}`);
    const increment = player.isYanivCalled
      ? player.score === minCallerScore
        ? 0
        : 25
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

  const scoredCallers = scoredPlayers.filter((player) => player.isYanivCalled);
  const minScoredCallerScore = Math.min(
    ...scoredCallers.map((player) => player.score),
  );
  const firstDealer = scoredCallers.find(
    (player) => player.score === minScoredCallerScore,
  );
  if (!firstDealer) throw new Error('No Yaniv caller found after scoring');

  const isGameOver = scoredPlayers.some((player) => player.score > 200);

  const newState = isGameOver
    ? {
        gameStage: GameStage.FINISHED as const,
        players: scoredPlayers,
        winners: scoredPlayers
          .filter(
            (player) =>
              player.score ===
              Math.min(...scoredPlayers.map((scored) => scored.score)),
          )
          .map((player) => player.id),
        hands: state.hands,
      }
    : {
        ...state,
        players: scoredPlayers,
        gameStep: GameStep.REDEAL,
        currentPlayerId: firstDealer.id,
        playedCards: [] as typeof state.playedCards,
        drawnCard: undefined,
      };

  await setYanivState({ code }, newState);
  await publishYanivState(code, newState);
};
