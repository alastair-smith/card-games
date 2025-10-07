import { z } from 'zod';
import { protectedProcedure } from '~/server/api/trpc';
import { pickupCard as pickupCardState } from '~/server/state/game/high-card/pickup-card';
import { gameCodeSchema } from '~/types/game';

export const pickupCard = protectedProcedure
  .input(
    z.object({
      code: gameCodeSchema,
    }),
  )
  .mutation(async ({ input, ctx: { userId } }) => {
    await pickupCardState(input.code, userId);
  });
