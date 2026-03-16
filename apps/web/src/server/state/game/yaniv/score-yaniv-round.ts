import { setYanivState } from '~/server/data/yaniv';
import { publishYanivState } from '~/server/events/yaniv';
import type { GameCode } from '~/types/game';
import {
  GAME_OVER_SCORE,
  GameStage,
  type GameState,
  GameStep,
  YANIV_CALLER_PENALTY,
} from '~/types/games/yaniv';
import { sumYanivHand } from '~/utils/cards';

type InProgressState = Extract<GameState, { gameStage: GameStage.IN_PROGRESS }>;

type Player = InProgressState['players'][number];

const applyScoreHalving = (
  newScore: number,
  player: Player,
): Pick<Player, 'score' | 'isFiftyScoreHalved' | 'isHundredScoreHalved'> => {
  if (newScore === 50 && !player.isFiftyScoreHalved) {
    return {
      score: 25,
      isFiftyScoreHalved: true,
      isHundredScoreHalved: player.isHundredScoreHalved,
    };
  }
  if (newScore === 100 && !player.isHundredScoreHalved) {
    return {
      score: 50,
      isFiftyScoreHalved: player.isFiftyScoreHalved,
      isHundredScoreHalved: true,
    };
  }
  return {
    score: newScore,
    isFiftyScoreHalved: player.isFiftyScoreHalved,
    isHundredScoreHalved: player.isHundredScoreHalved,
  };
};

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
        : YANIV_CALLER_PENALTY
      : sumYanivHand(hand);
    const newScore = player.score + increment;

    return {
      ...player,
      ...applyScoreHalving(newScore, player),
      roundScore: increment,
    };
  });

  const scoredCallers = scoredPlayers.filter((player) => player.isYanivCalled);
  const minScoredCallerScore = Math.min(
    ...scoredCallers.map((player) => player.score),
  );
  const firstDealer = scoredCallers.find(
    (player) => player.score === minScoredCallerScore,
  );
  if (!firstDealer) throw new Error('No Yaniv caller found after scoring');

  const isGameOver = scoredPlayers.some(
    (player) => player.score > GAME_OVER_SCORE,
  );

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
        playedCards: [],
        drawnCard: undefined,
      };

  await setYanivState({ code }, newState);
  await publishYanivState(code, newState);
};
