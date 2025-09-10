import { z } from 'zod';
import type { Player } from '~/server/data/high-card';
import type { UserId } from '~/types/entities';

export enum GameStage {
  LOBBY = 'LOBBY',
  IN_PROGRESS = 'IN_PROGRESS',
  FINISHED = 'FINISHED',
}

export const MIN_PLAYERS = 2;
export const MAX_PLAYERS = 10;

export const gameStageSchema = z.nativeEnum(GameStage);

export type GamePlayer = Player & {
  isUser: boolean;
};

export type GameState = {
  players: GamePlayer[];
  stage: GameStage;
  winner: UserId | null;
};
