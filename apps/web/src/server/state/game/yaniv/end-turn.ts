import { yanivDiscard } from '~/server/data/discard';
import { getYanivState, setYanivState } from '~/server/data/yaniv';
import { publishYanivState } from '~/server/events/yaniv';
import type { UserId } from '~/types/entities';
import type { GameCode } from '~/types/game';
import { GameStage, GameStep } from '~/types/games/yaniv';
import { sumYanivHand } from '~/utils/cards';

export const endTurn = async (code: GameCode, userId: UserId) => {
  const state = await getYanivState({ code });
  if (!state) throw new Error('Game not found');

  if (state.gameStage !== GameStage.IN_PROGRESS)
    throw new Error('Game is not in progress');
  if (state.gameStep !== GameStep.PROCEED)
    throw new Error('Not the proceed step');
  if (state.currentPlayerId !== userId) throw new Error('Not your turn');

  const currentIndex = state.players.findIndex(({ id }) => id === userId);
  const nextIndex = (currentIndex + 1) % state.players.length;
  const nextPlayer = state.players[nextIndex];
  const nextPlayerId = nextPlayer?.id;

  if (!nextPlayerId) throw new Error('Next player not found');

  await yanivDiscard.pushDiscard(code, state.playedCards);

  if (nextPlayer.isYanivCalled) {
    const yanivCaller = nextPlayer;
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
  } else {
    const newState = {
      ...state,
      playedCards: [],
      drawnCard: undefined,
      currentPlayerId: nextPlayerId,
      gameStep: GameStep.PLAY_CARDS,
    };

    await setYanivState({ code }, newState);
    await publishYanivState(code, newState);
  }
};
