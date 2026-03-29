import { getYanivState } from '~/server/data/yaniv';
import type { UserId } from '~/types/entities';
import type { GameCode } from '~/types/game';
import {
  GameStage,
  type GameState,
  type YanivPlayingCard,
} from '~/types/games/yaniv';

type Player = Extract<
  GameState,
  { gameStage: GameStage.IN_PROGRESS }
>['players'][number];

type ClientPlayer = Omit<Player, 'hand'> & { isUser: boolean };

// Distributive omit: applied per union member so variant-specific fields (e.g.
// drawnCard on IN_PROGRESS) are preserved in the resulting union.
type DistributiveOmit<T, K extends keyof any> = T extends unknown
  ? Omit<T, K>
  : never;

export type ClientGameState = DistributiveOmit<GameState, 'players'> & {
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

  if (rawState.gameStage === GameStage.IN_PROGRESS) {
    const { drawnCard, ...rest } = rawState;
    const visibleDrawnCard =
      rawState.currentPlayerId === userId ? drawnCard : undefined;
    return {
      ...rest,
      drawnCard: visibleDrawnCard,
      hand: requestingPlayer.hand,
      players,
    };
  }

  return { ...rawState, hand: requestingPlayer.hand, players };
};

export const getGameState = async (
  code: GameCode,
): Promise<GameState | null> => {
  return getYanivState({ code });
};
