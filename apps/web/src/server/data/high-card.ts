import { z } from 'zod';
import { dataLayer } from '~/server/data/redis';
import { standardPlayingCardSchema } from '~/types/cards';
import { playerNameSchema, userIdSchema } from '~/types/entities';
import type { GameCode } from '~/types/game';
import { gameStageSchema } from '~/types/games/high-card';

const playerSchema = z.object({
  id: userIdSchema,
  name: playerNameSchema,
  card: standardPlayingCardSchema.nullable(),
});

export type Player = z.infer<typeof playerSchema>;

export const gameStateSchema = z.object({
  players: z.array(playerSchema),
  stage: gameStageSchema,
  winners: z.array(userIdSchema),
});

export type GameState = z.infer<typeof gameStateSchema>;

export const {
  get: getHighCardState,
  set: setHighCardState,
  exists: highCardStateExists,
} = dataLayer(
  ({ code }: { code: GameCode }) => `high-card:${code}`,
  gameStateSchema,
);
