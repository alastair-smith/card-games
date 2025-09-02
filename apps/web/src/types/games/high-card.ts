import { z } from 'zod';

export enum GameStage {
  LOBBY = 'LOBBY',
  IN_PROGRESS = 'IN_PROGRESS',
  FINISHED = 'FINISHED',
}

export const MIN_PLAYERS = 2;
export const MAX_PLAYERS = 10;

export const gameStageSchema = z.nativeEnum(GameStage);
