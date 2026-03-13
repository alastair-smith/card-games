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

export type ClientGameState = Omit<GameState, 'hands'> & {
  hand: YanivPlayingCard[];
  players: (Player & { isUser: boolean })[];
};

type ActiveGameState = Extract<
  GameState,
  { gameStage: GameStage.IN_PROGRESS | GameStage.FINISHED }
>;

export const toClientGameState = (
  rawState: ActiveGameState,
  userId: UserId,
): ClientGameState => {
  const { hands, ...rest } = rawState;
  const hand = hands[userId];

  if (hand === undefined) {
    throw new Error('Player not in game');
  }

  const players = rest.players.map((player) => ({
    ...player,
    isUser: player.id === userId,
  }));

  return { ...rest, hand, players };
};

export const getGameState = async (
  code: GameCode,
  userId: UserId,
): Promise<ClientGameState | null> => {
  const rawState = await getYanivState({ code });

  if (!rawState) return null;

  if (rawState.gameStage === GameStage.LOBBY) {
    return { gameStage: rawState.gameStage, hand: [], players: [] };
  }

  return toClientGameState(rawState, userId);
};
