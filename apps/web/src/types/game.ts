import { z } from 'zod';
import type { Branded } from './brand';
import type { StandardPlayingCard } from './cards';
import type { PlayerName, UserId } from './entities';

export enum GameType {
  HIGH_CARD = 'HIGH_CARD',
  BLOB = 'BLOB',
  SHITHEAD = 'SHITHEAD',
  FOOL = 'FOOL',
  YANIV = 'YANIV',
}

export const gameTypeSchema = z.enum(GameType);

export const gameURL = {
  HIGH_CARD: '/high-card',
  BLOB: '/blob',
  SHITHEAD: '/shithead',
  FOOL: '/fool',
  YANIV: '/yaniv',
} as const satisfies Record<GameType, string>;

export const gameDisplayName = {
  HIGH_CARD: 'High Card',
  BLOB: 'Blob',
  SHITHEAD: 'Shithead',
  FOOL: 'Fool',
  YANIV: 'Yaniv',
} as const satisfies Record<GameType, string>;

export type GameCode = Branded<string, 'GameCode'>;

export const GAME_CODE_LENGTH = 6;

export const gameCodeSchema = z
  .string()
  .trim()
  .length(
    GAME_CODE_LENGTH,
    `Code should be ${GAME_CODE_LENGTH} characters long.`,
  )
  .toUpperCase()
  .regex(/^[A-NP-Z1-9]*$/, 'Code should only contain alphanumeric characters.')
  .transform((code: string) => code as GameCode);

export enum GameStatus {
  LOADING = 'LOADING',
  LOBBY = 'LOBBY',
  IN_PROGRESS = 'IN_PROGRESS',
  FINISHED = 'FINISHED',
}

export const gameStatusSchema = z.enum(GameStatus);

export enum GameUpdate {
  KICKED = 'KICKED',
  LEFT_GAME = 'LEFT_GAME',
  GAME_NOT_FOUND = 'GAME_NOT_FOUND',
  LOBBY_FULL = 'LOBBY_FULL',
  LOBBY_UPDATE = 'LOBBY_UPDATE',
  GAME_STATE_UPDATE = 'GAME_STATE_UPDATE',
  FINISHED = 'FINISHED',
}

export const gameUpdateSchema = z.enum(GameUpdate);

export type Player = {
  id: UserId;
  name: PlayerName;
  isReady: boolean;
  isUser: boolean;
  isHost: boolean;
};

export type HighCardGameState = {
  winnners: {
    name: PlayerName;
    isPlayer: boolean;
    card: StandardPlayingCard;
  }[];
  hands: {
    player: PlayerName;
    playerId: UserId;
    card: StandardPlayingCard | null;
    isUser: boolean;
  }[];
};
