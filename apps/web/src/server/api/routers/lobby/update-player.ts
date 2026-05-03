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
        playerName: playerNameSchema,
      }),
      z.object({
        code: gameCodeSchema,
        field: z.literal('isReady'),
        isReady: z.boolean(),
      }),
    ]),
  )
  .mutation(async ({ input, ctx: { userId } }) => {
    if (input.field === 'name') {
      await updatePlayerState({
        code: input.code,
        userId,
        field: 'name',
        value: input.playerName,
      });
    } else {
      await updatePlayerState({
        code: input.code,
        userId,
        field: 'isReady',
        value: input.isReady,
      });
    }
  });
