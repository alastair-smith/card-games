import { z } from 'zod';
import type { Player } from '~/server/data/high-card';
import { playerNameSchema, userIdSchema } from '~/types/entities';
import { standardPlayingCardSchema } from '../cards';

export const MIN_PLAYERS = 2;
export const MAX_PLAYERS = 10;

export enum GameStage {
  LOBBY = 'LOBBY',
  IN_PROGRESS = 'IN_PROGRESS',
  FINISHED = 'FINISHED',
}

export const gameStageSchema = z.nativeEnum(GameStage);

export type GamePlayer = Player & {
  isUser: boolean;
};

export const gameStateSchema = z.object({
  players: z.array(
    z.object({
      id: userIdSchema,
      name: playerNameSchema,
      card: standardPlayingCardSchema.nullable(),
      isUser: z.boolean(),
    }),
  ),
  stage: gameStageSchema,
  winners: z.array(userIdSchema),
});

export type GameState = z.infer<typeof gameStateSchema>;
