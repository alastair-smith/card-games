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
import { sumYanivHand } from '~/utils/yaniv';

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
  const playersWithHandValues = state.players.map((player) => ({
    player,
    handValue: sumYanivHand(player.hand),
  }));

  const callers = playersWithHandValues.filter(
    ({ player }) => player.isYanivCalled,
  );
  if (callers.length === 0) throw new Error('Yaniv caller not found');

  const minCallerHandValue = Math.min(
    ...callers.map(({ handValue }) => handValue),
  );

  const scoredPlayers = playersWithHandValues.map(({ player, handValue }) => {
    const adjusted = player.isYanivCalled
      ? handValue === minCallerHandValue
        ? 0
        : YANIV_CALLER_PENALTY
      : handValue;
    const newScore = player.score + adjusted;

    return {
      ...player,
      ...applyScoreHalving(newScore, player),
      roundScore: { original: handValue, adjusted },
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
