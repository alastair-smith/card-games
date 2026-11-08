import { SpanStatusCode, trace } from '@opentelemetry/api';
import { setYanivState } from '~/server/data/yaniv';
import { publishYanivState } from '~/server/events/yaniv';
import type { GameCode } from '~/types/game';
import {
  GAME_OVER_SCORE,
  GameStage,
  type GameState,
  GameStep,
  WINNER_CHOOSES_HAND_SIZE,
  YANIV_CALLER_PENALTY,
} from '~/types/games/yaniv';
import { sumYanivHand } from '~/utils/yaniv';
import { getPlayerAfter } from './get-player-after';

const tracer = trace.getTracer('card-games');

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
  await tracer.startActiveSpan('yaniv.score-round', async (span) => {
    try {
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

      const scoredPlayers = playersWithHandValues.map(
        ({ player, handValue }) => {
          const adjusted = player.isYanivCalled
            ? handValue === minCallerHandValue
              ? 0
              : YANIV_CALLER_PENALTY
            : handValue;
          const newScore = player.score + adjusted;
          const halvedScore = applyScoreHalving(newScore, player);

          return {
            ...player,
            ...halvedScore,
            roundScores: [
              ...player.roundScores,
              {
                original: handValue,
                adjusted,
                halvedBy: newScore - halvedScore.score,
              },
            ],
          };
        },
      );

      // Every caller with the lowest hand scores 0, but the first of them to
      // call wins the hand
      const handWinnerId = state.yanivCallerIds.find((callerId) =>
        callers.some(
          ({ player, handValue }) =>
            player.id === callerId && handValue === minCallerHandValue,
        ),
      );
      const handWinner = scoredPlayers.find(
        (player) => player.id === handWinnerId,
      );
      if (!handWinner) throw new Error('No hand winner found after scoring');

      const nextDealerId =
        state.settings.dealer === 'hand-winner'
          ? handWinner.id
          : getPlayerAfter(state.players, state.dealerId).id;

      const isHandSizeChosenByWinner =
        state.settings.handSize === WINNER_CHOOSES_HAND_SIZE;

      const isGameOver = scoredPlayers.some(
        (player) => player.score > GAME_OVER_SCORE,
      );
      span.setAttribute('yaniv.game_over', isGameOver);

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
            dealerId: nextDealerId,
            ...(isHandSizeChosenByWinner
              ? {
                  gameStep: GameStep.CHOOSE_HAND_SIZE,
                  currentPlayerId: handWinner.id,
                }
              : { gameStep: GameStep.REDEAL, currentPlayerId: nextDealerId }),
            playedCards: [],
            drawnCard: undefined,
            drawnFrom: null,
          };

      await setYanivState({ code }, newState);
      await publishYanivState(code, newState);
    } catch (error) {
      span.setStatus({ code: SpanStatusCode.ERROR });
      if (error instanceof Error) span.recordException(error);
      throw error;
    } finally {
      span.end();
    }
  });
};
