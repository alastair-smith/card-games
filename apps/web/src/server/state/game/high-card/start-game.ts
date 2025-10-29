import { getHighCardState, setHighCardState } from '~/server/data/high-card';
import { getLobby } from '~/server/data/lobby';
import { publishHighCard } from '~/server/events/high-card';
import type { UserId } from '~/types/entities';
import type { GameCode } from '~/types/game';
import { GameStage, MIN_PLAYERS } from '~/types/games/high-card';

export const startGame = async (code: GameCode, userId: UserId) => {
  // 1. get current game from data layer
  const lobby = await getLobby({ code });

  if (!lobby) {
    throw new Error('Lobby not found');
  }

  // 2. check if userId is the host
  if (lobby.host !== userId) {
    throw new Error('Only the host can start the game');
  }

  // 3. check if there are enough players
  if (lobby.players.length < MIN_PLAYERS) {
    throw new Error('Not enough players to start the game');
  }

  const oldState = await getHighCardState({ code });

  if (!oldState) {
    throw new Error('Game state not found');
  }

  // 4. change game state to 'in-progress' in data layer
  const newState = {
    ...oldState,
    stage: GameStage.IN_PROGRESS,
    players: lobby.players.map((p) => ({
      id: p.id,
      name: p.name,
      card: null,
    })),
  };

  await setHighCardState({ code }, newState);

  // 5. publish event of updated state
  await publishHighCard(code, newState);

  return { stage: GameStage.IN_PROGRESS };
};
