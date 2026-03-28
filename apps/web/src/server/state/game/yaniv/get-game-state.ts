import { getYanivState } from '~/server/data/yaniv';
import type { UserId } from '~/types/entities';
import type { GameCode } from '~/types/game';
import type {
  GameStage,
  GameState,
  YanivPlayingCard,
} from '~/types/games/yaniv';

type Player = Extract<
  GameState,
  { gameStage: GameStage.IN_PROGRESS }
>['players'][number];

type ClientPlayer = Omit<Player, 'hand'> & { isUser: boolean };

export type ClientGameState = Omit<GameState, 'players'> & {
  hand: YanivPlayingCard[];
  players: ClientPlayer[];
};

type ActiveGameState = Extract<
  GameState,
  { gameStage: GameStage.IN_PROGRESS | GameStage.FINISHED }
>;

export const toClientGameState = (
  rawState: ActiveGameState,
  userId: UserId,
): ClientGameState => {
  const requestingPlayer = rawState.players.find(
    (player) => player.id === userId,
  );

  if (!requestingPlayer) {
    throw new Error('Player not in game');
  }

  const players = rawState.players.map(({ hand: _hand, ...player }) => ({
    ...player,
    isUser: player.id === userId,
  }));

  return { ...rawState, hand: requestingPlayer.hand, players };
};

export const getGameState = async (
  code: GameCode,
): Promise<GameState | null> => {
  return getYanivState({ code });
};
