import { z } from 'zod';
import { protectedProcedure } from '~/server/api/trpc';
import { updatePlayerState } from '~/server/state/game/high-card/update-player-state';
import { playerNameSchema } from '~/types/entities';
import { gameCodeSchema } from '~/types/game';

export const updatePlayer = protectedProcedure
  .input(
    z.union([
      z.object({
        code: gameCodeSchema,
        field: z.literal('name'),
        value: playerNameSchema,
      }),
      z.object({
        code: gameCodeSchema,
        field: z.literal('isReady'),
        value: z.boolean(),
      }),
    ]),
  )
  .mutation(async ({ input, ctx: { userId } }) => {
    await updatePlayerState({ userId, ...input });
  });
