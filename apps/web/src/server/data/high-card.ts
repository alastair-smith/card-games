import { type GameCode } from '@/types/game';
import { z } from 'zod';
import { dataLayer } from '@/server/data/redis';
import { playerNameSchema, UserId, userIdSchema } from '@/types/entities';
import { standardPlayingCardSchema } from '@/types/cards';

export type StoredGameState = {
  players: Player[],
  winner: UserId | null,
};

const playerSchema = z.object({
  id: userIdSchema,
  name: playerNameSchema,
  card: standardPlayingCardSchema.nullable(),
});

export type Player = z.infer<typeof playerSchema>;

export const gameStateSchema = z.object({
  players: z.array(playerSchema),
  winner: userIdSchema.nullable()
})

export const { get: getHighCardState, set: setHighCardState, exists: highCardStateExists } = dataLayer(
  ({ code }: { code: GameCode }) => `high-card:${code}`,
  gameStateSchema,
);